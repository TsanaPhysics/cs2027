<?php
/**
 * Database Initialization & Seeding CLI Script
 * Run with: /Applications/XAMPP/xamppfiles/bin/php database/init_db.php
 */

require_once __DIR__ . '/db.php';

echo "========================================================\n";
echo "⚡ RBRU Course 4124941 Database Initializer\n";
echo "   Instructor: Asst. Prof. Dr. Chewa Thassana\n";
echo "========================================================\n";

try {
    $db = Database::getConnection();
    echo "✓ Connected to SQLite database: " . Database::getSqlitePath() . "\n";

    // 1. Execute Schema
    $schemaFile = __DIR__ . '/schema_sqlite.sql';
    if (!file_exists($schemaFile)) {
        throw new Exception("Schema file not found: $schemaFile");
    }
    $schemaSql = file_get_contents($schemaFile);
    $db->exec($schemaSql);
    echo "✓ Schema tables & indices created successfully.\n";

    // 2. Seed 16 Weeks Assignments
    $assignments = [
        [1, 'การคิดเชิงคำนวณและรากฐานสะเต็ม (CT in Science & In Silico)', 'โมดูล 1: รากฐานวิธีคิดเชิงคำนวณ', 'วิเคราะห์ 4 เสาหลัก CT, Wet Lab สู่ In Silico, แบบจำลองพายุไต้ฝุ่น, และ Problem-Based Learning Unplugged Grid', 20.00],
        [2, 'แบบจำลองมวลจุดเชิงนามธรรมและการลดทอนความซับซ้อน (Abstraction & Voxel)', 'โมดูล 1: รากฐานวิธีคิดเชิงคำนวณ', 'การจำลองมวลจุด Point-Mass, การประหยัดหน่วยความจำ, และ 3D Voxel Scientific Lab', 20.00],
        [3, 'การรู้จำแบบแผนและการวิเคราะห์ข้อมูลสัญญาณ (Pattern Recognition & Waves)', 'โมดูล 1: รากฐานวิธีคิดเชิงคำนวณ', 'การวิเคราะห์สัญญาณคลื่น, การคำนวณ Moving Average และ Mean Squared Error (MSE)', 20.00],
        [4, 'การออกแบบขั้นตอนวิธีและผังงานจำลองวิทยาศาสตร์ (Algorithms & Flowchart)', 'โมดูล 2: อัลกอริทึมและการแก้ปัญหา', 'การเขียนผังงานวิทยาศาสตร์ด้วยสัญลักษณ์มาตรฐาน, การตรวจจับ Infinite Loop, และ Execution Stepper', 20.00],
        [5, 'ตัวแปร โมเดลหน่วยความจำ และการคำนวณพลังงาน (RAM Model & Energy)', 'โมดูล 3: โครงสร้างข้อมูลและหน่วยความจำ', 'การจัดสรร RAM Address, Stack Frame, และสูตรฟิสิกส์จลนศาสตร์ Kinetic Energy', 20.00],
        [6, 'โครงสร้างวนซ้ำและการสร้างสะสมข้อมูล (Loop Constructs & Numerical Accumulation)', 'โมดูล 3: โครงสร้างข้อมูลและหน่วยความจำ', 'For-loop Range Stepper, สะสมค่าตัวแปรเชิงตัวเลข, และการจำลองระบบอัตโนมัติ', 20.00],
        [7, 'การเขียนโค้ดเชิงป้องกันและการปรับโครงสร้าง (Defensive Coding & Refactoring)', 'โมดูล 4: การพัฒนาโค้ดคุณภาพสูง', 'การตรวจสอบ Exception Handling, ขจัด Code Smells, และเพิ่มความทนทานต่อ Fault Injection', 20.00],
        [8, 'ตารางไล่รหัสและการแกะรอยสถานะโปรแกรม (Trace Tables & Variable Tracking)', 'โมดูล 4: การพัฒนาโค้ดคุณภาพสูง', 'Interactive Animated Trace Table, แกะรอยสถานะตัวแปรทีละบรรทัดสำหรับครูวิทยาศาสตร์', 20.00],
        [9, 'การจำลองการเคลื่อนที่วิถีโค้งและแรงต้านอากาศ (3D Projectile Motion & Fluid Drag)', 'โมดูล 5: แบบจำลองฟิสิกส์คอมพิวเตอร์', 'การคำนวณสมการพาราโบลา, แรงต้านอากาศทรงกลม, และ 3D Projectile Cannon PBR', 20.00],
        [10, 'การซ้อนทับของคลื่นและการแปลงฟูเรียร์ (Wave Superposition & Fourier Transform)', 'โมดูล 5: แบบจำลองฟิสิกส์คอมพิวเตอร์', 'การแทรกสอดคลื่นฮาร์โมนิก, ปรากฏการณ์บีตส์, คลื่นนิ่ง, และ Fast Fourier Transform (FFT)', 20.00],
        [11, 'การวางแผนโครงงานตามอนุกรมวิธานของบลูม (Bloom\'s Taxonomy Capstone Roadmap)', 'โมดูล 6: โครงงานและนวัตกรรมการสอน', 'การจัดผังโครงงาน STEM, การกระจายบทบาท 4 เสาหลัก CT, และกำหนดหมุดหมาย Milestone', 20.00],
        [12, 'การจัดทำรูปเล่มรายงานวิจัยตามมาตรฐาน XeLaTeX B5 (Thesis & Academic Publishing)', 'โมดูล 6: โครงงานและนวัตกรรมการสอน', 'การจัดฟอร์แมตเอกสารวิชาการมาตรฐาน มรภ.รำไพพรรณี, ดัชนีคำศัพท์, และสมการคณิตศาสตร์', 20.00],
        [13, 'ห้องปฏิบัติการกลศาสตร์และฟิสิกส์เชิงคำนวณขั้นสูง (Computational Mechanics Lab)', 'โมดูล 7: ห้องทดลองเสมือนจริงขั้นสูง', 'การจำลองระบบสปริงหน่วง, ซิมูเลเตอร์อนุภาคแรงโน้มถ่วง, และการเรนเดอร์ 60 FPS', 20.00],
        [14, 'การประเมินการจัดการเรียนรู้จุลภาคและ AAR (Micro-teaching & Rubrics Synthesizer)', 'โมดูล 8: ประเมินผลและการสังเคราะห์วิชาชีพ', 'การสังเคราะห์ผลหลังการปฏิบัติงาน (After Action Review) และการประเมินตามเกณฑ์ TQF/OBE', 20.00],
        [15, 'หอนิทรรศการนวัตกรรมเสมือนจริง 3 มิติ (3D Innovation Showcase Gallery)', 'โมดูล 8: ประเมินผลและการสังเคราะห์วิชาชีพ', 'นิทรรศการแสดงผลงาน 3D Virtual Gallery, โมเดลสื่อการสอนวิทยาศาสตร์เสมือนจริง', 20.00],
        [16, 'การตรวจสอบความปลอดภัยซอฟต์แวร์และ PDPA (OWASP Security & Digital Ethics)', 'โมดูล 8: ประเมินผลและการสังเคราะห์วิชาชีพ', 'การตรวจหาช่องโหว่ความปลอดภัย, จรรยาบรรณดิจิทัลและ AI สำหรับครูยุคใหม่', 20.00],
    ];

    $stmtAssign = $db->prepare("INSERT OR REPLACE INTO assignments (week, title, module_name, description, rubric_max_score) VALUES (?, ?, ?, ?, ?)");
    foreach ($assignments as $a) {
        $stmtAssign->execute($a);
    }
    echo "✓ Seeded 16 Curriculum Assignments.\n";

    // 3. Seed Students
    $students = [
        ['6614401001', 'จิรภัทร ชัยมงคล', 'jirapat.c@rbru.ac.th', 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)', 'คณะครุศาสตร์', '#0284c7'],
        ['6614401002', 'ธนพร สุขเกษม', 'thanaporn.s@rbru.ac.th', 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)', 'คณะครุศาสตร์', '#10b981'],
        ['6614401003', 'ณัฐวุฒิ วิจิตรกุล', 'nattawut.w@rbru.ac.th', 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)', 'คณะครุศาสตร์', '#f59e0b'],
        ['6614401004', 'ศิริพร บุญยืน', 'siriporn.b@rbru.ac.th', 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)', 'คณะครุศาสตร์', '#8b5cf6'],
        ['6614401005', 'กานต์ดา มณีรัตน์', 'kanda.m@rbru.ac.th', 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)', 'คณะครุศาสตร์', '#ec4899'],
    ];

    $stmtStudent = $db->prepare("INSERT OR REPLACE INTO students (student_id, student_name, email, department, faculty, avatar_color) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($students as $s) {
        $stmtStudent->execute($s);
    }
    echo "✓ Seeded 5 Sample Student Profiles.\n";

    // 4. Migrate existing submissions from data/submissions.json if exists
    $jsonFile = __DIR__ . '/../data/submissions.json';
    if (file_exists($jsonFile)) {
        $raw = file_get_contents($jsonFile);
        $subs = json_decode($raw, true) ?: [];
        $migratedCount = 0;

        $stmtSub = $db->prepare("INSERT OR REPLACE INTO submissions (submission_id, student_id, student_name, week, assignment_title, work_link, decomp_text, pattern_text, abstr_text, algo_text, reflection_text, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmtEval = $db->prepare("INSERT OR REPLACE INTO evaluations (submission_id, score_decomp, score_pattern, score_abstr, score_algo, total_score, max_score, grade, cognitive_level, strengths_json, growth_areas_json, personalized_feedback, pedagogical_recommendations_json, instructor_name, evaluated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        foreach ($subs as $sub) {
            $sid = $sub['submission_id'] ?? ('SUB-' . uniqid());
            $stId = $sub['student_id'] ?? '6614401001';
            $stName = $sub['student_name'] ?? 'จิรภัทร ชัยมงคล';
            $wk = intval($sub['week'] ?? 1);
            $title = $sub['assignment_title'] ?? 'ปฏิบัติการ Problem-Based Learning CT Workshop';
            $link = $sub['work_link'] ?? '';
            $inp = $sub['student_input'] ?? [];
            $ev = $sub['evaluation'] ?? [];
            $scores = $ev['scores'] ?? [];
            $createdAt = $sub['timestamp'] ?? date('c');

            // Ensure student exists
            $stmtStudent->execute([$stId, $stName, $stId . '@rbru.ac.th', 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)', 'คณะครุศาสตร์', '#0284c7']);

            // Insert submission
            $stmtSub->execute([
                $sid,
                $stId,
                $stName,
                $wk,
                $title,
                $link,
                $inp['decomp'] ?? '',
                $inp['pattern'] ?? '',
                $inp['abstr'] ?? '',
                $inp['algo'] ?? '',
                $inp['reflection'] ?? '',
                'graded',
                $createdAt
            ]);

            // Insert evaluation
            $stmtEval->execute([
                $sid,
                floatval($scores['decomp'] ?? 4.0),
                floatval($scores['pattern'] ?? 4.0),
                floatval($scores['abstr'] ?? 4.0),
                floatval($scores['algo'] ?? 4.0),
                floatval($scores['total'] ?? 16.0),
                floatval($scores['max_total'] ?? 20.0),
                $scores['grade'] ?? 'ดีมาก (A)',
                $ev['cognitive_level'] ?? 'Applying',
                json_encode($ev['strengths'] ?? [], JSON_UNESCAPED_UNICODE),
                json_encode($ev['growth_areas'] ?? [], JSON_UNESCAPED_UNICODE),
                $ev['personalized_feedback'] ?? '',
                json_encode($ev['pedagogical_recommendations'] ?? [], JSON_UNESCAPED_UNICODE),
                'ผศ.ดร.ชีวะ ทัศนา (AI Copilot)',
                $createdAt
            ]);

            $migratedCount++;
        }
        echo "✓ Migrated $migratedCount existing submissions from data/submissions.json.\n";
    }

    // 5. Update learner analytics table
    $db->exec("
        INSERT OR REPLACE INTO learner_analytics (student_id, submissions_count, avg_total_score, avg_decomp, avg_pattern, avg_abstr, avg_algo, primary_cognitive_level, last_active_at, updated_at)
        SELECT 
            s.student_id,
            COUNT(sub.submission_id) as submissions_count,
            ROUND(IFNULL(AVG(e.total_score), 0), 2) as avg_total_score,
            ROUND(IFNULL(AVG(e.score_decomp), 0), 2) as avg_decomp,
            ROUND(IFNULL(AVG(e.score_pattern), 0), 2) as avg_pattern,
            ROUND(IFNULL(AVG(e.score_abstr), 0), 2) as avg_abstr,
            ROUND(IFNULL(AVG(e.score_algo), 0), 2) as avg_algo,
            CASE 
                WHEN AVG(e.total_score) >= 17.5 THEN 'Creating'
                WHEN AVG(e.total_score) >= 15.0 THEN 'Evaluating'
                WHEN AVG(e.total_score) >= 12.0 THEN 'Analyzing'
                ELSE 'Applying'
            END as primary_cognitive_level,
            MAX(sub.created_at) as last_active_at,
            CURRENT_TIMESTAMP as updated_at
        FROM students s
        LEFT JOIN submissions sub ON s.student_id = sub.student_id
        LEFT JOIN evaluations e ON sub.submission_id = e.submission_id
        GROUP BY s.student_id;
    ");
    echo "✓ Synthesized Learner Analytics summary for all students.\n";

    echo "========================================================\n";
    echo "🎉 Database Initialized & Verified Successfully!\n";
    echo "========================================================\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

