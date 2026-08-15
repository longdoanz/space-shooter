/* =====================================================
   ⭐ POWER-UPS & WEAPON REWARDS MODULE (js/powerups.js)
   Rewards:
   - [P] Plasma Vulcan Weapon Capsule
   - [L] Tesla Lightning Weapon Capsule
   - [R] Antimatter Rocket Weapon Capsule
   - [Q] Quantum Death Ray Weapon Capsule
   - [V] Vortex Razor Blade Weapon Capsule
   - [★] Weapon Level Upgrade (+1 Tier!)
   - [🛡️] Shield Forcefield
   - [❤️] Extra Heart
   - [⚡] Speed Boost
   ===================================================== */

'use strict';

let powerups = [];

const POWERUP_TYPES = [
  // ⭐ Level Upgrade
  { id: 'upgrade',          name: 'WEAPON UPGRADE!',   color: '#ffea00', symbol: '★', isWeapon: false },
  { id: 'upgrade',          name: 'WEAPON UPGRADE!',   color: '#ffea00', symbol: '★', isWeapon: false },

  // 🔫 Weapon Switch Capsules!
  { id: 'weapon_plasma',    name: 'PLASMA VULCAN!',    color: '#00eaff', symbol: 'P', isWeapon: true, weaponType: 'plasma' },
  { id: 'weapon_homing',    name: 'TESLA LIGHTNING!',  color: '#ffdd00', symbol: 'L', isWeapon: true, weaponType: 'homing' },
  { id: 'weapon_explosive', name: 'ANTIMATTER BOMB!',  color: '#ff3344', symbol: 'R', isWeapon: true, weaponType: 'explosive' },
  { id: 'weapon_piercing',  name: 'QUANTUM DEATH RAY!',color: '#00ff88', symbol: 'Q', isWeapon: true, weaponType: 'piercing' },
  { id: 'weapon_vortex',    name: 'VORTEX RAZOR!',     color: '#a020f0', symbol: 'V', isWeapon: true, weaponType: 'vortex' },

  // 🛡️ Defenses & Utility
  { id: 'shield',           name: 'SHIELD ACTIVE!',    color: '#00ffff', symbol: '🛡️', isWeapon: false },
  { id: 'life',             name: 'EXTRA HEART!',      color: '#ff3366', symbol: '❤️', isWeapon: false },
  { id: 'speed',            name: 'SPEED OVERDRIVE!',  color: '#ff9900', symbol: '⚡', isWeapon: false },
];

function maybeDropPowerup(x, y, force = false, specificId = null) {
  if (force || Math.random() < 0.38) {
    const selected = specificId 
      ? POWERUP_TYPES.find(p => p.id === specificId) || POWERUP_TYPES[0]
      : POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];

    powerups.push({
      type: selected.id,
      name: selected.name,
      color: selected.color,
      symbol: selected.symbol,
      isWeapon: selected.isWeapon,
      weaponType: selected.weaponType || null,
      x: x,
      y: y,
      width: 30,
      height: 30,
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

    ctx.shadowBlur = 16;
    ctx.shadowColor = p.color;

    // Glowing Pill / Capsule
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 12, 28, 0.92)';
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2.8;
    ctx.fill();
    ctx.stroke();

    // Icon / Letter inside capsule
    if (p.isWeapon) {
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, cx, cy + 1);
    } else {
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, cx, cy + 1);
    }

    ctx.restore();
  }
}
