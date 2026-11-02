/**
 * Coding for Kids - Workshop Portal
 * i18n Engine & Interactive Logic
 */

(() => {
    'use strict';

    // Translation Dictionary
    const translations = {
        th: {
            nav_concept: "แนวคิด",
            nav_system: "ระบบเกม",
            nav_recipes: "ตัวอย่างโค้ด",
            nav_schedule: "ตารางกิจกรรม",
            hero_title: "วิทย์ในวัง: ",
            hero_subtitle: "นักสร้างเกมรุ่นเยาว์",
            hero_lead: "เปลี่ยนจากผู้เล่น เป็นผู้สร้าง! ออกแบบจักรวาลของคุณเองด้วยโค้ด",
            hero_stat_grade: "ประถมศึกษา ป.1 - ป.6",
            hero_stat_explorers: "16 นักสำรวจ",
            hero_stat_hours: "อบรม 6 ชั่วโมง",
            hero_cta: "ดูตารางกิจกรรม",
            section_skills: "ทักษะและการพัฒนา",
            card_mech_title: "กลไกเกม",
            card_mech_text: "เข้าใจลอจิก การเคลื่อนที่ และการโต้ตอบของวัตถุ",
            card_level_title: "การออกแบบด่าน",
            card_level_text: "สร้างความท้าทายและสภาพแวดล้อมที่น่าตื่นเต้น",
            card_logic_title: "ตรรกะคอมพิวเตอร์",
            card_logic_text: "ใช้งานตัวแปรและเงื่อนไขต่างๆ อย่างมีประสิทธิภาพ",
            section_pillars: "4 เสาหลักของการสร้างเกม",
            pillar_controls: "01. การควบคุม",
            pillar_controls_text: "การเคลื่อนที่ของตัวละครและระบบรับค่าจากผู้ใช้",
            pillar_collisions: "02. การชนกัน",
            pillar_collisions_text: "การตรวจจับการโต้ตอบระหว่างวัตถุในเกม",
            pillar_ui: "03. UI และตัวแปร",
            pillar_ui_text: "การจัดการคะแนน พลังชีวิต และตัวจับเวลา",
            pillar_states: "04. สถานะเกม",
            pillar_states_text: "การกำหนดเงื่อนไขการชนะและแพ้",
            section_recipes: "สูตรลับการเขียนโค้ด",
            recipe_catch_desc: "กลไกการตกของวัตถุพร้อมระบบนับคะแนน",
            recipe_explorer_desc: "เกมตะลุยด่านขั้นสูงพร้อมระบบแรงโน้มถ่วงและการกระโดด",
            recipe_view_details: "ดูรายละเอียดลอจิก",
            section_timeline: "กำหนดการกิจกรรม",
            time_0900_title: "เปิดประตูสู่โลกโค้ด",
            time_0900_desc: "กิจกรรม Human Robot (ตรรกะแบบ Unplugged)",
            time_1045_title: "พื้นฐานกลไกเกม",
            time_1045_desc: "เรียนรู้ตัวแปร ลูป และการควบคุม",
            time_1300_title: "โปรเจกต์หลัก",
            time_1300_desc: "ออกแบบด่านและสร้างเกม Palace Quest",
            time_1545_title: "นำเสนอผลงาน",
            time_1545_desc: "พิธีมอบประกาศนียบัตร",
            footer_copy: "© 2026 วิทย์ในวัง - กิจกรรมอบรมการสร้างเกมระดับสากลสำหรับเด็ก",
            // Recipes Page
            rec_title: "เจาะลึกอัลกอริทึม",
            rec_lead: "ทำความเข้าใจการทำงานของบล็อกโค้ดในแต่ละส่วน",
            rec_01_title: "01. ระบบควบคุมการเคลื่อนที่",
            rec_01_lead: "พื้นฐานของการสร้างเกม คือการทำให้ผู้เล่นโต้ตอบกับตัวละครได้",
            rec_01_s1_t: "การเริ่มทำงาน (Event)",
            rec_01_s1_d: "ใช้บล็อก When Green Flag Clicked เพื่อระบุจุดเริ่มต้น",
            rec_01_s2_t: "วงจรการทำงาน (Game Loop)",
            rec_01_s2_d: "ใช้ Forever ครอบคำสั่งเพื่อให้ตรวจสอบการกดปุ่มอยู่ตลอดเวลา",
            rec_01_s3_t: "ลอจิกการเคลื่อนที่",
            rec_01_s3_d: "ใช้ Set X สำหรับเมาส์ หรือ Change X สำหรับคีย์บอร์ด",
            // Lab Page
            lab_title: "ห้องแล็บต่อบล็อกอัจฉริยะ",
            lab_lead: "ลองต่อบล็อกทีละขั้นตอน เพื่อสร้างเกมตัวแรกของคุณ!",
            // Navbar Categories
            menu_physical: "กิจกรรม Unplugged",
            menu_human_robot: "👣 หุ่นยนต์มนุษย์",
            menu_unplugged_collection: "🃏 คลังเกม Unplugged (Backup)",
            menu_maps: "🗺️ แผนผังจัดสนาม",
            menu_print: "🖨️ พิมพ์บัตรคำสั่ง",
            menu_digital: "โปรแกรมจำลอง",
            menu_logic_sim: "🤖 Logic Simulation",
            menu_scratch_lab: "🛠️ ห้องแล็บ Scratch",
            menu_curriculum: "🎓 ศูนย์หลักสูตร (Hub)",
            menu_resources: "คลังสื่อวิทยากร",
            menu_resources_all: "🔗 รวมแหล่งเรียนรู้ (Hub)",
            menu_guide: "📘 คู่มือวิทยากร",
            menu_manual: "📄 คู่มือการสอน",
            menu_slides: "📊 สไลด์สอน",
            // Lab Page (Builder)
            lab_palette_title: "คลังบล็อกคำสั่ง",
            cat_events: "เหตุการณ์",
            cat_motion: "การเคลื่อนที่",
            cat_control: "ควบคุม",
            cat_variables: "ตัวแปร",
            lab_welcome_title: "ยินดีต้อนรับสู่ Lab!",
            lab_welcome_text: "มาลองสร้างโปรแกรมแรกของคุณด้วยบล็อกโค้ดที่สมจริงกันครับ",
            lab_welcome_thought: "สังเกตรูปร่างของบล็อกนะ มันจะต่อกันได้เหมือนเลโก้เลย!",
            lab_btn_next: "ต่อบล็อกถัดไป",
            lab_btn_reset: "เริ่มใหม่",
            // Workbook Page
            wb_download: "ดาวน์โหลด PDF",
            wb_main_title: "แบบฝึกหัด: รู้จักกับ Scratch",
            wb_subtitle: "ตอนที่ 1: การเริ่มต้นและส่วนประกอบพื้นฐาน",
            wb_name: "ชื่อ-นามสกุล:",
            wb_class: "ชั้น/กลุ่ม:",
            wb_sec1_title: "กิจกรรมที่ 1: จับคู่คำศัพท์",
            wb_sec1_desc: "จงจับคู่ชื่อส่วนประกอบของ Scratch กับหน้าที่ให้ถูกต้อง",
            wb_sec2_title: "กิจกรรมที่ 2: ขั้นตอนการสมัครสมาชิก",
            wb_sec2_desc: "จงเรียงลำดับขั้นตอนการสมัคร Scratch Online (ใส่หมายเลข 1-4)",
            wb_sort1: "ยืนยันตัวตนผ่าน Email",
            wb_sort2: "เข้าเว็บไซต์ scratch.mit.edu",
            wb_sort3: "ตั้งชื่อผู้ใช้และรหัสผ่าน",
            wb_sort4: "กดปุ่ม 'Join Scratch'",
            wb_sec3_title: "กิจกรรมที่ 3: ออกแบบตัวละคร",
            wb_sec3_desc: "วาดรูปตัวละครที่คุณต้องการสร้างในช่อง Stage จำลองด้านล่างนี้",
            wb_think_title: "💡 ชวนคิด:",
            wb_think_text: "ถ้าเราต้องการให้ตัวละครเดินหน้า ต้องใช้บล็อกสีอะไร? และอยู่ในหมวดหมู่ไหน?",
            // Workbook P2
            wb2_main_title: "แบบฝึกหัด: ตัวละครและพิกัด",
            wb2_subtitle: "ตอนที่ 2: การจัดการ Sprite และระบบพิกัด X, Y",
            wb2_sec1_title: "กิจกรรมที่ 1: นักสืบ Library",
            wb2_sec1_desc: "จงเขียนชื่อตัวละครที่คุณพบในหมวดหมู่ต่อไปนี้",
            wb2_sec2_title: "กิจกรรมที่ 2: แผงควบคุมตัวละคร",
            wb2_sec2_desc: "จงเติมตัวเลขหรือสัญลักษณ์ในแผงควบคุมตามที่กำหนด",
            wb2_sec3_title: "กิจกรรมที่ 3: เข็มทิศแห่งทิศทาง",
            wb2_sec3_desc: "จงเขียนตัวเลข 'องศา' ให้ตรงกับทิศทางที่กำหนด",
            wb2_sec4_title: "กิจกรรมที่ 4: พิกัดหรรษา",
            wb2_sec4_desc: "เมื่อตัวละครอยู่กลางหน้าจอเป๊ะๆ ค่าพิกัดจะเป็นเท่าไหร่?",
            // Curriculum Hub
            hub_title: "ศูนย์การเรียนรู้ Scratch",
            hub_subtitle: "รวบรวมวิดีโอสอนและแบบฝึกหัด ตั้งแต่พื้นฐานจนถึงสร้างเกมจริง",
            ep1_title: "EP 1: เริ่มต้นรู้จัก Scratch",
            ep1_desc: "ทำความรู้จักกับโปรแกรม และวิธีการสมัครสมาชิก",
            ep2_title: "EP 2: ตัวละครและพิกัด",
            ep2_desc: "การจัดการ Sprite และระบบพิกัด X, Y",
            ep3_title: "EP 3: พื้นหลังพื้นฐาน",
            ep3_desc: "การเลือกและจัดการฉากหลัง (Backdrops)",
            ep4_title: "EP 4: วาดพื้นหลังเอง",
            ep4_desc: "ใช้เครื่องมือวาดรูปสร้างฉากในจินตนาการ",
            ep5_title: "EP 5: ระบบเปลี่ยนฉาก",
            ep5_desc: "การสั่งให้ฉากเปลี่ยนไปตามสถานการณ์",
            ep6_title: "EP 6: ชุดตัวละคร (Costumes)",
            ep6_desc: "การเปลี่ยนท่าทางและการแต่งตัวให้ตัวละคร",
            ep7_title: "EP 7: วาดตัวละครขั้นสูง",
            ep7_desc: "สร้างหุ่นยนต์และตัวละครจากรูปร่างพื้นฐาน",
            ep8_title: "EP 8: ตรรกะการต่อบล็อก",
            ep8_desc: "เรียนรู้วิธีการวางลำดับคำสั่งที่ถูกต้อง",
            ep9_title: "EP 9: การเล่าเรื่อง (Talk)",
            ep9_desc: "ใส่บทสนทนาและการรอจังหวะให้ตัวละคร",
            ep10_title: "EP 10: แผนที่และการเดิน",
            ep10_desc: "กำหนดเส้นทางเดินตามแผนที่พิกัด",
            ep11_title: "EP 11: ควบคุมด้วยคีย์บอร์ด",
            ep11_desc: "สร้างระบบควบคุมตัวละครด้วยปุ่มลูกศร"
        },
        en: {
            nav_concept: "Concept",
            nav_system: "System",
            nav_recipes: "Recipes",
            nav_schedule: "Schedule",
            hero_title: "Science in Palace: ",
            hero_subtitle: "Game Creators",
            hero_lead: "From players to creators. Design your own universe with code.",
            hero_stat_grade: "Grade 1 - 6",
            hero_stat_explorers: "16 Explorers",
            hero_stat_hours: "6-Hour Workshop",
            hero_cta: "Explore Schedule",
            section_skills: "Skills & Development",
            card_mech_title: "Game Mechanics",
            card_mech_text: "Understanding logic, movement, and interaction.",
            card_level_title: "Level Design",
            card_level_text: "Crafting challenges and immersive environments.",
            card_logic_title: "Computational Logic",
            card_logic_text: "Using variables and conditional statements effectively.",
            section_pillars: "The 4 Core Pillars",
            pillar_controls: "01. Controls",
            pillar_controls_text: "Character movement and input systems.",
            pillar_collisions: "02. Collisions",
            pillar_collisions_text: "Detecting interactions between objects.",
            pillar_ui: "03. UI & Variables",
            pillar_ui_text: "Managing scores, health, and timers.",
            pillar_states: "04. Game States",
            pillar_states_text: "Defining victory and defeat conditions.",
            section_recipes: "Coding Recipes",
            recipe_catch_desc: "Falling objects mechanics with scoring logic.",
            recipe_explorer_desc: "Advanced platformer with gravity and jumping.",
            recipe_view_details: "View Logic Details",
            section_timeline: "Program Timeline",
            time_0900_title: "Opening World",
            time_0900_desc: "Human Robot Activity (Unplugged Logic)",
            time_1045_title: "Mechanics 101",
            time_1045_desc: "Variables, Loops, and Input Controls",
            time_1300_title: "Main Project",
            time_1300_desc: "Level Creation & Palace Quest Design",
            time_1545_title: "Final Showcase",
            time_1545_desc: "Award Ceremony & Certification",
            footer_copy: "© 2026 Science in the Palace - International Game Design Workshop for Kids",
            // Recipes Page
            rec_title: "Algorithm Breakdown",
            rec_lead: "Understanding how each part of the code works",
            rec_01_title: "01. Character Control System",
            rec_01_lead: "The basics of game creation is allowing players to interact.",
            rec_01_s1_t: "Starting Work (Event)",
            rec_01_s1_d: "Use When Green Flag Clicked to define the start.",
            rec_01_s2_t: "Game Loop",
            rec_01_s2_d: "Use Forever to continuously check for button presses.",
            rec_01_s3_t: "Movement Logic",
            rec_01_s3_d: "Use Set X for mouse or Change X for keyboard.",
            // Lab Page
            lab_title: "Interactive Code Lab",
            lab_lead: "Build your first game step-by-step with guided blocks!",
            // Navbar Categories
            menu_physical: "Physical Coding",
            menu_human_robot: "👣 Human Robot",
            menu_unplugged_collection: "🃏 Unplugged Collection",
            menu_maps: "🗺️ Mission Maps",
            menu_print: "🖨️ Print Cards",
            menu_digital: "Digital Logic",
            menu_logic_sim: "🤖 Logic Sim",
            menu_scratch_lab: "🛠️ Scratch Lab",
            menu_curriculum: "🎓 Curriculum Hub",
            menu_resources: "Teacher Hub",
            menu_resources_all: "🔗 Resource Hub",
            menu_guide: "📘 Teacher Guide",
            menu_manual: "📄 Teaching Manual",
            menu_slides: "📊 Slides",
            // Lab Page (Builder)
            lab_palette_title: "Code Palette",
            cat_events: "Events",
            cat_motion: "Motion",
            cat_control: "Control",
            cat_variables: "Variables",
            lab_welcome_title: "Welcome to Lab!",
            lab_welcome_text: "Let's build your first program with realistic code blocks.",
            lab_welcome_thought: "Notice the block shapes? They snap together just like LEGO!",
            lab_btn_next: "Next Block",
            lab_btn_reset: "Restart Lab",
            // Workbook Page
            wb_download: "Download PDF",
            wb_main_title: "Workbook: Intro to Scratch",
            wb_subtitle: "Part 1: Getting Started & Components",
            wb_name: "Name-Surname:",
            wb_class: "Class/Group:",
            wb_sec1_title: "Activity 1: Matching Terms",
            wb_sec1_desc: "Match Scratch components with their functions.",
            wb_sec2_title: "Activity 2: Account Setup Steps",
            wb_sec2_desc: "Sort the steps for joining Scratch (1-4).",
            wb_sort1: "Verify via Email",
            wb_sort2: "Go to scratch.mit.edu",
            wb_sort3: "Set Username & Password",
            wb_sort4: "Click 'Join Scratch'",
            wb_sec3_title: "Activity 3: My First Sprite",
            wb_sec3_desc: "Draw your character in the stage grid below.",
            wb_think_title: "💡 Think About It:",
            wb_think_text: "To move forward, what block color/category should you use?",
            // Workbook P2
            wb2_main_title: "Workbook: Sprites & Coordinates",
            wb2_subtitle: "Part 2: Managing Sprites & X, Y System",
            wb2_sec1_title: "Activity 1: Library Detective",
            wb2_sec1_desc: "Write down a sprite name you find in these categories.",
            wb2_sec2_title: "Activity 2: Sprite Info Panel",
            wb2_sec2_desc: "Fill in the blanks based on the sprite settings.",
            wb2_sec3_title: "Activity 3: The Compass of Direction",
            wb2_sec3_desc: "Write the 'Degrees' (Direction) for each arrow.",
            wb2_sec4_title: "Activity 4: Coordinate Fun",
            wb2_sec4_desc: "What is the (X, Y) coordinate for the exact center?",
            // Curriculum Hub
            hub_title: "Scratch Learning Hub",
            hub_subtitle: "A complete collection of tutorials and workbooks from basics to game design.",
            ep1_title: "EP 1: Intro to Scratch",
            ep1_desc: "Getting to know the interface and account setup.",
            ep2_title: "EP 2: Sprites & Coordinates",
            ep2_desc: "Sprite management and the X, Y coordinate system.",
            ep3_title: "EP 3: Backdrop Basics",
            ep3_desc: "How to select and manage stage backdrops.",
            ep4_title: "EP 4: Custom Backdrops",
            ep4_desc: "Using the paint editor to create your own scenes.",
            ep5_title: "EP 5: Backdrop Logic",
            ep5_desc: "How to switch scenes based on program logic.",
            ep6_title: "EP 6: Sprite Costumes",
            ep6_desc: "Changing poses and animating your characters.",
            ep7_title: "EP 7: Advanced Drawing",
            ep7_desc: "Drawing robots and complex sprites from shapes.",
            ep8_title: "EP 8: Block Logic",
            ep8_desc: "Understanding execution order and sequence.",
            ep9_title: "EP 9: Storytelling",
            ep9_desc: "Adding dialogue (Say/Think) and timing (Wait).",
            ep10_title: "EP 10: Motion & Maps",
            ep10_desc: "Pathfinding and movement using coordinate system.",
            ep11_title: "EP 11: Keyboard Control",
            ep11_desc: "Controlling sprites using arrow keys for games."
        }
    };

    /**
     * Initialization
     */
    const init = () => {
        const savedLang = localStorage.getItem('app_lang') || 'th';
        applyLanguage(savedLang);
        
        setupSmoothScroll();
        setupRevealOnScroll();
        setupLangToggle();
    };

    /**
     * Apply language to the UI
     */
    const applyLanguage = (lang) => {
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('app_lang', lang);

        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        // Update Toggle Button Text
        const toggleBtn = document.querySelector('.lang-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = lang === 'th' ? 'EN / ไทย' : 'TH / English';
        }
    };

    /**
     * Language Toggle Logic
     */
    const setupLangToggle = () => {
        const btn = document.querySelector('.lang-toggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const currentLang = document.documentElement.getAttribute('lang');
            const newLang = currentLang === 'th' ? 'en' : 'th';
            applyLanguage(newLang);
        });
    };

    /**
     * Smooth scrolling for anchor links
     */
    const setupSmoothScroll = () => {
        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    /**
     * Reveal on scroll
     */
    const setupRevealOnScroll = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.card, .timeline__item, .section__title, .mech-card, .recipe-card').forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    };

    // DOM Ready
    document.addEventListener('DOMContentLoaded', init);

})();
