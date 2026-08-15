/* =====================================================
   🚀 PLAYER SHIP & WEAPONS MODULE (js/player.js)
   Features:
   - 4 Unique Ship Classes (Striker, Phantom, Destroyer, Valkyrie)
   - Permanent 5-Tier Weapon Level System (Lv 1 to Lv 5 MAX)
   - Upgrades on Weapon Powerup, Downgrades 1 level on Heart loss!
   ===================================================== */

'use strict';

const player = {
  x: 0,
  y: 0,
  width: 44,
  height: 52,
  speed: 5.5,
  color: '#00eaff',
  accentColor: '#0066cc',
  shipClass: 'striker',
  weaponLevel: 1, // 1 to 5 (Permanent level upgrade!)
  maxWeaponLevel: 5,
  shootCooldown: 0,
  shootRate: 12,
  invulnerableTimer: 0,
  shieldActive: false,
  shieldTimer: 0,
  speedBoostTimer: 0,
};

function resetPlayer(canvasWidth, canvasHeight) {
  // Apply selected ship class attributes
  const cls = selectedShipClass || SHIP_CLASSES[0];
  player.shipClass = cls.id;
  player.speed = cls.speed;
  player.color = cls.color;
  player.accentColor = cls.accentColor;
  player.shootRate = cls.shootRate;
  player.weaponLevel = 1; // Starts at Lv 1

  player.x = canvasWidth / 2 - player.width / 2;
  player.y = canvasHeight - player.height - 25;
  player.invulnerableTimer = 0;
  player.shieldActive = false;
  player.shieldTimer = 0;
  player.speedBoostTimer = 0;
  player.shootCooldown = 0;
}

function upgradePlayerWeapon() {
  if (player.weaponLevel < player.maxWeaponLevel) {
    player.weaponLevel++;
    playSound('powerup');
    addFloatingText(player.x + player.width / 2, player.y - 15, `★ WEAPON LV.${player.weaponLevel}!`, '#ffdd00');
  } else {
    // Max level bonus score
    score += 500;
    addFloatingText(player.x + player.width / 2, player.y - 15, `+500 MAX WEAPON!`, '#ffdd00');
  }
}

function downgradePlayerWeapon() {
  if (player.weaponLevel > 1) {
    player.weaponLevel--;
    addFloatingText(player.x + player.width / 2, player.y - 15, `WEAPON DOWNGRADE: LV.${player.weaponLevel}`, '#ff3344');
  }
}

function switchPlayerClass(newClassId) {
  selectShipClass(newClassId);
  const cls = selectedShipClass;
  player.shipClass = cls.id;
  player.speed = cls.speed;
  player.color = cls.color;
  player.accentColor = cls.accentColor;
  player.shootRate = cls.shootRate;
  addFloatingText(player.x + player.width / 2, player.y - 25, `CLASS: ${cls.name}`, cls.color);
}

