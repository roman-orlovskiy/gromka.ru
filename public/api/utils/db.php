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
?> 