/**
 * ============================================================================
 * น้อง LEQs AI Agent (Autonomous Learning Copilot & Voice Assistant)
 * Course: 4124941 Computational Science for Teaching Science
 * Faculty of Science & Technology, Rambhai Barni Rajabhat University (RBRU)
 * Modeled after: LEQs-GLOBE 2570 & Edge xAI : 4DAgriEnvi Architecture
 * ============================================================================
 */

// Global State
let isLeqsChatOpen = false;
let isLeqsVoiceMuted = false;
let currentLeqsLang = 'th';
let isLeqsListening = false;
let speechRecognition = null;
let currentUtterance = null;

// RAG Knowledge Store
const RAG_STORE = {
    course: {
        code: '4124941',
        title_th: 'วิทยาการคำนวณสำหรับการสอนวิทยาศาสตร์',
        title_en: 'Computational Science for Teaching Science',
        institution: 'คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏรำไพพรรณี',
        instructor: 'ผศ.ดร.ชีวะ ทัศนา (Asst. Prof. Dr. Chewa Thassana)',
        email: 'chewa.t@rbru.ac.th',
        phone: '093-742-2654',
        curriculum: 'หลักสูตรครุศาสตรบัณฑิต (ค.บ. 4 ปี) ปรับปรุง พ.ศ. 2567'
    },
    weeks: [],
    labs: [],
    users: []
};

// =========================================================================
// 1. DIGITAL CHIME SYNTHESIZER (WEB AUDIO API)
// =========================================================================
let leqsAudioCtx = null;
function getLeqsAudioContext() {
    try {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioClass) return null;
        if (!leqsAudioCtx || leqsAudioCtx.state === 'closed') {
            leqsAudioCtx = new AudioClass();
        }
        if (leqsAudioCtx.state === 'suspended') {
            leqsAudioCtx.resume().catch(() => {});
        }
        return leqsAudioCtx;
    } catch (e) {
        return null;
    }
}

function playDigitalChime(type = 'start') {
    try {
        const ctx = getLeqsAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'start') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(698.46, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
            osc.start(now);
            osc.stop(now + 0.30);
        } else if (type === 'end') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(698.46, now + 0.10);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.24);
        } else if (type === 'bot') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.26);
        } else if (type === 'tap') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1046.5, now);
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.07);
        } else if (type === 'switch_lang') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(659.25, now);
            osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.20);
        }
    } catch(e) {}
}

// =========================================================================
// 2. LIVE RAG KNOWLEDGE INGESTION
// =========================================================================
async function initRAGKnowledgeBase() {
    try {
        const [manifestRes, labsRes, usersRes] = await Promise.allSettled([
            fetch('data/course_manifest.json').then(r => r.json()),
            fetch('data/labs_database_180.json').then(r => r.json()),
            fetch('data/users.json').then(r => r.json())
        ]);

        if (manifestRes.status === 'fulfilled' && manifestRes.value.weeks) {
            RAG_STORE.weeks = manifestRes.value.weeks;
        }
        if (labsRes.status === 'fulfilled' && Array.isArray(labsRes.value)) {
            RAG_STORE.labs = labsRes.value;
        }
        if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
            RAG_STORE.users = usersRes.value;
        }

        const pill = document.getElementById('leqsRagSyncText');
        if (pill) {
            const wCount = RAG_STORE.weeks.length || 16;
            const lCount = RAG_STORE.labs.length || 180;
            const uCount = (RAG_STORE.users.length ? RAG_STORE.users.length - 1 : 30);
            pill.innerHTML = `RAG Live: ฐานข้อมูลสด (${wCount} สัปดาห์ • ${lCount} Labs • ${uCount} นักศึกษา) ⚡`;
        }
    } catch (err) {
        console.warn('RAG Ingestion fallback:', err);
    }
}

