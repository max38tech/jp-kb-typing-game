const promptElement = document.getElementById('prompt');
const inputBox = document.getElementById('input-box');
const feedbackElement = document.getElementById('feedback');
const keyboardElement = document.getElementById('keyboard');

const keyLayout = [
    ['半角/全角', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^', '¥', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '@', '[', 'Enter'],
    ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', ':', ']', 'Shift'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '_', '無変換', '変換', 'カタカナ/ひらがな'],
    ['Space']
];

let currentCharacter = '';

function createKeyboard() {
    keyboardElement.innerHTML = ''; // Clear existing keyboard
    keyLayout.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('keyboard-row');
        row.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('key');
            keyElement.textContent = key;
            keyElement.dataset.key = key;

            // Add specific classes for styling special keys
            const keyName = key.toLowerCase().replace(/\//g, '').replace(/\\/g, '');
            if (['backspace', 'tab', 'enter', 'capslock', 'shift', 'space'].includes(keyName)) {
                keyElement.classList.add(`key-${keyName}`);
            } else if (key.length > 1) {
                keyElement.classList.add('key-wide');
            }

            rowElement.appendChild(keyElement);
        });
        keyboardElement.appendChild(rowElement);
    });
}

function newCharacter() {
    const allKeys = keyLayout.flat().filter(key => key.length === 1 && !['[', ']', ';', ':', '@', '^', '¥', '_'].includes(key));
    const randomIndex = Math.floor(Math.random() * allKeys.length);
    currentCharacter = allKeys[randomIndex];
    promptElement.textContent = currentCharacter;
    highlightKey(currentCharacter);
}

function highlightKey(key) {
    const keyElements = document.querySelectorAll('.key');
    keyElements.forEach(el => {
        if (el.dataset.key.toLowerCase() === key.toLowerCase()) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

inputBox.addEventListener('input', () => {
    const typedValue = inputBox.value;
    if (typedValue === currentCharacter) {
        feedbackElement.textContent = 'Correct!';
        inputBox.value = '';
        newCharacter();
    } else {
        feedbackElement.textContent = '';
    }
});

createKeyboard();
newCharacter();
