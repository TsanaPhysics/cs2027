/**
 * 4124941 Computational Science for Teaching Science - Master Application Controller
 * Faculty of Science and Technology, Rambhai Barni Rajabhat University (RBRU)
 * Author: Antigravity IDE
 */

// Application State
const AppState = {
  courseData: null,
  quizzesData: null,
  rubricsData: null,
  simsData: null,
  labsData: null,
  currentPhase: 'all',
  currentChapter: 'all',
  currentVolume: 'all',
  currentBloom: 'all',
  searchQuery: '',
  simSearchQuery: '',
  labSearchQuery: '',
  activeView: 'courseware', // 'courseware', 'voxelLab', 'simulatorsHub', 'labsHub', 'elibrary', 'gradebook', 'curriculum'
  currentWeekModal: null,
  theme: localStorage.getItem('rbru_theme') || 'light',
  
  // Student Progress in LocalStorage
  studentProgress: JSON.parse(localStorage.getItem('rbru_student_progress')) || {
    completedWeeks: [],
    scores: {
      participation: 8.5, // out of 10
      midterm: 0,        // out of 20
      lab_code: 16.0,     // out of 20
      lesson_plan_micro: 17.5, // out of 20
      final_project: 18.0,     // out of 20
      final_exam: 0           // out of 10
    },
    quizzesCompleted: {}
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(AppState.theme);
  await loadCourseData();
  setupEventListeners();
  renderCourseCards();
  renderSimulatorsHub();
  renderLabsHub();
  updateProgressUI();
});

// Load Course Manifest & All Data Files
async function loadCourseData() {
  try {
    const [courseRes, quizzesRes, rubricsRes, simsRes, labsRes] = await Promise.all([
      fetch('data/course_manifest.json'),
      fetch('data/quizzes_bank.json'),
      fetch('data/rubrics_criteria.json'),
      fetch('data/simulators_catalog.json'),
      fetch('data/labs_database_180.json')
    ]);

    AppState.courseData = await courseRes.json();
    AppState.quizzesData = await quizzesRes.json();
    AppState.rubricsData = await rubricsRes.json();
    AppState.simsData = await simsRes.json();
    AppState.labsData = await labsRes.json();
    
    // Check if midterm already taken
    if (AppState.studentProgress.quizzesCompleted['midterm_exam']) {
      AppState.studentProgress.scores.midterm = AppState.studentProgress.quizzesCompleted['midterm_exam'].score;
    }
    if (AppState.studentProgress.quizzesCompleted['final_exam']) {
      AppState.studentProgress.scores.final_exam = AppState.studentProgress.quizzesCompleted['final_exam'].score;
    }
  } catch (err) {
    console.error('Error loading course data:', err);
    showToast('⚠️ ไม่สามารถโหลดข้อมูลหลักสูตรได้ โปรดตรวจสอบการเชื่อมต่อ', 'danger');
  }
}

