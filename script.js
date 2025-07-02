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

const keyboardLayout = [
    ['1','2','3','4','5','6','7','8','9','0','-','^'],
    ['q','w','e','r','t','y','u','i','o','p','@','['],
    ['a','s','d','f','g','h','j','k','l',';',':',']'],
    ['z','x','c','v','b','n','m',',','.','/']
];
const onscreenKeyboard = document.getElementById('onscreen-keyboard');
const toggleKeyboardBtn = document.getElementById('toggle-keyboard-btn');
const keyboardContainer = document.getElementById('onscreen-keyboard-container');

function buildKeyboard() {
    onscreenKeyboard.innerHTML = '';
    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        row.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'keyboard-key';
            keyDiv.textContent = key;
            keyDiv.dataset.key = key;
            rowDiv.appendChild(keyDiv);
        });
        onscreenKeyboard.appendChild(rowDiv);
    });
}

function randomChar() {
    const chars = '1234567890qwertyuiopasdfghjklzxcvbnm-^@[];:,./';
    return chars[Math.floor(Math.random() * chars.length)];
}

function highlightKey(char) {
    document.querySelectorAll('.keyboard-key').forEach(key => {
        if (key.dataset.key.toLowerCase() === char.toLowerCase()) {
            key.classList.add('blink');
        } else {
            key.classList.remove('blink');
        }
    });
}

function clearKeyHighlights() {
    document.querySelectorAll('.keyboard-key').forEach(key => key.classList.remove('blink'));
}

function setKeyboardVisible(visible) {
    keyboardContainer.style.display = visible ? 'flex' : 'none';
    toggleKeyboardBtn.textContent = visible ? 'Hide Keyboard' : 'Show Keyboard';
    localStorage.setItem('showKeyboard', visible ? '1' : '0');
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
    highlightKey(fallingCharValue);
}

function missChar() {
    if (fallingChar) fallingChar.remove();
    health -= 10;
    updateInfo();
    clearKeyHighlights();
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
    clearKeyHighlights();
}

function updateInfo() {
    scoreSpan.textContent = 'Score: ' + score;
    healthSpan.textContent = 'Health: ' + health;
}

function endGame() {
    if (fallTimeout) clearTimeout(fallTimeout);
    if (fallingChar) fallingChar.remove();
    restartBtn.style.display = 'block';
    clearKeyHighlights();
}

function startGame() {
    score = 0;
    health = 100;
    updateInfo();
    restartBtn.style.display = 'none';
    clearKeyHighlights();
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

toggleKeyboardBtn.addEventListener('click', () => {
    const isVisible = keyboardContainer.style.display !== 'none';
    setKeyboardVisible(!isVisible);
});

function loadKeyboardPref() {
    const pref = localStorage.getItem('showKeyboard');
    setKeyboardVisible(pref !== '0');
}

document.addEventListener('DOMContentLoaded', () => {
    buildKeyboard();
    loadKeyboardPref();
});

restartBtn.addEventListener('click', startGame);

startGame();
