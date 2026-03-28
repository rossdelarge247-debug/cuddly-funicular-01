// ============================================================
// audio.js - Web Audio API sound effects & BGM for Maddie Academy
// ============================================================

var Audio = {
    ctx: null,
    masterGain: null,
    bgmInterval: null,
    bgmOscillators: [],
    initialized: false,

    init: function() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.4;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch(e) {}
    },

    _ensureCtx: function() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        return this.initialized;
    },

    // Quick sine beep helper
    _beep: function(freq, duration, vol, type) {
        if (!this._ensureCtx()) return;
        var o = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        o.type = type || 'sine';
        o.frequency.value = freq;
        g.gain.value = vol || 0.15;
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        o.connect(g);
        g.connect(this.masterGain);
        o.start(this.ctx.currentTime);
        o.stop(this.ctx.currentTime + duration);
    },

    // Frequency sweep helper
    _sweep: function(startFreq, endFreq, duration, vol, type) {
        if (!this._ensureCtx()) return;
        var o = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        o.type = type || 'sine';
        o.frequency.value = startFreq;
        o.frequency.linearRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        g.gain.value = vol || 0.12;
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        o.connect(g);
        g.connect(this.masterGain);
        o.start(this.ctx.currentTime);
        o.stop(this.ctx.currentTime + duration + 0.01);
    },

    playJump: function() {
        this._sweep(300, 600, 0.1, 0.1, 'sine');
    },

    playDoubleJump: function() {
        this._sweep(400, 800, 0.12, 0.1, 'sine');
        var self = this;
        setTimeout(function() { self._beep(900, 0.08, 0.06, 'sine'); }, 60);
    },

    playCollectStar: function() {
        this._beep(800, 0.12, 0.12, 'sine');
        var self = this;
        setTimeout(function() { self._beep(1200, 0.1, 0.08, 'sine'); }, 50);
    },

    playCollectNote: function() {
        // Major chord
        this._beep(523, 0.25, 0.08, 'sine');  // C
        this._beep(659, 0.25, 0.06, 'sine');  // E
        this._beep(784, 0.25, 0.06, 'sine');  // G
    },

    playCollectHeart: function() {
        var self = this;
        this._beep(440, 0.15, 0.1, 'sine');
        setTimeout(function() { self._beep(554, 0.15, 0.1, 'sine'); }, 80);
        setTimeout(function() { self._beep(659, 0.2, 0.1, 'sine'); }, 160);
    },

    playCollectToken: function() {
        if (!this._ensureCtx()) return;
        // Magical sweep with shimmer
        this._sweep(300, 1200, 0.4, 0.12, 'sine');
        this._sweep(450, 900, 0.35, 0.06, 'triangle');
        var self = this;
        setTimeout(function() { self._beep(1200, 0.3, 0.08, 'sine'); }, 200);
        setTimeout(function() { self._beep(1400, 0.2, 0.06, 'sine'); }, 350);
    },

    playEnemyBounce: function() {
        this._sweep(400, 200, 0.15, 0.12, 'square');
    },

    playDancePower: function() {
        if (!this._ensureCtx()) return;
        this._sweep(200, 800, 0.3, 0.1, 'sawtooth');
        var self = this;
        setTimeout(function() { self._beep(800, 0.15, 0.08, 'sine'); }, 100);
        setTimeout(function() { self._beep(1000, 0.15, 0.08, 'sine'); }, 200);
        setTimeout(function() { self._beep(1200, 0.2, 0.1, 'sine'); }, 300);
    },

    playHurt: function() {
        this._sweep(500, 200, 0.25, 0.1, 'square');
        var self = this;
        setTimeout(function() { self._sweep(300, 150, 0.2, 0.06, 'sine'); }, 100);
    },

    playLevelComplete: function() {
        if (!this._ensureCtx()) return;
        var self = this;
        var notes = [523, 587, 659, 784, 880, 1047];
        notes.forEach(function(freq, i) {
            setTimeout(function() {
                self._beep(freq, 0.25, 0.1, 'sine');
                self._beep(freq * 0.5, 0.25, 0.05, 'triangle');
            }, i * 100);
        });
    },

    playGameOver: function() {
        var self = this;
        var notes = [440, 392, 349, 330];
        notes.forEach(function(freq, i) {
            setTimeout(function() { self._beep(freq, 0.3, 0.08, 'sine'); }, i * 150);
        });
    },

    playMenuSelect: function() {
        this._beep(600, 0.08, 0.1, 'sine');
        var self = this;
        setTimeout(function() { self._beep(800, 0.06, 0.08, 'sine'); }, 40);
    },

    // ----- Background Music -----
    startBGM: function(level) {
        this.stopBGM();
        if (!this._ensureCtx()) return;

        var self = this;
        var bpm = [130, 145, 160][level] || 130;
        var beatMs = 60000 / bpm / 2; // eighth note

        // Note sequences per level (MIDI-ish numbers -> frequencies)
        var noteToFreq = function(n) { return 440 * Math.pow(2, (n - 69) / 12); };

        var bassPattern, melodyPattern, chordPattern;

        if (level === 0) {
            // Bubbly, playful - C major
            bassPattern = [48, 48, 55, 55, 52, 52, 55, 55, 48, 48, 53, 53, 52, 52, 55, 55];
            melodyPattern = [72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 72, 0, 74, 76, 74, 0];
            chordPattern = [
                [60,64,67], null, null, null, [60,64,67], null, null, null,
                [57,60,64], null, null, null, [55,59,62], null, null, null
            ];
        } else if (level === 1) {
            // Energetic, bold - D major
            bassPattern = [50, 50, 57, 57, 54, 54, 57, 57, 50, 50, 55, 55, 54, 54, 57, 50];
            melodyPattern = [74, 0, 78, 0, 81, 78, 74, 0, 76, 0, 74, 0, 76, 78, 81, 0];
            chordPattern = [
                [62,66,69], null, null, null, [62,66,69], null, null, null,
                [59,62,66], null, null, null, [57,61,64], null, null, null
            ];
        } else {
            // Exciting, dramatic - E major
            bassPattern = [52, 52, 59, 59, 56, 56, 59, 52, 52, 52, 57, 57, 56, 56, 59, 59];
            melodyPattern = [76, 0, 80, 0, 83, 80, 76, 83, 80, 0, 76, 0, 78, 80, 83, 0];
            chordPattern = [
                [64,68,71], null, null, null, [64,68,71], null, null, null,
                [61,64,68], null, null, null, [59,63,66], null, [64,68,71], null
            ];
        }

        var step = 0;
        var patLen = bassPattern.length;

        this.bgmInterval = setInterval(function() {
            if (!self.initialized || !self.ctx) return;
            var i = step % patLen;

            // Bass
            if (bassPattern[i]) {
                self._beep(noteToFreq(bassPattern[i]), beatMs / 1000 * 0.8, 0.06, 'triangle');
            }

            // Melody
            if (melodyPattern[i]) {
                self._beep(noteToFreq(melodyPattern[i]), beatMs / 1000 * 0.7, 0.04, 'square');
            }

            // Chords
            if (chordPattern[i]) {
                chordPattern[i].forEach(function(n) {
                    self._beep(noteToFreq(n), beatMs / 1000 * 1.5, 0.02, 'sine');
                });
            }

            step++;
        }, beatMs);
    },

    stopBGM: function() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    },

    setVolume: function(v) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, v));
        }
    }
};
