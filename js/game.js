/* =====================================================
   🚀 MASTER GAME CONTROLLER (js/game.js)
   Orchestrates Campaigns, Bosses per Level, Signature
   Weapons, Dynamic Rewards, Collisions & High Scores!
   ===================================================== */

'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'start'; // 'start' | 'playing' | 'gameover' | 'victory'
let score     = 0;
let highScore = 0;
let lives     = 3;

// Level & Wave Tracking
let currentLevel = 1;
let currentWaveIndex = 0;
let levelConfig = null;
let waveInProgress = false;
let waveTransitionTimer = 0;

// Announcement Banner
let bannerText = '';
let bannerSubtext = '';
let bannerTimer = 0;
let bannerColor = '#00eaff';

// Canvas Responsiveness
function resizeCanvas() {
  const maxW = Math.min(window.innerWidth - 20, 520);
  const maxH = Math.min(window.innerHeight - 130, 720);
  canvas.width  = Math.max(320, maxW);
  canvas.height = Math.max(480, maxH);
}
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  createStars(canvas.width, canvas.height);
});

// High Score Persistence
function loadHighScore() {
  try {
    const saved = localStorage.getItem('retro_space_shooter_highscore');
    if (saved) {
      highScore = parseInt(saved, 10) || 0;
    }
  } catch (e) {}
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    try {
      localStorage.setItem('retro_space_shooter_highscore', highScore.toString());
    } catch (e) {}
  }
}

// ─────────────────────────────────────────────────────
//  Input Handling & Ship Selection
// ─────────────────────────────────────────────────────
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  getAudioContext();
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

function bindMobileBtn(id, keyCode) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const press = (ev) => {
    ev.preventDefault();
    getAudioContext();
    keys[keyCode] = true;
    btn.classList.add('pressed');
  };
  const release = (ev) => {
    ev.preventDefault();
    keys[keyCode] = false;
    btn.classList.remove('pressed');
  };
  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointerleave', release);
  btn.addEventListener('pointercancel', release);
}
bindMobileBtn('btnUp',    'ArrowUp');
bindMobileBtn('btnDown',  'ArrowDown');
bindMobileBtn('btnLeft',  'ArrowLeft');
bindMobileBtn('btnRight', 'ArrowRight');
bindMobileBtn('btnShoot', 'Space');

// Character Selection Cards
document.querySelectorAll('.ship-card').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ship-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const clsId = btn.getAttribute('data-class');
    selectShipClass(clsId);
    playSound('laser');
  });
});

document.getElementById('startBtn').addEventListener('click', () => {
  getAudioContext();
  startGame();
});
document.getElementById('restartBtn').addEventListener('click', () => {
  getAudioContext();
  startGame();
});
document.getElementById('victoryBtn').addEventListener('click', () => {
  getAudioContext();
  currentLevel++;
  document.getElementById('victory-screen').classList.add('hidden');
  initGame(currentLevel);
  gameState = 'playing';
});
const muteBtn = document.getElementById('muteBtn');
if (muteBtn) {
  muteBtn.addEventListener('click', toggleMute);
}

// ─────────────────────────────────────────────────────
//  Level & Wave Director
// ─────────────────────────────────────────────────────
function initGame(startLvl = 1) {
  currentLevel = startLvl;
  currentWaveIndex = 0;
  levelConfig = getLevelConfig(currentLevel);

  resetPlayer(canvas.width, canvas.height);
  if (startLvl === 1) {
    score = 0;
    lives = selectedShipClass.maxHp || 3;
  }

  lasers        = [];
  powerups      = [];
  particles     = [];
  floatingTexts = [];
  boss          = null;
  clearEnemies();

  createStars(canvas.width, canvas.height);
  loadHighScore();
  startBackgroundMusic();

  showBanner(levelConfig.name, 'GET READY, PILOT!', levelConfig.color, 120);
  startWave(0);
}

function showBanner(title, subtext, color = '#00eaff', duration = 100) {
  bannerText = title;
  bannerSubtext = subtext;
  bannerColor = color;
  bannerTimer = duration;
}

function startWave(waveIdx) {
  currentWaveIndex = waveIdx;
  waveInProgress = true;
  levelConfig = getLevelConfig(currentLevel);

  const waveData = levelConfig.waves[currentWaveIndex];
  if (!waveData) return;

  if (waveData.isBoss) {
    playSound('bossWarning');
    showBanner(`👑 LEVEL ${currentLevel} BOSS!`, waveData.title, '#ff0033', 140);
    triggerScreenShake(12, 30);
    spawnBoss(canvas.width, currentLevel);
  } else {
    showBanner(`WAVE ${currentWaveIndex + 1}/${levelConfig.waves.length}`, waveData.title, levelConfig.color, 90);
    queueFormation(waveData, canvas.width, levelConfig);
  }
}