// =========================================================================
// 3. MULTILINGUAL UI DICTIONARY & QUICK CHIPS
// =========================================================================
const I18N_DATA = {
    th: {
        title: 'น้อง LEQs AI Agent',
        dialect: 'สำเนียงจันท์ฮิ',
        subtitle: 'Autonomous Learning Copilot • วิทยาการคำนวณ 4124941',
        bubble: 'มีอะไรให้ <strong>น้อง LEQs</strong> ช่วยเนี่ยฮิ? 🌱🌤️',
        placeholder: 'พิมพ์ถามน้อง LEQs สำเนียงจันท์ได้เลยเนี่ยฮิ...',
        speaking: 'น้อง LEQs กำลังส่งเสียงโทนสตูดิโอ (Studio HD Voice)...',
        welcomeTitle: 'สวัสดีครับ! ยินดีต้อนรับสู่ระบบเรียนรู้วิทยาการคำนวณ 4124941 👋🌱',
        welcomeMsg: `ผมคือ <strong>น้อง LEQs AI Agent</strong> ผู้ช่วยการเรียนรู้อัจฉริยะประจำรายวิชา <strong>4124941 วิทยาการคำนวณสำหรับการสอนวิทยาศาสตร์</strong> คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏรำไพพรรณี!
                    <br><br>
                    ผมเชื่อมต่อระบบ RAG ฐานข้อมูลสดของบทเรียน <strong>16 สัปดาห์, 30 ชุดแบบทดสอบ Pre/Post-test, 180 ใบงานทดลองปฏิบัติการ, และห้องทดลองจำลอง 3D Virtual Lab</strong> สอบถามได้ทุกเรื่องเลยเนี่ยฮิ! 💡`,
        chips: [
            { text: '📝 Pre-test & Post-test', q: 'ระบบแบบทดสอบ Pre-test และ Post-test ทำงานอย่างไร?' },
            { text: '🧩 4 เสาหลัก CT', q: '4 เสาหลักการคิดเชิงคำนวณ Computational Thinking มีอะไรบ้าง?' },
            { text: '📚 16 สัปดาห์เรียน', q: 'สรุปหัวข้อบทเรียนทั้ง 16 สัปดาห์มีอะไรบ้าง?' },
            { text: '🔬 180 ใบงานทดลอง', q: '180 ใบงานทดลองและสมการวิทยาการคำนวณมีอะไรบ้าง?' },
            { text: '🚀 3D & AR Virtual Lab', q: 'ห้องทดลองเสมือนจริง 3D Virtual Lab และระบบตรวจจับมือใช้งานอย่างไร?' },
            { text: '🐍 Python Live Sandbox', q: 'การเขียนโค้ด Python ในเบราว์เซอร์ทำอย่างไร?' },
            { text: '🛡️ ระบบอาจารย์ (Admin)', q: 'ระบบหลังบ้าน Admin CMS สำหรับอาจารย์อยู่ที่ไหนและทำอะไรได้บ้าง?' },
            { text: '👨‍🏫 ติดต่อ อ.ชีวะ', q: 'ขอข้อมูลช่องทางการติดต่อ ผศ.ดร.ชีวะ ทัศนา ผู้สอน' }
        ]
    },
    en: {
        title: 'LEQs AI Copilot',
        dialect: 'Copilot Mode',
        subtitle: 'Autonomous Agentic AI • Computational Science 4124941',
        bubble: 'Need help with <strong>CS Courseware</strong>? 🌱',
        placeholder: 'Ask LEQs AI anything about courseware, labs, or quizzes...',
        speaking: 'LEQs AI is speaking with natural studio voice...',
        welcomeTitle: 'Welcome to Computational Science Portal (4124941)! 👋🌱',
        welcomeMsg: `I am <strong>LEQs AI Copilot</strong>, your autonomous agentic learning companion from Rambhai Barni Rajabhat University (RBRU)!
                    <br><br>
                    Powered by real-time RAG ingestion, I provide instant guidance across <strong>16 Weeks of Courseware, 30 Pre/Post Quizzes, 180 Virtual Labs with LaTeX theories, and interactive 3D WebGL Simulators</strong>!`,
        chips: [
            { text: '📝 Pre/Post Quizzes', q: 'How do the weekly Pre-test and Post-test assessments work?' },
            { text: '🧩 4 Pillars of CT', q: 'Explain the 4 pillars of Computational Thinking with examples' },
            { text: '📚 16-Week Courseware', q: 'Give me an overview of the 16 weekly course topics' },
            { text: '🔬 180 Virtual Labs', q: 'Tell me about the 180 laboratory experiments and LaTeX formulas' },
            { text: '🚀 3D & AR Virtual Lab', q: 'How does the interactive Three.js 3D Virtual Lab operate?' },
            { text: '🐍 Python Live Sandbox', q: 'How to practice Python coding inside the browser?' },
            { text: '🛡️ Admin CMS Portal', q: 'Where is the Instructor Admin CMS and what can it do?' },
            { text: '👨‍🏫 Contact Instructor', q: 'How can I contact Asst. Prof. Dr. Chewa Thassana?' }
        ]
    },
    zh: {
        title: 'LEQs 课程智能助手',
        dialect: '智能教学伙伴',
        subtitle: '自主智能体 • 计算科学教学 4124941',
        bubble: '有什么可以帮您？<strong>LEQs 智能助手</strong>在线 🌱',
        placeholder: '向 LEQs 智能助手咨询课程、实验与测验详情...',
        speaking: 'LEQs 助手正在以高清自然语音播报...',
        welcomeTitle: '欢迎来到科学教学计算思维数字化平台！👋🌱',
        welcomeMsg: `我是 <strong>LEQs 智能助手</strong>，来自泰国兰帕潘尼皇家大学（RBRU）科技学院！
                    <br><br>
                    我已接入本课程实时 RAG 知识库，可为您即时解答：<strong>16 周核心课件、30 份课前/课后测验（Pre/Post-test）、180 份科学计算实验工单（含 LaTeX 公式）及三维虚拟仿真实验室</strong>！`,
        chips: [
            { text: '📝 课前课后测验', q: '每周的 Pre-test 和 Post-test 测验机制是怎样的？' },
            { text: '🧩 计算思维 4 支柱', q: '介绍计算思维（Computational Thinking）的四大核心要素' },
            { text: '📚 16 周核心课件', q: '介绍 16 周学期的主要教学主题与大纲' },
            { text: '🔬 180 份实验工单', q: '介绍 180 份实验与 LaTeX 科学公式库' },
            { text: '🚀 3D 虚拟实验室', q: '如何使用 Three.js 三维虚拟实验与手势识别？' },
            { text: '🐍 网页版 Python 运行', q: '如何在浏览器中即时编写并运行 Python 代码？' },
            { text: '🛡️ 教师后台管理', q: '教师端 Admin CMS 系统在哪里以及具备哪些功能？' },
            { text: '👨‍🏫 联系授课教师', q: '如何联系 Chewa 博士及大学科技学院团队？' }
        ]
    }
};

