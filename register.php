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

$name = isset($input['name']) ? sanitizeInput($input['name']) : '';
$email = isset($input['email']) ? sanitizeInput($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

// Validation
if (empty($name) || empty($email) || empty($password)) {
    jsonResponse(false, 'All fields are required');
}

if (!validateEmail($email)) {
    jsonResponse(false, 'Invalid email format');
}

if (strlen($password) < 6) {
    jsonResponse(false, 'Password must be at least 6 characters long');
}

try {
    $pdo = getDatabase();
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        jsonResponse(false, 'Email address already registered');
    }
    
    // Create new user
    $hashedPassword = hashPassword($password);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $hashedPassword]);
    
    jsonResponse(true, 'Account created successfully');
    
} catch (PDOException $e) {
    error_log('Registration error: ' . $e->getMessage());
    jsonResponse(false, 'Registration failed. Please try again.');
}
?>

