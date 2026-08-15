/* =====================================================
   👾 ENEMIES MODULE (js/enemies.js)
   5 Unique Alien Archetypes with Multi-Level Scaling:
   - 🟢 Scout (Recon drone)
   - 🟠 Cruiser (Armored warship with twin lasers)
   - 🟣 Swarmer (Fast swooper with aimed shots)
   - 🔴 Bomber (Heavy gunship firing cluster bombs!)
   - ⚡ Phantom (Stealth cloaking infiltrator!)
   ===================================================== */

'use strict';

let enemies = [];
let pendingSpawns = []; // Queue for timed formation delays

function clearEnemies() {
  enemies = [];
  pendingSpawns = [];
}

function spawnEnemy(type, x, y, levelConfig = null) {
  const cfg = levelConfig || { speedMultiplier: 1.0, shootRateMultiplier: 1.0, bulletSpeedMultiplier: 1.0, level: 1 };

  const enemy = {
    type: type,
    x: x,
    y: y,
    startX: x,
    dirY: 1,
    dirX: Math.random() < 0.5 ? 1 : -1,
    time: Math.random() * 100,
    enteredScreen: false,
    stayOnScreen: false,
    cloakAlpha: 1.0, // Used by Phantom
    cloakDir: -1,
  };

  if (type === 'scout') {
    enemy.width  = 34;
    enemy.height = 30;
    enemy.hp     = 1;
    enemy.maxHp  = 1;
    enemy.speedY = (cfg.level === 1 ? 0.85 : 1.1) * cfg.speedMultiplier;
    enemy.scoreValue = 100;
    enemy.color  = '#00ff88';
    enemy.canShoot = cfg.level > 1; // Pure target practice in Level 1!
    enemy.shootTimer = Math.floor(Math.random() * 60 + 90) * cfg.shootRateMultiplier;
  } 
  else if (type === 'cruiser') {
    enemy.width  = 46;
    enemy.height = 38;
    enemy.hp     = 3;
    enemy.maxHp  = 3;
    enemy.speedY = 0.85 * cfg.speedMultiplier;
    enemy.speedX = 1.35 * cfg.speedMultiplier;
    enemy.scoreValue = 250;
    enemy.color  = '#ff8800';
    enemy.canShoot = true;
    enemy.stayOnScreen = true;
    enemy.shootTimer = Math.floor(Math.random() * 40 + 70) * cfg.shootRateMultiplier;
  } 
  else if (type === 'swarmer') {
    enemy.width  = 28;
    enemy.height = 28;
    enemy.hp     = 2;
    enemy.maxHp  = 2;
    enemy.speedY = 1.4 * cfg.speedMultiplier;
    enemy.speedX = 1.6 * cfg.speedMultiplier;
    enemy.scoreValue = 180;
    enemy.color  = '#ff00aa';
    enemy.canShoot = true;
    enemy.stayOnScreen = true;
    enemy.shootTimer = Math.floor(Math.random() * 40 + 80) * cfg.shootRateMultiplier;
  }
  else if (type === 'bomber') {
    // 🔴 BOMBER: Heavy armor, fires exploding cluster bombs!
    enemy.width  = 48;
    enemy.height = 42;
    enemy.hp     = 4;
    enemy.maxHp  = 4;
    enemy.speedY = 0.7 * cfg.speedMultiplier;
    enemy.speedX = 1.1 * cfg.speedMultiplier;
    enemy.scoreValue = 350;
    enemy.color  = '#ff2222';
    enemy.canShoot = true;
    enemy.stayOnScreen = true;
    enemy.shootTimer = Math.floor(Math.random() * 50 + 90) * cfg.shootRateMultiplier;
  }
  else if (type === 'phantom') {
    // ⚡ PHANTOM: Cloaks into near invisibility, fires high-speed sniper bursts!
    enemy.width  = 32;
    enemy.height = 32;
    enemy.hp     = 2;
    enemy.maxHp  = 2;
    enemy.speedY = 1.2 * cfg.speedMultiplier;
    enemy.speedX = 1.8 * cfg.speedMultiplier;
    enemy.scoreValue = 300;
    enemy.color  = '#00eaff';
    enemy.canShoot = true;
    enemy.stayOnScreen = true;
    enemy.shootTimer = Math.floor(Math.random() * 35 + 65) * cfg.shootRateMultiplier;
  }

  enemy.bulletSpeedMultiplier = cfg.bulletSpeedMultiplier;
  enemies.push(enemy);
}

