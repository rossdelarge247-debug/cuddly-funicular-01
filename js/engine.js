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
        Audio.startBGM(n);
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
                    Audio.playCollectStar();
                } else if (c.type === 'heart') {
                    this.lives = Math.min(this.lives + 1, 5);
                    this.addParticles(c.x + c.width / 2, c.y + c.height / 2, 15, '#FF4444', 4);
                    Audio.playCollectHeart();
                } else if (c.type === 'musicToken') {
                    this.musicTokens[this.level] = true;
                    this.addParticles(c.x + c.width / 2, c.y + c.height / 2, 20, '#FF69B4', 5);
                    Audio.playCollectToken();
                } else if (c.type === 'note') {
                    this.addParticles(c.x + c.width / 2, c.y + c.height / 2, 8, c.color || '#44FF44', 3);
                    Audio.playCollectNote();
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
                        // Stomp kill - Sonic-style bounce off enemy
                        e.alive = false;
                        // Higher bounce if holding jump, keep horizontal momentum
                        p.vy = Game.keys['ArrowUp'] || Game.keys['w'] || Game.keys[' '] ? -11 : -7;
                        p.doubleJumpAvail = true; // regain double jump
                        this.score += (e.points || 200);
                        this.addParticles(e.x + e.width / 2, e.y + e.height / 2, 12, '#FF4444', 5);
                        Audio.playEnemyBounce();
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
                var nextPower = powers[this.level + 1];
                if (nextPower && this.unlockedPowers.indexOf(nextPower) === -1) {
                    this.unlockedPowers.push(nextPower);
                }
                this.addParticles(p.x + p.width / 2, p.y + p.height / 2, 30, '#FFD700', 6);
                Audio.stopBGM();
                Audio.playLevelComplete();
            } else {
                this.state = 'victory';
                Player.state = 'victory';
                if (this.unlockedPowers.indexOf('Encore Dash') === -1) {
                    this.unlockedPowers.push('Encore Dash');
                }
                this.addParticles(p.x + p.width / 2, p.y + p.height / 2, 50, '#FF69B4', 8);
                Audio.stopBGM();
                Audio.playLevelComplete();
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

    // Sonic-style physics constants
    GRAVITY: 0.28,
    MAX_FALL: 16,
    ACCEL: 0.45,            // ground acceleration
    DECEL: 0.5,             // braking deceleration (turning around)
    FRICTION: 0.35,         // passive ground friction when no input
    AIR_ACCEL: 0.25,        // air acceleration (less control in air)
    AIR_DRAG: 0.02,         // subtle air resistance
    TOP_SPEED: 7,           // normal top speed
    MAX_SPEED: 12,          // absolute max (with momentum)
    JUMP_VEL: -10,
    DOUBLE_JUMP_VEL: -8.5,
    MIN_JUMP_VEL: -4,       // variable jump height (release early)
    jumpHeld: false,         // tracking if jump key is held
    speedTimer: 0,           // time spent at top speed -> builds momentum
    isSpinning: false,       // Sonic-style spin when jumping at speed
    skidding: false,         // braking animation flag
    groundSpeed: 0,          // separate ground speed for Sonic feel

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
        this.jumpHeld = false;
        this.speedTimer = 0;
        this.isSpinning = false;
        this.skidding = false;
        this.groundSpeed = 0;
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
            // Still apply physics during hurt
            this.vy += this.GRAVITY;
            if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;
            this.vx *= 0.95;
            this.x += this.vx;
            this.y += this.vy;
            this._animate(dt);
            return;
        }

        // --- Dance / victory: no movement ---
        if (this.state === 'dance' || this.state === 'victory') {
            this.animTimer -= dt;
            if (this.state === 'dance' && this.animTimer <= 0) {
                this.state = 'idle';
            }
            this.vy += this.GRAVITY;
            if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;
            this.vx *= 0.92;
            this.x += this.vx;
            this.y += this.vy;
            this._animate(dt);
            return;
        }

        // --- Horizontal input (Sonic-style acceleration) ---
        var moveDir = 0;
        if (Game.keys['ArrowLeft'] || Game.keys['a']) moveDir = -1;
        if (Game.keys['ArrowRight'] || Game.keys['d']) moveDir = 1;

        this.skidding = false;

        if (this.onGround) {
            // Ground physics
            if (moveDir !== 0) {
                // Check if turning around (skid)
                if (moveDir !== Math.sign(this.vx) && Math.abs(this.vx) > 1.5) {
                    // Skidding / braking
                    this.vx += moveDir * this.DECEL;
                    this.skidding = true;
                    // Skid particles
                    if (Game.frameCount % 3 === 0) {
                        Game.addParticles(this.x + this.width / 2, this.y + this.height, 2, '#CCAA77', 1.5);
                    }
                } else {
                    // Normal acceleration
                    this.vx += moveDir * this.ACCEL;
                }
                this.facing = moveDir;
            } else {
                // Friction when no input
                if (Math.abs(this.vx) < this.FRICTION) {
                    this.vx = 0;
                } else {
                    this.vx -= Math.sign(this.vx) * this.FRICTION;
                }
            }

            // Speed momentum: running at top speed builds up to higher max
            if (Math.abs(this.vx) >= this.TOP_SPEED - 0.5) {
                this.speedTimer += dt;
            } else {
                this.speedTimer = Math.max(0, this.speedTimer - dt * 2);
            }
            var currentMax = this.TOP_SPEED + Math.min(this.speedTimer * 1.5, this.MAX_SPEED - this.TOP_SPEED);
            if (Math.abs(this.vx) > currentMax) {
                this.vx = Math.sign(this.vx) * currentMax;
            }

            this.groundSpeed = Math.abs(this.vx);
        } else {
            // Air physics - less control, some drag
            if (moveDir !== 0) {
                this.vx += moveDir * this.AIR_ACCEL;
                this.facing = moveDir;
            }
            // Air drag (subtle)
            this.vx *= (1 - this.AIR_DRAG);
            // Cap air speed
            if (Math.abs(this.vx) > this.MAX_SPEED) {
                this.vx = Math.sign(this.vx) * this.MAX_SPEED;
            }
        }

        // --- Variable jump height (release to cut jump short) ---
        if (!this.jumpHeld && this.vy < this.MIN_JUMP_VEL) {
            this.vy = this.MIN_JUMP_VEL;
        }

        // --- Apply gravity ---
        this.vy += this.GRAVITY;
        if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;

        // --- Move ---
        this.x += this.vx;
        this.y += this.vy;

        // --- Spin state: spinning ball when jumping at high speed ---
        this.isSpinning = !this.onGround && this.groundSpeed > 4;

        // --- Speed lines particles ---
        if (this.onGround && Math.abs(this.vx) > this.TOP_SPEED) {
            if (Game.frameCount % 2 === 0) {
                Game.addParticles(
                    this.x + this.width / 2 - this.facing * 16,
                    this.y + this.height * 0.4 + (Math.random() - 0.5) * 20,
                    1, 'rgba(255,255,255,0.5)', 0.5
                );
            }
        }

        // --- Determine visual state ---
        if (!this.onGround) {
            if (this.isSpinning) {
                this.state = 'spin';
            } else {
                this.state = this.vy < 0 ? 'jump' : 'fall';
            }
        } else if (this.skidding) {
            this.state = 'skid';
        } else if (Math.abs(this.vx) > this.TOP_SPEED) {
            this.state = 'sprint';
        } else if (Math.abs(this.vx) > 0.3) {
            this.state = 'run';
        } else {
            this.state = 'idle';
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
            // Jump power scales slightly with speed
            var speedBonus = Math.abs(this.vx) * 0.15;
            this.vy = this.JUMP_VEL - speedBonus;
            this.onGround = false;
            this.jumpHeld = true;
            this.state = 'jump';
            Game.addParticles(this.x + this.width / 2, this.y + this.height, 6, '#FFFFFF', 2.5);
            Audio.playJump();
        } else if (this.doubleJumpAvail) {
            this.vy = this.DOUBLE_JUMP_VEL;
            this.doubleJumpAvail = false;
            this.jumpHeld = true;
            this.state = 'jump';
            Game.addParticles(this.x + this.width / 2, this.y + this.height / 2, 10, '#DDA0DD', 3);
            Audio.playDoubleJump();
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
        this.animTimer = 0.8;
        this.invincible = true;
        this.invincibleTimer = 1.0;

        Audio.playDancePower();
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
        Audio.playHurt();

        if (Game.lives <= 0) {
            Game.state = 'gameOver';
            Audio.stopBGM();
            Audio.playGameOver();
        }
    },

    // ---------------------------------------------------------------
    //  draw - Maddie (Sonic-style bold outlines, spin ball, dynamic poses)
    // ---------------------------------------------------------------
    draw: function (ctx, cam) {
        if (this.invincible && Math.floor(Game.frameCount / 3) % 2 === 0) {
            return;
        }

        var sx = this.x - cam.x;
        var sy = this.y - cam.y;
        var f = this.facing;
        var spd = Math.abs(this.vx);
        var OUTLINE = '#2A1040'; // bold dark outline color
        var OW = 2; // outline width

        ctx.save();

        // --- Speed afterimages when sprinting ---
        if (this.state === 'sprint' || (this.state === 'spin' && spd > 5)) {
            for (var g = 3; g > 0; g--) {
                ctx.globalAlpha = 0.08 * g;
                ctx.fillStyle = '#BA55D3';
                ctx.beginPath();
                ctx.ellipse(sx + 16 - f * g * 8, sy + 24, 14, 22, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // --- Spin ball mode (Sonic-style) ---
        if (this.state === 'spin') {
            var spinCx = sx + this.width / 2;
            var spinCy = sy + this.height / 2;
            var spinR = 16;
            var spinAngle = Game.frameCount * 0.4 * f;

            // Outline
            ctx.strokeStyle = OUTLINE;
            ctx.lineWidth = OW + 1;
            ctx.beginPath();
            ctx.arc(spinCx, spinCy, spinR + 1, 0, Math.PI * 2);
            ctx.stroke();

            // Main ball - purple gradient
            var ballGrad = ctx.createRadialGradient(spinCx - 4, spinCy - 4, 2, spinCx, spinCy, spinR);
            ballGrad.addColorStop(0, '#D070FF');
            ballGrad.addColorStop(1, '#6A1B9A');
            ctx.fillStyle = ballGrad;
            ctx.beginPath();
            ctx.arc(spinCx, spinCy, spinR, 0, Math.PI * 2);
            ctx.fill();

            // Spin streaks (hair flash)
            for (var ss = 0; ss < 3; ss++) {
                var sa = spinAngle + (ss / 3) * Math.PI * 2;
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(spinCx, spinCy, spinR - 2, sa, sa + 0.8);
                ctx.stroke();
            }

            // Star highlight
            ctx.fillStyle = '#FFD700';
            _drawStar(ctx, spinCx, spinCy, 5, 5);

            // Motion blur lines
            for (var ml = 0; ml < 3; ml++) {
                ctx.strokeStyle = 'rgba(186,85,211,' + (0.4 - ml * 0.12) + ')';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(spinCx - f * (20 + ml * 10), spinCy - 8 + ml * 8);
                ctx.lineTo(spinCx - f * (30 + ml * 12), spinCy - 8 + ml * 8);
                ctx.stroke();
            }

            ctx.restore();
            return;
        }

        // Flip for facing direction
        if (f === -1) {
            ctx.translate(sx + this.width / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.width / 2, 0);
            sx = 0;
        }

        // --- Animation offsets ---
        var bounce = 0, legOffset = 0, armAngle = 0, headTilt = 0, bodyLean = 0;
        var runSpeed = Math.min(spd / this.TOP_SPEED, 1); // 0-1 normalized speed

        switch (this.state) {
            case 'idle':
                bounce = Math.sin(Game.frameCount * 0.08) * 2;
                break;
            case 'run':
                bounce = Math.sin(Game.frameCount * (0.2 + runSpeed * 0.3)) * (1.5 + runSpeed);
                legOffset = Math.sin(Game.frameCount * (0.2 + runSpeed * 0.3)) * (4 + runSpeed * 5);
                armAngle = Math.sin(Game.frameCount * (0.2 + runSpeed * 0.3)) * (0.3 + runSpeed * 0.4);
                bodyLean = runSpeed * 0.15;
                break;
            case 'sprint':
                bounce = Math.sin(Game.frameCount * 0.5) * 1;
                legOffset = Math.sin(Game.frameCount * 0.5) * 10;
                armAngle = Math.sin(Game.frameCount * 0.5) * 0.7;
                bodyLean = 0.25;
                break;
            case 'skid':
                bounce = 0;
                bodyLean = -0.2;
                break;
            case 'jump':
                bounce = -3;
                armAngle = -0.7;
                break;
            case 'fall':
                bounce = 2;
                armAngle = 0.4;
                legOffset = 3;
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

        var by = sy + bounce;

        // Apply body lean for speed
        ctx.save();
        if (bodyLean !== 0) {
            ctx.translate(sx + 16, by + 48);
            ctx.rotate(bodyLean);
            ctx.translate(-(sx + 16), -(by + 48));
        }

        // ===== LEGS with outlines =====
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = OW;
        // Left leg
        ctx.fillStyle = '#D8A0E0';
        ctx.fillRect(sx + 8, by + 36 - Math.max(0, legOffset), 6, 12 + Math.max(0, legOffset));
        ctx.strokeRect(sx + 8, by + 36 - Math.max(0, legOffset), 6, 12 + Math.max(0, legOffset));
        // Right leg
        ctx.fillRect(sx + 18, by + 36 + Math.min(0, legOffset), 6, 12 - Math.min(0, legOffset));
        ctx.strokeRect(sx + 18, by + 36 + Math.min(0, legOffset), 6, 12 - Math.min(0, legOffset));

        // Shoes with outlines - bold red (Sonic-style)
        ctx.fillStyle = '#FF2060';
        var shoeL = {x: sx + 5, y: by + 44 - Math.max(0, legOffset), w: 12, h: 5};
        var shoeR = {x: sx + 15, y: by + 44 + Math.min(0, legOffset), w: 12, h: 5};
        _roundRect(ctx, shoeL.x, shoeL.y, shoeL.w, shoeL.h, 2); ctx.fill(); ctx.stroke();
        _roundRect(ctx, shoeR.x, shoeR.y, shoeR.w, shoeR.h, 2); ctx.fill(); ctx.stroke();
        // Shoe stripe
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(shoeL.x + 2, shoeL.y + 1, shoeL.w - 4, 2);
        ctx.fillRect(shoeR.x + 2, shoeR.y + 1, shoeR.w - 4, 2);

        // Skid dust
        if (this.state === 'skid') {
            for (var d = 0; d < 3; d++) {
                ctx.fillStyle = 'rgba(200,170,120,' + (0.5 - d * 0.15) + ')';
                ctx.beginPath();
                ctx.arc(sx + 16 + (d * 6), by + 48, 3 + d, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // ===== BODY with outline =====
        ctx.fillStyle = '#9B30FF';
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = OW;
        _roundRect(ctx, sx + 5, by + 17, 22, 21, 4);
        ctx.fill();
        ctx.stroke();

        // Belt / waist accent
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(sx + 6, by + 34, 20, 3);
        ctx.strokeStyle = OUTLINE;
        ctx.strokeRect(sx + 6, by + 34, 20, 3);

        // Outfit highlight
        ctx.fillStyle = '#BA55D3';
        _roundRect(ctx, sx + 7, by + 19, 18, 8, 2);
        ctx.fill();

        // Star emblem on chest (bigger, bolder)
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 1.5;
        _drawStar(ctx, sx + 16, by + 27, 5, 5);
        ctx.stroke();

        // Sparkle dots
        var sp = Game.frameCount * 0.12;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.5 * Math.sin(sp)) + ')';
        ctx.beginPath(); ctx.arc(sx + 10, by + 23, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 22, by + 25, 1.5, 0, Math.PI * 2); ctx.fill();

        // ===== ARMS with outlines =====
        ctx.save();
        ctx.translate(sx + 27, by + 21);
        ctx.rotate(armAngle);
        // Arm outline
        ctx.fillStyle = '#FFECD2';
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = OW;
        ctx.fillRect(-1, -3, 10, 5);
        ctx.strokeRect(-1, -3, 10, 5);
        // Glove
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(9, -0.5, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(9, -0.5, 4, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(sx + 5, by + 21);
        ctx.rotate(-armAngle);
        ctx.fillStyle = '#FFECD2';
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = OW;
        ctx.fillRect(-9, -3, 10, 5);
        ctx.strokeRect(-9, -3, 10, 5);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(-9, -0.5, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(-9, -0.5, 4, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        // ===== HEAD with bold outline =====
        ctx.save();
        ctx.translate(sx + 16, by + 11);
        ctx.rotate(headTilt);

        // Hair back
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = OW;
        ctx.beginPath(); ctx.ellipse(0, -1, 14, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Face
        ctx.fillStyle = '#FFECD2';
        ctx.beginPath(); ctx.ellipse(0, 1, 11, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = OUTLINE; ctx.lineWidth = OW;
        ctx.beginPath(); ctx.ellipse(0, 1, 11, 11, 0, 0, Math.PI * 2); ctx.stroke();

        // Bangs
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.ellipse(0, -6, 12, 8, 0, Math.PI, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0, -6, 12, 8, 0, Math.PI, Math.PI * 2); ctx.stroke();

        // Hair highlights
        ctx.fillStyle = '#FFE44D';
        ctx.beginPath(); ctx.ellipse(-3, -8, 4, 3, -0.2, Math.PI, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(4, -7, 3, 2, 0.3, Math.PI, Math.PI * 2); ctx.fill();

        // Flowing hair sides (speed-reactive)
        var hairFlow = Math.sin(Game.frameCount * 0.06) * 2 + spd * 0.5;
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(9, -2);
        ctx.quadraticCurveTo(16, 5, 14 + hairFlow, 18);
        ctx.quadraticCurveTo(11, 12, 10, 4);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-9, -2);
        ctx.quadraticCurveTo(-16, 5, -14 - hairFlow, 18);
        ctx.quadraticCurveTo(-11, 12, -10, 4);
        ctx.fill(); ctx.stroke();

        // Larger, more expressive eyes (Sonic-style)
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(-4, 0, 4.5, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(4, 0, 4.5, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Irises - larger
        ctx.fillStyle = '#7B9DB7';
        ctx.beginPath(); ctx.arc(-4, 0.5, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, 0.5, 3, 0, Math.PI * 2); ctx.fill();

        // Pupils
        ctx.fillStyle = '#1A1A2E';
        ctx.beginPath(); ctx.arc(-4, 0.5, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, 0.5, 1.5, 0, Math.PI * 2); ctx.fill();

        // Eye shines (bigger, more anime)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(-3, -1, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(5, -1, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-5, 2, 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(3, 2, 0.6, 0, Math.PI * 2); ctx.fill();

        // Determined eyebrows (thicker)
        ctx.strokeStyle = '#D4A017';
        ctx.lineWidth = 1.8;
        if (this.state === 'sprint' || this.state === 'skid') {
            // Determined look
            ctx.beginPath(); ctx.moveTo(-7, -4); ctx.lineTo(-2, -5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(2, -5); ctx.lineTo(7, -4); ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(-7, -4); ctx.quadraticCurveTo(-4, -6, -1, -4); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(1, -4); ctx.quadraticCurveTo(4, -6, 7, -4); ctx.stroke();
        }

        // Pink cheeks
        ctx.fillStyle = 'rgba(255,150,150,0.5)';
        ctx.beginPath(); ctx.ellipse(-8, 4, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(8, 4, 3, 2, 0, 0, Math.PI * 2); ctx.fill();

        // Mouth
        if (this.state === 'hurt') {
            ctx.strokeStyle = '#E07070'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 7, 3, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
        } else if (this.state === 'victory' || this.state === 'dance') {
            ctx.fillStyle = '#FF8888';
            ctx.beginPath(); ctx.arc(0, 5, 5, 0, Math.PI); ctx.fill();
            ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, 5, 5, 0, Math.PI); ctx.stroke();
            ctx.fillStyle = '#FFF'; ctx.fillRect(-3, 5, 6, 2);
        } else if (this.state === 'sprint') {
            // Excited grin
            ctx.fillStyle = '#FF8888';
            ctx.beginPath(); ctx.arc(1, 5, 4, -0.2, Math.PI + 0.2); ctx.fill();
            ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(1, 5, 4, -0.2, Math.PI + 0.2); ctx.stroke();
        } else {
            ctx.strokeStyle = '#D06080'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 5, 3.5, 0.1, Math.PI - 0.1); ctx.stroke();
        }

        // Nose
        ctx.fillStyle = '#F0D5B8';
        ctx.beginPath(); ctx.arc(0, 2.5, 1.2, 0, Math.PI * 2); ctx.fill();

        ctx.restore(); // end head

        ctx.restore(); // end body lean

        // ===== Speed lines (drawn behind/around character at high speed) =====
        if (spd > this.TOP_SPEED * 0.8 && this.onGround) {
            var lineAlpha = Math.min((spd - this.TOP_SPEED * 0.8) / 4, 0.6);
            ctx.strokeStyle = 'rgba(255,255,255,' + lineAlpha + ')';
            ctx.lineWidth = 1.5;
            for (var sl = 0; sl < 4; sl++) {
                var ly = sy + 8 + sl * 12;
                var lx = sx + 16 - f * 18;
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx - f * (12 + spd * 2 + Math.random() * 5), ly);
                ctx.stroke();
            }
        }

        // ===== Dance effect: sparkle ring =====
        if (this.state === 'dance') {
            var dAngle = Game.frameCount * 0.15;
            for (var s = 0; s < 8; s++) {
                var sa = dAngle + (s / 8) * Math.PI * 2;
                var sr = 28 + Math.sin(Game.frameCount * 0.1 + s) * 5;
                var spx = sx + 16 + Math.cos(sa) * sr;
                var spy = sy + bounce + 24 + Math.sin(sa) * sr;
                ctx.fillStyle = s % 2 === 0 ? '#FFD700' : '#FF69B4';
                _drawStar(ctx, spx, spy, 4, 5);
            }
        }

        // ===== Victory effect =====
        if (this.state === 'victory') {
            for (var s = 0; s < 5; s++) {
                var va = Game.frameCount * 0.08 + (s / 5) * Math.PI * 2;
                var vr = 34;
                var vpx = sx + 16 + Math.cos(va) * vr;
                var vpy = sy + bounce + 10 + Math.sin(va * 0.5) * 12 - 10;
                ctx.fillStyle = '#FFD700';
                _drawStar(ctx, vpx, vpy, 4, 5);
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
            Audio.init();
            Audio.playMenuSelect();
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
        // Variable jump height: release jump key to cut jump short
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
            Player.jumpHeld = false;
        }
    });

    // Clear keys if window loses focus
    window.addEventListener('blur', function () {
        Game.keys = {};
    });
})();
