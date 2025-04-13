<?php

header("Content-Type: application/json");

$response = [
    "status" => "success",
    "message" => "Hello, World!"
];

echo json_encode($response); 