/* =====================================================
   👑 MULTI-BOSS SYSTEM (js/boss.js)
   Unique Boss for Every Level:
   - Level 1: 🛸 V-DRONE COMMANDER (HP: 25)
   - Level 2: 🛡️ CRUISER HEAVY DREAD (HP: 45)
   - Level 3: ⚡ NEBULA SWARM QUEEN (HP: 65)
   - Level 4: 💣 VOID FORTRESS TITAN (HP: 85)
   - Level 5: 👑 DREADNOUGHT OMEGA (HP: 120)
   - Level 6+: 🌌 HYPERSPACE OVERLORD (Infinite Scaling!)
   ===================================================== */

'use strict';

let boss = null;

const BOSS_PROFILES = {
  1: {
    name: 'V-DRONE COMMANDER',
    title: 'Scout Vanguard Flagship',
    width: 90,
    height: 65,
    hp: 25,
    speedX: 2.8,
    color: '#00ff88',
    coreColor: '#ffffff',
  },
  2: {
    name: 'CRUISER HEAVY DREAD',
    title: 'Armored Fleet Dreadnought',
    width: 110,
    height: 75,
    hp: 45,
    speedX: 2.2,
    color: '#ff8800',
    coreColor: '#ffff00',
  },
  3: {
    name: 'NEBULA SWARM QUEEN',
    title: 'Hive Mother Overseer',
    width: 115,
    height: 80,
    hp: 65,
    speedX: 2.6,
    color: '#ff00aa',
    coreColor: '#00ffff',
  },
  4: {
    name: 'VOID FORTRESS TITAN',
    title: 'Siege Artillery Juggernaut',
    width: 130,
    height: 85,
    hp: 85,
    speedX: 1.9,
    color: '#ff2222',
    coreColor: '#ffea00',
  },
  5: {
    name: 'DREADNOUGHT OMEGA',
    title: 'Supreme Mother Station Core',
    width: 140,
    height: 95,
    hp: 120,
    speedX: 2.4,
    color: '#a020f0',
    coreColor: '#ff0033',
  }
};

function spawnBoss(canvasWidth, level = 1) {
  const profile = BOSS_PROFILES[level] || {
    name: `HYPER OVERLORD ${level}`,
    title: 'Hyperspace Annihilator',
    width: 140,
    height: 95,
    hp: 100 + level * 25,
    speedX: 2.5 + level * 0.1,
    color: '#00eaff',
    coreColor: '#ffffff',
  };

  boss = {
    active: true,
    level: level,
    name: profile.name,
    title: profile.title,
    x: canvasWidth / 2 - profile.width / 2,
    y: -130,
    targetY: 55,
    width: profile.width,
    height: profile.height,
    hp: profile.hp,
    maxHp: profile.hp,
    speedX: profile.speedX,
    dirX: 1,
    color: profile.color,
    coreColor: profile.coreColor,
    phase: 1,
    time: 0,
    attackTimer: 50,
    minionTimer: 160,
    coreGlow: 0,
    isDying: false,
    deathTimer: 0,
  };
}

