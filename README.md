# AI Study Planner 🎓

> **College Course Project: Data Communication & Networking Lab**  
> *An intelligent, offline-capable study management platform engineered with HTML5, CSS3, Vanilla JavaScript, and LocalStorage.*

---

## 📌 1. Project Overview

**AI Study Planner** is an all-in-one academic productivity platform developed for engineering students. It consolidates daily course routines, automated timetable generation, assignment management, exam countdowns, digital lab notes, focused Pomodoro intervals, curriculum quizzes, and interactive AI study assistance into a single unified SaaS-style interface.

Designed specifically as a **Data Communication Lab College Project**, this system demonstrates how complex client-side heuristic algorithms, local persistence paradigms, synthetic Web Audio synthesis, and dynamic vector charting can operate entirely offline without reliance on paid APIs, cloud databases, or external frameworks.

---

## 🏗️ 2. Architectural Design & Technology Stack

The project adheres strictly to zero-dependency, native web standards:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Structure** | HTML5 Semantic Markup | Accessible Single Page Application (SPA) layout with 11 distinct view modules and modal dialogs. |
| **Design System** | Pure CSS3 (CSS Variables) | Modern SaaS aesthetic (Indigo/Blue palette, rounded corners, soft shadows, transitions, dark mode). |
| **Responsiveness** | Responsive CSS Grid & Flexbox | Dynamic sidebar drawer, mobile drawer backdrops, and fluid layouts down to 360px viewports. |
| **Business Logic** | Vanilla ES6+ JavaScript | Heuristic timetable scheduling, offline NLP keyword matching, countdown loop, and Pomodoro timer. |
| **Data Layer** | HTML5 LocalStorage API | Complete state persistence across reloads, JSON export/import data portability, zero server lag. |
| **Audio Engine** | Native Web Audio API | Synthesizes pure harmonic sine-wave tones for timer bells (zero external .mp3 file dependencies). |
| **Data Visuals** | Inline Scalable Vector Graphics (SVG) | Pure CSS/SVG weekly bar pillars, radial progress gauges, and score distribution charts. |

---

## 📂 3. Project File Structure

```text
AI-Study-Planner/
│
├── index.html                  # Main application structure, modals, sidebar, and views
├── README.md                   # Complete academic documentation and lab presentation guide
│
├── css/
│   ├── style.css               # SaaS design tokens, components, light & dark theme styling
│   └── responsive.css          # Breakpoints for mobile, tablet, and ultra-wide displays
│
├── js/
│   ├── app.js                  # Master application controller, routing, modals, and toast alerts
│   ├── auth.js                 # Simulated student authentication and demo session manager
│   ├── storage.js              # LocalStorage wrapper, schema validation, and demo seed data
│   ├── dashboard.js            # Real-time KPI metrics, greeting, live clock, and urgent previews
│   ├── timetable.js            # Smart timetable generator with exam urgency weighting
│   ├── assistant.js            # Offline intelligent knowledge engine and study chatbot
│   ├── assignments.js          # Coursework CRUD, automated overdue tracking, and filters
│   ├── notes.js                # Digital lab notebook, category taxonomy, and text download
│   ├── timer.js                # Functional Pomodoro timer with Web Audio chime synthesis
│   ├── quiz.js                 # Built-in question bank, grading engine, and explanation cards
│   ├── progress.js             # SVG/CSS data visualization and weekly study metrics
│   ├── exams.js                # Examination schedule manager with live countdown loops
│   ├── rewards.js              # Daily streak tracking, XP leveling, and achievement badges
│   └── settings.js             # Student profile editor, theme toggle, and JSON backup/restore
│
└── assets/
    ├── icons/
    │   └── favicon.svg         # High-resolution vector favicon
    └── images/
        └── logo.svg            # Branded academic network logo
```

---

## 🌟 4. Comprehensive Feature Walkthrough

