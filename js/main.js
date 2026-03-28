// ============================================================
// main.js - Game loop, initialization, glue code
// ============================================================

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

// Initialize game
Game.init();

// ----- Main game loop -----
var lastTime = 0;

function gameLoop(timestamp) {
    var dt = (timestamp - lastTime) / 1000;
    if (dt > 0.05) dt = 0.05; // cap delta for tab-away
    lastTime = timestamp;

    // Update
    Game.update(dt);

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (Game.state) {
        case 'menu':
            Render.drawMenu(ctx);
            break;

        case 'playing':
        case 'paused':
            // Draw game world
            Render.drawBackground(ctx, Game.camera);
            Render.drawPlatforms(ctx, Game.camera);
            Render.drawCollectibles(ctx, Game.camera);
            Render.drawEnemies(ctx, Game.camera);
            Render.drawPortal(ctx, Game.camera);
            Player.draw(ctx, Game.camera);
            Game.drawParticles(ctx, Game.camera);
            Render.drawHUD(ctx);
            if (Game.state === 'paused') {
                Render.drawPaused(ctx);
            }
            break;

        case 'levelComplete':
            Render.drawBackground(ctx, Game.camera);
            Render.drawPlatforms(ctx, Game.camera);
            Player.draw(ctx, Game.camera);
            Game.drawParticles(ctx, Game.camera);
            Render.drawLevelComplete(ctx);
            break;

        case 'gameOver':
            Render.drawBackground(ctx, Game.camera);
            Render.drawPlatforms(ctx, Game.camera);
            Render.drawGameOver(ctx);
            break;

        case 'victory':
            Render.drawVictory(ctx);
            break;
    }

    // Keep frameCount ticking for animations even when not 'playing'
    if (Game.state !== 'playing') {
        Game.frameCount++;
    }

    requestAnimationFrame(gameLoop);
}

// Start the loop
requestAnimationFrame(gameLoop);