function updateBoss(canvasWidth, canvasHeight, playerX, playerY) {
  if (!boss || !boss.active) return;

  // Boss Death Sequence
  if (boss.isDying) {
    boss.deathTimer++;
    if (boss.deathTimer % 5 === 0) {
      const rx = boss.x + Math.random() * boss.width;
      const ry = boss.y + Math.random() * boss.height;
      createExplosion(rx, ry, ['#ff3344', '#ffaa00', '#00eaff', '#ffffff', '#00ff88'][Math.floor(Math.random() * 5)], 20);
      playSound('explosion');
      triggerScreenShake(7, 5);
    }
    if (boss.deathTimer > 90) {
      playSound('bossExplosion');
      createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ffea00', 60);
      // Guarantee Weapon Upgrade & Shield drops upon Boss kill!
      maybeDropPowerup(boss.x + boss.width / 2 - 25, boss.y + boss.height / 2, true, 'weapon');
      maybeDropPowerup(boss.x + boss.width / 2 + 10, boss.y + boss.height / 2, true, 'shield');
      boss.active = false;
      const defeatedBossLevel = boss.level;
      boss = null;

      if (defeatedBossLevel >= 5) {
        triggerVictory();
      } else {
        advanceToNextLevel();
      }
    }
    return;
  }

  boss.time += 0.04;
  boss.coreGlow = (Math.sin(boss.time * 3) + 1) / 2;

  // Entry descent
  if (boss.y < boss.targetY) {
    boss.y += 1.3;
    return;
  }

  // Phase computation
  const hpPct = boss.hp / boss.maxHp;
  if (hpPct > 0.66) boss.phase = 1;
  else if (hpPct > 0.33) boss.phase = 2;
  else boss.phase = 3; // Enraged!

  // Horizontal patrol
  const currentSpeed = boss.phase === 3 ? boss.speedX * 1.6 : boss.speedX;
  boss.x += boss.dirX * currentSpeed;

  if (boss.x <= 15) {
    boss.x = 15;
    boss.dirX = 1;
  } else if (boss.x + boss.width >= canvasWidth - 15) {
    boss.x = canvasWidth - boss.width - 15;
    boss.dirX = -1;
  }

  // ─────────────────────────────────────────────────────
  //  BOSS WEAPON LOGIC BY LEVEL
  // ─────────────────────────────────────────────────────
  boss.attackTimer--;
  if (boss.attackTimer <= 0) {
    const cx = boss.x + boss.width / 2;
    const bottomY = boss.y + boss.height;

    if (boss.level === 1) {
      // 🛸 Level 1: Twin scout pulse cannons
      lasers.push(makeEnemyLaser(boss.x + 18, bottomY - 5, 0, 4.2, '#00ff88', 1.2));
      lasers.push(makeEnemyLaser(boss.x + boss.width - 18, bottomY - 5, 0, 4.2, '#00ff88', 1.2));
      playSound('enemyLaser');
      boss.attackTimer = 65;
    }
    else if (boss.level === 2) {
      // 🛡️ Level 2: Heavy wing cannons + 3-way spread
      lasers.push(makeEnemyLaser(boss.x + 15, bottomY - 5, 0, 4.5, '#ff8800', 1.3));
      lasers.push(makeEnemyLaser(boss.x + boss.width - 15, bottomY - 5, 0, 4.5, '#ff8800', 1.3));
      lasers.push(makeEnemyLaser(cx, bottomY, -1.2, 4.2, '#ffdd00', 1.1));
      lasers.push(makeEnemyLaser(cx, bottomY,  1.2, 4.2, '#ffdd00', 1.1));
      playSound('bossLaser');
      boss.attackTimer = 55;
    }
    else if (boss.level === 3) {
      // ⚡ Level 3: 5-way aimed purple sniper spread
      for (let i = -2; i <= 2; i++) {
        lasers.push(makeEnemyLaser(cx, bottomY, i * 1.5, 4.6, '#ff00aa', 1.2));
      }
      playSound('bossLaser');
      boss.attackTimer = 48;
    }
    else if (boss.level === 4) {
      // 💣 Level 4: Cluster bombs + heavy plasma
      lasers.push(makeEnemyLaser(cx - 20, bottomY, -0.8, 3.5, '#ff2200', 1.4, 'cluster'));
      lasers.push(makeEnemyLaser(cx + 20, bottomY,  0.8, 3.5, '#ff2200', 1.4, 'cluster'));
      lasers.push(makeEnemyLaser(cx, bottomY, 0, 5.2, '#ffaa00', 1.3));
      playSound('bossLaser');
      boss.attackTimer = 50;
    }
    else {
      // 👑 Level 5+: Dreadnought Omega (Spiral laser storm + Barrage)
      if (boss.phase === 3) {
        const angle = boss.time * 4;
        const vx = Math.cos(angle) * 3.5;
        const vy = Math.abs(Math.sin(angle)) * 3.5 + 2.5;
        lasers.push(makeEnemyLaser(cx, bottomY, vx, vy, '#ff0033', 1.5));
        lasers.push(makeEnemyLaser(cx, bottomY, -vx, vy, '#00eaff', 1.5));
        playSound('enemyLaser');
        boss.attackTimer = 14;
      } else {
        for (let i = -2; i <= 2; i++) {
          lasers.push(makeEnemyLaser(cx, bottomY, i * 1.6, 4.8, '#a020f0', 1.3));
        }
        playSound('bossLaser');
        boss.attackTimer = 40;
      }
    }
  }

  // Minion Support Spawns
  if (boss.phase >= 2) {
    boss.minionTimer--;
    if (boss.minionTimer <= 0 && enemies.length < 2) {
      const minionType = boss.level >= 3 ? 'swarmer' : 'scout';
      spawnEnemy(minionType, boss.x - 20, boss.y + 30);
      spawnEnemy(minionType, boss.x + boss.width + 10, boss.y + 30);
      boss.minionTimer = 220;
    }
  }
}

