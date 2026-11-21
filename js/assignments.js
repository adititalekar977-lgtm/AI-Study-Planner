/**
 * AI STUDY PLANNER - ASSIGNMENTS MODULE
 * Full CRUD operations, deadline tracking, priority scoring, search & filtering.
 */

const Assignments = {
  currentFilter: 'all', // 'all', 'pending', 'in-progress', 'completed', 'overdue'
  searchQuery: '',

  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const assignments = Storage.get(STORAGE_KEYS.ASSIGNMENTS, []);
    this.renderStats(assignments);
    this.renderList(assignments);
  },

  renderStats(assignments) {
    const now = new Date();
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const pending = assignments.filter(a => a.status === 'pending' || a.status === 'in-progress').length;
    const overdue = assignments.filter(a => a.status !== 'completed' && new Date(a.deadline) < now).length;

    const countTotal = document.getElementById('asgCountTotal');
    const countPending = document.getElementById('asgCountPending');
    const countCompleted = document.getElementById('asgCountCompleted');
    const countOverdue = document.getElementById('asgCountOverdue');
    const navBadge = document.getElementById('navAsgBadge');

    if (countTotal) countTotal.textContent = total;
    if (countPending) countPending.textContent = pending;
    if (countCompleted) countCompleted.textContent = completed;
    if (countOverdue) countOverdue.textContent = overdue;
    if (navBadge) navBadge.textContent = pending;
  },

  renderList(assignments) {
    const grid = document.getElementById('assignmentsGrid');
    if (!grid) return;

    const now = new Date();

    // Filter assignments
    let filtered = assignments.filter(a => {
      const isOverdue = a.status !== 'completed' && new Date(a.deadline) < now;

      // Filter state
      if (this.currentFilter === 'pending' && a.status !== 'pending') return false;
      if (this.currentFilter === 'in-progress' && a.status !== 'in-progress') return false;
      if (this.currentFilter === 'completed' && a.status !== 'completed') return false;
      if (this.currentFilter === 'overdue' && !isOverdue) return false;

      // Search match
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesSub = a.subject.toLowerCase().includes(query);
        const matchesDesc = (a.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesSub && !matchesDesc) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <p style="font-size: 1.1rem; color: var(--text-muted);">No assignments match the selected filter.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="App.openModal('addAssignmentModal')">
            + Add New Assignment
          </button>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(a => {
      const deadline = new Date(a.deadline);
      const isOverdue = a.status !== 'completed' && deadline < now;
      const formattedDate = deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const formattedTime = deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      let cardClass = a.status;
      if (isOverdue) cardClass = 'overdue';

      return `
        <div class="assignment-card ${cardClass}">
          <div>
            <div class="assignment-header">
              <span class="badge ${a.priority === 'High' ? 'badge-danger' : a.priority === 'Medium' ? 'badge-warning' : 'badge-primary'}">
                ${a.priority} Priority
              </span>
              <span class="badge ${a.status === 'completed' ? 'badge-success' : isOverdue ? 'badge-danger' : 'badge-info'}">
                ${isOverdue ? '⚠️ Overdue' : a.status.replace('-', ' ')}
              </span>
            </div>
            <h3 class="assignment-title">${escapeHTML(a.title)}</h3>
            <div style="font-size:0.8rem; font-weight:600; color:var(--primary); margin-bottom:0.5rem;">
              📚 ${escapeHTML(a.subject)}
            </div>
            <p class="assignment-desc">${escapeHTML(a.description || 'No detailed instructions provided.')}</p>
          </div>

          <div>
            <div class="assignment-meta-bar">
              <span>📅 ${formattedDate} (${formattedTime})</span>
              <div style="display:flex; gap:0.4rem;">
                <button class="btn btn-sm ${a.status === 'completed' ? 'btn-secondary' : 'btn-success'}"
                        onclick="Assignments.toggleStatus('${a.id}')" title="Toggle status">
                  ${a.status === 'completed' ? '↺ Reopen' : '✓ Done'}
                </button>
                <button class="btn btn-sm btn-secondary" onclick="Assignments.openEditModal('${a.id}')" title="Edit">
                  ✏️
                </button>
                <button class="btn btn-sm btn-secondary" onclick="Assignments.deleteAssignment('${a.id}')" title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  addAssignment(data) {
    const assignments = Storage.get(STORAGE_KEYS.ASSIGNMENTS, []);
    const newAssignment = {
      id: 'asg_' + Date.now(),
      title: data.title.trim(),
      subject: data.subject.trim(),
      description: data.description.trim(),
      deadline: data.deadline,
      priority: data.priority || 'Medium',
      status: 'pending'
    };

    assignments.push(newAssignment);
    Storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
    Rewards.addXP(20, `Created assignment: ${newAssignment.title}`);
    App.showToast(`Assignment "${newAssignment.title}" created! (+20 XP)`, 'success');
    this.render();
    Dashboard.render();
  },

  updateAssignment(id, data) {
    const assignments = Storage.get(STORAGE_KEYS.ASSIGNMENTS, []);
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) return;

    assignments[index] = {
      ...assignments[index],
      title: data.title.trim(),
      subject: data.subject.trim(),
      description: data.description.trim(),
      deadline: data.deadline,
      priority: data.priority,
      status: data.status || assignments[index].status
    };

    Storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
    App.showToast('Assignment updated successfully.', 'success');
    this.render();
    Dashboard.render();
  },

  toggleStatus(id) {
    const assignments = Storage.get(STORAGE_KEYS.ASSIGNMENTS, []);
    const item = assignments.find(a => a.id === id);
    if (!item) return;

    if (item.status === 'completed') {
      item.status = 'pending';
      App.showToast(`Marked "${item.title}" as pending.`, 'info');
    } else {
      item.status = 'completed';
      if (!item.xpAwarded) {
        item.xpAwarded = true;
        Rewards.addXP(30, `Completed assignment: ${item.title}`);
        App.showToast(`Congratulations on completing "${item.title}"! (+30 XP)`, 'success');
      } else {
        App.showToast(`Marked "${item.title}" as completed.`, 'success');
      }
    }

    Storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
    this.render();
    Dashboard.render();
    Rewards.checkBadges();
  },

  deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    let assignments = Storage.get(STORAGE_KEYS.ASSIGNMENTS, []);
    assignments = assignments.filter(a => a.id !== id);
    Storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
    App.showToast('Assignment deleted.', 'info');
    this.render();
    Dashboard.render();
  },

  openEditModal(id) {
    const assignments = Storage.get(STORAGE_KEYS.ASSIGNMENTS, []);
    const item = assignments.find(a => a.id === id);
    if (!item) return;

    const editId = document.getElementById('asgEditId');
    const editTitle = document.getElementById('asgEditTitle');
    const editSub = document.getElementById('asgEditSubject');
    const editDesc = document.getElementById('asgEditDesc');
    const editDead = document.getElementById('asgEditDeadline');
    const editPri = document.getElementById('asgEditPriority');
    const editStat = document.getElementById('asgEditStatus');

    if (editId) editId.value = item.id;
    if (editTitle) editTitle.value = item.title;
    if (editSub) editSub.value = item.subject;
    if (editDesc) editDesc.value = item.description || '';
    if (editDead) editDead.value = item.deadline ? item.deadline.slice(0, 16) : '';
    if (editPri) editPri.value = item.priority;
    if (editStat) editStat.value = item.status;

    App.openModal('editAssignmentModal');
  },

  bindEvents() {
    // Add Assignment Form Submit
    const addForm = document.getElementById('addAssignmentForm');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('asgTitle')?.value;
        const subject = document.getElementById('asgSubject')?.value;
        const description = document.getElementById('asgDesc')?.value;
        const deadline = document.getElementById('asgDeadline')?.value;
        const priority = document.getElementById('asgPriority')?.value;

        if (!title || !subject || !deadline) {
          App.showToast('Please fill out all required fields.', 'warning');
          return;
        }

        this.addAssignment({ title, subject, description, deadline, priority });
        addForm.reset();
        App.closeModal('addAssignmentModal');
      });
    }

    // Edit Assignment Form Submit
    const editForm = document.getElementById('editAssignmentForm');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('asgEditId')?.value;
        const title = document.getElementById('asgEditTitle')?.value;
        const subject = document.getElementById('asgEditSubject')?.value;
        const description = document.getElementById('asgEditDesc')?.value;
        const deadline = document.getElementById('asgEditDeadline')?.value;
        const priority = document.getElementById('asgEditPriority')?.value;
        const status = document.getElementById('asgEditStatus')?.value;

        this.updateAssignment(id, { title, subject, description, deadline, priority, status });
        App.closeModal('editAssignmentModal');
      });
    }

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.asg-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-filter') || 'all';
        this.render();
      });
    });

    // Search Input
    const searchInput = document.getElementById('asgSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }
  }
};
