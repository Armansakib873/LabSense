// js/bioqc.js - Contains Biochemistry QC Sheet page specific functionality
// ==============================================================

// --- Test Data (Consider moving this to a separate JSON file or data source for larger datasets) ---
const testData = [
    { name: 'ALKP', units: 'U/L', mean: 110, low: 88, high: 132 },
    { name: 'Amylase', units: 'U/L', mean: 72.4, low: 64, high: 80.8 },
    { name: 'Bilirubin Direct', units: 'mg/dL', mean: 0.4, low: 0.3, high: 0.5 },
    { name: 'Bilirubin Total', units: 'mg/dL', mean: 1.22, low: 1.05, high: 1.39 },
    { name: 'BUN', units: 'mg/dL', mean: 14.8, low: 13.2, high: 16.5 },
    { name: 'Calcium', units: 'mg/dL', mean: 9.45, low: 8.54, high: 10.4 },
    { name: 'Chloride (CHL)', units: 'mEq/L', mean: 96, low: 90.1, high: 102 },
    { name: 'Cholesterol', units: 'mg/dL', mean: 210, low: 220, high: 260 }, // Note: Mean is lower than Low in original data - verify if this is intentional
    { name: 'GGT', units: 'U/L', mean: 58.3, low: 40.5, high: 76 },
    { name: 'D.HDL', units: 'mg/dL', mean: 74, low: 61.4, high: 86.6 },
    { name: 'Iron', units: 'μg/dL', mean: 242, low: 226, high: 259 },
    { name: 'Lipase', units: 'U/L', mean: 58.4, low: 45.4, high: 71.3 },
    { name: 'D.LDL', units: 'mg/dL', mean: 128, low: 103, high: 152 },
    { name: 'MG', units: 'mg/dL', mean: 2.06, low: 1.75, high: 2.36 },
    { name: 'Phosphate(IP)', units: 'mg/dL', mean: 3, low: 2.53, high: 3.47 },
    { name: 'Potassium (POT)', units: 'mEq/L', mean: 3.87, low: 3.64, high: 4.1 },
    { name: 'T. Protein', units: 'g/dL', mean: 6.46, low: 5.94, high: 6.98 },
    { name: 'Albumin', units: 'g/dL', mean: 3.98, low: 3.69, high: 4.26 },
    { name: 'Creatinine', units: 'mg/dL', mean: 2.18, low: 1.79, high: 2.58 },
    { name: 'SGOT(AST)', units: 'U/L', mean: 46.8, low: 37.5, high: 56.1 },
    { name: 'SGPT(ALT)', units: 'U/L', mean: 37, low: 28.6, high: 45.4 },
    { name: 'Sodium (SOD)', units: 'mEq/L', mean: 144, low: 138, high: 150 },
    { name: 'TIBC', units: 'μg/dL', mean: 308, low: 271, high: 344 },
    { name: 'Trig(TG)', units: 'mg/dL', mean: 180, low: 164, high: 196 },
    { name: 'Uric Acid', units: 'mg/dL', mean: 4.68, low: 4.32, high: 5.04 },
    { name: 'Glucose', units: 'mmol/l', mean: 4.71, low: 4.18, high: 94.20 }, // Note: High value seems unusually high for Glucose mean 4.71 - Verify if intentional
    { name: 'CPK', units: 'U/L', mean: 126, low: 101, high: 150 },
    { name: 'LDH', units: 'U/L', mean: 183, low: 163, high: 203 },
    { name: 'CO2', units: 'mEq/L', mean: 30.7, low: 24.1, high: 37.3 },
    { name: 'IGG', units: 'mg/dL', mean: 939, low: 811, high: 1067 }
];

let isEditMode = false; // Track edit mode state

document.addEventListener('DOMContentLoaded', () => {
    initializeBioQCPage(); // Encapsulating all BIO QC page initialization
});

function initializeBioQCPage() {
    displayCurrentDate();
    createTableRows();
    loadSavedData(); // Load saved data on page load
}

// -------------------------------------
//        Date Display Setup
// -------------------------------------
function displayCurrentDate() {
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// -------------------------------------
//        Table Creation & Handling
// -------------------------------------
function createTableRows() {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) return; // Exit if table body not found

    testData.forEach(test => {
        const tr = createTableRow(test);
        tbody.appendChild(tr);
    });
}

