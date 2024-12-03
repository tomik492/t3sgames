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
        let bestScore = -Infinity;
        let bestMove = null;
        const depth = 3; // Adjust the depth limit based on performance

        const possibleMoves = getPossibleMoves();

        for (let index of possibleMoves) {
            // Simulate move
            cells[index].textContent = aiSymbol;
            cells[index].classList.add("taken");

            let score = minimax(depth - 1, false, -Infinity, Infinity);

            // Undo move
            cells[index].textContent = "";
            cells[index].classList.remove("taken");

            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        }
        return bestMove;
    }

    function getPossibleMoves() {
        const moves = new Set();

        for (let i = 0; i < cells.length; i++) {
            if (cells[i].classList.contains("taken")) {
                const neighbors = getNeighbors(i);
                for (const neighbor of neighbors) {
                    if (!cells[neighbor].classList.contains("taken")) {
                        moves.add(neighbor);
                    }
                }
            }
        }

        // If the board is empty (no moves yet), pick the center cell
        if (moves.size === 0) {
            return [Math.floor(cells.length / 2)];
        }

        return Array.from(moves);
    }

    function getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / 10);
        const col = index % 10;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
                    neighbors.push(newRow * 10 + newCol);
                }
            }
        }

        return neighbors;
    }

    function minimax(depth, isMaximizing, alpha, beta) {
        if (checkWin(aiSymbol)) {
            return 1000 + depth; // AI wins
        }
        if (checkWin(playerSymbol)) {
            return -1000 - depth; // Player wins
        }
        if (depth === 0 || isBoardFull()) {
            return evaluateBoard(); // Evaluate the board
        }

        const possibleMoves = getPossibleMoves();

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let index of possibleMoves) {
                // Simulate move
                cells[index].textContent = aiSymbol;
                cells[index].classList.add("taken");

                let eval = minimax(depth - 1, false, alpha, beta);

                // Undo move
                cells[index].textContent = "";
                cells[index].classList.remove("taken");

                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break; // Beta cutoff
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let index of possibleMoves) {
                // Simulate move
                cells[index].textContent = playerSymbol;
                cells[index].classList.add("taken");

                let eval = minimax(depth - 1, true, alpha, beta);

                // Undo move
                cells[index].textContent = "";
                cells[index].classList.remove("taken");

                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break; // Alpha cutoff
                }
            }
            return minEval;
        }
    }

    function evaluateBoard() {
        let score = 0;

        // Increase score for AI's potential sequences
        score += countSequences(aiSymbol, 2) * 10;
        score += countSequences(aiSymbol, 3) * 50;
        score += countSequences(aiSymbol, 4) * 200;

        // Decrease score for player's potential sequences
        score -= countSequences(playerSymbol, 2) * 10;
        score -= countSequences(playerSymbol, 3) * 50;
        score -= countSequences(playerSymbol, 4) * 200;

        return score;
    }

    function countSequences(symbol, length) {
        let count = 0;

        // Directions: horizontal, vertical, diagonal (\), anti-diagonal (/)
        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 },
        ];

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                for (const { dr, dc } of directions) {
                    let seqCount = 0;
                    let blocked = false;

                    for (let k = 0; k < length; k++) {
                        const r = row + dr * k;
                        const c = col + dc * k;

                        if (r < 0 || r >= 10 || c < 0 || c >= 10) {
                            blocked = true;
                            break;
                        }

                        const index = r * 10 + c;
                        const cellContent = cells[index].textContent;

                        if (cellContent === symbol) {
                            seqCount++;
                        } else if (cellContent !== "") {
                            blocked = true;
                            break;
                        }
                    }

                    if (seqCount === length && !blocked) {
                        count++;
                    }
                }
            }
        }

        return count;
    }

    function isBoardFull() {
        return cells.every(cell => cell.classList.contains("taken"));
    }

    function checkWin(symbol) {
        // Check rows, columns, and diagonals for a 5-in-a-row win
        const directions = [
            { dr: 0, dc: 1 },   // Horizontal
            { dr: 1, dc: 0 },   // Vertical
            { dr: 1, dc: 1 },   // Diagonal (\)
            { dr: 1, dc: -1 },  // Anti-diagonal (/)
        ];

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                for (const { dr, dc } of directions) {
                    let win = true;

                    for (let k = 0; k < 5; k++) {
                        const r = row + dr * k;
                        const c = col + dc * k;

                        if (r < 0 || r >= 10 || c < 0 || c >= 10) {
                            win = false;
                            break;
                        }

                        const index = r * 10 + c;
                        if (cells[index].textContent !== symbol) {
                            win = false;
                            break;
                        }
                    }

                    if (win) return true;
                }
            }
        }

        return false;
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