function updateWavesDirector() {
  if (boss && boss.active) return;

  if (enemies.length === 0 && pendingSpawns.length === 0 && waveInProgress) {
    waveInProgress = false;
    waveTransitionTimer = 90;

    const waveBonus = (currentLevel * 200) + ((currentWaveIndex + 1) * 100);
    score += waveBonus;
    updateHighScore();
    playSound('waveClear');
    showBanner('WAVE CLEAR!', `+${waveBonus} BONUS PTS`, '#00ff88', 85);
  }

  if (!waveInProgress) {
    if (waveTransitionTimer > 0) {
      waveTransitionTimer--;
      if (waveTransitionTimer === 0) {
        if (currentWaveIndex + 1 < levelConfig.waves.length) {
          startWave(currentWaveIndex + 1);
        } else {
          advanceToNextLevel();
        }
      }
    }
  }
}

function advanceToNextLevel() {
  const levelBonus = currentLevel * 1000;
  score += levelBonus;
  updateHighScore();
  currentLevel++;
  currentWaveIndex = 0;
  levelConfig = getLevelConfig(currentLevel);

  playSound('victory');
  showBanner(`SECTOR ${currentLevel - 1} CLEARED!`, `ENTERING ${levelConfig.name} (+${levelBonus} PTS)`, levelConfig.color, 140);
  triggerScreenShake(8, 20);

  lives = Math.min(5, lives + 1);

  setTimeout(() => {
    if (gameState === 'playing') {
      startWave(0);
    }
  }, 2200);
}

// ─────────────────────────────────────────────────────
//  Collision Detection & Signature AoE Physics
// ─────────────────────────────────────────────────────
function checkRectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function applyAoEDamage(x, y, radius, damage) {
  createExplosion(x, y, '#ff4400', 25);
  playSound('explosion');
  triggerScreenShake(6, 12);

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const dist = Math.hypot((e.x + e.width / 2) - x, (e.y + e.height / 2) - y);
    if (dist <= radius + (e.width / 2)) {
      e.hp -= damage;
      if (e.hp <= 0) {
        score += e.scoreValue;
        updateHighScore();
        addFloatingText(e.x + e.width / 2, e.y, `+${e.scoreValue}`, '#00ffcc');
        maybeDropPowerup(e.x + e.width / 2 - 14, e.y + e.height / 2 - 14);
        enemies.splice(i, 1);
      }
    }
  }

  if (boss && boss.active && !boss.isDying) {
    const dist = Math.hypot((boss.x + boss.width / 2) - x, (boss.y + boss.height / 2) - y);
    if (dist <= radius + (boss.width / 2)) {
      damageBoss(damage);
    }
  }
}