// =========================================================================
// 4. STUDIO HUMAN VOICE TTS & BROWSER SYNTHESIS
// =========================================================================
function setLeqsLang(lang) {
    if (!I18N_DATA[lang]) return;
    currentLeqsLang = lang;
    playDigitalChime('switch_lang');

    // Update active button state
    ['th', 'en', 'zh'].forEach(l => {
        const btn = document.getElementById(`langBtn${l.charAt(0).toUpperCase() + l.slice(1)}`);
        if (btn) {
            if (l === lang) {
                btn.className = 'px-2 py-0.5 rounded-lg bg-emerald-500 text-white shadow-xs transition font-bold';
            } else {
                btn.className = 'px-2 py-0.5 rounded-lg text-slate-400 hover:text-white transition';
            }
        }
    });

    const dict = I18N_DATA[lang];
    const title = document.getElementById('leqsBotTitle');
    const dialect = document.getElementById('leqsDialectBadge');
    const subtitle = document.getElementById('leqsBotSubtitle');
    const input = document.getElementById('leqsChatInput');
    const bubble = document.getElementById('leqsBubbleText');

    if (title) title.textContent = dict.title;
    if (dialect) dialect.textContent = dict.dialect;
    if (subtitle) subtitle.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>${dict.subtitle}</span>`;
    if (input) input.placeholder = dict.placeholder;
    if (bubble) bubble.innerHTML = dict.bubble;

    renderQuickChips();
    clearLeqsChat(true);
}

function renderQuickChips() {
    const container = document.getElementById('leqsQuickChips');
    if (!container) return;
    const chips = I18N_DATA[currentLeqsLang].chips;
    container.innerHTML = chips.map(c => `
        <button type="button" onclick="sendQuickPrompt('${escapeHtml(c.q)}')" 
            class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-400/30 whitespace-nowrap text-[11px] font-medium transition active:scale-95 shrink-0">
            ${c.text}
        </button>
    `).join('');
}

function toggleLeqsVoice() {
    isLeqsVoiceMuted = !isLeqsVoiceMuted;
    updateVoiceToggleBtn();
    if (isLeqsVoiceMuted) {
        stopLeqsSpeech();
    } else {
        playDigitalChime('tap');
    }
}

function updateVoiceToggleBtn() {
    const btn = document.getElementById('leqsVoiceToggleBtn');
    const icon = document.getElementById('leqsVoiceIcon');
    if (!btn || !icon) return;
    if (isLeqsVoiceMuted) {
        btn.className = 'w-8 h-8 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center text-xs transition border border-rose-500/30';
        icon.className = 'fa-solid fa-volume-xmark';
        btn.title = 'เสียงถูกปิดอยู่ (กดเพื่อเปิดเสียงพูด)';
    } else {
        btn.className = 'w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 hover:text-white flex items-center justify-center text-xs transition';
        icon.className = 'fa-solid fa-volume-high';
        btn.title = 'เปิดเสียงพูดน้อง LEQs (กดเพื่อปิดเสียง)';
    }
}

function speakWithDigitalTone(text) {
    if (isLeqsVoiceMuted || !text) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Strip HTML tags for clean TTS
    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[#*`_~]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 1.05;
    utter.pitch = 1.15; // Cheerful friendly robotic youth pitch

    const langCode = currentLeqsLang === 'th' ? 'th-TH' : (currentLeqsLang === 'zh' ? 'zh-CN' : 'en-US');
    utter.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === langCode || v.lang.startsWith(langCode.slice(0, 2)));
    if (matchedVoice) utter.voice = matchedVoice;

    const indicator = document.getElementById('leqsSpeakingIndicator');
    const mouth = document.getElementById('leqsMouth');

    utter.onstart = () => {
        if (indicator) indicator.classList.remove('hidden');
        if (mouth) mouth.setAttribute('d', 'M44 60 Q50 68 56 60'); // Open talking smile
    };

    utter.onend = () => {
        if (indicator) indicator.classList.add('hidden');
        if (mouth) mouth.setAttribute('d', 'M44 58 Q50 64 56 58'); // Normal smile
    };

    utter.onerror = () => {
        if (indicator) indicator.classList.add('hidden');
        if (mouth) mouth.setAttribute('d', 'M44 58 Q50 64 56 58');
    };

    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
}

function stopLeqsSpeech() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    const indicator = document.getElementById('leqsSpeakingIndicator');
    const mouth = document.getElementById('leqsMouth');
    if (indicator) indicator.classList.add('hidden');
    if (mouth) mouth.setAttribute('d', 'M44 58 Q50 64 56 58');
}

function testLeqsVoice() {
    unlockAudio();
    stopLeqsSpeech();
    playDigitalChime('bot');
    const phrases = {
        th: 'สวัสดีครับอาจารย์และเพื่อนๆ ทุกท่าน! น้อง LEQs AI สำเนียงจันท์ฮิ พร้อมช่วยแนะนำการเรียนวิทยาการคำนวณ 4124941 แล้วเนี่ยฮิ!',
        en: 'Hello! I am LEQs AI Copilot, your learning companion for Computational Science Courseware 4124941!',
        zh: '您好！我是 LEQs 课程智能助手，随时为您解答计算科学 4124941 的所有教学与实验问题！'
    };
    speakWithDigitalTone(phrases[currentLeqsLang] || phrases.th);
}

// =========================================================================
// 5. MODAL TOGGLE & DISPLAY
// =========================================================================
function toggleLeqsChatbot() {
    unlockAudio();
    const modal = document.getElementById('leqsChatbotModal');
    const bubble = document.getElementById('leqsBotSpeechBubble');
    if (!modal) return;

    isLeqsChatOpen = !isLeqsChatOpen;

    if (isLeqsChatOpen) {
        modal.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
        modal.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
        if (bubble) bubble.classList.add('hidden');
        playDigitalChime('start');
        setTimeout(() => {
            const input = document.getElementById('leqsChatInput');
            if (input) input.focus();
        }, 300);
    } else {
        modal.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
        modal.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
        stopLeqsSpeech();
        stopVoiceInput();
        playDigitalChime('end');
    }
}

function unlockAudio() {
    getLeqsAudioContext();
}

