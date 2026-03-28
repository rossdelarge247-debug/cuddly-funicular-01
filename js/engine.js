// ============================================================
// engine_player.js - 2D Platformer Game Engine & Player (Maddie)
// ============================================================
// Provides: Game (global), Player (global), rectsOverlap(),
//           keyboard handling, camera, particles, collision.
// Expects:  canvas, ctx (global), LevelData.load(n) from level module.
// ============================================================

"use strict";

// ----- AABB Collision Helper -----

function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// =================================================================
//  GAME OBJECT
// =================================================================

var Game = {
    // --- State ---
    state: 'menu',          // 'menu','playing','paused','levelComplete','gameOver','victory'
    level: 0,
    score: 0,
    lives: 3,
    camera: { x: 0, y: 0 },
    keys: {},

    // --- Entity arrays (populated by level loader) ---
    particles: [],
    collectibles: [],
    enemies: [],
    platforms: [],

    // --- Special / dance power ---
    specialReady: true,
    specialCooldown: 0,

    // --- Progression ---
    starsCollected: 0,
    musicTokens: [false, false, false],   // one per level
    unlockedPowers: ['Star Spin'],

    // --- Frame / level info ---
    frameCount: 0,
    levelWidth: 3000,
    portalX: 2800,

    // ---------------------------------------------------------------
    //  init  - reset everything to defaults
    // ---------------------------------------------------------------
    init: function () {
        this.state = 'menu';
        this.level = 0;
        this.score = 0;
        this.lives = 3;
        this.camera = { x: 0, y: 0 };
        this.particles = [];
        this.collectibles = [];
        this.enemies = [];
        this.platforms = [];
        this.specialReady = true;
        this.specialCooldown = 0;
        this.starsCollected = 0;
        this.musicTokens = [false, false, false];
        this.unlockedPowers = ['Star Spin'];
        this.frameCount = 0;
        this.levelWidth = 3000;
        this.portalX = 2800;
        Player.reset(100, 400);
    },

    // ---------------------------------------------------------------
    //  startLevel  - load level n and prepare play
    // ---------------------------------------------------------------
    startLevel: function (n) {
        this.level = n;
        this.particles = [];
        this.camera = { x: 0, y: 0 };
        this.specialReady = true;
        this.specialCooldown = 0;

        // Delegate to level data loader if available
        if (typeof LevelData !== 'undefined' && LevelData.load) {
            LevelData.load(n);
        } else {
            // Fallback: build a simple default level
            this._buildDefaultLevel();
        }

        Player.reset(100, 400);
        this.state = 'playing';
    },

    // Minimal fallback level when LevelData is not loaded yet
    _buildDefaultLevel: function () {
        this.platforms = [
            { x: 0, y: 500, width: 960, height: 40 },
            { x: 300, y: 400, width: 120, height: 20 },
            { x: 600, y: 320, width: 120, height: 20 }
        ];
        this.collectibles = [];
        this.enemies = [];
        this.levelWidth = 3000;
        this.portalX = 2800;
    },

    // ---------------------------------------------------------------
    //  update  - master update tick (dt in seconds, but we mostly
    //            run at fixed 60fps so dt ~ 0.0167)
    // ---------------------------------------------------------------
    update: function (dt) {
        this.frameCount++;

        if (this.state !== 'playing') return;

        // Special cooldown
        if (this.specialCooldown > 0) {
            this.specialCooldown -= dt;
            if (this.specialCooldown <= 0) {
                this.specialCooldown = 0;
                this.specialReady = true;
            }
        }

        // Update platforms (moving & breakable)
        for (var i = this.platforms.length - 1; i >= 0; i--) {
            var p = this.platforms[i];
            if (p.type === 'moving') {
                p.movePhase += p.moveSpeed * 0.02;
                if (p.moveAxis === 'x') {
                    var mid = (p.moveMin + p.moveMax) / 2;
                    var range = (p.moveMax - p.moveMin) / 2;
                    p.x = mid + Math.sin(p.movePhase) * range;
                } else {
                    var mid = (p.moveMin + p.moveMax) / 2;
                    var range = (p.moveMax - p.moveMin) / 2;
                    p.y = mid + Math.sin(p.movePhase) * range;
                }
            }
            if (p.type === 'breakable' && p.breakTimer > 0) {
                p.breakTimer -= dt;
                if (p.breakTimer <= 0) {
                    p.broken = true;
                    this.addParticles(p.x + p.width / 2, p.y + p.height / 2, 8, p.color || '#FF6347', 3);
                    this.platforms.splice(i, 1);
                }
            }
        }

        // Update player
        Player.update(dt);

        // Update enemies
        for (var i = 0; i < this.enemies.length; i++) {
            var e = this.enemies[i];
            if (e.alive !== false && e.update) {
                e.update(dt);
            }
        }

        // Collisions
        this.checkCollisions();

        // Update particles
        this.updateParticles(dt);

        // Camera follow
        this.updateCamera();
    },

    // ---------------------------------------------------------------
    //  checkCollisions
    // ---------------------------------------------------------------
    checkCollisions: function () {
        var p = Player;

        // --- Player vs platforms (vertical & horizontal) ---
        p.onGround = false;
        for (var i = 0; i < this.platforms.length; i++) {
            var plat = this.platforms[i];
            if (rectsOverlap(p, plat)) {
                // Determine overlap on each side
                var overlapLeft   = (p.x + p.width) - plat.x;
                var overlapRight  = (plat.x + plat.width) - p.x;
                var overlapTop    = (p.y + p.height) - plat.y;
                var overlapBottom = (plat.y + plat.height) - p.y;

                // Find the minimum overlap to resolve
                var minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop && p.vy >= 0) {
                    // Landing on top
                    p.y = plat.y - p.height;
                    p.vy = 0;
                    p.onGround = true;
                    p.doubleJumpAvail = true;
                    // Trigger breakable platforms
                    if (plat.type === 'breakable' && plat.breakTimer <= 0) {
                        plat.breakTimer = 0.5; // breaks after 0.5s
                    }
                } else if (minOverlap === overlapBottom && p.vy < 0) {
                    // Hitting head on bottom of platform
                    p.y = plat.y + plat.height;
                    p.vy = 0;
                } else if (minOverlap === overlapLeft) {
                    // Hitting right side of player on left side of platform
                    p.x = plat.x - p.width;
                    p.vx = 0;
                } else if (minOverlap === overlapRight) {
                    // Hitting left side of player on right side of platform
                    p.x = plat.x + plat.width;
                    p.vx = 0;
                }
            }
        }

        // Fell off the bottom - take damage and respawn
        if (p.y > canvas.height + 50) {
            Player.takeDamage();
            if (Game.state === 'playing') {
                // Respawn at start of level
                p.x = 100;
                p.y = 300;
                p.vy = 0;
                p.vx = 0;
                Game.camera.x = 0;
            }
        }

        // Left / right level bounds
        if (p.x < 0) p.x = 0;
        if (p.x + p.width > this.levelWidth) p.x = this.levelWidth - p.width;

        // --- Player vs collectibles ---
        for (var i = this.collectibles.length - 1; i >= 0; i--) {
            var c = this.collectibles[i];
            if (c.collected) continue;
            if (rectsOverlap(p, c)) {
                c.collected = true;
                this.score += (c.value || 100);
                if (c.type === 'star') {
                    this.starsCollected++;
                    this.addParticles(c.x + c.width / 2, c.y + c.height / 2, 12, '#FFD700', 4);
                } else if (c.type === 'heart') {
                    this.lives = Math.min(this.lives + 1, 5);
                    this.addParticles(c.x + c.width / 2, c.y + c.height / 2, 15, '#FF4444', 4);
                } else if (c.type === 'musicToken') {
                    this.musicTokens[this.level] = true;
                    this.addParticles(c.x + c.width / 2, c.y + c.height / 2, 20, '#FF69B4', 5);
                } else {
                    this.addParticles(c.x + c.width / 2, c.y + c.height / 2, 8, c.color || '#44FF44', 3);
                }
            }
        }

        // --- Player vs enemies ---
        if (!p.invincible) {
            for (var i = 0; i < this.enemies.length; i++) {
                var e = this.enemies[i];
                if (e.alive === false) continue;
                if (rectsOverlap(p, e)) {
                    // Stomp from above?
                    if (p.vy > 0 && p.y + p.height - e.y < 16) {
                        // Stomp kill
                        e.alive = false;
                        p.vy = -8; // bounce
                        this.score += (e.points || 200);
                        this.addParticles(e.x + e.width / 2, e.y + e.height / 2, 10, '#FF4444', 4);
                    } else {
                        // Player takes damage
                        Player.takeDamage();
                    }
                }
            }
        }

        // --- Player vs portal (end of level) ---
        var portal = { x: this.portalX, y: canvas.height - 100, width: 40, height: 60 };
        if (rectsOverlap(p, portal)) {
            var powers = ['Star Spin', 'Glitter Burst', 'Encore Dash'];
            if (this.level < 2) {
                this.state = 'levelComplete';
                Player.state = 'victory';
                // Unlock next dance power
                var nextPower = powers[this.level + 1];
                if (nextPower && this.unlockedPowers.indexOf(nextPower) === -1) {
                    this.unlockedPowers.push(nextPower);
                }
                this.addParticles(p.x + p.width / 2, p.y + p.height / 2, 30, '#FFD700', 6);
            } else {
                this.state = 'victory';
                Player.state = 'victory';
                if (this.unlockedPowers.indexOf('Encore Dash') === -1) {
                    this.unlockedPowers.push('Encore Dash');
                }
                this.addParticles(p.x + p.width / 2, p.y + p.height / 2, 50, '#FF69B4', 8);
            }
        }
    },

    // ---------------------------------------------------------------
    //  Camera
    // ---------------------------------------------------------------
    updateCamera: function () {
        var targetX = Player.x - canvas.width / 2 + Player.width / 2;
        // Smooth lerp
        this.camera.x += (targetX - this.camera.x) * 0.1;
        // Clamp
        if (this.camera.x < 0) this.camera.x = 0;
        var maxCamX = this.levelWidth - canvas.width;
        if (maxCamX < 0) maxCamX = 0;
        if (this.camera.x > maxCamX) this.camera.x = maxCamX;
        // No vertical scrolling for now
        this.camera.y = 0;
    },

    // ---------------------------------------------------------------
    //  Particles
    // ---------------------------------------------------------------
    addParticles: function (x, y, count, color, spread) {
        spread = spread || 3;
        for (var i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * spread * 2,
                vy: (Math.random() - 0.5) * spread * 2 - 2,
                life: 1.0,
                maxLife: 1.0,
                color: color || '#FFFFFF',
                size: 2 + Math.random() * 3
            });
        }
    },

    updateParticles: function (dt) {
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var pt = this.particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.vy += 0.05;            // slight gravity on particles
            pt.life -= dt * 1.5;
            pt.size *= 0.99;
            if (pt.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },

    drawParticles: function (ctx, cam) {
        for (var i = 0; i < this.particles.length; i++) {
            var pt = this.particles[i];
            var alpha = Math.max(0, pt.life / pt.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x - cam.x, pt.y - cam.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
};

// =================================================================
//  PLAYER OBJECT  (Maddie)
// =================================================================

var Player = {
    x: 100,
    y: 400,
    vx: 0,
    vy: 0,
    width: 32,
    height: 48,
    onGround: false,
    facing: 1,            // 1 = right, -1 = left
    state: 'idle',        // idle, run, jump, fall, dance, hurt, victory
    animFrame: 0,
    animTimer: 0,
    invincible: false,
    invincibleTimer: 0,
    doubleJumpAvail: true,

    // Constants
    GRAVITY: 0.6,
    MAX_FALL: 12,
    SPEED: 5,
    JUMP_VEL: -12,
    DOUBLE_JUMP_VEL: -10,

    // ---------------------------------------------------------------
    //  reset
    // ---------------------------------------------------------------
    reset: function (x, y) {
        this.x = x || 100;
        this.y = y || 400;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.facing = 1;
        this.state = 'idle';
        this.animFrame = 0;
        this.animTimer = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.doubleJumpAvail = true;
    },

    // ---------------------------------------------------------------
    //  update
    // ---------------------------------------------------------------
    update: function (dt) {
        // --- Invincibility timer ---
        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.invincibleTimer = 0;
            }
        }

        // --- Hurt state locks input briefly ---
        if (this.state === 'hurt') {
            this.animTimer -= dt;
            if (this.animTimer <= 0) {
                this.state = 'idle';
            }
        }

        // --- Dance / victory: no movement ---
        if (this.state === 'dance' || this.state === 'victory') {
            this.animTimer -= dt;
            if (this.state === 'dance' && this.animTimer <= 0) {
                this.state = 'idle';
            }
            // Still apply gravity during dance
            this.vy += this.GRAVITY;
            if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;
            this.y += this.vy;
            this._animate(dt);
            return;
        }

        // --- Horizontal input ---
        var moveDir = 0;
        if (this.state !== 'hurt') {
            if (Game.keys['ArrowLeft'] || Game.keys['a']) moveDir = -1;
            if (Game.keys['ArrowRight'] || Game.keys['d']) moveDir = 1;
        }

        this.vx = moveDir * this.SPEED;
        if (moveDir !== 0) this.facing = moveDir;

        // --- Apply gravity ---
        this.vy += this.GRAVITY;
        if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;

        // --- Move ---
        this.x += this.vx;
        this.y += this.vy;

        // --- Determine visual state ---
        if (this.state !== 'hurt') {
            if (!this.onGround) {
                this.state = this.vy < 0 ? 'jump' : 'fall';
            } else if (Math.abs(this.vx) > 0.1) {
                this.state = 'run';
            } else {
                this.state = 'idle';
            }
        }

        this._animate(dt);
    },

    _animate: function (dt) {
        this.animTimer += dt;
        if (this.animTimer > 0.12) {
            this.animTimer -= 0.12;
            this.animFrame++;
        }
    },

    // ---------------------------------------------------------------
    //  jump
    // ---------------------------------------------------------------
    jump: function () {
        if (this.state === 'hurt' || this.state === 'dance') return;
        if (this.onGround) {
            this.vy = this.JUMP_VEL;
            this.onGround = false;
            this.state = 'jump';
            Game.addParticles(this.x + this.width / 2, this.y + this.height, 5, '#FFFFFF', 2);
        } else if (this.doubleJumpAvail) {
            this.vy = this.DOUBLE_JUMP_VEL;
            this.doubleJumpAvail = false;
            this.state = 'jump';
            Game.addParticles(this.x + this.width / 2, this.y + this.height / 2, 8, '#DDA0DD', 3);
        }
    },

    // ---------------------------------------------------------------
    //  activateSpecial - Star Spin dance power
    // ---------------------------------------------------------------
    activateSpecial: function () {
        if (!Game.specialReady) return;
        Game.specialReady = false;
        Game.specialCooldown = 3; // 3 second cooldown

        this.state = 'dance';
        this.animTimer = 0.8; // dance lasts 0.8s
        this.invincible = true;
        this.invincibleTimer = 1.0;

        // Burst of star particles
        Game.addParticles(this.x + this.width / 2, this.y + this.height / 2, 25, '#FFD700', 6);
        Game.addParticles(this.x + this.width / 2, this.y + this.height / 2, 15, '#FF69B4', 5);

        // Damage nearby enemies
        var cx = this.x + this.width / 2;
        var cy = this.y + this.height / 2;
        var radius = 80;
        for (var i = 0; i < Game.enemies.length; i++) {
            var e = Game.enemies[i];
            if (e.alive === false) continue;
            var ex = e.x + e.width / 2;
            var ey = e.y + e.height / 2;
            var dist = Math.sqrt((cx - ex) * (cx - ex) + (cy - ey) * (cy - ey));
            if (dist < radius) {
                e.alive = false;
                Game.score += (e.points || 200);
                Game.addParticles(ex, ey, 12, '#FF4444', 4);
            }
        }
    },

    // ---------------------------------------------------------------
    //  takeDamage
    // ---------------------------------------------------------------
    takeDamage: function () {
        if (this.invincible) return;
        Game.lives--;
        this.invincible = true;
        this.invincibleTimer = 2.0;
        this.state = 'hurt';
        this.animTimer = 0.4;
        // Knockback
        this.vy = -6;
        this.vx = -this.facing * 4;

        Game.addParticles(this.x + this.width / 2, this.y + this.height / 2, 10, '#FF0000', 3);

        if (Game.lives <= 0) {
            Game.state = 'gameOver';
        }
    },

    // ---------------------------------------------------------------
    //  draw - Maddie as a cute cartoon pop-star character
    // ---------------------------------------------------------------
    draw: function (ctx, cam) {
        // If invincible, blink every few frames
        if (this.invincible && Math.floor(Game.frameCount / 3) % 2 === 0) {
            return; // skip draw for blink effect
        }

        var sx = this.x - cam.x;   // screen x
        var sy = this.y - cam.y;   // screen y
        var f = this.facing;        // -1 left, 1 right
        var frame = this.animFrame;

        ctx.save();

        // Flip for facing direction: translate to center then scale
        if (f === -1) {
            ctx.translate(sx + this.width / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.width / 2, 0);
            sx = 0;
        }

        // --- Animation offsets ---
        var bounce = 0;
        var legOffset = 0;
        var armAngle = 0;
        var headTilt = 0;

        switch (this.state) {
            case 'idle':
                bounce = Math.sin(Game.frameCount * 0.08) * 2;
                break;
            case 'run':
                bounce = Math.sin(Game.frameCount * 0.3) * 2;
                legOffset = Math.sin(Game.frameCount * 0.3) * 6;
                armAngle = Math.sin(Game.frameCount * 0.3) * 0.4;
                break;
            case 'jump':
                bounce = -3;
                armAngle = -0.6;
                break;
            case 'fall':
                bounce = 2;
                armAngle = 0.3;
                break;
            case 'dance':
                bounce = Math.sin(Game.frameCount * 0.2) * 4;
                armAngle = Math.sin(Game.frameCount * 0.15) * 1.0;
                headTilt = Math.sin(Game.frameCount * 0.2) * 0.15;
                break;
            case 'hurt':
                bounce = Math.sin(Game.frameCount * 0.5) * 3;
                break;
            case 'victory':
                bounce = Math.sin(Game.frameCount * 0.12) * 3;
                armAngle = -0.8 + Math.sin(Game.frameCount * 0.12) * 0.3;
                break;
        }

        var by = sy + bounce; // bounced y

        // ===== LEGS =====
        // Left leg
        ctx.fillStyle = '#D8A0E0'; // light purple leggings
        ctx.fillRect(sx + 8, by + 36 - Math.max(0, legOffset), 6, 12 + Math.max(0, legOffset));
        // Right leg
        ctx.fillRect(sx + 18, by + 36 + Math.min(0, legOffset), 6, 12 - Math.min(0, legOffset));

        // Shoes - sparkly pink
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(sx + 6, by + 44 - Math.max(0, legOffset), 10, 4);
        ctx.fillRect(sx + 16, by + 44 + Math.min(0, legOffset), 10, 4);

        // ===== BODY (torso) =====
        // Main outfit - purple/pink gradient look
        ctx.fillStyle = '#9B30FF'; // vivid purple
        // Torso
        _roundRect(ctx, sx + 6, by + 18, 20, 20, 3);
        ctx.fill();

        // Outfit highlight / sparkle overlay
        ctx.fillStyle = '#BA55D3'; // medium orchid accent
        _roundRect(ctx, sx + 8, by + 20, 16, 8, 2);
        ctx.fill();

        // Star on outfit
        ctx.fillStyle = '#FFD700';
        _drawStar(ctx, sx + 16, by + 28, 4, 5);

        // Sparkle dots on outfit
        var sparklePhase = Game.frameCount * 0.1;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.5 * Math.sin(sparklePhase)) + ')';
        ctx.beginPath();
        ctx.arc(sx + 10, by + 24, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx + 22, by + 26, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.5 * Math.sin(sparklePhase + 2)) + ')';
        ctx.beginPath();
        ctx.arc(sx + 14, by + 34, 1, 0, Math.PI * 2);
        ctx.fill();

        // ===== ARMS =====
        ctx.save();
        // Right arm
        ctx.translate(sx + 26, by + 22);
        ctx.rotate(armAngle);
        ctx.fillStyle = '#FFECD2'; // skin
        ctx.fillRect(0, -2, 8, 4);
        // Hand
        ctx.fillStyle = '#FFECD2';
        ctx.beginPath();
        ctx.arc(8, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        // Left arm
        ctx.translate(sx + 6, by + 22);
        ctx.rotate(-armAngle);
        ctx.fillStyle = '#FFECD2';
        ctx.fillRect(-8, -2, 8, 4);
        ctx.beginPath();
        ctx.arc(-8, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // ===== HEAD =====
        ctx.save();
        ctx.translate(sx + 16, by + 12);
        ctx.rotate(headTilt);

        // Hair back (behind head)
        ctx.fillStyle = '#FFD700'; // golden blonde
        ctx.beginPath();
        ctx.ellipse(0, -1, 13, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#FFECD2'; // fair skin
        ctx.beginPath();
        ctx.ellipse(0, 1, 10, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair front - bangs
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, -6, 11, 7, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        // Hair highlight streaks
        ctx.fillStyle = '#FFE44D';
        ctx.beginPath();
        ctx.ellipse(-3, -7, 4, 3, -0.2, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(4, -6, 3, 2, 0.3, Math.PI, Math.PI * 2);
        ctx.fill();

        // Hair sides (ponytail / flowing hair)
        ctx.fillStyle = '#FFD700';
        // Right side flowing hair
        ctx.beginPath();
        ctx.moveTo(8, -2);
        ctx.quadraticCurveTo(14, 4, 12 + Math.sin(Game.frameCount * 0.05) * 2, 14);
        ctx.quadraticCurveTo(10, 10, 9, 4);
        ctx.fill();
        // Left side
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.quadraticCurveTo(-14, 4, -12 - Math.sin(Game.frameCount * 0.05) * 2, 14);
        ctx.quadraticCurveTo(-10, 10, -9, 4);
        ctx.fill();

        // Eyes - grey-blue
        ctx.fillStyle = '#FFFFFF';
        // Left eye white
        ctx.beginPath();
        ctx.ellipse(-4, 0, 3.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right eye white
        ctx.beginPath();
        ctx.ellipse(4, 0, 3.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Irises - grey-blue
        ctx.fillStyle = '#7B9DB7';
        ctx.beginPath();
        ctx.arc(-4, 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, 0.5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#2A2A3A';
        ctx.beginPath();
        ctx.arc(-4, 0.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, 0.5, 1, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-3.2, -0.3, 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4.8, -0.3, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrows
        ctx.strokeStyle = '#D4A017';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, -3);
        ctx.quadraticCurveTo(-4, -4.5, -2, -3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2, -3);
        ctx.quadraticCurveTo(4, -4.5, 6, -3);
        ctx.stroke();

        // Pink cheeks
        ctx.fillStyle = 'rgba(255,150,150,0.5)';
        ctx.beginPath();
        ctx.ellipse(-7, 3, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(7, 3, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mouth - confident smile
        if (this.state === 'hurt') {
            // Frown when hurt
            ctx.strokeStyle = '#E07070';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 7, 3, Math.PI * 1.2, Math.PI * 1.8);
            ctx.stroke();
        } else if (this.state === 'victory' || this.state === 'dance') {
            // Big happy smile
            ctx.fillStyle = '#FF8888';
            ctx.beginPath();
            ctx.arc(0, 4, 4, 0, Math.PI);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(-2, 4, 4, 2);
        } else {
            // Confident smile
            ctx.strokeStyle = '#E08080';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 4, 3, 0.1, Math.PI - 0.1);
            ctx.stroke();
        }

        // Small nose
        ctx.fillStyle = '#F0D5B8';
        ctx.beginPath();
        ctx.arc(0, 2, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // end head transform

        // ===== Dance effect: sparkle ring =====
        if (this.state === 'dance') {
            var dAngle = Game.frameCount * 0.15;
            for (var s = 0; s < 6; s++) {
                var sa = dAngle + (s / 6) * Math.PI * 2;
                var sr = 24 + Math.sin(Game.frameCount * 0.1 + s) * 4;
                var spx = sx + 16 + Math.cos(sa) * sr;
                var spy = by + 24 + Math.sin(sa) * sr;
                ctx.fillStyle = s % 2 === 0 ? '#FFD700' : '#FF69B4';
                _drawStar(ctx, spx, spy, 3, 4);
            }
        }

        // ===== Victory effect: floating stars =====
        if (this.state === 'victory') {
            for (var s = 0; s < 4; s++) {
                var va = Game.frameCount * 0.08 + (s / 4) * Math.PI * 2;
                var vr = 30;
                var vpx = sx + 16 + Math.cos(va) * vr;
                var vpy = by + 10 + Math.sin(va * 0.5) * 10 - 10;
                ctx.fillStyle = '#FFD700';
                _drawStar(ctx, vpx, vpy, 3, 5);
            }
        }

        ctx.restore();
    }
};

// =================================================================
//  Drawing helpers (private-ish)
// =================================================================

// Rounded rectangle helper
function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Draw a small star shape
function _drawStar(ctx, cx, cy, radius, points) {
    points = points || 5;
    var inner = radius * 0.4;
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
        var a = (i * Math.PI) / points - Math.PI / 2;
        var r = i % 2 === 0 ? radius : inner;
        if (i === 0) {
            ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        } else {
            ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
    }
    ctx.closePath();
    ctx.fill();
}

// =================================================================
//  KEYBOARD HANDLING
// =================================================================

(function setupKeyboard() {
    // Track key states
    window.addEventListener('keydown', function (e) {
        Game.keys[e.key] = true;

        // Prevent scrolling for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) !== -1) {
            e.preventDefault();
        }

        // --- Jump ---
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
            if (Game.state === 'playing') {
                Player.jump();
            }
        }

        // --- Special move ---
        if (e.key === 'z' || e.key === 'x') {
            if (Game.state === 'playing') {
                Player.activateSpecial();
            }
        }

        // --- Pause toggle ---
        if (e.key === 'p') {
            if (Game.state === 'playing') {
                Game.state = 'paused';
            } else if (Game.state === 'paused') {
                Game.state = 'playing';
            }
        }

        // --- Enter: context-dependent ---
        if (e.key === 'Enter') {
            switch (Game.state) {
                case 'menu':
                    Game.startLevel(0);
                    break;
                case 'gameOver':
                    Game.init();
                    Game.startLevel(0);
                    break;
                case 'levelComplete':
                    Game.startLevel(Game.level + 1);
                    break;
                case 'victory':
                    Game.init();
                    break;
            }
        }
    });

    window.addEventListener('keyup', function (e) {
        Game.keys[e.key] = false;
    });

    // Clear keys if window loses focus
    window.addEventListener('blur', function () {
        Game.keys = {};
    });
})();
