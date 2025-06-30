const promptElement = document.getElementById('prompt');
const inputBox = document.getElementById('input-box');
const feedbackElement = document.getElementById('feedback');

const romajiCharacters = 'abcdefghijklmnopqrstuvwxyz';
let currentCharacter = '';

function newCharacter() {
    const randomIndex = Math.floor(Math.random() * romajiCharacters.length);
    currentCharacter = romajiCharacters[randomIndex];
    promptElement.textContent = currentCharacter;
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

newCharacter();
