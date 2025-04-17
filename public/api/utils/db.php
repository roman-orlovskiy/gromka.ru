<?php
$servername = "localhost";
$username = "u3094922_default";
$password = "KAaBXh40dlCf4q1S";
$dbname = "u3094922_default";

// Создание соединения
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка соединения
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function getSessionByToken($conn, $token) {
    if (!$token) {
        return null;
    }
    $stmt = $conn->prepare('SELECT * FROM sessions WHERE token = ?');
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}
?>