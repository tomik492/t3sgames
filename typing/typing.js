// A balanced word list for practice
const WORDS = [
    "consistency", "accuracy", "develop", "typing", "improve", "precision", "enjoy", "focus",
    "speed", "skill", "practice", "enhance", "keyboard", "technique", "challenge", "fire",
    "gaming", "rhythm", "smooth", "champion", "impressive", "balance", "random", "flow", 
    "experience", "mastery", "method", "attain", "result", "effort", "success", "creative",
    "interval", "manage", "achieve", "progress", "maintain", "session", "lightning", "control",
    "music", "harmony", "endurance", "stamina", "wisdom", "logic", "energy", "training"
];

let currentWords = [];
let currentIndex = 0;
let correctTyped = 0;
let totalTyped = 0;
let timer = 60;
let timerInterval = null;
let gameStarted = false;
let gameEnded = false;

const wordContainer = document.getElementById('word-container');
const timeLeftElement = document.getElementById('time-left');
const accuracyElement = document.getElementById('accuracy');
const wpmElement = document.getElementById('wpm');
const startButton = document.getElementById('start');
const restartButton = document.getElementById('restart');
const cursor = document.getElementById('cursor');
const container = document.querySelector('.container');

// Generate a sequence of words for the test
function generateWords(count = 40) {
    const words = [];
    for (let i = 0; i < count; i++) {
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        words.push(randomWord);
    }
    return words;
}

function displayWords() {
    wordContainer.innerHTML = '';
    currentWords.forEach((word, wIndex) => {
        const spanWord = document.createElement('span');
        spanWord.classList.add('word');
        
        // Each letter wrapped in a span
        word.split('').forEach((char) => {
            const spanChar = document.createElement('span');
            spanChar.textContent = char;
            spanChar.classList.add('char');
            spanWord.appendChild(spanChar);
        });

        // Add space after word, except for last one
        if (wIndex < currentWords.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            spaceSpan.classList.add('char');
            spanWord.appendChild(spaceSpan);
        }

        wordContainer.appendChild(spanWord);
    });
}

// Update cursor position
function updateCursor() {
    const chars = document.querySelectorAll('.char');
    chars.forEach(c => c.classList.remove('active-cursor'));

    if (currentIndex < chars.length) {
        const currentChar = chars[currentIndex];
        const rect = currentChar.getBoundingClientRect();
        const containerRect = wordContainer.getBoundingClientRect();
        
        cursor.style.top = (rect.bottom - containerRect.top) + 5 + 'px';
        cursor.style.left = rect.left - containerRect.left + 'px';
        currentChar.classList.add('active-cursor');
    } else {
        // If at the end
        cursor.style.top = '0px';
        cursor.style.left = '0px';
    }
}

// Calculate accuracy and WPM
function calculateStats() {
    const accuracy = (correctTyped / totalTyped) * 100 || 0;
    accuracyElement.textContent = accuracy.toFixed(1);

    const elapsed = 60 - timer; 
    const wordsTyped = totalTyped / 5; 
    const wpm = elapsed > 0 ? (wordsTyped / (elapsed / 60)) : 0;
    wpmElement.textContent = Math.floor(wpm);
}

function endGame() {
    gameEnded = true;
    clearInterval(timerInterval);
    document.removeEventListener('keydown', handleKeyPress);
    startButton.disabled = true;
    restartButton.disabled = false;

    // Move cursor off screen as game ends
    cursor.style.opacity = 0;
    // Show final alert or result
    alert(`Time's up! \nWPM: ${wpmElement.textContent}\nAccuracy: ${accuracyElement.textContent}%`);
}

function handleTimer() {
    timer--;
    timeLeftElement.textContent = timer;
    if (timer <= 0) {
        endGame();
    }
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    gameEnded = false;
    timer = 60;
    correctTyped = 0;
    totalTyped = 0;
    currentIndex = 0;
    timeLeftElement.textContent = timer;
    accuracyElement.textContent = '100';
    wpmElement.textContent = '0';
    startButton.disabled = true;
    restartButton.disabled = true;

    // Generate and display words
    currentWords = generateWords(60); 
    displayWords();
    cursor.style.opacity = 1;
    updateCursor();
    document.addEventListener('keydown', handleKeyPress);

    timerInterval = setInterval(handleTimer, 1000);
}

function restartGame() {
    if (timerInterval) clearInterval(timerInterval);
    gameStarted = false;
    gameEnded = false;
    startButton.disabled = false;
    restartButton.disabled = true;
    wordContainer.innerHTML = '';
    cursor.style.opacity = 0;
    accuracyElement.textContent = '100';
    wpmElement.textContent = '0';
    timeLeftElement.textContent = '60';
}

function handleKeyPress(e) {
    if (gameEnded) return;

    const chars = document.querySelectorAll('.char');
    if (currentIndex >= chars.length) return; // No more chars to type
    
    const currentChar = chars[currentIndex];
    const expected = currentChar.textContent;
    let typed = e.key;
    
    // Only consider a-z, space, punctuation etc.
    // Ignore special keys except Backspace
    if (e.key.length > 1 && e.key !== 'Backspace') {
        return; 
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
        if (currentIndex > 0) {
            // Move one character back
            currentIndex--;
            chars[currentIndex].classList.remove('correct', 'incorrect');
            totalTyped = Math.max(0, totalTyped - 1);
            updateCursor();
            calculateStats();
        }
        return;
    }

    // Compare typed character
    if (typed === expected) {
        currentChar.classList.remove('incorrect');
        currentChar.classList.add('correct');
        correctTyped++;
    } else {
        currentChar.classList.remove('correct');
        currentChar.classList.add('incorrect');
    }

    totalTyped++;
    currentIndex++;
    updateCursor();
    calculateStats();
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
