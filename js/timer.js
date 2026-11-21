/**
 * AI STUDY PLANNER - FOCUS TIMER MODULE
 * Pomodoro timer with SVG progress animation, Web Audio synthesis chimes & session logging.
 */

const FocusTimer = {
  mode: 'pomodoro', // 'pomodoro', 'shortBreak', 'longBreak'
  isRunning: false,
  timeLeft: 25 * 60, // in seconds
  totalDuration: 25 * 60,
  timerInterval: null,
  pomodoroCount: 0,

  durations: {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  },

  init() {
    this.bindEvents();
    this.updateDisplay();
    this.renderSessionHistory();
  },

  setMode(newMode) {
    this.pause();
    this.mode = newMode;
    this.totalDuration = this.durations[newMode];
    this.timeLeft = this.totalDuration;

    // Update active tab buttons
    const modeBtns = document.querySelectorAll('.timer-mode-btn');
    modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === newMode);
    });

    const caption = document.getElementById('timerStatusCaption');
    if (caption) {
      if (newMode === 'pomodoro') caption.textContent = 'Focus Session • Stay Locked In';
      else if (newMode === 'shortBreak') caption.textContent = 'Short Break • Rest Your Eyes';
      else caption.textContent = 'Long Break • Recharge Deeply';
    }

    this.updateDisplay();
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updatePlayPauseButton();

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  },

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.updatePlayPauseButton();
  },

  togglePlay() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  },

  reset() {
    this.pause();
    this.timeLeft = this.totalDuration;
    this.updateDisplay();
  },

  skip() {
    this.pause();
    if (this.mode === 'pomodoro') {
      this.setMode('shortBreak');
    } else {
      this.setMode('pomodoro');
    }
    App.showToast('Skipped to next timer interval.', 'info');
  },

  completeSession() {
    this.pause();
    this.playChimeSound();

    if (this.mode === 'pomodoro') {
      this.pomodoroCount++;
      const completedMins = Math.round(this.durations.pomodoro / 60);

      // Log to sessions in storage
      const sessions = Storage.get(STORAGE_KEYS.SESSIONS, []);
      sessions.push({
        date: new Date().toISOString().split('T')[0],
        minutes: completedMins,
        subject: 'Focus Session'
      });
      Storage.set(STORAGE_KEYS.SESSIONS, sessions);

      // Award XP
      Rewards.addXP(35, 'Completed 25-minute Focus Session');
      App.showToast(`🎉 Focus session complete! Logged ${completedMins} mins. (+35 XP)`, 'success');

      // Next interval logic
      if (this.pomodoroCount % 4 === 0) {
        this.setMode('longBreak');
        App.showToast('4 sessions completed! Time for a well-deserved 15-minute Long Break.', 'info');
      } else {
        this.setMode('shortBreak');
        App.showToast('Great focus! Take a 5-minute breather.', 'info');
      }
    } else {
      App.showToast('Break is over! Ready to focus again?', 'info');
      this.setMode('pomodoro');
    }

    this.updateDisplay();
    this.renderSessionHistory();
    Dashboard.render();
    Rewards.checkBadges();
  },

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const pad = n => String(n).padStart(2, '0');
    const formatted = `${pad(minutes)}:${pad(seconds)}`;

    const timeEl = document.getElementById('timerCountdownDisplay');
    if (timeEl) timeEl.textContent = formatted;

    // SVG Circle Stroke Animation
    // Total circumference = 2 * PI * r = 2 * 3.14159 * 130 = ~816.8
    const circle = document.getElementById('timerProgressCircle');
    if (circle) {
      const circumference = 816.8;
      const progressRatio = (this.totalDuration - this.timeLeft) / this.totalDuration;
      const offset = circumference * (1 - progressRatio);
      circle.style.strokeDashoffset = offset;
    }

    // Update document title for background productivity
    document.title = this.isRunning ? `(${formatted}) AI Study Planner` : 'AI Study Planner';
  },

  updatePlayPauseButton() {
    const btn = document.getElementById('btnTimerPlayPause');
    if (btn) {
      btn.innerHTML = this.isRunning ? '⏸' : '▶';
      btn.setAttribute('title', this.isRunning ? 'Pause' : 'Start');
    }
  },

  renderSessionHistory() {
    const list = document.getElementById('timerHistoryList');
    if (!list) return;

    const sessions = Storage.get(STORAGE_KEYS.SESSIONS, []);
    const recent = [...sessions].reverse().slice(0, 5);

    if (recent.length === 0) {
      list.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; text-align:center;">No sessions logged today yet. Hit Play to begin!</p>`;
      return;
    }

    list.innerHTML = recent.map(s => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid var(--border-light); font-size:0.85rem;">
        <div>
          <span style="font-weight:700; color:var(--text-main);">🎯 ${s.subject || 'Focus Session'}</span>
          <span style="color:var(--text-muted); font-size:0.75rem; margin-left:0.5rem;">${s.date}</span>
        </div>
        <span class="badge badge-success">+${s.minutes} mins</span>
      </div>
    `).join('');

    const completedCountEl = document.getElementById('timerCompletedCount');
    if (completedCountEl) {
      completedCountEl.textContent = `${this.pomodoroCount} completed`;
    }
  },

  /**
   * Generates a pleasant chime chime tone using pure browser Web Audio API.
   * Completely offline, requires 0 external audio files.
   */
  playChimeSound() {
    const settings = Storage.get(STORAGE_KEYS.SETTINGS, { timerSound: true });
    if (!settings.timerSound) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Create harmonious dual-tone chime
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      playTone(523.25, 0, 0.8);    // C5
      playTone(659.25, 0.2, 0.8);  // E5
      playTone(783.99, 0.4, 1.2);  // G5
    } catch (e) {
      console.log('Web Audio tone could not play:', e);
    }
  },

  bindEvents() {
    // Mode Switcher Buttons
    const modeBtns = document.querySelectorAll('.timer-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetMode = btn.getAttribute('data-mode');
        this.setMode(targetMode);
      });
    });

    // Main Play/Pause Button
    const playBtn = document.getElementById('btnTimerPlayPause');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.togglePlay();
      });
    }

    // Reset Button
    const resetBtn = document.getElementById('btnTimerReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.reset();
      });
    }

    // Skip Button
    const skipBtn = document.getElementById('btnTimerSkip');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.skip();
      });
    }
  }
};