function handleCollisions() {
  // 1. Player Lasers vs Enemies
  for (let lIdx = lasers.length - 1; lIdx >= 0; lIdx--) {
    const laser = lasers[lIdx];
    if (!laser.fromPlayer) continue;

    const laserBox = { x: laser.x - laser.width / 2, y: laser.y, width: laser.width, height: laser.height };

    for (let eIdx = enemies.length - 1; eIdx >= 0; eIdx--) {
      const enemy = enemies[eIdx];
      if (checkRectCollision(laserBox, enemy)) {
        createExplosion(laser.x, laser.y, laser.color, 6);

        // AoE Rocket Explosion
        if (laser.aoeRadius > 0) {
          applyAoEDamage(laser.x, laser.y, laser.aoeRadius, laser.damage);
          lasers.splice(lIdx, 1);
          break;
        }

        // Direct damage
        enemy.hp -= laser.damage || 1;

        // Piercing / Vortex razor logic
        if (laser.pierceCount && laser.pierceCount > 1) {
          laser.pierceCount--;
        } else {
          lasers.splice(lIdx, 1);
        }

        if (enemy.hp <= 0) {
          playSound('explosion');
          createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 24);
          score += enemy.scoreValue;
          updateHighScore();
          addFloatingText(enemy.x + enemy.width / 2, enemy.y, `+${enemy.scoreValue}`, '#00ffcc');
          maybeDropPowerup(enemy.x + enemy.width / 2 - 14, enemy.y + enemy.height / 2 - 14);
          enemies.splice(eIdx, 1);
          triggerScreenShake(3, 8);
        } else {
          playSound('hit');
        }
        break;
      }
    }
  }

  // 2. Player Lasers vs BOSS
  if (boss && boss.active && !boss.isDying && boss.y >= boss.targetY - 10) {
    for (let lIdx = lasers.length - 1; lIdx >= 0; lIdx--) {
      const laser = lasers[lIdx];
      if (!laser.fromPlayer) continue;

      const laserBox = { x: laser.x - laser.width / 2, y: laser.y, width: laser.width, height: laser.height };
      if (checkRectCollision(laserBox, boss)) {
        createExplosion(laser.x, laser.y, '#ffaa00', 8);

        if (laser.aoeRadius > 0) {
          applyAoEDamage(laser.x, laser.y, laser.aoeRadius, laser.damage);
          lasers.splice(lIdx, 1);
          break;
        }

        damageBoss(laser.damage || 1);
        if (laser.pierceCount && laser.pierceCount > 1) {
          laser.pierceCount--;
        } else {
          lasers.splice(lIdx, 1);
        }
        break;
      }
    }
  }

  // 3. Enemy Lasers vs Player
  for (let lIdx = lasers.length - 1; lIdx >= 0; lIdx--) {
    const laser = lasers[lIdx];
    if (laser.fromPlayer) continue;

    const laserBox = { x: laser.x - laser.width / 2, y: laser.y, width: laser.width, height: laser.height };
    if (checkRectCollision(laserBox, player)) {
      lasers.splice(lIdx, 1);
      damagePlayer();
      break;
    }
  }

  // 4. Enemy Ship Crash vs Player Body
  for (let eIdx = enemies.length - 1; eIdx >= 0; eIdx--) {
    const enemy = enemies[eIdx];
    if (checkRectCollision(enemy, player)) {
      createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 20);
      enemies.splice(eIdx, 1);
      damagePlayer();
      break;
    }
  }

  // 5. Boss Crash vs Player Body
  if (boss && boss.active && !boss.isDying) {
    if (checkRectCollision(boss, player)) {
      damagePlayer();
    }
  }

  // 6. In-Game Reward & Capsule Collection
  for (let pIdx = powerups.length - 1; pIdx >= 0; pIdx--) {
    const p = powerups[pIdx];
    if (checkRectCollision(player, p)) {
      if (p.isWeapon && p.weaponType) {
        // Switch Weapon signature!
        switchPlayerWeapon(p.weaponType);
      } else if (p.type === 'upgrade') {
        // Upgrade weapon level
        upgradePlayerWeapon();
      } else if (p.type === 'shield') {
        player.shieldActive = true;
        player.shieldTimer = 600;
        playSound('powerup');
        addFloatingText(p.x, p.y - 10, '+SHIELD ACTIVE!', p.color);
      } else if (p.type === 'speed') {
        player.speedBoostTimer = 600;
        playSound('powerup');
        addFloatingText(p.x, p.y - 10, '+SPEED OVERDRIVE!', p.color);
      } else if (p.type === 'life') {
        lives = Math.min(5, lives + 1);
        playSound('powerup');
        addFloatingText(p.x, p.y - 10, '+EXTRA HEART!', p.color);
      }
      score += 200;
      updateHighScore();
      powerups.splice(pIdx, 1);
    }
  }
}

function damagePlayer() {
  if (player.invulnerableTimer > 0) return;

  if (player.shieldActive) {
    player.shieldActive = false;
    player.shieldTimer = 0;
    playSound('hit');
    createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#00ffff', 18);
    addFloatingText(player.x + player.width / 2, player.y, 'SHIELD BROKEN!', '#00ffff');
    player.invulnerableTimer = 40;
    return;
  }

  // Lose a heart & downgrade weapon level by 1!
  lives--;
  downgradePlayerWeapon();
  playSound('explosion');
  createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff3344', 30);
  triggerScreenShake(10, 20);
  player.invulnerableTimer = 90;

  if (lives <= 0) {
    gameOver();
  }
}

function gameOver() {
  gameState = 'gameover';
  stopBackgroundMusic();
  updateHighScore();
  document.getElementById('final-score-text').textContent = `FINAL SCORE: ${score}`;
  document.getElementById('final-wave-text').textContent = `REACHED LEVEL ${currentLevel} (WAVE ${currentWaveIndex + 1})`;
  document.getElementById('game-over-screen').classList.remove('hidden');
}

function triggerVictory() {
  gameState = 'victory';
  stopBackgroundMusic();
  playSound('victory');
  updateHighScore();
  document.getElementById('victory-score-text').textContent = `FINAL SCORE: ${score}`;
  document.getElementById('victory-high-score-text').textContent = `ALL-TIME BEST: ${highScore}`;
  document.getElementById('victory-screen').classList.remove('hidden');
}

