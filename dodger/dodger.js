const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Adjust canvas size
canvas.width = 600;
canvas.height = 600;

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 3,
    baseSpeed: 3,
    color: 'lightblue',
};

// Enemies array
const enemies = [];
const enemySize = 30;

// Key tracking
const keys = {};

// Score and game state
let score = 0;
let gameActive = true;
let enemySpawner;

// DOM elements
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restartBtn');

// Event listeners for keyboard controls
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Movement function
function movePlayer() {
    if ((keys['w'] || keys['W']) && player.y > 0) player.y -= player.speed;
    if ((keys['s'] || keys['S']) && player.y < canvas.height - player.size) player.y += player.speed;
    if ((keys['a'] || keys['A']) && player.x > 0) player.x -= player.speed;
    if ((keys['d'] || keys['D']) && player.x < canvas.width - player.size) player.x += player.speed;
}

// Enemy creation
function spawnEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - enemySize),
        y: Math.random() * (canvas.height - enemySize),
        dx: Math.random() > 0.5 ? 1 : -1,
        dy: Math.random() > 0.5 ? 1 : -1,
        speed: 2,
        size: enemySize,
        color: 'red',
    };
    enemies.push(enemy);
}

// Enemy movement
function moveEnemies() {
    enemies.forEach((enemy) => {
        enemy.x += enemy.dx * enemy.speed;
        enemy.y += enemy.dy * enemy.speed;

        // Bounce off walls
        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.size) enemy.dx *= -1;
        if (enemy.y <= 0 || enemy.y >= canvas.height - enemy.size) enemy.dy *= -1;
    });
}

// Collision detection
function checkCollisions() {
    for (let enemy of enemies) {
        if (
            player.x < enemy.x + enemy.size &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.size > enemy.y
        ) {
            gameOver();
            return true;
        }
    }
    return false;
}

// Draw player and enemies
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    });
}

// Display score
function updateScore() {
    scoreDisplay.textContent = score;
}

// Game over
function gameOver() {
    gameActive = false;
    clearInterval(enemySpawner);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Game Over! Final Score: ${score}`, canvas.width / 4, canvas.height / 2);
}

// Restart the game
function restartGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.speed = player.baseSpeed;
    enemies.length = 0;
    score = 0;
    updateScore();
    gameActive = true;
    clearInterval(enemySpawner);
    startGame();
}

// Start game
function startGame() {
    enemySpawner = setInterval(() => {
        if (gameActive) {
            spawnEnemy();
            score++;
            updateScore();
            player.speed += 0.1; // Increase player speed slightly with each enemy
        }
    }, 2000);

    gameLoop();
}

// Main game loop
function gameLoop() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Ghost effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
        // Update player movement
        movePlayer();

        // Move and draw enemies
        moveEnemies();
        drawEnemies();

        // Check collisions
        checkCollisions();

        // Draw player
        drawPlayer();

        requestAnimationFrame(gameLoop);
    }
}

// Event listener for the restart button
restartButton.addEventListener('click', restartGame);

// Initialize game
startGame();
