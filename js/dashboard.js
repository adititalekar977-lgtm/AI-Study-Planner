/**
 * AI STUDY PLANNER - DASHBOARD MODULE
 * Dynamically computes analytics, schedules, goals, and metrics from actual LocalStorage records.
 */

const Dashboard = {
  init() {
    this.render();
    this.bindEvents();
    this.startClock();
  },

  startClock() {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
      const dateStr = now.toLocaleDateString('en-US', options);
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const dateEl = document.getElementById('dashLiveDate');
      if (dateEl) {
        dateEl.textContent = `${dateStr} • ${timeStr}`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  },

  render() {
    const user = Storage.get(STORAGE_KEYS.USER) || { name: 'Student', targetHours: 4 };
    const timetable = Storage.get(STORAGE_KEYS.TIMETABLE, []);
    const assignments = Storage.get(STORAGE_KEYS.ASSIGNMENTS, []);
    const exams = Storage.get(STORAGE_KEYS.EXAMS, []);
    const sessions = Storage.get(STORAGE_KEYS.SESSIONS, []);
    const rewards = Storage.get(STORAGE_KEYS.REWARDS, { streak: 1, level: 1 });

    // 1. Personal Welcome Message
    const greetingEl = document.getElementById('dashGreeting');
    if (greetingEl) {
      greetingEl.textContent = `${this.getGreeting()}, ${user.name}! 🚀`;
    }

    // 2. Compute Actual Statistics
    // Total study hours from logged sessions
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Today's completed tasks (completed timetable sessions today + completed assignments today)
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = timetable.filter(t => t.date === todayStr || !t.date);
    const completedSessionsToday = todaySessions.filter(t => t.completed).length;

    // Pending assignments
    const pendingAssignments = assignments.filter(a => a.status !== 'completed').length;

    // Upcoming exams (date >= today)
    const upcomingExams = exams.filter(e => {
      if (!e.examDate) return false;
      const exDate = new Date(e.examDate);
      exDate.setHours(23, 59, 59, 999);
      return exDate >= new Date();
    }).length;

    // Update KPI Card values
    const kpiHours = document.getElementById('kpiTotalHours');
    const kpiHoursCard = document.getElementById('kpiTotalHoursCard');
    const kpiTasks = document.getElementById('kpiCompletedTasks');
    const kpiAssignments = document.getElementById('kpiPendingAssignments');
    const kpiExams = document.getElementById('kpiUpcomingExams');

    if (kpiHours) kpiHours.textContent = `${totalHours} hrs`;
    if (kpiHoursCard) kpiHoursCard.textContent = `${totalHours} hrs`;
    if (kpiTasks) kpiTasks.textContent = `${completedSessionsToday} done`;
    if (kpiAssignments) kpiAssignments.textContent = pendingAssignments;
    if (kpiExams) kpiExams.textContent = upcomingExams;

    // Topbar streak & Level
    const topbarStreakNum = document.getElementById('topbarStreakNumber');
    if (topbarStreakNum) {
      topbarStreakNum.textContent = `${rewards.streak || 1} Days`;
    }

    // 3. Goal Progress calculation (Today's hours vs Daily Target)
    const todayLoggedMins = sessions
      .filter(s => s.date === todayStr)
      .reduce((acc, s) => acc + (s.minutes || 0), 0);
    const todayLoggedHours = (todayLoggedMins / 60).toFixed(1);
    const targetHours = user.targetHours || 4;
    const progressPercent = Math.min(100, Math.round((todayLoggedHours / targetHours) * 100));

    const goalBarFill = document.getElementById('dashGoalBarFill');
    const goalText = document.getElementById('dashGoalText');
    const goalRatio = document.getElementById('dashGoalRatio');

    if (goalBarFill) goalBarFill.style.width = `${progressPercent}%`;
    if (goalText) goalText.textContent = `${progressPercent}% Achieved`;
    if (goalRatio) goalRatio.textContent = `${todayLoggedHours} / ${targetHours} Hours Target`;

    // 4. Render Today's Timetable Preview
    this.renderTodaySchedule(todaySessions);

    // 5. Render Urgent Assignments Preview
    this.renderUrgentAssignments(assignments);

    // 6. Render Next Exam Preview
    this.renderNextExamWidget(exams);

    // 7. Render Random Daily Motivation Quote
    this.renderMotivationQuote();
  },

  renderTodaySchedule(sessions) {
    const listEl = document.getElementById('dashScheduleList');
    if (!listEl) return;

    if (!sessions || sessions.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p>📅 No study sessions scheduled for today.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 0.75rem;" onclick="App.navigateTo('timetable')">
            + Generate AI Timetable
          </button>
        </div>`;
      return;
    }

    listEl.innerHTML = sessions.slice(0, 4).map(item => `
      <div class="schedule-item-row ${item.completed ? 'completed' : ''}">
        <div class="schedule-item-info">
          <div class="schedule-time-badge">🕒 ${item.timeSlot}</div>
          <div>
            <div class="schedule-subject-name">${escapeHTML(item.subject)}</div>
            <div class="schedule-subject-topic">${escapeHTML(item.topic || 'Core Subject Module')}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="badge ${item.priority === 'High' ? 'badge-danger' : 'badge-primary'}">${item.priority}</span>
          <button class="btn btn-sm ${item.completed ? 'btn-secondary' : 'btn-outline-primary'}" 
                  onclick="Dashboard.toggleSessionDone('${item.id}')">
            ${item.completed ? '✓ Completed' : 'Mark Done'}
          </button>
        </div>
      </div>
    `).join('');
  },

  toggleSessionDone(sessionId) {
    Timetable.toggleSessionComplete(sessionId);
    this.render();
  },

  renderUrgentAssignments(assignments) {
    const container = document.getElementById('dashAssignmentsList');
    if (!container) return;

    const pending = assignments
      .filter(a => a.status !== 'completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 3);

    if (pending.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">
          🎉 All assignments completed! Outstanding work!
        </div>`;
      return;
    }

    const now = new Date();
    container.innerHTML = pending.map(a => {
      const deadline = new Date(a.deadline);
      const isOverdue = deadline < now;
      const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      const dueLabel = isOverdue ? 'Overdue' : diffDays === 0 ? 'Due Today' : `Due in ${diffDays}d`;

      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.8rem 0; border-bottom:1px solid var(--border-light);">
          <div>
            <div style="font-weight:700; font-size:0.92rem; color:var(--text-main);">${escapeHTML(a.title)}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHTML(a.subject)}</div>
          </div>
          <div style="text-align:right;">
            <span class="badge ${isOverdue ? 'badge-danger' : a.priority === 'High' ? 'badge-warning' : 'badge-primary'}">${dueLabel}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderNextExamWidget(exams) {
    const container = document.getElementById('dashNextExamCard');
    if (!container) return;

    const now = new Date();
    const sorted = exams
      .filter(e => new Date(e.examDate) >= now)
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

    if (sorted.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 1.5rem; color:var(--text-muted); font-size:0.9rem;">
          No upcoming exams scheduled. You're all clear!
        </div>`;
      return;
    }

    const next = sorted[0];
    const examDate = new Date(next.examDate);
    const diffDays = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));

    container.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 0.75rem;">
        <div>
          <span class="badge badge-danger">Upcoming Exam</span>
          <h4 style="margin-top: 0.4rem; font-size: 1.05rem;">${escapeHTML(next.paperName)}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted);">${escapeHTML(next.venue || 'Campus Examination Hall')}</p>
        </div>
        <div style="text-align: center; background: var(--danger-light); border: 1px solid var(--danger-border); padding: 0.6rem 1rem; border-radius: var(--radius-md);">
          <div style="font-size: 1.7rem; font-weight: 800; color: var(--danger); line-height: 1;">${diffDays}</div>
          <div style="font-size: 0.7rem; font-weight: 700; color: var(--danger); text-transform: uppercase;">Days Left</div>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="App.navigateTo('exams')">
        View All Exam Deadlines →
      </button>
    `;
  },

  renderMotivationQuote() {
    const quotes = [
      { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
      { text: "Bandwidth without discipline is just packet loss. Focus on your packet flow!", author: "Data Comm Engineering Motto" },
      { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
      { text: "Continuous effort—not strength or intelligence—is the key to unlocking our potential.", author: "Winston Churchill" }
    ];

    const quoteEl = document.getElementById('dashQuoteText');
    const authorEl = document.getElementById('dashQuoteAuthor');
    if (quoteEl && authorEl) {
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      quoteEl.textContent = `"${q.text}"`;
      authorEl.textContent = `— ${q.author}`;
    }
  },

  bindEvents() {
    // Quick Action Buttons
    const quickActions = {
      'btnQuickTimetable': 'timetable',
      'btnQuickAssistant': 'assistant',
      'btnQuickTimer': 'timer',
      'btnQuickQuiz': 'quiz',
      'btnQuickAssignment': 'assignments',
      'btnQuickNote': 'notes'
    };

    Object.keys(quickActions).forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          App.navigateTo(quickActions[btnId]);
        });
      }
    });
  }
};
