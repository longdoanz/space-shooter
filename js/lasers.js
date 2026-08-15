/* =====================================================
   🔫 LASERS & WEAPONS SYSTEM (js/lasers.js)
   Supports Player Weapon Archetypes & Enemy Projectiles:
   - 🚀 Plasma Blasters (Spread bullets)
   - ⚡ Homing Lightning (Intelligent auto-seeking)
   - 💥 Explosive Cannon (AoE blast radius)
   - 🔮 Piercing Laser (Penetrates through multiple aliens)
   - 💣 Alien Cluster Bombs & Boss Projectiles
   ===================================================== */

'use strict';

let lasers = [];

// ─────────────────────────────────────────────────────
//  Player Laser Constructors
// ─────────────────────────────────────────────────────
function makePlayerLaser(x, y, speedX, speedY, archetype, damage, color, extra = {}) {
  return {
    x: x,
    y: y,
    width: extra.width || 5,
    height: extra.height || 16,
    speedX: speedX,
    speedY: speedY,
    color: color,
    fromPlayer: true,
    damage: damage,
    archetype: archetype, // 'plasma' | 'homing' | 'explosive' | 'piercing'
    pierceCount: extra.pierceCount || 1, // How many enemies it can hit before vanishing
    radius: extra.radius || 3,
    aoeRadius: extra.aoeRadius || 0, // Area of effect explosion radius on hit
    target: null, // Used for homing missiles/lightning
    life: extra.life || 120,
  };
}

// ─────────────────────────────────────────────────────
//  Enemy Laser Constructor
// ─────────────────────────────────────────────────────
function makeEnemyLaser(x, y, speedX, speedY, color = '#ff3344', size = 1, type = 'standard') {
  return {
    x: x,
    y: y,
    width: 5 * size,
    height: 14 * size,
    speedX: speedX,
    speedY: speedY,
    color: color,
    fromPlayer: false,
    type: type, // 'standard' | 'cluster' | 'sniper'
    fuse: type === 'cluster' ? 60 : 0,
  };
}

// ─────────────────────────────────────────────────────
//  Update Lasers & Physics (Homing, Piercing, Cluster)
// ─────────────────────────────────────────────────────
function updateLasers(canvasWidth, canvasHeight, enemiesList = [], bossRef = null) {
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];

    // ⚡ Intelligent Auto-Targeting for Homing Lightning
    if (laser.fromPlayer && laser.archetype === 'homing') {
      // Find nearest living target if no target or target died
      if (!laser.target || laser.target.hp <= 0 || (laser.target.isDying)) {
        let nearestDist = 999999;
        let bestTarget = null;

        // Check boss first if active
        if (bossRef && bossRef.active && !bossRef.isDying) {
          bestTarget = bossRef;
        } else {
          for (const enemy of enemiesList) {
            if (enemy.hp > 0) {
              const dist = Math.hypot(enemy.x + enemy.width / 2 - laser.x, enemy.y + enemy.height / 2 - laser.y);
              if (dist < nearestDist) {
                nearestDist = dist;
                bestTarget = enemy;
              }
            }
          }
        }
        laser.target = bestTarget;
      }

      // Steer toward target
      if (laser.target) {
        const tx = laser.target.x + (laser.target.width || 40) / 2;
        const ty = laser.target.y + (laser.target.height || 40) / 2;
        const angle = Math.atan2(ty - laser.y, tx - laser.x);
        const steerSpeed = 10;
        laser.speedX = laser.speedX * 0.8 + Math.cos(angle) * steerSpeed * 0.2;
        laser.speedY = laser.speedY * 0.8 + Math.sin(angle) * steerSpeed * 0.2;
      }
    }

    laser.x += laser.speedX;
    laser.y += laser.speedY;

    // 💣 Alien Cluster Bomb Explosion
    if (laser.type === 'cluster') {
      laser.fuse--;
      if (laser.fuse <= 0) {
        createExplosion(laser.x, laser.y, '#ff4400', 12);
        playSound('explosion');
        lasers.push(makeEnemyLaser(laser.x, laser.y, -1.8, 4.0, '#ffaa00', 0.8, 'standard'));
        lasers.push(makeEnemyLaser(laser.x, laser.y,  0,   4.5, '#ffaa00', 0.8, 'standard'));
        lasers.push(makeEnemyLaser(laser.x, laser.y,  1.8, 4.0, '#ffaa00', 0.8, 'standard'));
        lasers.splice(i, 1);
        continue;
      }
    }

    // Out of bounds cleanup
    if (laser.y < -40 || laser.y > canvasHeight + 40 || laser.x < -40 || laser.x > canvasWidth + 40) {
      lasers.splice(i, 1);
    }
  }
}

// ─────────────────────────────────────────────────────
//  Draw Lasers by Archetype
// ─────────────────────────────────────────────────────
function drawLasers(ctx) {
  for (const laser of lasers) {
    ctx.save();
    ctx.shadowBlur  = 12;
    ctx.shadowColor = laser.color;

    if (laser.fromPlayer) {
      if (laser.archetype === 'plasma') {
        // Glowing round-rect plasma bolt
        const grad = ctx.createLinearGradient(laser.x, laser.y, laser.x, laser.y + laser.height);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, laser.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height, laser.width / 2);
        ctx.fill();
      } 
      else if (laser.archetype === 'homing') {
        // Electric Lightning Bolt / Energy Missile
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      else if (laser.archetype === 'explosive') {
        // Heavy Glowing Photon Sphere
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, laser.radius || 7, 0, Math.PI * 2);
        const radGrad = ctx.createRadialGradient(laser.x, laser.y, 1, laser.x, laser.y, laser.radius || 7);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.5, laser.color);
        radGrad.addColorStop(1, '#660000');
        ctx.fillStyle = radGrad;
        ctx.fill();
      }
      else if (laser.archetype === 'piercing') {
        // Ultra-bright Quantum Laser Prism Beam
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(laser.x - laser.width / 2 + 1, laser.y, laser.width - 2, laser.height);
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
      }
    } 
    else {
      // Enemy Lasers
      if (laser.type === 'cluster') {
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ff2200';
        ctx.fill();
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        const grad = ctx.createLinearGradient(laser.x, laser.y, laser.x, laser.y + laser.height);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, laser.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height, laser.width / 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
