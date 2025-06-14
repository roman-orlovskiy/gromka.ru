<?php

function postToVkGroupWall($accessToken, $groupId, $message) {
    $url = 'https://api.vk.com/method/wall.post';

    $params = [
        'owner_id' => '-' . $groupId,
        'from_group' => 1,
        'message' => $message,
        'access_token' => $accessToken,
        'v' => '5.154'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

function handler($event, $context)
{
    // Разбор параметров из $event['queryStringParameters']
    $params = $event['queryStringParameters'] ?? [];
    
    // Получаем тело запроса
    $body = json_decode($event['body'] ?? '{}', true);
    
    // Получаем параметры из body
    $field = $body['field'] ?? '';
    $address = $body['address'] ?? '';
    $date = $body['date'] ?? '';
    $time = $body['time'] ?? '';
    $duration = $body['duration'] ?? '';
    $spots = $body['spots'] ?? '';
    $price = $body['price'] ?? '';
    $contactName = $body['contactName'] ?? '';
    $contact = $body['contact'] ?? '';

    $accessToken = "vk1.a.W9Q-upY2yPAeupeDyaM9_AJgJtXjzxrqEYRIalCXs3lggi3WzVu3uZqkRoOUgjsImu2LaJyNQ7J7Kl8mfu87NkF8x_I8fjoPlDc9cJqZUdAse7auv8yE_pfALgwNBXuhXeZM71OEmM2odnSIIxsQses1_lRQUu2lctaJcnlzbsyjc_b0IkB--Vwo3XdcceWYskh21swYYXtCqD-LAzEuWw";
    $groupId = 138155699;
    
    // Форматируем сообщение
    $message = "Привет, есть новое событие!\n\n" .
               "Где: {$field} ({$address})\n" .
               "Когда: {$date} в {$time}\n" .
               "Продолжительность: {$duration}\n\n" .
               "Количество мест: {$spots}\n" .
               "Стоимость: {$price} с человека\n\n" .
               "Кому интересно, пишите автору.\n" .
               "Контакты: {$contact} {$contactName}";

    if (!$accessToken || !$groupId) {
        return [
            'statusCode' => 400,
            'headers' => ['Content-Type' => 'application/json'],
            'body' => json_encode([
                'error' => 'Missing token or group_id'
            ])
        ];
    }

    $vkResponse = postToVkGroupWall($accessToken, $groupId, $message);

    return [
        'statusCode' => 200,
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode($vkResponse)
    ];
}
