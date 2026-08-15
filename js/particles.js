/* =====================================================
   💥 PARTICLES & EFFECTS MODULE (js/particles.js)
   🚀 High-Performance Optimized (Zero shadowBlur lag!)
   ===================================================== */

'use strict';

let particles = [];
let floatingTexts = [];
let fireworks = [];

const MAX_PARTICLES = 60; // Hard cap for 60fps smoothness

let screenShakeTimer = 0;
let screenShakeMagnitude = 0;

function triggerScreenShake(magnitude = 5, duration = 10) {
  screenShakeMagnitude = magnitude;
  screenShakeTimer = duration;
}

// ─────────────────────────────────────────────────────
//  Explosion Particles
// ─────────────────────────────────────────────────────
function createExplosion(x, y, color = '#ff8800', count = 16) {
  // If too many particles active, remove oldest
  if (particles.length + count > MAX_PARTICLES) {
    particles.splice(0, (particles.length + count) - MAX_PARTICLES);
  }

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4.2 + 1.2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 2.8 + 1.2,
      color: color,
      alpha: 1.0,
      decay: Math.random() * 0.045 + 0.03, // Fades quickly to free memory
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles(ctx) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
}

// ─────────────────────────────────────────────────────
//  Floating Score / Power-Up Notifications
// ─────────────────────────────────────────────────────
function addFloatingText(x, y, text, color = '#ffdd00') {
  if (floatingTexts.length > 8) {
    floatingTexts.shift();
  }
  floatingTexts.push({
    x,
    y,
    text,
    color,
    opacity: 1.0,
    speedY: -1.4,
    life: 45
  });
}

function updateFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.y += t.speedY;
    t.life--;
    t.opacity = t.life / 45;
    if (t.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

function drawFloatingTexts(ctx) {
  for (let i = 0; i < floatingTexts.length; i++) {
    const t = floatingTexts[i];
    ctx.globalAlpha = Math.max(0, t.opacity);
    ctx.font = '9px "Press Start 2P"';
    ctx.fillStyle = t.color;
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.globalAlpha = 1.0;
}

// ─────────────────────────────────────────────────────
//  Victory Fireworks 🎆
// ─────────────────────────────────────────────────────
function spawnFirework(canvasWidth, canvasHeight) {
  const colors = ['#00eaff', '#ff00aa', '#ffea00', '#00ff88', '#ff3366', '#ffffff'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * (canvasWidth - 80) + 40;
  const y = Math.random() * (canvasHeight * 0.5) + 60;
  createExplosion(x, y, color, 24);
  playSound('explosion');
}
