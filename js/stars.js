/* =====================================================
   🌟 STARFIELD MODULE (js/stars.js)
   Renders a 3D parallax starfield with multiple speed layers
   ===================================================== */

'use strict';

let stars = [];

function createStars(canvasWidth, canvasHeight) {
  stars = [];
  const NUM_STARS = 110;
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
      x:       Math.random() * canvasWidth,
      y:       Math.random() * canvasHeight,
      radius:  Math.random() * 1.6 + 0.3,
      speed:   Math.random() * 1.6 + 0.3, // Faster = closer, slower = farther
      opacity: Math.random() * 0.7 + 0.3,
    });
  }
}

function updateStars(canvasWidth, canvasHeight) {
  for (const star of stars) {
    star.y += star.speed;
    if (star.y > canvasHeight) {
      star.y = 0;
      star.x = Math.random() * canvasWidth;
    }
  }
}

function drawStars(ctx) {
  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.fill();
  }
}
