/**
 * AI STUDY PLANNER - MAIN APP CONTROLLER
 * Routing, Modals, Mobile Drawers, Global Search, and Toast Notification Engine.
 */

const App = {
  activeView: 'dashboard',

  init() {
    this.bindNavigation();
    this.bindModals();
    this.bindGlobalSearch();
    this.bindMobileSidebar();
    this.bindNotificationDropdown();

    // Initialize Submodules
    Auth.init();
    Dashboard.init();
    Timetable.init();
    Assistant.init();
    Assignments.init();
    Notes.init();
    FocusTimer.init();
    Quiz.init();
    Progress.init();
    Exams.init();
    Rewards.init();
    Settings.init();

    // Check if user is logged in; if not, open demo auth modal
    if (!Auth.isLoggedIn()) {
      setTimeout(() => {
        this.openModal('authModal');
      }, 400);
    }
  },

  /**
   * View Switcher / Routing
   */
  navigateTo(viewId) {
    if (viewId === 'logout') {
      Auth.logout();
      return;
    }

    // Hide all page views
    const views = document.querySelectorAll('.page-view');
    views.forEach(v => v.classList.remove('active-view'));

    // Show target page view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active-view');
      this.activeView = viewId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active state in sidebar navigation
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(item => {
      const targetAttr = item.getAttribute('data-target');
      item.classList.toggle('active', targetAttr === viewId);
    });

    // Close mobile sidebar if open
    this.closeMobileSidebar();

    // Re-render view-specific dynamic data
    if (viewId === 'dashboard') Dashboard.render();
    else if (viewId === 'timetable') Timetable.render();
    else if (viewId === 'assignments') Assignments.render();
    else if (viewId === 'notes') Notes.render();
    else if (viewId === 'progress') Progress.render();
    else if (viewId === 'exams') Exams.render();
    else if (viewId === 'rewards') Rewards.render();
    else if (viewId === 'settings') Settings.loadSettings();
  },

  bindNavigation() {
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-nav');
        if (target) this.navigateTo(target);
      });
    });
  },

  /**
   * Mobile Sidebar Drawer Handling
   */
  bindMobileSidebar() {
    const toggleBtn = document.getElementById('mobileNavToggle');
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        if (backdrop) backdrop.classList.toggle('active');
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.closeMobileSidebar();
      });
    }
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  },

  /**
   * Modal Management System
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  bindModals() {
    // Click outside modal or close button to dismiss
    const modals = document.querySelectorAll('.modal-backdrop');
    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });

      const closeBtns = modal.querySelectorAll('.modal-close-trigger');
      closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.closeModal(modal.id);
        });
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-backdrop.active');
        activeModals.forEach(m => this.closeModal(m.id));
      }
    });
  },

  /**
   * Toast Notification System
   */
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'danger') icon = '❌';

    toast.innerHTML = `
      <span style="font-size:1.1rem;">${icon}</span>
      <span style="font-size:0.88rem; font-weight:500; line-height:1.4;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        toast.remove();
      }, 250);
    }, duration);
  },

  /**
   * Topbar Global Search
   */
  bindGlobalSearch() {
    const searchInput = document.getElementById('topbarSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return;

        if (query.includes('summar')) {
          this.navigateTo('notes');
          Notes.switchTab('summarizer');
        } else if (query.includes('note')) {
          this.navigateTo('notes');
          Notes.switchTab('organizer');
        } else if (query.includes('exam') || query.includes('test') || query.includes('date')) {
          this.navigateTo('exams');
        } else if (query.includes('quiz') || query.includes('question')) {
          this.navigateTo('quiz');
        } else if (query.includes('assign') || query.includes('lab') || query.includes('homework')) {
          this.navigateTo('assignments');
        } else if (query.includes('timer') || query.includes('pomodoro') || query.includes('focus')) {
          this.navigateTo('timer');
        } else if (query.includes('time') || query.includes('table') || query.includes('schedule')) {
          this.navigateTo('timetable');
        } else {
          // Send to AI Assistant
          this.navigateTo('assistant');
          Assistant.sendMessage(searchInput.value);
        }
        searchInput.value = '';
      }
    });
  },

  /**
   * Topbar Notification Dropdown
   */
  bindNotificationDropdown() {
    const bellBtn = document.getElementById('topbarNotificationBtn');
    const dropdown = document.getElementById('notificationDropdown');

    if (bellBtn && dropdown) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      });

      document.addEventListener('click', () => {
        dropdown.style.display = 'none';
      });

      dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }
};

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
