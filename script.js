const gameArea = document.getElementById('game-area');
const keyboardElement = document.getElementById('keyboard');
const toggleKeyboardButton = document.getElementById('toggle-keyboard');
const colorSelector = document.getElementById('color-selector');
const modeSelector = document.getElementById('game-mode');
const customCharsInput = document.getElementById('custom-chars');
const pauseBtn = document.getElementById('pause-btn');
const pauseOverlay = document.getElementById('pause-overlay');
const uiWrapper = document.getElementById('ui-wrapper');
const shiftToggleBtn = document.getElementById('shift-toggle-btn');
const townArea = document.getElementById('town-area');
const healthBar = document.getElementById('health-bar');
const gameOverOverlay = document.getElementById('game-over-overlay');
const restartBtn = document.getElementById('restart-btn');
const uiToggleBtn = document.getElementById('ui-toggle-btn');

// Game State
let activeChars = [];
let score = 0;
let gameLoopInterval;
let isPaused = false;
let isShiftMode = false;
let health = 100;
let isGameOver = false;
let gameStartTime;

// Difficulty Settings
const DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const START_SPAWN_RATE = 2000; // ms
const END_SPAWN_RATE = 500; // ms
const START_FALL_SPEED = 10; // seconds
const END_FALL_SPEED = 3; // seconds

const keyLayout = [
    ['半角/全角', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^', '¥', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '@', '[', 'Enter'],
    ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', ':', ']', 'Shift'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '_', '無変換', '変換', 'カタカナ/ひらがな'],
    ['Space']
];

const shiftMap = {
    '1': '!', '2': '"', '3': '#', '4': '$', '5': '%', '6': '&', '7': "'", '8': '(', '9': ')',
    '-': '=', '^': '~', '¥': '|',
    'q': 'Q', 'w': 'W', 'e': 'E', 'r': 'R', 't': 'T', 'y': 'Y', 'u': 'U', 'i': 'I', 'o': 'O', 'p': 'P',
    '@': '`', '[': '{',
    'a': 'A', 's': 'S', 'd': 'D', 'f': 'F', 'g': 'G', 'h': 'H', 'j': 'J', 'k': 'K', 'l': 'L',
    ';': '+', ':': '*', ']': '}',
    'z': 'Z', 'x': 'X', 'c': 'C', 'v': 'V', 'b': 'B', 'n': 'N', 'm': 'M',
    ',': '<', '.': '>', '/': '?', '_': '_'
};

const charSets = {
    all: keyLayout.flat().filter(k => k.length === 1),
    'top-row': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^', '¥'],
    'right-hand': ['y', 'u', 'i', 'o', 'p', '@', '[', 'h', 'j', 'k', 'l', ';', ':', ']', 'n', 'm', ',', '.', '/', '_'],
    custom: []
};

// --- Keyboard Generation ---
function createKeyboard() {
    keyboardElement.innerHTML = '';
    keyLayout.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('keyboard-row');
        row.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('key');
            keyElement.textContent = key;
            keyElement.dataset.key = key.toLowerCase();
            rowElement.appendChild(keyElement);
        });
        keyboardElement.appendChild(rowElement);
    });
}

// --- Gameplay Logic ---
function takeDamage(amount) {
    if (isGameOver) return;
    health = Math.max(0, health - amount);
    updateHealthBar();
    if (health <= 0) {
        gameOver();
    }
}

function updateHealthBar() {
    healthBar.style.width = `${health}%`;
    const healthColor = health > 50 ? '#4caf50' : health > 20 ? '#ffeb3b' : '#f44336';
    healthBar.style.backgroundColor = healthColor;

    // Visual damage effect
    if (keyboardElement.classList.contains('hidden')) {
        // Damage town
        townArea.style.opacity = health / 100;
    } else {
        // Damage keyboard
        keyboardElement.style.backgroundColor = `rgba(34, 34, 34, ${health / 100})`;
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoopInterval);
    gameOverOverlay.classList.remove('hidden');
    document.querySelectorAll('.falling-char').forEach(el => el.remove());
}

function restartGame() {
    isGameOver = false;
    health = 100;
    score = 0;
    activeChars = [];
    updateHealthBar();
    gameOverOverlay.classList.add('hidden');
    document.querySelectorAll('.falling-char').forEach(el => el.remove());
    startGame();
}

function gameLoop() {
    if (isPaused || isGameOver) return;

    const elapsedTime = Date.now() - gameStartTime;
    const progress = Math.min(elapsedTime / DURATION, 1);

    // Update spawn rate
    const currentSpawnRate = START_SPAWN_RATE - (START_SPAWN_RATE - END_SPAWN_RATE) * progress;
    
    // This logic needs to be smarter to avoid overwhelming the player
    if (Math.random() < (1000 / currentSpawnRate) / 60) { // Simplified spawn chance
        spawnCharacter(progress);
    }
}

