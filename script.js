const gameArea = document.getElementById('game-area');
const inputBox = document.getElementById('input-box');
const keyboardElement = document.getElementById('keyboard');
const toggleKeyboardButton = document.getElementById('toggle-keyboard');
const colorSelector = document.getElementById('color-selector');
const modeSelector = document.getElementById('game-mode');
const customCharsInput = document.getElementById('custom-chars');
const speedSelector = document.getElementById('game-speed');

// Game State
let activeChars = [];
let score = 0;
let spawnInterval;

const keyLayout = [
    ['半角/全角', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^', '¥', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '@', '[', 'Enter'],
    ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', ':', ']', 'Shift'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '_', '無変換', '変換', 'カタカナ/ひらがな'],
    ['Space']
];

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
    const currentMode = modeSelector.value;
    let characterSet = charSets[currentMode];

    if (currentMode === 'custom') {
        characterSet = customCharsInput.value.split('');
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

function handleKeyPress(key) {
    const typedChar = key.toLowerCase();
    const target = activeChars.find(c => c.char.toLowerCase() === typedChar);

    if (target) {
        target.element.remove();
        activeChars = activeChars.filter(c => c.char.toLowerCase() !== typedChar);
        score++;
        // Optional: Update score display
    }
}

// --- UI Event Listeners ---
toggleKeyboardButton.addEventListener('click', () => {
    keyboardElement.classList.toggle('hidden');
});

colorSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-btn')) {
        const newColor = e.target.dataset.color;
        document.body.style.color = newColor;
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
    }
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

// Global keydown listener
document.addEventListener('keydown', (e) => {
    // Prevent typing in the input box from triggering the global listener
    if (e.target === inputBox || e.target === customCharsInput) {
        return;
    }
    handleKeyPress(e.key);
});

// --- Initialization ---
createKeyboard();
updateGameSpeed(); // Start with the default speed
inputBox.style.display = 'none'; // Hide the old input box
document.getElementById('prompt-text').style.display = 'none'; // Hide the prompt
