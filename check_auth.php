<?php
require_once 'functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if (isLoggedIn()) {
    $user = getCurrentUser();
    if ($user) {
        jsonResponse(true, 'Authenticated', ['user' => $user]);
    }
}

jsonResponse(false, 'Not authenticated');
?>

