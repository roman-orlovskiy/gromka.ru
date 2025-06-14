<?php

header("Content-Type: application/json");

require_once __DIR__ . '/post.php';

$response = handler(null, null);
http_response_code($response["statusCode"]);
echo json_encode($response["body"]);

?>