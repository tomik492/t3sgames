document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const cells = [];
    const playerSymbol = "X";
    const aiSymbol = "O";
    let gameOver = false;

    // Initialize board
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", playerMove);
        board.appendChild(cell);
        cells.push(cell);
    }

    function playerMove(event) {
        if (gameOver) return;
        const cell = event.target;
        if (!cell.classList.contains("taken")) {
            cell.textContent = playerSymbol;
            cell.classList.add("taken");
            if (checkWin(playerSymbol)) {
                displayResult("You win!", "green");
                gameOver = true;
                return;
            }
            aiMove();
        }
    }

    function aiMove() {
        if (gameOver) return;
        const bestMove = findBestMove();
        if (bestMove !== null) {
            const cell = cells[bestMove];
            cell.textContent = aiSymbol;
            cell.classList.add("taken");
            if (checkWin(aiSymbol)) {
                displayResult("AI wins!", "red");
                gameOver = true;
            }
        } else {
            displayResult("It's a draw!", "orange");
            gameOver = true;
        }
    }

    function findBestMove() {
        // Advanced strategy: try to win, block opponent, prioritize longer sequences, or pick a random cell
        for (let i = 0; i < cells.length; i++) {
            if (!cells[i].classList.contains("taken")) {
                // Try to win
                cells[i].textContent = aiSymbol;
                if (checkWin(aiSymbol)) {
                    cells[i].textContent = "";
                    return i;
                }
                cells[i].textContent = "";

                // Try to block opponent
                cells[i].textContent = playerSymbol;
                if (checkWin(playerSymbol)) {
                    cells[i].textContent = "";
                    return i;
                }
                cells[i].textContent = "";
            }
        }

        // Prioritize moves that extend a sequence of the AI's symbols
        for (let i = 0; i < cells.length; i++) {
            if (!cells[i].classList.contains("taken")) {
                const neighbors = getNeighbors(i);
                if (neighbors.some(cell => cell.textContent === aiSymbol)) {
                    return i;
                }
            }
        }

        // Pick a random available cell
        const availableCells = cells.filter(cell => !cell.classList.contains("taken"));
        if (availableCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            return cells.indexOf(availableCells[randomIndex]);
        }
        return null;
    }

    function checkWin(symbol) {
        // Check rows, columns, and diagonals for a 5-in-a-row win
        // Check rows
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col <= 5; col++) {
                if (cells.slice(row * 10 + col, row * 10 + col + 5).every(cell => cell.textContent === symbol)) {
                    return true;
                }
            }
        }
        // Check columns
        for (let col = 0; col < 10; col++) {
            for (let row = 0; row <= 5; row++) {
                if (cells.filter((_, index) => index % 10 === col && Math.floor(index / 10) >= row && Math.floor(index / 10) < row + 5).every(cell => cell.textContent === symbol)) {
                    return true;
                }
            }
        }
        // Check diagonals
        for (let row = 0; row <= 5; row++) {
            for (let col = 0; col <= 5; col++) {
                // Check main diagonal (top-left to bottom-right)
                if ([0, 1, 2, 3, 4].every(offset => cells[(row + offset) * 10 + (col + offset)].textContent === symbol)) {
                    return true;
                }
                // Check anti-diagonal (top-right to bottom-left)
                if ([0, 1, 2, 3, 4].every(offset => cells[(row + offset) * 10 + (col + 4 - offset)].textContent === symbol)) {
                    return true;
                }
            }
        }
        // Check other diagonals (bottom-left to top-right and bottom-right to top-left)
        for (let row = 4; row < 10; row++) {
            for (let col = 0; col <= 5; col++) {
                // Check bottom-left to top-right
                if ([0, 1, 2, 3, 4].every(offset => cells[(row - offset) * 10 + (col + offset)].textContent === symbol)) {
                    return true;
                }
                // Check bottom-right to top-left
                if ([0, 1, 2, 3, 4].every(offset => cells[(row - offset) * 10 + (col + 4 - offset)].textContent === symbol)) {
                    return true;
                }
            }
        }
        return false;
    }

    function getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / 10);
        const col = index % 10;

        // Add valid neighbors (adjacent cells)
        if (row > 0) neighbors.push(cells[(row - 1) * 10 + col]); // Above
        if (row < 9) neighbors.push(cells[(row + 1) * 10 + col]); // Below
        if (col > 0) neighbors.push(cells[row * 10 + (col - 1)]); // Left
        if (col < 9) neighbors.push(cells[row * 10 + (col + 1)]); // Right

        return neighbors;
    }

    function displayResult(message, color) {
        const result = document.createElement("div");
        result.textContent = message;
        result.style.color = color;
        result.style.fontSize = "24px";
        result.style.marginTop = "20px";
        board.parentNode.insertBefore(result, board.nextSibling);
        createRestartButton();
    }

    function createRestartButton() {
        const restartButton = document.createElement("button");
        restartButton.textContent = "Restart Game";
        restartButton.style.marginTop = "10px";
        restartButton.addEventListener("click", restartGame);
        board.parentNode.insertBefore(restartButton, board.nextSibling);
    }

    function restartGame() {
        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove("taken");
        });
        const result = board.nextSibling;
        const restartButton = result.nextSibling;
        if (result) result.remove();
        if (restartButton) restartButton.remove();
        gameOver = false;
    }
});
