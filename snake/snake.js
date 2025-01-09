const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;                  // Size of each grid square
const canvasSize = canvas.width; // Assume a square canvas

// The snake: an array of segments, starting at (8*box, 8*box)
let snake = [
  { x: 8 * box, y: 8 * box }
];

// Movement direction
let direction = "RIGHT";

// Food as a random red square
let food = {
  x: Math.floor(Math.random() * (canvasSize / box)) * box,
  y: Math.floor(Math.random() * (canvasSize / box)) * box
};

// Score
let score = 0;
document.getElementById("score").textContent = score;

// Game Over state
let isGameOver = false;

// For slower movement, we only update the snake every X ms
const moveDelay = 200; // e.g. 200ms => ~5 moves/sec
let lastTime = 0;

// Overlay and finalScore elements
const gameOverOverlay = document.getElementById("gameOverOverlay");
const finalScoreElement = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

restartBtn.addEventListener("click", restartGame);

// Also allow pressing Enter to restart
document.addEventListener("keydown", (e) => {
  if (isGameOver && e.key === "Enter") {
    restartGame();
  }
});

// Listen for arrow keys to change direction
document.addEventListener("keydown", changeDirection);

function changeDirection(e) {
  const key = e.keyCode;
  // 37: left, 38: up, 39: right, 40: down
  if (key === 37 && direction !== "RIGHT") direction = "LEFT";
  else if (key === 38 && direction !== "DOWN") direction = "UP";
  else if (key === 39 && direction !== "LEFT") direction = "RIGHT";
  else if (key === 40 && direction !== "UP") direction = "DOWN";
}

// Main update logic
function update() {
  if (isGameOver) return;

  // Move the snake's head
  let head = { x: snake[0].x, y: snake[0].y };

  if (direction === "LEFT")  head.x -= box;
  if (direction === "UP")    head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN")  head.y += box;

  // Wrap-around logic
  head.x = (head.x + canvasSize) % canvasSize;
  head.y = (head.y + canvasSize) % canvasSize;

  // Check if snake eats the food
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").textContent = score;

    // Random new food location
    food = {
      x: Math.floor(Math.random() * (canvasSize / box)) * box,
      y: Math.floor(Math.random() * (canvasSize / box)) * box
    };
    // No snake pop here, so it grows
  } else {
    // If no food eaten, remove the tail
    snake.pop();
  }

  // Check collision with itself
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      // Game Over
      endGame();
      return;
    }
  }

  // Add the new head
  snake.unshift(head);
}

// Draw everything
function draw() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw the food (red square)
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // Draw the snake
  for (let segment of snake) {
    ctx.fillStyle = "lime";
    ctx.fillRect(segment.x, segment.y, box, box);
  }
}

// Throttled game loop using requestAnimationFrame
function gameLoop(timestamp) {
  if (!isGameOver) {
    // Only update movement every moveDelay ms
    if (timestamp - lastTime >= moveDelay) {
      update();
      lastTime = timestamp;
    }
  }

  // Always draw (makes the movement smoother even if the snake only updates occasionally)
  draw();

  requestAnimationFrame(gameLoop);
}

// End Game
function endGame() {
  isGameOver = true;
  finalScoreElement.textContent = score;
  gameOverOverlay.classList.remove("hidden");
}

// Restart
function restartGame() {
  isGameOver = false;
  gameOverOverlay.classList.add("hidden");

  score = 0;
  document.getElementById("score").textContent = score;

  // Reset snake
  snake = [{ x: 8 * box, y: 8 * box }];
  direction = "RIGHT";

  // Reset food position
  food = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box
  };

  // Reset timing
  lastTime = 0;

  // Re-run the loop
  requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop);