// ─────────────────────────────────────────────────────
//  Player Movement & Input
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
//  Multi-Tier Weapon Firing by Ship Class
// ─────────────────────────────────────────────────────
function playerShoot() {
  const cx = player.x + player.width / 2;
  const topY = player.y;
  const lv = player.weaponLevel;
  const cls = player.shipClass;

  if (cls === 'striker') {
    // 🚀 PLASMA STRIKER (Multi-directional rapid spread)
    if (lv === 1) {
      lasers.push(makePlayerLaser(cx, topY, 0, -13, 'plasma', 1, player.color));
    } else if (lv === 2) {
      lasers.push(makePlayerLaser(cx - 10, topY, 0, -13, 'plasma', 1, player.color));
      lasers.push(makePlayerLaser(cx + 10, topY, 0, -13, 'plasma', 1, player.color));
    } else if (lv === 3) {
      lasers.push(makePlayerLaser(cx - 12, topY, -2.0, -13, 'plasma', 1, player.color));
      lasers.push(makePlayerLaser(cx,      topY,  0,   -14, 'plasma', 1.2, player.color));
      lasers.push(makePlayerLaser(cx + 12, topY,  2.0, -13, 'plasma', 1, player.color));
    } else if (lv === 4) {
      lasers.push(makePlayerLaser(cx - 16, topY, -3.0, -13, 'plasma', 1, player.color));
      lasers.push(makePlayerLaser(cx - 6,  topY, -1.0, -14, 'plasma', 1.2, player.color));
      lasers.push(makePlayerLaser(cx + 6,  topY,  1.0, -14, 'plasma', 1.2, player.color));
      lasers.push(makePlayerLaser(cx + 16, topY,  3.0, -13, 'plasma', 1, player.color));
    } else if (lv >= 5) {
      // Lv 5: PLASMA STORM (5-way spread + heavy center bolt)
      lasers.push(makePlayerLaser(cx - 20, topY, -4.2, -12, 'plasma', 1.2, player.color));
      lasers.push(makePlayerLaser(cx - 10, topY, -2.0, -13, 'plasma', 1.4, player.color));
      lasers.push(makePlayerLaser(cx,      topY,  0,   -15, 'plasma', 2.0, '#ffffff', { width: 8, height: 22 }));
      lasers.push(makePlayerLaser(cx + 10, topY,  2.0, -13, 'plasma', 1.4, player.color));
      lasers.push(makePlayerLaser(cx + 20, topY,  4.2, -12, 'plasma', 1.2, player.color));
    }
  } 
  else if (cls === 'phantom') {
    // ⚡ THUNDER PHANTOM (Homing Arc Lightning)
    const bolts = lv;
    for (let i = 0; i < bolts; i++) {
      const spreadAngle = (i - (bolts - 1) / 2) * 1.5;
      lasers.push(makePlayerLaser(cx, topY, spreadAngle, -10, 'homing', 1.2 + lv * 0.2, player.color, { radius: 5 + lv }));
    }
  }
  else if (cls === 'destroyer') {
    // 💥 VOID DESTROYER (Heavy AoE Explosive Cannon)
    if (lv === 1) {
      lasers.push(makePlayerLaser(cx, topY, 0, -10, 'explosive', 2, player.color, { radius: 7, aoeRadius: 25 }));
    } else if (lv === 2) {
      lasers.push(makePlayerLaser(cx - 12, topY, 0, -10, 'explosive', 2, player.color, { radius: 7, aoeRadius: 25 }));
      lasers.push(makePlayerLaser(cx + 12, topY, 0, -10, 'explosive', 2, player.color, { radius: 7, aoeRadius: 25 }));
    } else if (lv === 3) {
      lasers.push(makePlayerLaser(cx - 14, topY, -1.5, -10, 'explosive', 2, player.color, { radius: 7, aoeRadius: 30 }));
      lasers.push(makePlayerLaser(cx,      topY,  0,   -11, 'explosive', 3, '#ffffff',    { radius: 9, aoeRadius: 35 }));
      lasers.push(makePlayerLaser(cx + 14, topY,  1.5, -10, 'explosive', 2, player.color, { radius: 7, aoeRadius: 30 }));
    } else if (lv === 4) {
      lasers.push(makePlayerLaser(cx - 18, topY, -2.5, -10, 'explosive', 2.5, player.color, { radius: 8, aoeRadius: 35 }));
      lasers.push(makePlayerLaser(cx - 7,  topY, -0.8, -11, 'explosive', 3.0, player.color, { radius: 9, aoeRadius: 40 }));
      lasers.push(makePlayerLaser(cx + 7,  topY,  0.8, -11, 'explosive', 3.0, player.color, { radius: 9, aoeRadius: 40 }));
      lasers.push(makePlayerLaser(cx + 18, topY,  2.5, -10, 'explosive', 2.5, player.color, { radius: 8, aoeRadius: 35 }));
    } else if (lv >= 5) {
      // Lv 5: ANTIMATTER BFG (Giant Screen-Clearing Sphere)
      lasers.push(makePlayerLaser(cx - 18, topY, -2.5, -10, 'explosive', 3, player.color, { radius: 8, aoeRadius: 40 }));
      lasers.push(makePlayerLaser(cx,      topY,  0,    -9, 'explosive', 6, '#ffffff',     { radius: 15, aoeRadius: 80 }));
      lasers.push(makePlayerLaser(cx + 18, topY,  2.5, -10, 'explosive', 3, player.color, { radius: 8, aoeRadius: 40 }));
    }
  }
  else if (cls === 'valkyrie') {
    // 🔮 LASER VALKYRIE (Piercing Quantum Lasers)
    if (lv === 1) {
      lasers.push(makePlayerLaser(cx, topY, 0, -15, 'piercing', 1.5, player.color, { width: 6, height: 28, pierceCount: 3 }));
    } else if (lv === 2) {
      lasers.push(makePlayerLaser(cx - 10, topY, 0, -15, 'piercing', 1.5, player.color, { width: 6, height: 28, pierceCount: 4 }));
      lasers.push(makePlayerLaser(cx + 10, topY, 0, -15, 'piercing', 1.5, player.color, { width: 6, height: 28, pierceCount: 4 }));
    } else if (lv === 3) {
      lasers.push(makePlayerLaser(cx - 14, topY, 0, -15, 'piercing', 1.5, player.color, { width: 6, height: 28, pierceCount: 5 }));
      lasers.push(makePlayerLaser(cx,      topY, 0, -16, 'piercing', 2.2, '#ffffff',    { width: 10, height: 32, pierceCount: 6 }));
      lasers.push(makePlayerLaser(cx + 14, topY, 0, -15, 'piercing', 1.5, player.color, { width: 6, height: 28, pierceCount: 5 }));
    } else if (lv === 4) {
      lasers.push(makePlayerLaser(cx - 18, topY, -1.5, -15, 'piercing', 1.8, player.color, { width: 7, height: 30, pierceCount: 6 }));
      lasers.push(makePlayerLaser(cx - 8,  topY,  0,   -16, 'piercing', 2.2, player.color, { width: 8, height: 32, pierceCount: 6 }));
      lasers.push(makePlayerLaser(cx + 8,  topY,  0,   -16, 'piercing', 2.2, player.color, { width: 8, height: 32, pierceCount: 6 }));
      lasers.push(makePlayerLaser(cx + 18, topY,  1.5, -15, 'piercing', 1.8, player.color, { width: 7, height: 30, pierceCount: 6 }));
    } else if (lv >= 5) {
      // Lv 5: SUPER QUANTUM HYPERBEAM (Massive column laser!)
      lasers.push(makePlayerLaser(cx, topY, 0, -18, 'piercing', 5.0, '#00ffff', { width: 24, height: 44, pierceCount: 99 }));
    }
  }

  playSound('laser');
}