function drawBoss(ctx, canvasWidth) {
  if (!boss || !boss.active) return;

  const { x, y, width, height, phase, color, coreGlow } = boss;
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.save();

  // Enraged Aura
  if (phase === 3) {
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ff0033';
  } else {
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
  }

  // Outer Armor Hull
  ctx.fillStyle = phase === 3 ? '#550015' : '#140026';
  ctx.strokeStyle = phase === 3 ? '#ff0033' : color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(cx, y + height);
  ctx.lineTo(cx - width * 0.28, y + height - 15);
  ctx.lineTo(x, y + height - 25);
  ctx.lineTo(x + 10, y + 10);
  ctx.lineTo(cx - 20, y);
  ctx.lineTo(cx + 20, y);
  ctx.lineTo(x + width - 10, y + 10);
  ctx.lineTo(x + width, y + height - 25);
  ctx.lineTo(cx + width * 0.28, y + height - 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Turrets
  ctx.fillStyle = color;
  ctx.fillRect(x + 15, y + height - 20, 12, 18);
  ctx.fillRect(x + width - 27, y + height - 20, 12, 18);

  // Glowing Power Core
  ctx.beginPath();
  ctx.arc(cx, y + height * 0.45, 16, 0, Math.PI * 2);
  const coreGrad = ctx.createRadialGradient(cx, y + height * 0.45, 2, cx, y + height * 0.45, 16);
  if (phase === 3) {
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, `rgba(255, 0, 50, ${0.8 + coreGlow * 0.2})`);
    coreGrad.addColorStop(1, 'rgba(100, 0, 0, 0)');
  } else {
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, color);
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // ─────────────────────────────────────────────────────
  //  BOSS HEALTH BAR (Top of Screen)
  // ─────────────────────────────────────────────────────
  const barW = canvasWidth - 60;
  const barH = 14;
  const barX = 30;
  const barY = 48;
  const hpPct = Math.max(0, boss.hp / boss.maxHp);

  ctx.fillStyle = 'rgba(0, 0, 20, 0.9)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillRect(barX, barY, barW, barH);
  ctx.strokeRect(barX, barY, barW, barH);

  const hpGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  if (phase === 3) {
    hpGrad.addColorStop(0, '#ff0033');
    hpGrad.addColorStop(1, '#ff8800');
  } else {
    hpGrad.addColorStop(0, color);
    hpGrad.addColorStop(1, '#ffffff');
  }
  ctx.fillStyle = hpGrad;
  ctx.fillRect(barX + 2, barY + 2, (barW - 4) * hpPct, barH - 4);

  ctx.font = '8px "Press Start 2P"';
  ctx.fillStyle = phase === 3 ? '#ff3344' : color;
  ctx.shadowBlur = 6;
  ctx.shadowColor = ctx.fillStyle;
  ctx.textAlign = 'center';
  const phaseLabel = phase === 3 ? '⚠️ ENRAGED PHASE!' : `PHASE ${phase}`;
  ctx.fillText(`👑 ${boss.name} — ${phaseLabel}`, canvasWidth / 2, barY - 7);

  ctx.restore();
}

function damageBoss(amount = 1) {
  if (!boss || !boss.active || boss.isDying) return;

  boss.hp -= amount;
  playSound('hit');

  if (boss.hp <= 0) {
    boss.hp = 0;
    boss.isDying = true;
    score += 2500 * boss.level;
    addFloatingText(boss.x + boss.width / 2, boss.y + boss.height / 2, `+${2500 * boss.level} BOSS SLAIN!`, '#ffea00');
  }
}
