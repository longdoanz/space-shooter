/* =====================================================
   🚀 PLAYER SHIP & SIGNATURE WEAPONS (js/player.js)
   Supports:
   - Dynamic in-game Weapon Switching:
     [P] Plasma | [L] Tesla | [R] Rocket | [Q] Quantum | [V] Vortex
   - 5-Tier Weapon Level Power Scaling
   - Downgrade 1 level on Heart loss
   ===================================================== */

'use strict';

const player = {
  x: 0,
  y: 0,
  width: 44,
  height: 52,
  speed: 5.6,
  color: '#00eaff',
  accentColor: '#0066cc',
  weaponType: 'plasma', // 'plasma' | 'homing' | 'explosive' | 'piercing' | 'vortex'
  weaponLevel: 1, // 1 to 5
  maxWeaponLevel: 5,
  shootCooldown: 0,
  shootRate: 11,
  invulnerableTimer: 0,
  shieldActive: false,
  shieldTimer: 0,
  speedBoostTimer: 0,
};

function resetPlayer(canvasWidth, canvasHeight) {
  const cls = selectedShipClass || SHIP_CLASSES[0];
  player.speed = cls.speed;
  player.weaponType = cls.weaponType || 'plasma';
  player.weaponLevel = 1;

  const wProfile = getWeaponProfile(player.weaponType);
  player.color = wProfile.color;
  player.accentColor = wProfile.accentColor;
  player.shootRate = wProfile.shootRate;

  player.x = canvasWidth / 2 - player.width / 2;
  player.y = canvasHeight - player.height - 25;
  player.invulnerableTimer = 0;
  player.shieldActive = false;
  player.shieldTimer = 0;
  player.speedBoostTimer = 0;
  player.shootCooldown = 0;
}

// ─────────────────────────────────────────────────────
//  In-Game Weapon Switch & Upgrade
// ─────────────────────────────────────────────────────
function switchPlayerWeapon(newWeaponType) {
  const oldType = player.weaponType;
  player.weaponType = newWeaponType;

  const profile = getWeaponProfile(newWeaponType);
  player.color = profile.color;
  player.accentColor = profile.accentColor;
  player.shootRate = profile.shootRate;

  playSound('weapon_switch');

  // If picking up the SAME weapon you already have, give a free Level Up!
  if (oldType === newWeaponType) {
    upgradePlayerWeapon();
  } else {
    showBanner(`EQUIPPED: ${profile.name}!`, profile.description, profile.color, 90);
    addFloatingText(player.x + player.width / 2, player.y - 20, `+${profile.tag}!`, profile.color);
    triggerScreenShake(4, 8);
  }
}

function upgradePlayerWeapon() {
  if (player.weaponLevel < player.maxWeaponLevel) {
    player.weaponLevel++;
    playSound('powerup');
    const profile = getWeaponProfile(player.weaponType);
    addFloatingText(player.x + player.width / 2, player.y - 15, `★ ${profile.name} LV.${player.weaponLevel}!`, '#ffea00');
  } else {
    score += 500;
    addFloatingText(player.x + player.width / 2, player.y - 15, `+500 MAX WEAPON!`, '#ffea00');
  }
}

function downgradePlayerWeapon() {
  if (player.weaponLevel > 1) {
    player.weaponLevel--;
    addFloatingText(player.x + player.width / 2, player.y - 15, `WEAPON DOWNGRADE: LV.${player.weaponLevel}`, '#ff3344');
  }
}

