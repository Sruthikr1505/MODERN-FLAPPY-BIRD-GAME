(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const messageEl = document.getElementById('message');
    const restartBtn = document.getElementById('restart-btn');
    const instructionsEl = document.getElementById('instructions');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const gravity = 0.5;
    const jumpForce = 10;
    const pipeWidth = 60;
    const pipeGap = 160; 
    const pipeSpacing = 200; 
    const baseHeight = 100;
    const birdRadius = 15;
    const birdX = 80;
    let birdY, birdVelocity;
    let pipes = [];
    let frameCount = 0;
    let score = 0;
    let gameState = 'START'; 
    let lastTime = 0;
    const jump = () => {
      if (gameState === 'START') {
        startGame();
      }
      if (gameState === 'PLAYING') {
        birdVelocity = -jumpForce;
      }
      if (gameState === 'GAMEOVER') {
      }
    };
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
    const startGame = () => {
      gameState = 'PLAYING';
      messageEl.style.display = 'none';
      instructionsEl.style.display = 'none';
      spawnInitialPipes();
    };
    function spawnPipe(x) {
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
    function checkCollision() {
      if (birdY + birdRadius > HEIGHT - baseHeight) return true; 
      if (birdY - birdRadius < 0) return true; 
  
      for (const pipe of pipes) {
        if (birdX + birdRadius > pipe.x && birdX - birdRadius < pipe.x + pipeWidth) {
          if (birdY - birdRadius < pipe.top) return true;
          if (birdY + birdRadius > pipe.bottom) return true;
        }
      }
      return false;
    }
    function update(deltaTime) {
      if (gameState !== 'PLAYING') return;
      frameCount++;
      birdVelocity += gravity;
      birdY += birdVelocity;
      pipes.forEach(pipe => {
        pipe.x -= 3;
      });
      if (pipes.length && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
      }
      if (pipes.length && pipes[pipes.length - 1].x < WIDTH) {
        const lastPipeX = pipes[pipes.length - 1].x;
        pipes.push(spawnPipe(lastPipeX + pipeSpacing));
      }
      pipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipeWidth < birdX - birdRadius) {
          pipe.passed = true;
          score++;
          scoreEl.textContent = score;
        }
      });
      if (checkCollision()) {
        gameState = 'GAMEOVER';
        messageEl.textContent = 'Game Over! Your score: ' + score;
        messageEl.style.display = 'block';
        restartBtn.style.display = 'block';
        instructionsEl.style.display = 'none';
      }
    }
    function drawBackground() {
      ctx.fillStyle = '#debb6d';
      ctx.fillRect(0, HEIGHT - baseHeight, WIDTH, baseHeight);
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
      ctx.fillStyle = '#ffca28';
      ctx.beginPath();
      ctx.ellipse(birdX, birdY, birdRadius+3, birdRadius, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#bf8f00';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(birdX + 6, birdY - 5, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(birdX + 8, birdY - 5, 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e6af29';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(birdX - 3, birdY + 3);
      ctx.quadraticCurveTo(birdX + 10, birdY, birdX - 3, birdY - 10);
      ctx.stroke();
    }
  
    function drawPipes() {
      pipes.forEach(pipe => {
        ctx.fillStyle = '#2ecc71';
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 4;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, HEIGHT - baseHeight - pipe.bottom);
        ctx.strokeRect(pipe.x, pipe.bottom, pipeWidth, HEIGHT - baseHeight - pipe.bottom);
        ctx.fillStyle = '#27ae60';
        ctx.strokeStyle = '#145a32';
        ctx.beginPath();
        ctx.moveTo(pipe.x - 4, pipe.top);
        ctx.lineTo(pipe.x + pipeWidth + 4, pipe.top);
        ctx.lineTo(pipe.x + pipeWidth, pipe.top - 10);
        ctx.lineTo(pipe.x, pipe.top - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
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
    function setupControls() {
      document.body.addEventListener('keydown', e => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          jump();
        }
      });
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
      restartBtn.addEventListener('click', () => {
        restartGame();
      });
      restartBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          restartGame();
        }
      });
      canvas.setAttribute('tabindex', '0');
      canvas.focus();
    }
    function init() {
      restartGame();
      setupControls();
      requestAnimationFrame(loop);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  
