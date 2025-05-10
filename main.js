const pages = {
    dashboard: { title: 'Dashboard', url: 'dashboard.html' },
    experiments: { title: 'Experiments', url: 'experiments.html' },
    inventory: { title: 'Inventory', url: 'inventory.html' },
    reports: { title: 'Reports', url: 'reports.html' },
    settings: { title: 'Settings', url: 'settings.html' },
    semen: { title: 'Semen Analysis', url: 'semen.html' }
};

const sidebar = document.getElementById('sidebar');
const sidebarNav = document.getElementById('sidebar-nav');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const overlay = document.getElementById('overlay');
const userMenuBtn = document.getElementById('user-menu-btn');
const userDropdown = document.getElementById('user-dropdown');
const bottomNav = document.querySelector('.bottom-nav');
const breadcrumbCurrent = document.getElementById('breadcrumb-current');
const breadcrumbSubpageContainer = document.getElementById('breadcrumb-subpage-container');
const breadcrumbSubpage = document.getElementById('breadcrumb-subpage');
const pageContents = document.querySelectorAll('.page-content');
const submenuContainers = document.querySelectorAll('.submenu-container');

class NavManager {
    constructor() {
        this.currentPage = localStorage.getItem('currentPage') || 'dashboard';
        this.currentSubPage = localStorage.getItem('currentSubPage') || null;
        this.initEventListeners();
        this.loadInitialPage();
        this.handleResponsive();
    }

    initEventListeners() {
        menuToggleBtn.addEventListener('click', () => this.toggleSidebar());
        overlay.addEventListener('click', () => this.closeSidebar());

        userMenuBtn.addEventListener('click', () => {
            const isHidden = userDropdown.classList.toggle('hidden');
            userMenuBtn.setAttribute('aria-expanded', !isHidden);
        });
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
                userMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (e) => {
            const mainPageLink = e.target.closest('.sidebar-main-item[data-page], a[data-page]:not(.sidebar-main-item)');
            const subPageLink = e.target.closest('.sidebar-submenu-item[data-subpage]');

            if (mainPageLink && mainPageLink.dataset.page) {
                e.preventDefault();
                const pageId = mainPageLink.dataset.page;
                if (pageId !== this.currentPage) {
                    this.changePage(pageId);
                } else {
                    const submenu = document.getElementById(`${pageId}-submenu`);
                    if (submenu) this.toggleSubmenu(submenu);
                }
            } else if (subPageLink && subPageLink.dataset.subpage) {
                e.preventDefault();
                const subPageId = subPageLink.dataset.subpage;
                const parentPageId = subPageLink.closest('.submenu-container').id.replace('-submenu', '');
                this.changep>
                this.changeSubPage(parentPageId, subPageId, subPageLink);
                if (window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-full')) {
                    this.closeSidebar();
                }
            }
        });

