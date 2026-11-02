/**
 * 4124941 Computational Science for Teaching Science - Rubric Evaluator & Certificate Generator
 * Faculty of Science and Technology, Rambhai Barni Rajabhat University (RBRU)
 * Author: Antigravity IDE
 */

const RubricEvaluator = {
  activeRubricId: null,
  activeTargetKey: null,
  currentSelections: {},

  // Open Rubric Modal
  open(targetKey) {
    if (!AppState.rubricsData || !AppState.rubricsData.rubrics) {
      showToast('⚠️ ไม่พบข้อมูลเกณฑ์การประเมิน', 'warning');
      return;
    }

    // Mapping score key to rubric
    const map = {
      'lab_code': 'rubric_lab',
      'lesson_plan_micro': 'rubric_microteaching',
      'final_project': 'rubric_final_project'
    };

    const rubricId = map[targetKey] || 'rubric_lab';
    const rubric = AppState.rubricsData.rubrics.find(r => r.id === rubricId);
    if (!rubric) return;

    this.activeRubricId = rubricId;
    this.activeTargetKey = targetKey;
    this.currentSelections = {};

    // Pre-fill with default excellent
    rubric.criteria.forEach((crit, idx) => {
      this.currentSelections[idx] = 'excellent';
    });

    const modal = document.getElementById('rubricModal');
    if (!modal) return;

    this.render(rubric);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  // Render Rubric Table
  render(rubric) {
    const titleEl = document.getElementById('rubricModalTitle');
    const bodyEl = document.getElementById('rubricModalBody');
    if (!titleEl || !bodyEl) return;

    titleEl.textContent = rubric.title;

    bodyEl.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
        คลิกเลือกระดับคุณภาพในแต่ละเกณฑ์เพื่อคำนวณคะแนนตามสภาพจริง (Authentic Assessment) แล้วกดบันทึกคะแนนเข้าสู่สมุดเกรด
      </p>

      <div style="overflow-x: auto;">
        <table class="grade-breakdown-table" style="font-size: 0.9rem;">
          <thead>
            <tr>
              <th style="min-width: 180px;">ประเด็นการประเมิน (น้ำหนัก)</th>
              <th style="min-width: 160px;">ดีมาก (4 แต้ม)</th>
              <th style="min-width: 160px;">ดี (3 แต้ม)</th>
              <th style="min-width: 160px;">พอใช้ (2 แต้ม)</th>
              <th style="min-width: 160px;">ปรับปรุง (1 แต้ม)</th>
            </tr>
          </thead>
          <tbody>
            ${rubric.criteria.map((crit, idx) => {
              const currentLvl = this.currentSelections[idx];
              return `
                <tr>
                  <td>
                    <strong>${crit.name}</strong>
                    <div style="font-size: 0.8rem; color: var(--rbru-accent); font-weight: 600;">น้ำหนัก: ${crit.weight}%</div>
                  </td>
                  ${['excellent', 'good', 'fair', 'poor'].map(lvl => {
                    const isSelected = currentLvl === lvl;
                    return `
                      <td style="cursor: pointer; transition: all 0.2s; background: ${isSelected ? 'rgba(0, 132, 255, 0.12)' : 'transparent'}; border: ${isSelected ? '2px solid var(--rbru-accent)' : '1px solid var(--border-light)'}; border-radius: 6px;" onclick="RubricEvaluator.selectLevel(${idx}, '${lvl}')">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; font-weight: 700; color: ${isSelected ? 'var(--rbru-accent)' : 'inherit'};">
                          <i class="${isSelected ? 'fas fa-dot-circle' : 'far fa-circle'}"></i>
                          ${lvl === 'excellent' ? 'ดีมาก (100%)' : lvl === 'good' ? 'ดี (75%)' : lvl === 'fair' ? 'พอใช้ (50%)' : 'ปรับปรุง (25%)'}
                        </div>
                        <div style="font-size: 0.82rem; line-height: 1.4; color: var(--text-secondary);">
                          ${crit.levels[lvl]}
                        </div>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-subtle); padding: 1.25rem 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-light); flex-wrap: wrap; gap: 1rem;">
        <div>
          <span style="font-size: 0.9rem; color: var(--text-muted); display: block;">คะแนนคำนวณสุทธิ (เต็ม 20 คะแนน):</span>
          <strong id="rubricCalculatedScore" style="font-size: 1.8rem; color: var(--success); font-family: 'Outfit', sans-serif;">20.0 / 20.0</strong>
        </div>
        <div>
          <button class="btn-primary" onclick="RubricEvaluator.saveScore()">
            <i class="fas fa-save"></i> บันทึกผลการประเมินลงใน Gradebook
          </button>
        </div>
      </div>
    `;

    this.calculateScore(rubric);
  },

  // Select Level
  selectLevel(critIdx, level) {
    this.currentSelections[critIdx] = level;
    const rubric = AppState.rubricsData.rubrics.find(r => r.id === this.activeRubricId);
    if (rubric) this.render(rubric);
  },

  // Calculate Score
  calculateScore(rubric) {
    const levelMultipliers = {
      'excellent': 1.0,
      'good': 0.75,
      'fair': 0.50,
      'poor': 0.25
    };

    let totalPercent = 0;
    rubric.criteria.forEach((crit, idx) => {
      const lvl = this.currentSelections[idx] || 'excellent';
      const mult = levelMultipliers[lvl];
      totalPercent += (crit.weight * mult);
    });

    // Score out of 20
    const finalScore = (totalPercent / 100) * 20;
    const scoreEl = document.getElementById('rubricCalculatedScore');
    if (scoreEl) {
      scoreEl.textContent = `${finalScore.toFixed(1)} / 20.0 (${totalPercent.toFixed(0)}%)`;
    }
    return finalScore;
  },

  // Save Score
  saveScore() {
    const rubric = AppState.rubricsData.rubrics.find(r => r.id === this.activeRubricId);
    if (!rubric) return;

    const finalScore = this.calculateScore(rubric);
    AppState.studentProgress.scores[this.activeTargetKey] = finalScore;
    saveProgress();
    updateProgressUI();

    showToast(`บันทึกคะแนน ${rubric.title} เรียบร้อยแล้ว: ${finalScore.toFixed(1)} คะแนน`, 'success');
    this.close();
  },

  // Close Modal
  close() {
    const modal = document.getElementById('rubricModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Global helper
function openRubricModal(targetKey) {
  RubricEvaluator.open(targetKey);
}

// Certificate Modal Open
function openCertificateModal() {
  const modal = document.getElementById('certificateModal');
  const certBody = document.getElementById('certificateModalBody');
  if (!modal || !certBody) return;

  const totalScore = calculateTotalScore();
  const gradeInfo = getLetterGrade(totalScore);
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  certBody.innerHTML = `
    <div style="background: #ffffff; color: #0b192c; padding: 3rem 2.5rem; border-radius: 12px; border: 12px solid #1e3e62; box-shadow: 0 10px 40px rgba(0,0,0,0.25); text-align: center; position: relative; font-family: 'Sarabun', sans-serif;">
      
      <!-- Watermark / Background Accent -->
      <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.04; pointer-events: none;">
        <i class="fas fa-graduation-cap" style="font-size: 20rem; color: #1e3e62;"></i>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 1.8rem; font-weight: 800; color: #0b192c; letter-spacing: 0.05em; font-family: 'Outfit', sans-serif;">RAMBHAI BARNI RAJABHAT UNIVERSITY</div>
        <div style="font-size: 1.2rem; font-weight: 600; color: #1e3e62;">คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏรำไพพรรณี</div>
      </div>

      <div style="font-size: 2.2rem; font-weight: 800; color: #ffb200; margin-bottom: 0.5rem; font-family: 'Outfit', sans-serif; text-transform: uppercase;">
        CERTIFICATE OF ACHIEVEMENT
      </div>
      <p style="font-size: 1.05rem; color: #475569; margin-bottom: 1.75rem;">ประกาศนียบัตรนี้รับรองว่าผู้เรียนได้ผ่านการประเมินสมรรถนะครบถ้วนในรายวิชา</p>

      <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 1.25rem; margin: 0 auto 1.75rem; max-width: 600px;">
        <h3 style="font-size: 1.35rem; font-weight: 700; color: #0b192c; margin-bottom: 0.25rem;">
          4124941 วิทยาการคำนวณสำหรับการสอนวิทยาศาสตร์
        </h3>
        <p style="font-size: 0.95rem; color: #1e3e62; font-family: 'Outfit', sans-serif; font-weight: 500;">
          Computational Science for Teaching Science (3 หน่วยกิต)
        </p>
      </div>

      <div style="display: flex; justify-content: center; gap: 3rem; margin-bottom: 2.5rem; flex-wrap: wrap;">
        <div>
          <span style="font-size: 0.85rem; color: #64748b; display: block;">คะแนนรวมทั้งสิ้น</span>
          <strong style="font-size: 1.75rem; color: #0b192c; font-family: 'Outfit', sans-serif;">${totalScore.toFixed(1)} / 100</strong>
        </div>
        <div>
          <span style="font-size: 0.85rem; color: #64748b; display: block;">ระดับผลการเรียน</span>
          <strong style="font-size: 1.75rem; color: #ffb200; font-family: 'Outfit', sans-serif;">เกรด ${gradeInfo.grade} (${gradeInfo.gpa})</strong>
        </div>
        <div>
          <span style="font-size: 0.85rem; color: #64748b; display: block;">สถานะการประเมิน</span>
          <strong style="font-size: 1.75rem; color: #10b981;">ผ่านเกณฑ์มาตรฐาน OBE</strong>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 2rem; padding: 0 2rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <div style="text-align: left; font-size: 0.88rem; color: #64748b;">
          วันที่ออกประกาศนียบัตร: <strong>${dateStr}</strong><br>
          รหัสอ้างอิง: <strong>RBRU-CS2027-${Math.random().toString(36).substring(2, 8).toUpperCase()}</strong>
        </div>
        <div style="text-align: center;">
          <div style="font-family: 'Outfit', cursive; font-size: 1.4rem; color: #1e3e62; font-weight: 700; margin-bottom: 0.25rem;">
            ผศ.ดร.ชีวะ ทัศนา
          </div>
          <div style="font-size: 0.88rem; color: #475569; border-top: 1px solid #94a3b8; padding-top: 0.25rem;">
            (ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา)<br>
            อาจารย์ผู้รับผิดชอบรายวิชาและผู้สอน
          </div>
        </div>
      </div>

    </div>

    <div style="margin-top: 1.5rem; text-align: center;">
      <button class="btn-primary" onclick="window.print()">
        <i class="fas fa-print"></i> พิมพ์ประกาศนียบัตร (Print / PDF)
      </button>
      <button class="btn-ctrl" style="margin-left: 0.75rem;" onclick="closeCertificateModal()">
        <i class="fas fa-times"></i> ปิดหน้าต่าง
      </button>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCertificateModal() {
  const modal = document.getElementById('certificateModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}
