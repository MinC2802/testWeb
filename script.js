/* ==========================
script.js
========================== */
/* Paste this into a separate file named script.js */

// Simple Geometry Dash-like one-button runner
(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const scoreEl = document.getElementById('score');

  const W = canvas.width;
  const H = canvas.height;

  // Game state
  let running = false;
  let lastTime = 0;
  let score = 0;
  let speed = 4;

  // Player
  const player = {
    x: 80,
    y: H - 50,
    w: 30,
    h: 30,
    vy: 0,
    gravity: 0.8,
    jumpPower: -14,
    onGround: true,
  };

  // Obstacles
  const obstacles = [];
  let spawnTimer = 0;
  const spawnInterval = 1200; // ms

  function reset() {
    running = false;
    score = 0;
    speed = 4;
    obstacles.length = 0;
    spawnTimer = 0;
    player.y = H - player.h - 20;
    player.vy = 0;
    player.onGround = true;
    scoreEl.textContent = score;
    restartBtn.disabled = true;
  }

  function start() {
    reset();
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
    restartBtn.disabled = false;
  }

  function gameOver() {
    running = false;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', W / 2, H / 2 - 10);
    ctx.font = '16px sans-serif';
    ctx.fillText('Press Restart to try again', W / 2, H / 2 + 20);
  }

  function spawnObstacle() {
    const h = 20 + Math.random() * 40;
    const w = 20 + Math.random() * 40;
    obstacles.push({x: W + 20, y: H - h - 20, w, h});
  }

  function update(dt) {
    // increase difficulty over time
    speed += dt * 0.0008; // slightly increase speed

    // spawn obstacles
    spawnTimer += dt;
    if (spawnTimer > spawnInterval) {
      spawnTimer = 0;
      spawnObstacle();
    }

    // player physics
    player.vy += player.gravity;
    player.y += player.vy;
    if (player.y + player.h >= H - 20) {
      player.y = H - player.h - 20;
      player.vy = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }

    // move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.x -= speed;
      if (ob.x + ob.w < -50) obstacles.splice(i, 1);

      // collision detection AABB
      if (
        player.x < ob.x + ob.w &&
        player.x + player.w > ob.x &&
        player.y < ob.y + ob.h &&
        player.y + player.h > ob.y
      ) {
        gameOver();
      }
    }

    // scoring
    score += dt * 0.01;
    scoreEl.textContent = Math.floor(score);
  }

  function draw() {
    // background
    ctx.clearRect(0, 0, W, H);

    // ground
    ctx.fillStyle = '#0a4860';
    ctx.fillRect(0, H - 20, W, 20);

    // player
    ctx.fillStyle = '#00d1ff';
    roundRect(ctx, player.x, player.y, player.w, player.h, 6, true, false);

    // obstacles
    ctx.fillStyle = '#ff6b6b';
    for (const ob of obstacles) {
      roundRect(ctx, ob.x, ob.y, ob.w, ob.h, 4, true, false);
    }

    // HUD
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(10, 10, 120, 28);
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + Math.floor(score), 18, 30);
  }

  function loop(now) {
    if (!running) return;
    const dt = now - lastTime;
    lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // helpers
  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  // input
  function jump() {
    if (!running) return;
    if (player.onGround) {
      player.vy = player.jumpPower;
      player.onGround = false;
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  });

  canvas.addEventListener('click', jump);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, {passive:false});

  startBtn.addEventListener('click', () => start());
  restartBtn.addEventListener('click', () => start());

  // Initialize
  reset();

})();
