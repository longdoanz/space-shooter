/* =====================================================
   ⭐ POWER-UPS & CAPSULES MODULE (js/powerups.js)
   Spawns floating power-ups including:
   - ⭐ WEAPON UPGRADE (Permanently levels up your weapons Lv1→Lv5!)
   - ⚡ CLASS MODULE (Switch between ship characters in battle!)
   - 🛡️ SHIELD FORCEFIELD
   - ⚡ SPEED BOOST
   - ❤️ EXTRA LIFE
   ===================================================== */

'use strict';

let powerups = [];

const POWERUP_TYPES = [
  { id: 'weapon', name: 'WEAPON UPGRADE!', color: '#ffea00', symbol: '⭐' },
  { id: 'weapon', name: 'WEAPON UPGRADE!', color: '#ffea00', symbol: '⭐' }, // Higher weight
  { id: 'shield', name: 'SHIELD!',         color: '#00ffff', symbol: '🛡️' },
  { id: 'speed',  name: 'SPEED BOOST!',    color: '#ff9900', symbol: '⚡' },
  { id: 'life',   name: 'EXTRA LIFE!',     color: '#ff3366', symbol: '❤️' },
  { id: 'class',  name: 'CLASS MODULE!',   color: '#00ff88', symbol: '💠' },
];

function maybeDropPowerup(x, y, force = false, specificType = null) {
  if (force || Math.random() < 0.35) {
    const selected = specificType 
      ? POWERUP_TYPES.find(p => p.id === specificType) || POWERUP_TYPES[0]
      : POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];

    powerups.push({
      type: selected.id,
      name: selected.name,
      color: selected.color,
      symbol: selected.symbol,
      x: x,
      y: y,
      width: 28,
      height: 28,
      speedY: 1.3,
      bobTimer: Math.random() * 10,
    });
  }
}

function updatePowerups(canvasHeight) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.speedY;
    p.bobTimer += 0.08;

    if (p.y > canvasHeight + 40) {
      powerups.splice(i, 1);
    }
  }
}

function drawPowerups(ctx) {
  for (const p of powerups) {
    ctx.save();
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2 + Math.sin(p.bobTimer) * 3;

    ctx.shadowBlur = 14;
    ctx.shadowColor = p.color;

    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 16, 32, 0.9)';
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();

    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.symbol, cx, cy + 1);

    ctx.restore();
  }
}
