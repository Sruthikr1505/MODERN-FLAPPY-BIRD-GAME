(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const messageEl = document.getElementById('message');
    const restartBtn = document.getElementById('restart-btn');
    const instructionsEl = document.getElementById('instructions');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
  
    // Game settings
    const gravity = 0.5;
    const jumpForce = 10;
    const pipeWidth = 60;
    const pipeGap = 160; // gap between top and bottom pipe
    const pipeSpacing = 200; // distance between pipes horizontally
    const baseHeight = 100;
  
    // Bird sprite style
    const birdRadius = 15;
    const birdX = 80;
  
    let birdY, birdVelocity;
    let pipes = [];
    let frameCount = 0;
    let score = 0;
    let gameState = 'START'; // START | PLAYING | GAMEOVER
  
    // For smooth animation timing
    let lastTime = 0;
  
    // Event handlers
    const jump = () => {
      if (gameState === 'START') {
        startGame();
      }
      if (gameState === 'PLAYING') {
        birdVelocity = -jumpForce;
      }
      if (gameState === 'GAMEOVER') {
        // do nothing, wait for restart
      }
    };
  
    // Restart game function
    const restartGame = () => {
      score = 0;
      birdY = HEIGHT / 2;
      birdVelocity = 0;
      pipes = [];
      frameCount = 0;
      gameState = 'START';
      scoreEl.textContent = score;
      messageEl.textContent = 'Press Space or Tap to Start';
      messageEl.style.display = 'block';
      restartBtn.style.display = 'none';
      instructionsEl.style.display = 'block';
    };
  
    // Start game function
    const startGame = () => {
      gameState = 'PLAYING';
      messageEl.style.display = 'none';
      instructionsEl.style.display = 'none';
      spawnInitialPipes();
    };
  
    // Generate pipes
    function spawnPipe(x) {
      // random height for top pipe
      const topPipeHeight = Math.floor(Math.random() * (HEIGHT - baseHeight - pipeGap - 80)) + 40;
      return {
        x,
        top: topPipeHeight,
        bottom: topPipeHeight + pipeGap,
        passed: false
      };
    }
  
    function spawnInitialPipes() {
      pipes = [];
      let startX = WIDTH + 100;
      for (let i = 0; i < 3; i++) {
        pipes.push(spawnPipe(startX + i * pipeSpacing));
      }
    }
  
    // Check collision bird vs pipes or ground/ceiling
    function checkCollision() {
      if (birdY + birdRadius > HEIGHT - baseHeight) return true; // hit ground
      if (birdY - birdRadius < 0) return true; // hit ceiling
  
      for (const pipe of pipes) {
        // Check if bird is within pipe x range
        if (birdX + birdRadius > pipe.x && birdX - birdRadius < pipe.x + pipeWidth) {
          // Check if bird hits top pipe
          if (birdY - birdRadius < pipe.top) return true;
          // Check if bird hits bottom pipe
          if (birdY + birdRadius > pipe.bottom) return true;
        }
      }
      return false;
    }
  
    // Update game each frame
    function update(deltaTime) {
      if (gameState !== 'PLAYING') return;
  
      frameCount++;
  
      birdVelocity += gravity;
      birdY += birdVelocity;
  
      // Move pipes left
      pipes.forEach(pipe => {
        pipe.x -= 3;
      });
  
      // Remove pipes that are off screen
      if (pipes.length && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
      }
  
      // Add new pipe if needed
      if (pipes.length && pipes[pipes.length - 1].x < WIDTH) {
        const lastPipeX = pipes[pipes.length - 1].x;
        pipes.push(spawnPipe(lastPipeX + pipeSpacing));
      }
  
      // Check score gain
      pipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipeWidth < birdX - birdRadius) {
          pipe.passed = true;
          score++;
          scoreEl.textContent = score;
        }
      });
  
      // Check collisions
      if (checkCollision()) {
        gameState = 'GAMEOVER';
        messageEl.textContent = 'Game Over! Your score: ' + score;
        messageEl.style.display = 'block';
        restartBtn.style.display = 'block';
        instructionsEl.style.display = 'none';
      }
    }
  
    // Draw functions
    function drawBackground() {
      // sky gradient already by CSS, draw ground
      ctx.fillStyle = '#debb6d';
      ctx.fillRect(0, HEIGHT - baseHeight, WIDTH, baseHeight);
  
      // Draw grass on ground
      ctx.fillStyle = '#7ab55c';
      for (let i = 0; i < WIDTH; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i, HEIGHT - baseHeight);
        ctx.lineTo(i + 5, HEIGHT - baseHeight - 15);
        ctx.lineTo(i + 10, HEIGHT - baseHeight);
        ctx.fill();
      }
    }
  
    function drawBird() {
      // Simple circle bird with eye and wing shape for style
  
      // Body
      ctx.fillStyle = '#ffca28';
      ctx.beginPath();
      ctx.ellipse(birdX, birdY, birdRadius+3, birdRadius, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#bf8f00';
      ctx.lineWidth = 2;
      ctx.stroke();
  
      // Eye
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(birdX + 6, birdY - 5, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(birdX + 8, birdY - 5, 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
  
      // Wing (simple arc)
      ctx.strokeStyle = '#e6af29';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(birdX - 3, birdY + 3);
      ctx.quadraticCurveTo(birdX + 10, birdY, birdX - 3, birdY - 10);
      ctx.stroke();
    }
  
    function drawPipes() {
      pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#2ecc71';
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 4;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);
  
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, HEIGHT - baseHeight - pipe.bottom);
        ctx.strokeRect(pipe.x, pipe.bottom, pipeWidth, HEIGHT - baseHeight - pipe.bottom);
  
        // Pipe caps (rounded)
        ctx.fillStyle = '#27ae60';
        ctx.strokeStyle = '#145a32';
        // top pipe cap
        ctx.beginPath();
        ctx.moveTo(pipe.x - 4, pipe.top);
        ctx.lineTo(pipe.x + pipeWidth + 4, pipe.top);
        ctx.lineTo(pipe.x + pipeWidth, pipe.top - 10);
        ctx.lineTo(pipe.x, pipe.top - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
  
        // bottom pipe cap
        ctx.beginPath();
        ctx.moveTo(pipe.x - 4, pipe.bottom);
        ctx.lineTo(pipe.x + pipeWidth + 4, pipe.bottom);
        ctx.lineTo(pipe.x + pipeWidth, pipe.bottom + 10);
        ctx.lineTo(pipe.x, pipe.bottom + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    }
  
    function clear() {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  
    // Main loop
    function loop(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
  
      update(deltaTime);
      clear();
      drawBackground();
      drawPipes();
      drawBird();
  
      requestAnimationFrame(loop);
    }
  
    // Event listeners for controls
    function setupControls() {
      document.body.addEventListener('keydown', e => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          jump();
        }
      });
  
      // Mobile touch
      let touchActive = false;
  
      document.body.addEventListener('touchstart', e => {
        if (!touchActive) {
          touchActive = true;
          jump();
        }
      });
      document.body.addEventListener('touchend', e => {
        touchActive = false;
      });
  
      // Restart button
      restartBtn.addEventListener('click', () => {
        restartGame();
      });
  
      // Accessibility: allow Enter key to restart
      restartBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          restartGame();
        }
      });
  
      // Canvas focus default for keyboard play
      canvas.setAttribute('tabindex', '0');
      canvas.focus();
    }
  
    // Initialize
    function init() {
      restartGame();
      setupControls();
      requestAnimationFrame(loop);
    }
  
    // Run init once DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  