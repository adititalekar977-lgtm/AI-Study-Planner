/**
 * AI STUDY PLANNER - AI STUDY ASSISTANT MODULE
 * Offline Intelligent Pattern-Matching & Educational Knowledge Engine.
 * Tailored for Data Communication Lab and College Productivity.
 */

const Assistant = {
  // Knowledge Base with Intent Matching and Structured Responses
  knowledgeBase: [
    {
      keywords: ['osi', '7 layers', 'osi model', 'layers'],
      title: 'OSI 7-Layer Reference Model',
      response: `The **Open Systems Interconnection (OSI)** model standardizes network communication into 7 distinct architectural layers:

1. **Physical Layer**: Bit-level transmission over physical media (voltages, pins, cables, hubs).
2. **Data Link Layer**: Node-to-node framing, physical MAC addressing, flow & error control (CRC, Ethernet, switches).
3. **Network Layer**: Packet routing across internetworks, logical IP addressing (IPv4, IPv6, ICMP, routers).
4. **Transport Layer**: End-to-end process communication, reliability, multiplexing (TCP, UDP, ports).
5. **Session Layer**: Dialog establishment, maintenance, synchronization tokens (RPC, NetBIOS).
6. **Presentation Layer**: Data formatting, character encoding (ASCII), encryption/decryption (SSL/TLS), compression.
7. **Application Layer**: User interface & network applications (HTTP, DNS, FTP, SMTP, SSH).

💡 **Mnemonic to remember:** *"Please Do Not Throw Sausage Pizza Away"* (Physical to Application) or *"All People Seem To Need Data Processing"* (Application to Physical).`
    },
    {
      keywords: ['tcp vs udp', 'tcp', 'udp', 'difference between tcp and udp'],
      title: 'TCP vs. UDP Comparison',
      response: `Here is the core breakdown between the two primary Transport Layer protocols:

| Feature | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
| :--- | :--- | :--- |
| **Connection Type** | Connection-oriented (3-way handshake) | Connectionless (fire-and-forget) |
| **Reliability** | Guaranteed delivery (acknowledgments, retransmission) | Unreliable (best-effort delivery, packets may drop) |
| **Header Size** | 20 to 60 bytes | Lightweight 8 bytes |
| **Flow & Congestion Control** | Supported (Sliding window, AIMD) | None |
| **Speed** | Slower due to handshakes and ACKs | Extremely fast, minimal latency |
| **Ideal For** | Web browsing (HTTP/HTTPS), File transfer (FTP), Email (SMTP) | Live video streaming (VoIP), Gaming, DNS queries |

💡 **Exam Tip:** Use TCP when data accuracy is non-negotiable; choose UDP when real-time low latency matters more than occasional lost packets.`
    },
    {
      keywords: ['shannon', 'nyquist', 'capacity', 'bit rate', 'channel capacity'],
      title: 'Nyquist Bit Rate vs. Shannon Channel Capacity',
      response: `In Data Communication, these two theorems define theoretical channel limits:

1. **Nyquist Bit Rate (Noiseless Channel):**
   $$BitRate = 2 \\times B \\times \\log_2(L)$$
   - $B$ = Bandwidth of the channel in Hertz (Hz)
   - $L$ = Number of discrete signal levels used to represent data
   - Defines the maximum data rate when no noise interferes.

2. **Shannon Channel Capacity (Noisy Channel):**
   $$C = B \\times \\log_2(1 + SNR)$$
   - $C$ = Theoretical upper bound of channel capacity in bps
   - $B$ = Channel bandwidth (Hz)
   - $SNR$ = Signal-to-Noise Ratio (linear ratio: $P_{signal} / P_{noise}$)
   - Note: If given in decibels: $SNR_{dB} = 10 \\times \\log_{10}(SNR_{linear})$.

💡 **Key Takeaway:** Shannon gives the physical limit regardless of signal design; Nyquist tells how many signal levels ($L$) you must synthesize to achieve that rate.`
    },
    {
      keywords: ['crc', 'cyclic redundancy check', 'error detection', 'polynomial'],
      title: 'Cyclic Redundancy Check (CRC)',
      response: `**Cyclic Redundancy Check (CRC)** is a powerful error-detecting polynomial division technique used in Data Link layer framing (e.g., Ethernet FCS).

**How it works step-by-step:**
1. A generator polynomial $G(x)$ of degree $r$ is agreed upon by sender and receiver.
2. Sender appends $r$ zero bits to the original data block.
3. The appended data is divided by $G(x)$ using **Modulo-2 Binary Arithmetic** (XOR operations, without carries or borrows).
4. The $r$-bit remainder is the CRC checksum, replacing the appended zero bits.
5. Receiver divides the incoming frame by the identical $G(x)$. If the remainder equals $0$, no bit errors were detected!

💡 **Data Comm Lab Tip:** Common generator standards include CRC-16 ($x^{16} + x^{15} + x^2 + 1$) and CRC-32 (Ethernet).`
    },
    {
      keywords: ['pomodoro', 'focus', 'time management', 'technique'],
      title: 'Pomodoro Study Strategy',
      response: `The **Pomodoro Technique** boosts concentration and prevents mental burnout:

1. **Choose one specific task** (e.g. solve 3 Data Comm subnetting problems).
2. **Set the Focus Timer to 25 minutes**. Eliminate all notifications and distractions.
3. **Work with intense focus** until the bell chimes.
4. **Take a 5-minute Short Break**. Step away from the screen, stretch, drink water.
5. After 4 consecutive Pomodoros, reward yourself with a **15–30 minute Long Break**.

🎯 *You can launch our built-in Pomodoro timer from the Focus Timer tab on the left sidebar!*`
    },
    {
      keywords: ['feynman', 'active recall', 'spaced repetition', 'study tips', 'revision'],
      title: 'High-Performance Study Frameworks',
      response: `Top research-backed learning techniques for engineering students:

1. **Active Recall**: Test your memory instead of passively re-reading notes. Cover your notes and sketch network flow diagrams from memory.
2. **The Feynman Technique**: Teach the concept (e.g., CRC or TCP Handshake) out loud in plain, simple terms as if explaining to a 10-year-old. Identify gaps where your explanation stumbles.
3. **Spaced Repetition**: Review challenging topics at increasing intervals (Day 1, Day 3, Day 7, Day 14) to permanently lodge them into long-term memory.
4. **Interleaved Practice**: Alternate between subjects (e.g., 60 mins Data Comm, 15 min break, 60 mins Operating Systems) rather than marathon block-study.`
    },
    {
      keywords: ['exam', 'prep', 'prepare', 'stress', 'cram', 'schedule'],
      title: 'Exam Preparation Action Plan',
      response: `Here is a proven 5-step strategy for your upcoming exams:

1. **Prioritize by Deadline & Weight**: Check the **Exam Countdown** tab to see which papers are closest.
2. **Break Down the Syllabus**: Convert broad chapters into small, 45-minute modular checkpoints.
3. **Solve Past Year Papers**: Focus on high-frequency questions (Nyquist/Shannon numericals, OSI layer functions, routing algorithms).
4. **Protect Your Sleep**: 7+ hours of sleep before exam day increases cognitive retrieval speed by up to 30%.
5. **Use our AI Quiz Generator**: Test yourself with 10 random questions right now to spot weak points!`
    },
    {
      keywords: ['multiplexing', 'fdm', 'tdm', 'wdm'],
      title: 'Multiplexing Techniques (FDM vs TDM vs WDM)',
      response: `Multiplexing combines multiple transmission signals over a single shared physical channel:

- **FDM (Frequency Division Multiplexing)**: Divides the total frequency band into non-overlapping sub-bands separated by guard bands (Analog technique, e.g., FM Radio, Cable TV).
- **TDM (Time Division Multiplexing)**: Divides transmission time into synchronized slots. Each user gets the entire bandwidth for a dedicated micro-time slice (Digital technique, e.g., T1 lines).
- **WDM (Wavelength Division Multiplexing)**: Optical variant of FDM used in fiber optics; combines distinct light wavelengths (colors) using prisms or diffraction gratings.`
    },
    {
      keywords: ['flow control', 'sliding window', 'go-back-n', 'selective repeat', 'arq'],
      title: 'Flow & Error Control Protocols (ARQ)',
      response: `Automatic Repeat reQuest (ARQ) handles lost or damaged frames:

1. **Stop-and-Wait ARQ**: Sender transmits one frame and waits for an ACK before sending the next. Simple, but poor link utilization.
2. **Go-Back-N ARQ**: Sender window size $N > 1$, receiver window = 1. If frame $k$ is lost or corrupted, sender retransmits frame $k$ and all subsequent frames in the window.
3. **Selective Repeat ARQ**: Both sender and receiver maintain window size $N > 1$. Only the damaged or lost frames are retransmitted, making it much more bandwidth-efficient at the cost of receiver buffer complexity.`
    }
  ],

  init() {
    this.renderChatHistory();
    this.bindEvents();
  },

  getChatHistory() {
    return Storage.get(STORAGE_KEYS.CHAT, []);
  },

  saveChatHistory(history) {
    Storage.set(STORAGE_KEYS.CHAT, history);
  },

  renderChatHistory() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    const history = this.getChatHistory();
    container.innerHTML = history.map(msg => `
      <div class="chat-msg ${msg.sender === 'user' ? 'user' : 'bot'}">
        <div class="chat-bubble">
          ${this.formatMarkdown(msg.text)}
          <div class="chat-timestamp">${msg.timestamp || ''}</div>
        </div>
      </div>
    `).join('');

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
  },

  formatMarkdown(text) {
    if (!text) return '';
    // Escape HTML special characters for safe rendering of user content
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    return safe
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06); padding:2px 4px; border-radius:4px; font-size:0.85em;">$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  },

  generateResponse(userQuery) {
    const q = userQuery.toLowerCase().trim();

    // Check knowledge base keyword matches
    for (const item of this.knowledgeBase) {
      for (const kw of item.keywords) {
        if (q.includes(kw)) {
          return item.response;
        }
      }
    }

    // Contextual responses based on intent
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hello! 👋 I'm your offline AI Study Assistant. Ask me about **Data Communication concepts** (OSI model, TCP vs UDP, Shannon Theorem, CRC), or ask for **study techniques** (Pomodoro, Feynman technique, exam timetables)!`;
    }

    if (q.includes('thank') || q.includes('thanks')) {
      return `You're very welcome! Keep up the great momentum in your studies. Is there anything else you want to revise?`;
    }

    if (q.includes('schedule') || q.includes('timetable') || q.includes('plan')) {
      return `To generate an optimized study schedule, head over to the **AI Timetable** tab! You can specify your available study hours, session length, and subject priorities, and our algorithm will build an automated daily/weekly plan for you.`;
    }

    if (q.includes('quiz') || q.includes('test')) {
      return `Ready to test your knowledge? Try the **AI Quiz Generator** on the left menu! It has interactive multiple-choice questions on Data Communication, Operating Systems, and Networking with instant explanations.`;
    }

    // Intelligent default fallback with helpful prompts
    return `That's a thoughtful question regarding **"${userQuery}"**. 

Here is what I recommend for your study session:
1. **Define Core Concepts**: Break this topic down into fundamental definitions, formulas, and practical examples.
2. **Review Lab Notes**: Check the **Digital Notes** tab to see if you have logged reference materials for this subject.
3. **Test with Active Recall**: Try explaining this concept out loud or take a practice quiz.

*💡 You can also ask me about: "OSI 7 Layers", "TCP vs UDP", "Nyquist vs Shannon", "CRC error detection", or "Pomodoro study technique"!*`;
  },

  sendMessage(text) {
    if (!text || text.trim() === '') return;

    const userMessage = {
      id: 'chat_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const history = this.getChatHistory();
    history.push(userMessage);
    this.saveChatHistory(history);
    this.renderChatHistory();

    // Simulate realistic response delay
    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.value = '';

    const container = document.getElementById('chatMessagesContainer');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-msg bot';
    typingIndicator.id = 'chatTypingIndicator';
    typingIndicator.innerHTML = `
      <div class="chat-bubble" style="color:var(--text-muted); font-style:italic;">
        AI Assistant is formulating response...
      </div>`;
    if (container) {
      container.appendChild(typingIndicator);
      container.scrollTop = container.scrollHeight;
    }

    setTimeout(() => {
      const indicator = document.getElementById('chatTypingIndicator');
      if (indicator) indicator.remove();

      const botReply = this.generateResponse(text);
      const botMessage = {
        id: 'chat_' + Date.now(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedHistory = this.getChatHistory();
      updatedHistory.push(botMessage);
      this.saveChatHistory(updatedHistory);
      this.renderChatHistory();

      // Give 5 XP for seeking knowledge
      Rewards.addXP(5, 'Engaged with AI Study Assistant');
    }, 450);
  },

  clearChat() {
    if (!confirm('Are you sure you want to clear your chat history?')) return;
    const initialGreeting = [
      {
        id: 'chat_init_1',
        sender: 'bot',
        text: "👋 Chat cleared! I'm ready to assist you with your Data Communication and study planning questions.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    this.saveChatHistory(initialGreeting);
    this.renderChatHistory();
    App.showToast('Chat history cleared.', 'info');
  },

  bindEvents() {
    const sendBtn = document.getElementById('btnSendMessage');
    const chatInput = document.getElementById('chatInput');

    if (sendBtn && chatInput) {
      sendBtn.addEventListener('click', () => {
        this.sendMessage(chatInput.value);
      });

      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage(chatInput.value);
        }
      });
    }

    // Clear Chat Button
    const clearBtn = document.getElementById('btnClearChat');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearChat();
      });
    }

    // Suggested Questions Chips
    const suggestionChips = document.querySelectorAll('.chat-suggestion-chip');
    suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query') || chip.textContent;
        this.sendMessage(query);
      });
    });
  }
};
