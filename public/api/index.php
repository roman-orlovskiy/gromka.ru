<?php

header("Content-Type: application/json");

// Получение пути из URL
$request = $_SERVER['REQUEST_URI'];

switch ($request) {
    case '/api/events':
        require './events/events.php';
        break;
    // Добавьте другие маршруты здесь
    default:
        http_response_code(404);
        echo json_encode(["message" => "Endpoint not found"]);
        break;
}

?> 