// ─────────────────────────────────────────────────────
//  HUD Drawing
// ─────────────────────────────────────────────────────
function drawHUD() {
  const pad = 14;
  const wProfile = getWeaponProfile(player.weaponType);

  ctx.save();
  ctx.font = '11px "Press Start 2P"';
  ctx.fillStyle = '#00eaff';
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#00eaff';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, pad, 24);

  ctx.font = '8px "Press Start 2P"';
  ctx.fillStyle = '#7a9cbf';
  ctx.fillText(`HI: ${highScore}`, pad, 40);

  // Lives (❤️)
  ctx.font = '12px "Press Start 2P"';
  ctx.fillStyle = '#ff4466';
  ctx.shadowColor = '#ff4466';
  let livesText = '';
  for (let i = 0; i < lives; i++) livesText += '♥ ';
  ctx.fillText(livesText, pad, 60);

  // Active Signature Weapon Badge & Level Stars
  ctx.font = '8px "Press Start 2P"';
  ctx.fillStyle = wProfile.color;
  ctx.shadowColor = wProfile.color;
  let starsText = '';
  for (let s = 0; s < player.weaponLevel; s++) starsText += '★';
  ctx.fillText(`${wProfile.icon} ${wProfile.name} LV.${player.weaponLevel} ${starsText}`, pad, 78);

  // Level & Wave Info
  ctx.font = '10px "Press Start 2P"';
  ctx.fillStyle = levelConfig ? levelConfig.color : '#ffdd00';
  ctx.shadowColor = ctx.fillStyle;
  const totalWaves = levelConfig ? levelConfig.waves.length : 3;
  const waveText = boss && boss.active ? '👑 BOSS BATTLE' : `LVL ${currentLevel} • W${currentWaveIndex + 1}/${totalWaves}`;
  ctx.textAlign = 'right';
  ctx.fillText(waveText, canvas.width - pad, 24);

  // Active status pills
  let powerBarX = pad;
  const powerBarY = canvas.height - 18;
  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = 'left';

  if (player.shieldActive) {
    ctx.fillStyle = '#00ffc8';
    ctx.shadowColor = '#00ffc8';
    ctx.fillText(`🛡️ SHIELD ${Math.ceil(player.shieldTimer/60)}s`, powerBarX, powerBarY);
    powerBarX += 115;
  }
  if (player.speedBoostTimer > 0) {
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.fillText(`⚡ SPEED ${Math.ceil(player.speedBoostTimer/60)}s`, powerBarX, powerBarY);
  }

  // Floating Announcement Banner
  if (bannerTimer > 0) {
    bannerTimer--;
    const alpha = Math.min(1, bannerTimer / 20);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = bannerColor;
    ctx.shadowBlur = 14;
    ctx.shadowColor = bannerColor;
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(bannerText, canvas.width / 2, canvas.height * 0.38);

    if (bannerSubtext) {
      ctx.font = '9px "Press Start 2P"';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.fillText(bannerSubtext, canvas.width / 2, canvas.height * 0.44);
    }
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────
//  Master Game Loop
// ─────────────────────────────────────────────────────
let animationId = null;

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  if (screenShakeTimer > 0) {
    screenShakeTimer--;
    const offsetX = (Math.random() * 2 - 1) * screenShakeMagnitude;
    const offsetY = (Math.random() * 2 - 1) * screenShakeMagnitude;
    ctx.translate(offsetX, offsetY);
  }

  // Deep space background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#000018');
  bgGrad.addColorStop(1, '#000612');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updateStars(canvas.width, canvas.height);
  drawStars(ctx);

  if (gameState === 'playing') {
    updatePlayer(keys, canvas.width, canvas.height);
    updateLasers(canvas.width, canvas.height, enemies, boss, player.x + player.width / 2, player.y);
    updateEnemies(canvas.width, canvas.height, player.x + player.width / 2, player.y);
    updateBoss(canvas.width, canvas.height, player.x + player.width / 2, player.y);
    updateWavesDirector();
    updatePowerups(canvas.height);
    updateParticles();
    updateFloatingTexts();
    handleCollisions();

    drawParticles(ctx);
    drawPowerups(ctx);
    drawEnemies(ctx);
    drawBoss(ctx, canvas.width);
    drawLasers(ctx);
    drawPlayer(ctx);
    drawFloatingTexts(ctx);
    drawHUD();
  } else if (gameState === 'victory') {
    if (Math.random() < 0.08) {
      spawnFirework(canvas.width, canvas.height);
    }
    updateParticles();
    drawParticles(ctx);
  }

  ctx.restore();
  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-over-screen').classList.add('hidden');
  document.getElementById('victory-screen').classList.add('hidden');

  initGame(1);
  gameState = 'playing';

  if (animationId) cancelAnimationFrame(animationId);
  gameLoop();
}

function titleLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#000018');
  bgGrad.addColorStop(1, '#000612');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updateStars(canvas.width, canvas.height);
  drawStars(ctx);

  if (gameState === 'start') {
    animationId = requestAnimationFrame(titleLoop);
  }
}

function boot() {
  loadHighScore();
  const startHi = document.getElementById('start-high-score');
  if (startHi) startHi.textContent = `HI-SCORE: ${highScore}`;

  resizeCanvas();
  createStars(canvas.width, canvas.height);
  gameState = 'start';
  titleLoop();
}

boot();
