// ============================================================
// level2.js - "Neon Rooftops" - Level 2
// ============================================================

LevelData.levels.push({
    name: "Neon Rooftops",
    width: 5400,
    bgColor1: '#0A0A2E',
    bgColor2: '#1A0533',
    portalX: 5200,
    platforms: [
        // Rooftop ground segments - higher up, more gaps
        { x: 0, y: 460, width: 400, height: 80, color: '#2A1A4A', type: 'solid' },
        { x: 500, y: 420, width: 300, height: 120, color: '#2A1A4A', type: 'solid' },
        { x: 900, y: 440, width: 250, height: 100, color: '#2A1A4A', type: 'solid' },
        { x: 1300, y: 400, width: 350, height: 140, color: '#2A1A4A', type: 'solid' },
        { x: 1800, y: 450, width: 280, height: 90, color: '#2A1A4A', type: 'solid' },
        { x: 2250, y: 420, width: 300, height: 120, color: '#2A1A4A', type: 'solid' },
        { x: 2700, y: 460, width: 250, height: 80, color: '#2A1A4A', type: 'solid' },
        { x: 3100, y: 430, width: 320, height: 110, color: '#2A1A4A', type: 'solid' },
        { x: 3550, y: 450, width: 280, height: 90, color: '#2A1A4A', type: 'solid' },
        { x: 3950, y: 410, width: 350, height: 130, color: '#2A1A4A', type: 'solid' },
        { x: 4450, y: 440, width: 300, height: 100, color: '#2A1A4A', type: 'solid' },
        { x: 4900, y: 460, width: 500, height: 80, color: '#2A1A4A', type: 'solid' },

        // Floating neon platforms
        { x: 420, y: 360, width: 70, height: 14, color: '#00FFFF', type: 'solid' },
        { x: 820, y: 340, width: 70, height: 14, color: '#FF00FF', type: 'solid' },
        { x: 1180, y: 310, width: 80, height: 14, color: '#00FFFF', type: 'solid' },
        { x: 1700, y: 350, width: 80, height: 14, color: '#FF00FF', type: 'solid' },
        { x: 2120, y: 320, width: 70, height: 14, color: '#00FFFF', type: 'solid' },
        { x: 2600, y: 360, width: 80, height: 14, color: '#FF00FF', type: 'solid' },
        { x: 3020, y: 330, width: 70, height: 14, color: '#00FFFF', type: 'solid' },
        { x: 3460, y: 350, width: 80, height: 14, color: '#FF00FF', type: 'solid' },
        { x: 3880, y: 310, width: 70, height: 14, color: '#00FFFF', type: 'solid' },
        { x: 4380, y: 340, width: 80, height: 14, color: '#FF00FF', type: 'solid' },

        // Moving platforms
        { x: 1650, y: 300, width: 90, height: 14, color: '#FFFF00', type: 'moving',
          moveAxis: 'x', moveMin: 1600, moveMax: 1800, moveSpeed: 1.2 },
        { x: 2550, y: 280, width: 90, height: 14, color: '#FFFF00', type: 'moving',
          moveAxis: 'y', moveMin: 260, moveMax: 380, moveSpeed: 0.8 },
        { x: 4750, y: 340, width: 90, height: 14, color: '#FFFF00', type: 'moving',
          moveAxis: 'x', moveMin: 4700, moveMax: 4900, moveSpeed: 1.5 },

        // Secret upper area
        { x: 2300, y: 220, width: 60, height: 14, color: '#FFD700', type: 'solid' },
        { x: 2450, y: 180, width: 60, height: 14, color: '#FFD700', type: 'solid' },
        { x: 2350, y: 140, width: 80, height: 14, color: '#FFD700', type: 'solid' },
    ],
    collectibles: [
        // Stars scattered across rooftops
        { x: 200, y: 430, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 440, y: 330, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 600, y: 390, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 840, y: 310, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1000, y: 410, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1200, y: 280, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1450, y: 370, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1720, y: 320, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 1900, y: 420, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 2140, y: 290, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 2350, y: 390, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 2620, y: 330, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 2800, y: 430, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3040, y: 300, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3250, y: 400, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3480, y: 320, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3650, y: 420, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 3900, y: 280, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 4100, y: 380, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },
        { x: 4500, y: 410, width: 20, height: 20, type: 'star', value: 100, color: '#FFD700' },

        // Music notes
        { x: 700, y: 390, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },
        { x: 1900, y: 420, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },
        { x: 3200, y: 400, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },
        { x: 4600, y: 410, width: 20, height: 20, type: 'note', value: 250, color: '#FF69B4' },

        // Heart
        { x: 2560, y: 250, width: 20, height: 20, type: 'heart', value: 0, color: '#FF4444' },

        // Hidden music token (up in secret area)
        { x: 2370, y: 110, width: 24, height: 24, type: 'musicToken', value: 500, color: '#FF69B4' },
    ],
    enemies: [
        // Bouncers on rooftops
        { x: 550, y: 388, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
          bounceSpeed: 0.07, baseY: 388, bounceHeight: 30, animFrame: 0 },
        { x: 1400, y: 368, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
          bounceSpeed: 0.06, baseY: 368, bounceHeight: 25, animFrame: 0 },
        { x: 3200, y: 398, width: 32, height: 32, type: 'bouncer', alive: true, points: 200,
          bounceSpeed: 0.08, baseY: 398, bounceHeight: 28, animFrame: 0 },

        // Pacers
        { x: 1350, y: 368, width: 36, height: 32, type: 'pacer', alive: true, points: 200,
          vx: 2, minX: 1310, maxX: 1620, facing: 1, animFrame: 0 },
        { x: 3600, y: 418, width: 36, height: 32, type: 'pacer', alive: true, points: 200,
          vx: 2.5, minX: 3560, maxX: 3800, facing: 1, animFrame: 0 },
        { x: 4500, y: 408, width: 36, height: 32, type: 'pacer', alive: true, points: 200,
          vx: 1.8, minX: 4460, maxX: 4720, facing: 1, animFrame: 0 },

        // Floaters - new enemy type!
        { x: 1100, y: 320, width: 28, height: 28, type: 'floater', alive: true, points: 150,
          baseY: 320, amplitude: 40, speed: 0.02, phase: 0, vx: 0.8, minX: 1050, maxX: 1250, animFrame: 0 },
        { x: 2900, y: 350, width: 28, height: 28, type: 'floater', alive: true, points: 150,
          baseY: 350, amplitude: 50, speed: 0.025, phase: 1.5, vx: 1, minX: 2800, maxX: 3050, animFrame: 0 },
    ],
    buildings: [
        { x: 50, h: 320, w: 90, color: '#0D0D30' },
        { x: 200, h: 380, w: 110, color: '#0A0A25' },
        { x: 400, h: 280, w: 80, color: '#0D0D30' },
        { x: 600, h: 350, w: 100, color: '#0A0A25' },
        { x: 850, h: 300, w: 85, color: '#0D0D30' },
        { x: 1050, h: 400, w: 120, color: '#0A0A25' },
        { x: 1300, h: 260, w: 75, color: '#0D0D30' },
        { x: 1500, h: 340, w: 95, color: '#0A0A25' },
        { x: 1750, h: 370, w: 105, color: '#0D0D30' },
        { x: 2000, h: 290, w: 80, color: '#0A0A25' },
        { x: 2250, h: 360, w: 100, color: '#0D0D30' },
        { x: 2500, h: 310, w: 90, color: '#0A0A25' },
        { x: 2750, h: 380, w: 110, color: '#0D0D30' },
        { x: 3050, h: 270, w: 85, color: '#0A0A25' },
        { x: 3300, h: 350, w: 100, color: '#0D0D30' },
        { x: 3600, h: 400, w: 120, color: '#0A0A25' },
        { x: 3900, h: 300, w: 90, color: '#0D0D30' },
        { x: 4200, h: 370, w: 105, color: '#0A0A25' },
        { x: 4500, h: 330, w: 95, color: '#0D0D30' },
    ],
    // Neon signs for the city backdrop
    neonSigns: [
        { x: 230, y: 160, text: 'DANCE', color: '#FF00FF' },
        { x: 650, y: 200, text: 'STAR', color: '#00FFFF' },
        { x: 1100, y: 140, text: 'POP', color: '#FFFF00' },
        { x: 1550, y: 180, text: 'NEON', color: '#FF00FF' },
        { x: 2050, y: 160, text: 'GLOW', color: '#00FFFF' },
        { x: 2550, y: 200, text: 'BEAT', color: '#FF69B4' },
        { x: 3100, y: 150, text: 'VIBE', color: '#FFFF00' },
        { x: 3650, y: 190, text: 'SHINE', color: '#00FFFF' },
        { x: 4250, y: 170, text: 'K-POP', color: '#FF00FF' },
    ],
});
