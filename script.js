const gameArea = document.getElementById('game-area');
const keyboardElement = document.getElementById('keyboard');
const toggleKeyboardButton = document.getElementById('toggle-keyboard');
const colorSelector = document.getElementById('color-selector');
const modeSelector = document.getElementById('game-mode');
const customCharsInput = document.getElementById('custom-chars');
const speedSelector = document.getElementById('game-speed');
const pauseBtn = document.getElementById('pause-btn');
const pauseOverlay = document.getElementById('pause-overlay');
const uiWrapper = document.getElementById('ui-wrapper');
const uiToggleBtn = document.getElementById('ui-toggle-btn');
const shiftToggleBtn = document.getElementById('shift-toggle-btn');

// Game State
let activeChars = [];
let score = 0;
let spawnInterval;
let isPaused = false;
let isShiftMode = false;

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
function spawnCharacter() {
    if (isPaused) return;

    const currentMode = modeSelector.value;
    let characterSet = [...charSets[currentMode]]; // Create a mutable copy

    if (currentMode === 'custom') {
        characterSet = customCharsInput.value.split('');
    }

    if (isShiftMode) {
        const shiftedChars = charSets[currentMode]
            .map(key => shiftMap[key])
            .filter(Boolean); // Filter out undefined values
        characterSet.push(...shiftedChars);
    }

    if (characterSet.length === 0) return;

    const character = characterSet[Math.floor(Math.random() * characterSet.length)];
    const charElement = document.createElement('div');
    charElement.classList.add('falling-char');
    charElement.textContent = character;
    charElement.style.left = `${Math.random() * 95}%`;
    charElement.style.animationDuration = `${(Math.random() * 2) + 3}s`; // Adjusted for speed

    charElement.addEventListener('animationend', () => {
        charElement.remove();
        // Optional: Penalize for missed characters
    });

    activeChars.push({ element: charElement, char: character });
    gameArea.appendChild(charElement);
}

function handleKeyPress(key, shiftKey) {
    if (isPaused) return;

    const targetChar = shiftKey ? key.toUpperCase() : key.toLowerCase();
    highlightPressedKey(targetChar, shiftKey);

    const target = activeChars.find(c => c.char === targetChar);

    if (target) {
        target.element.remove();
        activeChars = activeChars.filter(c => c.char !== targetChar);
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
});

colorSelector.addEventListener('change', (e) => {
    document.body.style.color = e.target.value;
});

colorSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-btn')) {
        const newColor = e.target.dataset.color;
        document.body.style.color = newColor;
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
    }
});

uiToggleBtn.addEventListener('click', () => {
    uiWrapper.classList.toggle('hidden');
    if (uiWrapper.classList.contains('hidden')) {
        uiToggleBtn.innerHTML = '&raquo;'; // Show "open" icon
    } else {
        uiToggleBtn.innerHTML = '&laquo;'; // Show "close" icon
    }
});

shiftToggleBtn.addEventListener('click', () => {
    isShiftMode = !isShiftMode;
    shiftToggleBtn.textContent = `Shift: ${isShiftMode ? 'On' : 'Off'}`;
    shiftToggleBtn.classList.toggle('active', isShiftMode);
    // Clear existing characters when mode changes
    activeChars.forEach(c => c.element.remove());
    activeChars = [];
});

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

function updateGameSpeed() {
    clearInterval(spawnInterval);
    const speed = parseInt(speedSelector.value, 10);
    spawnInterval = setInterval(spawnCharacter, speed);
}

speedSelector.addEventListener('change', updateGameSpeed);
pauseBtn.addEventListener('click', togglePause);

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
updateGameSpeed(); // Start with the default speed
document.getElementById('input-box').style.display = 'none'; // Hide the old input box
document.getElementById('prompt-text').style.display = 'none'; // Hide the prompt