// ─────────────────────────────────────────────────────
//  Movement & Firing
// ─────────────────────────────────────────────────────
function updatePlayer(keys, canvasWidth, canvasHeight) {
  const currentSpeed = player.speedBoostTimer > 0 ? player.speed * 1.5 : player.speed;

  if (keys['ArrowLeft']  || keys['KeyA']) player.x -= currentSpeed;
  if (keys['ArrowRight'] || keys['KeyD']) player.x += currentSpeed;
  if (keys['ArrowUp']    || keys['KeyW']) player.y -= currentSpeed;
  if (keys['ArrowDown']  || keys['KeyS']) player.y += currentSpeed;

  player.x = Math.max(0, Math.min(canvasWidth  - player.width,  player.x));
  player.y = Math.max(0, Math.min(canvasHeight - player.height, player.y));

  if (player.shootCooldown > 0) player.shootCooldown--;
  if (keys['Space'] && player.shootCooldown <= 0) {
    playerShoot();
    player.shootCooldown = player.shootRate;
  }

  if (player.invulnerableTimer > 0) player.invulnerableTimer--;
  if (player.shieldTimer > 0)     { player.shieldTimer--;     if (player.shieldTimer === 0) player.shieldActive = false; }
  if (player.speedBoostTimer > 0) { player.speedBoostTimer--; }
}

