/**
 * AI NOTES ORGANIZER & SUMMARIZER MODULE
 * Smart Notebook with Folders, Tags, Favourites, Advanced Search & Sorting,
 * and 100% Offline AI-Style NLP Text Summarization Engine.
 */

const Notes = {
  activeTab: 'organizer', // 'organizer' | 'summarizer'
  activeCategory: 'All',
  activeTag: 'All',
  showFavoritesOnly: false,
  searchQuery: '',
  sortBy: 'newest', // 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'words' | 'favorites'
  summarizerMode: 'short', // 'short' | 'medium' | 'detailed' | 'bullets' | 'keypoints' | 'revision'
  lastSummaryResult: null,

  // Common English stopwords for extractive NLP frequency weighting
  STOPWORDS: new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
    'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have',
    'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself',
    'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into',
    'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
    'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
    'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
    'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
    'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
    'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
    'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
    'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
    'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
    'yourselves', 'also', 'therefore', 'thus', 'etc', 'e.g', 'i.e', 'via', 'using'
  ]),

  init() {
    this.render();
    this.bindEvents();
    this.initSummarizerEvents();
  },

  switchTab(tab) {
    this.activeTab = tab;
    const tabOrganizer = document.getElementById('notesTabOrganizer');
    const tabSummarizer = document.getElementById('notesTabSummarizer');
    const viewOrganizer = document.getElementById('notesViewOrganizer');
    const viewSummarizer = document.getElementById('notesViewSummarizer');

    if (tabOrganizer && tabSummarizer && viewOrganizer && viewSummarizer) {
      if (tab === 'organizer') {
        tabOrganizer.classList.add('active');
        tabSummarizer.classList.remove('active');
        viewOrganizer.style.display = 'block';
        viewSummarizer.style.display = 'none';
        this.render();
      } else {
        tabOrganizer.classList.remove('active');
        tabSummarizer.classList.add('active');
        viewOrganizer.style.display = 'none';
        viewSummarizer.style.display = 'block';
        this.updateSummarizerLiveMetrics();
      }
    }
  },

  render() {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    this.renderCategories(notes);
    this.renderTags(notes);
    this.renderNotesList(notes);
    this.updateStatsCounters(notes);
  },

  updateStatsCounters(notes) {
    const totalCountEl = document.getElementById('notesTotalCountBadge');
    if (totalCountEl) totalCountEl.textContent = `${notes.length} Notes`;

    const favCountEl = document.getElementById('notesFavCountBadge');
    if (favCountEl) {
      const favs = notes.filter(n => n.favorite).length;
      favCountEl.textContent = favs;
    }
  },

  renderCategories(notes) {
    const container = document.getElementById('notesCategoryList');
    if (!container) return;

    // Collect distinct subjects / folders
    const subjects = ['All'];
    notes.forEach(n => {
      const sub = n.subject || n.folder;
      if (sub && !subjects.includes(sub)) {
        subjects.push(sub);
      }
    });

    // Preset standard college subject categories if none exist yet
    ['Data Communication', 'Computer Networks', 'Operating Systems', 'AI Summaries'].forEach(defSub => {
      if (!subjects.includes(defSub)) subjects.push(defSub);
    });

    container.innerHTML = subjects.map(sub => {
      const count = sub === 'All'
        ? notes.length
        : notes.filter(n => (n.subject === sub || n.folder === sub)).length;
      const isActive = sub === this.activeCategory && !this.showFavoritesOnly;
      return `
        <li class="category-nav-item ${isActive ? 'active' : ''}" onclick="Notes.setCategory('${escapeHTML(sub)}')">
          <span>📁 ${escapeHTML(sub)}</span>
          <span class="badge ${isActive ? 'badge-primary' : ''}">${count}</span>
        </li>
      `;
    }).join('');
  },

  renderTags(notes) {
    const container = document.getElementById('notesTagFilterBar');
    if (!container) return;

    const tagCounts = {};
    notes.forEach(n => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach(t => {
          const clean = t.trim().replace(/^#/, '');
          if (clean) tagCounts[clean] = (tagCounts[clean] || 0) + 1;
        });
      }
    });

    const tags = Object.keys(tagCounts);
    if (tags.length === 0) {
      container.innerHTML = `
        <div style="font-size:0.8rem; color:var(--text-muted); padding:0.25rem 0;">
          Add tags like <code>#formula</code> or <code>#revision</code> when creating notes.
        </div>`;
      return;
    }

    let html = `
      <button class="tag-filter-chip ${this.activeTag === 'All' ? 'active' : ''}" onclick="Notes.setTag('All')">
        All Tags
      </button>
    `;

    tags.forEach(t => {
      const isActive = this.activeTag.toLowerCase() === t.toLowerCase();
      html += `
        <button class="tag-filter-chip ${isActive ? 'active' : ''}" onclick="Notes.setTag('${escapeHTML(t)}')">
          #${escapeHTML(t)} <span class="tag-count">${tagCounts[t]}</span>
        </button>
      `;
    });

    container.innerHTML = html;
  },

  renderNotesList(notes) {
    const grid = document.getElementById('notesMasonryGrid');
    if (!grid) return;

    let filtered = notes.filter(n => {
      const sub = n.subject || n.folder || 'General';

      // Favorite filter
      if (this.showFavoritesOnly && !n.favorite) return false;

      // Category filter
      if (!this.showFavoritesOnly && this.activeCategory !== 'All' && sub !== this.activeCategory) return false;

      // Tag filter
      if (this.activeTag !== 'All') {
        const noteTags = (n.tags || []).map(t => t.toLowerCase().replace(/^#/, ''));
        if (!noteTags.includes(this.activeTag.toLowerCase())) return false;
      }

      // Search Query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchesTitle = (n.title || '').toLowerCase().includes(q);
        const matchesContent = (n.content || '').toLowerCase().includes(q);
        const matchesSub = sub.toLowerCase().includes(q);
        const matchesTags = (n.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesSub && !matchesTags) return false;
      }
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      // Pinned always bubble to top unless sorting specifically
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;

      if (this.sortBy === 'newest') {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      } else if (this.sortBy === 'oldest') {
        return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
      } else if (this.sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (this.sortBy === 'title-desc') {
        return (b.title || '').localeCompare(a.title || '');
      } else if (this.sortBy === 'words') {
        const wordsA = (a.content || '').split(/\s+/).filter(Boolean).length;
        const wordsB = (b.content || '').split(/\s+/).filter(Boolean).length;
        return wordsB - wordsA;
      } else if (this.sortBy === 'favorites') {
        return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
      }
      return 0;
    });

    const resultsCountEl = document.getElementById('notesFilteredCount');
    if (resultsCountEl) {
      resultsCountEl.textContent = `Showing ${filtered.length} of ${notes.length} note${notes.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">📓</div>
          <h3 style="margin-bottom:0.4rem; color:var(--text-primary);">No notes found</h3>
          <p style="font-size: 0.92rem; color: var(--text-muted); max-width:420px; margin:0 auto 1.25rem;">
            ${this.searchQuery ? `No notes matched your search "${escapeHTML(this.searchQuery)}".` : 'No notes match the current filters or folder.'}
          </p>
          <div style="display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="App.openModal('addNoteModal')">
              + Create Note
            </button>
            <button class="btn btn-secondary btn-sm" onclick="Notes.resetFilters()">
              Clear Filters
            </button>
          </div>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(n => {
      const words = (n.content || '').trim().split(/\s+/).filter(Boolean).length;
      const readTime = Math.max(1, Math.ceil(words / 200));
      const sub = n.subject || n.folder || 'General';
      const tags = Array.isArray(n.tags) ? n.tags : [];

      return `
        <div class="note-card ${n.pinned ? 'pinned' : ''}">
          <div>
            <!-- Top Card Actions & Badges -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem;">
              <span class="badge badge-primary">📁 ${escapeHTML(sub)}</span>
              <div style="display:flex; align-items:center; gap:0.25rem;">
                <button class="icon-toggle-btn ${n.favorite ? 'active-star' : ''}" 
                        onclick="Notes.toggleFavorite('${n.id}')" title="${n.favorite ? 'Remove from favorites' : 'Mark as favorite'}">
                  ${n.favorite ? '⭐' : '☆'}
                </button>
                <button class="icon-toggle-btn ${n.pinned ? 'active-pin' : ''}" 
                        onclick="Notes.togglePin('${n.id}')" title="${n.pinned ? 'Unpin note' : 'Pin note to top'}">
                  ${n.pinned ? '📌' : '📍'}
                </button>
              </div>
            </div>

            <!-- Title & Snippet -->
            <h3 class="note-card-title">${escapeHTML(n.title)}</h3>
            <div class="note-card-snippet">${escapeHTML(n.content)}</div>

            <!-- Tags Chips -->
            ${tags.length > 0 ? `
              <div class="note-card-tags">
                ${tags.map(t => `<span class="note-tag-chip" onclick="Notes.setTag('${escapeHTML(t.replace(/^#/, ''))}')">#${escapeHTML(t.replace(/^#/, ''))}</span>`).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Card Footer Metrics & Actions -->
          <div style="border-top:1px solid var(--border-light); margin-top:0.75rem; padding-top:0.65rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; font-size:0.72rem; color:var(--text-muted);">
              <span>📊 ${words} words • ${readTime} min read</span>
              <span>${n.updatedAt ? new Date(n.updatedAt).toLocaleDateString() : 'Recent'}</span>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.35rem;">
              <button class="btn btn-sm btn-outline-primary" style="font-size:0.78rem; padding:0.25rem 0.6rem;" 
                      onclick="Notes.summarizeNote('${n.id}')" title="Generate AI Summary & Revision Notes">
                ⚡ Summarize
              </button>
              <div style="display:flex; gap:0.3rem;">
                <button class="btn btn-sm btn-secondary" onclick="Notes.downloadNote('${n.id}', 'txt')" title="Download as Text">
                  💾
                </button>
                <button class="btn btn-sm btn-secondary" onclick="Notes.downloadNote('${n.id}', 'md')" title="Download as Markdown">
                  📄
                </button>
                <button class="btn btn-sm btn-secondary" onclick="Notes.openEditModal('${n.id}')" title="Edit Note">
                  ✏️
                </button>
                <button class="btn btn-sm btn-secondary" onclick="Notes.deleteNote('${n.id}')" title="Delete Note">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  setCategory(category) {
    this.showFavoritesOnly = false;
    this.activeCategory = category;
    this.render();
  },

  setTag(tag) {
    this.activeTag = tag;
    this.render();
  },

  toggleFavoritesFilter() {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    const favBtn = document.getElementById('btnNotesToggleFav');
    if (favBtn) {
      favBtn.classList.toggle('active', this.showFavoritesOnly);
    }
    this.render();
  },

  setSortBy(sortVal) {
    this.sortBy = sortVal;
    this.renderNotesList(Storage.get(STORAGE_KEYS.NOTES, []));
  },

  resetFilters() {
    this.activeCategory = 'All';
    this.activeTag = 'All';
    this.showFavoritesOnly = false;
    this.searchQuery = '';
    const searchInput = document.getElementById('notesSearchInput');
    if (searchInput) searchInput.value = '';
    const favBtn = document.getElementById('btnNotesToggleFav');
    if (favBtn) favBtn.classList.remove('active');
    this.render();
  },

  addNote(data) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const cleanTags = (data.tags || '')
      .split(/[,\s]+/)
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const words = data.content.trim().split(/\s+/).filter(Boolean).length;
    const newNote = {
      id: 'note_' + Date.now(),
      title: data.title.trim(),
      subject: (data.subject || data.folder || 'General').trim(),
      folder: (data.folder || data.subject || 'General').trim(),
      content: data.content.trim(),
      pinned: false,
      favorite: !!data.favorite,
      tags: cleanTags,
      wordCount: words,
      readingTimeMin: Math.max(1, Math.ceil(words / 200)),
      updatedAt: new Date().toISOString()
    };

    notes.unshift(newNote);
    Storage.set(STORAGE_KEYS.NOTES, notes);
    Rewards.addXP(20, `Created note: ${newNote.title}`);
    App.showToast(`Note "${newNote.title}" saved successfully! (+20 XP)`, 'success');
    this.render();
    Rewards.checkBadges();
  },

  updateNote(id, data) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return;

    const cleanTags = (data.tags || '')
      .split(/[,\s]+/)
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const words = data.content.trim().split(/\s+/).filter(Boolean).length;
    notes[index] = {
      ...notes[index],
      title: data.title.trim(),
      subject: (data.subject || data.folder || 'General').trim(),
      folder: (data.folder || data.subject || 'General').trim(),
      content: data.content.trim(),
      favorite: data.favorite !== undefined ? !!data.favorite : !!notes[index].favorite,
      tags: cleanTags,
      wordCount: words,
      readingTimeMin: Math.max(1, Math.ceil(words / 200)),
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
    App.showToast(note.pinned ? 'Note pinned to top 📌' : 'Note unpinned', 'info');
    this.render();
  },

  toggleFavorite(id) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const note = notes.find(n => n.id === id);
    if (!note) return;

    note.favorite = !note.favorite;
    Storage.set(STORAGE_KEYS.NOTES, notes);
    App.showToast(note.favorite ? 'Added to Favourites ⭐' : 'Removed from Favourites', 'info');
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

  downloadNote(id, format = 'txt') {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const tagsStr = (note.tags || []).map(t => `#${t}`).join(' ');
    let fileContent = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'md') {
      ext = 'md';
      mimeType = 'text/markdown';
      fileContent = `# ${note.title}\n\n**Folder:** ${note.subject || note.folder || 'General'}  \n**Tags:** ${tagsStr || 'None'}  \n**Date:** ${new Date(note.updatedAt).toLocaleString()}  \n\n---\n\n${note.content}\n`;
    } else {
      fileContent = `TITLE: ${note.title}\nFOLDER: ${note.subject || note.folder || 'General'}\nTAGS: ${tagsStr || 'None'}\nDATE: ${new Date(note.updatedAt).toLocaleString()}\n\n========================================\n\n${note.content}`;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast(`Note downloaded as .${ext} file.`, 'success');
  },

  openEditModal(id) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const editId = document.getElementById('noteEditId');
    const editTitle = document.getElementById('noteEditTitle');
    const editSub = document.getElementById('noteEditSubject');
    const editTags = document.getElementById('noteEditTags');
    const editFav = document.getElementById('noteEditFavorite');
    const editContent = document.getElementById('noteEditContent');

    if (editId) editId.value = note.id;
    if (editTitle) editTitle.value = note.title;
    if (editSub) editSub.value = note.subject || note.folder || '';
    if (editTags) editTags.value = (note.tags || []).join(', ');
    if (editFav) editFav.checked = !!note.favorite;
    if (editContent) editContent.value = note.content;

    App.openModal('editNoteModal');
  },

  summarizeNote(id) {
    const notes = Storage.get(STORAGE_KEYS.NOTES, []);
    const note = notes.find(n => n.id === id);
    if (!note) return;

    this.switchTab('summarizer');

    const inputArea = document.getElementById('summarizerInputText');
    const titleHint = document.getElementById('summarizerSourceHint');
    if (inputArea) {
      inputArea.value = note.content;
      this.updateSummarizerLiveMetrics();
    }
    if (titleHint) {
      titleHint.innerHTML = `Loaded from Note: <strong>${escapeHTML(note.title)}</strong> (${escapeHTML(note.subject || note.folder || 'General')})`;
      titleHint.style.display = 'block';
    }

    // Auto-run summary
    this.runSummarizer();
    App.showToast(`Loaded note "${note.title}" into AI Summarizer.`, 'info');
  },

  // =========================================================================
  // OFFLINE AI-STYLE NLP SUMMARIZATION ENGINE
  // Extractive sentence scoring, word frequencies, key point extractor,
  // and revision study sheet generator. 100% offline & client-side!
  // =========================================================================

  calculateTextMetrics(text) {
    if (!text || !text.trim()) {
      return {
        words: 0,
        charsWithSpaces: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMin: 0,
        speakingTimeMin: 0
      };
    }

    const clean = text.trim();
    const wordsArr = clean.split(/\s+/).filter(Boolean);
    const words = wordsArr.length;
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const paragraphs = clean.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1;

    // Sentence splitting
    const sentencesArr = clean
      .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const sentences = sentencesArr.length || 1;

    // Standard reading speed ~ 200 words/min; speaking ~ 130 words/min
    const readingTimeMin = (words / 200).toFixed(1);
    const speakingTimeMin = (words / 130).toFixed(1);

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTimeMin: parseFloat(readingTimeMin),
      speakingTimeMin: parseFloat(speakingTimeMin)
    };
  },

  tokenizeSentences(text) {
    if (!text) return [];
    // Protect abbreviations and decimals before splitting
    let sanitized = text
      .replace(/([0-9])\.([0-9])/g, '$1_DOT_$2')
      .replace(/(e\.g\.|i\.e\.|etc\.|vs\.|fig\.|dr\.|prof\.)/gi, match => match.replace(/\./g, '_DOT_'));

    const raw = sanitized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    return raw
      .map(s => s.replace(/_DOT_/g, '.').trim())
      .filter(s => s.length > 5);
  },

  tokenizeWords(text) {
    return (text.toLowerCase().match(/[a-z0-9_#$%-]+/g) || [])
      .filter(w => w.length > 1 && !this.STOPWORDS.has(w));
  },

  scoreSentences(sentences) {
    if (!sentences || sentences.length === 0) return [];

    // 1. Build word frequency map
    const wordFreq = {};
    let maxFreq = 1;

    sentences.forEach(sent => {
      const words = this.tokenizeWords(sent);
      words.forEach(w => {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
        if (wordFreq[w] > maxFreq) maxFreq = wordFreq[w];
      });
    });

    // Normalize frequencies
    const wordScores = {};
    Object.keys(wordFreq).forEach(w => {
      wordScores[w] = wordFreq[w] / maxFreq;
    });

    // Cue phrases that signal important definitions, formulas, or summaries
    const cueRegex = /(important|in summary|conclude|therefore|defined as|formula|equation|key point|essential|principle|results show|specifically|crucial|primary|fundamental|notably|bandwidth|protocol|capacity|transmission)/i;

    // 2. Score each sentence
    const scored = sentences.map((sent, index) => {
      const words = this.tokenizeWords(sent);
      let rawScore = 0;

      words.forEach(w => {
        rawScore += wordScores[w] || 0;
      });

      // Normalize by word count to avoid bias toward giant run-on sentences
      const normalizedScore = words.length > 0 ? (rawScore / Math.sqrt(words.length)) : 0;

      // Position boost: opening and closing sentences of documents often carry thesis
      let positionMultiplier = 1.0;
      if (index === 0) positionMultiplier = 1.4;
      else if (index === 1) positionMultiplier = 1.2;
      else if (index === sentences.length - 1) positionMultiplier = 1.25;

      // Cue phrase bonus
      let cueMultiplier = cueRegex.test(sent) ? 1.35 : 1.0;

      // Formula / Math indicator bonus (=, *, +, /, ^, %, Hz, bps)
      let formulaMultiplier = /[=+\-*/^%]|(bps|hz|db|snr|crc)/i.test(sent) ? 1.25 : 1.0;

      const finalScore = normalizedScore * positionMultiplier * cueMultiplier * formulaMultiplier;

      return {
        sentence: sent,
        index,
        score: finalScore,
        hasFormula: /[=+\-*/^%]|(bps|hz|db|snr|crc)/i.test(sent),
        hasDefinition: /(defined as|refers to|means that|is the process of|consists of)/i.test(sent)
      };
    });

    return scored;
  },

  generateSummary(text, mode = 'short') {
    if (!text || !text.trim()) {
      return {
        summaryText: '',
        keyPoints: [],
        revisionNotes: '',
        originalMetrics: this.calculateTextMetrics(''),
        summaryMetrics: this.calculateTextMetrics(''),
        compressionPct: 0
      };
    }

    const originalMetrics = this.calculateTextMetrics(text);
    const sentences = this.tokenizeSentences(text);

    if (sentences.length <= 2) {
      const cleanSummary = text.trim();
      const sumMetrics = this.calculateTextMetrics(cleanSummary);
      return {
        summaryText: cleanSummary,
        keyPoints: sentences,
        revisionNotes: cleanSummary,
        originalMetrics,
        summaryMetrics: sumMetrics,
        compressionPct: 0
      };
    }

    const scored = this.scoreSentences(sentences);
    // Sort by score descending to pick top candidates
    const sortedByScore = [...scored].sort((a, b) => b.score - a.score);

    let pickCount = 2;
    if (mode === 'short') {
      pickCount = Math.max(2, Math.min(4, Math.ceil(sentences.length * 0.25)));
    } else if (mode === 'medium') {
      pickCount = Math.max(3, Math.min(7, Math.ceil(sentences.length * 0.45)));
    } else if (mode === 'detailed') {
      pickCount = Math.max(4, Math.min(12, Math.ceil(sentences.length * 0.70)));
    } else if (mode === 'bullets') {
      pickCount = Math.max(3, Math.min(8, Math.ceil(sentences.length * 0.40)));
    } else if (mode === 'keypoints' || mode === 'revision') {
      pickCount = Math.max(4, Math.min(8, Math.ceil(sentences.length * 0.50)));
    }

    // Pick top sentences and restore original chronological order
    const selected = sortedByScore.slice(0, pickCount).sort((a, b) => a.index - b.index);

    let summaryText = '';
    let bulletList = [];

    if (mode === 'bullets') {
      bulletList = selected.map(item => `• ${item.sentence}`);
      summaryText = bulletList.join('\n\n');
    } else {
      summaryText = selected.map(item => item.sentence).join(' ');
    }

    // Extract High-Yield Key Points (definitions, formulas, salient takeaways)
    const keyPoints = [];
    scored.forEach(item => {
      if (item.hasDefinition || item.hasFormula || item.score > (sortedByScore[1]?.score || 0)) {
        if (!keyPoints.includes(item.sentence) && keyPoints.length < 6) {
          keyPoints.push(item.sentence);
        }
      }
    });

    // Generate Automatic Revision Notes Study Sheet
    const revisionNotes = this.formatRevisionStudySheet(text, selected, keyPoints);

    const summaryMetrics = this.calculateTextMetrics(mode === 'revision' ? revisionNotes : summaryText);
    const compressionPct = originalMetrics.words > 0
      ? Math.max(0, Math.round((1 - (summaryMetrics.words / originalMetrics.words)) * 100))
      : 0;

    return {
      summaryText,
      keyPoints,
      revisionNotes,
      originalMetrics,
      summaryMetrics,
      compressionPct
    };
  },

  formatRevisionStudySheet(rawText, selectedSentences, keyPoints) {
    const lines = [];
    lines.push(`📚 HIGH-YIELD REVISION STUDY SHEET`);
    lines.push(`Generated: ${new Date().toLocaleDateString()} | Smart Study Notes`);
    lines.push(`====================================================\n`);

    lines.push(`🎯 1. CORE EXECUTIVE SUMMARY`);
    selectedSentences.slice(0, 3).forEach(s => {
      lines.push(`• ${s.sentence}`);
    });
    lines.push('');

    lines.push(`💡 2. KEY DEFINITIONS & FORMULAS`);
    const defsOrFormulas = selectedSentences.filter(s => s.hasDefinition || s.hasFormula);
    if (defsOrFormulas.length > 0) {
      defsOrFormulas.forEach(item => lines.push(`⚡ ${item.sentence}`));
    } else {
      keyPoints.slice(0, 3).forEach(kp => lines.push(`⚡ ${kp}`));
    }
    lines.push('');

    lines.push(`📝 3. EXAM REVISION CHECKLIST`);
    selectedSentences.forEach((s, idx) => {
      lines.push(`[ ] Concept ${idx + 1}: ${s.sentence.substring(0, 95)}...`);
    });
    lines.push('');

    lines.push(`❓ 4. ACTIVE RECALL SELF-TEST QUESTIONS`);
    selectedSentences.slice(0, 3).forEach((s, idx) => {
      const words = s.sentence.split(/\s+/);
      const subjectWord = words[0] || 'the core concept';
      lines.push(`Q${idx + 1}: What is the primary role or mechanism of ${subjectWord}?`);
      lines.push(`   Answer tip: Review: "${s.sentence.substring(0, 100)}..."`);
    });

    return lines.join('\n');
  },

  runSummarizer() {
    const inputArea = document.getElementById('summarizerInputText');
    if (!inputArea) return;

    const text = inputArea.value.trim();
    if (!text) {
      App.showToast('Please enter, paste, or upload text to summarize.', 'warning');
      return;
    }

    const result = this.generateSummary(text, this.summarizerMode);
    this.lastSummaryResult = result;
    this.renderSummaryOutput(result);
    Rewards.addXP(10, 'Generated AI text summary');
    Rewards.checkBadges();
  },

  renderSummaryOutput(result) {
    const outputContainer = document.getElementById('summarizerOutputCard');
    const outputTextEl = document.getElementById('summarizerResultText');
    const metricsBadgeEl = document.getElementById('summarizerMetricsBadge');
    const compPctEl = document.getElementById('summarizerCompressionStat');

    if (!outputContainer || !outputTextEl) return;

    outputContainer.style.display = 'block';

    let displayContent = '';
    if (this.summarizerMode === 'keypoints') {
      displayContent = `
        <div style="font-weight:700; color:var(--primary); margin-bottom:0.75rem;">
          🔑 High-Yield Key Points Extracted:
        </div>
        <ul style="padding-left:1.25rem; line-height:1.7;">
          ${result.keyPoints.map(kp => `<li style="margin-bottom:0.6rem;">${escapeHTML(kp)}</li>`).join('')}
        </ul>
      `;
    } else if (this.summarizerMode === 'revision') {
      displayContent = `<pre class="revision-sheet-pre">${escapeHTML(result.revisionNotes)}</pre>`;
    } else {
      displayContent = `<div style="line-height:1.7; font-size:0.95rem; white-space:pre-line;">${escapeHTML(result.summaryText)}</div>`;
    }

    outputTextEl.innerHTML = displayContent;

    if (metricsBadgeEl) {
      metricsBadgeEl.innerHTML = `
        <span class="metric-pill">Original: <strong>${result.originalMetrics.words}</strong> words</span>
        <span class="metric-pill">Summary: <strong>${result.summaryMetrics.words}</strong> words</span>
        <span class="metric-pill">Reading Time: <strong>${result.summaryMetrics.readingTimeMin}</strong> min</span>
        <span class="metric-pill pill-success">Compressed by <strong>${result.compressionPct}%</strong></span>
      `;
    }

    if (compPctEl) {
      compPctEl.textContent = `${result.compressionPct}% reduction`;
    }

    // Scroll output card into view smoothly
    outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  updateSummarizerLiveMetrics() {
    const input = document.getElementById('summarizerInputText');
    const text = input ? input.value : '';
    const m = this.calculateTextMetrics(text);

    const wordEl = document.getElementById('sumLiveWordCount');
    const charEl = document.getElementById('sumLiveCharCount');
    const readEl = document.getElementById('sumLiveReadTime');
    const sentEl = document.getElementById('sumLiveSentCount');

    if (wordEl) wordEl.textContent = `${m.words} words`;
    if (charEl) charEl.textContent = `${m.charsWithSpaces} chars (${m.charsNoSpaces} no spaces)`;
    if (readEl) readEl.textContent = `${m.readingTimeMin}m read • ${m.speakingTimeMin}m speak`;
    if (sentEl) sentEl.textContent = `${m.sentences} sentences • ${m.paragraphs} para`;
  },

  loadSampleText(sampleKey) {
    const input = document.getElementById('summarizerInputText');
    const hint = document.getElementById('summarizerSourceHint');
    if (!input) return;

    const samples = {
      'data-comm': `Data communication refers to the transmission of digital data between two or more nodes through a transmission medium such as a copper wire, fiber optic cable, or wireless radio frequency channel. 
The fundamental goal of a communication system is to deliver information accurately, reliably, and in sequence without unauthorized eavesdropping or corruption.
Channel capacity represents the highest rate at which data can be reliably transferred over a specific physical channel. Nyquist theorem states that for a noiseless channel with bandwidth B and discrete signal levels L, the maximum bit rate is given by BitRate = 2 * B * log2(L). 
In real-world environments, noise is inevitable. Claude Shannon formulated the landmark Shannon Capacity Theorem for Gaussian noisy channels: Capacity C = B * log2(1 + SNR), where SNR is the signal-to-noise ratio.
Error detection is an indispensable requirement in modern telemetry. The Cyclic Redundancy Check (CRC) utilizes polynomial long division in binary arithmetic (modulo-2 division) to append parity check bits to transmitted frames, detecting burst errors with extraordinary mathematical efficiency.`,

      'network-layers': `The Open Systems Interconnection (OSI) model is a conceptual framework designed by the International Organization for Standardization to standardize telecommunication functions regardless of their underlying hardware structure.
The model divides network processes into seven hierarchical layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.
The Physical layer deals with bit transmission over physical media, voltage levels, and pin layouts.
The Data Link layer formats raw bits into frames, performs Media Access Control (MAC) addressing, and executes error detection such as CRC.
The Network layer handles logical addressing (IPv4 and IPv6) and path determination across routers via algorithms like Dijkstra shortest path.
The Transport layer guarantees end-to-end reliability and flow control using protocols like TCP (connection-oriented, with 3-way handshakes and sliding window flow control) or UDP (connectionless, low latency for streaming).
The top layers manage sessions, encryption formatting (TLS/SSL), and end-user application protocols such as HTTP, DNS, and SMTP.`,

      'os-scheduling': `CPU scheduling is the foundational basis of modern multiprogramming operating systems. 
By switching the CPU among processes, the operating system makes the computer productive and responsive.
In a uniprocessor system, only one process can execute instructions at any given instant; any other processes must wait until the CPU becomes free.
The objective of multiprogramming is to maximize CPU utilization, throughput, and minimize turnaround time, waiting time, and response time.
Round Robin (RR) CPU scheduling is specifically engineered for time-shared systems. It is similar to First-Come First-Served scheduling, but preemption is added to switch between processes after a predetermined time slice called a time quantum (typically 10 to 100 milliseconds).
If the time quantum is chosen excessively large, Round Robin scheduling degenerates into First-Come First-Served. Conversely, if the quantum is extremely brief, the context-switch overhead degrades processor efficiency.`
    };

    input.value = samples[sampleKey] || '';
    if (hint) {
      hint.style.display = 'block';
      const label = sampleKey === 'data-comm' ? 'Data Communication & Channel Capacity'
        : sampleKey === 'network-layers' ? 'OSI & TCP/IP Network Protocols' : 'Operating Systems CPU Scheduling';
      hint.innerHTML = `Loaded Academic Sample: <strong>${label}</strong>`;
    }

    this.updateSummarizerLiveMetrics();
    App.showToast('Sample lecture notes loaded.', 'info');
  },

  importDocument(file) {
    if (!file) return;

    const validExtensions = ['.txt', '.md', '.markdown', '.text'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      App.showToast('Please select a valid .txt or .md markdown file.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const baseTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      if (this.activeTab === 'summarizer') {
        const input = document.getElementById('summarizerInputText');
        const hint = document.getElementById('summarizerSourceHint');
        if (input) {
          input.value = content;
          this.updateSummarizerLiveMetrics();
        }
        if (hint) {
          hint.style.display = 'block';
          hint.innerHTML = `Imported File: <strong>${escapeHTML(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
        }
        App.showToast(`Imported "${file.name}" into Summarizer!`, 'success');
      } else {
        // Open Note Creation Modal pre-filled
        const titleInput = document.getElementById('noteTitle');
        const contentInput = document.getElementById('noteContent');
        const subjectInput = document.getElementById('noteSubject');
        const tagsInput = document.getElementById('noteTags');

        if (titleInput) titleInput.value = baseTitle;
        if (contentInput) contentInput.value = content;
        if (subjectInput && !subjectInput.value) subjectInput.value = 'Imported Notes';
        if (tagsInput) tagsInput.value = 'imported, doc';

        App.openModal('addNoteModal');
        App.showToast(`File "${file.name}" imported into Note Creator.`, 'success');
      }
    };

    reader.onerror = () => {
      App.showToast('Failed to read the imported document.', 'danger');
    };

    reader.readAsText(file);
  },

  copySummaryToClipboard() {
    if (!this.lastSummaryResult) {
      App.showToast('No summary generated yet to copy.', 'warning');
      return;
    }

    let textToCopy = '';
    if (this.summarizerMode === 'revision') {
      textToCopy = this.lastSummaryResult.revisionNotes;
    } else if (this.summarizerMode === 'keypoints') {
      textToCopy = this.lastSummaryResult.keyPoints.map(kp => `• ${kp}`).join('\n');
    } else {
      textToCopy = this.lastSummaryResult.summaryText;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      App.showToast('Summary copied to clipboard! 📋', 'success');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      App.showToast('Summary copied to clipboard! 📋', 'success');
    });
  },

  downloadSummary(format = 'txt') {
    if (!this.lastSummaryResult) {
      App.showToast('Please generate a summary first before downloading.', 'warning');
      return;
    }

    let content = '';
    let ext = format === 'md' ? 'md' : 'txt';
    let mime = format === 'md' ? 'text/markdown' : 'text/plain';

    if (this.summarizerMode === 'revision') {
      content = this.lastSummaryResult.revisionNotes;
    } else if (this.summarizerMode === 'keypoints') {
      content = `AI NOTES ORGANIZER & SUMMARIZER - KEY POINTS\nDate: ${new Date().toLocaleString()}\n\n` +
        this.lastSummaryResult.keyPoints.map(k => `• ${k}`).join('\n\n');
    } else {
      content = (format === 'md')
        ? `# AI Summary (${this.summarizerMode.toUpperCase()} MODE)\n\n**Date:** ${new Date().toLocaleString()}  \n**Original Words:** ${this.lastSummaryResult.originalMetrics.words}  \n**Summary Words:** ${this.lastSummaryResult.summaryMetrics.words}  \n**Compression:** ${this.lastSummaryResult.compressionPct}% reduction  \n\n---\n\n${this.lastSummaryResult.summaryText}\n`
        : `AI SUMMARY (${this.summarizerMode.toUpperCase()} MODE)\nDate: ${new Date().toLocaleString()}\nWords: ${this.lastSummaryResult.summaryMetrics.words} (Reduced by ${this.lastSummaryResult.compressionPct}%)\n\n========================================\n\n${this.lastSummaryResult.summaryText}`;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Summary_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast(`Summary downloaded as .${ext}`, 'success');
  },

  saveSummaryAsNote() {
    if (!this.lastSummaryResult) {
      App.showToast('Please generate a summary first.', 'warning');
      return;
    }

    let noteContent = '';
    let noteTitle = `AI Summary: ${new Date().toLocaleDateString()}`;

    if (this.summarizerMode === 'revision') {
      noteContent = this.lastSummaryResult.revisionNotes;
      noteTitle = `Revision Sheet: ${new Date().toLocaleDateString()}`;
    } else if (this.summarizerMode === 'keypoints') {
      noteContent = this.lastSummaryResult.keyPoints.map(kp => `• ${kp}`).join('\n\n');
      noteTitle = `Key Points: ${new Date().toLocaleDateString()}`;
    } else {
      noteContent = this.lastSummaryResult.summaryText;
    }

    this.addNote({
      title: noteTitle,
      subject: 'AI Summaries',
      folder: 'AI Summaries',
      content: noteContent,
      tags: `summary, ${this.summarizerMode}, revision`,
      favorite: true
    });

    this.switchTab('organizer');
    App.showToast('Summary saved into Digital Notes under "AI Summaries"! ⭐', 'success');
  },

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================

  bindEvents() {
    // Add Note Form Submit
    const addForm = document.getElementById('addNoteForm');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('noteTitle')?.value;
        const subject = document.getElementById('noteSubject')?.value;
        const tags = document.getElementById('noteTags')?.value;
        const favorite = document.getElementById('noteFavorite')?.checked;
        const content = document.getElementById('noteContent')?.value;

        if (!title || !subject || !content) {
          App.showToast('Please fill out note title, folder/subject, and content.', 'warning');
          return;
        }

        this.addNote({ title, subject, folder: subject, content, tags, favorite });
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
        const tags = document.getElementById('noteEditTags')?.value;
        const favorite = document.getElementById('noteEditFavorite')?.checked;
        const content = document.getElementById('noteEditContent')?.value;

        this.updateNote(id, { title, subject, folder: subject, content, tags, favorite });
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

    // Sort Dropdown
    const sortSelect = document.getElementById('notesSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.setSortBy(e.target.value);
      });
    }

    // Favorites Filter Button
    const favToggleBtn = document.getElementById('btnNotesToggleFav');
    if (favToggleBtn) {
      favToggleBtn.addEventListener('click', () => {
        this.toggleFavoritesFilter();
      });
    }

    // File Import for Notes (file picker)
    const fileInput = document.getElementById('notesDocFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.importDocument(e.target.files[0]);
          e.target.value = '';
        }
      });
    }
  },

  initSummarizerEvents() {
    // Mode Buttons
    const modeButtons = document.querySelectorAll('.sum-mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.summarizerMode = btn.getAttribute('data-mode') || 'short';
        // If there's already input text and an active summary, re-run immediately
        const inputArea = document.getElementById('summarizerInputText');
        if (inputArea && inputArea.value.trim() && this.lastSummaryResult) {
          this.runSummarizer();
        }
      });
    });

    // Real-time Text Counter
    const inputArea = document.getElementById('summarizerInputText');
    if (inputArea) {
      inputArea.addEventListener('input', () => {
        this.updateSummarizerLiveMetrics();
      });
    }

    // Run Summarize Button
    const runBtn = document.getElementById('btnRunSummarizer');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        this.runSummarizer();
      });
    }

    // Clear Button
    const clearBtn = document.getElementById('btnClearSummarizer');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (inputArea) {
          inputArea.value = '';
          this.updateSummarizerLiveMetrics();
        }
        const hint = document.getElementById('summarizerSourceHint');
        if (hint) hint.style.display = 'none';
        const output = document.getElementById('summarizerOutputCard');
        if (output) output.style.display = 'none';
        this.lastSummaryResult = null;
        App.showToast('Summarizer input cleared.', 'info');
      });
    }

    // Drag and Drop support on input container
    const dropZone = document.getElementById('summarizerDropZone');
    if (dropZone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.add('drag-active');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.remove('drag-active');
        }, false);
      });

      dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
          this.importDocument(files[0]);
        }
      }, false);
    }
  }
};