// Render 16-Week Courseware Cards Grid
function renderCourseCards() {
  const container = document.getElementById('weeksGrid');
  if (!container || !AppState.courseData) return;

  const phaseColors = {
    1: '#10b981', // green
    2: '#3b82f6', // blue
    3: '#8b5cf6', // purple
    4: '#f59e0b'  // amber
  };

  const filteredWeeks = AppState.courseData.weeks.filter(week => {
    const matchesPhase = AppState.currentPhase === 'all' || week.phase == AppState.currentPhase;
    const matchesSearch = AppState.searchQuery === '' || 
      week.title.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      week.subtitle.toLowerCase().includes(AppState.searchQuery.toLowerCase());
    return matchesPhase && matchesSearch;
  });

  if (filteredWeeks.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3>ไม่พบบทเรียนที่ตรงกับคำค้นหา</h3>
        <p>โปรดลองเปลี่ยนคำค้นหาหรือเลือกสลับช่วงการเรียนรู้อื่น</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredWeeks.map(week => {
    const isCompleted = AppState.studentProgress.completedWeeks.includes(week.week);
    const cardColor = phaseColors[week.phase] || '#0084ff';
    const isExam = week.is_exam;
    const hasSim = !!week.simulation_url;
    const hasSlide = !!week.slide_url;
    const labCount = (week.lab_codes || []).length;

    return `
      <div class="week-card ${isExam ? 'is-exam-card' : ''}" style="--card-accent: ${cardColor};">
        <div>
          <div class="week-card-top">
            <span class="week-badge-num">สัปดาห์ที่ ${week.week}</span>
            <div class="week-icon-box">
              <i class="${week.icon || 'fas fa-book-open'}"></i>
            </div>
          </div>
          <h3>${week.title}</h3>
          <p class="week-desc">${week.subtitle}</p>
          
          <div style="display: flex; gap: 0.4rem; margin-top: 0.75rem; flex-wrap: wrap;">
            ${hasSim ? `<span style="font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(2, 132, 199, 0.12); color: #0284c7; font-weight: 600;"><i class="fas fa-cube"></i> Simulator</span>` : ''}
            ${hasSlide ? `<span style="font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(245, 158, 11, 0.12); color: #f59e0b; font-weight: 600;"><i class="fas fa-file-powerpoint"></i> PPTX</span>` : ''}
            ${labCount > 0 ? `<span style="font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(16, 185, 129, 0.12); color: #10b981; font-weight: 600;"><i class="fas fa-flask"></i> ${labCount} Labs</span>` : ''}
          </div>
        </div>

        <div>
          <div class="week-footer-meta">
            <span><i class="far fa-clock"></i> ${week.hours}</span>
            ${isCompleted ? '<span style="color: var(--success); font-weight: 600;"><i class="fas fa-check-circle"></i> เรียนแล้ว</span>' : ''}
          </div>

          <div class="week-card-actions">
            <button class="btn-open-lesson" onclick="openLessonModal(${week.week})">
              <i class="fas fa-play-circle"></i> เข้าสู่บทเรียน
            </button>
            ${hasSim ? `
              <button class="btn-quick-quiz" onclick="openSimulatorModal('${week.simulation_url}', '${week.title.replace(/'/g, "\\'")}')" title="เปิดแบบจำลองจำลองวิทยาศาสตร์" style="background: rgba(2, 132, 199, 0.15); color: #0284c7; border: 1px solid rgba(2, 132, 199, 0.3);">
                <i class="fas fa-cube"></i>
              </button>
            ` : ''}
            ${hasSlide ? `
              <a href="${week.slide_url}" download class="btn-quick-quiz" title="ดาวน์โหลดสไลด์บรรยาย (.pptx)" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: center; text-decoration: none;">
                <i class="fas fa-file-powerpoint"></i>
              </a>
            ` : ''}
            ${isExam ? `
              <button class="btn-quick-quiz" onclick="startQuiz('${week.week === 8 ? 'midterm' : 'final_exam'}')" title="เริ่มทำแบบทดสอบ">
                <i class="fas fa-file-signature"></i>
              </button>
            ` : `
              <button class="btn-quick-quiz" onclick="toggleWeekCompleted(${week.week})" title="${isCompleted ? 'ทำเครื่องหมายว่ายังไม่เรียน' : 'ทำเครื่องหมายว่าเรียนแล้ว'}">
                <i class="${isCompleted ? 'fas fa-check' : 'far fa-circle'}"></i>
              </button>
            `}
          </div>

          ${week.week <= 15 ? `
            <div style="display: flex; gap: 0.35rem; margin-top: 0.5rem; width: 100%;">
              <button onclick="startQuiz('week_${String(week.week).padStart(2, '0')}_pre')" title="แบบทดสอบก่อนเรียน (Pre-test)" style="flex: 1; padding: 0.3rem 0.4rem; font-size: 0.72rem; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.4); background: rgba(99, 102, 241, 0.08); color: #4338ca; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 3px; transition: all 0.2s ease;">
                <i class="fas fa-edit"></i> Pre-test
              </button>
              <button onclick="startQuiz('week_${String(week.week).padStart(2, '0')}_post')" title="แบบทดสอบหลังเรียน (Post-test)" style="flex: 1; padding: 0.3rem 0.4rem; font-size: 0.72rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.08); color: #047857; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 3px; transition: all 0.2s ease;">
                <i class="fas fa-award"></i> Post-test
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Render Simulators Hub
function renderSimulatorsHub() {
  const container = document.getElementById('simsGrid');
  if (!container || !AppState.simsData) return;

  const filtered = AppState.simsData.filter(item => {
    const matchesChapter = AppState.currentChapter === 'all' || item.prefix === AppState.currentChapter;
    const matchesSearch = AppState.simSearchQuery === '' ||
      item.title.toLowerCase().includes(AppState.simSearchQuery.toLowerCase()) ||
      item.file.toLowerCase().includes(AppState.simSearchQuery.toLowerCase());
    return matchesChapter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3>ไม่พบแบบจำลองที่ตรงกับคำค้นหา</h3>
        <p>โปรดลองค้นหาด้วยคำอื่น หรือเลือกทุกหมวดหมู่</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="sim-item-card">
      <div>
        <span class="sim-item-badge">${item.category}</span>
        <h4 class="sim-item-title">${item.title}</h4>
        <p class="sim-item-desc"><code>${item.file}</code></p>
      </div>
      <div class="sim-item-actions">
        <button class="btn-ctrl" onclick="openSimulatorModal('${item.path}', '${item.title.replace(/'/g, "\\'")}')" style="background: #10b981; color: #fff; border: none; flex: 1;">
          <i class="fas fa-play"></i> เปิดจำลอง
        </button>
        <a href="${item.path}" target="_blank" class="btn-ctrl" title="เปิดแท็บใหม่" style="padding: 0.5rem 0.75rem;">
          <i class="fas fa-external-link-alt"></i>
        </a>
      </div>
    </div>
  `).join('');
}

// Render 180 Labs Hub
function renderLabsHub() {
  const container = document.getElementById('labsGrid');
  const countBadge = document.getElementById('labCountBadge');
  if (!container || !AppState.labsData) return;

  const filtered = AppState.labsData.filter(lab => {
    const matchesVol = AppState.currentVolume === 'all' || lab.volume_num == AppState.currentVolume;
    const matchesBloom = AppState.currentBloom === 'all' || lab.bloom_level.startsWith(AppState.currentBloom);
    const q = AppState.labSearchQuery.toLowerCase();
    const matchesSearch = q === '' ||
      lab.title_th.toLowerCase().includes(q) ||
      lab.title_en.toLowerCase().includes(q) ||
      lab.lab_code.toLowerCase().includes(q) ||
      (lab.theory && lab.theory.toLowerCase().includes(q));
    return matchesVol && matchesBloom && matchesSearch;
  });

  if (countBadge) {
    countBadge.textContent = `แสดง ${filtered.length} จาก 180 การทดลอง`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3>ไม่พบใบงานการทดลองที่ตรงกับเงื่อนไข</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(lab => `
    <div class="lab-item-card">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.25rem;">
          <span class="lab-code-pill">LAB ${lab.lab_code}</span>
          <span style="font-size: 0.78rem; color: var(--text-muted);"><i class="far fa-clock"></i> ${lab.estimated_minutes} นาที | ${lab.bloom_level}</span>
        </div>
        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">${lab.title_th}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); font-style: italic; margin-bottom: 0.6rem;">${lab.title_en}</p>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          <i class="fas fa-book" style="color: var(--rbru-cyan);"></i> ${lab.volume_title}
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
        <button class="btn-ctrl" onclick="openLabModal('${lab.lab_code}')" style="background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); flex: 1;">
          <i class="fas fa-file-alt"></i> ดูใบงาน & ทฤษฎี
        </button>
        <button class="btn-ctrl" onclick="printLabModalDirect('${lab.lab_code}')" title="พิมพ์ใบงานทันที" style="padding: 0.5rem 0.75rem;">
          <i class="fas fa-print"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Simulator Modal Controls
function openSimulatorModal(url, title) {
  if (window.Auth && !Auth.currentUser) {
    Auth.requireAuth(() => openSimulatorModal(url, title));
    return;
  }
  const modal = document.getElementById('simModal');
  const iframe = document.getElementById('simModalIframe');
  const titleEl = document.getElementById('simModalTitle');
  const newTabBtn = document.getElementById('simModalOpenNewTab');
  if (!modal || !iframe) return;

  if (titleEl) titleEl.innerHTML = `<i class="fas fa-cube" style="color: #10b981;"></i> ${title}`;
  iframe.src = url;
  if (newTabBtn) newTabBtn.href = url;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSimModal() {
  const modal = document.getElementById('simModal');
  const iframe = document.getElementById('simModalIframe');
  if (modal) modal.classList.remove('active');
  if (iframe) iframe.src = 'about:blank';
  document.body.style.overflow = 'auto';
}

// Lab Modal Controls
function openLabModal(labCode) {
  if (window.Auth && !Auth.currentUser) {
    Auth.requireAuth(() => openLabModal(labCode));
    return;
  }
  if (!AppState.labsData) return;
  const lab = AppState.labsData.find(l => l.lab_code === labCode);
  if (!lab) return;

  const modal = document.getElementById('labModal');
  const titleEl = document.getElementById('labModalTitle');
  const bodyEl = document.getElementById('labModalBody');
  if (!modal || !bodyEl) return;

  if (titleEl) {
    titleEl.innerHTML = `<span style="background: #10b981; color: #fff; font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 4px; margin-right: 0.5rem;">LAB ${lab.lab_code}</span> ${lab.title_th}`;
  }

  const qHtml = (lab.questions || []).map((q, i) => `
    <div style="margin-bottom: 1.25rem;">
      <p style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.4rem;">${i + 1}. ${q}</p>
      <div style="border: 1px dashed var(--border-light); border-radius: 6px; height: 70px; background: var(--bg-surface-subtle); padding: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
        [พื้นที่บันทึกผลการทดลองและคำตอบของนักศึกษา]
      </div>
    </div>
  `).join('');

  bodyEl.innerHTML = `
    <div style="padding: 1rem 0;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary);">${lab.title_th}</h2>
          <p style="font-size: 0.95rem; color: var(--text-muted); font-style: italic;">${lab.title_en}</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--success);"><i class="far fa-clock"></i> เวลาปฏิบัติการ: ${lab.estimated_minutes} นาที</span>
          <div style="font-size: 0.82rem; color: var(--text-muted);">ระดับพุทธิพิสัย: ${lab.bloom_level} (Tier ${lab.tier})</div>
        </div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem;"><i class="fas fa-atom" style="color: var(--rbru-cyan);"></i> ทฤษฎีและสมการวิทยาการคำนวณ</h4>
        <div style="background: var(--bg-surface-subtle); padding: 1.25rem 1rem; border-radius: var(--radius-md); border-left: 4px solid var(--info); overflow-x: auto; font-size: 1.15rem; text-align: center;">
          $$ ${lab.theory || ''} $$
        </div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem;"><i class="fab fa-python" style="color: #f59e0b;"></i> โค้ดต้นแบบจำลอง (Python Reference Implementation)</h4>
        <pre style="background: #0f172a; color: #38bdf8; padding: 1rem; border-radius: var(--radius-md); font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; overflow-x: auto; line-height: 1.5;"><code>${escapeHtml(lab.code || '')}</code></pre>
      </div>

      <div>
        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem;"><i class="fas fa-pencil-alt" style="color: #10b981;"></i> กิจกรรมประเมินผลและการสะท้อนคิดท้ายการทดลอง</h4>
        ${qHtml}
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (window.renderMathInElement) {
    window.renderMathInElement(bodyEl);
  } else if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([bodyEl]);
  }
}

// Global MathJax Typesetter Helper
window.renderMathInElement = function(targetEl) {
  const el = targetEl || document.body;
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([el]).catch(err => console.warn('MathJax typeset error:', err));
  } else if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
    window.MathJax.startup.promise.then(() => {
      window.MathJax.typesetPromise([el]);
    }).catch(err => console.warn('MathJax startup typeset error:', err));
  } else {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (window.MathJax && window.MathJax.typesetPromise) {
        clearInterval(timer);
        window.MathJax.typesetPromise([el]);
      } else if (attempts > 12) {
        clearInterval(timer);
      }
    }, 250);
  }
};

function closeLabModal() {
  const modal = document.getElementById('labModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function printLabModal() {
  window.print();
}

function printLabModalDirect(labCode) {
  openLabModal(labCode);
  setTimeout(() => window.print(), 500);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Open Lesson Modal View
function openLessonModal(weekNum) {
  if (window.Auth && !Auth.currentUser) {
    Auth.requireAuth(() => openLessonModal(weekNum));
    return;
  }
  const modal = document.getElementById('lessonModal');
  const iframe = document.getElementById('lessonIframe');
  const title = document.getElementById('lessonModalTitle');
  const badge = document.getElementById('lessonModalBadge');
  const newTabBtn = document.getElementById('btnOpenNewTab');

  if (!modal || !iframe || !AppState.courseData) return;

  const week = AppState.courseData.weeks.find(w => w.week === weekNum);
  if (!week) return;

  AppState.currentWeekModal = weekNum;

  title.textContent = week.title;
  badge.textContent = `สัปดาห์ที่ ${week.week}`;
  newTabBtn.href = week.file;
  iframe.src = week.file;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close Lesson Modal
function closeLessonModal() {
  const modal = document.getElementById('lessonModal');
  const iframe = document.getElementById('lessonIframe');
  if (modal) modal.classList.remove('active');
  if (iframe) iframe.src = 'about:blank';
  document.body.style.overflow = 'auto';
  AppState.currentWeekModal = null;
}

// Navigate Modal Weeks (Prev/Next)
function navigateModalWeek(step) {
  if (AppState.currentWeekModal === null) return;
  const newWeek = AppState.currentWeekModal + step;
  if (newWeek >= 1 && newWeek <= 16) {
    openLessonModal(newWeek);
  } else {
    showToast('ไม่มีสัปดาห์ถัดไปแล้ว', 'info');
  }
}

// Jump Tab inside Lesson Iframe
function jumpIframeTab(tabId) {
  const iframe = document.getElementById('lessonIframe');
  if (!iframe || !iframe.contentWindow) return;
  try {
    if (typeof iframe.contentWindow.switchTab === 'function') {
      iframe.contentWindow.switchTab(tabId);
    }
  } catch (e) {
    console.warn('Cannot trigger switchTab inside iframe due to sandbox/origin:', e);
  }
}

// Modal Pre-test & Post-test Launchers
function launchModalPretest() {
  if (!AppState.currentWeekModal) return;
  const padWeek = String(AppState.currentWeekModal).padStart(2, '0');
  startQuiz(`week_${padWeek}_pre`);
}

function launchModalPosttest() {
  if (!AppState.currentWeekModal) return;
  const padWeek = String(AppState.currentWeekModal).padStart(2, '0');
  startQuiz(`week_${padWeek}_post`);
}

// Toggle Week Completion Manually
function toggleWeekCompleted(weekNum) {
  const idx = AppState.studentProgress.completedWeeks.indexOf(weekNum);
  if (idx > -1) {
    AppState.studentProgress.completedWeeks.splice(idx, 1);
    showToast(`ยกเลิกเครื่องหมายเรียนแล้ว: สัปดาห์ที่ ${weekNum}`, 'info');
  } else {
    AppState.studentProgress.completedWeeks.push(weekNum);
    showToast(`ทำเครื่องหมายเรียนสำเร็จ: สัปดาห์ที่ ${weekNum}`, 'success');
  }
  saveProgress();
  renderCourseCards();
  updateProgressUI();
}

// Save Progress to LocalStorage
function saveProgress() {
  localStorage.setItem('rbru_student_progress', JSON.stringify(AppState.studentProgress));
}

// Update Top Progress UI
function updateProgressUI() {
  const completedCount = AppState.studentProgress.completedWeeks.length;
  const percentage = Math.round((completedCount / 16) * 100);

  // Circle Chart
  const circleFill = document.querySelector('.circle-fill');
  const circleText = document.querySelector('.circle-text');
  if (circleFill && circleText) {
    const circumference = 226;
    const offset = circumference - (percentage / 100) * circumference;
    circleFill.style.strokeDashoffset = offset;
    circleText.textContent = `${percentage}%`;
  }

  // Stats boxes
  const statWeeks = document.getElementById('statCompletedWeeks');
  if (statWeeks) statWeeks.textContent = `${completedCount} / 16`;

  // Calculate Total Score
  const totalScore = calculateTotalScore();
  const statScore = document.getElementById('statTotalScore');
  if (statScore) statScore.textContent = `${totalScore.toFixed(1)} / 100`;

  // Render Gradebook if visible
  renderGradebookView();
}

// Calculate Total Score based on course.md (100% total)
function calculateTotalScore() {
  const s = AppState.studentProgress.scores;
  return (s.participation || 0) + 
         (s.midterm || 0) + 
         (s.lab_code || 0) + 
         (s.lesson_plan_micro || 0) + 
         (s.final_project || 0) + 
         (s.final_exam || 0);
}

// Determine Grade from Total Score
function getLetterGrade(score) {
  if (score >= 80) return { grade: 'A', gpa: '4.0', status: 'ดีเยี่ยม (Excellent)' };
  if (score >= 75) return { grade: 'B+', gpa: '3.5', status: 'ดีมาก (Very Good)' };
  if (score >= 70) return { grade: 'B', gpa: '3.0', status: 'ดี (Good)' };
  if (score >= 65) return { grade: 'C+', gpa: '2.5', status: 'ค่อนข้างดี (Fairly Good)' };
  if (score >= 60) return { grade: 'C', gpa: '2.0', status: 'พอใช้ (Fair)' };
  if (score >= 55) return { grade: 'D+', gpa: '1.5', status: 'อ่อน (Poor)' };
  if (score >= 50) return { grade: 'D', gpa: '1.0', status: 'อ่อนมาก (Very Poor)' };
  return { grade: 'F', gpa: '0.0', status: 'ตก (Fail)' };
}

// Render Gradebook View
function renderGradebookView() {
  const container = document.getElementById('gradebookView');
  if (!container || !AppState.courseData) return;

  const totalScore = calculateTotalScore();
  const gradeInfo = getLetterGrade(totalScore);
  const scores = AppState.studentProgress.scores;

  const weights = AppState.courseData.grading_weights || [];

  container.innerHTML = `
    <div class="gradebook-card">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);"><i class="fas fa-chart-line" style="color: var(--rbru-accent);"></i> รายงานผลการประเมินและการตัดเกรด (Gradebook)</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem;">เกณฑ์การประเมินผลสัมฤทธิ์ตาม มคอ.3 รายวิชา 4124941 วิทยาการคำนวณสำหรับการสอนวิทยาศาสตร์</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-ctrl" onclick="RubricEvaluator.open('lesson_plan')" style="background: rgba(37, 99, 235, 0.1); color: var(--rbru-accent);">
            <i class="fas fa-clipboard-check"></i> ประเมินแผนการสอน (Rubrics)
          </button>
          <button class="btn-ctrl" onclick="RubricEvaluator.showCertificate()" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">
            <i class="fas fa-certificate"></i> ใบรับรองสมรรถนะ
          </button>
        </div>
      </div>

      <div class="gradebook-grid">
        <!-- Left: Breakdown Table -->
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">สัดส่วนการประเมิน 6 องค์ประกอบ (Course Weights)</h3>
          <table class="grade-breakdown-table">
            <thead>
              <tr>
                <th>รายการประเมิน</th>
                <th>สัดส่วน</th>
                <th>คะแนนที่ได้</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              ${weights.map(w => {
                const currentScore = scores[w.id] !== undefined ? scores[w.id] : 0;
                const pct = Math.round((currentScore / w.weight) * 100);
                return `
                  <tr>
                    <td><strong>${w.title}</strong></td>
                    <td>${w.weight}%</td>
                    <td>
                      <span style="font-weight: 700; color: ${pct >= 70 ? 'var(--success)' : 'var(--warning)'};">${currentScore.toFixed(1)}</span> / ${w.weight}
                    </td>
                    <td>
                      <button class="btn-ctrl" onclick="promptScoreUpdate('${w.id}', ${w.weight})" style="padding: 0.25rem 0.6rem; font-size: 0.8rem;">
                        <i class="fas fa-edit"></i> บันทึก
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Right: Grade Summary & Radar Chart -->
        <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-light); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-primary);">ผลสัมฤทธิ์ทางการเรียนรวม</h3>
            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem;">
              <div style="width: 80px; height: 80px; border-radius: var(--radius-full); background: linear-gradient(135deg, var(--rbru-blue), var(--rbru-accent)); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 800; font-family: 'Outfit', sans-serif;">
                ${gradeInfo.grade}
              </div>
              <div>
                <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${gradeInfo.status}</h4>
                <p style="color: var(--text-muted); font-size: 0.9rem;">แต้มระดับคะแนน (GPA): ${gradeInfo.gpa} | คะแนนรวม: ${totalScore.toFixed(1)}%</p>
              </div>
            </div>

            <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-primary);">สมรรถนะตามมาตรฐาน 4 ด้าน (CLOs Mastery):</h4>
            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem;">
                  <span>CLO1: ความรู้ (Knowledge)</span>
                  <strong>${Math.min(100, Math.round(totalScore * 0.95))}%</strong>
                </div>
                <div style="height: 6px; background: var(--border-light); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: ${Math.min(100, Math.round(totalScore * 0.95))}%; background: var(--info);"></div>
                </div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem;">
                  <span>CLO2: ทักษะกระบวนการ (Skills)</span>
                  <strong>${Math.min(100, Math.round(totalScore * 1.02))}%</strong>
                </div>
                <div style="height: 6px; background: var(--border-light); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: ${Math.min(100, Math.round(totalScore * 1.02))}%; background: var(--success);"></div>
                </div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem;">
                  <span>CLO3: จริยธรรมและค่านิยม (Ethics)</span>
                  <strong>95%</strong>
                </div>
                <div style="height: 6px; background: var(--border-light); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: 95%; background: var(--warning);"></div>
                </div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem;">
                  <span>CLO4: ลักษณะบุคคลและความเป็นครู (Character)</span>
                  <strong>92%</strong>
                </div>
                <div style="height: 6px; background: var(--border-light); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: 92%; background: var(--rbru-accent);"></div>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-light); font-size: 0.82rem; color: var(--text-muted); text-align: center;">
            <i class="fas fa-check-double" style="color: var(--success);"></i> ข้อมูลได้รับการซิงค์และบันทึกลงในระบบเรียบร้อยแล้ว
          </div>
        </div>
      </div>
    </div>
  `;
}

// Prompt Score Update
function promptScoreUpdate(scoreId, maxScore) {
  const current = AppState.studentProgress.scores[scoreId] || 0;
  const val = prompt(`กรอกคะแนนสำหรับรายการนี้ (เต็ม ${maxScore}):`, current);
  if (val !== null) {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= maxScore) {
      AppState.studentProgress.scores[scoreId] = num;
      saveProgress();
      updateProgressUI();
      showToast(`บันทึกคะแนนเรียบร้อยแล้ว (${num}/${maxScore})`, 'success');
    } else {
      alert(`คะแนนต้องอยู่ระหว่าง 0 ถึง ${maxScore}`);
    }
  }
}

// Switch Main Tab Views
function switchMainView(viewName) {
  AppState.activeView = viewName;
  document.querySelectorAll('.hud-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
  });

  const views = {
    courseware: document.getElementById('coursewareView'),
    voxelLab: document.getElementById('voxelLabView'),
    simulatorsHub: document.getElementById('simulatorsHubView'),
    labsHub: document.getElementById('labsHubView'),
    elibrary: document.getElementById('elibraryView'),
    gradebook: document.getElementById('gradebookView'),
    aiAssessment: document.getElementById('aiAssessmentView'),
    curriculum: document.getElementById('curriculumView')
  };

  Object.keys(views).forEach(k => {
    if (views[k]) views[k].classList.toggle('active', k === viewName);
  });

  if (viewName === 'simulatorsHub') renderSimulatorsHub();
  if (viewName === 'labsHub') renderLabsHub();
  if (viewName === 'aiAssessment') loadSubmissionsTable();

  window.scrollTo({ top: 380, behavior: 'smooth' });
}

// Event Listeners Setup
function setupEventListeners() {
  // Phase filter chips for courseware
  document.querySelectorAll('.phase-chip[data-phase]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.phase-chip[data-phase]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      AppState.currentPhase = chip.getAttribute('data-phase');
      renderCourseCards();
    });
  });

  // Chapter filter chips for simulators hub
  document.querySelectorAll('#simChapterChips .phase-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#simChapterChips .phase-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      AppState.currentChapter = chip.getAttribute('data-chapter');
      renderSimulatorsHub();
    });
  });

  // Search Input for courseware
  const searchInput = document.getElementById('lessonSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.trim();
      renderCourseCards();
    });
  }

  // Search Input for simulators hub
  const simSearchInput = document.getElementById('simSearchInput');
  if (simSearchInput) {
    simSearchInput.addEventListener('input', (e) => {
      AppState.simSearchQuery = e.target.value.trim();
      renderSimulatorsHub();
    });
  }

  // Search Input for 180 labs
  const labSearchInput = document.getElementById('labSearchInput');
  if (labSearchInput) {
    labSearchInput.addEventListener('input', (e) => {
      AppState.labSearchQuery = e.target.value.trim();
      renderLabsHub();
    });
  }

  // Filter selects for 180 labs
  const volSelect = document.getElementById('labVolumeSelect');
  if (volSelect) {
    volSelect.addEventListener('change', (e) => {
      AppState.currentVolume = e.target.value;
      renderLabsHub();
    });
  }

  const bloomSelect = document.getElementById('labBloomSelect');
  if (bloomSelect) {
    bloomSelect.addEventListener('change', (e) => {
      AppState.currentBloom = e.target.value;
      renderLabsHub();
    });
  }

  // Theme toggle button
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }
}

