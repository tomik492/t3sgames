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
        const depth = 2; // Reduced depth for faster computation

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

        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
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
            return 10000 + depth; // AI wins
        }
        if (checkWin(playerSymbol)) {
            return -10000 - depth; // Player wins
        }
        if (depth === 0 || isBoardFull()) {
            return evaluateBoard(); // Evaluate the board
        }

        const possibleMoves = getPossibleMoves();

        // Sort moves to improve alpha-beta pruning
        possibleMoves.sort((a, b) => {
            return getMoveScore(b, isMaximizing) - getMoveScore(a, isMaximizing);
        });

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

    function getMoveScore(index, isMaximizing) {
        // Quick evaluation to order moves
        const symbol = isMaximizing ? aiSymbol : playerSymbol;
        return evaluatePosition(index, symbol);
    }

    function evaluatePosition(index, symbol) {
        let score = 0;
        const row = Math.floor(index / 10);
        const col = index % 10;

        // Evaluate immediate potential in all directions
        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 },
        ];

        for (const { dr, dc } of directions) {
            let count = 1;
            count += countConsecutive(row, col, dr, dc, symbol);
            count += countConsecutive(row, col, -dr, -dc, symbol);
            score += Math.pow(10, count);
        }

        return score;
    }

    function countConsecutive(row, col, dr, dc, symbol) {
        let count = 0;
        for (let k = 1; k < 5; k++) {
            const r = row + dr * k;
            const c = col + dc * k;
            if (r < 0 || r >= 10 || c < 0 || c >= 10) break;
            const index = r * 10 + c;
            if (cells[index].textContent === symbol) {
                count++;
            } else if (cells[index].textContent !== "") {
                break;
            } else {
                break;
            }
        }
        return count;
    }

    function evaluateBoard() {
        let score = 0;

        // Increase score for AI's potential sequences
        score += evaluatePotential(aiSymbol);

        // Decrease score for player's potential sequences
        score -= evaluatePotential(playerSymbol);

        return score;
    }

    function evaluatePotential(symbol) {
        let totalScore = 0;

        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 },
        ];

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                for (const { dr, dc } of directions) {
                    let count = 0;
                    let openEnds = 0;

                    // Check forward
                    for (let k = 0; k < 5; k++) {
                        const r = row + dr * k;
                        const c = col + dc * k;
                        if (r < 0 || r >= 10 || c < 0 || c >= 10) break;
                        const index = r * 10 + c;
                        if (cells[index].textContent === symbol) {
                            count++;
                        } else if (cells[index].textContent === "") {
                            openEnds++;
                            break;
                        } else {
                            break;
                        }
                    }

                    // Check backward
                    for (let k = 1; k < 5; k++) {
                        const r = row - dr * k;
                        const c = col - dc * k;
                        if (r < 0 || r >= 10 || c < 0 || c >= 10) break;
                        const index = r * 10 + c;
                        if (cells[index].textContent === symbol) {
                            count++;
                        } else if (cells[index].textContent === "") {
                            openEnds++;
                            break;
                        } else {
                            break;
                        }
                    }

                    if (count >= 2 && openEnds > 0) {
                        totalScore += Math.pow(10, count + openEnds - 1);
                    }
                }
            }
        }

        return totalScore;
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

