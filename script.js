// 取得 DOM 元素與宣告基本變數
const grid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const gameWonScreen = document.getElementById('game-won');
let board = [];
let score = 0;
let gameWon = false;
let newTiles = [];
let mergedTiles = [];
let moveMap = [];

// 初始化遊戲棋盤與分數
function initializeBoard() {
    board = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    scoreDisplay.textContent = score;
    gameWon = false;
    gameOverScreen.style.display = 'none';
    gameWonScreen.style.display = 'none';
    newTiles = [];
    mergedTiles = [];
    moveMap = Array(4).fill().map(() => Array(4).fill(null));
    addNewTile();
    addNewTile();
    renderBoard();
}

// 在空格上新增新的數字方塊 (2 或 4)
function addNewTile() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({ i, j });
            }
        }
    }
    if (emptyCells.length > 0) {
        const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[i][j] = Math.random() < 0.9 ? 2 : 4;
        newTiles.push({ i, j });
    }
}

// 渲染棋盤與方塊狀態
function renderBoard() {
    // 只清除舊的tile，保留背景cell
    const oldTiles = grid.querySelectorAll('.tile');
    oldTiles.forEach(tile => tile.remove());
    grid.style.position = 'relative';
    const gridSize = 4;
    const gap = 10; // 與CSS一致
    const gridPadding = 20; // .grid padding: 10px 左右共20
    const gridWidth = grid.offsetWidth;
    const tileSize = (gridWidth - gridPadding - gap * (gridSize - 1)) / gridSize;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] !== 0) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.classList.add(`tile-${board[i][j]}`);
                tile.textContent = board[i][j];
                tile.style.position = 'absolute';
                tile.style.width = tileSize + 'px';
                tile.style.height = tileSize + 'px';
                tile.style.left = 10 + j * (tileSize + gap) + 'px';
                tile.style.top = 10 + i * (tileSize + gap) + 'px';
                if (newTiles.some(pos => pos.i === i && pos.j === j)) tile.classList.add('new');
                if (mergedTiles.some(pos => pos.i === i && pos.j === j)) tile.classList.add('merged');
                if (moveMap[i][j]) {
                    tile.classList.add('move');
                    const fromI = moveMap[i][j].fromI;
                    const fromJ = moveMap[i][j].fromJ;
                    tile.style.transition = 'none';
                    tile.style.left = 10 + fromJ * (tileSize + gap) + 'px';
                    tile.style.top = 10 + fromI * (tileSize + gap) + 'px';
                    void tile.offsetWidth;
                    setTimeout(() => {
                        tile.style.transition = 'left 0.12s, top 0.12s';
                        tile.style.left = 10 + j * (tileSize + gap) + 'px';
                        tile.style.top = 10 + i * (tileSize + gap) + 'px';
                    }, 10);
                }
                grid.appendChild(tile);
            }
        }
    }
    newTiles = [];
    mergedTiles = [];
    moveMap = Array(4).fill().map(() => Array(4).fill(null));
}

