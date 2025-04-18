<?php
$botToken = '6007443006:AAGnu25ziaZNRGPtKmenUtByx-5u-p_dQ5c';

// Подключение к базе данных
require '../utils/db.php';

// Установка заголовков
require '../utils/cors.php';
setupCORS();
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

// Функция для генерации токена сессии
function generateSessionToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Обработка запросов
switch ($method) {
    case 'GET':
        if (isset($_GET['id']) && $_GET['id'] === 'current') {
            if (isset($_COOKIE['session_token'])) {
                $sessionToken = $_COOKIE['session_token'];
                $session = getSessionByToken($conn, $sessionToken);

                if ($session) {
                    $userId = $session['user_id'];
                    $stmt = $conn->prepare('SELECT * FROM users WHERE id = ?');
                    $stmt->bind_param('i', $userId);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    $user = $result->fetch_assoc();

                    if ($user) {
                        echo json_encode(['status' => 'success', 'message' => 'Пользователь найден', 'data' => $user]);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Пользователь не найден', 'data' => (object)[]]);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Сессия не найдена', 'data' => (object)[]]);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Куки не найдены', 'data' => (object)[]]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Неверный параметр запроса', 'data' => (object)[]]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $newUser = null; // Определяем переменную заранее
        if (checkTelegramAuthorization($data, $botToken)) {
            // Проверка существования пользователя
            $stmt = $conn->prepare('SELECT * FROM users WHERE tg_id = ?');
            $stmt->bind_param('i', $data['id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if ($user) {
                // Пользователь найден, возвращаем его данные
                echo json_encode(['status' => 'success', 'message' => 'Пользователь подлинный', 'data' => $user]);
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
                
                echo json_encode(['status' => 'success', 'message' => 'Пользователь создан', 'data' => $newUser]);
            }

            $currentSession = getSessionByToken($conn, $_COOKIE['session_token']);
            // После успешной авторизации и создания/получения пользователя
            if (!$currentSession) {
                $sessionToken = generateSessionToken();
                $userId = isset($user) ? $user['id'] : $newUser['id'];
                $stmt = $conn->prepare('INSERT INTO sessions (user_id, token, createdAt) VALUES (?, ?, NOW())');
                $stmt->bind_param('is', $userId, $sessionToken);
                $stmt->execute();
                setcookie('session_token', $sessionToken, time() + (86400 * 30), "/", "", true, true); // Куки на 30 дней с флагами Secure и HttpOnly
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Пользователь не подлинный', 'data' => (object)[]]);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed', 'data' => (object)[]]);
        break;
}

// Закрытие соединения
$conn->close();

?>