function queueFormation(waveData, canvasWidth, levelConfig) {
  const laneWidth = canvasWidth / 5;
  for (const item of waveData.enemies) {
    const targetX = laneWidth * item.lane - 17;
    const targetY = -15;
    if (item.delay === 0) {
      spawnEnemy(item.type, targetX, targetY, levelConfig);
    } else {
      pendingSpawns.push({
        type: item.type,
        x: targetX,
        y: targetY,
        timer: item.delay,
        config: levelConfig
      });
    }
  }
}

function updatePendingSpawns() {
  for (let i = pendingSpawns.length - 1; i >= 0; i--) {
    const item = pendingSpawns[i];
    item.timer--;
    if (item.timer <= 0) {
      spawnEnemy(item.type, item.x, item.y, item.config);
      pendingSpawns.splice(i, 1);
    }
  }
}

// ─────────────────────────────────────────────────────
//  Update Enemies Movement & Weapons
// ─────────────────────────────────────────────────────
function updateEnemies(canvasWidth, canvasHeight, playerX, playerY) {
  updatePendingSpawns();

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.time += 0.04;

    if (enemy.y > 20) {
      enemy.enteredScreen = true;
    }

    // ─────────────────────────────────────────────────
    //  MOVEMENT BY TYPE
    // ─────────────────────────────────────────────────
    if (enemy.type === 'scout') {
      enemy.y += enemy.speedY;
      enemy.x = enemy.startX + Math.sin(enemy.time * 1.3) * 30;
      if (enemy.y > canvasHeight + 30) {
        enemy.y = -40;
        enemy.startX = Math.random() * (canvasWidth - enemy.width - 40) + 20;
      }
    } 
    else if (enemy.type === 'cruiser') {
      // Cruiser horizontal patrol & upper-mid bobbing
      if (!enemy.enteredScreen) {
        enemy.y += enemy.speedY;
      } else {
        enemy.x += enemy.dirX * enemy.speedX;
        if (enemy.x <= 15) { enemy.x = 15; enemy.dirX = 1; }
        else if (enemy.x + enemy.width >= canvasWidth - 15) { enemy.x = canvasWidth - enemy.width - 15; enemy.dirX = -1; }

        enemy.y += enemy.dirY * (enemy.speedY * 0.7);
        if (enemy.y <= 40) { enemy.y = 40; enemy.dirY = 1; }
        else if (enemy.y >= canvasHeight * 0.45) { enemy.y = canvasHeight * 0.45; enemy.dirY = -1; }
      }
    } 
    else if (enemy.type === 'swarmer') {
      // Fast sweeping swoop with vertical loop
      enemy.x += Math.sin(enemy.time * 2.0) * (enemy.speedX * 2.2);
      enemy.y += enemy.dirY * enemy.speedY;

      if (enemy.enteredScreen) {
        if (enemy.y >= canvasHeight * 0.58) { enemy.y = canvasHeight * 0.58; enemy.dirY = -1; }
        else if (enemy.y <= 50) { enemy.y = 50; enemy.dirY = 1; }
      }
    }
    else if (enemy.type === 'bomber') {
      // Heavy slow fortress weaving at the top
      if (!enemy.enteredScreen) {
        enemy.y += enemy.speedY;
      } else {
        enemy.x += enemy.dirX * enemy.speedX;
        if (enemy.x <= 20) { enemy.x = 20; enemy.dirX = 1; }
        else if (enemy.x + enemy.width >= canvasWidth - 20) { enemy.x = canvasWidth - enemy.width - 20; enemy.dirX = -1; }

        enemy.y += enemy.dirY * (enemy.speedY * 0.5);
        if (enemy.y <= 45) { enemy.y = 45; enemy.dirY = 1; }
        else if (enemy.y >= canvasHeight * 0.35) { enemy.y = canvasHeight * 0.35; enemy.dirY = -1; }
      }
    }
    else if (enemy.type === 'phantom') {
      // Cloaking and erratic strafing
      enemy.cloakAlpha += enemy.cloakDir * 0.02;
      if (enemy.cloakAlpha <= 0.2) { enemy.cloakAlpha = 0.2; enemy.cloakDir = 1; }
      else if (enemy.cloakAlpha >= 0.95) { enemy.cloakAlpha = 0.95; enemy.cloakDir = -1; }

      enemy.x += Math.sin(enemy.time * 2.5) * (enemy.speedX * 2.0);
      enemy.y += enemy.dirY * enemy.speedY;
      if (enemy.enteredScreen) {
        if (enemy.y >= canvasHeight * 0.5) { enemy.y = canvasHeight * 0.5; enemy.dirY = -1; }
        else if (enemy.y <= 40) { enemy.y = 40; enemy.dirY = 1; }
      }
    }

    enemy.x = Math.max(8, Math.min(canvasWidth - enemy.width - 8, enemy.x));

    // ─────────────────────────────────────────────────
    //  WEAPON FIRING BY TYPE
    // ─────────────────────────────────────────────────
    if (enemy.canShoot && enemy.enteredScreen) {
      enemy.shootTimer--;
      if (enemy.shootTimer <= 0 && enemy.y < canvasHeight - 140) {
        const bSpeed = enemy.bulletSpeedMultiplier || 1.0;

        if (enemy.type === 'cruiser') {
          // Twin lasers
          lasers.push(makeEnemyLaser(enemy.x + 8, enemy.y + enemy.height, 0, 4.0 * bSpeed, '#ff8800', 1.1));
          lasers.push(makeEnemyLaser(enemy.x + enemy.width - 8, enemy.y + enemy.height, 0, 4.0 * bSpeed, '#ff8800', 1.1));
          enemy.shootTimer = Math.floor(Math.random() * 50 + 70);
        } 
        else if (enemy.type === 'scout') {
          // Single pulse
          lasers.push(makeEnemyLaser(enemy.x + enemy.width / 2, enemy.y + enemy.height, 0, 3.8 * bSpeed, '#00ff88', 1.0));
          enemy.shootTimer = Math.floor(Math.random() * 70 + 90);
        } 
        else if (enemy.type === 'swarmer') {
          // Aimed shot
          const dx = playerX - (enemy.x + enemy.width / 2);
          const vx = Math.max(-1.8, Math.min(1.8, dx * 0.014)) * bSpeed;
          lasers.push(makeEnemyLaser(enemy.x + enemy.width / 2, enemy.y + enemy.height, vx, 4.8 * bSpeed, '#ff00aa', 1.2));
          enemy.shootTimer = Math.floor(Math.random() * 45 + 80);
        }
        else if (enemy.type === 'bomber') {
          // 💣 Cluster bomb!
          lasers.push(makeEnemyLaser(enemy.x + enemy.width / 2, enemy.y + enemy.height, 0, 3.2 * bSpeed, '#ff2200', 1.4, 'cluster'));
          enemy.shootTimer = Math.floor(Math.random() * 60 + 100);
        }
        else if (enemy.type === 'phantom') {
          // High-speed sniper beam
          const dx = playerX - (enemy.x + enemy.width / 2);
          const vx = Math.max(-2, Math.min(2, dx * 0.016)) * bSpeed;
          lasers.push(makeEnemyLaser(enemy.x + enemy.width / 2, enemy.y + enemy.height, vx, 6.0 * bSpeed, '#00ffff', 1.0, 'sniper'));
          enemy.shootTimer = Math.floor(Math.random() * 40 + 70);
        }
        playSound('enemyLaser');
      }
    }
  }
}

