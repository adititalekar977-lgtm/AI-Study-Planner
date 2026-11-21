/**
 * AI STUDY PLANNER - AI QUIZ GENERATOR MODULE
 * Built-in Question Bank with Data Communication Lab focus, real-time score analytics & review.
 */

const Quiz = {
  currentQuiz: null,
  currentIndex: 0,
  userAnswers: [],
  score: 0,

  questionBank: [
    // --- Data Communication & Networking (Easy) ---
    {
      subject: 'Data Communication',
      topic: 'Physical & Data Link Layers',
      difficulty: 'Easy',
      question: 'Which layer of the OSI model is responsible for node-to-node framing and physical MAC addressing?',
      options: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer'],
      answer: 1,
      explanation: 'The Data Link Layer (Layer 2) divides raw bit streams from the Physical Layer into discrete frames and utilizes physical MAC addresses for local delivery.'
    },
    {
      subject: 'Data Communication',
      topic: 'Physical & Data Link Layers',
      difficulty: 'Easy',
      question: 'Which of the following transmission media offers the highest data transmission bandwidth and immunity to Electromagnetic Interference (EMI)?',
      options: ['Unshielded Twisted Pair (UTP)', 'Shielded Twisted Pair (STP)', 'Coaxial Cable', 'Fiber Optic Cable'],
      answer: 3,
      explanation: 'Fiber Optic Cables transmit data pulses of light through core glass/plastic fibers via total internal reflection, achieving ultra-high bandwidth and complete immunity to electrical/electromagnetic interference.'
    },
    {
      subject: 'Data Communication',
      topic: 'Transmission Impairments & Signals',
      difficulty: 'Easy',
      question: 'The loss of energy in a signal as it travels across a physical transmission medium is known as:',
      options: ['Attenuation', 'Distortion', 'Thermal Noise', 'Jitter'],
      answer: 0,
      explanation: 'Attenuation refers to the gradual reduction in signal amplitude and power over distance, which often requires repeaters or amplifiers.'
    },

    // --- Data Communication & Networking (Medium) ---
    {
      subject: 'Data Communication',
      topic: 'Channel Capacity & Formulas',
      difficulty: 'Medium',
      question: 'According to Nyquist Theorem for a noiseless channel with bandwidth B = 4000 Hz and L = 16 discrete signal levels, what is the maximum bit rate?',
      options: ['16,000 bps', '32,000 bps', '64,000 bps', '8,000 bps'],
      answer: 1,
      explanation: 'Formula: BitRate = 2 * B * log2(L). Here, B = 4000 Hz and log2(16) = 4. Therefore: 2 * 4000 * 4 = 32,000 bps.'
    },
    {
      subject: 'Data Communication',
      topic: 'Error Detection & Flow Control',
      difficulty: 'Medium',
      question: 'In Cyclic Redundancy Check (CRC), which mathematical operation is performed during polynomial division?',
      options: ['Standard base-10 division', 'Modulo-2 arithmetic (XOR without carries)', 'Bitwise AND operations', 'Floating-point matrix inversion'],
      answer: 1,
      explanation: 'CRC utilizes Modulo-2 binary arithmetic, where addition and subtraction are identical and equivalent to the bitwise Exclusive-OR (XOR) operation.'
    },
    {
      subject: 'Data Communication',
      topic: 'Multiplexing & Switching',
      difficulty: 'Medium',
      question: 'What is the primary difference between Frequency Division Multiplexing (FDM) and Time Division Multiplexing (TDM)?',
      options: [
        'FDM divides time slices; TDM divides frequency spectra.',
        'FDM is an analog technique dividing bandwidth; TDM is a digital technique allocating time slots.',
        'FDM cannot be used with radio waves.',
        'TDM requires guard bands between channels.'
      ],
      answer: 1,
      explanation: 'FDM allocates continuous fractional frequency channels separated by guard bands (typically analog), whereas TDM allocates the entire channel bandwidth for sequential discrete time slots (typically digital).'
    },

    // --- Data Communication & Networking (Hard) ---
    {
      subject: 'Data Communication',
      topic: 'Flow & Error Control ARQ',
      difficulty: 'Hard',
      question: 'In a Go-Back-N ARQ protocol with an m-bit sequence number, what is the maximum permissible sender window size (Ws)?',
      options: ['2^m', '2^(m - 1)', '(2^m) - 1', '2^m + 1'],
      answer: 2,
      explanation: 'To prevent ambiguity between new frames and retransmissions when ACKs are delayed, Go-Back-N requires the sender window size to be at most (2^m) - 1.'
    },
    {
      subject: 'Data Communication',
      topic: 'Channel Capacity & Formulas',
      difficulty: 'Hard',
      question: 'If a communication channel has a bandwidth of 1 MHz and a Signal-to-Noise Ratio (SNR) of 63, what is its theoretical Shannon capacity?',
      options: ['6 Mbps', '12 Mbps', '3 Mbps', '63 Mbps'],
      answer: 0,
      explanation: 'Shannon Formula: C = B * log2(1 + SNR). C = 1,000,000 * log2(1 + 63) = 1,000,000 * log2(64) = 1,000,000 * 6 = 6 Mbps.'
    },

    // --- Operating Systems ---
    {
      subject: 'Operating Systems',
      topic: 'CPU Scheduling & Memory',
      difficulty: 'Medium',
      question: 'Which CPU scheduling algorithm gives minimal average waiting time for a given set of processes?',
      options: ['First-Come, First-Served (FCFS)', 'Round Robin (RR)', 'Shortest Job First (SJF / SRTF)', 'Priority Scheduling'],
      answer: 2,
      explanation: 'Shortest Job First (SJF) is mathematically optimal because scheduling the shortest process first minimizes the total waiting queue buildup.'
    },
    {
      subject: 'Operating Systems',
      topic: 'Concurrency & Deadlocks',
      difficulty: 'Hard',
      question: 'Which of the following conditions is NOT one of Coffman\'s four necessary conditions for a deadlock to occur?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
      answer: 2,
      explanation: 'The condition is "No Preemption" (resources cannot be forcibly confiscated). Allowing preemption actively prevents deadlock.'
    },

    // --- Study & Learning Techniques ---
    {
      subject: 'General Study Skills',
      topic: 'Productivity Science',
      difficulty: 'Easy',
      question: 'What is the core principle of the Feynman Technique for rapid learning?',
      options: [
        'Read textbook chapters three times at high speed.',
        'Explain the concept simply in plain language as if teaching a beginner.',
        'Study in continuous 8-hour uninterrupted blocks without food or breaks.',
        'Highlight every single line in your lecture notes with yellow ink.'
      ],
      answer: 1,
      explanation: 'Richard Feynman advocated explaining any complex theory in simple, everyday language; any point where you get stuck indicates the exact conceptual gap you need to review.'
    }
  ],

  init() {
    this.bindEvents();
    this.renderHistory();
  },

  startQuiz(subject, difficulty, count = 5) {
    let pool = this.questionBank.filter(q => {
      const matchSub = subject === 'All' || q.subject === subject;
      const matchDiff = difficulty === 'All' || q.difficulty === difficulty;
      return matchSub && matchDiff;
    });

    if (pool.length === 0) {
      pool = this.questionBank; // Fallback to full pool if filter too narrow
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    this.currentQuiz = shuffled.slice(0, Math.min(count, shuffled.length));
    this.currentIndex = 0;
    this.userAnswers = [];
    this.score = 0;

    const setupPane = document.getElementById('quizSetupPane');
    const activePane = document.getElementById('quizActivePane');
    const resultPane = document.getElementById('quizResultPane');

    if (setupPane) setupPane.style.display = 'none';
    if (resultPane) resultPane.style.display = 'none';
    if (activePane) activePane.style.display = 'block';

    this.renderCurrentQuestion();
  },

  renderCurrentQuestion() {
    const q = this.currentQuiz[this.currentIndex];
    if (!q) return;

    const counterEl = document.getElementById('quizQuestionCounter');
    const titleEl = document.getElementById('quizQuestionTitle');
    const optionsEl = document.getElementById('quizOptionsList');
    const explanationEl = document.getElementById('quizExplanationBox');
    const nextBtn = document.getElementById('btnQuizNext');

    if (counterEl) {
      counterEl.textContent = `Question ${this.currentIndex + 1} of ${this.currentQuiz.length} • [${q.subject} - ${q.difficulty}]`;
    }
    if (titleEl) titleEl.textContent = q.question;
    if (explanationEl) {
      explanationEl.style.display = 'none';
      explanationEl.textContent = '';
    }
    if (nextBtn) nextBtn.style.display = 'none';

    const letters = ['A', 'B', 'C', 'D'];
    if (optionsEl) {
      optionsEl.innerHTML = q.options.map((opt, i) => `
        <button class="quiz-option-btn" onclick="Quiz.selectOption(${i})">
          <span class="option-prefix-letter">${letters[i]}</span>
          <span>${opt}</span>
        </button>
      `).join('');
    }
  },

  selectOption(index) {
    const q = this.currentQuiz[this.currentIndex];
    const isCorrect = index === q.answer;

    if (isCorrect) this.score++;
    this.userAnswers.push({ question: q, selected: index, isCorrect });

    // Highlight options
    const optionBtns = document.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.answer) {
        btn.classList.add('correct');
      } else if (i === index) {
        btn.classList.add('wrong');
      }
    });

    // Reveal explanation
    const explanationEl = document.getElementById('quizExplanationBox');
    if (explanationEl) {
      explanationEl.style.display = 'block';
      explanationEl.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</strong> ${q.explanation}`;
    }

    const nextBtn = document.getElementById('btnQuizNext');
    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
      nextBtn.textContent = this.currentIndex + 1 >= this.currentQuiz.length ? 'See Final Results 🏆' : 'Next Question →';
    }
  },

  nextQuestion() {
    if (this.currentIndex + 1 < this.currentQuiz.length) {
      this.currentIndex++;
      this.renderCurrentQuestion();
    } else {
      this.finishQuiz();
    }
  },

  finishQuiz() {
    const total = this.currentQuiz.length;
    const percentage = Math.round((this.score / total) * 100);

    // Save to quiz history
    const history = Storage.get(STORAGE_KEYS.QUIZ_HISTORY, []);
    const record = {
      id: 'qh_' + Date.now(),
      subject: this.currentQuiz[0]?.subject || 'Data Communication',
      score: this.score,
      total: total,
      percentage: percentage,
      date: new Date().toISOString().split('T')[0]
    };
    history.unshift(record);
    Storage.set(STORAGE_KEYS.QUIZ_HISTORY, history);

    // XP Reward
    const earnedXP = this.score * 15;
    Rewards.addXP(earnedXP, `Completed Quiz (${percentage}%)`);

    // UI Updates
    const activePane = document.getElementById('quizActivePane');
    const resultPane = document.getElementById('quizResultPane');
    if (activePane) activePane.style.display = 'none';
    if (resultPane) resultPane.style.display = 'block';

    const scoreNum = document.getElementById('quizResultScore');
    const scoreGrade = document.getElementById('quizResultGrade');
    const scoreSummary = document.getElementById('quizResultSummary');

    let grade = 'A+';
    if (percentage < 60) grade = 'Needs Practice';
    else if (percentage < 75) grade = 'B (Good)';
    else if (percentage < 90) grade = 'A (Great)';

    if (scoreNum) scoreNum.textContent = `${this.score} / ${total} (${percentage}%)`;
    if (scoreGrade) scoreGrade.textContent = `Grade: ${grade}`;
    if (scoreSummary) {
      scoreSummary.textContent = percentage >= 80 
        ? `Outstanding mastery! You earned ${earnedXP} XP.` 
        : `Good effort! Review the explanations to reinforce weak areas. +${earnedXP} XP awarded.`;
    }

    // Render wrong answers review if any
    const reviewContainer = document.getElementById('quizReviewContainer');
    if (reviewContainer) {
      const wrongAnswers = this.userAnswers.filter(a => !a.isCorrect);
      if (wrongAnswers.length > 0) {
        reviewContainer.style.display = 'block';
        reviewContainer.innerHTML = `
          <div style="font-weight:700; font-size:1rem; margin-bottom:0.75rem; color:var(--text-main); border-bottom:1px solid var(--border-light); padding-bottom:0.4rem;">
            🔍 Review Questions (${wrongAnswers.length} to revise):
          </div>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${wrongAnswers.map((item, idx) => `
              <div style="background:var(--bg-subtle); border:1px solid var(--border-light); border-radius:var(--radius-md); padding:0.85rem; font-size:0.88rem;">
                <div style="font-weight:700; color:var(--text-main); margin-bottom:0.35rem;">${idx + 1}. ${escapeHTML(item.question.question)}</div>
                <div style="color:var(--danger); font-size:0.82rem; margin-bottom:0.25rem;">❌ Your Answer: ${escapeHTML(item.question.options[item.selected])}</div>
                <div style="color:var(--success); font-weight:600; font-size:0.82rem; margin-bottom:0.4rem;">✅ Correct Answer: ${escapeHTML(item.question.options[item.question.answer])}</div>
                <div style="font-size:0.8rem; color:var(--text-secondary); background:var(--info-light); padding:0.4rem 0.6rem; border-radius:var(--radius-sm);">💡 ${escapeHTML(item.question.explanation)}</div>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        reviewContainer.style.display = 'none';
        reviewContainer.innerHTML = '';
      }
    }

    App.showToast(`Quiz completed! Score: ${percentage}% (+${earnedXP} XP)`, 'success');
    this.renderHistory();
    Dashboard.render();
    Rewards.checkBadges();
  },

  resetQuiz() {
    const setupPane = document.getElementById('quizSetupPane');
    const activePane = document.getElementById('quizActivePane');
    const resultPane = document.getElementById('quizResultPane');

    if (setupPane) setupPane.style.display = 'block';
    if (activePane) activePane.style.display = 'none';
    if (resultPane) resultPane.style.display = 'none';
  },

  renderHistory() {
    const list = document.getElementById('quizHistoryList');
    if (!list) return;

    const history = Storage.get(STORAGE_KEYS.QUIZ_HISTORY, []);
    if (history.length === 0) {
      list.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; text-align:center;">No quiz results recorded yet.</p>`;
      return;
    }

    list.innerHTML = history.slice(0, 5).map(h => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid var(--border-light); font-size:0.85rem;">
        <div>
          <span style="font-weight:700; color:var(--text-main);">${h.subject}</span>
          <span style="color:var(--text-muted); font-size:0.75rem; margin-left:0.5rem;">${h.date}</span>
        </div>
        <span class="badge ${h.percentage >= 80 ? 'badge-success' : h.percentage >= 60 ? 'badge-warning' : 'badge-danger'}">
          ${h.score}/${h.total} (${h.percentage}%)
        </span>
      </div>
    `).join('');
  },

  bindEvents() {
    const startBtn = document.getElementById('btnStartQuiz');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const sub = document.getElementById('quizSelectSubject')?.value || 'All';
        const diff = document.getElementById('quizSelectDifficulty')?.value || 'All';
        const count = parseInt(document.getElementById('quizSelectCount')?.value) || 5;
        this.startQuiz(sub, diff, count);
      });
    }

    const nextBtn = document.getElementById('btnQuizNext');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextQuestion();
      });
    }

    const retakeBtn = document.getElementById('btnQuizRetake');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        this.resetQuiz();
      });
    }
  }
};
