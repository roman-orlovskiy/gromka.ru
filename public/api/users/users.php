<?php
$botToken = '6007443006:AAGnu25ziaZNRGPtKmenUtByx-5u-p_dQ5c';

// Подключение к базе данных
require '../utils/db.php';

// Установка заголовков
header("Content-Type: application/json");

// Получение метода запроса
$method = $_SERVER['REQUEST_METHOD'];

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

// Обработка запросов
switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (checkTelegramAuthorization($data, $botToken)) {
            // Проверка существования пользователя
            $stmt = $conn->prepare('SELECT * FROM users WHERE tg_id = ?');
            $stmt->bind_param('i', $data['id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if ($user) {
                // Пользователь найден, возвращаем его данные
                echo json_encode(['status' => 'success', 'message' => 'Пользователь подлинный', 'user' => $user]);
            } else {
                // Пользователь не найден, создаем нового
                $stmt = $conn->prepare('INSERT INTO users (tg_id, first_name, last_name, photo_url, tg_username, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())');
                $stmt->bind_param('issss', $data['id'], $data['first_name'], $data['last_name'], $data['photo_url'], $data['username']);
                $stmt->execute();
                
                // Получаем данные нового пользователя
                $userId = $conn->insert_id;
                $stmt = $conn->prepare('SELECT * FROM users WHERE id = ?');
                $stmt->bind_param('i', $userId);
                $stmt->execute();
                $result = $stmt->get_result();
                $newUser = $result->fetch_assoc();
                
                echo json_encode(['status' => 'success', 'message' => 'Пользователь создан', 'user' => $newUser]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Пользователь не подлинный']);
        }
        break;

    default:
        echo json_encode(['message' => 'Method not allowed']);
        break;
}

// Закрытие соединения
$conn->close();

?>