// 處理方塊移動與合併邏輯
function move(direction) {
    let moved = false;
    const newBoard = board.map(row => [...row]);
    const merged = Array(4).fill().map(() => Array(4).fill(false));
    let newMoveMap = Array(4).fill().map(() => Array(4).fill(null));

    if (direction === 'up') {
        for (let j = 0; j < 4; j++) {
            for (let i = 1; i < 4; i++) {
                if (newBoard[i][j] !== 0) {
                    let k = i;
                    while (k > 0 && newBoard[k - 1][j] === 0) {
                        newBoard[k - 1][j] = newBoard[k][j];
                        newBoard[k][j] = 0;
                        newMoveMap[k - 1][j] = { fromI: k, fromJ: j };
                        k--;
                        moved = true;
                    }
                    if (k > 0 && newBoard[k - 1][j] === newBoard[k][j] && !merged[k - 1][j]) {
                        newBoard[k - 1][j] *= 2;
                        score += newBoard[k - 1][j];
                        newBoard[k][j] = 0;
                        merged[k - 1][j] = true;
                        mergedTiles.push({ i: k - 1, j });
                        newMoveMap[k - 1][j] = { fromI: k, fromJ: j };
                        moved = true;
                        if (newBoard[k - 1][j] === 2048 && !gameWon) {
                            gameWon = true;
                            gameWonScreen.style.display = 'flex';
                        }
                    }
                }
            }
        }
    } else if (direction === 'down') {
        for (let j = 0; j < 4; j++) {
            for (let i = 2; i >= 0; i--) {
                if (newBoard[i][j] !== 0) {
                    let k = i;
                    while (k < 3 && newBoard[k + 1][j] === 0) {
                        newBoard[k + 1][j] = newBoard[k][j];
                        newBoard[k][j] = 0;
                        newMoveMap[k + 1][j] = { fromI: k, fromJ: j };
                        k++;
                        moved = true;
                    }
                    if (k < 3 && newBoard[k + 1][j] === newBoard[k][j] && !merged[k + 1][j]) {
                        newBoard[k + 1][j] *= 2;
                        score += newBoard[k + 1][j];
                        newBoard[k][j] = 0;
                        merged[k + 1][j] = true;
                        mergedTiles.push({ i: k + 1, j });
                        newMoveMap[k + 1][j] = { fromI: k, fromJ: j };
                        moved = true;
                        if (newBoard[k + 1][j] === 2048 && !gameWon) {
                            gameWon = true;
                            gameWonScreen.style.display = 'flex';
                        }
                    }
                }
            }
        }
    } else if (direction === 'left') {
        for (let i = 0; i < 4; i++) {
            for (let j = 1; j < 4; j++) {
                if (newBoard[i][j] !== 0) {
                    let k = j;
                    while (k > 0 && newBoard[i][k - 1] === 0) {
                        newBoard[i][k - 1] = newBoard[i][k];
                        newBoard[i][k] = 0;
                        newMoveMap[i][k - 1] = { fromI: i, fromJ: k };
                        k--;
                        moved = true;
                    }
                    if (k > 0 && newBoard[i][k - 1] === newBoard[i][k] && !merged[i][k - 1]) {
                        newBoard[i][k - 1] *= 2;
                        score += newBoard[i][k - 1];
                        newBoard[i][k] = 0;
                        merged[i][k - 1] = true;
                        mergedTiles.push({ i, j: k - 1 });
                        newMoveMap[i][k - 1] = { fromI: i, fromJ: k };
                        moved = true;
                        if (newBoard[i][k - 1] === 2048 && !gameWon) {
                            gameWon = true;
                            gameWonScreen.style.display = 'flex';
                        }
                    }
                }
            }
        }
    } else if (direction === 'right') {
        for (let i = 0; i < 4; i++) {
            for (let j = 2; j >= 0; j--) {
                if (newBoard[i][j] !== 0) {
                    let k = j;
                    while (k < 3 && newBoard[i][k + 1] === 0) {
                        newBoard[i][k + 1] = newBoard[i][k];
                        newBoard[i][k] = 0;
                        newMoveMap[i][k + 1] = { fromI: i, fromJ: k };
                        k++;
                        moved = true;
                    }
                    if (k < 3 && newBoard[i][k + 1] === newBoard[i][k] && !merged[i][k + 1]) {
                        newBoard[i][k + 1] *= 2;
                        score += newBoard[i][k + 1];
                        newBoard[i][k] = 0;
                        merged[i][k + 1] = true;
                        mergedTiles.push({ i, j: k + 1 });
                        newMoveMap[i][k + 1] = { fromI: i, fromJ: k };
                        moved = true;
                        if (newBoard[i][k + 1] === 2048 && !gameWon) {
                            gameWon = true;
                            gameWonScreen.style.display = 'flex';
                        }
                    }
                }
            }
        }
    }

    if (moved) {
        moveMap = newMoveMap;
        board = newBoard;
        addNewTile();
        renderBoard();
        scoreDisplay.textContent = score;
        checkGameOver();
    }
}

// 檢查是否遊戲結束
function checkGameOver() {
    const emptyCells = board.flat().filter(cell => cell === 0).length;
    if (emptyCells === 0 && !canMove()) {
        gameOverScreen.style.display = 'flex';
    }
}

// 檢查是否還能進行移動
function canMove() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) return true;
            if (i < 3 && board[i][j] === board[i + 1][j]) return true;
            if (j < 3 && board[i][j] === board[i][j + 1]) return true;
        }
    }
    return false;
}

// 重新開始遊戲 (初始化棋盤)
function restartGame() {
    initializeBoard();
}

// 勝利後繼續遊戲 (隱藏勝利提示)
function continueGame() {
    gameWonScreen.style.display = 'none';
}

// 鍵盤事件監聽 (上下左右控制)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        move('up');
    } else if (e.key === 'ArrowDown') {
        move('down');
    } else if (e.key === 'ArrowLeft') {
        move('left');
    } else if (e.key === 'ArrowRight') {
        move('right');
    }
});

// 啟動遊戲
initializeBoard();