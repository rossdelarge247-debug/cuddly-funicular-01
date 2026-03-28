// ============================================================
// level3.js - "Star Stage Showdown" - Level 3 (Finale!)
// ============================================================

LevelData.levels.push({
    name: "Star Stage Showdown",
    width: 6000,
    bgColor1: '#2D0A4E',
    bgColor2: '#0A001A',
    portalX: 5800,
    platforms: [
        // Stage floor segments
        { x: 0, y: 470, width: 500, height: 70, color: '#4A0E6B', type: 'solid' },
        { x: 600, y: 470, width: 350, height: 70, color: '#4A0E6B', type: 'solid' },
        { x: 1050, y: 450, width: 400, height: 90, color: '#4A0E6B', type: 'solid' },
        { x: 1600, y: 470, width: 300, height: 70, color: '#4A0E6B', type: 'solid' },
        { x: 2050, y: 440, width: 350, height: 100, color: '#4A0E6B', type: 'solid' },
        { x: 2550, y: 470, width: 280, height: 70, color: '#4A0E6B', type: 'solid' },
        { x: 2950, y: 450, width: 320, height: 90, color: '#4A0E6B', type: 'solid' },
        { x: 3400, y: 470, width: 250, height: 70, color: '#4A0E6B', type: 'solid' },
        { x: 3800, y: 440, width: 380, height: 100, color: '#4A0E6B', type: 'solid' },
        { x: 4350, y: 460, width: 300, height: 80, color: '#4A0E6B', type: 'solid' },
        { x: 4800, y: 470, width: 250, height: 70, color: '#4A0E6B', type: 'solid' },
        { x: 5200, y: 450, width: 800, height: 90, color: '#4A0E6B', type: 'solid' },

        // Speaker platforms (wider, themed)
        { x: 520, y: 370, width: 70, height: 18, color: '#8B00FF', type: 'solid' },
        { x: 980, y: 340, width: 60, height: 18, color: '#FF1493', type: 'solid' },
        { x: 1480, y: 360, width: 80, height: 18, color: '#8B00FF', type: 'solid' },
        { x: 1950, y: 330, width: 70, height: 18, color: '#FF1493', type: 'solid' },
        { x: 2450, y: 360, width: 80, height: 18, color: '#8B00FF', type: 'solid' },
        { x: 2870, y: 340, width: 70, height: 18, color: '#FF1493', type: 'solid' },
        { x: 3320, y: 370, width: 70, height: 18, color: '#8B00FF', type: 'solid' },
        { x: 3720, y: 330, width: 80, height: 18, color: '#FF1493', type: 'solid' },
        { x: 4280, y: 350, width: 60, height: 18, color: '#8B00FF', type: 'solid' },
        { x: 4720, y: 370, width: 70, height: 18, color: '#FF1493', type: 'solid' },

        // Moving platforms - more of them!
        { x: 1450, y: 280, width: 80, height: 14, color: '#FFFF00', type: 'moving',
          moveAxis: 'x', moveMin: 1400, moveMax: 1600, moveSpeed: 1.5 },
        { x: 2400, y: 260, width: 80, height: 14, color: '#FFFF00', type: 'moving',
          moveAxis: 'y', moveMin: 240, moveMax: 380, moveSpeed: 1.0 },
        { x: 3650, y: 260, width: 80, height: 14, color: '#FFFF00', type: 'moving',
          moveAxis: 'x', moveMin: 3600, moveMax: 3800, moveSpeed: 1.8 },
        { x: 5100, y: 300, width: 90, height: 14, color: '#FFFF00', type: 'moving',
          moveAxis: 'y', moveMin: 280, moveMax: 420, moveSpeed: 0.9 },

        // Breakable platforms
        { x: 750, y: 380, width: 70, height: 14, color: '#FF6347', type: 'breakable', breakTimer: 0 },
        { x: 2200, y: 350, width: 70, height: 14, color: '#FF6347', type: 'breakable', breakTimer: 0 },
        { x: 3550, y: 380, width: 70, height: 14, color: '#FF6347', type: 'breakable', breakTimer: 0 },
        { x: 4600, y: 360, width: 70, height: 14, color: '#FF6347', type: 'breakable', breakTimer: 0 },

        // High secret area
        { x: 3000, y: 220, width: 60, height: 14, color: '#FFD700', type: 'solid' },
        { x: 3150, y: 180, width: 60, height: 14, color: '#FFD700', type: 'solid' },
        { x: 3050, y: 130, width: 80, height: 14, color: '#FFD700', type: 'solid' },

        // Final stage platforms (ascending to the grand portal)
        { x: 5300, y: 380, width: 80, height: 16, color: '#FFD700', type: 'solid' },
        { x: 5450, y: 330, width: 80, height: 16, color: '#FFD700', type: 'solid' },
        { x: 5600, y: 280, width: 100, height: 16, color: '#FFD700', type: 'solid' },
    ],
    collectibles: [
        // Stars - lots of them for the finale!
        { x: 250, y: 440, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 540, y: 340, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 700, y: 440, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1000, y: 310, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1200, y: 420, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1500, y: 330, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1700, y: 440, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1970, y: 300, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 2150, y: 410, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 2470, y: 330, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 2650, y: 440, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 2890, y: 310, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3050, y: 420, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3340, y: 340, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3500, y: 440, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3740, y: 300, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3950, y: 410, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 4150, y: 430, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 4300, y: 320, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 4500, y: 430, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 4740, y: 340, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 4950, y: 440, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 5350, y: 350, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 5500, y: 300, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 5650, y: 250, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },

        // Music notes
        { x: 850, y: 440, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },
        { x: 1850, y: 440, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },
        { x: 2750, y: 440, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },
        { x: 3900, y: 410, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },
        { x: 5100, y: 420, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },

        // Hearts (2 for the harder level)
        { x: 1500, y: 250, width: 20, height: 20, type: 'heart', value: 0, color: '#FF4444' },
        { x: 4300, y: 320, width: 20, height: 20, type: 'heart', value: 0, color: '#FF4444' },

        // Hidden music token
        { x: 3070, y: 100, width: 24, height: 24, type: 'musicToken', value: 500, color: '#FF69B4' },
    ],
    enemies: [
        // Bouncers
        { x: 350, y: 438, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
          bounceSpeed: 0.08, baseY: 438, bounceHeight: 35, animFrame: 0 },
        { x: 1150, y: 418, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
          bounceSpeed: 0.06, baseY: 418, bounceHeight: 30, animFrame: 0 },
        { x: 2650, y: 438, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
          bounceSpeed: 0.07, baseY: 438, bounceHeight: 25, animFrame: 0 },
        { x: 4900, y: 438, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
          bounceSpeed: 0.09, baseY: 438, bounceHeight: 30, animFrame: 0 },

        // Pacers
        { x: 700, y: 438, width: 36, height: 32, type: 'pacer', alive: true, points: 200,
          vx: 2.5, minX: 610, maxX: 930, facing: 1, animFrame: 0 },
        { x: 2100, y: 408, width: 36, height: 32, type: 'pacer', alive: true, points: 200,
          vx: 2, minX: 2060, maxX: 2370, facing: 1, animFrame: 0 },
        { x: 3450, y: 438, width: 36, height: 32, type: 'pacer', alive: true, points: 200,
          vx: 2.8, minX: 3410, maxX: 3630, facing: 1, animFrame: 0 },
        { x: 5300, y: 418, width: 36, height: 32, type: 'pacer', alive: true, points: 200,
          vx: 1.5, minX: 5210, maxX: 5500, facing: 1, animFrame: 0 },

        // Floaters - more of them in the finale
        { x: 900, y: 340, width: 28, height: 28, type: 'floater', alive: true, points: 150,
          baseY: 340, amplitude: 45, speed: 0.025, phase: 0, vx: 1, minX: 850, maxX: 1100, animFrame: 0 },
        { x: 1800, y: 320, width: 28, height: 28, type: 'floater', alive: true, points: 150,
          baseY: 320, amplitude: 35, speed: 0.02, phase: 2, vx: 0.8, minX: 1750, maxX: 1950, animFrame: 0 },
        { x: 3200, y: 310, width: 28, height: 28, type: 'floater', alive: true, points: 150,
          baseY: 310, amplitude: 50, speed: 0.03, phase: 1, vx: 1.2, minX: 3100, maxX: 3400, animFrame: 0 },
    ],
    buildings: [
        // Stage backdrop - speakers and stage structures
        { x: 50, h: 350, w: 100, color: '#1A0530' },
        { x: 250, h: 420, w: 120, color: '#15042A' },
        { x: 500, h: 300, w: 90, color: '#1A0530' },
        { x: 750, h: 380, w: 110, color: '#15042A' },
        { x: 1000, h: 350, w: 95, color: '#1A0530' },
        { x: 1300, h: 440, w: 130, color: '#15042A' },
        { x: 1600, h: 320, w: 85, color: '#1A0530' },
        { x: 1850, h: 400, w: 115, color: '#15042A' },
        { x: 2150, h: 360, w: 100, color: '#1A0530' },
        { x: 2450, h: 430, w: 120, color: '#15042A' },
        { x: 2750, h: 310, w: 80, color: '#1A0530' },
        { x: 3000, h: 390, w: 110, color: '#15042A' },
        { x: 3300, h: 350, w: 95, color: '#1A0530' },
        { x: 3600, h: 420, w: 115, color: '#15042A' },
        { x: 3900, h: 340, w: 90, color: '#1A0530' },
        { x: 4200, h: 410, w: 120, color: '#15042A' },
        { x: 4500, h: 300, w: 85, color: '#1A0530' },
        { x: 4800, h: 380, w: 100, color: '#15042A' },
        { x: 5100, h: 450, w: 140, color: '#1A0530' },
    ],
    // Spotlights for stage feel
    spotlights: [
        { x: 300, color: '#FF69B4' },
        { x: 900, color: '#00FFFF' },
        { x: 1500, color: '#FFD700' },
        { x: 2100, color: '#FF69B4' },
        { x: 2700, color: '#00FFFF' },
        { x: 3300, color: '#FFD700' },
        { x: 3900, color: '#FF69B4' },
        { x: 4500, color: '#00FFFF' },
        { x: 5100, color: '#FFD700' },
        { x: 5700, color: '#FF69B4' },
    ],
});
