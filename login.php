<?php
require_once 'functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed');
}

$input = getJsonInput();

if (!$input) {
    jsonResponse(false, 'Invalid JSON input');
}

$email = isset($input['email']) ? sanitizeInput($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

// Validation
if (empty($email) || empty($password)) {
    jsonResponse(false, 'Email and password are required');
}

if (!validateEmail($email)) {
    jsonResponse(false, 'Invalid email format');
}

try {
    $pdo = getDatabase();
    
    // Find user by email
    $stmt = $pdo->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !verifyPassword($password, $user['password'])) {
        jsonResponse(false, 'Invalid email or password');
    }
    
    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    
    // Return user data (without password)
    unset($user['password']);
    jsonResponse(true, 'Login successful', ['user' => $user]);
    
} catch (PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    jsonResponse(false, 'Login failed. Please try again.');
}
?>

