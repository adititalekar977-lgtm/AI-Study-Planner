/**
 * AI STUDY PLANNER - REWARDS & GAMIFICATION MODULE
 * XP Leveling system, badge unlocks, study streak continuity & motivational rewards.
 */

const Rewards = {
  levels: [
    { level: 1, minXP: 0, title: 'Freshman Scholar' },
    { level: 2, minXP: 250, title: 'Junior Researcher' },
    { level: 3, minXP: 500, title: 'Senior Scholar' },
    { level: 4, minXP: 1000, title: 'Master Strategist' },
    { level: 5, minXP: 2000, title: 'Grand Academician' }
  ],

  init() {
    this.updateDailyStreak();
    this.checkBadges();
    this.render();
  },

  getRewardsData() {
    return Storage.get(STORAGE_KEYS.REWARDS, {
      streak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalXP: 100,
      level: 1,
      levelTitle: 'Freshman Scholar',
      badges: {}
    });
  },

  saveRewardsData(data) {
    Storage.set(STORAGE_KEYS.REWARDS, data);
  },

  updateDailyStreak() {
    const data = this.getRewardsData();
    const today = new Date().toISOString().split('T')[0];
    const lastActive = data.lastActiveDate;

    if (!lastActive) {
      data.lastActiveDate = today;
      data.streak = 1;
      data.longestStreak = 1;
      this.saveRewardsData(data);
      return;
    }

    if (lastActive === today) {
      // Already active today
      return;
    }

    // Check if last active was yesterday
    const lastDate = new Date(lastActive);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      data.streak = (data.streak || 0) + 1;
      if (data.streak > (data.longestStreak || 0)) {
        data.longestStreak = data.streak;
      }
      App.showToast(`🔥 Daily Study Streak increased to ${data.streak} Days!`, 'success');
    } else if (diffDays > 1) {
      data.streak = 1; // Streak reset
    }

    data.lastActiveDate = today;
    this.saveRewardsData(data);
  },

  addXP(amount, reason = '') {
    const data = this.getRewardsData();
    data.totalXP = (data.totalXP || 0) + amount;

    // Check level up
    let currentLevelObj = this.levels[0];
    for (const lvl of this.levels) {
      if (data.totalXP >= lvl.minXP) {
        currentLevelObj = lvl;
      }
    }

    if (currentLevelObj.level > (data.level || 1)) {
      data.level = currentLevelObj.level;
      data.levelTitle = currentLevelObj.title;
      App.showToast(`🎉 LEVEL UP! You reached Level ${data.level}: ${data.levelTitle}!`, 'success');
    }

    this.saveRewardsData(data);
    this.render();
  },

  checkBadges() {
    const data = this.getRewardsData();
    const sessions = Storage.get(STORAGE_KEYS.SESSIONS, []);
    const assignments = Storage.get(STORAGE_KEYS.ASSIGNMENTS, []);
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const quizHistory = Storage.get(STORAGE_KEYS.QUIZ_HISTORY, []);
    const badges = data.badges || {};

    const unlockBadge = (id, title, desc) => {
      if (!badges[id] || !badges[id].unlocked) {
        badges[id] = { unlocked: true, unlockedAt: new Date().toISOString().split('T')[0], title, desc };
        App.showToast(`🏆 Badge Unlocked: ${title}!`, 'success');
      }
    };

    // 1. First Step (1+ sessions)
    if (sessions.length >= 1) {
      unlockBadge('first_step', 'First Step', 'Completed your first study session.');
    }

    // 2. Pomodoro Master (5+ sessions)
    if (sessions.length >= 5) {
      unlockBadge('pomodoro_master', 'Pomodoro Master', 'Completed 5+ focused Pomodoro sessions.');
    }

    // 3. Task Crusher (3+ completed assignments)
    const completedAsg = assignments.filter(a => a.status === 'completed').length;
    if (completedAsg >= 3) {
      unlockBadge('task_crusher', 'Task Crusher', 'Completed 3 or more assignments.');
    }

    // 4. Quiz Champion (80%+ score)
    const hasHighQuiz = quizHistory.some(q => q.percentage >= 80);
    if (hasHighQuiz) {
      unlockBadge('quiz_champ', 'Quiz Champion', 'Scored 80% or higher on an AI subject quiz.');
    }

    // 5. Consistent Scholar (3+ streak)
    if (data.streak >= 3) {
      unlockBadge('streak_3', 'Consistent Scholar', 'Maintained a 3-day continuous study streak.');
    }

    // 6. Network Architect (2+ notes)
    if (notes.length >= 2) {
      unlockBadge('datacomm_pro', 'Network Architect', 'Created 2+ notes on Data Communication concepts.');
    }

    // 7. Study Marathon (10+ hours)
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    if (totalMinutes >= 600) {
      unlockBadge('marathon_mind', 'Study Marathon', 'Logged over 10 hours of focused study.');
    }

    data.badges = badges;
    this.saveRewardsData(data);
  },

  render() {
    const data = this.getRewardsData();

    // Determine next level threshold
    const currLevelIdx = this.levels.findIndex(l => l.level === data.level);
    const nextLevel = this.levels[currLevelIdx + 1] || { minXP: data.totalXP, title: 'Max Level' };
    const xpInCurrentLevel = data.totalXP - this.levels[currLevelIdx].minXP;
    const xpNeededForNext = nextLevel.minXP - this.levels[currLevelIdx].minXP || 1;
    const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

    // Update Banner
    const lvlNum = document.getElementById('rewardsLevelNumber');
    const lvlTitle = document.getElementById('rewardsLevelTitle');
    const xpText = document.getElementById('rewardsXPText');
    const xpBar = document.getElementById('rewardsXPBarFill');
    const streakDisplay = document.getElementById('rewardsStreakDisplay');

    if (lvlNum) lvlNum.textContent = `Level ${data.level}`;
    if (lvlTitle) lvlTitle.textContent = data.levelTitle;
    if (xpText) xpText.textContent = `${data.totalXP} XP (Next level at ${nextLevel.minXP} XP)`;
    if (xpBar) xpBar.style.width = `${progressPercent}%`;
    if (streakDisplay) streakDisplay.textContent = `${data.streak} Days`;

    // Render Badges Grid
    const badgesGrid = document.getElementById('rewardsBadgesGrid');
    if (!badgesGrid) return;

    const allBadgesCatalog = [
      { id: 'first_step', icon: '🌱', title: 'First Step', desc: 'Completed your first study session.' },
      { id: 'pomodoro_master', icon: '⏱️', title: 'Pomodoro Master', desc: 'Completed 5+ focused Pomodoro sessions.' },
      { id: 'task_crusher', icon: '🎯', title: 'Task Crusher', desc: 'Finished and marked 3 assignments complete.' },
      { id: 'quiz_champ', icon: '🏆', title: 'Quiz Champion', desc: 'Scored 80% or higher on an AI subject quiz.' },
      { id: 'streak_3', icon: '🔥', title: 'Consistent Scholar', desc: 'Maintained a 3-day continuous study streak.' },
      { id: 'datacomm_pro', icon: '📡', title: 'Network Architect', desc: 'Created 2+ notes on Data Communication concepts.' },
      { id: 'planner_pro', icon: '🗓️', title: 'Master Strategist', desc: 'Generate 3 AI study timetables.' },
      { id: 'marathon_mind', icon: '🚀', title: 'Study Marathon', desc: 'Log 10+ total study hours.' }
    ];

    badgesGrid.innerHTML = allBadgesCatalog.map(b => {
      const isUnlocked = data.badges && data.badges[b.id] && data.badges[b.id].unlocked;
      return `
        <div class="badge-item-card ${isUnlocked ? '' : 'locked'}">
          <div class="badge-big-icon">${b.icon}</div>
          <h4 style="font-size:1.05rem; font-weight:700; margin-bottom:0.35rem;">${b.title}</h4>
          <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">${b.desc}</p>
          <div style="margin-top:0.85rem;">
            ${isUnlocked 
              ? `<span class="badge badge-success">✓ Unlocked</span>` 
              : `<span class="badge badge-secondary" style="background:var(--bg-subtle);">🔒 Locked</span>`}
          </div>
        </div>
      `;
    }).join('');
  }
};
