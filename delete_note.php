<?php
require_once 'functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed');
}

requireLogin();

$input = getJsonInput();

if (!$input) {
    jsonResponse(false, 'Invalid JSON input');
}

$id = isset($input['id']) ? (int)$input['id'] : 0;

// Validation
if (!$id) {
    jsonResponse(false, 'Note ID is required');
}

try {
    $pdo = getDatabase();
    
    // Check if note exists and belongs to current user
    $stmt = $pdo->prepare("SELECT id FROM notes WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $_SESSION['user_id']]);
    
    if (!$stmt->fetch()) {
        jsonResponse(false, 'Note not found or access denied');
    }
    
    // Delete note
    $stmt = $pdo->prepare("DELETE FROM notes WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $_SESSION['user_id']]);
    
    jsonResponse(true, 'Note deleted successfully');
    
} catch (PDOException $e) {
    error_log('Delete note error: ' . $e->getMessage());
    jsonResponse(false, 'Failed to delete note');
}
?>

