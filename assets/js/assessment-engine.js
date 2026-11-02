/**
 * 4124941 Computational Science for Teaching Science - Assessment & Quiz Engine
 * Faculty of Science and Technology, Rambhai Barni Rajabhat University (RBRU)
 * Author: Antigravity IDE
 */

const QuizEngine = {
  currentQuiz: null,
  currentQuizId: null,
  currentIndex: 0,
  userAnswers: {},
  timerInterval: null,
  secondsRemaining: 0,

  // Start a Quiz
  start(quizId) {
    if (!AppState.quizzesData || !AppState.quizzesData[quizId]) {
      showToast('⚠️ ไม่พบชุดข้อสอบที่ระบุ', 'warning');
      return;
    }

    this.currentQuiz = AppState.quizzesData[quizId];
    this.currentQuizId = quizId;
    this.currentIndex = 0;
    this.userAnswers = {};
    this.secondsRemaining = (this.currentQuiz.time_limit_minutes || 30) * 60;

    const modal = document.getElementById('quizModal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    this.renderHeader();
    this.renderQuestion();
    this.startTimer();
  },

  // Start Countdown Timer
  startTimer() {
    clearInterval(this.timerInterval);
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.secondsRemaining--;
      this.updateTimerDisplay();

      if (this.secondsRemaining <= 0) {
        clearInterval(this.timerInterval);
        alert('⏰ หมดเวลาทำข้อสอบแล้ว! ระบบจะทำการตรวจและส่งคำตอบโดยอัตโนมัติ');
        this.submit();
      }
    }, 1000);
  },

  // Update Timer Badge
  updateTimerDisplay() {
    const timerEl = document.getElementById('quizTimer');
    if (!timerEl) return;
    const mins = Math.floor(this.secondsRemaining / 60);
    const secs = this.secondsRemaining % 60;
    timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // Render Quiz Header
  renderHeader() {
    const titleEl = document.getElementById('quizTitle');
    if (titleEl) titleEl.textContent = this.currentQuiz.title;
  },

  // Render Current Question
  renderQuestion() {
    const body = document.getElementById('quizBody');
    const footer = document.getElementById('quizFooter');
    if (!body || !footer || !this.currentQuiz) return;

    const total = this.currentQuiz.questions.length;
    const q = this.currentQuiz.questions[this.currentIndex];
    const selectedOption = this.userAnswers[this.currentIndex];

    body.innerHTML = `
      <div class="question-indicator">ข้อที่ ${this.currentIndex + 1} จากทั้งหมด ${total} ข้อ (สมรรถนะ: ${q.clo})</div>
      <h3 class="question-text">${q.question}</h3>
      <ul class="options-list">
        ${q.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          return `
            <li>
              <button class="option-btn ${isSelected ? 'selected' : ''}" onclick="QuizEngine.selectOption(${idx})">
                <span class="option-key">${letter}</span>
                <span>${opt}</span>
              </button>
            </li>
          `;
        }).join('')}
      </ul>
    `;

    if (window.renderMathInElement) {
      window.renderMathInElement(body);
    }

    // Render Footer Controls
    footer.innerHTML = `
      <div>
        <button class="btn-ctrl" onclick="QuizEngine.prevQuestion()" ${this.currentIndex === 0 ? 'disabled style="opacity: 0.5;"' : ''}>
          <i class="fas fa-chevron-left"></i> ข้อก่อนหน้า
        </button>
      </div>
      <div style="display: flex; gap: 0.75rem;">
        ${this.currentIndex < total - 1 ? `
          <button class="btn-primary" onclick="QuizEngine.nextQuestion()">
            ข้อถัดไป <i class="fas fa-chevron-right"></i>
          </button>
        ` : `
          <button class="btn-primary" style="background: linear-gradient(135deg, #10b981, #059669);" onclick="QuizEngine.confirmSubmit()">
            <i class="fas fa-paper-plane"></i> ส่งข้อสอบและดูผลการประเมิน
          </button>
        `}
      </div>
    `;
  },

  // Select Option
  selectOption(optIdx) {
    this.userAnswers[this.currentIndex] = optIdx;
    this.renderQuestion();
  },

  // Next Question
  nextQuestion() {
    if (this.currentIndex < this.currentQuiz.questions.length - 1) {
      this.currentIndex++;
      this.renderQuestion();
    }
  },

  // Previous Question
  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderQuestion();
    }
  },

  // Confirm Submit
  confirmSubmit() {
    const answeredCount = Object.keys(this.userAnswers).length;
    const total = this.currentQuiz.questions.length;
    if (answeredCount < total) {
      if (!confirm(`คุณตอบข้อสอบไปแล้ว ${answeredCount} จาก ${total} ข้อ ยังมีข้อที่ยังไม่ได้ตอบ ต้องการยืนยันการส่งข้อสอบหรือไม่?`)) {
        return;
      }
    }
    this.submit();
  },

  // Submit and Calculate Score
  submit() {
    clearInterval(this.timerInterval);

    let correctCount = 0;
    const total = this.currentQuiz.questions.length;
    const reviewDetails = [];

    this.currentQuiz.questions.forEach((q, idx) => {
      const userChoice = this.userAnswers[idx];
      const isCorrect = userChoice === q.correct_index;
      if (isCorrect) correctCount++;

      reviewDetails.push({
        question: q.question,
        userChoice: userChoice !== undefined ? q.options[userChoice] : 'ไม่ได้ตอบ',
        correctChoice: q.options[q.correct_index],
        isCorrect: isCorrect,
        explanation: q.explanation,
        clo: q.clo
      });
    });

    const percentage = Math.round((correctCount / total) * 100);
    const weight = this.currentQuizId === 'midterm' ? 20 : 10;
    const scaledScore = (percentage / 100) * weight;

    // Save Score to AppState
    if (this.currentQuizId === 'midterm') {
      AppState.studentProgress.scores.midterm = scaledScore;
    } else if (this.currentQuizId === 'final_exam') {
      AppState.studentProgress.scores.final_exam = scaledScore;
    }

    AppState.studentProgress.quizzesCompleted[this.currentQuizId] = {
      score: scaledScore,
      percentage: percentage,
      completedAt: new Date().toISOString()
    };

    saveProgress();
    updateProgressUI();

    // Render Result View in Dialog
    this.renderResultView(correctCount, total, percentage, scaledScore, weight, reviewDetails);
  },

  // Render Result Screen
  renderResultView(correct, total, percentage, scaledScore, weight, details) {
    const body = document.getElementById('quizBody');
    const footer = document.getElementById('quizFooter');
    if (!body || !footer) return;

    const isPassed = percentage >= (this.currentQuiz.pass_percentage || 60);

    body.innerHTML = `
      <div class="quiz-result-view">
        <div class="result-badge-icon" style="background: ${isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isPassed ? '#10b981' : '#ef4444'};">
          <i class="${isPassed ? 'fas fa-trophy' : 'fas fa-times-circle'}"></i>
        </div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">
          ${isPassed ? '🎉 ยินดีด้วย! คุณผ่านเกณฑ์การประเมิน' : '⚠️ ยังไม่ผ่านเกณฑ์การประเมิน'}
        </h2>
        <div class="result-score-num">${scaledScore.toFixed(1)} <span style="font-size: 1.2rem; color: var(--text-muted); font-weight: 500;">/ ${weight} คะแนน</span></div>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">
          ทำถูก ${correct} จาก ${total} ข้อ (คิดเป็น ${percentage}%) | บันทึกคะแนนลงในสมุดเกรดเรียบร้อยแล้ว
        </p>

        <div style="text-align: left; background: var(--bg-surface-subtle); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-light); margin-top: 1.5rem;">
          <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">
            <i class="fas fa-list-check" style="color: var(--rbru-accent);"></i> เฉลยและคำอธิบายรายข้อ
          </h4>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${details.map((d, i) => `
              <div style="padding: 1rem; border-radius: var(--radius-md); background: var(--bg-surface); border-left: 4px solid ${d.isCorrect ? '#10b981' : '#ef4444'};">
                <div style="font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">
                  ข้อที่ ${i + 1}: ${d.question}
                </div>
                <div style="font-size: 0.88rem; margin-bottom: 0.25rem;">
                  คำตอบของคุณ: <strong style="color: ${d.isCorrect ? '#10b981' : '#ef4444'};">${d.userChoice}</strong>
                  ${!d.isCorrect ? ` | คำตอบที่ถูกต้อง: <strong style="color: #10b981;">${d.correctChoice}</strong>` : ''}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted); background: var(--bg-surface-subtle); padding: 0.5rem 0.75rem; border-radius: 4px; margin-top: 0.4rem;">
                  💡 <strong>คำอธิบาย:</strong> ${d.explanation} (${d.clo})
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.renderMathInElement) {
      window.renderMathInElement(body);
    }

    footer.innerHTML = `
      <div></div>
      <div>
        <button class="btn-primary" onclick="QuizEngine.close()">
          <i class="fas fa-check"></i> เสร็จสิ้นและกลับสู่หน้าหลัก
        </button>
      </div>
    `;
  },

  // Close Quiz Modal
  close() {
    clearInterval(this.timerInterval);
    const modal = document.getElementById('quizModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Global helper to trigger quiz
function startQuiz(quizId) {
  if (window.Auth && !Auth.currentUser) {
    Auth.requireAuth(() => QuizEngine.start(quizId));
    return;
  }
  QuizEngine.start(quizId);
}
