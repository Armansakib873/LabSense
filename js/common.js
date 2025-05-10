
// js/common.js - Contains functionality used across all pages
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeCommon(); // Encapsulating all initialization in one function
});

function initializeCommon() {
    initializeSidebar();
    initializePageLoad();
    initializeLucideIcons(); // Separate function for Lucide icons
}

// -------------------------------------
//           Page Load Functions
// -------------------------------------
function initializePageLoad() {
    const mainContent = document.querySelector('main'); // Or consider document.getElementById('main-content') for more specific selection
    if (mainContent) {
        mainContent.style.opacity = 0; // Initially set opacity to 0 for fade-in effect
        setTimeout(() => {
            mainContent.style.transition = 'opacity 0.5s ease-in-out'; // Add transition property
            mainContent.style.opacity = 1; // Fade in by setting opacity to 1
        }, 100); // Slight delay before fade-in starts
    }
}

// -------------------------------------
//           Sidebar Functions
// -------------------------------------
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const submenus = document.querySelectorAll('.has-submenu');

    if (!sidebar || !toggleBtn) {
        console.error("Sidebar or toggle button not found. Ensure elements with IDs 'sidebar' and 'toggleBtn' exist.");
        return; // Exit function if sidebar elements are not found
    }

    // --- Initial State & Transition Management ---
    sidebar.classList.add('no-transition'); // Temporarily disable transitions during initial setup
    document.body.classList.add('no-transition');

    document.querySelectorAll('.submenu').forEach(submenu => {
        submenu.style.cssText = 'transition: none; max-height: 0;'; // Immediately hide submenus without transition
    });

    // --- Sidebar Collapse State ---
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    sidebar.classList.toggle('collapsed', isCollapsed);
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    document.body.classList.toggle('sidebar-expanded', !isCollapsed); // Added body classes for potential CSS styling

    // --- Submenu State Restoration ---
    restoreSubmenuStates();

    // --- Re-enable Transitions after initial setup ---
    setTimeout(() => {
        sidebar.classList.remove('no-transition');
        document.body.classList.remove('no-transition');
        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.style.transition = ''; // Restore submenu transitions
        });
    }, 100);

    // --- Toggle Button Event Listener ---
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        document.body.classList.toggle('sidebar-collapsed', isCollapsed);
        document.body.classList.toggle('sidebar-expanded', !isCollapsed);
        localStorage.setItem('sidebar-collapsed', isCollapsed); // Save sidebar state to localStorage
    });

    // --- Submenu Event Listeners ---
    submenus.forEach(submenu => {
        submenu.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior (if submenu is an <a> tag)
            toggleSubmenu(submenu); // Call function to handle submenu toggle and state saving
        });
    });

    // --- Prevent Submenu Link Propagation ---
    document.querySelectorAll('.submenu a').forEach(item => {
        item.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent submenu link clicks from toggling the submenu
        });
    });
}

function toggleSubmenu(submenuElement) { // Renamed parameter for clarity
    submenuElement.classList.toggle('open');
    const submenuUlElement = submenuElement.querySelector('.submenu'); // Renamed variable for clarity
    if (submenuUlElement) {
        submenuUlElement.style.maxHeight = submenuElement.classList.contains('open')
            ? `${submenuUlElement.scrollHeight}px`
            : null; // Set max-height to scrollHeight to open, or null to close
    }
    saveSubmenuStates(); // Save submenu states to localStorage after toggling
}


function saveSubmenuStates() {
    // --- Using data-submenu-id for more robust state saving ---
    const openSubmenuIds = Array.from(document.querySelectorAll('.has-submenu.open'))
        .map(submenu => submenu.dataset.submenuId) // Get data-submenu-id of open submenus
        .filter(id => id); // Filter out any null or undefined IDs (safety check)

    localStorage.setItem('open-submenus', JSON.stringify(openSubmenuIds)); // Store array of open submenu IDs
}

function restoreSubmenuStates() {
    const openSubmenuIds = JSON.parse(localStorage.getItem('open-submenus') || '[]'); // Get array of saved submenu IDs from localStorage

    openSubmenuIds.forEach(submenuId => { // Iterate through saved submenu IDs
        if (submenuId) { // Check if submenuId is valid
            const submenu = document.querySelector(`.has-submenu[data-submenu-id="${submenuId}"]`); // Select submenu using data-submenu-id
            if (submenu) {
                submenu.classList.add('open'); // Re-open the submenu
                const submenuUlElement = submenu.querySelector('.submenu');
                if (submenuUlElement) {
                    submenuUlElement.style.maxHeight = `${submenuUlElement.scrollHeight}px`; // Set max-height to display submenu content
                }
            }
        }
    });
}

// -------------------------------------
//           Lucide Icon Initialization
// -------------------------------------
function initializeLucideIcons() {
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons(); // Initialize Lucide icons if library is available
    } else {
        console.warn("Lucide icons library not found. Ensure it's included in your HTML.");
    }
}
