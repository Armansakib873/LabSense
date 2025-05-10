
// js/egfr.js - Contains eGFR calculator page specific functionality
// ==============================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeEgfrPage(); // Encapsulating all eGFR page initialization
});

function initializeEgfrPage() {
    initializeForm();
    setupEnterKeyNavigation();
}

// -------------------------------------
//           Form Initialization
// -------------------------------------
function initializeForm() {
    const form = document.getElementById('egfrForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit); // Attach submit event listener
    }
}

function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    calculateEGFR();      // Call eGFR calculation function
}


// -------------------------------------
//        Enter Key Navigation
// -------------------------------------
function setupEnterKeyNavigation() {
    const inputs = ['creatinine', 'age', 'gender', 'height', 'weight'];

    inputs.forEach((id, index) => {
        const inputElement = document.getElementById(id);
        if (inputElement) { // Check if element exists to avoid errors
            inputElement.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent form submission on Enter key
                    if (index === inputs.length - 1) {
                        calculateEGFR(); // If last input, trigger calculation
                    } else {
                        const nextInput = document.getElementById(inputs[index + 1]);
                        if (nextInput) { // Check if next input exists
                            nextInput.focus(); // Focus the next input
                        }
                    }
                }
            });
        }
    });
}


// -------------------------------------
//           eGFR Calculation
// -------------------------------------
function calculateEGFR() {
    // Get input values
    const creatinine = parseFloat(document.getElementById('creatinine').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const height = parseInt(document.getElementById('height').value);
    const weight = parseInt(document.getElementById('weight').value);

    // Validate inputs - Basic validation, consider more robust validation
    if (isNaN(creatinine) || isNaN(age) || gender === '' || isNaN(height) || isNaN(weight)) {
        alert('Please fill in all fields with valid numbers and select gender.'); // Basic alert for validation
        return;
    }

    // Calculate BSA using DuBois formula
    const bsa = 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);

    // Calculate eGFR using CKD-EPI equation
    let egfr;
    const kappa = gender === 'female' ? 0.7 : 0.9;
    const alpha = gender === 'female' ? -0.329 : -0.411;
    const genderFactor = gender === 'female' ? 1.018 : 1;

    const scrKappa = creatinine / kappa;
    const minScrKappa = Math.min(scrKappa, 1);
    const maxScrKappa = Math.max(scrKappa, 1);

    egfr = 141 *
        Math.pow(minScrKappa, alpha) *
        Math.pow(maxScrKappa, -1.209) *
        Math.pow(0.993, age) *
        genderFactor;

    // Adjust for BSA
    egfr = egfr * (bsa / 1.73);

    // Round to 1 decimal place
    egfr = Math.round(egfr * 10) / 10;

    // Display result
    displayResult(egfr);
}

// -------------------------------------
//           Display Results
// -------------------------------------
function displayResult(egfrValue) {
    document.getElementById('egfrValue').textContent = `${egfrValue} mL/min/1.73m²`;

    // Generate comment based on eGFR value
    let comment = '';
    let commentColor = '';

    if (egfrValue >= 90) {
        comment = 'Normal kidney function (Stage 1 CKD if other markers of kidney damage are present)';
        commentColor = '#27ae60'; // Green
    } else if (egfrValue >= 60) {
        comment = 'Mild reduction in kidney function (Stage 2 CKD if other markers of kidney damage are present)';
        commentColor = '#2ecc71'; // Light Green
    } else if (egfrValue >= 45) {
        comment = 'Mild to moderate reduction in kidney function (Stage 3a CKD)';
        commentColor = '#f1c40f'; // Yellow
    } else if (egfrValue >= 30) {
        comment = 'Moderate to severe reduction in kidney function (Stage 3b CKD)';
        commentColor = '#e67e22'; // Orange
    } else if (egfrValue >= 15) {
        comment = 'Severe reduction in kidney function (Stage 4 CKD)';
        commentColor = '#e74c3c'; // Red
    } else {
        comment = 'Kidney failure (Stage 5 CKD)';
        commentColor = '#c0392b'; // Dark Red
    }

    const commentElement = document.getElementById('egfrComment');
    commentElement.textContent = comment;
    commentElement.style.backgroundColor = `${commentColor}20`; // Use string literal for template
    commentElement.style.color = commentColor;
}