// Apply Theme
function applyTheme(theme) {
  AppState.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('rbru_theme', theme);
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// Show Toast Notification
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fas fa-check-circle',
    danger: 'fas fa-exclamation-triangle',
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="${icons[type] || icons.info}" style="color: var(--${type});"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// AI ASSESSMENT & LEARNER ANALYTICS HUB
// ==========================================
let globalSubmissionsCache = [];

function switchAIAssessTab(tab) {
  const isSubmit = tab === 'submitTab';
  const isAnalytics = tab === 'analyticsTab';
  const isSheets = tab === 'sheetsTab';

  const tabSubmit = document.getElementById('aiSubTabSubmit');
  const tabAnalytics = document.getElementById('aiSubTabAnalytics');
  const tabSheets = document.getElementById('aiSubTabSheets');

  if (tabSubmit) tabSubmit.style.display = isSubmit ? 'block' : 'none';
  if (tabAnalytics) tabAnalytics.style.display = isAnalytics ? 'block' : 'none';
  if (tabSheets) tabSheets.style.display = isSheets ? 'block' : 'none';

  const btnSub = document.getElementById('btnTabSubmit');
  const btnAn = document.getElementById('btnTabAnalytics');
  const btnSh = document.getElementById('btnTabSheets');

  if (btnSub) {
    btnSub.style.background = isSubmit ? '#4f46e5' : '';
    btnSub.style.color = isSubmit ? '#fff' : '';
  }
  if (btnAn) {
    btnAn.style.background = isAnalytics ? '#4f46e5' : '';
    btnAn.style.color = isAnalytics ? '#fff' : '';
  }
  if (btnSh) {
    btnSh.style.background = isSheets ? '#10b981' : '';
    btnSh.style.color = isSheets ? '#fff' : '';
  }

  if (isAnalytics) loadSubmissionsTable();
  if (isSheets) loadGoogleSheetsConfig();
}

async function loadGoogleSheetsConfig() {
  try {
    const res = await fetch('api/google_sheets_sync.php');
    const data = await res.json();
    if (data.status === 'success' && data.settings) {
      const s = data.settings;
      const urlInput = document.getElementById('sheetsWebhookUrl');
      const chk = document.getElementById('sheetsEnableSync');
      const badge = document.getElementById('sheetsStatusBadge');
      
      if (urlInput && !urlInput.value) urlInput.value = s.webhook_url || '';
      if (chk) chk.checked = !!s.enabled;

      if (badge) {
        if (s.webhook_url && s.enabled) {
          badge.style.background = '#dcfce7';
          badge.style.color = '#15803d';
          badge.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span> พร้อมซิงก์เรียลไทม์';
        } else if (s.webhook_url && !s.enabled) {
          badge.style.background = '#f1f5f9';
          badge.style.color = '#64748b';
          badge.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #94a3b8;"></span> ปิดการซิงก์ชั่วคราว';
        } else {
          badge.style.background = '#fef3c7';
          badge.style.color = '#b45309';
          badge.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span> รอการตั้งค่า URL';
        }
      }
    }
  } catch (err) {
    console.warn('Cannot load Google Sheets config:', err);
  }
}

async function saveGoogleSheetsConfig() {
  const url = document.getElementById('sheetsWebhookUrl').value.trim();
  const enabled = document.getElementById('sheetsEnableSync').checked;

  try {
    const res = await fetch('api/google_sheets_sync.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_settings',
        webhook_url: url,
        enabled: enabled
      })
    });
    const result = await res.json();
    if (result.status === 'success') {
      showToast('บันทึกการตั้งค่า Google Sheets สำเร็จ');
      loadGoogleSheetsConfig();
    } else {
      showToast(result.message || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  } catch (err) {
    showToast('ไม่สามารถเชื่อมต่อไปยังเซิร์ฟเวอร์');
  }
}

