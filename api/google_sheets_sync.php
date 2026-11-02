<?php
/**
 * Google Sheets Realtime Webhook Synchronization Module
 * Course 4124941 Computational Science, RBRU
 * Instructor: Asst. Prof. Dr. Chewa Thassana
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$configFile = __DIR__ . '/../config/google_sheets_settings.json';

function getGoogleSheetsSettings() {
    global $configFile;
    if (!file_exists($configFile)) {
        $default = [
            'enabled' => true,
            'webhook_url' => '',
            'timeout_seconds' => 5,
            'sheet_name' => 'CT_Submissions_2027',
            'last_sync_status' => 'waiting_configuration',
            'last_sync_time' => null
        ];
        file_put_contents($configFile, json_encode($default, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        return $default;
    }
    $raw = file_get_contents($configFile);
    return json_decode($raw, true) ?: [];
}

function saveGoogleSheetsSettings($settings) {
    global $configFile;
    file_put_contents($configFile, json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

/**
 * Syncs a single student submission to Google Sheets via Webhook (cURL)
 * Designed with strict non-blocking timeout so student UI never hangs.
 */
function syncToGoogleSheets($record) {
    $settings = getGoogleSheetsSettings();
    $url = trim($settings['webhook_url'] ?? '');

    if (empty($settings['enabled']) || empty($url)) {
        return [
            'status' => 'skipped',
            'message' => 'Google Sheets Webhook ยังไม่ได้รับการตั้งค่า (ระบบบันทึกใน SQLite/JSON เรียบร้อยแล้ว)'
        ];
    }

    $eval = $record['evaluation'] ?? [];
    $scores = $eval['scores'] ?? [];
    $input = $record['student_input'] ?? [];

    $payload = [
        'action' => 'new_submission',
        'submission_id' => $record['submission_id'] ?? '',
        'timestamp' => $record['timestamp'] ?? date('c'),
        'student_id' => $record['student_id'] ?? '',
        'student_name' => $record['student_name'] ?? '',
        'week' => $record['week'] ?? 1,
        'assignment_title' => $record['assignment_title'] ?? '',
        'work_link' => $record['work_link'] ?? '',
        'scores' => [
            'decomp' => $scores['decomp'] ?? 0,
            'pattern' => $scores['pattern'] ?? 0,
            'abstr' => $scores['abstr'] ?? 0,
            'algo' => $scores['algo'] ?? 0,
            'total' => $scores['total'] ?? 0,
            'max_total' => $scores['max_total'] ?? 20,
            'percentage' => $scores['percentage'] ?? 0,
            'grade' => $scores['grade'] ?? ''
        ],
        'cognitive_level' => $eval['cognitive_level'] ?? '',
        'student_input' => [
            'decomp' => $input['decomp'] ?? '',
            'pattern' => $input['pattern'] ?? '',
            'abstr' => $input['abstr'] ?? '',
            'algo' => $input['algo'] ?? '',
            'reflection' => $input['reflection'] ?? ''
        ],
        'personalized_feedback' => $eval['personalized_feedback'] ?? '',
        'strengths' => implode(" | ", $eval['strengths'] ?? []),
        'growth_areas' => implode(" | ", $eval['growth_areas'] ?? [])
    ];

    $jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE);

    // Send HTTP POST via cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=utf-8',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, intval($settings['timeout_seconds'] ?? 8));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    $now = date('c');
    if ($curlError) {
        $settings['last_sync_status'] = 'error: ' . $curlError;
        $settings['last_sync_time'] = $now;
        saveGoogleSheetsSettings($settings);
        return [
            'status' => 'warning',
            'message' => 'ส่งไปยัง Google Sheets ไม่สำเร็จ (' . $curlError . ') แต่ข้อมูลในระบบปลอดภัย'
        ];
    }

    $settings['last_sync_status'] = 'success (HTTP ' . $httpCode . ')';
    $settings['last_sync_time'] = $now;
    saveGoogleSheetsSettings($settings);

    return [
        'status' => 'success',
        'http_code' => $httpCode,
        'response' => $response,
        'message' => 'ซิงก์ข้อมูลไปยัง Google Sheets สำเร็จ'
    ];
}

