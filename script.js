const promptElement = document.getElementById('prompt');
const inputBox = document.getElementById('input-box');
const feedbackElement = document.getElementById('feedback');
const keyboardElement = document.getElementById('keyboard');
const gameArea = document.getElementById('game-area');
const toggleKeyboardButton = document.getElementById('toggle-keyboard');
const colorSelector = document.getElementById('color-selector');

// Game State
let activeChars = [];
let score = 0;

const keyLayout = [
    ['半角/全角', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^', '¥', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '@', '[', 'Enter'],
    ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', ':', ']', 'Shift'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '_', '無変換', '変換', 'カタカナ/ひらがな'],
    ['Space']
];

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
    const character = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    const charElement = document.createElement('div');
    charElement.classList.add('falling-char');
    charElement.textContent = character;
    charElement.style.left = `${Math.random() * 95}%`;
    charElement.style.animationDuration = `${(Math.random() * 5) + 5}s`; // Fall speed

    charElement.addEventListener('animationend', () => {
        charElement.remove();
        // Optional: Penalize for missed characters
    });

    activeChars.push({ element: charElement, char: character });
    gameArea.appendChild(charElement);
}

inputBox.addEventListener('input', (e) => {
    const typedChar = e.target.value.toLowerCase();
    if (!typedChar) return;

    const target = activeChars.find(c => c.char === typedChar);
    if (target) {
        target.element.remove();
        activeChars = activeChars.filter(c => c.char !== typedChar);
        score++;
        // Optional: Update score display
    }
    e.target.value = '';
});

// --- UI Event Listeners ---
toggleKeyboardButton.addEventListener('click', () => {
    keyboardElement.classList.toggle('hidden');
});

colorSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-btn')) {
        const newColor = e.target.dataset.color;
        document.body.style.color = newColor;
        // Update active button style
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
    }
});

// --- Initialization ---
createKeyboard();
setInterval(spawnCharacter, 1000); // Spawn a new character every second
