<?php
// Подключение к базе данных
require '../utils/db.php';

// Установка заголовков
header("Content-Type: application/json");

// Получение метода запроса
$method = $_SERVER['REQUEST_METHOD'];

// Обработка запросов
switch ($method) {
    case 'GET':
        // Получение всех событий
        $sql = "SELECT * FROM events";
        $result = $conn->query($sql);
        $events = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($events);
        break;
    
    case 'POST':
        // Создание нового события
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $data['name'];
        $date = $data['date'];
        $sql = "INSERT INTO events (name, date) VALUES ('$name', '$date')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Event created successfully"]);
        } else {
            echo json_encode(["message" => "Error: " . $conn->error]);
        }
        break;

    case 'PUT':
        // Обновление события
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'];
        $name = $data['name'];
        $date = $data['date'];
        $sql = "UPDATE events SET name='$name', date='$date' WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Event updated successfully"]);
        } else {
            echo json_encode(["message" => "Error: " . $conn->error]);
        }
        break;

    case 'DELETE':
        // Удаление события
        $id = $_GET['id'];
        $sql = "DELETE FROM events WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Event deleted successfully"]);
        } else {
            echo json_encode(["message" => "Error: " . $conn->error]);
        }
        break;

    default:
        echo json_encode(["message" => "Method not allowed"]);
        break;
}

// Закрытие соединения
$conn->close();
?> 