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
$title = isset($input['title']) ? sanitizeInput($input['title']) : '';
$content = isset($input['content']) ? sanitizeInput($input['content']) : '';

// Validation
if (!$id) {
    jsonResponse(false, 'Note ID is required');
}

if (empty($title) || empty($content)) {
    jsonResponse(false, 'Title and content are required');
}

if (strlen($title) > 255) {
    jsonResponse(false, 'Title is too long (maximum 255 characters)');
}

try {
    $pdo = getDatabase();
    
    // Check if note exists and belongs to current user
    $stmt = $pdo->prepare("SELECT id FROM notes WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $_SESSION['user_id']]);
    
    if (!$stmt->fetch()) {
        jsonResponse(false, 'Note not found or access denied');
    }
    
    // Update note
    $stmt = $pdo->prepare("UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?");
    $stmt->execute([$title, $content, $id, $_SESSION['user_id']]);
    
    // Get updated note
    $stmt = $pdo->prepare("SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?");
    $stmt->execute([$id]);
    $note = $stmt->fetch();
    
    jsonResponse(true, 'Note updated successfully', ['note' => $note]);
    
} catch (PDOException $e) {
    error_log('Edit note error: ' . $e->getMessage());
    jsonResponse(false, 'Failed to update note');
}
?>