// -------------------------------------------------------------
// Direct Endpoint Handling for Settings / Test Ping
// -------------------------------------------------------------
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $settings = getGoogleSheetsSettings();
        // Mask URL for security display
        $url = $settings['webhook_url'] ?? '';
        $maskedUrl = !empty($url) ? (substr($url, 0, 35) . '...' . substr($url, -10)) : '';

        echo json_encode([
            'status' => 'success',
            'settings' => [
                'enabled' => $settings['enabled'] ?? true,
                'webhook_url' => $url,
                'masked_url' => $maskedUrl,
                'timeout_seconds' => $settings['timeout_seconds'] ?? 5,
                'sheet_name' => $settings['sheet_name'] ?? 'CT_Submissions_2027',
                'last_sync_status' => $settings['last_sync_status'] ?? 'none',
                'last_sync_time' => $settings['last_sync_time'] ?? null
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = json_decode(file_get_contents('php://stdin'), true);
        }

        $action = $input['action'] ?? 'save_settings';

        if ($action === 'save_settings') {
            $settings = getGoogleSheetsSettings();
            if (isset($input['webhook_url'])) {
                $settings['webhook_url'] = trim($input['webhook_url']);
            }
            if (isset($input['enabled'])) {
                $settings['enabled'] = (bool)$input['enabled'];
            }
            if (isset($input['sheet_name'])) {
                $settings['sheet_name'] = trim($input['sheet_name']);
            }
            saveGoogleSheetsSettings($settings);

            echo json_encode([
                'status' => 'success',
                'message' => 'บันทึกการตั้งค่า Google Sheets Webhook สำเร็จ',
                'settings' => $settings
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($action === 'test_ping') {
            $testRecord = [
                'submission_id' => 'TEST-PING-' . strtoupper(substr(md5(uniqid()), 0, 6)),
                'timestamp' => date('c'),
                'student_id' => '6614401001',
                'student_name' => 'ทดสอบระบบ (อาจารย์ชีวะ ทัศนา)',
                'week' => 1,
                'assignment_title' => 'การทดสอบการเชื่อมต่อ Google Sheets Webhook',
                'work_link' => 'https://elearning.rbru.ac.th',
                'student_input' => [
                    'decomp' => 'ทดสอบการแยกส่วนประกอบ',
                    'pattern' => 'ทดสอบการรู้จำแบบแผน',
                    'abstr' => 'ทดสอบการคิดเชิงนามธรรม',
                    'algo' => 'ทดสอบอัลกอริทึม',
                    'reflection' => 'ทดสอบการสะท้อนคิด'
                ],
                'evaluation' => [
                    'scores' => [
                        'decomp' => 5.0,
                        'pattern' => 5.0,
                        'abstr' => 5.0,
                        'algo' => 5.0,
                        'total' => 20.0,
                        'max_total' => 20.0,
                        'percentage' => 100.0,
                        'grade' => 'A (ดีเยี่ยมยอด)'
                    ],
                    'cognitive_level' => 'Creating (การคิดสร้างสรรค์)',
                    'strengths' => ['ทดสอบการเชื่อมต่อ API เรียบร้อยสมบูรณ์'],
                    'growth_areas' => [],
                    'personalized_feedback' => 'การเชื่อมต่อระบบระหว่าง Web Application และ Google Sheets ใช้งานได้ปกติครับ'
                ]
            ];

            $res = syncToGoogleSheets($testRecord);
            echo json_encode([
                'status' => $res['status'],
                'message' => $res['message'],
                'details' => $res
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        echo json_encode(['status' => 'error', 'message' => 'Unknown action'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