// ─────────────────────────────────────────────────────
//  Draw Player Ship
// ─────────────────────────────────────────────────────
function drawPlayer(ctx) {
  if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer / 4) % 2 === 0) {
    return;
  }

  const { x, y, width, height, color, accentColor } = player;
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.save();

  // Thruster Flame
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

  // Ship Main Hull
  const bodyGrad = ctx.createLinearGradient(cx, y, cx, y + height);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.35, color);
  bodyGrad.addColorStop(1, accentColor);
  ctx.fillStyle = bodyGrad;
  ctx.shadowBlur  = 14;
  ctx.shadowColor = color;

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
  ctx.shadowBlur  = 8;
  ctx.shadowColor = '#ffffff';
  ctx.fill();

  // Wing Emitter Pods for Weapon Levels 3+
  if (player.weaponLevel >= 3) {
    ctx.fillStyle = color;
    ctx.fillRect(cx - width / 2 - 2, y + height - 12, 4, 8);
    ctx.fillRect(cx + width / 2 - 2, y + height - 12, 4, 8);
  }

  // Shield Bubble
  if (player.shieldActive) {
    ctx.beginPath();
    ctx.arc(cx, cy, player.width * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 255, 230, ${0.5 + 0.3 * Math.sin(Date.now() / 150)})`;
    ctx.lineWidth = 3.5;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00ffc8';
    ctx.stroke();
  }

  ctx.restore();
}
