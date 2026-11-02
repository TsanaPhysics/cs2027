
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$stateFile = 'state.json';

// Initialize file if not exists
if (!file_exists($stateFile)) {
    file_put_contents($stateFile, json_encode(['triggered' => false]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['action'])) {
        if ($input['action'] === 'trigger') {
            file_put_contents($stateFile, json_encode(['triggered' => true]));
            echo json_encode(['success' => true, 'triggered' => true]);
            exit;
        } elseif ($input['action'] === 'reset') {
            file_put_contents($stateFile, json_encode(['triggered' => false]));
            echo json_encode(['success' => true, 'triggered' => false]);
            exit;
        }
    }
    
    echo json_encode(['success' => false, 'error' => 'Invalid action']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Read and return state
    echo file_get_contents($stateFile);
    exit;
}
