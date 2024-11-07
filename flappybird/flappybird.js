// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let frames = 0;
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

// Pipe array
const pipes = [];
const pipeWidth = 60;
const pipeGap = 120;
const pipeSpeed = 2;

// Create pipes at intervals
function createPipe() {
    const pipeY = Math.floor(Math.random() * (canvas.height - pipeGap - 50)) + 25;
    pipes.push({
        x: canvas.width,
        y: pipeY
    });
}

// Update pipes position
function updatePipes() {
    if (frames % 150 === 0) {
        createPipe();
    }

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;

        // Remove pipes that have gone off screen
        if (pipes[i].x + pipeWidth < 0) {
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
        ctx.fillRect(pipes[i].x, 0, pipeWidth, pipes[i].y);
        // Bottom pipe
        ctx.fillRect(
            pipes[i].x,
            pipes[i].y + pipeGap,
            pipeWidth,
            canvas.height - pipes[i].y - pipeGap
        );
    }
}

// Collision detection
function checkCollision() {
    // Check collision with pipes
    for (let i = 0; i < pipes.length; i++) {
        if (
            bird.x < pipes[i].x + pipeWidth &&
            bird.x + bird.width > pipes[i].x &&
            (bird.y < pipes[i].y ||
                bird.y + bird.height > pipes[i].y + pipeGap)
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
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.draw();
    drawPipes();
}

// Update game logic
function update() {
    bird.update();
    updatePipes();
    checkCollision();
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

