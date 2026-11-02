<?php
/**
 * REST API: Student Assignment Submission & AI Pedagogical Assessment Engine
 * Course 4124941 Computational Science for Science Teaching
 * Instructor: Asst. Prof. Dr. Chewa Thassana, RBRU
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
ini_set('serialize_precision', '14');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../database/db.php';
require_once __DIR__ . '/google_sheets_sync.php';
$dataFile = __DIR__ . '/../data/submissions.json';

// Initialize data directory & file if not exists
if (!is_dir(__DIR__ . '/../data')) {
    mkdir(__DIR__ . '/../data', 0777, true);
}
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

// -------------------------------------------------------------
// GET: Query Submissions, Evaluations, or Learner Analytics
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $studentId = isset($_GET['student_id']) ? trim($_GET['student_id']) : '';
    $week = isset($_GET['week']) ? intval($_GET['week']) : 0;
    $analyticsReq = isset($_GET['analytics']) && ($_GET['analytics'] === '1' || $_GET['analytics'] === 'true');

    try {
        $db = Database::getConnection();

        // If analytics summary requested
        if ($analyticsReq) {
            $totalStudents = (int)$db->query("SELECT COUNT(*) FROM students")->fetchColumn();
            $totalSubs = (int)$db->query("SELECT COUNT(*) FROM submissions")->fetchColumn();
            
            $statsStmt = $db->query("
                SELECT 
                    ROUND(AVG(total_score), 2) as avg_score,
                    ROUND(AVG(score_decomp), 2) as avg_decomp,
                    ROUND(AVG(score_pattern), 2) as avg_pattern,
                    ROUND(AVG(score_abstr), 2) as avg_abstr,
                    ROUND(AVG(score_algo), 2) as avg_algo,
                    MAX(total_score) as max_score,
                    MIN(total_score) as min_score
                FROM evaluations
            ");
            $rawStats = $statsStmt->fetch() ?: [];
            $stats = [
                'avg_score' => round((float)($rawStats['avg_score'] ?? 0), 2),
                'avg_decomp' => round((float)($rawStats['avg_decomp'] ?? 0), 2),
                'avg_pattern' => round((float)($rawStats['avg_pattern'] ?? 0), 2),
                'avg_abstr' => round((float)($rawStats['avg_abstr'] ?? 0), 2),
                'avg_algo' => round((float)($rawStats['avg_algo'] ?? 0), 2),
                'max_score' => round((float)($rawStats['max_score'] ?? 0), 2),
                'min_score' => round((float)($rawStats['min_score'] ?? 0), 2)
            ];

            // Cognitive distribution
            $cogStmt = $db->query("
                SELECT cognitive_level, COUNT(*) as count 
                FROM evaluations 
                GROUP BY cognitive_level
            ");
            $cogDist = $cogStmt->fetchAll();

            // Recent submissions
            $recentStmt = $db->query("
                SELECT 
                    sub.submission_id, sub.student_id, sub.student_name, sub.week, sub.assignment_title, sub.created_at,
                    e.total_score, e.grade, e.cognitive_level
                FROM submissions sub
                LEFT JOIN evaluations e ON sub.submission_id = e.submission_id
                ORDER BY sub.created_at DESC
                LIMIT 10
            ");
            $recent = $recentStmt->fetchAll();

            echo json_encode([
                'status' => 'success',
                'analytics' => [
                    'total_students' => $totalStudents,
                    'total_submissions' => $totalSubs,
                    'class_stats' => $stats,
                    'cognitive_distribution' => $cogDist,
                    'recent_submissions' => $recent
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Query submissions by filter
        $sql = "
            SELECT 
                sub.submission_id,
                sub.student_id,
                sub.student_name,
                sub.week,
                sub.assignment_title,
                sub.work_link,
                sub.decomp_text,
                sub.pattern_text,
                sub.abstr_text,
                sub.algo_text,
                sub.reflection_text,
                sub.status,
                sub.created_at as timestamp,
                e.score_decomp,
                e.score_pattern,
                e.score_abstr,
                e.score_algo,
                e.total_score,
                e.max_score,
                e.grade,
                e.cognitive_level,
                e.strengths_json,
                e.growth_areas_json,
                e.personalized_feedback,
                e.pedagogical_recommendations_json,
                e.instructor_name
            FROM submissions sub
            LEFT JOIN evaluations e ON sub.submission_id = e.submission_id
        ";

        $params = [];
        $where = [];

        if ($studentId !== '') {
            $where[] = "sub.student_id = ?";
            $params[] = $studentId;
        }
        if ($week > 0) {
            $where[] = "sub.week = ?";
            $params[] = $week;
        }

        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        $sql .= " ORDER BY sub.created_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Format to standard response shape
        $formatted = [];
        foreach ($rows as $r) {
            $tScore = (float)$r['total_score'];
            $badgeColor = '#10b981';
            $profLevel = 'Exemplary (ดีเยี่ยมยอด)';
            if ($tScore < 12) {
                $badgeColor = '#ef4444';
                $profLevel = 'Developing (ควรพัฒนา)';
            } elseif ($tScore < 15) {
                $badgeColor = '#f59e0b';
                $profLevel = 'Competent (ดี)';
            } elseif ($tScore < 17) {
                $badgeColor = '#0284c7';
                $profLevel = 'Proficient (ดีมาก)';
            }

            $formatted[] = [
                'submission_id' => $r['submission_id'],
                'timestamp' => $r['timestamp'],
                'student_id' => $r['student_id'],
                'student_name' => $r['student_name'],
                'week' => (int)$r['week'],
                'assignment_title' => $r['assignment_title'],
                'work_link' => $r['work_link'],
                'student_input' => [
                    'decomp' => $r['decomp_text'],
                    'pattern' => $r['pattern_text'],
                    'abstr' => $r['abstr_text'],
                    'algo' => $r['algo_text'],
                    'reflection' => $r['reflection_text']
                ],
                'evaluation' => [
                    'scores' => [
                        'decomp' => (float)$r['score_decomp'],
                        'pattern' => (float)$r['score_pattern'],
                        'abstr' => (float)$r['score_abstr'],
                        'algo' => (float)$r['score_algo'],
                        'total' => $tScore,
                        'max_total' => (float)$r['max_score'],
                        'percentage' => round(($tScore / (float)($r['max_score'] ?: 20.0)) * 100, 1),
                        'grade' => $r['grade'],
                        'level' => $profLevel
                    ],
                    'proficiency_level' => $profLevel,
                    'badge_color' => $badgeColor,
                    'cognitive_level' => $r['cognitive_level'],
                    'strengths' => json_decode($r['strengths_json'] ?? '[]', true) ?: [],
                    'growth_areas' => json_decode($r['growth_areas_json'] ?? '[]', true) ?: [],
                    'personalized_feedback' => $r['personalized_feedback'],
                    'pedagogical_recommendations' => json_decode($r['pedagogical_recommendations_json'] ?? '[]', true) ?: [],
                    'instructor' => $r['instructor_name']
                ]
            ];
        }

        echo json_encode(['status' => 'success', 'data' => $formatted], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        // Fallback to JSON if database error
        $raw = file_get_contents($dataFile);
        $all = json_decode($raw, true) ?: [];

        if ($studentId !== '') {
            $all = array_values(array_filter($all, fn($item) => $item['student_id'] === $studentId));
        } elseif ($week > 0) {
            $all = array_values(array_filter($all, fn($item) => intval($item['week']) === $week));
        }

        echo json_encode(['status' => 'success', 'data' => $all, 'source' => 'json_fallback'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// POST: Submit Student Assignment & Run AI Evaluation
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (empty($rawInput)) {
        $rawInput = file_get_contents('php://stdin');
    }
    $input = json_decode($rawInput, true);

    if (!$input) {
        echo json_encode(['status' => 'error', 'message' => 'ข้อมูลไม่ถูกต้อง (Invalid JSON format)'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $studentId = trim($input['student_id'] ?? '');
    $studentName = trim($input['student_name'] ?? '');
    $week = intval($input['week'] ?? 1);
    $assignmentTitle = trim($input['assignment_title'] ?? 'ปฏิบัติการ Problem-Based Learning CT Workshop');

    $decomp = trim($input['decomp'] ?? '');
    $pattern = trim($input['pattern'] ?? '');
    $abstr = trim($input['abstr'] ?? '');
    $algo = trim($input['algo'] ?? '');
    $reflection = trim($input['reflection'] ?? '');
    $workLink = trim($input['work_link'] ?? '');

    if (empty($studentId) || empty($studentName)) {
        echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกรหัสนักศึกษาและชื่อ-นามสกุล'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // AI Formative Assessment Engine
    $eval = evaluateSubmission($decomp, $pattern, $abstr, $algo, $reflection, $week);

    $subId = 'SUB-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid($studentId, true)), 0, 6));
    $timestamp = date('c');

    $record = [
        'submission_id' => $subId,
        'timestamp' => $timestamp,
        'student_id' => $studentId,
        'student_name' => $studentName,
        'week' => $week,
        'assignment_title' => $assignmentTitle,
        'work_link' => $workLink,
        'student_input' => [
            'decomp' => $decomp,
            'pattern' => $pattern,
            'abstr' => $abstr,
            'algo' => $algo,
            'reflection' => $reflection
        ],
        'evaluation' => $eval
    ];

    // Persist to Relational Database (SQLite / MySQL)
    try {
        $db = Database::getConnection();

        // 1. Ensure student profile exists
        $stmtStudent = $db->prepare("
            INSERT INTO students (student_id, student_name, email, department, faculty, avatar_color)
            VALUES (?, ?, ?, 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)', 'คณะครุศาสตร์ / มรภ.รำไพพรรณี', '#0284c7')
            ON CONFLICT(student_id) DO UPDATE SET student_name = excluded.student_name
        ");
        $stmtStudent->execute([$studentId, $studentName, $studentId . '@rbru.ac.th']);

        // 2. Ensure assignment exists
        $stmtAssign = $db->prepare("
            INSERT OR IGNORE INTO assignments (week, title, module_name, description, rubric_max_score)
            VALUES (?, ?, 'โมดูลวิทยาการคำนวณสะเต็ม', 'การแก้ปัญหาทางวิทยาศาสตร์ด้วยการคิดเชิงคำนวณ', 20.00)
        ");
        $stmtAssign->execute([$week, $assignmentTitle]);

        // 3. Insert submission
        $stmtSub = $db->prepare("
            INSERT INTO submissions (
                submission_id, student_id, student_name, week, assignment_title, work_link,
                decomp_text, pattern_text, abstr_text, algo_text, reflection_text, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'graded', ?, ?)
        ");
        $stmtSub->execute([
            $subId, $studentId, $studentName, $week, $assignmentTitle, $workLink,
            $decomp, $pattern, $abstr, $algo, $reflection, $timestamp, $timestamp
        ]);

        // 4. Insert evaluation
        $scores = $eval['scores'];
        $stmtEval = $db->prepare("
            INSERT INTO evaluations (
                submission_id, score_decomp, score_pattern, score_abstr, score_algo,
                total_score, max_score, grade, cognitive_level,
                strengths_json, growth_areas_json, personalized_feedback, pedagogical_recommendations_json,
                instructor_name, evaluated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmtEval->execute([
            $subId,
            $scores['decomp'],
            $scores['pattern'],
            $scores['abstr'],
            $scores['algo'],
            $scores['total'],
            $scores['max_total'],
            $scores['grade'],
            $eval['cognitive_level'],
            json_encode($eval['strengths'], JSON_UNESCAPED_UNICODE),
            json_encode($eval['growth_areas'], JSON_UNESCAPED_UNICODE),
            $eval['personalized_feedback'],
            json_encode($eval['pedagogical_recommendations'], JSON_UNESCAPED_UNICODE),
            'ผศ.ดร.ชีวะ ทัศนา (AI Copilot)',
            $timestamp
        ]);

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
                    WHEN AVG(e.total_score) >= 17.5 THEN 'Creating (การคิดสร้างสรรค์)'
                    WHEN AVG(e.total_score) >= 15.0 THEN 'Evaluating (การประเมินค่า)'
                    WHEN AVG(e.total_score) >= 12.0 THEN 'Analyzing (การวิเคราะห์)'
                    ELSE 'Applying (การประยุกต์ใช้)'
                END as primary_cognitive_level,
                MAX(sub.created_at) as last_active_at,
                CURRENT_TIMESTAMP as updated_at
            FROM students s
            LEFT JOIN submissions sub ON s.student_id = sub.student_id
            LEFT JOIN evaluations e ON sub.submission_id = e.submission_id
            WHERE s.student_id = " . $db->quote($studentId) . "
            GROUP BY s.student_id;
        ");

    } catch (Exception $dbErr) {
        // Log database warning but continue to save JSON backup
        error_log("Database persistence note: " . $dbErr->getMessage());
    }

    // Synchronize to JSON file backup
    $raw = file_get_contents($dataFile);
    $all = json_decode($raw, true) ?: [];
    array_unshift($all, $record);
    file_put_contents($dataFile, json_encode($all, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    // Synchronize to Google Sheets Webhook (Non-blocking / Safe)
    $sheetsSyncResult = syncToGoogleSheets($record);
    $record['google_sheets_sync'] = $sheetsSyncResult;

    echo json_encode([
        'status' => 'success',
        'message' => 'บันทึกข้อมูลลงฐานข้อมูลและประเมินผลเรียบร้อยแล้ว',
        'data' => $record,
        'google_sheets_sync' => $sheetsSyncResult
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// Scoring & Pedagogical Rubric Engine
// -------------------------------------------------------------
function evaluateSubmission($decomp, $pattern, $abstr, $algo, $reflection, $week) {
    // 4 Dimensions: max 5 points each (Total 20 points)
    $scoreDecomp = scoreComponent($decomp, ['ย่อย', 'ตัวแปร', 'ระบบ', 'สาเหตุ', 'ส่วนประกอบ', 'ปัจจัย', 'ปัญหา']);
    $scorePattern = scoreComponent($pattern, ['รูปแบบ', 'ซ้ำ', 'แนวโน้ม', 'รอบ', 'กราฟ', 'ความถี่', 'สัมพันธ์']);
    $scoreAbstr = scoreComponent($abstr, ['ตัด', 'สำคัญ', 'คัดกรอง', 'โมเดล', 'สมการ', 'ตัวเลข', 'มวลจุด', 'แก่น']);
    $scoreAlgo = scoreComponent($algo, ['ขั้นตอน', 'เงื่อนไข', 'ถ้า', 'วนซ้ำ', 'ผังงาน', 'if', 'loop', 'ตรวจสอบ']);
    $scoreReflect = scoreComponent($reflection, ['เรียนรู้', 'เข้าใจ', 'สอน', 'นักเรียน', 'ปรับปรุง', 'ประทับใจ', 'ทดลอง']);

    // Normalize to 4 criteria x 5 points = 20 points
    $c1 = round(min(5.0, max(2.5, ($scoreDecomp * 0.6 + $scoreAbstr * 0.4))), 1);
    $c2 = round(min(5.0, max(2.5, ($scorePattern * 0.8 + 1.0))), 1);
    $c3 = round(min(5.0, max(2.5, ($scoreAlgo * 0.9 + 0.5))), 1);
    $c4 = round(min(5.0, max(2.5, ($scoreReflect * 0.7 + 1.2))), 1);

    $total = round($c1 + $c2 + $c3 + $c4, 1);
    $pct = round(($total / 20.0) * 100, 1);

    if ($pct >= 85) {
        $level = 'Exemplary (ดีเยี่ยมยอด - สมรรถนะระดับสูง)';
        $grade = 'A (ดีเยี่ยมยอด)';
        $cogLevel = 'Creating (การคิดสร้างสรรค์)';
    } elseif ($pct >= 75) {
        $level = 'Proficient (ดีมาก - มีสมรรถนะตามเกณฑ์)';
        $grade = 'B+ (ดีมาก)';
        $cogLevel = 'Evaluating (การประเมินค่า)';
    } elseif ($pct >= 65) {
        $level = 'Competent (ดี - ผ่านเกณฑ์มาตรฐาน)';
        $grade = 'B (ดี)';
        $cogLevel = 'Analyzing (การวิเคราะห์)';
    } else {
        $level = 'Developing (ควรพัฒนาเพิ่มเติม)';
        $grade = 'C+ (พอใช้)';
        $cogLevel = 'Applying (การประยุกต์ใช้)';
    }

    // Qualitative Feedback in Dr. Chewa's Academic Voice
    $strengths = [];
    $growthAreas = [];
    $pedagogyTips = [];

    if ($c1 >= 4.0) {
        $strengths[] = "มีความเข้าใจมโนทัศน์การคิดเชิงนามธรรม (Abstraction) และการแยกส่วนประกอบ (Decomposition) ได้อย่างชัดเจนเป็นระบบ สามารถสกัดเฉพาะตัวแปรสำคัญทางวิทยาศาสตร์ได้ดีเยี่ยม";
    } else {
        $growthAreas[] = "ควรระบุตัวแปรควบคุมและสกัดสมการหรือโมเดลทางคณิตศาสตร์ให้กระชับยิ่งขึ้น โดยตัดข้อมูลรบกวน (Noise) ที่ไม่ส่งผลต่อผลลัพธ์ออก";
    }

    if ($c2 >= 4.0) {
        $strengths[] = "สามารถตรวจจับและวิเคราะห์แนวโน้มของข้อมูล (Pattern Recognition) ได้แม่นยำ มองเห็นความสัมพันธ์เชิงฟังก์ชันของตัวแปรทางวิทยาศาสตร์";
    } else {
        $growthAreas[] = "ฝึกสังเกตคาบเวลา วงรอบ หรือการเปลี่ยนแปลงของกราฟ เพื่อนำไปสู่การตั้งสมมติฐานการทดลองที่รัดกุม";
    }

    if ($c3 >= 4.0) {
        $strengths[] = "การออกแบบขั้นตอนวิธี (Algorithm Design) มีลำดับตรรกะที่รัดกุม มีการกำหนดเงื่อนไขการตัดสินใจ และคำนึงถึงขอบเขตความปลอดภัย (Boundary Condition)";
    } else {
        $growthAreas[] = "เพิ่มขั้นตอนการตรวจสอบเงื่อนไขขอบเขต (Boundary Checks) และการป้องกันข้อผิดพลาดเชิงตรรกะ (Defensive Logic) เช่น การหารด้วยศูนย์";
    }

    if ($c4 >= 4.0) {
        $strengths[] = "มีทักษะการสะท้อนคิด (Metacognitive Reflection) ระดับสูง มองเห็นแนวทางการประยุกต์ใช้ในการจัดการเรียนการสอนวิทยาศาสตร์ในโรงเรียนอย่างเป็นรูปธรรม";
    } else {
        $growthAreas[] = "เชื่อมโยงความรู้ที่ได้จากการทดลองกับการออกแบบแผนการสอนวิทยาศาสตร์ระดับมัธยมศึกษาให้ชัดเจนยิ่งขึ้น";
    }

    // Dr. Chewa's Personalized Feedback Synthesis
    $feedback = "อาจารย์ได้ตรวจผลงานของนักศึกษาแล้ว ขอชื่นชมในความตั้งใจและการวิเคราะห์ปัญหา ";
    if ($total >= 17) {
        $feedback .= "นักศึกษาสามารถบูรณาการ 4 เสาหลัก CT เข้ากับการจำลองทางวิทยาศาสตร์ได้อย่างลึกซึ้ง ตรรกะของอัลกอริทึมมีความสมบูรณ์แบบพร้อมนำไปต่อยอดสร้างนวัตกรรมการสอนจริงในห้องเรียนระดับมัธยม ขอให้รักษามาตรฐานความเป็นครูวิทยาศาสตร์ดิจิทัลนี้ไว้ครับ";
    } elseif ($total >= 14) {
        $feedback .= "ผลงานมีความก้าวหน้าและเข้าใจหลักการสำคัญเป็นอย่างดี หากเพิ่มการวิเคราะห์เงื่อนไขขอบเขตและระบุตัวแปรสำคัญในเชิงคณิตศาสตร์ให้กระชับอีกนิด ผลงานจะมีความเฉียบคมระดับวิชาการมากยิ่งขึ้นครับ";
    } else {
        $feedback .= "เป็นจุดเริ่มต้นที่ดีในการฝึกมองปรากฏการณ์ธรรมชาติผ่านมุมมอง Computational Thinking ขอให้ทบทวนการตัดทอนสิ่งที่ไม่จำเป็น (Abstraction) เพื่อให้โมเดลประมวลผลได้แม่นยำขึ้น แล้วส่งให้อาจารย์ดูอีกครั้งได้เลยครับ";
    }

    $pedagogyTips = [
        "นำแนวคิดการจำลองนี้ไปปรับใช้เป็นกิจกรรม Unplugged ร่วมกับ Plugged ในห้องเรียนวิทยาศาสตร์",
        "ใช้วิธีการตั้งคำถามกระตุ้น (Scaffolding Questions) ให้นักเรียนค้นพบแบบแผนด้วยตนเองตามแนวทาง 5E",
        "เน้นย้ำความปลอดภัยและจริยธรรมข้อมูล (AI Ethics) ควบคู่กับกระบวนการทางวิทยาศาสตร์เสมอ"
    ];

    return [
        'scores' => [
            'decomp' => $c1,
            'pattern' => $c2,
            'abstr' => $c3,
            'algo' => $c4,
            'total' => $total,
            'max_total' => 20.0,
            'percentage' => $pct,
            'grade' => $grade,
            'level' => $level
        ],
        'cognitive_level' => $cogLevel,
        'strengths' => $strengths,
        'growth_areas' => $growthAreas,
        'personalized_feedback' => $feedback,
        'pedagogical_recommendations' => $pedagogyTips,
        'evaluator' => 'ผศ.ดร.ชีวะ ทัศนา (อาจารย์ผู้รับผิดชอบรายวิชา)'
    ];
}

function scoreComponent($text, $keywords) {
    if (empty($text)) return 2.0;
    $len = mb_strlen($text, 'UTF-8');
    $score = 2.0;
    
    // Length bonus
    if ($len > 30) $score += 0.8;
    if ($len > 80) $score += 0.8;
    if ($len > 150) $score += 0.4;

    // Keyword match bonus
    $matches = 0;
    foreach ($keywords as $kw) {
        if (mb_strpos($text, $kw, 0, 'UTF-8') !== false) {
            $matches++;
        }
    }
    $score += min(1.0, $matches * 0.25);

    return min(5.0, max(2.0, $score));
}
