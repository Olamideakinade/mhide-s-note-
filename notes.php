<?php
require_once 'functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

requireLogin();

try {
    $pdo = getDatabase();
    
    // Get all notes for current user
    $stmt = $pdo->prepare("
        SELECT id, title, content, created_at, updated_at 
        FROM notes 
        WHERE user_id = ? 
        ORDER BY updated_at DESC
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $notes = $stmt->fetchAll();
    
    jsonResponse(true, '', ['notes' => $notes]);
    
} catch (PDOException $e) {
    error_log('Notes fetch error: ' . $e->getMessage());
    jsonResponse(false, 'Failed to load notes');
}
?>

