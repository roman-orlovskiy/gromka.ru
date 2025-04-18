<?php
// Подключение к базе данных
require '../utils/db.php';

// Установка заголовков
require '../utils/cors.php';
setupCORS();
header("Content-Type: application/json");

// Получение метода запроса
$method = $_SERVER['REQUEST_METHOD'];

// Обработка запросов
switch ($method) {
    case 'GET':
        // Получение всех мест
        $sql = "SELECT * FROM places";
        $result = $conn->query($sql);
        $places = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($places);
        break;
    
    case 'POST':
        // Создание нового места
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $data['name'];
        $address = $data['address'];
        $photo = $data['photo'];
        $type = $data['type'];
        $coverage = $data['coverage'];
        $latitude = $data['latitude'];
        $longitude = $data['longitude'];
        $createdAt = date('Y-m-d H:i:s');
        $sql = "INSERT INTO places (name, address, photo, type, coverage, latitude, longitude, createdAt) VALUES ('$name', '$address', '$photo', '$type', '$coverage', '$latitude', '$longitude', '$createdAt')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Place created successfully"]);
        } else {
            echo json_encode(["message" => "Error: " . $conn->error]);
        }
        break;

    case 'PUT':
        // Обновление места
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'];
        $name = $data['name'];
        $address = $data['address'];
        $photo = $data['photo'];
        $type = $data['type'];
        $coverage = $data['coverage'];
        $latitude = $data['latitude'];
        $longitude = $data['longitude'];
        $updatedAt = date('Y-m-d H:i:s');
        $sql = "UPDATE places SET name='$name', address='$address', photo='$photo', type='$type', coverage='$coverage', latitude='$latitude', longitude='$longitude', updatedAt='$updatedAt' WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Place updated successfully"]);
        } else {
            echo json_encode(["message" => "Error: " . $conn->error]);
        }
        break;

    case 'DELETE':
        // Удаление места
        $id = $_GET['id'];
        $sql = "DELETE FROM places WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Place deleted successfully"]);
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