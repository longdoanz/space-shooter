/* =====================================================
   🔫 LASERS & WEAPONS SYSTEM (js/lasers.js)
   5 Signature Player Weapon Archetypes:
   - 🚀 Plasma Vulcan (Multi-spread rapid machinegun)
   - ⚡ Tesla Lightning (Auto-seeking electric bolts)
   - 💥 Antimatter Cannon (Heavy AoE shockwave explosions)
   - 🔮 Quantum Prism Beam (Continuous piercing death ray)
   - 🌀 Vortex Blade (Boomerang spinning razor discs!)
   ===================================================== */

'use strict';

let lasers = [];

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
    archetype: archetype, // 'plasma' | 'homing' | 'explosive' | 'piercing' | 'vortex'
    damage: damage,
    pierceCount: extra.pierceCount || 1,
    radius: extra.radius || 3,
    aoeRadius: extra.aoeRadius || 0,
    target: null,
    angle: 0,
    spinSpeed: extra.spinSpeed || 0.2,
    isReturning: false,
    life: extra.life || 140,
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
    type: type, // 'standard' | 'cluster' | 'sniper'
    fuse: type === 'cluster' ? 60 : 0,
  };
}

// ─────────────────────────────────────────────────────
//  Update Lasers & Projectile Physics
// ─────────────────────────────────────────────────────
function updateLasers(canvasWidth, canvasHeight, enemiesList = [], bossRef = null, playerX = 0, playerY = 0) {
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];

    // ⚡ Tesla Lightning Auto-Seeking
    if (laser.fromPlayer && laser.archetype === 'homing') {
      if (!laser.target || laser.target.hp <= 0 || laser.target.isDying) {
        let nearestDist = 999999;
        let bestTarget = null;

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

      if (laser.target) {
        const tx = laser.target.x + (laser.target.width || 40) / 2;
        const ty = laser.target.y + (laser.target.height || 40) / 2;
        const angle = Math.atan2(ty - laser.y, tx - laser.x);
        const steerSpeed = 10;
        laser.speedX = laser.speedX * 0.8 + Math.cos(angle) * steerSpeed * 0.2;
        laser.speedY = laser.speedY * 0.8 + Math.sin(angle) * steerSpeed * 0.2;
      }
    }

    // 🌀 Vortex Blade Boomerang Physics
    if (laser.fromPlayer && laser.archetype === 'vortex') {
      laser.angle += laser.spinSpeed;
      laser.life--;
      if (laser.y < 90 && !laser.isReturning) {
        laser.isReturning = true;
      }
      if (laser.isReturning) {
        // Curve and return toward player!
        const angleToPlayer = Math.atan2(playerY - laser.y, playerX - laser.x);
        laser.speedX = laser.speedX * 0.9 + Math.cos(angleToPlayer) * 7.5 * 0.1;
        laser.speedY = laser.speedY * 0.9 + Math.sin(angleToPlayer) * 7.5 * 0.1;
      }
    }

    laser.x += laser.speedX;
    laser.y += laser.speedY;

    // 💣 Alien Cluster Bomb Split
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

    // Cleanup off screen
    if (laser.y < -50 || laser.y > canvasHeight + 50 || laser.x < -50 || laser.x > canvasWidth + 50 || laser.life <= 0) {
      lasers.splice(i, 1);
    }
  }
}

// ─────────────────────────────────────────────────────
//  Draw Lasers with Unique Visual Identities
// ─────────────────────────────────────────────────────
function drawLasers(ctx) {
  for (const laser of lasers) {
    ctx.save();
    ctx.shadowBlur  = 14;
    ctx.shadowColor = laser.color;

    if (laser.fromPlayer) {
      if (laser.archetype === 'plasma') {
        // High-velocity plasma slug
        const grad = ctx.createLinearGradient(laser.x, laser.y, laser.x, laser.y + laser.height);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, laser.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height, laser.width / 2);
        ctx.fill();
      } 
      else if (laser.archetype === 'homing') {
        // Tesla Lightning orb with crackling corona
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      else if (laser.archetype === 'explosive') {
        // Antimatter Missile / Heavy explosive sphere
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, laser.radius || 7, 0, Math.PI * 2);
        const radGrad = ctx.createRadialGradient(laser.x, laser.y, 1, laser.x, laser.y, laser.radius || 7);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.5, laser.color);
        radGrad.addColorStop(1, '#ff8800');
        ctx.fillStyle = radGrad;
        ctx.fill();
      }
      else if (laser.archetype === 'piercing') {
        // Piercing Quantum Prism Death Ray
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(laser.x - laser.width / 2 + 1, laser.y, laser.width - 2, laser.height);
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
      }
      else if (laser.archetype === 'vortex') {
        // 🌀 Spinning Emerald Blade
        ctx.translate(laser.x, laser.y);
        ctx.rotate(laser.angle || 0);

        ctx.fillStyle = laser.color;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // 4 Blade points
        for (let b = 0; b < 4; b++) {
          ctx.rotate(Math.PI / 2);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(0, -12);
          ctx.lineTo(4, -4);
          ctx.lineTo(-4, -4);
          ctx.closePath();
          ctx.fill();
        }
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
