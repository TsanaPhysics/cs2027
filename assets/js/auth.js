/**
 * Student Authentication & Registration Manager
 * Course 4124941 Computational Science for Teaching Science, RBRU
 * Author: Antigravity AI
 */

const Auth = {
  currentUser: null,
  pendingAction: null,

  init() {
    // 1. Check cached login
    const cached = localStorage.getItem('cs2027_auth_user');
    if (cached) {
      try {
        this.currentUser = JSON.parse(cached);
      } catch (e) {
        localStorage.removeItem('cs2027_auth_user');
      }
    }

    // 2. Render Navigation Bar
    this.renderNavUI();

    // 3. Verify session with server asynchronously
    this.checkServerSession();
  },

  async checkServerSession() {
    try {
      const res = await fetch('api/auth.php?action=check_session');
      const data = await res.json();
      if (data.status === 'success' && data.user) {
        this.currentUser = data.user;
        localStorage.setItem('cs2027_auth_user', JSON.stringify(data.user));
      } else if (!this.currentUser) {
        this.currentUser = null;
        localStorage.removeItem('cs2027_auth_user');
      }
      this.renderNavUI();
      this.applyUserToForms();
    } catch (e) {
      // offline or relative path
    }
  },

  renderNavUI() {
    const container = document.getElementById('userAuthSection');
    if (!container) return;

    if (this.currentUser) {
      const u = this.currentUser;
      const initials = u.student_id ? u.student_id.slice(-2) : 'ST';
      const color = u.avatar_color || '#0284c7';
      const deptShort = (u.department && u.department.includes('ฟิสิกส์')) ? 'ฟิสิกส์' : 'วิทย์ทั่วไป';

      container.innerHTML = `
        <div class="user-auth-badge" style="display: flex; align-items: center; gap: 0.6rem; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); padding: 0.35rem 0.75rem; border-radius: 999px; border: 1px solid rgba(148, 163, 184, 0.25);">
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${color}; color: #fff; font-weight: 700; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${initials}
          </div>
          <div style="display: flex; flex-direction: column; line-height: 1.15;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${u.student_name}">
              ${u.student_name}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">
              ${u.student_id} • <span style="color: #38bdf8;">${deptShort}</span>
            </div>
          </div>
          <button onclick="Auth.logout()" title="ออกจากระบบ (Logout)" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 6px; padding: 0.3rem 0.5rem; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; display: flex; align-items: center; gap: 4px; margin-left: 4px;">
            <i class="fas fa-sign-out-alt"></i> ออก
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.45rem;">
          <button onclick="Auth.openLoginModal()" class="btn-auth-nav" style="padding: 0.45rem 0.85rem; font-size: 0.82rem; font-weight: 600; border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.5); background: rgba(99, 102, 241, 0.12); color: #818cf8; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;">
            <i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ
          </button>
          <button onclick="Auth.openRegisterModal()" class="btn-auth-nav" style="padding: 0.45rem 0.85rem; font-size: 0.82rem; font-weight: 600; border-radius: 8px; border: 1px solid #10b981; background: #10b981; color: #fff; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
            <i class="fas fa-user-plus"></i> สมัครสมาชิก
          </button>
        </div>
      `;
    }
  },

  applyUserToForms() {
    if (!this.currentUser) return;
    const u = this.currentUser;
    const stuIdInput = document.getElementById('mainStuId');
    const stuNameInput = document.getElementById('mainStuName');
    if (stuIdInput) {
      stuIdInput.value = u.student_id;
      stuIdInput.readOnly = true;
      stuIdInput.style.background = 'rgba(2, 132, 199, 0.08)';
    }
    if (stuNameInput) {
      stuNameInput.value = u.student_name;
      stuNameInput.readOnly = true;
      stuNameInput.style.background = 'rgba(2, 132, 199, 0.08)';
    }
  },

  requireAuth(callback) {
    if (this.currentUser) {
      callback();
      return;
    }
    this.pendingAction = callback;
    this.openAuthRequiredModal();
  },

  openAuthRequiredModal() {
    const modal = document.getElementById('authRequiredModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeAuthRequiredModal() {
    const modal = document.getElementById('authRequiredModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  openLoginModal() {
    this.closeAuthRequiredModal();
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const idInput = document.getElementById('loginStudentId');
      if (idInput) setTimeout(() => idInput.focus(), 150);
    }
  },

  closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  openRegisterModal() {
    this.closeAuthRequiredModal();
    this.closeLoginModal();
    const modal = document.getElementById('registerModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const idInput = document.getElementById('regStudentId');
      if (idInput) setTimeout(() => idInput.focus(), 150);
    }
  },

  closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Quick Demo account filler
  fillDemoAccount(studentId, password) {
    const idEl = document.getElementById('loginStudentId');
    const passEl = document.getElementById('loginPassword');
    if (idEl) idEl.value = studentId;
    if (passEl) passEl.value = password;
  },

  async handleLogin(e) {
    if (e) e.preventDefault();
    const idEl = document.getElementById('loginStudentId');
    const passEl = document.getElementById('loginPassword');
    const errEl = document.getElementById('loginErrorMsg');
    const btnSubmit = document.getElementById('btnLoginSubmit');

    if (errEl) errEl.style.display = 'none';

    const student_id = idEl ? idEl.value.trim() : '';
    const password = passEl ? passEl.value : '';

    if (!student_id || !password) {
      if (errEl) {
        errEl.textContent = 'กรุณากรอกรหัสนักศึกษาและรหัสผ่านให้ครบถ้วน';
        errEl.style.display = 'block';
      }
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...';
    }

    const tryLocalLogin = () => {
      const localUsers = JSON.parse(localStorage.getItem('cs2027_local_users') || '{}');
      const existing = localUsers[student_id];
      if (existing) {
        if (existing.password === password) {
          const { password: _, ...userSafe } = existing;
          this.currentUser = userSafe;
          localStorage.setItem('cs2027_auth_user', JSON.stringify(userSafe));
          this.renderNavUI();
          this.applyUserToForms();
          this.closeLoginModal();
          if (typeof showToast === 'function') {
            showToast(`ยินดีต้อนรับ ${userSafe.student_name} เข้าสู่ระบบ!`, 'success');
          }
          if (this.pendingAction) {
            const act = this.pendingAction;
            this.pendingAction = null;
            act();
          }
          return true;
        } else {
          if (errEl) {
            errEl.textContent = 'รหัสผ่านไม่ถูกต้อง';
            errEl.style.display = 'block';
          }
          return false;
        }
      }

      // Allow demo accounts or direct login
      const demoNames = {
        '6614401001': 'นายชลันธร ดวงดารา',
        '6614401002': 'นางสาวนภัสสร รักษ์วิทย์',
        '6614401003': 'นายธนกฤต วิทยาศาสตร์',
        '6614401004': 'นางสาวปภัสสรา คำนวณศิลป์',
        'chewa.t': 'ผศ.ดร.ชีวะ ทัศนา'
      };
      const userSafe = {
        id: Date.now(),
        student_id: student_id,
        student_name: demoNames[student_id] || ('ผู้เรียน ' + student_id),
        department: 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)',
        role: student_id === 'chewa.t' ? 'teacher' : 'student',
        avatar_color: '#0284c7'
      };
      this.currentUser = userSafe;
      localStorage.setItem('cs2027_auth_user', JSON.stringify(userSafe));
      this.renderNavUI();
      this.applyUserToForms();
      this.closeLoginModal();
      if (typeof showToast === 'function') {
        showToast(`ยินดีต้อนรับ ${userSafe.student_name} เข้าสู่ระบบ!`, 'success');
      }
      if (this.pendingAction) {
        const act = this.pendingAction;
        this.pendingAction = null;
        act();
      }
      return true;
    };

    try {
      const res = await fetch('api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id, password })
      });
      if (!res.ok) {
        throw new Error('Server returned HTTP ' + res.status);
      }
      const data = await res.json();

      if (data.status === 'success' && data.user) {
        this.currentUser = data.user;
        localStorage.setItem('cs2027_auth_user', JSON.stringify(data.user));
        this.renderNavUI();
        this.applyUserToForms();
        this.closeLoginModal();
        if (typeof showToast === 'function') {
          showToast(`ยินดีต้อนรับ ${data.user.student_name} เข้าสู่ระบบ!`, 'success');
        }

        // Execute pending action if any
        if (this.pendingAction) {
          const act = this.pendingAction;
          this.pendingAction = null;
          act();
        }
      } else {
        if (errEl) {
          errEl.textContent = data.message || 'รหัสผ่านไม่ถูกต้อง';
          errEl.style.display = 'block';
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, switching to local offline auth mode:', err);
      tryLocalLogin();
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ';
      }
    }
  },

  async handleRegister(e) {
    if (e) e.preventDefault();
    const idEl = document.getElementById('regStudentId');
    const nameEl = document.getElementById('regStudentName');
    const deptEl = document.getElementById('regDepartment');
    const emailEl = document.getElementById('regEmail');
    const passEl = document.getElementById('regPassword');
    const pass2El = document.getElementById('regPasswordConfirm');
    const errEl = document.getElementById('regErrorMsg');
    const btnSubmit = document.getElementById('btnRegSubmit');

    if (errEl) errEl.style.display = 'none';

    const student_id = idEl ? idEl.value.trim() : '';
    const student_name = nameEl ? nameEl.value.trim() : '';
    const department = deptEl ? deptEl.value : 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)';
    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value : '';
    const passConfirm = pass2El ? pass2El.value : '';

    if (!student_id || !student_name || !password) {
      if (errEl) {
        errEl.textContent = 'กรุณากรอกรหัสนักศึกษา ชื่อ-นามสกุล และรหัสผ่านให้ครบถ้วน';
        errEl.style.display = 'block';
      }
      return;
    }

    if (password !== passConfirm) {
      if (errEl) {
        errEl.textContent = 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน';
        errEl.style.display = 'block';
      }
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังลงทะเบียน...';
    }

    const tryLocalRegister = () => {
      const localUsers = JSON.parse(localStorage.getItem('cs2027_local_users') || '{}');
      const newUser = {
        id: Date.now(),
        student_id: student_id,
        student_name: student_name,
        department: department,
        email: email,
        role: 'student',
        avatar_color: '#10b981',
        created_at: new Date().toISOString()
      };

      localUsers[student_id] = { ...newUser, password: password };
      localStorage.setItem('cs2027_local_users', JSON.stringify(localUsers));

      this.currentUser = newUser;
      localStorage.setItem('cs2027_auth_user', JSON.stringify(newUser));
      this.renderNavUI();
      this.applyUserToForms();
      this.closeRegisterModal();
      if (typeof showToast === 'function') {
        showToast(`ลงทะเบียนและเข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${newUser.student_name}!`, 'success');
      }

      if (this.pendingAction) {
        const act = this.pendingAction;
        this.pendingAction = null;
        act();
      }
      return true;
    };

    try {
      const res = await fetch('api/auth.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id, student_name, department, email, password })
      });
      if (!res.ok) {
        throw new Error('Server returned HTTP ' + res.status);
      }
      const data = await res.json();

      if (data.status === 'success' && data.user) {
        this.currentUser = data.user;
        localStorage.setItem('cs2027_auth_user', JSON.stringify(data.user));
        this.renderNavUI();
        this.applyUserToForms();
        this.closeRegisterModal();
        if (typeof showToast === 'function') {
          showToast(`ลงทะเบียนและเข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${data.user.student_name}!`, 'success');
        }

        // Execute pending action if any
        if (this.pendingAction) {
          const act = this.pendingAction;
          this.pendingAction = null;
          act();
        }
      } else {
        if (errEl) {
          errEl.textContent = data.message || 'ไม่สามารถลงทะเบียนได้';
          errEl.style.display = 'block';
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, switching to local registration mode:', err);
      tryLocalRegister();
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fas fa-user-plus"></i> ยืนยันการสมัครสมาชิก';
      }
    }
  },

  async logout() {
    try {
      await fetch('api/auth.php?action=logout');
    } catch (e) {
      // ignore
    }
    this.currentUser = null;
    localStorage.removeItem('cs2027_auth_user');
    this.renderNavUI();
    const stuIdInput = document.getElementById('mainStuId');
    const stuNameInput = document.getElementById('mainStuName');
    if (stuIdInput) { stuIdInput.value = ''; stuIdInput.readOnly = false; stuIdInput.style.background = ''; }
    if (stuNameInput) { stuNameInput.value = ''; stuNameInput.readOnly = false; stuNameInput.style.background = ''; }
    if (typeof showToast === 'function') {
      showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    }
  }
};

window.Auth = Auth;
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});

