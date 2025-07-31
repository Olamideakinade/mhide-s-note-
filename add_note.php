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

$title = isset($input['title']) ? sanitizeInput($input['title']) : '';
$content = isset($input['content']) ? sanitizeInput($input['content']) : '';

// Validation
if (empty($title) || empty($content)) {
    jsonResponse(false, 'Title and content are required');
}

if (strlen($title) > 255) {
    jsonResponse(false, 'Title is too long (maximum 255 characters)');
}

try {
    $pdo = getDatabase();
    
    // Insert new note
    $stmt = $pdo->prepare("INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)");
    $stmt->execute([$_SESSION['user_id'], $title, $content]);
    
    $noteId = $pdo->lastInsertId();
    
    // Get the created note
    $stmt = $pdo->prepare("SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?");
    $stmt->execute([$noteId]);
    $note = $stmt->fetch();
    
    jsonResponse(true, 'Note created successfully', ['note' => $note]);
    
} catch (PDOException $e) {
    error_log('Add note error: ' . $e->getMessage());
    jsonResponse(false, 'Failed to create note');
}
?>