### 1. Student Authentication & Profile
- **Simulated Authentication**: Clear educational disclaimer that browser storage is used.
- **One-Click Demo Student Access**: Instantly logs in as **Alex Morgan** (B.Tech CSE, Data Communication Lab) with realistic pre-seeded assignments, exams, notes, and schedules.
- **Custom Student Registration**: Allows registering a new student profile (name, college email, semester, course) with dynamic avatar initial generation.

### 2. SaaS Student Dashboard
- **Dynamic Time Greeting**: Contextual morning, afternoon, or evening welcome.
- **Live Clock & Calendar**: Synchronized real-time date and seconds display.
- **4 Key Stat Metric Cards**: Computes Total Study Hours, Today's Completed Sessions, Pending Coursework, and Upcoming Exams from actual stored activity.
- **Daily Goal Progress Ring**: Compares logged hours today against the user's custom daily study target.
- **Quick Action Bar**: 1-click navigation to all major tools.
- **Today's Timetable Widget**: Schedule preview with quick "Mark Complete" toggles.
- **Motivational Quote of the Day**: Rotating engineering and productivity quotes.

### 3. AI Timetable Generator
- **Intelligent Heuristic Algorithm**:
  1. Distributes subjects across available daily hours (e.g. 4.5 hrs).
  2. Applies priority weighting (`High = 3x`, `Medium = 2x`, `Low = 1x`).
  3. **Exam Proximity Acceleration**: If an upcoming examination is detected within 7 days, the algorithm automatically doubles the subject's scheduling frequency!
  4. Automatically interlaces mandatory 10–15 minute cognitive rest breaks.
- **Dual Display Modes**: Toggle seamlessly between **Daily View** (with day-of-week filters) and a **Weekly Matrix Grid**.
- **Interactive Session Management**: Add custom study sessions, mark sessions done (which logs actual study hours into analytics and awards XP), or delete sessions.
- **Print / PDF Export**: Generates a clean, formatted printable schedule.

### 4. AI Study Assistant (Offline NLP Engine)
- **Transparent Offline Intelligence**: Operates via keyword matching and template response generation without external paid APIs.
- **Predefined Educational Knowledge Base**:
  - *Data Communication Concepts*: OSI 7-Layer Model, TCP vs UDP, Shannon Capacity vs Nyquist Bit Rate, Cyclic Redundancy Check (CRC), Modulation, and Multiplexing (FDM, TDM, WDM).
  - *Study Science*: Pomodoro technique, Feynman technique, Active Recall, Spaced Repetition, and exam stress mitigation.
- **Interactive Chat UX**: Simulated response latency, typing indicator, suggested prompt chips, markdown formatting, and clear chat option.

### 5. Assignment Manager
- **Full CRUD Support**: Add, edit, view, and delete college coursework.
- **Priority & Deadline Flags**: High, Medium, Low priority badges.
- **Automated Overdue Detection**: Evaluates system date against deadlines to automatically flag overdue items with warning badges.
- **Dynamic Filtering**: Filter by All, Pending, In Progress, Completed, or Overdue. Real-time search by title or subject.
- **Live Sidebar Counters**: The sidebar badge dynamically displays the count of pending assignments.

### 6. Digital Notes & Lab Notebook
- **Subject-Based Folders**: Categorizes notes (Data Communication, Computer Networks, Operating Systems, etc.).
- **Rich Formatting & Pinning**: Pin crucial formulas or lab theorems to the top of the grid.
- **Instant Keyword Search**: Live filtering of note titles and content.
- **Offline Text File Export**: 1-click download of any note as a `.txt` file.

### 7. Focus Pomodoro Timer
- **Three Presets**: 25-minute Focus Session, 5-minute Short Break, 15-minute Long Break.
- **Animated SVG Circle**: Visual circular countdown ring tracking exact remaining seconds.
- **Synthetic Web Audio Chimes**: Generates pleasant multi-tone chimes (C5, E5, G5) using native browser oscillators—100% offline, requires no external `.mp3` files!
- **Session Auto-Logging**: Completed focus sessions automatically update total study hours, advance study streaks, and reward XP.