// ─────────────────────────────────────────────────────
//  5 Signature Weapon Firing Modes
// ─────────────────────────────────────────────────────
function playerShoot() {
  const cx = player.x + player.width / 2;
  const topY = player.y;
  const lv = player.weaponLevel;
  const type = player.weaponType;
  const profile = getWeaponProfile(type);

  if (type === 'plasma') {
    // 🚀 1. PLASMA VULCAN (Rapid Multi-Spread Blasters)
    if (lv === 1) {
      lasers.push(makePlayerLaser(cx, topY, 0, -14, 'plasma', 1.0, profile.color));
    } else if (lv === 2) {
      lasers.push(makePlayerLaser(cx - 10, topY, 0, -14, 'plasma', 1.0, profile.color));
      lasers.push(makePlayerLaser(cx + 10, topY, 0, -14, 'plasma', 1.0, profile.color));
    } else if (lv === 3) {
      lasers.push(makePlayerLaser(cx - 12, topY, -2.2, -14, 'plasma', 1.1, profile.color));
      lasers.push(makePlayerLaser(cx,      topY,  0,   -15, 'plasma', 1.3, profile.color));
      lasers.push(makePlayerLaser(cx + 12, topY,  2.2, -14, 'plasma', 1.1, profile.color));
    } else if (lv === 4) {
      lasers.push(makePlayerLaser(cx - 16, topY, -3.2, -14, 'plasma', 1.1, profile.color));
      lasers.push(makePlayerLaser(cx - 6,  topY, -1.0, -15, 'plasma', 1.3, profile.color));
      lasers.push(makePlayerLaser(cx + 6,  topY,  1.0, -15, 'plasma', 1.3, profile.color));
      lasers.push(makePlayerLaser(cx + 16, topY,  3.2, -14, 'plasma', 1.1, profile.color));
    } else if (lv >= 5) {
      // Lv 5: PLASMA STORM (5-way spread + heavy center bolt)
      lasers.push(makePlayerLaser(cx - 22, topY, -4.5, -13, 'plasma', 1.2, profile.color));
      lasers.push(makePlayerLaser(cx - 11, topY, -2.0, -14, 'plasma', 1.4, profile.color));
      lasers.push(makePlayerLaser(cx,      topY,  0,   -16, 'plasma', 2.2, '#ffffff', { width: 9, height: 24 }));
      lasers.push(makePlayerLaser(cx + 11, topY,  2.0, -14, 'plasma', 1.4, profile.color));
      lasers.push(makePlayerLaser(cx + 22, topY,  4.5, -13, 'plasma', 1.2, profile.color));
    }
  } 
  else if (type === 'homing') {
    // ⚡ 2. TESLA LIGHTNING (Auto-Seeking Electric Arcs)
    const bolts = lv;
    for (let i = 0; i < bolts; i++) {
      const spreadAngle = (i - (bolts - 1) / 2) * 1.6;
      lasers.push(makePlayerLaser(cx, topY, spreadAngle, -10, 'homing', 1.2 + lv * 0.25, profile.color, { radius: 5 + lv }));
    }
  }
  else if (type === 'explosive') {
    // 💥 3. ANTIMATTER ROCKET CANNON (Heavy AoE Shockwaves)
    if (lv === 1) {
      lasers.push(makePlayerLaser(cx, topY, 0, -10, 'explosive', 2.2, profile.color, { radius: 7, aoeRadius: 28 }));
    } else if (lv === 2) {
      lasers.push(makePlayerLaser(cx - 12, topY, 0, -10, 'explosive', 2.2, profile.color, { radius: 7, aoeRadius: 28 }));
      lasers.push(makePlayerLaser(cx + 12, topY, 0, -10, 'explosive', 2.2, profile.color, { radius: 7, aoeRadius: 28 }));
    } else if (lv === 3) {
      lasers.push(makePlayerLaser(cx - 14, topY, -1.6, -10, 'explosive', 2.2, profile.color, { radius: 7, aoeRadius: 32 }));
      lasers.push(makePlayerLaser(cx,      topY,  0,   -11, 'explosive', 3.4, '#ffffff',     { radius: 9, aoeRadius: 40 }));
      lasers.push(makePlayerLaser(cx + 14, topY,  1.6, -10, 'explosive', 2.2, profile.color, { radius: 7, aoeRadius: 32 }));
    } else if (lv === 4) {
      lasers.push(makePlayerLaser(cx - 18, topY, -2.6, -10, 'explosive', 2.5, profile.color, { radius: 8, aoeRadius: 36 }));
      lasers.push(makePlayerLaser(cx - 7,  topY, -0.8, -11, 'explosive', 3.2, profile.color, { radius: 9, aoeRadius: 42 }));
      lasers.push(makePlayerLaser(cx + 7,  topY,  0.8, -11, 'explosive', 3.2, profile.color, { radius: 9, aoeRadius: 42 }));
      lasers.push(makePlayerLaser(cx + 18, topY,  2.6, -10, 'explosive', 2.5, profile.color, { radius: 8, aoeRadius: 36 }));
    } else if (lv >= 5) {
      // Lv 5: MEGA ANTIMATTER BFG
      lasers.push(makePlayerLaser(cx - 20, topY, -2.8, -10, 'explosive', 3.0, profile.color, { radius: 8, aoeRadius: 42 }));
      lasers.push(makePlayerLaser(cx,      topY,  0,    -9, 'explosive', 7.0, '#ffffff',     { radius: 16, aoeRadius: 90 }));
      lasers.push(makePlayerLaser(cx + 20, topY,  2.8, -10, 'explosive', 3.0, profile.color, { radius: 8, aoeRadius: 42 }));
    }
  }
  else if (type === 'piercing') {
    // 🔮 4. QUANTUM DEATH RAY (Piercing Energy Beam)
    if (lv === 1) {
      lasers.push(makePlayerLaser(cx, topY, 0, -16, 'piercing', 1.6, profile.color, { width: 6, height: 28, pierceCount: 3 }));
    } else if (lv === 2) {
      lasers.push(makePlayerLaser(cx - 10, topY, 0, -16, 'piercing', 1.6, profile.color, { width: 6, height: 28, pierceCount: 4 }));
      lasers.push(makePlayerLaser(cx + 10, topY, 0, -16, 'piercing', 1.6, profile.color, { width: 6, height: 28, pierceCount: 4 }));
    } else if (lv === 3) {
      lasers.push(makePlayerLaser(cx - 14, topY, 0, -16, 'piercing', 1.6, profile.color, { width: 6, height: 28, pierceCount: 5 }));
      lasers.push(makePlayerLaser(cx,      topY, 0, -17, 'piercing', 2.4, '#ffffff',     { width: 10, height: 34, pierceCount: 6 }));
      lasers.push(makePlayerLaser(cx + 14, topY, 0, -16, 'piercing', 1.6, profile.color, { width: 6, height: 28, pierceCount: 5 }));
    } else if (lv === 4) {
      lasers.push(makePlayerLaser(cx - 18, topY, -1.5, -16, 'piercing', 2.0, profile.color, { width: 7, height: 32, pierceCount: 6 }));
      lasers.push(makePlayerLaser(cx - 8,  topY,  0,   -17, 'piercing', 2.5, profile.color, { width: 9, height: 34, pierceCount: 6 }));
      lasers.push(makePlayerLaser(cx + 8,  topY,  0,   -17, 'piercing', 2.5, profile.color, { width: 9, height: 34, pierceCount: 6 }));
      lasers.push(makePlayerLaser(cx + 18, topY,  1.5, -16, 'piercing', 2.0, profile.color, { width: 7, height: 32, pierceCount: 6 }));
    } else if (lv >= 5) {
      // Lv 5: SUPER QUANTUM HYPERBEAM
      lasers.push(makePlayerLaser(cx, topY, 0, -19, 'piercing', 6.0, '#00ffff', { width: 26, height: 46, pierceCount: 99 }));
    }
  }
  else if (type === 'vortex') {
    // 🌀 5. VORTEX RAZOR (Spinning Boomerang Blades)
    const blades = lv;
    for (let i = 0; i < blades; i++) {
      const spreadX = (i - (blades - 1) / 2) * 2.2;
      lasers.push(makePlayerLaser(cx, topY, spreadX, -11, 'vortex', 1.8 + lv * 0.3, profile.color, { width: 16, height: 16, pierceCount: 4 + lv, spinSpeed: 0.25 }));
    }
  }

  playSound(profile.sfx);
}