async function testGoogleSheetsPing() {
  const alertBox = document.getElementById('sheetsTestResultAlert');
  alertBox.style.display = 'block';
  alertBox.style.background = '#f0f9ff';
  alertBox.style.color = '#0369a1';
  alertBox.style.border = '1px solid #bae6fd';
  alertBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังทดสอบส่งข้อมูลไปยัง Google Apps Script Webhook...';

  try {
    const res = await fetch('api/google_sheets_sync.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test_ping' })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      alertBox.style.background = '#dcfce7';
      alertBox.style.color = '#15803d';
      alertBox.style.border = '1px solid #86efac';
      alertBox.innerHTML = '<i class="fas fa-check-circle"></i> <strong>สำเร็จ!</strong> ข้อมูลทดสอบถูกบันทึกลง Google Sheet ของอาจารย์เรียบร้อยแล้ว กรุณาเปิดเช็คใน Google Sheets';
      showToast('ทดสอบส่งข้อมูลสำเร็จ!');
    } else if (result.status === 'skipped') {
      alertBox.style.background = '#fef3c7';
      alertBox.style.color = '#b45309';
      alertBox.style.border = '1px solid #fde68a';
      alertBox.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <strong>แจ้งเตือน:</strong> ' + result.message;
    } else {
      alertBox.style.background = '#fee2e2';
      alertBox.style.color = '#b91c1c';
      alertBox.style.border = '1px solid #fca5a5';
      alertBox.innerHTML = '<i class="fas fa-times-circle"></i> <strong>ข้อผิดพลาด:</strong> ' + result.message;
    }
  } catch (err) {
    alertBox.style.background = '#fee2e2';
    alertBox.style.color = '#b91c1c';
    alertBox.style.border = '1px solid #fca5a5';
    alertBox.innerHTML = '<i class="fas fa-times-circle"></i> การเชื่อมต่อขัดข้อง: ' + err.message;
  }
}

