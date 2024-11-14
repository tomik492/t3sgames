// Game title and aesthetics improvements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
let initialPipeWidth = 80;
let minPipeWidth = 40;
let pipeWidth = initialPipeWidth;
const pipeSpeed = 2;
const pipes = [];
let frames = 0;
let score = 0;
let initialPipeGap = 200;
let minPipeGap = 80;
let pipeGap = initialPipeGap;
const DEGREE = Math.PI / 180;

// Add title element to the page
document.body.insertAdjacentHTML('beforebegin', `
    <div id="game-header" style="text-align: center; padding: 20px; font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; background-color: #FFDD57;">
        Flappy Bird Clone
    </div>
`);

// CSS for responsive scaling
document.body.insertAdjacentHTML('beforeend', `
    <style>
        #gameCanvas {
            display: block;
            margin: 0 auto;
            border: 2px solid #333;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #F0F0F0;
            margin: 0;
        }
        @media (min-width: 768px) {
            #gameCanvas {
                width: 35vw;
                height: calc(35vw * 1.5);
                max-width: 500px;
                max-height: 750px;
            }
        }
        @media (max-width: 768px) {
            #gameCanvas {
                width: 85vw;
                height: calc(85vw * 1.5);
            }
        }
    </style>
`);

// Resize canvas to maintain aspect ratio
function resizeCanvas() {
    const aspectRatio = GAME_WIDTH / GAME_HEIGHT;
    const scaleFactor = Math.min(window.innerWidth / (GAME_WIDTH * 1.1), window.innerHeight / (GAME_HEIGHT * 1.1), 1);
    canvas.width = GAME_WIDTH * scaleFactor;
    canvas.height = GAME_HEIGHT * scaleFactor;
    ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Bird object
const bird = {
    x: 50,
    y: 150,
    width: 34,
    height: 26,
    gravity: 0.25,
    lift: -6,
    velocity: 0,
    rotation: 0,

    draw: function() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Rotate based on velocity
        this.rotation = this.velocity * 3;
        this.rotation = Math.max(-25, Math.min(this.rotation, 25)); // Limit rotation
        ctx.rotate(this.rotation * DEGREE);

        ctx.drawImage(birdImg, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    },

    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Prevent bird from going out of bounds
        if (this.y + this.height > GAME_HEIGHT) {
            this.y = GAME_HEIGHT - this.height;
            this.velocity = 0;
        } else if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },

    flap: function() {
        this.velocity = this.lift;
    }
};

function createPipe() {
    const maxPipeY = GAME_HEIGHT - pipeGap - 50;
    const pipeY = Math.floor(Math.random() * maxPipeY) + 25;
    pipes.push({
        x: GAME_WIDTH,
        y: pipeY,
        width: pipeWidth,
        gap: pipeGap,
        passed: false
    });
}

function updatePipes() {
    if (frames % 150 === 0) {
        createPipe();
    }

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;

        if (!pipes[i].passed && pipes[i].x + pipes[i].width < bird.x) {
            pipes[i].passed = true;
            score++;
        }

        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }
}

function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        // Colors for pipe styling
        const pipeColor = '#74BF2E';
        const highlightColor = '#8ED53A';
        const shadowColor = '#5CA918';
        const borderColor = '#534D48';

        // Draw top pipe
        drawStylizedPipe(
            pipes[i].x,
            0,
            pipes[i].width,
            pipes[i].y,
            true,
            pipeColor,
            highlightColor,
            shadowColor,
            borderColor
        );

        // Draw bottom pipe
        drawStylizedPipe(
            pipes[i].x,
            pipes[i].y + pipes[i].gap,
            pipes[i].width,
            GAME_HEIGHT - pipes[i].y - pipes[i].gap,
            false,
            pipeColor,
            highlightColor,
            shadowColor,
            borderColor
        );
    }
}

function drawStylizedPipe(x, y, width, height, isTop, mainColor, highlightColor, shadowColor, borderColor) {
    const capHeight = 40;

    ctx.fillStyle = mainColor;

    // Main pipe body
    ctx.fillRect(x, y + (isTop ? capHeight : 0), width, height - capHeight);

    // Pipe cap
    ctx.fillRect(x - 5, isTop ? y + height - capHeight : y, width + 10, capHeight);

    // Highlights
    ctx.fillStyle = highlightColor;
    ctx.fillRect(x + 3, y + (isTop ? capHeight : 0), 5, height - capHeight);

    // Shadows
    ctx.fillStyle = shadowColor;
    ctx.fillRect(x + width - 8, y + (isTop ? capHeight : 0), 5, height - capHeight);

    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;

    // Main pipe borders
    ctx.strokeRect(x, y + (isTop ? capHeight : 0), width, height - capHeight);

    // Cap borders
    ctx.strokeRect(x - 5, isTop ? y + height - capHeight : y, width + 10, capHeight);
}

function checkCollision() {
    for (let i = 0; i < pipes.length; i++) {
        if (
            bird.x < pipes[i].x + pipes[i].width &&
            bird.x + bird.width > pipes[i].x &&
            (bird.y < pipes[i].y || bird.y + bird.height > pipes[i].y + pipes[i].gap)
        ) {
            resetGame();
        }
    }

    if (bird.y + bird.height > GAME_HEIGHT || bird.y < 0) {
        resetGame();
    }
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    frames = 0;
    pipeGap = initialPipeGap;
    pipeWidth = initialPipeWidth;
    score = 0;
}

function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bird.draw();
    drawPipes();
    drawScore();
}

function update() {
    bird.update();
    updatePipes();
    checkCollision();

    if (pipeGap > minPipeGap) {
        pipeGap -= 0.05;
    }
    if (pipeWidth > minPipeWidth) {
        pipeWidth -= 0.005;
    }
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Score: ' + score, 10, 40);
}

function loop() {
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}

canvas.addEventListener('click', function() {
    bird.flap();
});

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        bird.flap();
    }
});

// Load bird image
const birdImg = new Image();
birdImg.src = 'images/bird.png';

// Wait for image to load before starting
birdImg.onload = function() {
    loop();
};