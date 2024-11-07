// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let frames = 0;
let score = 0;  // Added score variable
const DEGREE = Math.PI / 180;

// Bird object
const bird = {
    x: 50,
    y: 150,
    width: 34,
    height: 26,
    gravity: 0.25,
    lift: -6,
    velocity: 0,

    draw: function() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;
    },

    flap: function() {
        this.velocity = this.lift;
    }
};

// Pipe variables
let initialPipeGap = 200; // Starting gap size between pipes
let minPipeGap = 80;      // Minimum gap size to prevent impossibility
let pipeGap = initialPipeGap; // Current gap size

let initialPipeWidth = 80; // Starting pipe width
let minPipeWidth = 40;     // Minimum pipe width
let pipeWidth = initialPipeWidth; // Current pipe width

const pipeSpeed = 2;

// Pipe array
const pipes = [];

// Create pipes at intervals
function createPipe() {
    const maxPipeY = canvas.height - pipeGap - 50;
    const pipeY = Math.floor(Math.random() * maxPipeY) + 25;
    pipes.push({
        x: canvas.width,
        y: pipeY,
        width: pipeWidth,
        gap: pipeGap,
        passed: false  // New property to track if pipe has been passed
    });
}

// Update pipes position
function updatePipes() {
    if (frames % 150 === 0) {
        createPipe();
    }

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;

        // Check if the bird has passed the pipe
        if (!pipes[i].passed && pipes[i].x + pipes[i].width < bird.x) {
            pipes[i].passed = true;
            score++;  // Increment score when bird passes a pipe
        }

        // Remove pipes that have gone off screen
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = 'green';
    for (let i = 0; i < pipes.length; i++) {
        // Top pipe
        ctx.fillRect(pipes[i].x, 0, pipes[i].width, pipes[i].y);
        // Bottom pipe
        ctx.fillRect(
            pipes[i].x,
            pipes[i].y + pipes[i].gap,
            pipes[i].width,
            canvas.height - pipes[i].y - pipes[i].gap
        );
    }
}

// Collision detection
function checkCollision() {
    // Check collision with pipes
    for (let i = 0; i < pipes.length; i++) {
        if (
            bird.x < pipes[i].x + pipes[i].width &&
            bird.x + bird.width > pipes[i].x &&
            (bird.y < pipes[i].y ||
                bird.y + bird.height > pipes[i].y + pipes[i].gap)
        ) {
            resetGame();
        }
    }

    // Check collision with ground and ceiling
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        resetGame();
    }
}

// Reset game
function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    frames = 0;
    pipeGap = initialPipeGap;      // Reset the pipe gap
    pipeWidth = initialPipeWidth;  // Reset the pipe width
    score = 0;                     // Reset the score
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.draw();
    drawPipes();
    drawScore();  // Call the new function to draw the score
}

// Update game logic
function update() {
    bird.update();
    updatePipes();
    checkCollision();

    // Gradually decrease the pipe gap and width over time
    if (pipeGap > minPipeGap) {
        pipeGap -= 0.05; // Adjust this value to change the rate of decrease
    }
    if (pipeWidth > minPipeWidth) {
        pipeWidth -= 0.005; // Adjust this value to change the rate of decrease
    }
}

// Draw the score on the canvas
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Score: ' + score, 10, 40);
}

// Game loop
function loop() {
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}

// Control the bird with mouse click or spacebar
canvas.addEventListener('click', function() {
    bird.flap();
});

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        bird.flap();
    }
});

// Start the game
loop();