        sidebarNav.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const item = e.target.closest('.sidebar-item');
                if (item) item.click();
            }
        });

        window.addEventListener('resize', this.debounce(() => this.handleResponsive(), 150));
    }

    toggleSubmenu(submenu) {
        if (submenu.classList.contains('active')) {
            submenu.style.height = `${submenu.scrollHeight}px`;
            requestAnimationFrame(() => {
                submenu.style.height = '0';
                submenu.classList.remove('active');
            });
            setTimeout(() => {
                submenu.style.height = '';
            }, 300);
        } else {
            submenu.classList.add('active');
            const height = submenu.scrollHeight;
            submenu.style.height = '0';
            requestAnimationFrame(() => {
                submenu.style.height = `${height}px`;
            });
            setTimeout(() => {
                submenu.style.height = 'auto';
            }, 300);
        }
    }

    toggleSidebar() {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('active');
    }

    closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.remove('active');
    }

    loadInitialPage() {
        this.changePage(this.currentPage, true);
        const initialSubmenu = document.getElementById(`${this.currentPage}-submenu`);
        if (initialSubmenu) {
            const firstSubItem = initialSubmenu.querySelector('.sidebar-submenu-item');
            if (firstSubItem && !this.currentSubPage) {
                this.currentSubPage = firstSubItem.dataset.subpage;
                firstSubItem.classList.add('active');
            }
        }
    }

    changePage(pageId, isInitialLoad = false) {
        if (!pages[pageId]) return;
        localStorage.setItem('currentPage', pageId);

        const pageContent = document.getElementById(`${pageId}-content`);
        const iframe = document.getElementById(`${pageId}-iframe`);
        const loadingElement = document.getElementById(`${pageId}-loading`);

        if (!isInitialLoad) {
            pageContents.forEach(page => page.classList.remove('active'));
            if (loadingElement) loadingElement.classList.remove('hidden');
        }

        if (pageContent) {
            if (isInitialLoad) {
                pageContent.classList.add('active');
            } else {
                setTimeout(() => pageContent.classList.add('active'), 50);
            }

            if (iframe && !iframe.src && iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
                iframe.onload = () => {
                    if (loadingElement) loadingElement.classList.add('hidden');
                };
                iframe.onerror = () => {
                    if (loadingElement) loadingElement.classList.add('hidden');
                    pageContent.innerHTML = `<div class="text-red-600 p-4">Error loading content. Please try again later.</div>`;
                };
            } else {
                if (loadingElement) loadingElement.classList.add('hidden');
            }
        }

        this.updateNavigation(pageId);
        this.updateSubmenuVisibility(pageId);
        breadcrumbCurrent.textContent = pages[pageId].title;
        breadcrumbSubpageContainer.classList.add('hidden');

        this.currentPage = pageId;
        this.currentSubPage = null;
    }

    changeSubPage(parentPageId, subPageId, clickedElement) {
        if (parentPageId !== this.currentPage) {
            this.changePage(parentPageId);
            return;
        }

        this.currentSubPage = subPageId;
        localStorage.setItem('currentSubPage', subPageId);

        const currentSubmenu = document.getElementById(`${parentPageId}-submenu`);
        if (currentSubmenu) {
            currentSubmenu.querySelectorAll('.sidebar-submenu-item').forEach(item => {
                item.classList.remove('active');
            });
            if (clickedElement) {
                clickedElement.classList.add('active');
                breadcrumbSubpage.textContent = clickedElement.querySelector('span').textContent;
                breadcrumbSubpageContainer.classList.remove('hidden');
            }
        }
    }

    updateNavigation(pageId) {
        sidebarNav.querySelectorAll('.sidebar-main-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });

        bottomNav.querySelectorAll('.bottom-nav-item').forEach(item => {
            if (item.dataset.page) {
                item.classList.toggle('active', item.dataset.page === pageId);
                item.setAttribute('aria-current', item.dataset.page === pageId ? 'page' : 'false');
            }
        });
    }

    updateSubmenuVisibility(pageId) {
        submenuContainers.forEach(container => {
            if (container.classList.contains('active')) {
                this.toggleSubmenu(container);
            }
        });
        const targetSubmenu = document.getElementById(`${pageId}-submenu`);
        if (targetSubmenu && !targetSubmenu.classList.contains('active')) {
            this.toggleSubmenu(targetSubmenu);
            if (!this.currentSubPage) {
                const firstSubItem = targetSubmenu.querySelector('.sidebar-submenu-item');
                if (firstSubItem) {
                    firstSubItem.classList.add('active');
                    this.currentSubPage = firstSubItem.dataset.subpage;
                }
            } else {
                const activeSubItem = targetSubmenu.querySelector(`.sidebar-submenu-item[data-subpage="${this.currentSubPage}"]`);
                if (activeSubItem) activeSubItem.classList.add('active');
            }
        }
    }

    handleResponsive() {
        if (window.innerWidth >= 768) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('active');
        } else {
            if (!overlay.classList.contains('active')) {
                sidebar.classList.add('-translate-x-full');
            }
        }
    }

    debounce(fn, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navManager = new NavManager();
});