/**
 * AI STUDY PLANNER - DIGITAL NOTES MODULE
 * Clean markdown-friendly notebook with categories, pinning, search & auto-save.
 */

const Notes = {
  activeCategory: 'All',
  searchQuery: '',

  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    this.renderCategories(notes);
    this.renderNotesList(notes);
  },

  renderCategories(notes) {
    const container = document.getElementById('notesCategoryList');
    if (!container) return;

    // Collect distinct subjects
    const subjects = ['All'];
    notes.forEach(n => {
      if (n.subject && !subjects.includes(n.subject)) {
        subjects.push(n.subject);
      }
    });

    container.innerHTML = subjects.map(sub => {
      const count = sub === 'All' ? notes.length : notes.filter(n => n.subject === sub).length;
      const isActive = sub === this.activeCategory;
      return `
        <li class="category-nav-item ${isActive ? 'active' : ''}" onclick="Notes.setCategory('${sub}')">
          <span>${sub}</span>
          <span class="badge ${isActive ? 'badge-primary' : ''}">${count}</span>
        </li>
      `;
    }).join('');
  },

  renderNotesList(notes) {
    const grid = document.getElementById('notesMasonryGrid');
    if (!grid) return;

    let filtered = notes.filter(n => {
      if (this.activeCategory !== 'All' && n.subject !== this.activeCategory) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchesTitle = (n.title || '').toLowerCase().includes(q);
        const matchesContent = (n.content || '').toLowerCase().includes(q);
        const matchesSub = (n.subject || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesSub) return false;
      }
      return true;
    });

    // Pinned notes come first
    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <p style="font-size: 1.1rem; color: var(--text-muted);">No notes found in this category.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="App.openModal('addNoteModal')">
            + Create New Note
          </button>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(n => `
      <div class="note-card ${n.pinned ? 'pinned' : ''}">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span class="badge badge-primary">${escapeHTML(n.subject)}</span>
            <button class="btn btn-sm" style="background:transparent; border:none; padding:2px; font-size:1.1rem;"
                    onclick="Notes.togglePin('${n.id}')" title="${n.pinned ? 'Unpin note' : 'Pin note to top'}">
              ${n.pinned ? '📌' : '📍'}
            </button>
          </div>
          <h3 class="note-card-title">${escapeHTML(n.title)}</h3>
          <div class="note-card-snippet">${escapeHTML(n.content)}</div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); margin-top:0.75rem; padding-top:0.75rem;">
          <span style="font-size:0.72rem; color:var(--text-muted);">
            ${n.updatedAt ? new Date(n.updatedAt).toLocaleDateString() : 'Recent'}
          </span>
          <div style="display:flex; gap:0.35rem;">
            <button class="btn btn-sm btn-secondary" onclick="Notes.downloadNote('${n.id}')" title="Download Text">
              💾
            </button>
            <button class="btn btn-sm btn-secondary" onclick="Notes.openEditModal('${n.id}')" title="Edit">
              ✏️
            </button>
            <button class="btn btn-sm btn-secondary" onclick="Notes.deleteNote('${n.id}')" title="Delete">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  setCategory(category) {
    this.activeCategory = category;
    this.render();
  },

  addNote(data) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const newNote = {
      id: 'note_' + Date.now(),
      title: data.title.trim(),
      subject: data.subject.trim(),
      content: data.content.trim(),
      pinned: false,
      updatedAt: new Date().toISOString()
    };

    notes.unshift(newNote);
    Storage.set(STORAGE_KEYS.NOTES, notes);
    Rewards.addXP(15, `Created note: ${newNote.title}`);
    App.showToast(`Note "${newNote.title}" saved! (+15 XP)`, 'success');
    this.render();
    Rewards.checkBadges();
  },

  updateNote(id, data) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return;

    notes[index] = {
      ...notes[index],
      title: data.title.trim(),
      subject: data.subject.trim(),
      content: data.content.trim(),
      updatedAt: new Date().toISOString()
    };

    Storage.set(STORAGE_KEYS.NOTES, notes);
    App.showToast('Note updated successfully.', 'success');
    this.render();
  },

  togglePin(id) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const note = notes.find(n => n.id === id);
    if (!note) return;

    note.pinned = !note.pinned;
    Storage.set(STORAGE_KEYS.NOTES, notes);
    this.render();
  },

  deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    let notes = Storage.get(STORAGE_KEYS.NOTES, []);
    notes = notes.filter(n => n.id !== id);
    Storage.set(STORAGE_KEYS.NOTES, notes);
    App.showToast('Note deleted.', 'info');
    this.render();
  },

  downloadNote(id) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const fileContent = `TITLE: ${note.title}\nSUBJECT: ${note.subject}\nDATE: ${new Date(note.updatedAt).toLocaleString()}\n\n${note.content}`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast('Note downloaded as text file.', 'success');
  },

  openEditModal(id) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const editId = document.getElementById('noteEditId');
    const editTitle = document.getElementById('noteEditTitle');
    const editSub = document.getElementById('noteEditSubject');
    const editContent = document.getElementById('noteEditContent');

    if (editId) editId.value = note.id;
    if (editTitle) editTitle.value = note.title;
    if (editSub) editSub.value = note.subject;
    if (editContent) editContent.value = note.content;

    App.openModal('editNoteModal');
  },

  bindEvents() {
    // Add Note Form Submit
    const addForm = document.getElementById('addNoteForm');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('noteTitle')?.value;
        const subject = document.getElementById('noteSubject')?.value;
        const content = document.getElementById('noteContent')?.value;

        if (!title || !subject || !content) {
          App.showToast('Please fill out note title, subject, and content.', 'warning');
          return;
        }

        this.addNote({ title, subject, content });
        addForm.reset();
        App.closeModal('addNoteModal');
      });
    }

    // Edit Note Form Submit
    const editForm = document.getElementById('editNoteForm');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('noteEditId')?.value;
        const title = document.getElementById('noteEditTitle')?.value;
        const subject = document.getElementById('noteEditSubject')?.value;
        const content = document.getElementById('noteEditContent')?.value;

        this.updateNote(id, { title, subject, content });
        App.closeModal('editNoteModal');
      });
    }

    // Notes Search
    const searchInput = document.getElementById('notesSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderNotesList(Storage.get(STORAGE_KEYS.NOTES, []));
      });
    }
  }
};
