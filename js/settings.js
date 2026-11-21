/**
 * AI STUDY PLANNER - SETTINGS MODULE
 * Profile management, theme customization, audio toggles, JSON backup & restore.
 */

const Settings = {
  init() {
    this.loadSettings();
    this.bindEvents();
  },

  loadSettings() {
    const user = Storage.get(STORAGE_KEYS.USER, {});
    const settings = Storage.get(STORAGE_KEYS.SETTINGS, { theme: 'light', timerSound: true });

    // Populate profile inputs
    const nameInput = document.getElementById('settingName');
    const emailInput = document.getElementById('settingEmail');
    const collegeInput = document.getElementById('settingCollege');
    const courseInput = document.getElementById('settingCourse');
    const semInput = document.getElementById('settingSemester');
    const hoursInput = document.getElementById('settingTargetHours');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (collegeInput) collegeInput.value = user.college || '';
    if (courseInput) courseInput.value = user.course || '';
    if (semInput) semInput.value = user.semester || '';
    if (hoursInput) hoursInput.value = user.targetHours || 4;

    // Set theme and sound toggle state
    const soundToggle = document.getElementById('settingSoundToggle');
    if (soundToggle) soundToggle.checked = settings.timerSound !== false;

    this.applyTheme(settings.theme || 'light');
  },

  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    const themeToggleBtn = document.getElementById('topbarThemeToggle');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      themeToggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }

    const settingsThemeSelect = document.getElementById('settingThemeSelect');
    if (settingsThemeSelect) settingsThemeSelect.value = theme;
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    const settings = Storage.get(STORAGE_KEYS.SETTINGS, {});
    settings.theme = newTheme;
    Storage.set(STORAGE_KEYS.SETTINGS, settings);

    this.applyTheme(newTheme);
    App.showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} theme.`, 'info');
  },

  saveProfile(profileData) {
    const user = Storage.get(STORAGE_KEYS.USER, {});
    user.name = profileData.name.trim();
    user.email = profileData.email.trim();
    user.college = profileData.college.trim();
    user.course = profileData.course.trim();
    user.semester = profileData.semester.trim();
    user.targetHours = parseFloat(profileData.targetHours) || 4;

    // Update avatar initials
    user.avatar = user.name
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'ST';

    Storage.set(STORAGE_KEYS.USER, user);
    Auth.updateUserInterface();
    Dashboard.render();
    App.showToast('Student profile updated successfully!', 'success');
  },

  bindEvents() {
    // Topbar Theme Toggle
    const themeBtn = document.getElementById('topbarThemeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Settings Profile Form
    const profileForm = document.getElementById('settingsProfileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('settingName')?.value;
        const email = document.getElementById('settingEmail')?.value;
        const college = document.getElementById('settingCollege')?.value;
        const course = document.getElementById('settingCourse')?.value;
        const semester = document.getElementById('settingSemester')?.value;
        const targetHours = document.getElementById('settingTargetHours')?.value;

        this.saveProfile({ name, email, college, course, semester, targetHours });
      });
    }

    // Theme selector inside settings
    const themeSelect = document.getElementById('settingThemeSelect');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        const selected = e.target.value;
        const settings = Storage.get(STORAGE_KEYS.SETTINGS, {});
        settings.theme = selected;
        Storage.set(STORAGE_KEYS.SETTINGS, settings);
        this.applyTheme(selected);
      });
    }

    // Audio chime toggle
    const soundToggle = document.getElementById('settingSoundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        const settings = Storage.get(STORAGE_KEYS.SETTINGS, {});
        settings.timerSound = e.target.checked;
        Storage.set(STORAGE_KEYS.SETTINGS, settings);
        App.showToast(e.target.checked ? 'Chime sound enabled.' : 'Chime sound muted.', 'info');
      });
    }

    // Export Data JSON
    const exportBtn = document.getElementById('btnExportData');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        Storage.exportData();
        App.showToast('Data exported successfully!', 'success');
      });
    }

    // Import Data JSON
    const importFileInput = document.getElementById('importFileInput');
    const importBtn = document.getElementById('btnImportData');
    if (importBtn && importFileInput) {
      importBtn.addEventListener('click', () => {
        importFileInput.click();
      });

      importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = Storage.importData(event.target.result);
          if (res.success) {
            App.showToast(res.message, 'success');
            setTimeout(() => location.reload(), 800);
          } else {
            App.showToast(res.message, 'danger');
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset to Demo Data
    const resetBtn = document.getElementById('btnResetDemoData');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data back to the demo showcase state?')) {
          Storage.resetToDefault();
          App.showToast('Reset back to factory demo dataset.', 'info');
          setTimeout(() => location.reload(), 600);
        }
      });
    }

    // Clear All Data
    const clearBtn = document.getElementById('btnClearAllData');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('WARNING: This will permanently wipe all local storage data. Are you completely sure?')) {
          Storage.clearAll();
          App.showToast('All storage data has been erased.', 'warning');
          setTimeout(() => location.reload(), 600);
        }
      });
    }
  }
};