### 8. AI Quiz Generator
- **Rich Offline Question Bank**: Multiple-choice questions spanning Data Communication, Networking, Operating Systems, and Learning Techniques.
- **Configurable Tests**: Select subject, difficulty (Easy, Medium, Hard), and question count (5 or 10).
- **Instant Pedagogical Feedback**: Color-coded answers with detailed technical explanations for every question.
- **Final Result Summary**: Calculates score percentage, grade assignment (A+, A, B), and logs results to the progress tracker.

### 9. Progress Report & Visual Analytics
- **Weekly Study Hours Bar Chart**: Pure CSS/SVG vertical pillars with hover tooltips showing hours studied over the past 7 days.
- **Subject Distribution Breakdown**: Horizontal progress bars showing time proportion per subject.
- **Assignment Completion Gauge**: Circular SVG radial progress meter.
- **Quiz Performance Trends**: Visual score comparison across recent assessments.

### 10. Exam Countdown
- **Live Multi-Unit Countdowns**: Calculates remaining **Days, Hours, and Minutes** in real-time.
- **Urgency Color Coding**: Visual alerts for imminent exam papers.
- **Syllabus & Venue Tracking**: Displays exam room/lab numbers and unit coverage.

### 11. Study Streak & Gamification Rewards
- **Continuous Streak Counter**: Daily activity tracking with flame badges.
- **XP Level Progression**: Advance from *Level 1: Freshman Scholar* to *Level 5: Grand Academician*.
- **Unlockable Achievement Badges**:
  - 🌱 *First Step*: Complete first study session.
  - ⏱️ *Pomodoro Master*: Complete 5+ focus sessions.
  - 🎯 *Task Crusher*: Finish 3+ assignments.
  - 🏆 *Quiz Champion*: Score 80%+ on any quiz.
  - 🔥 *Consistent Scholar*: Maintain a 3-day streak.
  - 📡 *Network Architect*: Create 2+ Data Comm notes.
  - 🚀 *Study Marathon*: Log over 10 hours of focused study.

### 12. Settings & Data Portability
- **Profile Customization**: Edit student credentials, college name, and target hours.
- **Theme Switcher**: Instant toggle between Light Mode and eye-friendly Dark Mode.
- **Audio Controls**: Enable or mute timer sound effects.
- **JSON Data Backup & Restore**: Export complete student database as `.json` and restore on any browser.
- **Factory Reset**: Revert back to the default showcase dataset anytime.

---

## 🚀 5. How to Run the Project in VS Code

### Method 1: Using VS Code Live Server (Recommended)
1. Open **Visual Studio Code**.
2. Select **File > Open Folder...** and choose the `AI-Study-Planner` folder.
3. Install the **Live Server** extension (by Ritwick Dey) from the VS Code Extensions marketplace (`Ctrl+Shift+X`).
4. Right-click on `index.html` in the Explorer pane and click **"Open with Live Server"**.
5. Your default browser will launch at `http://127.0.0.1:5500/index.html`.

### Method 2: Direct Browser Launch (Completely Offline)
1. Navigate to the `AI-Study-Planner` folder in Windows File Explorer.
2. Double-click `index.html` (or right-click > **Open with > Google Chrome / Microsoft Edge**).
3. The application runs immediately with full LocalStorage and Web Audio support!

---

## 🧪 6. Step-by-Step Feature Testing Guide

