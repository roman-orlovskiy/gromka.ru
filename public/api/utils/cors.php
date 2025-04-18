<?php

function setupCORS() {
    // Обработка preflight-запросов
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}

/**
 * Устанавливает дополнительные CORS-заголовки
 * @param array $headers Массив дополнительных заголовков
 * @example setCORSHeaders(['X-Custom-Header', 'X-Requested-With'])
 */
function setCORSHeaders(array $headers = []) {
    $defaultHeaders = ['Content-Type', 'Authorization'];
    $allowedHeaders = array_merge($defaultHeaders, $headers);
    
    header("Access-Control-Allow-Headers: " . implode(', ', $allowedHeaders));
}