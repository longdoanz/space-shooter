/* =====================================================
   💥 PARTICLES & EFFECTS MODULE (js/particles.js)
   Handles explosions, victory fireworks, sparks, floating
   score numbers, and screen shake juice!
   ===================================================== */

'use strict';

let particles = [];
let floatingTexts = [];
let fireworks = [];

let screenShakeTimer = 0;
let screenShakeMagnitude = 0;

function triggerScreenShake(magnitude = 6, duration = 12) {
  screenShakeMagnitude = magnitude;
  screenShakeTimer = duration;
}

// ─────────────────────────────────────────────────────
//  Explosion Particles
// ─────────────────────────────────────────────────────
function createExplosion(x, y, color = '#ff8800', count = 24) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4.8 + 1.2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 3.5 + 1.5,
      color: color,
      alpha: 1.0,
      decay: Math.random() * 0.035 + 0.02,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95; // Drag friction
    p.vy *= 0.95;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles(ctx) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─────────────────────────────────────────────────────
//  Floating Score / Power-Up Notifications
// ─────────────────────────────────────────────────────
function addFloatingText(x, y, text, color = '#ffdd00') {
  floatingTexts.push({
    x,
    y,
    text,
    color,
    opacity: 1.0,
    speedY: -1.4,
    life: 50
  });
}

function updateFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.y += t.speedY;
    t.life--;
    t.opacity = t.life / 50;
    if (t.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

function drawFloatingTexts(ctx) {
  for (const t of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, t.opacity);
    ctx.font = '10px "Press Start 2P"';
    ctx.fillStyle = t.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = t.color;
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }
}

// ─────────────────────────────────────────────────────
//  Victory Fireworks 🎆
// ─────────────────────────────────────────────────────
function spawnFirework(canvasWidth, canvasHeight) {
  const colors = ['#00eaff', '#ff00aa', '#ffea00', '#00ff88', '#ff3366', '#ffffff'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * (canvasWidth - 80) + 40;
  const y = Math.random() * (canvasHeight * 0.5) + 60;
  createExplosion(x, y, color, 35);
  playSound('explosion');
}
