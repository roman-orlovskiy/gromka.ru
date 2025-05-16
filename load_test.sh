#!/bin/bash

# Количество запросов
TOTAL_REQUESTS=20000
# Количество параллельных запросов
CONCURRENT=500
# URL для тестирования
URL="https://gromka.ru/#/parinn"

echo "Начинаем нагрузочное тестирование..."
echo "Всего запросов: $TOTAL_REQUESTS"
echo "Параллельных запросов: $CONCURRENT"

# Создаем временный файл для результатов
TEMP_FILE=$(mktemp)

# Функция для выполнения одного запроса
make_request() {
    curl -s -w "%{time_total}\n" -o /dev/null "$URL" >> "$TEMP_FILE"
}

# Создаем массив процессов
for ((i=1; i<=TOTAL_REQUESTS; i+=CONCURRENT)); do
    for ((j=0; j<CONCURRENT && i+j<=TOTAL_REQUESTS; j++)); do
        make_request &
    done
    wait
    echo -n "."
done

echo -e "\nТестирование завершено. Подсчет результатов..."

# Подсчет среднего времени
AVG_TIME=$(awk '{ total += $1 } END { print total/NR }' "$TEMP_FILE")

echo "Среднее время ответа: ${AVG_TIME} секунд"

# Удаляем временный файл
rm "$TEMP_FILE" 