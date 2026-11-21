/**
 * AI STUDY PLANNER - EXAMS MODULE
 * Live countdown to examinations, syllabus breakdown, urgency flags, and full CRUD.
 */

const Exams = {
  countdownTimer: null,

  init() {
    this.render();
    this.bindEvents();
    this.startCountdownLoop();
  },

  startCountdownLoop() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      this.updateLiveCountdowns();
    }, 1000);
  },

  render() {
    const exams = Storage.get(STORAGE_KEYS.EXAMS, []);
    const grid = document.getElementById('examsGrid');
    if (!grid) return;

    if (exams.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <p style="font-size: 1.1rem; color: var(--text-muted);">No upcoming examinations scheduled.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="App.openModal('addExamModal')">
            + Add Exam Schedule
          </button>
        </div>`;
      return;
    }

    // Sort by exam date
    const sorted = [...exams].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

    const now = new Date();
    grid.innerHTML = sorted.map(e => {
      const [h, m] = (e.examTime || '09:00').split(':').map(Number);
      const exDate = new Date(e.examDate);
      exDate.setHours(h || 0, m || 0, 0, 0);
      const isPast = exDate < now;

      return `
        <div class="exam-card ${isPast ? 'exam-concluded' : ''}" id="exam_card_${e.id}" style="${isPast ? 'opacity:0.75;' : ''}">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <div style="display:flex; gap:0.4rem; align-items:center;">
                <span class="badge ${e.priority === 'High' ? 'badge-danger' : 'badge-primary'}">${e.priority} Priority</span>
                ${isPast ? '<span class="badge badge-secondary">Concluded</span>' : ''}
              </div>
              <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">📍 ${escapeHTML(e.venue || 'Campus Hall')}</span>
            </div>
            <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:0.25rem;">${escapeHTML(e.paperName)}</h3>
            <div style="font-size:0.85rem; font-weight:600; color:var(--primary); margin-bottom:0.75rem;">
              📚 ${escapeHTML(e.subject)}
            </div>

            <!-- Countdown Digits -->
            <div class="countdown-digits-row" data-exam-date="${e.examDate}" data-exam-time="${e.examTime || '09:00'}">
              <div class="countdown-digit-box">
                <div class="countdown-num cd-days">--</div>
                <div class="countdown-unit">Days</div>
              </div>
              <div class="countdown-digit-box">
                <div class="countdown-num cd-hours">--</div>
                <div class="countdown-unit">Hours</div>
              </div>
              <div class="countdown-digit-box">
                <div class="countdown-num cd-mins">--</div>
                <div class="countdown-unit">Mins</div>
              </div>
            </div>

            <div style="background:var(--bg-subtle); border-radius:var(--radius-md); padding:0.75rem; margin-top:0.75rem; font-size:0.8rem; color:var(--text-secondary);">
              <strong>Syllabus Scope:</strong> ${escapeHTML(e.topics || 'All syllabus units and lab exercises.')}
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.25rem; border-top:1px solid var(--border-light); padding-top:0.85rem;">
            <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">
              🗓️ ${e.examDate} (${e.examTime || '09:00'})
            </span>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-sm btn-secondary" onclick="Exams.openEditModal('${e.id}')" title="Edit">
                ✏️
              </button>
              <button class="btn btn-sm btn-secondary" onclick="Exams.deleteExam('${e.id}')" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.updateLiveCountdowns();
  },

  updateLiveCountdowns() {
    const rows = document.querySelectorAll('.countdown-digits-row');
    const now = new Date();

    rows.forEach(row => {
      const dateStr = row.getAttribute('data-exam-date');
      const timeStr = row.getAttribute('data-exam-time') || '09:00';
      if (!dateStr) return;

      const [hours, mins] = timeStr.split(':').map(Number);
      const target = new Date(dateStr);
      target.setHours(hours || 0, mins || 0, 0, 0);

      const diff = target - now;

      const daysEl = row.querySelector('.cd-days');
      const hoursEl = row.querySelector('.cd-hours');
      const minsEl = row.querySelector('.cd-mins');

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '0';
        if (hoursEl) hoursEl.textContent = '0';
        if (minsEl) minsEl.textContent = '0';
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const remHours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const remMins = Math.floor((diff / (1000 * 60)) % 60);

        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = remHours;
        if (minsEl) minsEl.textContent = remMins;
      }
    });
  },

  addExam(data) {
    const exams = Storage.get(STORAGE_KEYS.EXAMS, []);
    const newExam = {
      id: 'ex_' + Date.now(),
      subject: data.subject.trim(),
      paperName: data.paperName.trim(),
      examDate: data.examDate,
      examTime: data.examTime || '09:00',
      venue: data.venue || 'Campus Main Hall',
      priority: data.priority || 'High',
      topics: data.topics || 'Complete syllabus & practical experiments'
    };

    exams.push(newExam);
    Storage.set(STORAGE_KEYS.EXAMS, exams);
    Rewards.addXP(25, `Added exam: ${newExam.paperName}`);
    App.showToast(`Exam schedule "${newExam.paperName}" added!`, 'success');
    this.render();
    Dashboard.render();
  },

  updateExam(id, data) {
    const exams = Storage.get(STORAGE_KEYS.EXAMS, []);
    const index = exams.findIndex(e => e.id === id);
    if (index === -1) return;

    exams[index] = {
      ...exams[index],
      subject: data.subject.trim(),
      paperName: data.paperName.trim(),
      examDate: data.examDate,
      examTime: data.examTime,
      venue: data.venue,
      priority: data.priority,
      topics: data.topics
    };

    Storage.set(STORAGE_KEYS.EXAMS, exams);
    App.showToast('Exam schedule updated.', 'success');
    this.render();
    Dashboard.render();
  },

  deleteExam(id) {
    if (!confirm('Are you sure you want to delete this exam schedule?')) return;
    let exams = Storage.get(STORAGE_KEYS.EXAMS, []);
    exams = exams.filter(e => e.id !== id);
    Storage.set(STORAGE_KEYS.EXAMS, exams);
    App.showToast('Exam deleted.', 'info');
    this.render();
    Dashboard.render();
  },

  openEditModal(id) {
    const exams = Storage.get(STORAGE_KEYS.EXAMS, []);
    const exam = exams.find(e => e.id === id);
    if (!exam) return;

    const editId = document.getElementById('examEditId');
    const editSub = document.getElementById('examEditSubject');
    const editPaper = document.getElementById('examEditPaper');
    const editDate = document.getElementById('examEditDate');
    const editTime = document.getElementById('examEditTime');
    const editVenue = document.getElementById('examEditVenue');
    const editPri = document.getElementById('examEditPriority');
    const editTopics = document.getElementById('examEditTopics');

    if (editId) editId.value = exam.id;
    if (editSub) editSub.value = exam.subject;
    if (editPaper) editPaper.value = exam.paperName;
    if (editDate) editDate.value = exam.examDate;
    if (editTime) editTime.value = exam.examTime;
    if (editVenue) editVenue.value = exam.venue;
    if (editPri) editPri.value = exam.priority;
    if (editTopics) editTopics.value = exam.topics || '';

    App.openModal('editExamModal');
  },

  bindEvents() {
    // Add Exam Form
    const addForm = document.getElementById('addExamForm');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('examSubject')?.value;
        const paperName = document.getElementById('examPaper')?.value;
        const examDate = document.getElementById('examDate')?.value;
        const examTime = document.getElementById('examTime')?.value;
        const venue = document.getElementById('examVenue')?.value;
        const priority = document.getElementById('examPriority')?.value;
        const topics = document.getElementById('examTopics')?.value;

        if (!subject || !paperName || !examDate) {
          App.showToast('Please provide subject, exam name, and examination date.', 'warning');
          return;
        }

        this.addExam({ subject, paperName, examDate, examTime, venue, priority, topics });
        addForm.reset();
        App.closeModal('addExamModal');
      });
    }

    // Edit Exam Form
    const editForm = document.getElementById('editExamForm');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('examEditId')?.value;
        const subject = document.getElementById('examEditSubject')?.value;
        const paperName = document.getElementById('examEditPaper')?.value;
        const examDate = document.getElementById('examEditDate')?.value;
        const examTime = document.getElementById('examEditTime')?.value;
        const venue = document.getElementById('examEditVenue')?.value;
        const priority = document.getElementById('examEditPriority')?.value;
        const topics = document.getElementById('examEditTopics')?.value;

        this.updateExam(id, { subject, paperName, examDate, examTime, venue, priority, topics });
        App.closeModal('editExamModal');
      });
    }
  }
};
