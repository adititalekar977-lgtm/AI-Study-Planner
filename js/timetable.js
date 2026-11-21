/**
 * AI STUDY PLANNER - TIMETABLE MODULE
 * Intelligent schedule synthesis algorithm considering subject priority, exam proximity, and breaks.
 */

const Timetable = {
  currentView: 'daily', // 'daily' or 'weekly'
  activeDayFilter: 'Monday',

  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const timetable = Storage.get(STORAGE_KEYS.TIMETABLE, []);
    this.renderViewTabs();

    if (this.currentView === 'daily') {
      this.renderDailyView(timetable);
    } else {
      this.renderWeeklyView(timetable);
    }
  },

  renderViewTabs() {
    const dailyTab = document.getElementById('tabDailyView');
    const weeklyTab = document.getElementById('tabWeeklyView');
    if (dailyTab && weeklyTab) {
      dailyTab.classList.toggle('active', this.currentView === 'daily');
      weeklyTab.classList.toggle('active', this.currentView === 'weekly');
    }
  },

  renderDailyView(timetable) {
    const container = document.getElementById('timetableContainer');
    if (!container) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[new Date().getDay()];

    // Filter for current day or selected day
    const daySessions = timetable.filter(t => t.day === this.activeDayFilter || t.date === todayStr);

    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
        <div style="display:flex; gap:0.4rem; overflow-x:auto; padding-bottom:4px;">
          ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `
            <button class="filter-pill ${day === this.activeDayFilter ? 'active' : ''}" 
                    onclick="Timetable.setDayFilter('${day}')">
              ${day} ${day === currentDayName ? '• Today' : ''}
            </button>
          `).join('')}
        </div>
        <button class="btn btn-primary btn-sm" onclick="App.openModal('addSessionModal')">
          + Add Session
        </button>
      </div>
    `;

    if (daySessions.length === 0) {
      html += `
        <div class="card" style="text-align:center; padding:3rem; color:var(--text-muted);">
          <h3>No study slots scheduled for ${this.activeDayFilter}</h3>
          <p style="margin:0.5rem 0 1.25rem;">Use the AI Generator on the left or add custom study sessions.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="App.openModal('addSessionModal')">+ Add Study Slot</button>
        </div>
      `;
    } else {
      html += `<div style="display:flex; flex-direction:column; gap:0.85rem;">`;
      daySessions.forEach(slot => {
        html += `
          <div class="schedule-item-row ${slot.completed ? 'completed' : ''}" style="padding:1.1rem;">
            <div class="schedule-item-info">
              <div class="schedule-time-badge" style="font-size:0.88rem;">⏰ ${slot.timeSlot}</div>
              <div>
                <div class="schedule-subject-name" style="font-size:1.05rem;">
                  ${escapeHTML(slot.subject)}
                  <span class="badge ${slot.priority === 'High' ? 'badge-danger' : slot.priority === 'Medium' ? 'badge-warning' : 'badge-primary'}" style="margin-left:0.5rem;">
                    ${slot.priority} Priority
                  </span>
                </div>
                <div class="schedule-subject-topic" style="margin-top:0.25rem; color:var(--text-secondary);">
                  📖 ${escapeHTML(slot.topic || 'General Revision & Core Lab Concepts')}
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button class="btn btn-sm ${slot.completed ? 'btn-secondary' : 'btn-success'}" 
                      onclick="Timetable.toggleSessionComplete('${slot.id}')">
                ${slot.completed ? '✓ Completed' : 'Mark Done'}
              </button>
              <button class="btn btn-sm btn-secondary" onclick="Timetable.deleteSession('${slot.id}')" title="Delete Session">
                🗑️
              </button>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    container.innerHTML = html;
  },

  renderWeeklyView(timetable) {
    const container = document.getElementById('timetableContainer');
    if (!container) return;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    let html = `
      <div style="overflow-x:auto;">
        <table class="weekly-timetable-table">
          <thead>
            <tr>
              ${days.map(d => `<th>${d}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              ${days.map(day => {
                const daySlots = timetable.filter(t => t.day === day);
                return `
                  <td style="vertical-align:top; min-width:140px;">
                    ${daySlots.length === 0 ? '<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:1rem 0;">No sessions</div>' : ''}
                    ${daySlots.map(s => `
                      <div class="weekly-slot-card ${s.completed ? 'done' : ''}" onclick="Timetable.toggleSessionComplete('${s.id}')">
                        <div style="font-weight:700; color:var(--primary); font-size:0.75rem;">${s.timeSlot}</div>
                        <div style="font-weight:700; font-size:0.85rem; margin:0.2rem 0;">${s.subject}</div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">${s.priority}</div>
                        ${s.completed ? '<span style="color:var(--success); font-size:0.7rem; font-weight:700;">✓ Done</span>' : ''}
                      </div>
                    `).join('')}
                  </td>
                `;
              }).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  },

  setDayFilter(day) {
    this.activeDayFilter = day;
    this.render();
  },

  toggleSessionComplete(sessionId) {
    const timetable = Storage.get(STORAGE_KEYS.TIMETABLE, []);
    const slot = timetable.find(s => s.id === sessionId);
    if (!slot) return;

    slot.completed = !slot.completed;

    const sessions = Storage.get(STORAGE_KEYS.SESSIONS, []);
    const today = new Date().toISOString().split('T')[0];

    if (slot.completed) {
      sessions.push({
        sessionId: slot.id,
        date: today,
        minutes: slot.durationMinutes || 60,
        subject: slot.subject
      });
      Storage.set(STORAGE_KEYS.SESSIONS, sessions);

      if (!slot.xpAwarded) {
        slot.xpAwarded = true;
        Rewards.addXP(25, `Completed timetable slot: ${slot.subject}`);
        App.showToast(`Completed "${slot.subject}"! (+25 XP)`, 'success');
      } else {
        App.showToast(`Completed "${slot.subject}"!`, 'success');
      }
    } else {
      // If unmarked, remove the logged session entry to prevent duplicate/inflated hours
      const idx = sessions.findIndex(s => s.sessionId === slot.id);
      if (idx !== -1) {
        sessions.splice(idx, 1);
        Storage.set(STORAGE_KEYS.SESSIONS, sessions);
      }
      App.showToast(`Marked "${slot.subject}" as pending.`, 'info');
    }

    Storage.set(STORAGE_KEYS.TIMETABLE, timetable);
    this.render();
    Dashboard.render();
  },

  deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this study session?')) return;
    let timetable = Storage.get(STORAGE_KEYS.TIMETABLE, []);
    timetable = timetable.filter(s => s.id !== sessionId);
    Storage.set(STORAGE_KEYS.TIMETABLE, timetable);
    App.showToast('Study session deleted.', 'info');
    this.render();
    Dashboard.render();
  },

  addCustomSession(data) {
    const timetable = Storage.get(STORAGE_KEYS.TIMETABLE, []);
    const newSession = {
      id: 'tt_' + Date.now(),
      day: data.day || 'Monday',
      timeSlot: `${data.startTime} - ${data.endTime}`,
      subject: data.subject,
      topic: data.topic || 'Subject Study & Practice',
      priority: data.priority || 'Medium',
      durationMinutes: parseInt(data.duration) || 60,
      completed: false,
      date: new Date().toISOString().split('T')[0]
    };
    timetable.push(newSession);
    Storage.set(STORAGE_KEYS.TIMETABLE, timetable);
    App.showToast(`Study slot for "${data.subject}" added!`, 'success');
    this.render();
    Dashboard.render();
  },

  /**
   * Core Smart AI Timetable Generation Algorithm
   */
  generateAITimetable(config) {
    const {
      subjects, // Array of { name, priority, topics }
      dailyHours, // e.g. 4
      startTime,  // e.g. "09:00"
      sessionDuration, // e.g. 60
      breakDuration, // e.g. 15
      daysToGenerate // ['Monday', 'Tuesday', ...]
    } = config;

    const exams = Storage.get(STORAGE_KEYS.EXAMS, []);
    const now = new Date();

    // 1. Calculate weighted urgency for each subject
    const weightedSubjects = subjects.map(sub => {
      let weight = 1;
      if (sub.priority === 'High') weight = 3;
      else if (sub.priority === 'Medium') weight = 2;
      else weight = 1;

      // Check proximity of any upcoming exam in this subject
      const relatedExam = exams.find(e => 
        e.subject.toLowerCase().includes(sub.name.toLowerCase()) || 
        sub.name.toLowerCase().includes(e.subject.toLowerCase())
      );

      if (relatedExam) {
        const daysUntil = (new Date(relatedExam.examDate) - now) / (1000 * 60 * 60 * 24);
        if (daysUntil <= 7 && daysUntil >= 0) {
          weight *= 2.0; // Double urgency for exams this week!
        } else if (daysUntil <= 14) {
          weight *= 1.4;
        }
      }

      return { ...sub, computedWeight: weight };
    });

    // 2. Generate time slots based on daily available hours
    const [startH, startM] = startTime.split(':').map(Number);
    let totalMinutesAvailable = dailyHours * 60;
    const slotCycle = sessionDuration + breakDuration;
    const slotsPerDay = Math.floor(totalMinutesAvailable / slotCycle);

    if (slotsPerDay <= 0) {
      App.showToast('Please increase daily study hours or reduce session duration.', 'warning');
      return;
    }

    // Build weighted selection pool according to computedWeight
    const weightedPool = [];
    weightedSubjects.forEach(sub => {
      const count = Math.max(1, Math.round(sub.computedWeight));
      for (let k = 0; k < count; k++) {
        weightedPool.push(sub);
      }
    });

    const newTimetable = [];
    const targetDays = daysToGenerate || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    targetDays.forEach((dayName, dayIndex) => {
      let currentMinuteCursor = startH * 60 + startM;

      // Select subjects by priority pool distribution
      for (let i = 0; i < slotsPerDay; i++) {
        // Weighted round-robin pick from prioritized distribution pool
        const subjectIndex = (dayIndex * slotsPerDay + i) % weightedPool.length;
        const selectedSub = weightedPool[subjectIndex];

        const slotStartH = Math.floor(currentMinuteCursor / 60);
        const slotStartM = currentMinuteCursor % 60;

        const endMinute = currentMinuteCursor + sessionDuration;
        const slotEndH = Math.floor(endMinute / 60);
        const slotEndM = endMinute % 60;

        const pad = n => String(n).padStart(2, '0');
        const timeSlotString = `${pad(slotStartH)}:${pad(slotStartM)} - ${pad(slotEndH)}:${pad(slotEndM)}`;

        newTimetable.push({
          id: `tt_${Date.now()}_${dayIndex}_${i}`,
          day: dayName,
          timeSlot: timeSlotString,
          subject: selectedSub.name,
          topic: selectedSub.topics || 'Core concepts, active recall & lab experiments',
          priority: selectedSub.priority,
          durationMinutes: sessionDuration,
          completed: false,
          date: new Date().toISOString().split('T')[0]
        });

        // Advance cursor with break
        currentMinuteCursor = endMinute + breakDuration;
      }
    });

    Storage.set(STORAGE_KEYS.TIMETABLE, newTimetable);
    Rewards.addXP(40, 'Generated a smart AI Timetable');
    App.showToast(`AI Timetable generated with ${newTimetable.length} optimized sessions! (+40 XP)`, 'success');
    this.render();
    Dashboard.render();
  },

  bindEvents() {
    // Switch between Daily and Weekly views
    const dailyTab = document.getElementById('tabDailyView');
    const weeklyTab = document.getElementById('tabWeeklyView');
    if (dailyTab) {
      dailyTab.addEventListener('click', () => {
        this.currentView = 'daily';
        this.render();
      });
    }
    if (weeklyTab) {
      weeklyTab.addEventListener('click', () => {
        this.currentView = 'weekly';
        this.render();
      });
    }

    // AI Timetable Generator Form Submission
    const generatorForm = document.getElementById('aiTimetableForm');
    if (generatorForm) {
      generatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dailyHours = parseFloat(document.getElementById('ttGenHours')?.value) || 4;
        const startTime = document.getElementById('ttGenStartTime')?.value || '09:00';
        const sessionDuration = parseInt(document.getElementById('ttGenDuration')?.value) || 60;
        const breakDuration = parseInt(document.getElementById('ttGenBreak')?.value) || 15;

        // Collect custom subjects or use standard curriculum defaults
        const subjects = [
          { name: 'Data Communication', priority: 'High', topics: 'Transmission Media, Shannon/Nyquist, CRC, ARQ' },
          { name: 'Computer Networks', priority: 'High', topics: 'OSI 7 Layers, IP Addressing, Routing Protocols' },
          { name: 'Operating Systems', priority: 'Medium', topics: 'Process Scheduling, Deadlocks, Memory Management' },
          { name: 'Data Comm Lab', priority: 'High', topics: 'Packet Sniffing, Socket Programming & Lab Experiments' },
          { name: 'General Problem Solving', priority: 'Low', topics: 'Revision, Practice Tests & Flashcards' }
        ];

        this.generateAITimetable({
          subjects,
          dailyHours,
          startTime,
          sessionDuration,
          breakDuration
        });
      });
    }

    // Add Session Modal Form
    const addSessionForm = document.getElementById('addSessionForm');
    if (addSessionForm) {
      addSessionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('sessSubject')?.value;
        const topic = document.getElementById('sessTopic')?.value;
        const day = document.getElementById('sessDay')?.value;
        const startTime = document.getElementById('sessStartTime')?.value;
        const endTime = document.getElementById('sessEndTime')?.value;
        const priority = document.getElementById('sessPriority')?.value;

        if (!subject || !startTime || !endTime) {
          App.showToast('Please provide subject name and time range.', 'warning');
          return;
        }

        this.addCustomSession({ subject, topic, day, startTime, endTime, priority });
        App.closeModal('addSessionModal');
      });
    }

    // Export timetable to printable window
    const exportBtn = document.getElementById('btnExportTimetable');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }
};