function createTableRow(test) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${test.name}</td>
        <td>${test.units}</td>
        <td>
            <input type="number" step="0.01" class="result-input"
                   onchange="checkResult(this, ${test.mean}, ${test.low}, ${test.high})"
                   onkeydown="handleKeyboardNavigation(event, this)">
        </td>
        <td>${test.mean}</td>
        <td>${test.low}</td>
        <td>${test.high}</td>
        <td><span class="status animated">Pending</span></td>
    `;
    return tr;
}

function handleKeyboardNavigation(event, input) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        const currentRow = input.closest('tr');
        const nextRow = currentRow.nextElementSibling;
        const currentIndex = Array.from(currentRow.querySelectorAll('input')).indexOf(input);

        if (nextRow) {
            const nextInput = nextRow.querySelectorAll('input')[currentIndex];
            if (nextInput) {
                nextInput.focus();
                nextInput.select(); // Select input text for better UX
            }
        }
    }
}

function checkResult(input, mean, low, high) {
    const value = parseFloat(input.value);
    const statusSpan = input.parentElement.parentElement.querySelector('.status');
    const meanBuffer = (high - low) * 0.1; // 10% buffer around mean

    let statusText = 'Pending'; // Default status
    let statusClass = 'status animated'; // Default class

    if (!isNaN(value)) { // Only check status if value is a number
        if (value < low || value > high) {
            statusText = 'FAIL';
            statusClass = 'status animated status-critical';
        } else if (Math.abs(value - mean) <= meanBuffer) {
            statusText = 'MEAN';
            statusClass = 'status animated status-normal';
        } else if (value < mean) {
            statusText = 'LOWER';
            statusClass = 'status animated status-lower';
        } else {
            statusText = 'HIGHER';
            statusClass = 'status animated status-higher';
        }
    }

    statusSpan.textContent = statusText;
    statusSpan.className = statusClass;
}

// -------------------------------------
//        Edit Mode Functionality
// -------------------------------------
function toggleEditMode() {
    isEditMode = !isEditMode;
    const container = document.querySelector('.qc-container');
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');

    container.classList.toggle('edit-mode', isEditMode); // Toggle 'edit-mode' class on container
    makeFieldsEditable(isEditMode); // Call function to make fields editable based on mode
    editButton.style.display = isEditMode ? 'none' : 'block'; // Toggle edit button display
    saveButton.style.display = isEditMode ? 'block' : 'none'; // Toggle save button display
}

function makeFieldsEditable(editable) {
    const editableElements = document.querySelectorAll('.editable');
    editableElements.forEach(elem => {
        const text = elem.textContent;
        elem.innerHTML = editable ? `<input type="text" value="${text}" class="editable-input">` : text; // Toggle between input and text
    });

    const rows = document.querySelectorAll('#dataTableBody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (editable) {
            cells[0].innerHTML = `<input type="text" value="${cells[0].textContent}" class="editable-input">`;
            cells[1].innerHTML = `<input type="text" value="${cells[1].textContent}" class="editable-input">`;
            cells[3].innerHTML = `<input type="number" value="${cells[3].textContent}" class="range-edit">`;
            cells[4].innerHTML = `<input type="number" value="${cells[4].textContent}" class="range-edit">`;
            cells[5].innerHTML = `<input type="number" value="${cells[5].textContent}" class="range-edit">`;
        } else {
            // Revert back to text content from input values or existing text
            cells[0].textContent = cells[0].querySelector('input')?.value || cells[0].textContent;
            cells[1].textContent = cells[1].querySelector('input')?.value || cells[1].textContent;
            cells[3].textContent = cells[3].querySelector('input')?.value || cells[3].textContent;
            cells[4].textContent = cells[4].querySelector('input')?.value || cells[4].textContent;
            cells[5].textContent = cells[5].querySelector('input')?.value || cells[5].textContent;
        }
    });
}

function saveChanges() {
    const data = collectSheetData(); // Collect data from the sheet
    localStorage.setItem('qcSheetData', JSON.stringify(data)); // Save data to localStorage
    toggleEditMode(); // Exit edit mode
    showToast('Changes saved successfully!'); // Show toast notification
}

function collectSheetData() {
    return {
        controlName: document.querySelector('[data-field="controlName"] input')?.value || document.querySelector('[data-field="controlName"]')?.textContent, // Get value from input or text
        lotNo: document.querySelector('[data-field="lotNo"] input')?.value || document.querySelector('[data-field="lotNo"]')?.textContent, // Get value from input or text
        tests: Array.from(document.querySelectorAll('#dataTableBody tr')).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                name: cells[0].querySelector('input')?.value || cells[0].textContent, // Get value from input or text
                units: cells[1].querySelector('input')?.value || cells[1].textContent, // Get value from input or text
                result: cells[2].querySelector('input')?.value || cells[2].textContent, // Get value from input or text - though result is input itself, might be useful if saving initial result values too
                mean: cells[3].querySelector('input')?.value || cells[3].textContent, // Get value from input or text
                low: cells[4].querySelector('input')?.value || cells[4].textContent, // Get value from input or text
                high: cells[5].querySelector('input')?.value || cells[5].textContent // Get value from input or text
            };
        })
    };
}

function loadSavedData() {
    const savedData = localStorage.getItem('qcSheetData');
    if (savedData) {
        const data = JSON.parse(savedData);
        applySheetData(data); // Apply loaded data to the sheet
    }
}

function applySheetData(data) {
    if (data.controlName) document.querySelector('[data-field="controlName"]').textContent = data.controlName;
    if (data.lotNo) document.querySelector('[data-field="lotNo"]').textContent = data.lotNo;
    if (data.tests && data.tests.length === testData.length) {
        const rows = document.querySelectorAll('#dataTableBody tr');
        data.tests.forEach((test, index) => {
            const cells = rows[index].querySelectorAll('td');
            cells[0].textContent = test.name; // Setting name again, though it's likely same as initial testData
            cells[1].textContent = test.units; // Setting units again, though it's likely same as initial testData
            cells[2].querySelector('input').value = test.result || ''; // Load saved result or keep empty
            cells[3].textContent = test.mean; // Setting mean again, though it's likely same as initial testData
            cells[4].textContent = test.low; // Setting low again, though it's likely same as initial testData
            cells[5].textContent = test.high; // Setting high again, though it's likely same as initial testData
            checkResult(cells[2].querySelector('input'), parseFloat(test.mean), parseFloat(test.low), parseFloat(test.high)); // Re-check status based on loaded result
        });
    }
}


// -------------------------------------
//        Excel Export Functionality
// -------------------------------------
function exportToExcel() {
    const wb = createWorkbook(); // Create Excel workbook
    const currentDate2 = new Date().toLocaleDateString().replace(/\//g, '-'); // Get current date for filename

    XLSX.writeFile(wb, `lab_control_sheet_${currentDate2}.xlsx`); // Save Excel file
    showToast('Excel file exported successfully!'); // Show toast notification
}

function createWorkbook() {
    const wb = XLSX.utils.book_new();

    const headerData = createHeaderData(); // Create header data array
    const tableData = createTableDataForExcel(); // Create table data array

    const ws = XLSX.utils.aoa_to_sheet([...headerData, [''], ...tableData]); // Create worksheet

    applyExcelStyles(ws); // Apply styles to worksheet

    const currentDate2 = new Date().toLocaleDateString().replace(/\//g, '-'); // Get current date for sheet name
    XLSX.utils.book_append_sheet(wb, ws, currentDate2); // Add worksheet to workbook
    return wb; // Return workbook
}

function createHeaderData() {
    const companyName = document.querySelector('.qc-header h1').textContent;
    const systemInfo = document.querySelector('.qc-header p').textContent;
    const controlName = document.querySelector('[data-field="controlName"]').textContent.trim();
    const lotNo = document.querySelector('[data-field="lotNo"]').textContent.trim();
    const currentDate = document.getElementById('currentDate').textContent;

    return [
        [companyName],
        [systemInfo],
        [''],
        ['Control Name:', controlName],
        ['Lot No:', lotNo],
        ['Date:', currentDate]
    ];
}

function createTableDataForExcel() {
    const tableData = [
        ['Test Name', 'Units', 'Result', 'Mean', 'Low', 'High', 'Status']
    ];

    const rows = document.querySelectorAll('#dataTableBody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = [
            cells[0].textContent,
            cells[1].textContent,
            cells[2].querySelector('input').value || '',
            cells[3].textContent,
            cells[4].textContent,
            cells[5].textContent,
            cells[6].querySelector('.status').textContent
        ];
        tableData.push(rowData);
    });
    return tableData;
}

function applyExcelStyles(ws) {
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },  // Merge company name row
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }   // Merge system info row
    ];

    ws['!cols'] = [
        { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 } // Column widths
    ];
}


// -------------------------------------
//        Clear All Inputs Functionality
// -------------------------------------
function clearAllInputs() {
    if (!confirm('Are you sure you want to clear all results? This action cannot be undone.')) return; // Confirmation dialog

    const inputs = document.querySelectorAll('.result-input');
    inputs.forEach(input => {
        input.value = ''; // Clear input value
        const statusSpan = input.parentElement.parentElement.querySelector('.status');
        statusSpan.textContent = 'Pending'; // Reset status text
        statusSpan.className = 'status animated'; // Reset status class
    });
    showToast('All results have been cleared'); // Show toast notification
}