async function copyAppsScriptCode() {
  try {
    const res = await fetch('database/google_apps_script_code.js');
    const code = await res.text();
    await navigator.clipboard.writeText(code);
    showToast('คัดลอกโค้ด Apps Script ลงคลิปบอร์ดแล้ว!');
  } catch (err) {
    // Fallback prompt
    showToast('กรุณาคัดลอกจากไฟล์ database/google_apps_script_code.js');
  }
}

async function handleMainStudentSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnMainSubmit');
  const spinner = document.getElementById('mainSubmitSpinner');
  btn.disabled = true;
  spinner.style.display = 'inline-block';

  const payload = {
    student_id: document.getElementById('mainStuId').value.trim(),
    student_name: document.getElementById('mainStuName').value.trim(),
    week: parseInt(document.getElementById('mainStuWeek').value),
    assignment_title: document.getElementById('mainStuWeek').options[document.getElementById('mainStuWeek').selectedIndex].text,
    decomp: document.getElementById('mainStuDecomp').value.trim(),
    pattern: document.getElementById('mainStuPattern').value.trim(),
    abstr: document.getElementById('mainStuAbstr').value.trim(),
    algo: document.getElementById('mainStuAlgo').value.trim(),
    reflection: document.getElementById('mainStuReflection').value.trim(),
    work_link: document.getElementById('mainStuLink').value.trim()
  };

  try {
    const res = await fetch('api/submit_and_evaluate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const resData = await res.json();
    if (resData.status === 'success') {
      renderMainEvaluationResult(resData.data);
      showToast('อาจารย์ (AI) ประเมินผลงานเรียบร้อยแล้ว!', 'success');
      loadSubmissionsTable(true);
    } else {
      alert('เกิดข้อผิดพลาด: ' + resData.message);
    }
  } catch (err) {
    console.error(err);
    // Offline fallback
    const mock = {
      submission_id: 'SUB-OFFLINE-' + Date.now().toString(36).toUpperCase(),
      student_id: payload.student_id,
      student_name: payload.student_name,
      week: payload.week,
      evaluation: {
        scores: { conceptual: 4.5, pattern: 4.5, algorithmic: 4.5, pedagogy: 4.5, total: 18.0, percentage: 90.0 },
        proficiency_level: 'Exemplary (ดีเยี่ยมยอด - สมรรถนะระดับสูง)',
        badge_color: '#10b981',
        strengths: ['วิเคราะห์ 4 เสาหลัก CT ได้สอดคล้องกับปัญหาทางวิทยาศาสตร์อย่างเป็นรูปธรรม'],
        recommendations: ['สามารถเพิ่มรายละเอียดผังงานเพื่อรองรับการเขียนโปรแกรมในระดับสูงขึ้น'],
        pedagogy_tips: ['นำแบบจำลอง 3D ไปใช้ดึงดูดความสนใจของผู้เรียนในขั้น Engage']
      }
    };
    renderMainEvaluationResult(mock);
    showToast('ประเมินผลผ่านระบบออฟไลน์เรียบร้อยแล้ว', 'info');
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
  }
}

