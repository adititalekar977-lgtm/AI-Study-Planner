/**
 * AI STUDY PLANNER - AUTHENTICATION MODULE
 * Demonstrates simulated student authentication with LocalStorage session handling.
 */

const Auth = {
  init() {
    this.bindEvents();
    this.updateUserInterface();
  },

  getCurrentUser() {
    return Storage.get(STORAGE_KEYS.USER, null);
  },

  isLoggedIn() {
    const user = this.getCurrentUser();
    return user && user.isLoggedIn === true;
  },

  login(email, password) {
    if (!email || !password) {
      App.showToast('Please enter both email and password.', 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      App.showToast('Please enter a valid email address.', 'warning');
      return false;
    }

    let user = this.getCurrentUser();
    if (!user) {
      Storage.resetToDefault();
      user = this.getCurrentUser();
    }

    if (user.password && user.password !== password) {
      App.showToast('Incorrect password. Please try again.', 'danger');
      return false;
    }

    user.isLoggedIn = true;
    user.email = email;
    Storage.set(STORAGE_KEYS.USER, user);

    this.updateUserInterface();
    App.closeModal('authModal');
    App.showToast(`Welcome back, ${user.name}!`, 'success');
    Dashboard.render();
    return true;
  },

  loginAsDemo() {
    Storage.resetToDefault();
    const user = this.getCurrentUser();
    user.isLoggedIn = true;
    Storage.set(STORAGE_KEYS.USER, user);

    this.updateUserInterface();
    App.closeModal('authModal');
    App.showToast('Logged in as Demo Student: Alex Morgan', 'success');
    
    // Refresh modules
    Dashboard.render();
    Timetable.render();
    Assignments.render();
    Notes.render();
    Exams.render();
    Rewards.render();
    return true;
  },

  signup(name, email, password, course, semester) {
    if (!name || !email || !password) {
      App.showToast('Please fill out all required fields.', 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      App.showToast('Please enter a valid email address.', 'warning');
      return false;
    }

    if (password.length < 4) {
      App.showToast('Password must be at least 4 characters long.', 'warning');
      return false;
    }

    const initials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'ST';

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password: password,
      college: 'Apex Institute of Technology',
      course: course || 'Computer Science & Engineering',
      labSection: 'Data Communication Lab',
      semester: semester || '6th Semester',
      targetHours: 4,
      avatar: initials,
      isLoggedIn: true,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    Storage.set(STORAGE_KEYS.USER, newUser);
    this.updateUserInterface();
    App.closeModal('authModal');
    App.showToast(`Account created! Welcome, ${newUser.name}!`, 'success');
    Dashboard.render();
    return true;
  },

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      user.isLoggedIn = false;
      Storage.set(STORAGE_KEYS.USER, user);
    }
    this.updateUserInterface();
    App.showToast('You have logged out successfully.', 'info');
    App.openModal('authModal');
  },

  updateUserInterface() {
    const user = this.getCurrentUser();
    const isLoggedIn = this.isLoggedIn();

    const nameElements = document.querySelectorAll('.display-user-name');
    const emailElements = document.querySelectorAll('.display-user-email');
    const courseElements = document.querySelectorAll('.display-user-course');
    const avatarElements = document.querySelectorAll('.display-user-avatar');

    if (user) {
      nameElements.forEach(el => el.textContent = user.name || 'Student');
      emailElements.forEach(el => el.textContent = user.email || 'student@college.edu');
      courseElements.forEach(el => el.textContent = `${user.course || 'CSE'} (${user.semester || '6th Sem'})`);
      avatarElements.forEach(el => el.textContent = user.avatar || 'ST');
    }

    // Auth warning banner / trigger buttons
    const authStatusBadge = document.getElementById('authStatusBadge');
    if (authStatusBadge) {
      authStatusBadge.innerHTML = isLoggedIn 
        ? `<span class="badge badge-success">✓ Demo Active</span>` 
        : `<span class="badge badge-warning">Guest Mode</span>`;
    }
  },

  bindEvents() {
    // Demo Account button
    const demoBtn = document.getElementById('btnDemoLogin');
    if (demoBtn) {
      demoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.loginAsDemo();
      });
    }

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value;
        const pass = document.getElementById('loginPassword')?.value;
        this.login(email, pass);
      });
    }

    // Signup Form Submit
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName')?.value;
        const email = document.getElementById('signupEmail')?.value;
        const pass = document.getElementById('signupPassword')?.value;
        const course = document.getElementById('signupCourse')?.value;
        const sem = document.getElementById('signupSem')?.value;
        this.signup(name, email, pass, course, sem);
      });
    }

    // Tab toggle between Login & Signup inside Modal
    const authTabs = document.querySelectorAll('.auth-tab-btn');
    authTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        authTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabTarget = btn.getAttribute('data-tab');
        const loginPane = document.getElementById('authLoginPane') || document.getElementById('loginForm');
        const signupPane = document.getElementById('authSignupPane') || document.getElementById('signupForm');
        if (tabTarget === 'signup') {
          if (loginPane) loginPane.style.display = 'none';
          if (signupPane) signupPane.style.display = 'block';
        } else {
          if (loginPane) loginPane.style.display = 'block';
          if (signupPane) signupPane.style.display = 'none';
        }
      });
    });

    // Profile pill trigger
    const profileBtn = document.getElementById('topbarProfileBtn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        App.navigateTo('settings');
      });
    }

    // Logout triggers
    const logoutBtns = document.querySelectorAll('.action-logout');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    });
  }
};
