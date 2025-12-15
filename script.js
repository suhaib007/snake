const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const GAME_SPEED = 100;

// Game state
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];
let food = { x: 15, y: 15 };
let dx = 1; // Velocity X
let dy = 0; // Velocity Y
let nextDx = 1; // Buffer for next direction to prevent rapid reverse

let nextDy = 0;

let gameLoop;
let isGameRunning = false;
let isGameOver = false;

// Theme Handling
const themeSelect = document.getElementById('theme-select');
const savedTheme = localStorage.getItem('snakeTheme') || 'retro';

function setTheme(theme) {
    document.body.className = ''; // Clear existing themes
    if (theme !== 'neon') {
        document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('snakeTheme', theme);
    themeSelect.value = theme;

    // Force redraw to update colors immediately
    if (!isGameRunning && !isGameOver) {
        drawGame();
    }
}

themeSelect.addEventListener('change', (e) => {
    setTheme(e.target.value);
    // Remove focus from select so arrow keys work for game
    e.target.blur();
});

// Initialize Theme
setTheme(savedTheme);


// Initialize Theme
setTheme(savedTheme);

// Start game initially
// resetGame(); // Moved to end of file

// Game loop variables moved to top

function drawRect(x, y, color, glow = '') {
    ctx.fillStyle = color;
    if (glow && glow !== 'none') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = glow;
    } else {
        ctx.shadowBlur = 0;
    }
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    ctx.shadowBlur = 0; // Reset shadow
}

function drawGame() {
    clearCanvas();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.6)'; // Trail effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    const style = getComputedStyle(document.body);
    const snakeColor = style.getPropertyValue('--snake-color').trim() || '#00ff88';
    const snakeGlow = style.getPropertyValue('--snake-glow').trim() || '#00ff88';

    // Debug logging just in case
    if (!window.hasLoggedColors) {
        console.log('Snake Color:', snakeColor, 'Snake Glow:', snakeGlow);
        window.hasLoggedColors = true;
    }

    snake.forEach((segment, index) => {
        const isHead = index === 0;
        let color = snakeColor;
        let glow = snakeGlow;

        if (isHead) {
            // Keep head distinct white for visibility
            color = '#ffffff';
            if (snakeGlow !== 'none') glow = '#ffffff';
        }

        drawRect(segment.x, segment.y, color, glow);
    });
}

function drawFood() {
    const style = getComputedStyle(document.body);
    const foodColor = style.getPropertyValue('--food-color').trim() || '#ff0055';
    const foodGlow = style.getPropertyValue('--food-glow').trim() || '#ff0055';
    drawRect(food.x, food.y, foodColor, foodGlow);
}

function moveSnake() {
    // Update velocity from buffer
    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall Collision Check - Game Over style
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Self Collision Check
    const hasCollidedWithSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);
    if (hasCollidedWithSelf) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check if ate food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        generateFood();
        // Speed up slightly or add effects here if desired
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    // Make sure food doesn't spawn on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        generateFood();
    }
}

function gameOver() {
    isGameRunning = false;
    isGameOver = true;
    clearInterval(gameLoop);

    // Draw Game Over Text
    ctx.fillStyle = 'white';
    ctx.font = '40px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

    ctx.font = '20px Outfit';
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 40);
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    console.log('Snake INITIALIZED:', snake);
    dx = 1;
    dy = 0;
    nextDx = 1;
    nextDy = 0;
    score = 0;
    scoreElement.textContent = score;
    isGameOver = false;
    isGameRunning = true;
    generateFood();
    // Force immediate draw
    if (isGameRunning) {
        drawGame();
        // drawDebug();
    }

    clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        moveSnake();
        if (isGameRunning) {
            drawGame();
            // drawDebug();
        }
    }, GAME_SPEED);
}

// Input handling
document.addEventListener('keydown', (e) => {
    // Prevent default scrolling for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === ' ' && !isGameRunning && isGameOver) {
        resetGame();
        return;
    }

    // If game hasn't started yet, allow starting with arrows? 
    // Or maybe auto-start on load? Let's auto start for now.

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    switch (e.key) {
        case 'ArrowLeft':
            if (!goingRight) { nextDx = -1; nextDy = 0; }
            break;
        case 'ArrowRight':
            if (!goingLeft) { nextDx = 1; nextDy = 0; }
            break;
        case 'ArrowUp':
            if (!goingDown) { nextDx = 0; nextDy = -1; }
            break;
        case 'ArrowDown':
            if (!goingUp) { nextDx = 0; nextDy = 1; }
            break;
    }
});

// Swipe Controls
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: false });

document.addEventListener('touchend', (e) => {
    // Allow interactions with the theme selector and links
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION' || e.target.closest('.theme-selector') || e.target.tagName === 'A' || e.target.closest('.author')) {
        return;
    }

    e.preventDefault(); // Prevent default browser actions
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, { passive: false });

function handleSwipe(startX, startY, endX, endY) {
    const outputX = endX - startX;
    const outputY = endY - startY;

    // Minimum threshold to consider it a swipe
    if (Math.abs(outputX) < 30 && Math.abs(outputY) < 30) return;

    // Determine if it's horizontal or vertical swipe
    if (Math.abs(outputX) > Math.abs(outputY)) {
        // Horizontal
        if (outputX > 0) handleDirection('right');
        else handleDirection('left');
    } else {
        // Vertical
        if (outputY > 0) handleDirection('down');
        else handleDirection('up');
    }
}

function handleDirection(direction) {
    // If game over, restart logic
    if (!isGameRunning && isGameOver) {
        resetGame();
        return;
    }

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    switch (direction) {
        case 'up':
            if (!goingDown) { nextDx = 0; nextDy = -1; }
            break;
        case 'down':
            if (!goingUp) { nextDx = 0; nextDy = 1; }
            break;
        case 'left':
            if (!goingRight) { nextDx = -1; nextDy = 0; }
            break;
        case 'right':
            if (!goingLeft) { nextDx = 1; nextDy = 0; }
            break;
    }
}


// Start game initially
window.addEventListener('load', () => {
    console.log('Window loaded, starting game...');
    resetGame();

    // Safety check loop to ensure visibility
    setTimeout(() => {
        if (!isGameRunning) {
            console.log('Force restart check...');
            resetGame();
        }
    }, 500);
});

// Debug helper
function drawDebug() {
    // Uncomment to see debug info on screen
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    if (snake && snake.length > 0) {
        ctx.fillText(`State: ${isGameRunning ? 'Run' : 'Stop'} | Snake: ${snake.length} Head: ${snake[0].x},${snake[0].y}`, 10, 20);
    } else {
        ctx.fillText(`State: ${isGameRunning ? 'Run' : 'Stop'} | Snake: Undefined`, 10, 20);
    }
}
