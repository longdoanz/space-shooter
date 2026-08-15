/* =====================================================
   🔫 LASERS & WEAPONS SYSTEM (js/lasers.js)
   🚀 High-Performance Optimized (No costly shadowBlur lag!)
   5 Signature Player Weapon Archetypes:
   - 🚀 Plasma Vulcan (Multi-spread rapid machinegun)
   - ⚡ Tesla Lightning (Auto-seeking electric bolts)
   - 💥 Antimatter Cannon (Heavy AoE shockwave explosions)
   - 🔮 Quantum Prism Beam (Continuous piercing death ray)
   - 🌀 Vortex Blade (Boomerang spinning razor discs!)
   ===================================================== */

'use strict';

let lasers = [];
const MAX_LASERS = 50; // Cap to prevent any projectile buildup

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
    archetype: archetype,
    damage: damage,
    pierceCount: extra.pierceCount || 1,
    radius: extra.radius || 3,
    aoeRadius: extra.aoeRadius || 0,
    target: null,
    targetSearchTimer: 0,
    angle: 0,
    spinSpeed: extra.spinSpeed || 0.25,
    isReturning: false,
    life: extra.life || 110,
  };
}

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
    type: type,
    fuse: type === 'cluster' ? 55 : 0,
  };
}

// ─────────────────────────────────────────────────────
//  Update Lasers (Optimized Homing & Smooth Boomerang)
// ─────────────────────────────────────────────────────
function updateLasers(canvasWidth, canvasHeight, enemiesList = [], bossRef = null, playerX = 0, playerY = 0) {
  // Cap active bullets if needed
  if (lasers.length > MAX_LASERS) {
    lasers.splice(0, lasers.length - MAX_LASERS);
  }

  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];

    // ⚡ Tesla Lightning: Optimized Homing (re-target every 4 frames)
    if (laser.fromPlayer && laser.archetype === 'homing') {
      laser.targetSearchTimer = (laser.targetSearchTimer || 0) + 1;
      if (laser.targetSearchTimer % 4 === 0 || !laser.target || laser.target.hp <= 0) {
        let nearestDist = 999999;
        let bestTarget = null;

        if (bossRef && bossRef.active && !bossRef.isDying) {
          bestTarget = bossRef;
        } else {
          for (let eIdx = 0; eIdx < enemiesList.length; eIdx++) {
            const enemy = enemiesList[eIdx];
            if (enemy.hp > 0) {
              const dx = (enemy.x + enemy.width / 2) - laser.x;
              const dy = (enemy.y + enemy.height / 2) - laser.y;
              const distSq = dx * dx + dy * dy;
              if (distSq < nearestDist) {
                nearestDist = distSq;
                bestTarget = enemy;
              }
            }
          }
        }
        laser.target = bestTarget;
      }

      if (laser.target) {
        const tx = laser.target.x + (laser.target.width || 40) / 2;
        const ty = laser.target.y + (laser.target.height || 40) / 2;
        const angle = Math.atan2(ty - laser.y, tx - laser.x);
        laser.speedX = laser.speedX * 0.78 + Math.cos(angle) * 2.8;
        laser.speedY = laser.speedY * 0.78 + Math.sin(angle) * 2.8;
      }
    }

    // 🌀 Vortex Blade: Smooth Boomerang Fallback Physics
    if (laser.fromPlayer && laser.archetype === 'vortex') {
      laser.angle += laser.spinSpeed;
      laser.life--;

      if (laser.y < 80 && !laser.isReturning) {
        laser.isReturning = true;
      }

      if (laser.isReturning) {
        // Curve smoothly back down towards player
        const dx = playerX - laser.x;
        const dy = playerY - laser.y;
        const distToPlayer = Math.hypot(dx, dy);

        // Despawn cleanly when returning close to player or reaching bottom
        if (distToPlayer < 35 || laser.y > canvasHeight - 20) {
          lasers.splice(i, 1);
          continue;
        }

        const angleToPlayer = Math.atan2(dy, dx);
        laser.speedX = laser.speedX * 0.88 + Math.cos(angleToPlayer) * 1.5;
        laser.speedY = laser.speedY * 0.88 + Math.sin(angleToPlayer) * 1.5;
      }
    }

    laser.x += laser.speedX;
    laser.y += laser.speedY;

    // 💣 Alien Cluster Bomb Split
    if (laser.type === 'cluster') {
      laser.fuse--;
      if (laser.fuse <= 0) {
        createExplosion(laser.x, laser.y, '#ff4400', 8);
        playSound('explosion');
        lasers.push(makeEnemyLaser(laser.x, laser.y, -1.6, 3.8, '#ffaa00', 0.8, 'standard'));
        lasers.push(makeEnemyLaser(laser.x, laser.y,  0,   4.2, '#ffaa00', 0.8, 'standard'));
        lasers.push(makeEnemyLaser(laser.x, laser.y,  1.6, 3.8, '#ffaa00', 0.8, 'standard'));
        lasers.splice(i, 1);
        continue;
      }
    }

    // Boundary & lifetime cleanup
    if (laser.y < -40 || laser.y > canvasHeight + 40 || laser.x < -40 || laser.x > canvasWidth + 40 || laser.life <= 0) {
      lasers.splice(i, 1);
    }
  }
}

// ─────────────────────────────────────────────────────
//  Draw Lasers (High-Performance Vector Graphics)
// ─────────────────────────────────────────────────────
function drawLasers(ctx) {
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i];

    if (laser.fromPlayer) {
      if (laser.archetype === 'plasma') {
        // Crisp dual-tone plasma bullet
        ctx.fillStyle = laser.color;
        ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(laser.x - laser.width / 4, laser.y + 2, laser.width / 2, laser.height - 4);
      } 
      else if (laser.archetype === 'homing') {
        // Tesla Lightning orb with outer halo
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = laser.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      else if (laser.archetype === 'explosive') {
        // Heavy explosive projectile
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, laser.radius || 7, 0, Math.PI * 2);
        ctx.fillStyle = laser.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(laser.x, laser.y, (laser.radius || 7) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      else if (laser.archetype === 'piercing') {
        // Quantum Prism Laser Beam
        ctx.fillStyle = laser.color;
        ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(laser.x - laser.width / 4, laser.y, laser.width / 2, laser.height);
      }
      else if (laser.archetype === 'vortex') {
        // 🌀 Fast Spinning Vortex Disc
        ctx.save();
        ctx.translate(laser.x, laser.y);
        ctx.rotate(laser.angle || 0);

        ctx.fillStyle = laser.color;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-9, -2, 18, 4);
        ctx.fillRect(-2, -9, 4, 18);
        ctx.restore();
      }
    } 
    else {
      // Enemy Bullets
      if (laser.type === 'cluster') {
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ff2200';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
      } else {
        ctx.fillStyle = laser.color;
        ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(laser.x - laser.width / 4, laser.y + 2, laser.width / 2, laser.height - 4);
      }
    }
  }
}
