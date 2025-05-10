
// js/dilution.js - Contains Dilution calculator page specific functionality
// ==============================================================

// --- Constants for Common Dilution Factors ---
const COMMON_DILUTIONS = [2, 3, 4, 5, 10, 20, 50, 100, 200, 500, 1000];
const DEFAULT_DILUTION_FACTOR = 2; // Default dilution factor if none selected or invalid input

let currentDilution = DEFAULT_DILUTION_FACTOR; // Initialize current dilution with default

document.addEventListener('DOMContentLoaded', () => {
    initializeDilutionPage(); // Encapsulating all dilution page initialization in one function
});

function initializeDilutionPage() {
    initializeDilutionButtons();
    initializeInputFields();
    setupKeyboardShortcuts();
    showKeyboardShortcutsHint(); // Moved shortcut hint to initialization
    calculateVolumes(); // Initial volume calculation on page load
}

// -------------------------------------
//        Dilution Buttons Setup
// -------------------------------------
function initializeDilutionButtons() {
    const dilutionGrid = document.getElementById('dilutionButtons');
    if (!dilutionGrid) return;

    COMMON_DILUTIONS.forEach(factor => {
        const button = createDilutionButton(factor);
        dilutionGrid.appendChild(button);
    });
}

function createDilutionButton(factor) {
    const button = document.createElement('button');
    button.className = 'dilution-button';
    button.textContent = `1:${factor}`;
    button.dataset.factor = factor;
    button.addEventListener('click', () => handleDilutionButtonClick(factor)); // Use event listener instead of inline onclick
    return button;
}

function handleDilutionButtonClick(factor) {
    setActiveDilution(factor);
    document.getElementById('customDilution').value = factor; // Update custom dilution input
    calculateVolumes();
}

function setActiveDilution(factor) {
    currentDilution = factor;
    document.querySelectorAll('.dilution-button').forEach(button => {
        button.classList.toggle('active', parseInt(button.dataset.factor) === factor);
    });
}

// -------------------------------------
//        Input Fields Setup
// -------------------------------------
function initializeInputFields() {
    const customDilutionInput = document.getElementById('customDilution');
    const totalVolumeInput = document.getElementById('totalVolume');

    if (customDilutionInput) {
        customDilutionInput.addEventListener('input', handleCustomDilutionInput);
    }
    if (totalVolumeInput) {
        totalVolumeInput.addEventListener('input', calculateVolumes);
    }
}

function handleCustomDilutionInput(event) {
    let value = Math.max(DEFAULT_DILUTION_FACTOR, parseInt(event.target.value) || DEFAULT_DILUTION_FACTOR); // Ensure min dilution factor
    setActiveDilution(value);
    calculateVolumes();
}

// -------------------------------------
//        Volume Calculation
// -------------------------------------
function calculateVolumes() {
    const totalVolume = parseFloat(document.getElementById('totalVolume').value) || 0;
    const sampleVolume = totalVolume / currentDilution;
    const diluentVolume = totalVolume - sampleVolume;

    document.getElementById('sampleVolume').textContent = `${sampleVolume.toFixed(2)} µL`;
    document.getElementById('diluentVolume').textContent = `${diluentVolume.toFixed(2)} µL`;
}

// -------------------------------------
//        Keyboard Shortcuts
// -------------------------------------
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
    if (event.target.tagName === 'INPUT' && !event.altKey) {
        return; // Ignore shortcuts when typing in input fields
    }

    const targetId = event.target.id;
    const key = event.key.toLowerCase();
    const altKey = event.altKey;

    switch (true) {
        case altKey && key === 'd': // Alt + D: Focus dilution input
            event.preventDefault();
            focusInput('customDilution');
            break;
        case altKey && key === 'v': // Alt + V: Focus volume input
            event.preventDefault();
            focusInput('totalVolume');
            break;
        case targetId === 'customDilution' && event.key === 'ArrowUp': // ArrowUp: Increment dilution
            event.preventDefault();
            incrementDilution(true);
            break;
        case targetId === 'customDilution' && event.key === 'ArrowDown': // ArrowDown: Decrement dilution
            event.preventDefault();
            incrementDilution(false);
            break;
        // Tab handling is automatic by browser
    }
}

function focusInput(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.focus();
        input.select(); // Select text in input on focus for better UX
    }
}

function incrementDilution(increase) {
    const input = document.getElementById('customDilution');
    let value = parseInt(input.value) || DEFAULT_DILUTION_FACTOR;

    if (increase) {
        const nextDilution = COMMON_DILUTIONS.find(d => d > value);
        value = nextDilution || value + 1;
    } else {
        const lowerDilutions = COMMON_DILUTIONS.filter(d => d < value);
        value = lowerDilutions[lowerDilutions.length - 1] || Math.max(DEFAULT_DILUTION_FACTOR, value - 1);
    }

    input.value = value;
    setActiveDilution(value);
    calculateVolumes();
}

// -------------------------------------
//        Input Navigation Setup
// -------------------------------------
function setupInputNavigation() {
    const inputs = ['customDilution', 'totalVolume'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keydown', handleInputKeyDown);
            input.addEventListener('focus', handleInputFocus);
        }
    });
}

function handleInputKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const inputs = ['customDilution', 'totalVolume'];
        const currentIndex = inputs.indexOf(event.target.id);
        const nextInput = document.getElementById(
            inputs[(currentIndex + 1) % inputs.length]
        );
        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    }
}

function handleInputFocus() {
    this.select(); // Select all text in input on focus for better UX
}

// -------------------------------------
//        Keyboard Shortcut Hint
// -------------------------------------
function showKeyboardShortcutsHint() {
    const notesSection = document.querySelector('.notes-section ul');
    if (!notesSection) return;

    const shortcutLi = document.createElement('li');
    shortcutLi.innerHTML = `
        <strong>Keyboard shortcuts:</strong><br>
        • Alt + D: Focus dilution input<br>
        • Alt + V: Focus volume input<br>
        • ↑/↓: Adjust dilution value<br>
        • Enter: Move to next field<br>
        • Tab: Navigate between fields
    `;
    notesSection.appendChild(shortcutLi);
}

// Initialize the calculator on page load