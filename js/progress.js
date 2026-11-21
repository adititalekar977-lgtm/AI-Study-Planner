/**
 * AI STUDY PLANNER - PROGRESS & ANALYTICS MODULE
 * Generates dynamic charts using pure SVG and CSS from actual student LocalStorage data.
 */

const Progress = {
  init() {
    this.render();
  },

  render() {
    const sessions = Storage.get(STORAGE_KEYS.SESSIONS, []);
    const assignments = Storage.get(STORAGE_KEYS.ASSIGNMENTS, []);
    const quizHistory = Storage.get(STORAGE_KEYS.QUIZ_HISTORY, []);
    const rewards = Storage.get(STORAGE_KEYS.REWARDS, { streak: 1, longestStreak: 1 });

    this.renderTopMetrics(sessions, assignments, quizHistory, rewards);
    this.renderWeeklyBarChart(sessions);
    this.renderSubjectDistribution(sessions);
    this.renderAssignmentRate(assignments);
    this.renderQuizTrend(quizHistory);
  },

  renderTopMetrics(sessions, assignments, quizHistory, rewards) {
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    const completedAsg = assignments.filter(a => a.status === 'completed').length;
    const asgRate = assignments.length > 0 ? Math.round((completedAsg / assignments.length) * 100) : 0;

    let avgQuizScore = 0;
    if (quizHistory.length > 0) {
      const sum = quizHistory.reduce((acc, q) => acc + q.percentage, 0);
      avgQuizScore = Math.round(sum / quizHistory.length);
    }

    const mHours = document.getElementById('analyticsTotalHours');
    const mSessions = document.getElementById('analyticsTotalSessions');
    const mAsgRate = document.getElementById('analyticsAsgRate');
    const mQuizAvg = document.getElementById('analyticsAvgQuiz');
    const mStreak = document.getElementById('analyticsCurrentStreak');

    if (mHours) mHours.textContent = `${totalHours} hrs`;
    if (mSessions) mSessions.textContent = sessions.length;
    if (mAsgRate) mAsgRate.textContent = `${asgRate}%`;
    if (mQuizAvg) mQuizAvg.textContent = `${avgQuizScore}%`;
    if (mStreak) mStreak.textContent = `${rewards.streak || 1} Days`;
  },

  /**
   * Pure CSS/SVG Weekly Bar Chart
   */
  renderWeeklyBarChart(sessions) {
    const container = document.getElementById('weeklyChartContainer');
    if (!container) return;

    // Generate past 7 days dates and names
    const daysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Sum minutes logged on that date
      const dayMinutes = sessions
        .filter(s => s.date === dateStr)
        .reduce((acc, s) => acc + (s.minutes || 0), 0);
      const dayHours = (dayMinutes / 60).toFixed(1);

      daysData.push({ dayName, dateStr, minutes: dayMinutes, hours: parseFloat(dayHours) });
    }

    const maxHours = Math.max(...daysData.map(d => d.hours), 4);

    const totalWeekHours = daysData.reduce((acc, d) => acc + d.hours, 0);

    container.innerHTML = `
      <div style="display:flex; align-items:flex-end; justify-content:space-between; height:200px; padding-top:1.5rem; gap:0.5rem;">
        ${daysData.map(d => {
          const heightPercent = d.hours > 0 ? Math.max(12, Math.round((d.hours / maxHours) * 100)) : 6;
          return `
            <div class="chart-bar-col">
              <div class="chart-bar-pillar" style="height:${heightPercent}%; ${d.hours === 0 ? 'background:var(--border-light);' : ''}" data-tooltip="${d.hours} hrs"></div>
              <div class="chart-bar-label">${d.dayName}</div>
            </div>
          `;
        }).join('')}
      </div>
      ${totalWeekHours === 0 ? '<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; margin-top:0.5rem;">No study hours recorded this week yet. Complete Pomodoros or timetable sessions to log hours!</div>' : ''}
    `;
  },

  /**
   * Subject Distribution Progress Breakdown
   */
  renderSubjectDistribution(sessions) {
    const container = document.getElementById('subjectDistributionContainer');
    if (!container) return;

    const subjectMap = {};
    sessions.forEach(s => {
      const sub = s.subject || 'General Studies';
      subjectMap[sub] = (subjectMap[sub] || 0) + (s.minutes || 0);
    });

    const totalMinutes = Object.values(subjectMap).reduce((a, b) => a + b, 0) || 1;
    const subjects = Object.keys(subjectMap);

    if (subjects.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:2rem;">No study session logs available yet.</p>`;
      return;
    }

    container.innerHTML = subjects.map(sub => {
      const mins = subjectMap[sub];
      const percent = Math.round((mins / totalMinutes) * 100);
      const hours = (mins / 60).toFixed(1);

      return `
        <div style="margin-bottom:1.1rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.88rem; font-weight:600; margin-bottom:0.35rem;">
            <span>${sub}</span>
            <span>${hours} hrs (${percent}%)</span>
          </div>
          <div class="progress-bar-container" style="margin:0;">
            <div class="progress-bar-fill" style="width:${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Assignment Completion Radial Progress
   */
  renderAssignmentRate(assignments) {
    const container = document.getElementById('assignmentGaugeContainer');
    if (!container) return;

    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Circumference = 2 * PI * 45 = 282.7
    const circumference = 282.7;
    const offset = circumference * (1 - percent / 100);

    container.innerHTML = `
      <div style="position:relative; width:130px; height:130px; margin:0 auto;">
        <svg viewBox="0 0 100 100" style="transform:rotate(-90deg); width:100%; height:100%;">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-light)" stroke-width="8"></circle>
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--success)" stroke-width="8" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"></circle>
        </svg>
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center;">
          <div style="font-size:1.5rem; font-weight:800; color:var(--text-main); line-height:1;">${percent}%</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">${completed}/${total} Done</div>
        </div>
      </div>
    `;
  },

  /**
   * Recent Quiz Score Trend
   */
  renderQuizTrend(quizHistory) {
    const container = document.getElementById('quizTrendContainer');
    if (!container) return;

    const recent = quizHistory.slice(0, 5).reverse();
    if (recent.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">Take a quiz to view performance score trends.</p>`;
      return;
    }

    container.innerHTML = `
      <div style="display:flex; align-items:flex-end; justify-content:space-around; height:140px; padding-top:1rem;">
        ${recent.map((q, idx) => `
          <div style="display:flex; flex-direction:column; align-items:center; gap:0.4rem; flex:1;">
            <div style="font-size:0.72rem; font-weight:700; color:var(--primary);">${q.percentage}%</div>
            <div style="width:22px; height:${Math.max(12, q.percentage)}px; background:var(--secondary-gradient); border-radius:4px 4px 0 0;"></div>
            <div style="font-size:0.7rem; color:var(--text-muted);">Q${idx + 1}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
};
