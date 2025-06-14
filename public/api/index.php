<?php

header("Content-Type: application/json");

echo json_encode([
    "message" => "API работает",
    "version" => "1.0.0"
]);

?>