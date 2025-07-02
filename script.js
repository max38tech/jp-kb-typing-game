const gameArea = document.getElementById('game-area');
const scoreSpan = document.getElementById('score');
const healthSpan = document.getElementById('health');
const restartBtn = document.getElementById('restart-btn');

let fallingChar = null;
let fallingCharValue = '';
let score = 0;
let health = 100;
let fallTimeout = null;
let fallSpeed = 3000; // ms

function randomChar() {
    const chars = '1234567890qwertyuiopasdfghjklzxcvbnm-^@[];:,./';
    return chars[Math.floor(Math.random() * chars.length)];
}

function spawnChar() {
    if (fallingChar) fallingChar.remove();
    if (fallTimeout) clearTimeout(fallTimeout);
    fallingCharValue = randomChar();
    fallingChar = document.createElement('div');
    fallingChar.className = 'falling-char';
    fallingChar.textContent = fallingCharValue;
    fallingChar.style.top = '0px';
    fallingChar.style.left = Math.random() * 80 + 10 + '%';
    gameArea.appendChild(fallingChar);
    fallingChar.animate([
        { top: '0px', opacity: 1 },
        { top: '80vh', opacity: 0.2 }
    ], { duration: fallSpeed, fill: 'forwards' });
    fallTimeout = setTimeout(() => {
        if (fallingChar && gameArea.contains(fallingChar)) {
            missChar();
        }
    }, fallSpeed);
}

function missChar() {
    if (fallingChar) fallingChar.remove();
    health -= 10;
    updateInfo();
    if (health <= 0) {
        endGame();
    } else {
        spawnChar();
    }
}

function explodeChar() {
    if (!fallingChar) return;
    fallingChar.style.transition = 'transform 0.2s, opacity 0.2s';
    fallingChar.style.transform = 'scale(2.5)';
    fallingChar.style.opacity = '0';
    setTimeout(() => {
        if (fallingChar && gameArea.contains(fallingChar)) {
            fallingChar.remove();
        }
    }, 200);
}

function updateInfo() {
    scoreSpan.textContent = 'Score: ' + score;
    healthSpan.textContent = 'Health: ' + health;
}

function endGame() {
    if (fallTimeout) clearTimeout(fallTimeout);
    if (fallingChar) fallingChar.remove();
    restartBtn.style.display = 'block';
}

function startGame() {
    score = 0;
    health = 100;
    updateInfo();
    restartBtn.style.display = 'none';
    spawnChar();
}

document.addEventListener('keydown', (e) => {
    if (!fallingChar) return;
    if (e.key.toLowerCase() === fallingCharValue.toLowerCase()) {
        score++;
        updateInfo();
        explodeChar();
        setTimeout(spawnChar, 200);
    }
});

restartBtn.addEventListener('click', startGame);

startGame();
