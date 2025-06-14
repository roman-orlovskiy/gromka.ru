<?php
function handler($event, $context)
{
    return [
        "statusCode" => 200,
        "body" => "Hello, World 123!",
    ];
}