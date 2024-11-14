// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load bird image
const birdImg = new Image();
birdImg.src = 'images/bird.png';

// Game variables
let frames = 0;
let score = 0;
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
    rotation: 0,

    draw: function() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Rotate based on velocity
        this.rotation = this.velocity * 3;
        this.rotation = Math.max(-25, Math.min(this.rotation, 25)); // Limit rotation
        ctx.rotate(this.rotation * DEGREE);
        
        ctx.drawImage(birdImg, -this.width/2, -this.height/2, this.width, this.height);
        ctx.restore();
    },

    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;
    },

    flap: function() {
        this.velocity = this.lift;
    }
};

// Rest of your code remains unchanged from here
let initialPipeGap = 200;
let minPipeGap = 80;
let pipeGap = initialPipeGap;
let initialPipeWidth = 80;
let minPipeWidth = 40;
let pipeWidth = initialPipeWidth;
const pipeSpeed = 2;
const pipes = [];

function createPipe() {
    const maxPipeY = canvas.height - pipeGap - 50;
    const pipeY = Math.floor(Math.random() * maxPipeY) + 25;
    pipes.push({
        x: canvas.width,
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
            canvas.height - pipes[i].y - pipes[i].gap,
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
            (bird.y < pipes[i].y ||
                bird.y + bird.height > pipes[i].y + pipes[i].gap)
        ) {
            resetGame();
        }
    }

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

// Wait for image to load before starting
birdImg.onload = function() {
    loop();
};