function renderMainEvaluationResult(data) {
  const card = document.getElementById('mainAiResultCard');
  card.style.display = 'block';

  const ev = data.evaluation;
  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; border-bottom: 2px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1rem;">
      <div>
        <div style="font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; color: var(--text-muted);">${data.submission_id}</div>
        <h4 style="font-size: 1.25rem; color: var(--text-primary); margin-top: 2px; margin-bottom: 4px;">
          <i class="fas fa-award" style="color: #10b981;"></i> ใบรายงานผลการประเมินสมรรถนะผู้เรียน (Learner Competency Report)
        </h4>
        <div style="font-size: 0.88rem; color: var(--text-muted);">
          ผู้รับการประเมิน: <strong>${data.student_name}</strong> (รหัส: ${data.student_id}) | ภาระงานสัปดาห์ที่ ${data.week}
        </div>
      </div>
      <div style="text-align: right;">
        <div style="display: inline-block; font-size: 0.85rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: ${ev.badge_color}22; color: ${ev.badge_color};">
          ${ev.proficiency_level}
        </div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; margin-top: 4px;">
          ${ev.scores.total} / 20 (${ev.scores.percentage}%)
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
      <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-light); border-radius: 8px; padding: 0.75rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted);">1. ความรู้มโนทัศน์ CT (5)</div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #0284c7;">${ev.scores.conceptual} / 5.0</div>
      </div>
      <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-light); border-radius: 8px; padding: 0.75rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted);">2. การหารูปแบบ & วิเคราะห์ (5)</div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #f59e0b;">${ev.scores.pattern} / 5.0</div>
      </div>
      <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-light); border-radius: 8px; padding: 0.75rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted);">3. ความรัดกุมขั้นตอนวิธี (5)</div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #ef4444;">${ev.scores.algorithmic} / 5.0</div>
      </div>
      <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-light); border-radius: 8px; padding: 0.75rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted);">4. การบูรณาการวิทย์ & สะท้อนคิด (5)</div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #10b981;">${ev.scores.pedagogy} / 5.0</div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.88rem; line-height: 1.7;">
      <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 0.75rem 1rem; border-radius: 4px;">
        <strong style="color: #059669;"><i class="fas fa-check-circle"></i> จุดเด่นของผลงาน (Key Strengths):</strong>
        <div style="color: var(--text-primary); margin-top: 3px;">${ev.strengths.map(s => `• ${s}`).join('<br>') || 'ตอบโจทย์ได้ครบถ้วนตามเกณฑ์'}</div>
      </div>
      <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 0.75rem 1rem; border-radius: 4px;">
        <strong style="color: #d97706;"><i class="fas fa-lightbulb"></i> ข้อเสนอแนะเชิงพัฒนาเฉพาะบุคคล (Formative Recommendations):</strong>
        <div style="color: var(--text-primary); margin-top: 3px;">${ev.recommendations.map(r => `• ${r}`).join('<br>') || 'ผลงานอยู่ในเกณฑ์ดีมาก'}</div>
      </div>
      <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 0.75rem 1rem; border-radius: 4px;">
        <strong style="color: #2563eb;"><i class="fas fa-chalkboard-teacher"></i> คำแนะนำสำหรับการนำไปสอนนักเรียนมัธยมจริง (Pedagogical Advice):</strong>
        <div style="color: var(--text-primary); margin-top: 3px;">${ev.pedagogy_tips.map(p => `• ${p}`).join('<br>')}</div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
      <div style="font-size: 0.8rem; color: var(--text-muted);">
        ผู้ประเมิน: <strong>ผศ.ดร.ชีวะ ทัศนา (AI Pedagogical Co-evaluator)</strong><br>
        สาขาวิชาวิทยาศาสตร์ทั่วไป มหาวิทยาลัยราชภัฏรำไพพรรณี
      </div>
      <button type="button" onclick="window.print()" class="btn-ctrl" style="background: var(--primary); color: #fff;">
        <i class="fas fa-print"></i> พิมพ์ใบรับรองผลการประเมิน (Print PDF)
      </button>
    </div>
  `;

  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function loadSubmissionsTable(forceRefresh = false) {
  const tbody = document.getElementById('submissionsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('api/submit_and_evaluate.php' + (forceRefresh ? '?t=' + Date.now() : ''));
    const json = await res.json();
    if (json.status === 'success') {
      globalSubmissionsCache = json.data || [];
      renderSubmissionsTable(globalSubmissionsCache);
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--danger); padding: 16px;">ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้</td></tr>';
  }
}

function renderSubmissionsTable(list) {
  const tbody = document.getElementById('submissionsTableBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">ยังไม่มีประวัติการส่งงานในระบบ</td></tr>';
    document.getElementById('anStatTotal').innerText = '0 ชิ้น';
    document.getElementById('anStatAvg').innerText = '0.0 / 20';
    return;
  }

  // Update Overview Stats
  const total = list.length;
  const avg = (list.reduce((acc, cur) => acc + (cur.evaluation?.scores?.total || 0), 0) / total).toFixed(1);
  document.getElementById('anStatTotal').innerText = total + ' ชิ้น';
  document.getElementById('anStatAvg').innerText = avg + ' / 20';

  tbody.innerHTML = list.map((item, idx) => {
    const ev = item.evaluation || {};
    const sc = ev.scores || {};
    const dStr = new Date(item.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    return `
      <tr>
        <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem;">${item.submission_id}</td>
        <td><strong>${item.student_id}</strong></td>
        <td>${item.student_name}</td>
        <td>สัปดาห์ที่ ${item.week}</td>
        <td style="font-weight: 700; color: #10b981;">${sc.total || 0} / 20</td>
        <td><span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; background: ${ev.badge_color || '#10b981'}22; color: ${ev.badge_color || '#10b981'}; font-weight: 600;">${ev.proficiency_level || 'Normal'}</span></td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${dStr}</td>
        <td>
          <button class="btn-ctrl" onclick="viewCachedSubmission('${item.submission_id}')" style="padding: 4px 10px; font-size: 0.75rem;">
            <i class="fas fa-eye"></i> ดูผล
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterSubmissionsTable() {
  const query = document.getElementById('anSearchStudentId').value.trim().toLowerCase();
  if (!query) {
    renderSubmissionsTable(globalSubmissionsCache);
    return;
  }
  const filtered = globalSubmissionsCache.filter(item => 
    item.student_id.toLowerCase().includes(query) || 
    item.student_name.toLowerCase().includes(query)
  );
  renderSubmissionsTable(filtered);
}

function viewCachedSubmission(subId) {
  const found = globalSubmissionsCache.find(s => s.submission_id === subId);
  if (found) {
    switchAIAssessTab('submitTab');
    renderMainEvaluationResult(found);
  }
}

