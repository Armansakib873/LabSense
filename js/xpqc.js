const testData = [
    { name: 'AFP', units: 'ng/mL', mean: 20, low: 15.6, high: 24.8 },
    { name: 'THCG', units: 'mIU/mL', mean: 7.09, low: 3.88, high: 10.3 },
    { name: 'CEA', units: 'ng/mL', mean: 1.11, low: 0.678, high: 1.54 },
    { name: 'CORT', units: 'µg/dL', mean: 6.23, low: 4.27, high: 8.19 },
    { name: 'E2', units: 'pg/mL', mean: 77.1, low: 52.8, high: 101 },
    { name: 'FERR', units: 'ng/mL', mean: 60, low: 46.9, high: 73 },
    { name: 'FSH', units: 'mIU/mL', mean: 7.48, low: 5.91, high: 9.05 },
    { name: 'FT3', units: 'pg/mL', mean: 3.02, low: 2.65, high: 3.39 },
    { name: 'FT4', units: 'ng/dL', mean: 0.84, low: 0.64, high: 1.04 },
    { name: 'LH', units: 'mIU/mL', mean: 1.39, low: 1.07, high: 1.71 },
    { name: 'PRL', units: 'ng/mL', mean: 5.75, low: 4.71, high: 6.8 },
    { name: 'PROG', units: 'ng/mL', mean: 0.738, low: 0.37, high: 1.11 },
    { name: 'PSA', units: 'ng/mL', mean: 0.759, low: 0.63, high: 0.89 },
    { name: 'T3', units: 'ng/dL', mean: 1.96, low: 1.21, high: 2.71 },
    { name: 'T4', units: 'µg/dL', mean: 5.28, low: 3.96, high: 6.59 },
    { name: 'TEST', units: 'nmol/L', mean: 5.79, low: 3.92, high: 7.63 },
    { name: 'TIGE', units: 'IU/mL', mean: 351, low: 272, high: 429 },
    { name: 'TSH3', units: 'µIU/mL', mean: 0.455, low: 0.364, high: 0.546 },
    { name: 'VITB', units: 'pg/mL', mean: 365, low: 252, high: 478 },
    { name: 'VIT-D', units: 'ng/mL', mean: 22.6, low: 13, high: 32.2 },
    { name: 'CA-125', units: 'U/mL', mean: 32.4, low: 28, high: 35.8 },
    { name: 'CA-15.3', units: 'U/mL', mean: 17.7, low: 23.9, high: 31.4 },
    { name: 'CA-19.9', units: 'U/mL', mean: 29.73, low: 31.3, high: 39.6 },
    { name: 'HBSAG II', units: 'U/mL', mean: 0.50, low: 0.1, high: 0.99 }
];

let isEditMode = false;

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.zIndex = '1000';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function calculateFactor(value, mean) {
    if (!value || !mean) return '-';
    return (value / mean).toFixed(3);
}

function getFactorColor(factor) {
    if (factor === '-') return 'var(--text)';
    factor = parseFloat(factor);
    if (factor > 1.1) return '#ff9800';
    if (factor < 0.9) return '#f44336';
    return '#4caf50';
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const container = document.querySelector('.qc-container');
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');

    if (isEditMode) {
        container.classList.add('edit-mode');
        makeFieldsEditable(true);
        editButton.style.display = 'none';
        saveButton.style.display = 'block';
    } else {
        container.classList.remove('edit-mode');
        makeFieldsEditable(false);
        editButton.style.display = 'block';
        saveButton.style.display = 'none';
    }
}

function makeFieldsEditable(editable) {
    document.querySelectorAll('.editable').forEach(elem => {
        const text = elem.textContent;
        if (editable) {
            elem.innerHTML = `<input type="text" value="${text}" class="editable-input">`;
        } else {
            elem.textContent = elem.querySelector('input')?.value || text;
        }
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
            cells[0].textContent = cells[0].querySelector('input')?.value || cells[0].textContent;
            cells[1].textContent = cells[1].querySelector('input')?.value || cells[1].textContent;
            cells[3].textContent = cells[3].querySelector('input')?.value || cells[3].textContent;
            cells[4].textContent = cells[4].querySelector('input')?.value || cells[4].textContent;
            cells[5].textContent = cells[5].querySelector('input')?.value || cells[5].textContent;
        }
    });
}