| Module | Test Steps | Expected Result |
| :--- | :--- | :--- |
| **Authentication** | Click **"One-Click Login as Demo Student"** in the auth modal. | Instantly logs in as Alex Morgan, hydrates topbar profile, and displays pre-seeded demo records. |
| **Dashboard** | Click **"Mark Done"** on any session in Today's Study Timetable. | Session turns green, KPI total hours increases, and toast notification awards +25 XP. |
| **AI Timetable** | Adjust study hours to `6.0`, select `60 Minutes`, and click **"Generate AI Timetable"**. | Synthesizes an updated weekly plan, doubling frequency for Data Communication due to the upcoming exam. |
| **AI Assistant** | Click the suggestion chip **"Explain Nyquist Bit Rate and Shannon Capacity formulas"**. | Assistant immediately generates formatted markdown detailing both formulas with numerical examples. |
| **Assignment Manager** | Click **"+ New Assignment"**, fill in title and deadline, and submit. | Assignment card appears, pending count increments, and sidebar badge updates automatically. |
| **Digital Notes** | Click **"+ Create Note"**, save note, and click the **💾** icon on the card. | Note downloads immediately to your computer as a `.txt` file. |
| **Focus Timer** | Click **▶ (Play)** on the Pomodoro timer. | Digits count down, SVG circular ring smoothly transitions, and timer title updates. |
| **AI Quiz** | Select "Data Communication", "5 Questions", and click **"Start AI Quiz Now"**. | Question cards appear with options; selecting an option reveals instant answer verification and explanation. |
| **Progress Report** | Navigate to the "Progress Report" view. | Dynamic SVG bars render actual logged hours for Monday through Sunday. |
| **Exam Countdown** | Inspect the "Data Communication Practical" card. | Live timer displays real-time countdown in Days, Hours, and Minutes. |
| **Settings & Theme** | Click the **🌙** button in the topbar or change theme in Settings. | Entire UI transitions into dark blue-gray mode (`[data-theme="dark"]`). |
| **Data Export/Import**| Click **"Export Data to JSON"** in Settings. | Browser downloads `AI_Study_Planner_Backup_[date].json` containing full state backup. |

---

## 🧠 7. Offline Logic & Algorithmic Explanations

1. **Intelligent Timetable Synthesis (`js/timetable.js`)**:
   $$\text{Urgency Weight} = \text{Base Priority} \times (\text{Exam Proximity Multiplier})$$
   Where upcoming exams $\le 7$ days apply a $2.0\times$ multiplier. Available daily hours are partitioned into session slices separated by rest intervals.
2. **Offline NLP Knowledge Matching (`js/assistant.js`)**:
   Uses multi-keyword intent tokenization, regex patterns, and structured pedagogical responses covering the Data Communication syllabus.
3. **Synthetic Chime Generator (`js/timer.js`)**:
   Uses `AudioContext.createOscillator()` to generate pure sine waves at 523.25 Hz (C5), 659.25 Hz (E5), and 783.99 Hz (G5) with exponential decay gains, producing soothing bells without audio files.
4. **Pure SVG Dynamic Charts (`js/progress.js`)**:
   Computes proportional heights and circular stroke dashoffsets ($2\pi r$) directly in JavaScript without heavy third-party charting libraries.

---

## ⚠️ 8. Project Limitations & Academic Scope

- **Browser-Scoped Storage**: LocalStorage is isolated per browser profile. Data does not automatically synchronize across different physical devices unless exported/imported via the built-in JSON backup tool.
- **Simulated Authentication**: Authentication uses client-side state for offline lab demonstration rather than server-side cryptographic hashing.
- **Offline Assistant Scope**: The assistant's knowledge base is focused on Data Communication, Computer Networking, Operating Systems, and study science; it does not access live internet web scrapers.

---

## 🎓 9. Lab Presentation & Viva Voce Quick Reference

- **Q: Why Vanilla JavaScript instead of React or Vue?**  
  *A:* To eliminate build step overhead (Webpack/Vite), ensure 100% offline portability, and achieve instant execution on any browser without node_modules.
- **Q: How are overlaps prevented in the timetable generator?**  
  *A:* A linear time cursor (`currentMinuteCursor`) sequentially advances by `sessionDuration + breakDuration`, guaranteeing disjoint time allocations.
- **Q: How is data consistency maintained across different tabs and reloads?**  
  *A:* `Storage` acts as a centralized single source of truth, reading and writing typed JSON structures directly to HTML5 LocalStorage with schema validation.

---

*Developed for the Data Communication Lab Academic Curriculum.*
