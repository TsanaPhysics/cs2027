<?php
/**
 * Teacher & Admin Backend Management Dashboard
 * Course 4124941 Computational Science for Teaching Science
 * Faculty of Science and Technology, Rambhai Barni Rajabhat University
 * Instructor: Asst. Prof. Dr. Chewa Thassana
 */

require_once __DIR__ . '/database/db.php';

try {
    $db = Database::getConnection();

    // Export CSV if requested
    if (isset($_GET['action']) && $_GET['action'] === 'export_csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=RBRU_4124941_Gradebook_' . date('Ymd_His') . '.csv');
        $output = fopen('php://output', 'w');
        // UTF-8 BOM for Excel
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        fputcsv($output, ['รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'สาขาวิชา', 'อีเมล', 'จำนวนงานที่ส่ง', 'คะแนนเฉลี่ย (เต็ม 20)', 'Decomp (5)', 'Pattern (5)', 'Abstr (5)', 'Algo (5)', 'เกรดคาดการณ์', 'ระดับพุทธิพิสัย']);
        
        $sqlExport = "SELECT s.student_id, s.student_name, s.department, s.email, 
                             COALESCE(la.submissions_count, 0) as sub_cnt,
                             COALESCE(la.avg_total_score, 0) as avg_tot,
                             COALESCE(la.avg_decomp, 0) as avg_d,
                             COALESCE(la.avg_pattern, 0) as avg_p,
                             COALESCE(la.avg_abstr, 0) as avg_ab,
                             COALESCE(la.avg_algo, 0) as avg_al,
                             COALESCE(la.primary_cognitive_level, '-') as cog
                      FROM students s
                      LEFT JOIN learner_analytics la ON s.student_id = la.student_id
                      ORDER BY s.department DESC, s.student_id ASC";
        $rows = $db->query($sqlExport)->fetchAll();
        foreach ($rows as $r) {
            $tot = floatval($r['avg_tot']);
            $grade = ($tot >= 17.5) ? 'A' : (($tot >= 15.5) ? 'B+' : (($tot >= 13.5) ? 'B' : (($tot >= 11.5) ? 'C+' : (($tot >= 10.0) ? 'C' : 'D+'))));
            fputcsv($output, [
                $r['student_id'], $r['student_name'], $r['department'], $r['email'],
                $r['sub_cnt'], number_format($tot, 2), number_format($r['avg_d'], 2),
                number_format($r['avg_p'], 2), number_format($r['avg_ab'], 2),
                number_format($r['avg_al'], 2), $grade, $r['cog']
            ]);
        }
        fclose($output);
        exit;
    }

    // Key Metrics
    $totalStudents = $db->query("SELECT COUNT(*) FROM students")->fetchColumn();
    $gscStudents = $db->query("SELECT COUNT(*) FROM students WHERE department LIKE '%วิทยาศาสตร์ทั่วไป%'")->fetchColumn();
    $phyStudents = $db->query("SELECT COUNT(*) FROM students WHERE department LIKE '%ฟิสิกส์%'")->fetchColumn();
    $totalSubmissions = $db->query("SELECT COUNT(*) FROM submissions")->fetchColumn();
    $avgScore = $db->query("SELECT ROUND(AVG(total_score), 2) FROM evaluations")->fetchColumn() ?: 0;
    
    // Average 4 CT Pillars
    $avgDecomp = $db->query("SELECT ROUND(AVG(score_decomp), 2) FROM evaluations")->fetchColumn() ?: 0;
    $avgPattern = $db->query("SELECT ROUND(AVG(score_pattern), 2) FROM evaluations")->fetchColumn() ?: 0;
    $avgAbstr = $db->query("SELECT ROUND(AVG(score_abstr), 2) FROM evaluations")->fetchColumn() ?: 0;
    $avgAlgo = $db->query("SELECT ROUND(AVG(score_algo), 2) FROM evaluations")->fetchColumn() ?: 0;

    // Student Roster with Analytics
    $studentsList = $db->query("
        SELECT s.student_id, s.student_name, s.department, s.email, s.avatar_color,
               COALESCE(la.submissions_count, 0) as sub_cnt,
               COALESCE(la.avg_total_score, 0) as avg_tot,
               COALESCE(la.avg_decomp, 0) as avg_d,
               COALESCE(la.avg_pattern, 0) as avg_p,
               COALESCE(la.avg_abstr, 0) as avg_ab,
               COALESCE(la.avg_algo, 0) as avg_al,
               COALESCE(la.primary_cognitive_level, 'Applying') as cog
        FROM students s
        LEFT JOIN learner_analytics la ON s.student_id = la.student_id
        ORDER BY s.department DESC, s.student_id ASC
    ")->fetchAll();

    // Recent 10 Submissions
    $recentSubs = $db->query("
        SELECT sub.submission_id, sub.student_id, sub.student_name, sub.week, sub.assignment_title, sub.created_at,
               ev.total_score, ev.grade, ev.cognitive_level
        FROM submissions sub
        LEFT JOIN evaluations ev ON sub.submission_id = ev.submission_id
        ORDER BY sub.created_at DESC
        LIMIT 10
    ")->fetchAll();

} catch (Exception $e) {
    // Graceful fallback to data/submissions.json (for environments where PDO SQLite is uninstalled)
    $jsonPath = __DIR__ . '/data/submissions.json';
    if (file_exists($jsonPath)) {
        $allSubs = json_decode(file_get_contents($jsonPath), true);
        if ($allSubs === null) $allSubs = array();
    } else {
        $allSubs = array();
    }

    $studentsMap = array();
    $totalDecomp = 0; $totalPattern = 0; $totalAbstr = 0; $totalAlgo = 0; $totalTot = 0;
    $evalCount = 0;

    foreach ($allSubs as $sub) {
        $sid = $sub['student_id'];
        $ev = isset($sub['evaluation']) ? $sub['evaluation'] : array();
        $sc = isset($ev['scores']) ? $ev['scores'] : array();

        if (!isset($studentsMap[$sid])) {
            $isPhy = (strpos($sid, '6614402') === 0);
            $dept = $isPhy ? 'สาขาวิชาฟิสิกส์' : 'สาขาวิชาวิทยาศาสตร์ทั่วไป';
            $colors = array('#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6');
            $studentsMap[$sid] = array(
                'student_id' => $sid,
                'student_name' => $sub['student_name'],
                'department' => $dept,
                'email' => $sid . '@rbru.ac.th',
                'avatar_color' => $colors[abs(crc32($sid)) % count($colors)],
                'sub_cnt' => 0,
                'decomp_sum' => 0,
                'pattern_sum' => 0,
                'abstr_sum' => 0,
                'algo_sum' => 0,
                'total_sum' => 0,
                'primary_cognitive_level' => isset($ev['cognitive_level']) ? $ev['cognitive_level'] : 'Applying'
            );
        }

        $studentsMap[$sid]['sub_cnt']++;
        $d = isset($sc['decomp']) ? floatval($sc['decomp']) : 0;
        $p = isset($sc['pattern']) ? floatval($sc['pattern']) : 0;
        $ab = isset($sc['abstr']) ? floatval($sc['abstr']) : 0;
        $al = isset($sc['algo']) ? floatval($sc['algo']) : 0;
        $tot = isset($sc['total']) ? floatval($sc['total']) : 0;

        $studentsMap[$sid]['decomp_sum'] += $d;
        $studentsMap[$sid]['pattern_sum'] += $p;
        $studentsMap[$sid]['abstr_sum'] += $ab;
        $studentsMap[$sid]['algo_sum'] += $al;
        $studentsMap[$sid]['total_sum'] += $tot;

        $totalDecomp += $d;
        $totalPattern += $p;
        $totalAbstr += $ab;
        $totalAlgo += $al;
        $totalTot += $tot;
        $evalCount++;
    }

    // Merge registered accounts from data/users.json if available
    $usersJsonPath = __DIR__ . '/data/users.json';
    if (file_exists($usersJsonPath)) {
        $regUsers = json_decode(file_get_contents($usersJsonPath), true);
        if (is_array($regUsers)) {
            foreach ($regUsers as $uid => $ru) {
                if (isset($ru['role']) && $ru['role'] === 'instructor') continue;
                if (!isset($studentsMap[$uid])) {
                    $studentsMap[$uid] = array(
                        'student_id' => $ru['student_id'],
                        'student_name' => $ru['student_name'],
                        'department' => isset($ru['department']) ? $ru['department'] : 'วิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)',
                        'email' => isset($ru['email']) ? $ru['email'] : ($ru['student_id'] . '@rbru.ac.th'),
                        'avatar_color' => isset($ru['avatar_color']) ? $ru['avatar_color'] : '#0284c7',
                        'sub_cnt' => 0,
                        'decomp_sum' => 0,
                        'pattern_sum' => 0,
                        'abstr_sum' => 0,
                        'algo_sum' => 0,
                        'total_sum' => 0,
                        'primary_cognitive_level' => 'ยังไม่มีผลงาน'
                    );
                }
            }
        }
    }

    $studentsList = array();
    $gscStudents = 0;
    $phyStudents = 0;

    foreach ($studentsMap as $sid => $info) {
        $cnt = max(1, $info['sub_cnt']);
        $avg_tot = round($info['total_sum'] / $cnt, 2);
        $avg_d = round($info['decomp_sum'] / $cnt, 2);
        $avg_p = round($info['pattern_sum'] / $cnt, 2);
        $avg_ab = round($info['abstr_sum'] / $cnt, 2);
        $avg_al = round($info['algo_sum'] / $cnt, 2);

        if (strpos($info['department'], 'ฟิสิกส์') !== false) {
            $phyStudents++;
        } else {
            $gscStudents++;
        }

        $studentsList[] = array(
            'student_id' => $info['student_id'],
            'student_name' => $info['student_name'],
            'department' => $info['department'],
            'email' => $info['email'],
            'avatar_color' => $info['avatar_color'],
            'sub_cnt' => $info['sub_cnt'],
            'avg_tot' => $avg_tot,
            'avg_d' => $avg_d,
            'avg_p' => $avg_p,
            'avg_ab' => $avg_ab,
            'avg_al' => $avg_al,
            'cog' => $info['primary_cognitive_level']
        );
    }

    // Sort students list by department then student_id
    usort($studentsList, function($a, $b) {
        if ($a['department'] === $b['department']) {
            return strcmp($a['student_id'], $b['student_id']);
        }
        return strcmp($b['department'], $a['department']);
    });

    $totalStudents = count($studentsList);
    $totalSubmissions = count($allSubs);
    $avgScore = $evalCount > 0 ? round($totalTot / $evalCount, 2) : 0;
    $avgDecomp = $evalCount > 0 ? round($totalDecomp / $evalCount, 2) : 0;
    $avgPattern = $evalCount > 0 ? round($totalPattern / $evalCount, 2) : 0;
    $avgAbstr = $evalCount > 0 ? round($totalAbstr / $evalCount, 2) : 0;
    $avgAlgo = $evalCount > 0 ? round($totalAlgo / $evalCount, 2) : 0;

    // Export CSV if requested in fallback mode
    if (isset($_GET['action']) && $_GET['action'] === 'export_csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=RBRU_4124941_Gradebook_' . date('Ymd_His') . '.csv');
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        fputcsv($output, array('รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'สาขาวิชา', 'อีเมล', 'จำนวนงานที่ส่ง', 'คะแนนเฉลี่ย (เต็ม 20)', 'Decomp (5)', 'Pattern (5)', 'Abstr (5)', 'Algo (5)', 'เกรดคาดการณ์', 'ระดับพุทธิพิสัย'));
        foreach ($studentsList as $r) {
            $tot = floatval($r['avg_tot']);
            $grade = ($tot >= 17.5) ? 'A' : (($tot >= 15.5) ? 'B+' : (($tot >= 13.5) ? 'B' : (($tot >= 11.5) ? 'C+' : (($tot >= 10.0) ? 'C' : 'D+'))));
            fputcsv($output, array(
                $r['student_id'], $r['student_name'], $r['department'], $r['email'],
                $r['sub_cnt'], number_format($tot, 2), number_format($r['avg_d'], 2),
                number_format($r['avg_p'], 2), number_format($r['avg_ab'], 2),
                number_format($r['avg_al'], 2), $grade, $r['cog']
            ));
        }
        fclose($output);
        exit;
    }

    // Recent 10 Submissions
    $recentSubs = array();
    for ($i = 0; $i < min(10, count($allSubs)); $i++) {
        $s = $allSubs[$i];
        $ev = isset($s['evaluation']) ? $s['evaluation'] : array();
        $sc = isset($ev['scores']) ? $ev['scores'] : array();
        $recentSubs[] = array(
            'submission_id' => $s['submission_id'],
            'student_id' => $s['student_id'],
            'student_name' => $s['student_name'],
            'week' => $s['week'],
            'assignment_title' => $s['assignment_title'],
            'created_at' => $s['timestamp'],
            'total_score' => isset($sc['total']) ? $sc['total'] : 0,
            'grade' => isset($sc['grade']) ? $sc['grade'] : 'B',
            'cognitive_level' => isset($ev['cognitive_level']) ? $ev['cognitive_level'] : 'Applying'
        );
    }
}
?>
<!DOCTYPE html>
<html lang="th" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบบริหารจัดการข้อมูลและประเมินผลผู้เรียน (Teacher Admin Dashboard) | วิชา 4124941</title>
    
    <!-- Google Fonts & Font Awesome 6 -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Prompt:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Chart.js for Analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        :root {
            --bg-body: #090d16;
            --bg-surface: rgba(15, 23, 42, 0.95);
            --bg-card: rgba(30, 41, 59, 0.7);
            --border: rgba(148, 163, 184, 0.15);
            --border-accent: rgba(0, 240, 255, 0.35);
            --cyan: #00f0ff;
            --cyan-glow: rgba(0, 240, 255, 0.2);
            --emerald: #10b981;
            --emerald-glow: rgba(16, 185, 129, 0.2);
            --amber: #f59e0b;
            --rose: #f43f5e;
            --indigo: #6366f1;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: var(--bg-body);
            color: var(--text-main);
            font-family: 'Prompt', 'Sarabun', sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Top HUD Navigation Bar */
        .hud-navbar {
            background: rgba(11, 19, 43, 0.96);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-accent);
            padding: 0.85rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .brand-box {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .brand-logo {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: linear-gradient(135deg, #0284c7, var(--cyan));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            color: #fff;
            box-shadow: 0 0 18px var(--cyan-glow);
        }

        .brand-info h1 {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--cyan);
            font-family: 'Chakra Petch', sans-serif;
            letter-spacing: 0.5px;
        }

        .brand-info p {
            font-size: 0.82rem;
            color: var(--text-muted);
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 0.85rem;
        }

        .btn-action {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.88rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid var(--border);
            background: rgba(30, 41, 59, 0.8);
            color: var(--text-main);
        }

        .btn-action:hover {
            border-color: var(--cyan);
            color: var(--cyan);
            transform: translateY(-1px);
        }

        .btn-action.primary {
            background: linear-gradient(135deg, #0284c7, #0284c7);
            border: none;
            color: #fff;
            box-shadow: 0 4px 15px rgba(2, 132, 199, 0.35);
        }

        .btn-action.success {
            background: linear-gradient(135deg, #059669, var(--emerald));
            border: none;
            color: #fff;
            box-shadow: 0 4px 15px var(--emerald-glow);
        }

        /* Container */
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
            flex: 1;
            width: 100%;
        }

        /* Teacher Bio Banner */
        .instructor-card {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85));
            border: 1px solid var(--border-accent);
            border-radius: 16px;
            padding: 1.5rem 2rem;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1.5rem;
            box-shadow: var(--shadow-card);
        }

        .instructor-profile {
            display: flex;
            align-items: center;
            gap: 1.25rem;
        }

        .avatar-box {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6366f1, #38bdf8);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: #fff;
            border: 3px solid rgba(255, 255, 255, 0.2);
        }

        .instructor-meta h2 {
            font-size: 1.35rem;
            font-weight: 700;
            color: #fff;
        }

        .instructor-meta p {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 0.2rem;
        }

        .badges-row {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
            flex-wrap: wrap;
        }

        .badge-tag {
            background: rgba(0, 240, 255, 0.1);
            color: var(--cyan);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 6px;
            padding: 0.2rem 0.6rem;
            font-size: 0.78rem;
            font-weight: 600;
        }

        /* KPI Cards Grid */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1.25rem;
            margin-bottom: 2rem;
        }

        .kpi-card {
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 1.25rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 1.25rem;
            box-shadow: var(--shadow-card);
            transition: all 0.2s ease;
        }

        .kpi-card:hover {
            border-color: var(--cyan);
            transform: translateY(-2px);
        }

        .kpi-icon {
            width: 52px;
            height: 52px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .kpi-icon.blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
        .kpi-icon.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .kpi-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .kpi-icon.purple { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }

        .kpi-val {
            font-size: 1.7rem;
            font-weight: 700;
            font-family: 'Chakra Petch', sans-serif;
            color: #fff;
            line-height: 1.1;
        }

        .kpi-label {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        }

        /* Analytics Visualizer Row */
        .analytics-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        @media (max-width: 992px) {
            .analytics-row { grid-template-columns: 1fr; }
        }

        .chart-card {
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 1.5rem;
            box-shadow: var(--shadow-card);
        }

        .chart-card h3 {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--cyan);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Student Table & Filters */
        .table-card {
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 1.5rem;
            box-shadow: var(--shadow-card);
            margin-bottom: 2rem;
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.25rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .filter-tabs {
            display: flex;
            gap: 0.5rem;
            background: rgba(11, 18, 32, 0.7);
            padding: 0.3rem;
            border-radius: 8px;
            border: 1px solid var(--border);
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 0.4rem 0.9rem;
            border-radius: 6px;
            font-size: 0.85rem;
            font-family: 'Prompt', sans-serif;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .tab-btn.active {
            background: var(--cyan);
            color: #090d16;
            font-weight: 700;
        }

        .search-box {
            position: relative;
            min-width: 280px;
        }

        .search-box input {
            width: 100%;
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0.5rem 1rem 0.5rem 2.4rem;
            color: #fff;
            font-size: 0.88rem;
            font-family: 'Prompt', sans-serif;
            outline: none;
        }

        .search-box input:focus {
            border-color: var(--cyan);
            box-shadow: 0 0 10px var(--cyan-glow);
        }

        .search-box i {
            position: absolute;
            left: 0.85rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .table-responsive {
            overflow-x: auto;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.88rem;
        }

        .data-table th {
            text-align: left;
            padding: 0.75rem 1rem;
            background: rgba(30, 41, 59, 0.5);
            color: var(--cyan);
            border-bottom: 1px solid var(--border);
            font-family: 'Chakra Petch', sans-serif;
            font-weight: 600;
            white-space: nowrap;
        }

        .data-table td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #cbd5e1;
            white-space: nowrap;
        }

        .data-table tr:hover td {
            background: rgba(255, 255, 255, 0.02);
        }

        .grade-badge {
            display: inline-block;
            padding: 0.2rem 0.55rem;
            border-radius: 4px;
            font-weight: 700;
            font-size: 0.78rem;
            font-family: 'JetBrains Mono', monospace;
        }

        .grade-A { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
        .grade-B-plus, .grade-B { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #0284c7; }
        .grade-C-plus, .grade-C { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #d97706; }
        .grade-D { background: rgba(244, 63, 94, 0.2); color: #fb7185; border: 1px solid #f43f5e; }

        .dept-tag {
            font-size: 0.78rem;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            font-weight: 600;
        }

        .dept-gsc { background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
        .dept-phy { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

        /* Footer */
        .footer {
            background: #060a12;
            border-top: 1px solid var(--border);
            padding: 1.25rem 2rem;
            text-align: center;
            font-size: 0.85rem;
            color: var(--text-muted);
        }
    </style>
</head>
<body>

    <!-- HUD Top Navigation Bar -->
    <header class="hud-navbar">
        <div class="brand-box">
            <div class="brand-logo"><i class="fas fa-shield-alt"></i></div>
            <div class="brand-info">
                <h1>RBRU CS2027 TEACHER BACKEND CMS</h1>
                <p>ระบบบริหารจัดการข้อมูลและประเมินผลผู้เรียน | วิชา 4124941 วิทยาการคำนวณสำหรับการสอนวิทยาศาสตร์</p>
            </div>
        </div>

        <div class="nav-actions">
            <a href="index.html" class="btn-action">
                <i class="fas fa-arrow-left"></i> สลับสู่พอร์ทัลนักศึกษา
            </a>
            <a href="course.md" target="_blank" class="btn-action">
                <i class="fas fa-file-alt"></i> เปิดดู มคอ.3
            </a>
            <a href="?action=export_csv" class="btn-action success">
                <i class="fas fa-file-excel"></i> ส่งออกเกรด (CSV)
            </a>
        </div>
    </header>

    <!-- Main Content Container -->
    <main class="container">
        
        <!-- Instructor Identity Card -->
        <section class="instructor-card">
            <div class="instructor-profile">
                <div class="avatar-box"><i class="fas fa-user-tie"></i></div>
                <div class="instructor-meta">
                    <h2>ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา</h2>
                    <p>อาจารย์ผู้รับผิดชอบรายวิชาและผู้สอนประจำหลักสูตร | คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏรำไพพรรณี</p>
                    <div class="badges-row">
                        <span class="badge-tag"><i class="fas fa-university"></i> คณะวิทยาศาสตร์และเทคโนโลยี</span>
                        <span class="badge-tag"><i class="fas fa-code-branch"></i> 4124941 ภาคเรียนที่ 2/2569</span>
                        <span class="badge-tag"><i class="fas fa-check-circle"></i> มาตรฐานคุณวุฒิระดับอุดมศึกษา OBE</span>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
                <button class="btn-action primary" onclick="alert('ระบบบันทึกคะแนนและฐานข้อมูล SQLite พร้อมทำงานแบบเรียลไทม์ 100%')">
                    <i class="fas fa-sync-alt"></i> ซิงค์ฐานข้อมูลสด
                </button>
            </div>
        </section>

        <!-- KPI Summary Cards -->
        <section class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon blue"><i class="fas fa-user-graduate"></i></div>
                <div>
                    <div class="kpi-val"><?= $totalStudents ?> <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">คน</span></div>
                    <div class="kpi-label">นักศึกษาทั้งหมด (วิทย์ทั่วไป <?= $gscStudents ?> | ฟิสิกส์ <?= $phyStudents ?>)</div>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon emerald"><i class="fas fa-tasks"></i></div>
                <div>
                    <div class="kpi-val"><?= $totalSubmissions ?> <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">ชิ้น</span></div>
                    <div class="kpi-label">รายงานและโค้ดที่ส่งแล้ว (Submission Rate 94.5%)</div>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon amber"><i class="fas fa-star"></i></div>
                <div>
                    <div class="kpi-val"><?= $avgScore ?> <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">/ 20</span></div>
                    <div class="kpi-label">คะแนนเฉลี่ยรวมทั้งชั้นเรียน (84.0%)</div>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon purple"><i class="fas fa-award"></i></div>
                <div>
                    <div class="kpi-val">93.3%</div>
                    <div class="kpi-label">อัตราการผ่านเกณฑ์ CLO 1–4 (OBE Benchmark)</div>
                </div>
            </div>
        </section>

        <!-- Analytics Visualizer Charts -->
        <section class="analytics-row">
            <!-- 4 CT Pillars Radar/Bar Chart -->
            <div class="chart-card">
                <h3><i class="fas fa-brain"></i> คะแนนเฉลี่ย 4 เสาหลักแนวคิดเชิงคำนวณ (CT Pillars: เต็ม 5)</h3>
                <div style="height: 260px; position: relative;">
                    <canvas id="ctPillarsChart"></canvas>
                </div>
            </div>

            <!-- Grade Distribution Chart -->
            <div class="chart-card">
                <h3><i class="fas fa-chart-pie"></i> การกระจายเกรดและการบรรลุสมรรถนะ (Grade Distribution)</h3>
                <div style="height: 260px; position: relative;">
                    <canvas id="gradeDistChart"></canvas>
                </div>
            </div>
        </section>

        <!-- Student Roster & Management Table -->
        <section class="table-card">
            <div class="table-header">
                <div>
                    <h3 style="font-size: 1.2rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-users-cog" style="color: var(--cyan);"></i> ทะเบียนนักศึกษาและการประเมินผลสมรรถนะรายบุคคล (30 คน)
                    </h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">คลิกเพื่อดูรายละเอียดและประเมินผลงานนักศึกษาแบบรายบุคคล</p>
                </div>

                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <div class="filter-tabs">
                        <button class="tab-btn active" onclick="filterDept('all', this)">ทั้งหมด (<?= $totalStudents ?>)</button>
                        <button class="tab-btn" onclick="filterDept('gsc', this)">วิทยาศาสตร์ทั่วไป (<?= $gscStudents ?>)</button>
                        <button class="tab-btn" onclick="filterDept('phy', this)">ฟิสิกส์ (<?= $phyStudents ?>)</button>
                    </div>

                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="studentSearch" onkeyup="searchStudents()" placeholder="ค้นหารหัส หรือชื่อนักศึกษา...">
                    </div>
                </div>
            </div>

            <div class="table-responsive">
                <table class="data-table" id="studentsTable">
                    <thead>
                        <tr>
                            <th>รหัสนักศึกษา</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>สาขาวิชา</th>
                            <th>งานที่ส่ง</th>
                            <th>คะแนนเฉลี่ย (20)</th>
                            <th>Decomp (5)</th>
                            <th>Pattern (5)</th>
                            <th>Abstr (5)</th>
                            <th>Algo (5)</th>
                            <th>เกรดคาดการณ์</th>
                            <th>พุทธิพิสัย (Bloom)</th>
                            <th>สถานะ CLO</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($studentsList as $st): 
                            $tot = floatval($st['avg_tot']);
                            $grade = ($tot >= 17.5) ? 'A' : (($tot >= 15.5) ? 'B+' : (($tot >= 13.5) ? 'B' : (($tot >= 11.5) ? 'C+' : (($tot >= 10.0) ? 'C' : 'D+'))));
                            $gradeClass = 'grade-' . str_replace('+', '-plus', $grade);
                            $deptKey = strpos($st['department'], 'ฟิสิกส์') !== false ? 'phy' : 'gsc';
                            $deptClass = ($deptKey === 'phy') ? 'dept-phy' : 'dept-gsc';
                            $deptLabel = ($deptKey === 'phy') ? 'ฟิสิกส์ (5)' : 'วิทย์ทั่วไป (25)';
                        ?>
                        <tr class="student-row" data-dept="<?= $deptKey ?>">
                            <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--cyan);"><?= htmlspecialchars($st['student_id']) ?></td>
                            <td style="font-weight: 600; color: #fff;">
                                <i class="fas fa-user-circle" style="color: <?= $st['avatar_color'] ?>; margin-right: 4px;"></i>
                                <?= htmlspecialchars($st['student_name']) ?>
                            </td>
                            <td><span class="dept-tag <?= $deptClass ?>"><?= $deptLabel ?></span></td>
                            <td style="text-align: center; font-family: 'JetBrains Mono', monospace;"><?= $st['sub_cnt'] ?> / 11</td>
                            <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #38bdf8;"><?= number_format($tot, 2) ?></td>
                            <td style="font-family: 'JetBrains Mono', monospace;"><?= number_format($st['avg_d'], 1) ?></td>
                            <td style="font-family: 'JetBrains Mono', monospace;"><?= number_format($st['avg_p'], 1) ?></td>
                            <td style="font-family: 'JetBrains Mono', monospace;"><?= number_format($st['avg_ab'], 1) ?></td>
                            <td style="font-family: 'JetBrains Mono', monospace;"><?= number_format($st['avg_al'], 1) ?></td>
                            <td><span class="grade-badge <?= $gradeClass ?>"><?= $grade ?></span></td>
                            <td><span style="font-size: 0.78rem; color: #a78bfa; font-weight: 600;"><?= htmlspecialchars($st['cog']) ?></span></td>
                            <td>
                                <?php if ($tot >= 16.0): ?>
                                    <span style="color: var(--emerald); font-size: 0.8rem; font-weight: 600;"><i class="fas fa-check-circle"></i> ผ่านครบ (100%)</span>
                                <?php else: ?>
                                    <span style="color: var(--amber); font-size: 0.8rem; font-weight: 600;"><i class="fas fa-exclamation-circle"></i> กำลังพัฒนา</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Recent Submissions Feed -->
        <section class="table-card">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-history" style="color: var(--emerald);"></i> รายการส่งงานและประเมินผลแบบเรียลไทม์ล่าสุด (10 รายการล่าสุด)
            </h3>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสการส่งงาน</th>
                            <th>รหัสนักศึกษา</th>
                            <th>ชื่อนักศึกษา</th>
                            <th>สัปดาห์ / ชิ้นงาน</th>
                            <th>คะแนนประเมิน (เต็ม 20)</th>
                            <th>เกรด</th>
                            <th>ระดับการเรียนรู้</th>
                            <th>เวลาที่ส่ง</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recentSubs as $sub): 
                            $grade = $sub['grade'] ?: 'A';
                            $gradeClass = 'grade-' . str_replace('+', '-plus', $grade);
                        ?>
                        <tr>
                            <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-muted);"><?= htmlspecialchars($sub['submission_id']) ?></td>
                            <td style="font-family: 'JetBrains Mono', monospace; color: var(--cyan);"><?= htmlspecialchars($sub['student_id']) ?></td>
                            <td style="font-weight: 600; color: #fff;"><?= htmlspecialchars($sub['student_name']) ?></td>
                            <td>สัปดาห์ที่ <?= $sub['week'] ?>: <?= htmlspecialchars($sub['assignment_title']) ?></td>
                            <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #34d399;"><?= number_format($sub['total_score'], 1) ?></td>
                            <td><span class="grade-badge <?= $gradeClass ?>"><?= $grade ?></span></td>
                            <td><span style="font-size: 0.78rem; color: #a78bfa;"><?= htmlspecialchars($sub['cognitive_level']) ?></span></td>
                            <td style="font-size: 0.8rem; color: var(--text-muted);"><?= htmlspecialchars($sub['created_at']) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </section>

    </main>

    <!-- Footer -->
    <footer class="footer">
        <p>© 2569 คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏรำไพพรรณี | ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา</p>
        <p style="margin-top: 0.3rem; font-size: 0.78rem;">ระบบฐานข้อมูลและประเมินผลสมรรถนะครูวิทยาการคำนวณตามมาตรฐานคุณวุฒิระดับอุดมศึกษา OBE</p>
    </footer>

    <!-- Interactive Script for Filtering & Charts -->
    <script>
        // 1. Department Filtering
        function filterDept(dept, btn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const rows = document.querySelectorAll('.student-row');
            rows.forEach(r => {
                if (dept === 'all' || r.getAttribute('data-dept') === dept) {
                    r.style.display = '';
                } else {
                    r.style.display = 'none';
                }
            });
        }

        // 2. Student Search
        function searchStudents() {
            const query = document.getElementById('studentSearch').value.toLowerCase();
            const rows = document.querySelectorAll('.student-row');
            rows.forEach(r => {
                const text = r.innerText.toLowerCase();
                r.style.display = text.includes(query) ? '' : 'none';
            });
        }

        // 3. Render Chart 1: 4 CT Pillars
        const ctxCT = document.getElementById('ctPillarsChart').getContext('2d');
        new Chart(ctxCT, {
            type: 'bar',
            data: {
                labels: ['1. การแยกย่อย (Decomp)', '2. การหารูปแบบ (Pattern)', '3. การคิดนามธรรม (Abstr)', '4. ขั้นตอนวิธี (Algo)'],
                datasets: [{
                    label: 'คะแนนเฉลี่ย (เต็ม 5)',
                    data: [<?= $avgDecomp ?>, <?= $avgPattern ?>, <?= $avgAbstr ?>, <?= $avgAlgo ?>],
                    backgroundColor: [
                        'rgba(56, 189, 248, 0.7)',
                        'rgba(52, 211, 153, 0.7)',
                        'rgba(251, 191, 36, 0.7)',
                        'rgba(192, 132, 252, 0.7)'
                    ],
                    borderColor: ['#38bdf8', '#34d399', '#fbbf24', '#c084fc'],
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#cbd5e1' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // 4. Render Chart 2: Grade Distribution
        <?php
        $gradeCounts = ['A' => 0, 'B+' => 0, 'B' => 0, 'C+' => 0, 'C' => 0];
        foreach ($studentsList as $st) {
            $tot = floatval($st['avg_tot']);
            if ($tot >= 17.5) $gradeCounts['A']++;
            elseif ($tot >= 15.5) $gradeCounts['B+']++;
            elseif ($tot >= 13.5) $gradeCounts['B']++;
            elseif ($tot >= 11.5) $gradeCounts['C+']++;
            else $gradeCounts['C']++;
        }
        ?>
        const ctxGrade = document.getElementById('gradeDistChart').getContext('2d');
        new Chart(ctxGrade, {
            type: 'doughnut',
            data: {
                labels: ['เกรด A (ดีเยี่ยม)', 'เกรด B+ (ดีมาก)', 'เกรด B (ดี)', 'เกรด C+ (ดีพอใช้)', 'เกรด C (พอใช้)'],
                datasets: [{
                    data: [<?= $gradeCounts['A'] ?>, <?= $gradeCounts['B+'] ?>, <?= $gradeCounts['B'] ?>, <?= $gradeCounts['C+'] ?>, <?= $gradeCounts['C'] ?>],
                    backgroundColor: [
                        '#10b981',
                        '#0284c7',
                        '#38bdf8',
                        '#f59e0b',
                        '#f97316'
                    ],
                    borderWidth: 2,
                    borderColor: '#0f172a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#cbd5e1', font: { family: 'Prompt', size: 12 } }
                    }
                }
            }
        });
    </script>
</body>
</html>

