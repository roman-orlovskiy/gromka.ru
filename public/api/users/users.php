<?php

function checkTelegramAuthorization($data, $botToken) {
    $checkHash = $data['hash'];
    unset($data['hash']);
    
    $dataCheckArr = [];
    foreach ($data as $key => $value) {
        $dataCheckArr[] = $key . '=' . $value;
    }
    sort($dataCheckArr);
    $dataCheckString = implode("\n", $dataCheckArr);
    
    $secretKey = hash('sha256', $botToken, true);
    $hash = hash_hmac('sha256', $dataCheckString, $secretKey);
    
    return hash_equals($hash, $checkHash);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $botToken = 'ВАШ_ТОКЕН_БОТА'; // Замените на ваш токен
    
    if (checkTelegramAuthorization($data, $botToken)) {
        echo json_encode(['status' => 'success', 'message' => 'Пользователь подлинный']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Пользователь не подлинный']);
    }
    exit;
}

?>