function createTableRows() {
    const tbody = document.getElementById('dataTableBody');
    testData.forEach(test => {
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
            <td><span class="factor-value">-</span></td>
            <td><span class="status animated">Pending</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function checkResult(input, mean, low, high) {
    const value = parseFloat(input.value);
    const row = input.parentElement.parentElement;
    const statusSpan = row.querySelector('.status');
    const factorSpan = row.querySelector('.factor-value');
    const meanBuffer = (high - low) * 0.1;

    // Calculate and display factor
    const factor = calculateFactor(value, mean);
    factorSpan.textContent = factor;
    factorSpan.style.color = getFactorColor(factor);

    if (!value) {
        statusSpan.textContent = 'Pending';
        statusSpan.className = 'status animated';
        return;
    }

    if (value < low || value > high) {
        statusSpan.textContent = 'FAIL';
        statusSpan.className = 'status animated status-critical';
    } else if (Math.abs(value - mean) <= meanBuffer) {
        statusSpan.textContent = 'MEAN';
        statusSpan.className = 'status animated status-normal';
    } else if (value < mean) {
        statusSpan.textContent = 'LOWER';
        statusSpan.className = 'status animated status-lower';
    } else {
        statusSpan.textContent = 'HIGHER';
        statusSpan.className = 'status animated status-higher';
    }
}

function handleKeyboardNavigation(event, input) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const currentRow = input.closest('tr');
        const nextRow = currentRow.nextElementSibling;
        const currentIndex = Array.from(currentRow.querySelectorAll('input')).indexOf(input);

        if (nextRow) {
            const nextInput = nextRow.querySelectorAll('input')[currentIndex];
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        }
    }
}

function clearAllInputs() {
    if (confirm('Are you sure you want to clear all results? This action cannot be undone.')) {
        const inputs = document.querySelectorAll('.result-input');
        inputs.forEach(input => {
            input.value = '';
            const row = input.closest('tr');
            const statusSpan = row.querySelector('.status');
            const factorSpan = row.querySelector('.factor-value');
            
            statusSpan.textContent = 'Pending';
            statusSpan.className = 'status animated';
            factorSpan.textContent = '-';
            factorSpan.style.color = 'var(--text)';
        });
        showToast('All results have been cleared');
    }
}

function exportToExcel() {
    const wb = XLSX.utils.book_new();

    // Get dynamic data
    const companyName = document.querySelector('.qc-header h1').textContent;
    const systemInfo = document.querySelector('.qc-header p').textContent;
    const controlName = document.querySelector('[data-field="controlName"]').textContent.trim();
    const lotNo = document.querySelector('[data-field="lotNo"]').textContent.trim();
    const currentDate = document.getElementById('currentDate').textContent;

    // Create header
    const headerData = [
        [companyName],
        [systemInfo],
        [''],
        ['Control Name:', controlName],
        ['Lot No:', lotNo],
        ['Date:', currentDate]
    ];

    // Create main data
    const tableData = [
        ['Test Name', 'Units', 'Result', 'Mean', 'Low', 'High', 'Factor', 'Status']
    ];

    // Get table data
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
            cells[6].querySelector('.factor-value').textContent,
            cells[7].querySelector('.status').textContent
        ];
        tableData.push(rowData);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([...headerData, [''], ...tableData]);

    // Style configuration
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
    ];

    // Set column widths
    ws['!cols'] = [
        { wch: 20 }, // Test Name
        { wch: 10 }, // Units
        { wch: 10 }, // Result
        { wch: 10 }, // Mean
        { wch: 10 }, // Low
        { wch: 10 }, // High
        { wch: 10 }, // Factor
        { wch: 15 }  // Status
    ];

    // Get current date for filename
    const currentDate2 = new Date().toLocaleDateString().replace(/\//g, '-');

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, currentDate2);

    // Save file
    XLSX.writeFile(wb, `lab_control_sheet_${currentDate2}.xlsx`);
    showToast('Excel file exported successfully!');
}

function saveChanges() {
    const data = {
        controlName: document.querySelector('[data-field="controlName"] input')?.value,
        lotNo: document.querySelector('[data-field="lotNo"] input')?.value,
        tests: Array.from(document.querySelectorAll('#dataTableBody tr')).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                name: cells[0].querySelector('input')?.value || cells[0].textContent,
                units: cells[1].querySelector('input')?.value || cells[1].textContent,
                mean: cells[3].querySelector('input')?.value || cells[3].textContent,
                low: cells[4].querySelector('input')?.value || cells[4].textContent,
                high: cells[5].querySelector('input')?.value || cells[5].textContent
            };
        })
    };

    localStorage.setItem('qcSheetData', JSON.stringify(data));
    toggleEditMode();
    showToast('Changes saved successfully!');
}

// Initialize date and table
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});

// Load saved data if exists
const savedData = localStorage.getItem('qcSheetData');
if (savedData) {
    const data = JSON.parse(savedData);
    // TODO: Implement loading saved data
}

createTableRows();