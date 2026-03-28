// ============================================================
// level1.js - "Glitter Street" test level for Milestone 1
// ============================================================

var LevelData = {
    levels: [
        {
            name: "Glitter Street",
            width: 4800,
            bgColor1: '#FF9AD2',
            bgColor2: '#6B2FA0',
            portalX: 4600,
            platforms: [
                // Ground segments with gaps
                { x: 0, y: 480, width: 600, height: 60, color: '#C850C0', type: 'solid' },
                { x: 700, y: 480, width: 500, height: 60, color: '#C850C0', type: 'solid' },
                { x: 1300, y: 480, width: 800, height: 60, color: '#C850C0', type: 'solid' },
                { x: 2200, y: 480, width: 600, height: 60, color: '#C850C0', type: 'solid' },
                { x: 2900, y: 480, width: 700, height: 60, color: '#C850C0', type: 'solid' },
                { x: 3700, y: 480, width: 500, height: 60, color: '#C850C0', type: 'solid' },
                { x: 4300, y: 480, width: 500, height: 60, color: '#C850C0', type: 'solid' },

                // Floating platforms - easy jumps
                { x: 250, y: 380, width: 100, height: 16, color: '#FF69B4', type: 'solid' },
                { x: 500, y: 340, width: 80, height: 16, color: '#FF69B4', type: 'solid' },
                { x: 620, y: 420, width: 70, height: 16, color: '#DDA0DD', type: 'solid' },
                { x: 850, y: 360, width: 100, height: 16, color: '#FF69B4', type: 'solid' },
                { x: 1050, y: 300, width: 80, height: 16, color: '#DDA0DD', type: 'solid' },
                { x: 1400, y: 370, width: 120, height: 16, color: '#FF69B4', type: 'solid' },
                { x: 1600, y: 300, width: 100, height: 16, color: '#DDA0DD', type: 'solid' },
                { x: 1800, y: 350, width: 90, height: 16, color: '#FF69B4', type: 'solid' },
                { x: 2000, y: 280, width: 80, height: 16, color: '#DDA0DD', type: 'solid' },

                // Higher secret area platforms
                { x: 1550, y: 200, width: 70, height: 16, color: '#FFD700', type: 'solid' },
                { x: 1700, y: 160, width: 70, height: 16, color: '#FFD700', type: 'solid' },

                // Mid-level platforms
                { x: 2400, y: 370, width: 100, height: 16, color: '#FF69B4', type: 'solid' },
                { x: 2600, y: 320, width: 90, height: 16, color: '#DDA0DD', type: 'solid' },
                { x: 2800, y: 380, width: 80, height: 16, color: '#FF69B4', type: 'solid' },
                { x: 3100, y: 350, width: 110, height: 16, color: '#DDA0DD', type: 'solid' },
                { x: 3300, y: 290, width: 80, height: 16, color: '#FF69B4', type: 'solid' },
                { x: 3500, y: 340, width: 100, height: 16, color: '#DDA0DD', type: 'solid' },

                // Stepping stones over last gap
                { x: 4200, y: 400, width: 60, height: 16, color: '#FFD700', type: 'solid' },
                { x: 4350, y: 360, width: 60, height: 16, color: '#FFD700', type: 'solid' },
            ],
            collectibles: [
                // Stars along the path
                { x: 280, y: 355, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 520, y: 315, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 400, y: 450, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 750, y: 450, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 880, y: 335, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 1080, y: 275, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 1450, y: 345, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 1640, y: 275, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 1830, y: 325, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 2030, y: 255, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 2430, y: 345, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 2630, y: 295, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 3150, y: 325, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 3330, y: 265, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
                { x: 3540, y: 315, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },

                // Music notes (worth more)
                { x: 1000, y: 450, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },
                { x: 2500, y: 450, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },
                { x: 3900, y: 450, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },

                // Heart (extra life)
                { x: 2050, y: 250, width: 20, height: 20, type: 'heart', value: 0, color: '#FF4444' },

                // Hidden music token (up in secret area)
                { x: 1720, y: 130, width: 24, height: 24, type: 'musicToken', value: 500, color: '#FF69B4' },
            ],
            enemies: [
                // Bouncers
                { x: 450, y: 448, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
                  vy: 0, bounceSpeed: 0.06, baseY: 448, bounceHeight: 30, animFrame: 0 },
                { x: 1500, y: 448, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
                  vy: 0, bounceSpeed: 0.07, baseY: 448, bounceHeight: 25, animFrame: 0 },
                { x: 3050, y: 448, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
                  vy: 0, bounceSpeed: 0.05, baseY: 448, bounceHeight: 35, animFrame: 0 },

                // Pacers
                { x: 800, y: 448, width: 36, height: 32, type: 'pacer', alive: true, points: 200,
                  vx: 1.5, minX: 720, maxX: 1150, facing: 1, animFrame: 0 },
                { x: 3800, y: 448, width: 36, height: 32, type: 'pacer', alive: true, points: 200,
                  vx: 2, minX: 3720, maxX: 4150, facing: 1, animFrame: 0 },
            ],
            // Background decoration data
            buildings: [
                { x: 100, h: 180, w: 80, color: '#4A1A6B' },
                { x: 300, h: 240, w: 100, color: '#3D1560' },
                { x: 550, h: 150, w: 70, color: '#5B2080' },
                { x: 800, h: 200, w: 90, color: '#4A1A6B' },
                { x: 1050, h: 260, w: 110, color: '#3D1560' },
                { x: 1300, h: 170, w: 80, color: '#5B2080' },
                { x: 1550, h: 220, w: 95, color: '#4A1A6B' },
                { x: 1800, h: 190, w: 85, color: '#3D1560' },
                { x: 2100, h: 250, w: 100, color: '#5B2080' },
                { x: 2400, h: 160, w: 75, color: '#4A1A6B' },
                { x: 2700, h: 230, w: 105, color: '#3D1560' },
                { x: 3000, h: 180, w: 80, color: '#5B2080' },
                { x: 3300, h: 210, w: 90, color: '#4A1A6B' },
                { x: 3600, h: 270, w: 110, color: '#3D1560' },
                { x: 3900, h: 150, w: 70, color: '#5B2080' },
                { x: 4200, h: 200, w: 90, color: '#4A1A6B' },
            ],
        }
    ],

    load: function(n) {
        var lvl = this.levels[n];
        if (!lvl) return;

        // Deep copy platforms (including moving/breakable properties)
        Game.platforms = lvl.platforms.map(function(p) {
            var plat = { x: p.x, y: p.y, width: p.width, height: p.height, color: p.color, type: p.type };
            if (p.type === 'moving') {
                plat.moveAxis = p.moveAxis;
                plat.moveMin = p.moveMin;
                plat.moveMax = p.moveMax;
                plat.moveSpeed = p.moveSpeed;
                plat.origX = p.x;
                plat.origY = p.y;
                plat.movePhase = Math.random() * Math.PI * 2;
            }
            if (p.type === 'breakable') {
                plat.breakTimer = 0;
                plat.broken = false;
            }
            return plat;
        });

        // Deep copy collectibles
        Game.collectibles = lvl.collectibles.map(function(c) {
            return { x: c.x, y: c.y, width: c.width, height: c.height, type: c.type, value: c.value, color: c.color, collected: false };
        });

        // Deep copy enemies with update functions
        Game.enemies = lvl.enemies.map(function(e) {
            var enemy = {
                x: e.x, y: e.y, width: e.width, height: e.height,
                type: e.type, alive: true, points: e.points,
                animFrame: 0, facing: e.facing || 1
            };

            if (e.type === 'bouncer') {
                enemy.baseY = e.baseY;
                enemy.bounceHeight = e.bounceHeight;
                enemy.bounceSpeed = e.bounceSpeed;
                enemy.phase = Math.random() * Math.PI * 2;
                enemy.update = function() {
                    this.phase += this.bounceSpeed;
                    this.y = this.baseY - Math.abs(Math.sin(this.phase)) * this.bounceHeight;
                    this.animFrame++;
                };
            } else if (e.type === 'pacer') {
                enemy.vx = e.vx;
                enemy.minX = e.minX;
                enemy.maxX = e.maxX;
                enemy.update = function() {
                    this.x += this.vx * this.facing;
                    if (this.x <= this.minX) { this.facing = 1; }
                    if (this.x + this.width >= this.maxX) { this.facing = -1; }
                    this.animFrame++;
                };
            } else if (e.type === 'floater') {
                enemy.baseY = e.baseY;
                enemy.amplitude = e.amplitude;
                enemy.speed = e.speed;
                enemy.phase = e.phase || 0;
                enemy.vx = e.vx || 0.8;
                enemy.minX = e.minX;
                enemy.maxX = e.maxX;
                enemy.update = function() {
                    this.phase += this.speed;
                    this.y = this.baseY + Math.sin(this.phase) * this.amplitude;
                    this.x += this.vx * this.facing;
                    if (this.x <= this.minX) { this.facing = 1; }
                    if (this.x + this.width >= this.maxX) { this.facing = -1; }
                    this.animFrame++;
                };
            }

            return enemy;
        });

        Game.levelWidth = lvl.width;
        Game.portalX = lvl.portalX;
    }
};