// ─────────────────────────────────────────────────────
//  Draw Enemies with Canvas Pixel Art & Health Bars
// ─────────────────────────────────────────────────────
function drawEnemies(ctx) {
  for (const enemy of enemies) {
    ctx.save();
    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height / 2;

    if (enemy.type === 'phantom') {
      ctx.globalAlpha = enemy.cloakAlpha;
    }

    if (enemy.type === 'scout') {
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 15);
      ctx.lineTo(cx - 16, cy - 8);
      ctx.lineTo(cx - 6, cy - 14);
      ctx.lineTo(cx, cy - 8);
      ctx.lineTo(cx + 6, cy - 14);
      ctx.lineTo(cx + 16, cy - 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } 
    else if (enemy.type === 'cruiser') {
      ctx.fillStyle = '#cc5500';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 18);
      ctx.lineTo(cx - 22, cy + 2);
      ctx.lineTo(cx - 22, cy - 16);
      ctx.lineTo(cx - 10, cy - 10);
      ctx.lineTo(cx, cy - 16);
      ctx.lineTo(cx + 10, cy - 10);
      ctx.lineTo(cx + 22, cy - 16);
      ctx.lineTo(cx + 22, cy + 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx - 12, cy - 4);
      ctx.lineTo(cx + 12, cy - 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffee44';
      ctx.fillRect(cx - 14, cy - 2, 4, 6);
      ctx.fillRect(cx + 10, cy - 2, 4, 6);
    } 
    else if (enemy.type === 'swarmer') {
      ctx.fillStyle = '#ff00aa';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 14);
      ctx.lineTo(cx - 14, cy - 12);
      ctx.lineTo(cx, cy - 4);
      ctx.lineTo(cx + 14, cy - 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 6, cy + 1, 12, 2.5);
    }
    else if (enemy.type === 'bomber') {
      // Heavy armored diamond hull with bomb bay
      ctx.fillStyle = '#880000';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 20);
      ctx.lineTo(cx - 24, cy);
      ctx.lineTo(cx - 18, cy - 18);
      ctx.lineTo(cx + 18, cy - 18);
      ctx.lineTo(cx + 24, cy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff3333';
      ctx.fillRect(cx - 12, cy - 6, 24, 10);

      // Glowing bomb dispenser core
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    else if (enemy.type === 'phantom') {
      // Stealth arrow with glowing cyan wingtip emitters
      ctx.fillStyle = '#0066aa';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 16);
      ctx.lineTo(cx - 16, cy - 14);
      ctx.lineTo(cx, cy - 6);
      ctx.lineTo(cx + 16, cy - 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#00eaff';
      ctx.fillRect(cx - 14, cy - 12, 3, 6);
      ctx.fillRect(cx + 11, cy - 12, 3, 6);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // ─────────────────────────────────────────────────
    //  HEALTH & HEART BAR
    // ─────────────────────────────────────────────────
    if (enemy.maxHp > 1 || enemy.hp < enemy.maxHp) {
      const barW = Math.max(36, enemy.width + 8);
      const barH = 5;
      const barX = cx - barW / 2;
      const barY = enemy.y - 14;
      const hpPct = Math.max(0, enemy.hp / enemy.maxHp);

      ctx.fillStyle = 'rgba(0, 0, 20, 0.85)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      let barColor = '#00ff88';
      if (hpPct <= 0.35) barColor = '#ff3344';
      else if (hpPct <= 0.65) barColor = '#ffdd00';

      ctx.fillStyle = barColor;
      ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpPct, barH - 2);

      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      let heartsText = '';
      for (let h = 0; h < enemy.hp; h++) heartsText += '❤️';
      ctx.fillText(heartsText, cx, barY - 3);
    }

    ctx.restore();
  }
}
