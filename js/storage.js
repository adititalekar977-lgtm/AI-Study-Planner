/**
 * AI STUDY PLANNER - STORAGE MODULE
 * Data Communication Lab College Project
 * Robust LocalStorage Wrapper with Schema Validation & Demo Seed Data
 */

const STORAGE_KEYS = {
  USER: 'asp_user',
  TIMETABLE: 'asp_timetable',
  ASSIGNMENTS: 'asp_assignments',
  NOTES: 'asp_notes',
  EXAMS: 'asp_exams',
  SESSIONS: 'asp_sessions',
  CHAT: 'asp_chat_history',
  QUIZ_HISTORY: 'asp_quiz_history',
  REWARDS: 'asp_rewards',
  SETTINGS: 'asp_settings'
};

// Generates dynamic future ISO dates for realistic demo countdowns
function getRelativeDate(daysOffset, hours = 10, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function getFormattedDateOnly(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const DEFAULT_SEED_DATA = {
  [STORAGE_KEYS.USER]: {
    name: 'Alex Morgan',
    email: 'alex.morgan@college.edu',
    college: 'Apex Institute of Technology',
    course: 'B.Tech Computer Science & Engineering',
    labSection: 'Data Communication Lab - Batch B2',
    semester: '6th Semester',
    targetHours: 4.5,
    avatar: 'AM',
    password: 'student123',
    isLoggedIn: true,
    joinedDate: '2026-09-01'
  },

  [STORAGE_KEYS.TIMETABLE]: [
    {
      id: 'tt_1',
      day: 'Monday',
      timeSlot: '09:00 - 10:15',
      subject: 'Data Communication',
      topic: 'Shannon Capacity Theorem & Nyquist Bit Rate',
      priority: 'High',
      durationMinutes: 75,
      completed: true,
      date: getFormattedDateOnly(0)
    },
    {
      id: 'tt_2',
      day: 'Monday',
      timeSlot: '10:30 - 11:45',
      subject: 'Computer Networks',
      topic: 'OSI 7 Layers & TCP/IP Protocol Suite',
      priority: 'High',
      durationMinutes: 75,
      completed: true,
      date: getFormattedDateOnly(0)
    },
    {
      id: 'tt_3',
      day: 'Monday',
      timeSlot: '12:00 - 13:00',
      subject: 'Operating Systems',
      topic: 'Round Robin & Priority CPU Scheduling',
      priority: 'Medium',
      durationMinutes: 60,
      completed: false,
      date: getFormattedDateOnly(0)
    },
    {
      id: 'tt_4',
      day: 'Monday',
      timeSlot: '14:30 - 16:00',
      subject: 'Data Comm Lab',
      topic: 'Experiment 4: Cyclic Redundancy Check (CRC)',
      priority: 'High',
      durationMinutes: 90,
      completed: false,
      date: getFormattedDateOnly(0)
    },
    {
      id: 'tt_5',
      day: 'Tuesday',
      timeSlot: '09:30 - 11:00',
      subject: 'Data Communication',
      topic: 'PCM, FDM and TDM Multiplexing Techniques',
      priority: 'High',
      durationMinutes: 90,
      completed: false,
      date: getFormattedDateOnly(1)
    },
    {
      id: 'tt_6',
      day: 'Wednesday',
      timeSlot: '10:00 - 11:30',
      subject: 'Computer Networks',
      topic: 'Dijkstra Shortest Path Routing Algorithm',
      priority: 'High',
      durationMinutes: 90,
      completed: false,
      date: getFormattedDateOnly(2)
    }
  ],

  [STORAGE_KEYS.ASSIGNMENTS]: [
    {
      id: 'asg_1',
      title: 'Data Comm Lab #4: CRC Error Detection',
      subject: 'Data Communication',
      description: 'Implement polynomial division for 16-bit CRC code generation in C/Python and test bit flips.',
      deadline: getRelativeDate(3, 23, 59),
      priority: 'High',
      status: 'pending' // pending, in-progress, completed
    },
    {
      id: 'asg_2',
      title: 'Packet Tracer Subnetting Lab Exercise',
      subject: 'Computer Networks',
      description: 'Design a 4-subnet star topology with router configuration and verified ping echo tests.',
      deadline: getRelativeDate(5, 17, 0),
      priority: 'High',
      status: 'in-progress'
    },
    {
      id: 'asg_3',
      title: 'OS Multithreading & Semaphore Report',
      subject: 'Operating Systems',
      description: 'Analyze Dining Philosophers synchronization problem using POSIX semaphores.',
      deadline: getRelativeDate(8, 12, 0),
      priority: 'Medium',
      status: 'pending'
    },
    {
      id: 'asg_4',
      title: 'Transmission Media Comparative Study',
      subject: 'Data Communication',
      description: 'Tabulate attenuation, bandwidth, and EMI resilience across Twisted Pair, Coaxial, and Fiber Optic cables.',
      deadline: getRelativeDate(-2, 17, 0),
      priority: 'Medium',
      status: 'completed'
    }
  ],

  [STORAGE_KEYS.NOTES]: [
    {
      id: 'note_1',
      title: 'OSI 7 Layers vs TCP/IP Suite Summary',
      subject: 'Data Communication',
      content: `• Physical: Raw bits, RS-232, RJ45, Repeaters, Hubs
• Data Link: Framing, MAC addresses, Error detection (CRC, Parity), Switches
• Network: Packet routing, IP addressing, ICMP, ARP, Routers
• Transport: Segment delivery, TCP (reliable, connection-oriented) vs UDP (unreliable, datagrams)
• Session: RPC, dialog control, token management
• Presentation: Data encryption, compression, JPEG, ASCII
• Application: HTTP, DNS, FTP, SMTP, SSH

TCP/IP Model maps these into 4 functional layers: Network Access, Internet, Transport, and Application.`,
      pinned: true,
      updatedAt: '2026-11-18T14:20:00Z'
    },
    {
      id: 'note_2',
      title: 'Data Channel Capacity Formulas',
      subject: 'Data Communication',
      content: `1. Nyquist Bit Rate Formula (Noiseless Channel):
   BitRate = 2 * B * log2(L)
   where B = Bandwidth in Hz, L = Number of signal levels.

2. Shannon Capacity Formula (Noisy Channel):
   C = B * log2(1 + SNR)
   where C = Maximum channel capacity (bps), SNR = Signal-to-Noise Ratio (linear).
   Note: SNR(dB) = 10 * log10(SNR_linear).

Key Exam Tip: Shannon gives theoretical upper bound; Nyquist gives required signal discrete levels.`,
      pinned: true,
      updatedAt: '2026-11-19T09:15:00Z'
    },
    {
      id: 'note_3',
      title: 'Round Robin CPU Scheduling Principles',
      subject: 'Operating Systems',
      content: `• Designed especially for time-sharing systems.
• Each process is given a small unit of CPU time (time quantum q, usually 10-100 ms).
• Ready queue is treated as a circular FIFO queue.
• If q is excessively large -> degrades to FCFS.
• If q is excessively small -> context switch overhead dominates.`,
      pinned: false,
      updatedAt: '2026-11-17T11:45:00Z'
    }
  ],

  [STORAGE_KEYS.EXAMS]: [
    {
      id: 'ex_1',
      subject: 'Data Communication',
      paperName: 'Data Communication & Lab Practical Examination',
      examDate: getFormattedDateOnly(6),
      examTime: '10:00',
      venue: 'Networking Lab Room 304',
      priority: 'High',
      topics: 'Transmission Media, Nyquist/Shannon, Framing, CRC, Go-Back-N, Selective Repeat ARQ'
    },
    {
      id: 'ex_2',
      subject: 'Computer Networks',
      paperName: 'End-Semester Theory Examination',
      examDate: getFormattedDateOnly(13),
      examTime: '14:00',
      venue: 'Main Academic Hall 101',
      priority: 'High',
      topics: 'IPv4/IPv6, CIDR Subnetting, RIP, OSPF, BGP, TCP 3-Way Handshake, Sliding Window, DNS'
    },
    {
      id: 'ex_3',
      subject: 'Operating Systems',
      paperName: 'Mid-Term Assessment',
      examDate: getFormattedDateOnly(20),
      examTime: '11:30',
      venue: 'Science Block Lecture Hall 3',
      priority: 'Medium',
      topics: 'Processes, Threads, Deadlock Avoidance (Banker\'s Algorithm), Paging & Virtual Memory'
    }
  ],

  [STORAGE_KEYS.SESSIONS]: [
    { date: getFormattedDateOnly(-6), minutes: 120, subject: 'Data Communication' },
    { date: getFormattedDateOnly(-5), minutes: 150, subject: 'Computer Networks' },
    { date: getFormattedDateOnly(-4), minutes: 90, subject: 'Operating Systems' },
    { date: getFormattedDateOnly(-3), minutes: 180, subject: 'Data Communication' },
    { date: getFormattedDateOnly(-2), minutes: 160, subject: 'Computer Networks' },
    { date: getFormattedDateOnly(-1), minutes: 210, subject: 'Data Comm Lab' },
    { date: getFormattedDateOnly(0), minutes: 150, subject: 'Data Communication' }
  ],

  [STORAGE_KEYS.CHAT]: [
    {
      id: 'chat_init_1',
      sender: 'bot',
      text: "👋 Hello Alex! I am your AI Study Assistant for the Data Communication Lab & College Studies. How can I assist you with your schedule, lab experiments, or exam preparation today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],

  [STORAGE_KEYS.QUIZ_HISTORY]: [
    {
      id: 'qh_1',
      subject: 'Data Communication',
      topic: 'Physical & Data Link Layers',
      score: 9,
      total: 10,
      percentage: 90,
      date: getFormattedDateOnly(-2)
    },
    {
      id: 'qh_2',
      subject: 'Computer Networks',
      topic: 'OSI Model & Protocols',
      score: 8,
      total: 10,
      percentage: 80,
      date: getFormattedDateOnly(-4)
    }
  ],

  [STORAGE_KEYS.REWARDS]: {
    streak: 5,
    longestStreak: 9,
    lastActiveDate: getFormattedDateOnly(0),
    totalXP: 580,
    level: 3,
    levelTitle: 'Senior Scholar',
    badges: {
      first_step: { unlocked: true, unlockedAt: '2026-11-01', title: 'First Step', desc: 'Completed your first study session.' },
      pomodoro_master: { unlocked: true, unlockedAt: '2026-11-08', title: 'Pomodoro Master', desc: 'Completed 5+ focused Pomodoro sessions.' },
      task_crusher: { unlocked: true, unlockedAt: '2026-11-12', title: 'Task Crusher', desc: 'Finished and marked 3 assignments complete.' },
      quiz_champ: { unlocked: true, unlockedAt: '2026-11-15', title: 'Quiz Champion', desc: 'Scored 80% or higher on an AI subject quiz.' },
      streak_3: { unlocked: true, unlockedAt: '2026-11-18', title: 'Consistent Scholar', desc: 'Maintained a 3-day continuous study streak.' },
      datacomm_pro: { unlocked: true, unlockedAt: '2026-11-19', title: 'Network Architect', desc: 'Created 2+ notes on Data Communication concepts.' },
      planner_pro: { unlocked: false, unlockedAt: null, title: 'Master Strategist', desc: 'Generate 3 AI study timetables.' },
      marathon_mind: { unlocked: false, unlockedAt: null, title: 'Study Marathon', desc: 'Log 20 total study hours.' }
    }
  },

  [STORAGE_KEYS.SETTINGS]: {
    theme: 'light',
    accentColor: '#2563eb',
    timerSound: true,
    autoStartBreaks: false,
    notificationsEnabled: true,
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15
  }
};

const Storage = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data !== null ? JSON.parse(data) : defaultValue;
    } catch (err) {
      console.error(`Error reading ${key} from LocalStorage:`, err);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Error saving ${key} to LocalStorage:`, err);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Error removing ${key}:`, err);
    }
  },

  init() {
    // If user profile is not found, seed the entire demo database
    const user = this.get(STORAGE_KEYS.USER);
    if (!user) {
      this.resetToDefault();
    } else {
      // Ensure missing keys are hydrated smoothly
      Object.keys(DEFAULT_SEED_DATA).forEach(key => {
        if (this.get(key) === null) {
          this.set(key, DEFAULT_SEED_DATA[key]);
        }
      });
    }
  },

  resetToDefault() {
    Object.keys(DEFAULT_SEED_DATA).forEach(key => {
      this.set(key, DEFAULT_SEED_DATA[key]);
    });
    console.log('AI Study Planner seed data restored successfully.');
  },

  exportData() {
    const backup = {};
    Object.values(STORAGE_KEYS).forEach(key => {
      backup[key] = this.get(key);
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Study_Planner_Backup_${getFormattedDateOnly(0)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData(jsonContent) {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Invalid JSON structure: Root must be a key-value object.');
      }
      const validKeys = Object.values(STORAGE_KEYS);
      const importedKeys = Object.keys(parsed).filter(k => validKeys.includes(k));
      if (importedKeys.length === 0) {
        throw new Error('Backup file contains no recognizable AI Study Planner data schemas.');
      }
      importedKeys.forEach(key => {
        this.set(key, parsed[key]);
      });
      return { success: true, message: `Data restored successfully (${importedKeys.length} modules imported)!` };
    } catch (err) {
      return { success: false, message: 'Failed to import backup: ' + err.message };
    }
  },

  clearAll() {
    localStorage.clear();
  }
};

// Auto-run init
Storage.init();
