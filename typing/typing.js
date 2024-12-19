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
let gameStarted = false;

const wordContainer = document.getElementById('word-container');
const accuracyElement = document.getElementById('accuracy');
const wpmElement = document.getElementById('wpm');
const startButton = document.getElementById('start');
const restartButton = document.getElementById('restart');

// Generate a sequence of words for the test
function generateWords(count = 60) {
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

        // Add a space after the word, except for the last one
        if (wIndex < currentWords.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            spaceSpan.classList.add('char');
            spanWord.appendChild(spaceSpan);
        }

        wordContainer.appendChild(spanWord);
    });
    highlightCurrentChar();
}

function highlightCurrentChar() {
    const chars = document.querySelectorAll('.char');
    chars.forEach(c => c.classList.remove('active-char'));
    if (currentIndex < chars.length) {
        chars[currentIndex].classList.add('active-char');
    }
}

function calculateStats() {
    const accuracy = (correctTyped / totalTyped) * 100 || 0;
    accuracyElement.textContent = accuracy.toFixed(1);

    // WPM approximation: (correctTyped/5)
    const wpm = (correctTyped / 5);
    wpmElement.textContent = Math.floor(wpm);
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;

    correctTyped = 0;
    totalTyped = 0;
    currentIndex = 0;
    accuracyElement.textContent = '100';
    wpmElement.textContent = '0';

    currentWords = generateWords();
    displayWords();
    document.addEventListener('keydown', handleKeyPress);
}

function restartGame() {
    gameStarted = false;
    document.removeEventListener('keydown', handleKeyPress);
    wordContainer.innerHTML = '';
    accuracyElement.textContent = '100';
    wpmElement.textContent = '0';
    correctTyped = 0;
    totalTyped = 0;
    currentIndex = 0;
}

function handleKeyPress(e) {
    const chars = document.querySelectorAll('.char');
    if (currentIndex >= chars.length) return; // No more chars

    if (e.key.length > 1 && e.key !== 'Backspace') {
        return;
    }

    if (e.key === 'Backspace') {
        if (currentIndex > 0) {
            currentIndex--;
            chars[currentIndex].classList.remove('correct', 'incorrect');
            totalTyped = Math.max(0, totalTyped - 1);
            highlightCurrentChar();
            calculateStats();
        }
        return;
    }

    let typed = e.key;
    const currentChar = chars[currentIndex];
    const expected = currentChar.textContent;

    if (e.key === 'Enter') return;

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
    highlightCurrentChar();
    calculateStats();
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