function spawnCharacter(progress) {
    const currentMode = modeSelector.value;
    let characterSet = [...charSets[currentMode]];

    if (currentMode === 'custom') {
        characterSet = customCharsInput.value.split('');
    }

    // If shift mode is on, use only shifted characters; if off, use only unshifted
    if (isShiftMode) {
        // Only use shifted characters for the current set
        characterSet = characterSet.map(key => shiftMap[key]).filter(Boolean);
    } else {
        // Only use unshifted characters (filter out any that are only available as shifted)
        characterSet = characterSet.filter(key => !Object.values(shiftMap).includes(key));
    }

    if (characterSet.length === 0) return;

    const character = characterSet[Math.floor(Math.random() * characterSet.length)];
    const charElement = document.createElement('div');
    charElement.classList.add('falling-char');
    charElement.textContent = character;
    charElement.style.left = `${Math.random() * 95}%`;
    
    const currentFallSpeed = START_FALL_SPEED - (START_FALL_SPEED - END_FALL_SPEED) * progress;
    charElement.style.animationDuration = `${currentFallSpeed}s`;

    charElement.addEventListener('animationend', () => {
        charElement.remove();
        takeDamage(10); // Take 10 damage when a character is missed
    });

    activeChars.push({ element: charElement, char: character });
    gameArea.appendChild(charElement);
}

function handleKeyPress(key, shiftKey) {
    if (isPaused || isGameOver) return;

    const targetChar = shiftKey ? key.toUpperCase() : key.toLowerCase();
    highlightPressedKey(targetChar, shiftKey);

    const targetIndex = activeChars.findIndex(c => c.char === targetChar);

    if (targetIndex !== -1) {
        const target = activeChars[targetIndex];

        // Freeze the character in place for the explosion
        const rect = target.element.getBoundingClientRect();
        // By setting the top/left, we stop the visual movement from the 'fall' animation
        target.element.style.top = `${rect.top}px`;
        target.element.style.left = `${rect.left}px`;
        
        // By adding the 'exploding' class, the new animation properties override the 'fall' animation
        target.element.classList.add('exploding');
        
        target.element.addEventListener('animationend', () => {
            target.element.remove();
        });

        activeChars.splice(targetIndex, 1);
        score++;
        // Optional: Update score display
    }
}

function togglePause() {
    isPaused = !isPaused;
    pauseOverlay.classList.toggle('hidden', !isPaused);
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    if (isPaused) {
        // Pause animations
        document.querySelectorAll('.falling-char').forEach(el => el.style.animationPlayState = 'paused');
    } else {
        // Resume animations
        document.querySelectorAll('.falling-char').forEach(el => el.style.animationPlayState = 'running');
    }
}

function highlightPressedKey(key, shiftKey) {
    const keyElements = document.querySelectorAll('.key');
    const keyToFind = Object.keys(shiftMap).find(k => shiftMap[k] === key) || key.toLowerCase();

    keyElements.forEach(el => {
        const elKey = el.dataset.key.toLowerCase();
        if (elKey === keyToFind) {
            el.classList.add('pressed');
        } else {
            el.classList.remove('pressed');
        }
    });

    // Highlight shift keys if needed
    const shiftKeys = document.querySelectorAll('[data-key="shift"]');
    if (shiftKey) {
        shiftKeys.forEach(sk => sk.classList.add('pressed'));
    } else {
        shiftKeys.forEach(sk => sk.classList.remove('pressed'));
    }
}

function clearHighlights() {
    document.querySelectorAll('.key.pressed').forEach(el => el.classList.remove('pressed'));
}

// --- UI Event Listeners ---
toggleKeyboardButton.addEventListener('click', () => {
    keyboardElement.classList.toggle('hidden');
    // Only show/hide town area if it exists
    if (townArea) {
        townArea.classList.toggle('hidden', !keyboardElement || !keyboardElement.classList.contains('hidden'));
    }
    updateHealthBar(); // Update visual state on toggle
});

pauseBtn.addEventListener('click', togglePause);

shiftToggleBtn.addEventListener('click', () => {
    isShiftMode = !isShiftMode;
    shiftToggleBtn.textContent = `Shift: ${isShiftMode ? 'On' : 'Off'}`;
    shiftToggleBtn.classList.toggle('active', isShiftMode);
    // Clear existing characters when mode changes
    activeChars.forEach(c => c.element.remove());
    activeChars = [];
});

restartBtn.addEventListener('click', startGame);

modeSelector.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        customCharsInput.style.display = 'inline-block';
    } else {
        customCharsInput.style.display = 'none';
    }
    // Clear existing characters when mode changes
    activeChars.forEach(c => c.element.remove());
    activeChars = [];
});

// Global keydown listener
document.addEventListener('keydown', (e) => {
    // Prevent typing in the input box from triggering the global listener
    if (e.target === customCharsInput) {
        return;
    }
    e.preventDefault(); // Prevent default browser actions
    handleKeyPress(e.key, e.shiftKey);
});

document.addEventListener('keyup', () => {
    clearHighlights();
});

// --- Initialization ---
createKeyboard();
startGame();
updateHealthBar();