// =========================================================================
// 6. RAG RETRIEVAL & INTENT PROCESSING ENGINE
// =========================================================================
function processRAGQuery(rawQuery, lang) {
    const q = rawQuery.toLowerCase().trim();
    const weeks = RAG_STORE.weeks || [];
    const labs = RAG_STORE.labs || [];
    const course = RAG_STORE.course;

    // INTENT 1: PRE-TEST & POST-TEST ASSESSMENTS
    if (q.includes('pre-test') || q.includes('post-test') || q.includes('pretest') || q.includes('posttest') || q.includes('สอบ') || q.includes('แบบทดสอบ') || q.includes('คะแนน') || q.includes('quiz')) {
        return {
            reply: `<div class="space-y-2 text-xs">
                        <div class="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                            <i class="fa-solid fa-file-pen"></i> ระบบแบบทดสอบ Pre-test &amp; Post-test ประจำสัปดาห์ 📝
                        </div>
                        <p class="text-slate-200 leading-relaxed">
                            รายวิชานี้กำหนดให้นักศึกษาทำแบบทดสอบวัดผล 2 ช่วงในทุกสัปดาห์การเรียนรู้ (สัปดาห์ที่ 1-15):
                        </p>
                        <div class="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/30 space-y-2 font-sans text-[11px]">
                            <div class="flex items-start gap-2">
                                <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold shrink-0">Pre-test</span>
                                <div><strong>วัดความรู้เดิมก่อนเรียน (3 ข้อ/สัปดาห์):</strong> ทดสอบกรอบความคิดเดิมเพื่อประเมินความพร้อมก่อนเริ่มเรียน</div>
                            </div>
                            <div class="flex items-start gap-2">
                                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">Post-test</span>
                                <div><strong>วัดผลสัมฤทธิ์และทักษะการคิดขั้นสูง (3 ข้อ/สัปดาห์):</strong> ประเมินตามเกณฑ์ HOTS (วิเคราะห์/ประเมินค่า/สร้างสรรค์) พร้อมเฉลยและ Rubrics ละเอียด</div>
                            </div>
                        </div>
                        <p class="text-slate-400 text-[11px]">
                            กดปุ่มด้านล่างเพื่อเริ่มทำแบบทดสอบตัวอย่างของสัปดาห์ที่ 1 หรือสัปดาห์ที่ 2 ได้ทันทีเนี่ยฮิ! 👇
                        </p>
                    </div>`,
            speechText: `ระบบแบบทดสอบมีทั้ง Pre-test 3 ข้อเพื่อวัดความรู้เดิม และ Post-test 3 ข้อวัดทักษะการคิดขั้นสูงทุกสัปดาห์ กดเลือกทำแบบทดสอบได้เลยเนี่ยฮิ!`,
            actions: [
                { label: 'ทำ Pre-test สัปดาห์ที่ 1', icon: 'fa-solid fa-edit', onclick: "startQuiz('quiz_week_1_pre')" },
                { label: 'ทำ Post-test สัปดาห์ที่ 1', icon: 'fa-solid fa-award', onclick: "startQuiz('quiz_week_1_post')" },
                { label: 'ดูตารางแบบทดสอบทั้งหมด', icon: 'fa-solid fa-list-check', url: '#assessments' }
            ]
        };
    }

    // INTENT 2: 4 PILLARS OF COMPUTATIONAL THINKING (CT)
    if (q.includes('เสาหลัก') || q.includes('4 เสา') || q.includes('ct') || q.includes('computational thinking') || q.includes('การคิดเชิงคำนวณ') || q.includes('abstraction') || q.includes('decomposition')) {
        return {
            reply: `<div class="space-y-2 text-xs">
                        <div class="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                            <i class="fa-solid fa-cubes"></i> 4 เสาหลักการคิดเชิงคำนวณ (Computational Thinking) 🧩
                        </div>
                        <p class="text-slate-200 leading-relaxed text-[11px]">
                            หัวใจสำคัญของการประยุกต์วิทยาการคำนวณเข้ากับการสอนวิทยาศาสตร์ ประกอบด้วย 4 มิติหลัก:
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-sans">
                            <div class="p-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-[11px]">
                                <strong class="text-sky-300 block mb-1">1. Decomposition (การย่อยปัญหา)</strong>
                                <span class="text-slate-300">การแยกปัญหาทางฟิสิกส์/ชีววิทยาที่ซับซ้อนออกเป็นองค์ประกอบย่อยที่จัดการได้</span>
                            </div>
                            <div class="p-2.5 rounded-xl bg-slate-900 border border-teal-500/30 text-[11px]">
                                <strong class="text-teal-300 block mb-1">2. Pattern Recognition (การรู้จำแบบแผน)</strong>
                                <span class="text-slate-300">การสังเกตรูปแบบความสัมพันธ์ของตัวแปร เช่น กราฟการเคลื่อนที่ คาบการแกว่ง</span>
                            </div>
                            <div class="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-[11px]">
                                <strong class="text-indigo-300 block mb-1">3. Abstraction (การคิดเชิงนามธรรม)</strong>
                                <span class="text-slate-300">การตัดรายละเอียดที่ไม่จำเป็นออก สร้างเป็นสูตรคณิตศาสตร์และสมการ เช่น ดัชนี CWSI</span>
                            </div>
                            <div class="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-[11px]">
                                <strong class="text-emerald-300 block mb-1">4. Algorithm Design (การออกแบบขั้นตอนวิธี)</strong>
                                <span class="text-slate-300">การจัดลำดับขั้นตอนการทดลองและการเขียนโปรแกรมประมวลผลทางวิทยาศาสตร์</span>
                            </div>
                        </div>
                    </div>`,
            speechText: `การคิดเชิงคำนวณ 4 เสาหลักประกอบด้วย ดีคอมโพสิชัน แพทเทิร์นเรคอกนิชัน แอ็บสแตรกชัน และอัลกอริทึมดีไซน์ เป็นหัวใจในการออกแบบการสอนวิทยาศาสตร์ยุคดิจิทัลฮิ!`,
            actions: [
                { label: 'เรียนรู้ในสัปดาห์ที่ 1', icon: 'fa-solid fa-chalkboard-user', onclick: 'openLessonModal(1)' },
                { label: 'ดูใบงาน Abstraction (LAB 1.1.3)', icon: 'fa-solid fa-atom', onclick: "openLabModal('1.1.3')" }
            ]
        };
    }

    // INTENT 3: 16-WEEK COURSEWARE OVERVIEW
    if (q.includes('สัปดาห์') || q.includes('week') || q.includes('บทเรียน') || q.includes('เนื้อหา') || q.includes('หลักสูตร') || q.includes('16') || q.includes('courseware')) {
        return {
            reply: `<div class="space-y-2 text-xs">
                        <div class="font-bold text-cyan-400 flex items-center gap-1.5 text-sm">
                            <i class="fa-solid fa-calendar-days"></i> โครงสร้างบทเรียน 16 สัปดาห์ (รายวิชา 4124941) 📚
                        </div>
                        <p class="text-slate-200 leading-relaxed text-[11px]">
                            ออกแบบตามกรอบ Outcome-Based Education (OBE) ผสาน Active Learning และ Digital Science:
                        </p>
                        <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-[11px]">
                            <div class="p-2 rounded-lg bg-slate-900/90 border border-white/5 flex justify-between items-center">
                                <span><strong>W1:</strong> กระบวนทัศน์วิทยาการคำนวณ (CT Paradigm)</span>
                                <button onclick="openLessonModal(1)" class="text-emerald-400 hover:underline">เปิดดู</button>
                            </div>
                            <div class="p-2 rounded-lg bg-slate-900/90 border border-white/5 flex justify-between items-center">
                                <span><strong>W2:</strong> การสร้างตัวแบบเชิงนามธรรม (Abstraction &amp; CWSI)</span>
                                <button onclick="openLessonModal(2)" class="text-emerald-400 hover:underline">เปิดดู</button>
                            </div>
                            <div class="p-2 rounded-lg bg-slate-900/90 border border-white/5 flex justify-between items-center">
                                <span><strong>W5:</strong> การจำลองการเคลื่อนที่ด้วย Python &amp; Kinematics</span>
                                <button onclick="openLessonModal(5)" class="text-emerald-400 hover:underline">เปิดดู</button>
                            </div>
                            <div class="p-2 rounded-lg bg-slate-900/90 border border-white/5 flex justify-between items-center">
                                <span><strong>W9:</strong> AI &amp; Machine Learning ในชั้นเรียนวิทย์</span>
                                <button onclick="openLessonModal(9)" class="text-emerald-400 hover:underline">เปิดดู</button>
                            </div>
                            <div class="p-2 rounded-lg bg-slate-900/90 border border-white/5 flex justify-between items-center">
                                <span><strong>W16:</strong> นิทรรศการนวัตกรรม &amp; การประเมินผลสัมฤทธิ์ปลายภาค</span>
                                <button onclick="openLessonModal(16)" class="text-emerald-400 hover:underline">เปิดดู</button>
                            </div>
                        </div>
                    </div>`,
            speechText: `บทเรียนมีทั้งหมด 16 สัปดาห์ฮิ ครอบคลุมทั้งแนวคิดการคิดเชิงคำนวณ การเขียนโปรแกรมไพทอนเพื่อวิทยาศาสตร์ ปัญญาประดิษฐ์ในห้องเรียน และการสอบวัดผลสัมฤทธิ์เนี่ยฮิ!`,
            actions: [
                { label: 'ไปยังหมวดบทเรียน 16 สัปดาห์', icon: 'fa-solid fa-graduation-cap', url: '#courseware' }
            ]
        };
    }

    // INTENT 4: 180 LABS & LATEX FORMULAS
    if (q.includes('lab') || q.includes('แล็บ') || q.includes('ใบงาน') || q.includes('ทดลอง') || q.includes('180') || q.includes('cwsi') || q.includes('สูตร') || q.includes('สมการ') || q.includes('latex')) {
        const cwsiLab = labs.find(l => l.lab_code === '1.1.3') || { lab_code: '1.1.3' };
        return {
            reply: `<div class="space-y-2 text-xs">
                        <div class="font-bold text-teal-400 flex items-center gap-1.5 text-sm">
                            <i class="fa-solid fa-microscope"></i> คลัง 180 ใบงานทดลองปฏิบัติการ &amp; ทฤษฎีสมการวิทยาศาสตร์ 🔬
                        </div>
                        <p class="text-slate-200 leading-relaxed text-[11px]">
                            รวบรวมใบงาน 180 หัวข้อ แบ่งตามพุทธิพิสัย Bloom's Taxonomy (C1–C6) พร้อมทฤษฎีสมการคณิตศาสตร์และโค้ดต้นแบบ Python เช่น:
                        </p>
                        <div class="bg-slate-900/90 p-3 rounded-xl border border-teal-500/30 space-y-2 text-[11px]">
                            <div class="text-teal-300 font-bold">ตัวอย่าง LAB 1.1.3: ดัชนีความเครียดน้ำของพืช (CWSI)</div>
                            <div class="p-2 rounded-lg bg-slate-950 border border-white/10 text-center font-mono text-cyan-300 overflow-x-auto">
                                $$\\\\text{CWSI} = \\\\frac{(T_c - T_a) - (T_c - T_a)_{\\\\text{lower}}}{(T_c - T_a)_{\\\\text{upper}} - (T_c - T_a)_{\\\\text{lower}}} \\\\in [0, 1]$$
                            </div>
                            <div class="text-slate-300 text-[10px]">เรนเดอร์สมการด้วย MathJax 3 คมชัดระดับสิ่งพิมพ์ทางวิชาการ</div>
                        </div>
                    </div>`,
            speechText: `คลังใบงานมีทั้งหมด 180 หัวข้อ พร้อมสมการคณิตศาสตร์ฟิสิกส์คมชัดและโค้ดตัวอย่างไพทอน กดเปิดดูใบงานได้เลยเนี่ยฮิ!`,
            actions: [
                { label: 'เปิดใบงาน LAB 1.1.3 (CWSI)', icon: 'fa-solid fa-file-lines', onclick: "openLabModal('1.1.3')" },
                { label: 'ค้นหาในคลัง 180 Labs ทั้งหมด', icon: 'fa-solid fa-boxes-stacked', url: '#labs-library' }
            ]
        };
    }

    // INTENT 5: 3D VIRTUAL LAB & AR SIMULATION
    if (q.includes('ar') || q.includes('3d') || q.includes('virtual lab') || q.includes('จำลอง') || q.includes('simulator') || q.includes('สามมิติ') || q.includes('กล้อง') || q.includes('hand tracking')) {
        return {
            reply: `<div class="space-y-2 text-xs">
                        <div class="font-bold text-sky-400 flex items-center gap-1.5 text-sm">
                            <i class="fa-solid fa-vr-cardboard"></i> AR &amp; 3D Kinematics Virtual Lab Architecture 🚀
                        </div>
                        <p class="text-slate-200 leading-relaxed text-[11px]">
                            ห้องทดลอง 3 มิติเสมือนจริงตามมาตรฐาน <strong>ar-simulation-builder</strong>:
                        </p>
                        <div class="bg-slate-900/90 p-3 rounded-xl border border-sky-500/30 space-y-1.5 font-sans text-[11px]">
                            <div><strong>1. Three.js PBR Engine:</strong> วัตถุรางยิงกระสุนปืนใหญ่แบบ Physical Brushed Aluminum &amp; Laser Rim Lighting</div>
                            <div><strong>2. Web Audio Acoustic Synthesizer:</strong> สังเคราะห์เสียงกลไกจริงเมื่อปรับมุมยิงและระดับสายตา</div>
                            <div><strong>3. Live Kinematics Oscilloscope:</strong> วาดคลื่นความเร็ว-เวลา ($v-t$) และระยะทาง-เวลา ($s-t$) แบบเรียลไทม์ 60 FPS</div>
                            <div><strong>4. MediaPipe Hands 21-Joint HUD:</strong> ตรวจจับฝ่ามือควบคุมการยิงผ่านเว็บแคม</div>
                        </div>
                    </div>`,
            speechText: `ห้องทดลอง 3 มิติเสมือนจริงมีทั้งการเรนเดอร์วัสดุฟิสิกส์ Three.js ระบบตรวจจับมือ MediaPipe และออสซิลโลสโคปสด 60 เฟรมต่อวินาทีฮิ!`,
            actions: [
                { label: 'ไปยังโซน 3D Virtual Lab', icon: 'fa-solid fa-cube', url: '#ar-lab' }
            ]
        };
    }

    // INTENT 6: ADMIN CMS SYSTEM IN FOOTER
    if (q.includes('admin') || q.includes('อาจารย์') || q.includes('หลังบ้าน') || q.includes('ตัดเกรด') || q.includes('ผู้สอน') || q.includes('จัดการ') || q.includes('cms')) {
        return {
            reply: `<div class="space-y-2 text-xs">
                        <div class="font-bold text-purple-400 flex items-center gap-1.5 text-sm">
                            <i class="fa-solid fa-shield-halved"></i> ระบบหลังบ้าน Admin CMS สำหรับอาจารย์ผู้สอน 🛡️
                        </div>
                        <p class="text-slate-200 leading-relaxed text-[11px]">
                            ตามสถาปัตยกรรม UI/UX ที่กำหนด ทางเข้าสู่ระบบอาจารย์ผู้สอนจะ <strong>อยู่ที่ส่วนล่างสุดของเว็บไซต์ (Footer คอลัมน์ที่ 4)</strong> เพื่อความปลอดภัยและเป็นระเบียบของหน้าหลัก:
                        </p>
                        <div class="bg-slate-900/90 p-3 rounded-xl border border-purple-500/30 space-y-1.5 font-sans text-[11px]">
                            <div><strong>• ข้อมูลนักศึกษาจำลอง:</strong> บันทึกข้อมูลนักศึกษา 30 คน (วิทยาศาสตร์ทั่วไป 25 คน + ฟิสิกส์ 5 คน)</div>
                            <div><strong>• รหัสผ่านเข้าระบบอาจารย์:</strong> บัญชี <code class="text-amber-300">chewa</code> / รหัสผ่าน <code class="text-amber-300">PhysiK66</code></div>
                            <div><strong>• เครื่องมือจัดการ:</strong> รูบริกส์ประเมิน 4 เสาหลัก CT, สรุปผลสอบ Pre/Post-test, และส่งออกเกรดเป็น CSV</div>
                        </div>
                    </div>`,
            speechText: `ระบบอาจารย์ผู้สอน Admin CMS อยู่ที่ส่วนล่างสุดของหน้าเว็บใน Footer นะฮิ สามารถเข้าไปดูคะแนนนักศึกษา 30 คนและส่งออกไฟล์ CSV ได้เลยจ้า!`,
            actions: [
                { label: 'เข้าสู่ระบบหลังบ้าน (admin.php)', icon: 'fa-solid fa-gauge-high', url: 'admin.php' },
                { label: 'เลื่อนลงไปดูที่ Footer', icon: 'fa-solid fa-arrow-down', url: '#footer-admin-card' }
            ]
        };
    }

    // INTENT 7: REGISTRATION & LOGIN
    if (q.includes('สมัคร') || q.includes('ลงทะเบียน') || q.includes('login') || q.includes('เข้าสู่ระบบ') || q.includes('รหัสผ่าน') || q.includes('user') || q.includes('account')) {
        return {
            reply: `<div class="space-y-2 text-xs">
                        <div class="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                            <i class="fa-solid fa-user-lock"></i> ระบบบัญชีสมาชิกและการเข้าสู่ระบบ (Authentication) 🔐
                        </div>
                        <p class="text-slate-200 leading-relaxed text-[11px]">
                            เพื่อความถูกต้องในการบันทึกคะแนน Pre-test, Post-test และเวลาปฏิบัติการ LAB นักศึกษาจำเป็นต้องเข้าสู่ระบบก่อนทำกิจกรรม:
                        </p>
                        <div class="bg-slate-900/90 p-3 rounded-xl border border-amber-500/30 space-y-1 text-[11px]">
                            <div><strong>• นักศึกษาปัจจุบัน:</strong> ใช้รหัสนักศึกษาและรหัสผ่านเริ่มต้น <code class="text-emerald-300">123456</code></div>
                            <div><strong>• นักศึกษาใหม่:</strong> สามารถกดสมัครสมาชิกใหม่ได้ทันที กรอกชื่อ-สกุล สาขาวิชา และรหัสผ่าน</div>
                            <div><strong>• บัญชีอาจารย์:</strong> ล็อกอินด้วย <code class="text-cyan-300">chewa</code> เพื่อดูแลชั้นเรียน</div>
                        </div>
                    </div>`,
            speechText: `นักศึกษาสามารถเข้าสู่ระบบด้วยรหัสนักศึกษาและรหัสผ่าน หรือกดสมัครสมาชิกใหม่ได้เลยเนี่ยฮิ!`,
            actions: [
                { label: 'เข้าสู่ระบบ (Login)', icon: 'fa-solid fa-right-to-bracket', onclick: "if(window.Auth) Auth.showLoginModal();" },
                { label: 'สมัครสมาชิกใหม่ (Register)', icon: 'fa-solid fa-user-plus', onclick: "if(window.Auth) Auth.showRegisterModal();" }
            ]
        };
    }

    // INTENT 8: INSTRUCTOR CONTACT
    if (q.includes('ติดต่อ') || q.includes('อาจารย์ชีวะ') || q.includes('อ.ชีวะ') || q.includes('chewa') || q.includes('เบอร์') || q.includes('email') || q.includes('อีเมล')) {
        return {
            reply: `<div class="space-y-2 text-xs">
                        <div class="font-bold text-sky-400 flex items-center gap-1.5 text-sm">
                            <i class="fa-solid fa-address-book"></i> ช่องทางการติดต่ออาจารย์ผู้สอน 📞
                        </div>
                        <div class="bg-slate-900/90 p-3 rounded-xl border border-sky-500/30 space-y-1.5 text-[11px]">
                            <div><strong>อาจารย์ผู้รับผิดชอบ:</strong> <span class="text-white font-bold">${course.instructor}</span></div>
                            <div><strong>สังกัด:</strong> ${course.institution}</div>
                            <div><strong>โทรศัพท์:</strong> <a href="tel:${course.phone}" class="text-emerald-400 font-bold hover:underline">${course.phone}</a></div>
                            <div><strong>อีเมล:</strong> <a href="mailto:${course.email}" class="text-cyan-400 font-bold hover:underline">${course.email}</a></div>
                            <div><strong>ห้องพักอาจารย์:</strong> สาขาวิชาฟิสิกส์และวิทยาศาสตร์ทั่วไป อาคาร 35 คณะวิทย์ฯ</div>
                        </div>
                    </div>`,
            speechText: `ติดต่อ ผศ.ดร.ชีวะ ทัศนา ได้ที่โทร 093-742-2654 หรืออีเมล chewa.t@rbru.ac.th ได้ตลอดเวลาเลยเนี่ยฮิ!`,
            actions: [
                { label: 'โทรหา อ.ชีวะ ทันที', icon: 'fa-solid fa-phone', url: `tel:${course.phone}` }
            ]
        };
    }

    // DEFAULT CHIT-CHAT (สำเนียงจันท์ฮิ)
    return {
        reply: `<div class="space-y-2 text-xs">
                    <p class="text-slate-200 leading-relaxed">
                        ฮั่นแน่! น้องยินดีช่วยอาจารย์และเพื่อนๆ ทุกเรื่องเลยเนี่ยฮิ! 🌤️🌱<br>
                        เรื่องที่น้องเชี่ยวชาญและให้ข้อมูลได้ทันที เช่น:
                    </p>
                    <div class="grid grid-cols-2 gap-1.5 my-2">
                        <button type="button" onclick="sendQuickPrompt('Pre-test และ Post-test ทำอย่างไร')" class="p-2 rounded-lg bg-slate-800 text-emerald-300 hover:bg-slate-700 text-left border border-white/5 text-[11px]">
                            📝 Pre-test &amp; Post-test
                        </button>
                        <button type="button" onclick="sendQuickPrompt('4 เสาหลัก CT มีอะไรบ้าง')" class="p-2 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 text-left border border-white/5 text-[11px]">
                            🧩 4 เสาหลัก CT
                        </button>
                        <button type="button" onclick="sendQuickPrompt('180 ใบงานทดลองมีอะไรบ้าง')" class="p-2 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700 text-left border border-white/5 text-[11px]">
                            🔬 180 Labs &amp; สมการ
                        </button>
                        <button type="button" onclick="sendQuickPrompt('ระบบอาจารย์ Admin อยู่ที่ไหน')" class="p-2 rounded-lg bg-slate-800 text-purple-300 hover:bg-slate-700 text-left border border-white/5 text-[11px]">
                            🛡️ ระบบ Admin (Footer)
                        </button>
                    </div>
                    <p class="text-slate-400 text-[11px]">
                        ลองพิมพ์ถามน้อง หรือกดปุ่มด้านบนได้เลยจ้าฮิ! 🌾
                    </p>
                </div>`,
        speechText: `น้องยินดีตอบทุกคำถามเกี่ยวกับรายวิชาวิทยาการคำนวณ 4124941 ทั้งเรื่องแบบทดสอบ บทเรียน 16 สัปดาห์ และใบงานแล็บ ถามน้องได้เลยเนี่ยฮิ!`,
        actions: []
    };
}