// ─────────────────────────────────────────────────────
//  Draw Player Spaceship with Dynamic Glow
// ─────────────────────────────────────────────────────
function drawPlayer(ctx) {
  if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer / 4) % 2 === 0) {
    return;
  }

  const { x, y, width, height, color, accentColor } = player;
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.save();

  // Engine flame
  const flameHeight = 12 + Math.random() * 8 + (player.speedBoostTimer > 0 ? 8 : 0);
  const flameGrad = ctx.createLinearGradient(cx, y + height, cx, y + height + flameHeight);
  flameGrad.addColorStop(0, player.speedBoostTimer > 0 ? '#ffea00' : color);
  flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 7, y + height);
  ctx.lineTo(cx, y + height + flameHeight);
  ctx.lineTo(cx + 7, y + height);
  ctx.closePath();
  ctx.fill();

  // Main Hull with signature weapon color gradient
  const bodyGrad = ctx.createLinearGradient(cx, y, cx, y + height);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.35, color);
  bodyGrad.addColorStop(1, accentColor);
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(cx - 15, y + height - 8);
  ctx.lineTo(cx,      y + height - 14);
  ctx.lineTo(cx + 15, y + height - 8);
  ctx.closePath();
  ctx.fill();

  // Wings
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(cx - 10, y + height * 0.4);
  ctx.lineTo(cx - width / 2, y + height - 4);
  ctx.lineTo(cx - 10, y + height - 8);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + 10, y + height * 0.4);
  ctx.lineTo(cx + width / 2, y + height - 4);
  ctx.lineTo(cx + 10, y + height - 8);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.beginPath();
  ctx.ellipse(cx, y + height * 0.35, 5, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();

  // Wing weapon pods for Lv 3+
  if (player.weaponLevel >= 3) {
    ctx.fillStyle = color;
    ctx.fillRect(cx - width / 2 - 2, y + height - 12, 4, 8);
    ctx.fillRect(cx + width / 2 - 2, y + height - 12, 4, 8);
  }

  // Shield forcefield
  if (player.shieldActive) {
    ctx.beginPath();
    ctx.arc(cx, cy, player.width * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}
