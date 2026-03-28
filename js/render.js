// ============================================================
// render.js - Drawing functions: backgrounds, HUD, menus, entities
// ============================================================

var Render = {

    // ----- Draw background for current level -----
    drawBackground: function(ctx, cam) {
        var lvl = LevelData.levels[Game.level] || LevelData.levels[0];

        // Sky gradient
        var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, lvl.bgColor1);
        grad.addColorStop(1, lvl.bgColor2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Twinkling stars in sky
        var starSeed = 42;
        for (var i = 0; i < 40; i++) {
            starSeed = (starSeed * 1103515245 + 12345) & 0x7fffffff;
            var sx = (starSeed % 1200) - cam.x * 0.05;
            starSeed = (starSeed * 1103515245 + 12345) & 0x7fffffff;
            var sy = starSeed % 300;
            var twinkle = 0.3 + 0.7 * Math.abs(Math.sin(Game.frameCount * 0.02 + i * 0.7));
            ctx.fillStyle = 'rgba(255,255,255,' + twinkle + ')';
            ctx.beginPath();
            ctx.arc(((sx % canvas.width) + canvas.width) % canvas.width, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Parallax buildings
        if (lvl.buildings) {
            for (var i = 0; i < lvl.buildings.length; i++) {
                var b = lvl.buildings[i];
                var bx = b.x - cam.x * 0.3;
                ctx.fillStyle = b.color;
                ctx.fillRect(bx, canvas.height - b.h - 60, b.w, b.h);
                // Windows
                ctx.fillStyle = 'rgba(255,200,255,0.15)';
                for (var wy = 10; wy < b.h - 20; wy += 25) {
                    for (var wx = 8; wx < b.w - 8; wx += 18) {
                        var lit = Math.sin(i * 3 + wx + wy + Game.frameCount * 0.005) > 0.3;
                        if (lit) {
                            ctx.fillStyle = 'rgba(255,220,255,0.3)';
                        } else {
                            ctx.fillStyle = 'rgba(255,200,255,0.08)';
                        }
                        ctx.fillRect(bx + wx, canvas.height - b.h - 60 + wy, 10, 14);
                    }
                }
            }
        }
    },

    // ----- Draw platforms -----
    drawPlatforms: function(ctx, cam) {
        for (var i = 0; i < Game.platforms.length; i++) {
            var p = Game.platforms[i];
            var px = p.x - cam.x;
            var py = p.y - cam.y;

            // Skip if off screen
            if (px + p.width < 0 || px > canvas.width) continue;

            // Platform fill
            ctx.fillStyle = p.color || '#C850C0';
            ctx.fillRect(px, py, p.width, p.height);

            // Top highlight
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(px, py, p.width, 3);

            // Bottom shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(px, py + p.height - 2, p.width, 2);

            // Sparkle dots on platforms
            if (p.height <= 20) {
                var sparkle = 0.3 + 0.3 * Math.sin(Game.frameCount * 0.05 + p.x * 0.01);
                ctx.fillStyle = 'rgba(255,255,255,' + sparkle + ')';
                ctx.beginPath();
                ctx.arc(px + p.width * 0.3, py + 4, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(px + p.width * 0.7, py + 4, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    // ----- Draw collectibles -----
    drawCollectibles: function(ctx, cam) {
        for (var i = 0; i < Game.collectibles.length; i++) {
            var c = Game.collectibles[i];
            if (c.collected) continue;

            var cx = c.x - cam.x + c.width / 2;
            var cy = c.y - cam.y + c.height / 2;

            // Skip if off screen
            if (cx < -20 || cx > canvas.width + 20) continue;

            var bob = Math.sin(Game.frameCount * 0.06 + c.x * 0.01) * 3;

            if (c.type === 'star') {
                // Golden spinning star
                ctx.save();
                ctx.translate(cx, cy + bob);
                ctx.rotate(Game.frameCount * 0.03);
                ctx.fillStyle = '#FFD700';
                _drawStar(ctx, 0, 0, 10, 5);
                ctx.fillStyle = '#FFF8DC';
                _drawStar(ctx, 0, 0, 5, 5);
                ctx.restore();
                // Glow
                ctx.fillStyle = 'rgba(255,215,0,0.15)';
                ctx.beginPath();
                ctx.arc(cx, cy + bob, 14, 0, Math.PI * 2);
                ctx.fill();
            } else if (c.type === 'note') {
                // Music note
                ctx.fillStyle = '#FF69B4';
                ctx.beginPath();
                ctx.arc(cx - 3, cy + bob + 4, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(cx + 1, cy + bob - 8, 3, 14);
                ctx.fillRect(cx + 1, cy + bob - 8, 8, 3);
                // Glow
                ctx.fillStyle = 'rgba(255,105,180,0.15)';
                ctx.beginPath();
                ctx.arc(cx, cy + bob, 14, 0, Math.PI * 2);
                ctx.fill();
            } else if (c.type === 'heart') {
                // Heart shape
                var pulse = 1 + Math.sin(Game.frameCount * 0.08) * 0.15;
                ctx.save();
                ctx.translate(cx, cy + bob);
                ctx.scale(pulse, pulse);
                ctx.fillStyle = '#FF4444';
                ctx.beginPath();
                ctx.moveTo(0, 3);
                ctx.bezierCurveTo(-8, -5, -12, 2, 0, 10);
                ctx.bezierCurveTo(12, 2, 8, -5, 0, 3);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.arc(-3, 1, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (c.type === 'musicToken') {
                // Rainbow spinning disc
                var hue = (Game.frameCount * 3) % 360;
                ctx.save();
                ctx.translate(cx, cy + bob);
                // Outer glow
                ctx.fillStyle = 'rgba(255,105,180,0.2)';
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.fill();
                // Disc
                ctx.fillStyle = 'hsl(' + hue + ',100%,60%)';
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                // Inner ring
                ctx.fillStyle = 'hsl(' + ((hue + 120) % 360) + ',100%,70%)';
                ctx.beginPath();
                ctx.arc(0, 0, 7, 0, Math.PI * 2);
                ctx.fill();
                // Center
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();
                // Note symbol
                ctx.fillStyle = '#333';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('\u266B', 0, 0);
                ctx.restore();
            }
        }
    },

    // ----- Draw enemies -----
    drawEnemies: function(ctx, cam) {
        for (var i = 0; i < Game.enemies.length; i++) {
            var e = Game.enemies[i];
            if (!e.alive) continue;

            var ex = e.x - cam.x;
            var ey = e.y - cam.y;

            // Skip if off screen
            if (ex + e.width < -10 || ex > canvas.width + 10) continue;

            if (e.type === 'bouncer') {
                // Silly bouncing pink blob
                var squish = Math.sin(e.phase || Game.frameCount * 0.06) * 0.15;
                ctx.save();
                ctx.translate(ex + e.width / 2, ey + e.height);
                ctx.scale(1 + squish, 1 - squish);

                // Body
                ctx.fillStyle = '#E855A0';
                ctx.beginPath();
                ctx.ellipse(0, -e.height / 2, e.width / 2, e.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Highlight
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.beginPath();
                ctx.ellipse(-4, -e.height / 2 - 4, 6, 4, -0.3, 0, Math.PI * 2);
                ctx.fill();

                // Eyes
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.ellipse(-6, -e.height / 2 - 2, 5, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(6, -e.height / 2 - 2, 5, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                // Pupils
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(-5, -e.height / 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(7, -e.height / 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                // Silly mouth
                ctx.strokeStyle = '#A03060';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, -e.height / 2 + 6, 5, 0, Math.PI);
                ctx.stroke();

                ctx.restore();
            } else if (e.type === 'pacer') {
                // Walking teal character
                var walk = Math.sin((e.animFrame || 0) * 0.15) * 3;
                ctx.save();
                ctx.translate(ex + e.width / 2, ey + e.height);

                // Feet
                ctx.fillStyle = '#20B2AA';
                ctx.fillRect(-10, -6 + walk, 7, 6);
                ctx.fillRect(3, -6 - walk, 7, 6);

                // Body
                ctx.fillStyle = '#3DD6CF';
                ctx.beginPath();
                ctx.ellipse(0, -e.height / 2, e.width / 2 - 2, e.height / 2 - 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Highlight
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.beginPath();
                ctx.ellipse(-3, -e.height / 2 - 4, 5, 4, -0.2, 0, Math.PI * 2);
                ctx.fill();

                // Eyes (looking in walk direction)
                var lookDir = e.facing || 1;
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.ellipse(-5, -e.height / 2 - 2, 5, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(5, -e.height / 2 - 2, 5, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(-4 + lookDir * 2, -e.height / 2 - 1, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(6 + lookDir * 2, -e.height / 2 - 1, 2.5, 0, Math.PI * 2);
                ctx.fill();
                // Cheeky tongue
                ctx.fillStyle = '#FF6B8A';
                ctx.beginPath();
                ctx.ellipse(lookDir * 6, -e.height / 2 + 6, 4, 3, lookDir * 0.3, 0, Math.PI);
                ctx.fill();

                ctx.restore();
            }
        }
    },

    // ----- Draw end-of-level portal -----
    drawPortal: function(ctx, cam) {
        var px = Game.portalX - cam.x;
        var py = canvas.height - 120;

        if (px < -60 || px > canvas.width + 60) return;

        // Glow
        var glowSize = 40 + Math.sin(Game.frameCount * 0.04) * 8;
        var grad = ctx.createRadialGradient(px + 20, py + 30, 5, px + 20, py + 30, glowSize);
        grad.addColorStop(0, 'rgba(255,105,180,0.5)');
        grad.addColorStop(0.5, 'rgba(186,85,211,0.2)');
        grad.addColorStop(1, 'rgba(186,85,211,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(px - 30, py - 20, 100, 120);

        // Portal frame
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(px + 20, py + 30, 22, 35, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner swirl
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 2;
        for (var s = 0; s < 3; s++) {
            var angle = Game.frameCount * 0.03 + (s * Math.PI * 2 / 3);
            ctx.beginPath();
            ctx.arc(px + 20, py + 30, 12 + s * 4, angle, angle + 1.5);
            ctx.stroke();
        }

        // Star on top
        ctx.fillStyle = '#FFD700';
        _drawStar(ctx, px + 20, py - 8, 8, 5);

        // "EXIT" sparkle text above
        var alpha = 0.5 + 0.5 * Math.sin(Game.frameCount * 0.05);
        ctx.fillStyle = 'rgba(255,215,0,' + alpha + ')';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('\u2605 EXIT \u2605', px + 20, py - 20);
    },

    // ----- Draw HUD -----
    drawHUD: function(ctx) {
        // Score
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(8, 8, 170, 32);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        _drawStar(ctx, 22, 24, 8, 5);
        ctx.fillStyle = '#FFF';
        ctx.fillText('Score: ' + Game.score, 36, 28);

        // Lives
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(8, 44, 100, 28);
        for (var i = 0; i < Game.lives; i++) {
            ctx.fillStyle = '#FF4444';
            ctx.beginPath();
            var hx = 22 + i * 24;
            var hy = 56;
            ctx.moveTo(hx, hy);
            ctx.bezierCurveTo(hx - 6, hy - 6, hx - 10, hy + 1, hx, hy + 7);
            ctx.bezierCurveTo(hx + 10, hy + 1, hx + 6, hy - 6, hx, hy);
            ctx.fill();
        }

        // Level name
        var lvl = LevelData.levels[Game.level];
        if (lvl) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            var nameWidth = ctx.measureText(lvl.name).width + 20;
            ctx.fillRect(canvas.width - nameWidth - 8, 8, nameWidth + 4, 28);
            ctx.fillStyle = '#FF69B4';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(lvl.name, canvas.width - 16, 26);
        }

        // Dance power indicator
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(canvas.width / 2 - 70, canvas.height - 36, 140, 28);
        if (Game.specialReady) {
            var glow = 0.7 + 0.3 * Math.sin(Game.frameCount * 0.1);
            ctx.fillStyle = 'rgba(255,215,0,' + glow + ')';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('\u2605 Star Spin Ready! [Z]', canvas.width / 2, canvas.height - 18);
        } else {
            // Cooldown bar
            var pct = 1 - (Game.specialCooldown / 3);
            ctx.fillStyle = '#555';
            ctx.fillRect(canvas.width / 2 - 50, canvas.height - 26, 100, 10);
            ctx.fillStyle = '#BA55D3';
            ctx.fillRect(canvas.width / 2 - 50, canvas.height - 26, 100 * pct, 10);
            ctx.fillStyle = '#AAA';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Star Spin...', canvas.width / 2, canvas.height - 18);
        }
    },

    // ----- Menu screen -----
    drawMenu: function(ctx) {
        // Background gradient
        var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#FF69B4');
        grad.addColorStop(0.5, '#9B30FF');
        grad.addColorStop(1, '#1a0a2e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Floating stars
        for (var i = 0; i < 20; i++) {
            var sx = (Math.sin(Game.frameCount * 0.01 + i * 1.3) * 0.5 + 0.5) * canvas.width;
            var sy = (Math.cos(Game.frameCount * 0.008 + i * 0.9) * 0.5 + 0.5) * canvas.height;
            var alpha = 0.3 + 0.4 * Math.sin(Game.frameCount * 0.03 + i);
            ctx.fillStyle = 'rgba(255,215,0,' + alpha + ')';
            _drawStar(ctx, sx, sy, 4 + (i % 3) * 2, 5);
        }

        // Title
        ctx.textAlign = 'center';
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.font = 'bold 52px Arial';
        ctx.fillText('MADDIE ACADEMY', canvas.width / 2 + 3, 163);
        // Main title with sparkle color
        var hue = (Game.frameCount * 2) % 360;
        ctx.fillStyle = '#FFD700';
        ctx.fillText('MADDIE ACADEMY', canvas.width / 2, 160);

        // Subtitle
        ctx.fillStyle = '#FFB6C1';
        ctx.font = '18px Arial';
        ctx.fillText('Starring Maddie \u2014 the brightest star in the city \u2B50', canvas.width / 2, 200);

        // Play button
        this._drawButton(ctx, canvas.width / 2 - 80, 280, 160, 50, 'PLAY', true);

        // How to play
        this._drawButton(ctx, canvas.width / 2 - 80, 350, 160, 40, 'How to Play', false);

        // Controls hint
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '14px Arial';
        ctx.fillText('Press ENTER to start!', canvas.width / 2, 440);
        ctx.fillText('Arrow keys / WASD to move  |  Space to jump  |  Z for dance power', canvas.width / 2, 465);
    },

    // ----- Pause overlay -----
    drawPaused: function(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FF69B4';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillStyle = '#FFF';
        ctx.font = '18px Arial';
        ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 30);
    },

    // ----- Level complete screen -----
    drawLevelComplete: function(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Confetti
        for (var i = 0; i < 30; i++) {
            var colors = ['#FF69B4', '#FFD700', '#00CED1', '#FF4444', '#BA55D3', '#FFF'];
            ctx.fillStyle = colors[i % colors.length];
            var cx = (Math.sin(Game.frameCount * 0.02 + i * 2.1) * 0.5 + 0.5) * canvas.width;
            var cy = ((Game.frameCount * 0.5 + i * 40) % (canvas.height + 20)) - 10;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Game.frameCount * 0.05 + i);
            ctx.fillRect(-4, -2, 8, 4);
            ctx.restore();
        }

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STAGE CLEAR!', canvas.width / 2, 180);

        ctx.fillStyle = '#FFF';
        ctx.font = '22px Arial';
        ctx.fillText('Score: ' + Game.score, canvas.width / 2, 240);
        ctx.fillText('Stars collected: ' + Game.starsCollected, canvas.width / 2, 275);

        if (Game.musicTokens[Game.level]) {
            ctx.fillStyle = '#FF69B4';
            ctx.fillText('Secret Track Unlocked! \uD83C\uDFB5', canvas.width / 2, 320);
        }

        ctx.fillStyle = '#FFB6C1';
        ctx.font = '20px Arial';
        var powerName = ['Star Spin \u2B50', 'Glitter Burst \u2728', 'Encore Dash \uD83D\uDCAB'][Game.level];
        ctx.fillText('Dance Power Unlocked: ' + powerName, canvas.width / 2, 365);

        ctx.fillStyle = '#FFF';
        ctx.font = '18px Arial';
        ctx.fillText('Press ENTER for next level', canvas.width / 2, 420);
    },

    // ----- Game over -----
    drawGameOver: function(ctx) {
        ctx.fillStyle = 'rgba(30,0,40,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FF69B4';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Oops! Try again, superstar!', canvas.width / 2, 220);

        ctx.fillStyle = '#FFF';
        ctx.font = '22px Arial';
        ctx.fillText('Score: ' + Game.score, canvas.width / 2, 280);

        ctx.fillStyle = '#FFB6C1';
        ctx.font = '18px Arial';
        ctx.fillText('Press ENTER to retry', canvas.width / 2, 340);
    },

    // ----- Victory screen -----
    drawVictory: function(ctx) {
        // Epic background
        var hue = (Game.frameCount * 0.5) % 360;
        var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, 'hsl(' + hue + ',70%,30%)');
        grad.addColorStop(1, 'hsl(' + ((hue + 60) % 360) + ',80%,15%)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Fireworks/confetti
        for (var i = 0; i < 50; i++) {
            var colors = ['#FF69B4', '#FFD700', '#00CED1', '#FF4444', '#BA55D3', '#FFF', '#7FFFD4'];
            ctx.fillStyle = colors[i % colors.length];
            var cx = (Math.sin(Game.frameCount * 0.015 + i * 1.7) * 0.5 + 0.5) * canvas.width;
            var cy = ((Game.frameCount * 0.8 + i * 30) % (canvas.height + 20)) - 10;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Game.frameCount * 0.04 + i * 0.5);
            if (i % 3 === 0) {
                _drawStar(ctx, 0, 0, 5, 5);
            } else {
                ctx.fillRect(-4, -2, 8, 4);
            }
            ctx.restore();
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 52px Arial';
        ctx.fillText('YOU DID IT, MADDIE!', canvas.width / 2, 140);

        ctx.fillStyle = '#FF69B4';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('\u2B50 SUPERSTAR ENERGY UNLOCKED! \u2B50', canvas.width / 2, 190);

        ctx.fillStyle = '#FFF';
        ctx.font = '20px Arial';
        ctx.fillText('Final Score: ' + Game.score, canvas.width / 2, 260);
        ctx.fillText('Stars: ' + Game.starsCollected, canvas.width / 2, 295);

        var tokens = Game.musicTokens.filter(function(t) { return t; }).length;
        ctx.fillText('Secret Tracks: ' + tokens + '/3', canvas.width / 2, 330);

        ctx.fillStyle = '#FFB6C1';
        ctx.font = '18px Arial';
        ctx.fillText('Press ENTER to play again', canvas.width / 2, 400);
    },

    // ----- Button helper -----
    _drawButton: function(ctx, x, y, w, h, text, primary) {
        var grad = ctx.createLinearGradient(x, y, x, y + h);
        if (primary) {
            grad.addColorStop(0, '#FF69B4');
            grad.addColorStop(1, '#9B30FF');
        } else {
            grad.addColorStop(0, 'rgba(255,105,180,0.4)');
            grad.addColorStop(1, 'rgba(155,48,255,0.4)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        var r = 8;
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
        ctx.fill();

        // Border glow
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.font = primary ? 'bold 22px Arial' : '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + w / 2, y + h / 2);
        ctx.textBaseline = 'alphabetic';
    }
};