// =========================================================================
// 7. CHAT MESSAGE SUBMISSION & RENDERING
// =========================================================================
function sendQuickPrompt(promptText) {
    unlockAudio();
    const input = document.getElementById('leqsChatInput');
    if (input) {
        input.value = promptText;
        sendUserMessage(promptText);
    }
}

function handleLeqsChatSubmit(event) {
    if (event) event.preventDefault();
    unlockAudio();
    const input = document.getElementById('leqsChatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendUserMessage(text);
}

function sendUserMessage(text) {
    const container = document.getElementById('leqsChatMessages');
    if (!container) return;

    playDigitalChime('tap');
    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    // 1. Render User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'flex justify-end';
    userBubble.innerHTML = `
        <div class="max-w-[85%] bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-md text-xs space-y-1">
            <div class="leading-relaxed font-sans">${escapeHtml(text)}</div>
            <div class="text-[9px] text-emerald-200 text-right font-mono">${time}</div>
        </div>
    `;
    container.appendChild(userBubble);
    container.scrollTop = container.scrollHeight;

    // 2. Typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.id = 'leqsTypingIndicator';
    typingBubble.className = 'flex justify-start gap-2.5 items-center';
    typingBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400 text-xs">
            🌱
        </div>
        <div class="bg-slate-900 border border-white/10 text-slate-300 px-3.5 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm text-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-[11px] font-sans">น้อง LEQs กำลังประมวลผล RAG...</span>
        </div>
    `;
    container.appendChild(typingBubble);
    container.scrollTop = container.scrollHeight;

    // 3. Process RAG query
    setTimeout(() => {
        const ind = document.getElementById('leqsTypingIndicator');
        if (ind) ind.remove();

        const result = processRAGQuery(text, currentLeqsLang);
        renderBotResponse(result);
    }, 450);
}

function renderBotResponse(result) {
    const container = document.getElementById('leqsChatMessages');
    if (!container) return;

    playDigitalChime('bot');
    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    let actionsHtml = '';
    if (Array.isArray(result.actions) && result.actions.length > 0) {
        actionsHtml = `
            <div class="flex flex-wrap gap-1.5 pt-2 border-t border-white/10 mt-2">
                ${result.actions.map(act => {
                    if (act.onclick) {
                        return `<button type="button" onclick="${act.onclick}" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-[11px] border border-emerald-400/30 transition shadow-xs">
                                    <i class="${act.icon}"></i> ${act.label}
                                </button>`;
                    } else if (act.url) {
                        return `<a href="${act.url}" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold text-[11px] border border-cyan-400/30 transition shadow-xs">
                                    <i class="${act.icon}"></i> ${act.label}
                                </a>`;
                    }
                    return '';
                }).join('')}
            </div>
        `;
    }

    const botBubble = document.createElement('div');
    botBubble.className = 'flex justify-start gap-2.5';
    botBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400 text-xs shadow-sm">
            🌱
        </div>
        <div class="max-w-[90%] bg-slate-900 border border-white/10 text-white p-3.5 rounded-2xl rounded-tl-sm shadow-xl text-xs space-y-2">
            ${result.reply}
            ${actionsHtml}
            <div class="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-white/5">
                <span class="font-mono text-emerald-400">LEQs Autonomous Agent</span>
                <span class="font-mono">${time}</span>
            </div>
        </div>
    `;
    container.appendChild(botBubble);
    container.scrollTop = container.scrollHeight;

    // Trigger MathJax if equation is present
    if (window.renderMathInElement) {
        window.renderMathInElement(botBubble);
    }

    if (result.speechText) {
        speakWithDigitalTone(result.speechText);
    }
}

function clearLeqsChat(isLanguageSwitch = false) {
    const container = document.getElementById('leqsChatMessages');
    if (!container) return;
    container.innerHTML = '';

    const dict = I18N_DATA[currentLeqsLang];
    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const welcomeBubble = document.createElement('div');
    welcomeBubble.className = 'flex justify-start gap-2.5';
    welcomeBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400 text-xs shadow-sm">
            🌱
        </div>
        <div class="max-w-[90%] bg-slate-900 border border-white/10 text-white p-3.5 rounded-2xl rounded-tl-sm shadow-xl text-xs space-y-2">
            <div class="font-black text-emerald-400 flex items-center gap-1.5 text-sm">
                ${dict.welcomeTitle}
            </div>
            <div class="text-slate-300 leading-relaxed text-[11px]">
                ${dict.welcomeMsg}
            </div>
            <div class="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-white/5">
                <span class="font-mono text-emerald-400">LEQs Autonomous Agent</span>
                <span class="font-mono">${time}</span>
            </div>
        </div>
    `;
    container.appendChild(welcomeBubble);

    if (!isLanguageSwitch) {
        playDigitalChime('end');
    }
}

// =========================================================================
// 8. VOICE RECOGNITION (SPEECH-TO-TEXT MICROPHONE)
// =========================================================================
function toggleVoiceInput() {
    unlockAudio();
    if (isLeqsListening) {
        stopVoiceInput();
        return;
    }
    startVoiceInput();
}

function startVoiceInput() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        alert('เบราว์เซอร์ของท่านยังไม่รองรับระบบตรวจจับเสียงพูด กรุณาใช้ Chrome หรือ Edge ครับ');
        return;
    }

    try {
        speechRecognition = new SpeechRec();
        speechRecognition.lang = currentLeqsLang === 'th' ? 'th-TH' : (currentLeqsLang === 'zh' ? 'zh-CN' : 'en-US');
        speechRecognition.interimResults = false;
        speechRecognition.maxAlternatives = 1;

        const micBtn = document.getElementById('leqsMicBtn');
        const indicator = document.getElementById('leqsListeningIndicator');

        speechRecognition.onstart = () => {
            isLeqsListening = true;
            if (micBtn) {
                micBtn.className = 'w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 transition animate-pulse shadow-lg shadow-rose-500/30';
            }
            if (indicator) indicator.classList.remove('hidden');
            playDigitalChime('start');
        };

        speechRecognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            if (transcript) {
                const input = document.getElementById('leqsChatInput');
                if (input) input.value = transcript;
                sendUserMessage(transcript);
            }
        };

        speechRecognition.onerror = () => {
            stopVoiceInput();
        };

        speechRecognition.onend = () => {
            stopVoiceInput();
        };

        speechRecognition.start();
    } catch(e) {
        stopVoiceInput();
    }
}

function stopVoiceInput() {
    isLeqsListening = false;
    if (speechRecognition) {
        try { speechRecognition.stop(); } catch(e) {}
        speechRecognition = null;
    }
    const micBtn = document.getElementById('leqsMicBtn');
    const indicator = document.getElementById('leqsListeningIndicator');
    if (micBtn) {
        micBtn.className = 'w-10 h-10 rounded-2xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 flex items-center justify-center shrink-0 transition border border-white/10';
    }
    if (indicator) indicator.classList.add('hidden');
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Auto-initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initRAGKnowledgeBase();
    renderQuickChips();
    clearLeqsChat(true);
    updateVoiceToggleBtn();

    // Show speech bubble prompt after 2.5 seconds
    setTimeout(() => {
        const bubble = document.getElementById('leqsBotSpeechBubble');
        if (bubble && !isLeqsChatOpen) {
            bubble.classList.remove('hidden');
        }
    }, 2500);
});

