import { Driver } from '@ydbjs/core'
import { query } from '@ydbjs/query'
import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata'
import { cloudApi, serviceClients, Session } from '@yandex-cloud/nodejs-sdk'

const { serverless: { apigateway_connection_service: connectionService } } = cloudApi;

const cloudApiSession = new Session();
const wsClient = cloudApiSession.client(serviceClients.WebSocketConnectionServiceClient);

const sendMessage = async (connectionId, dataBuffer) => {
    const request = connectionService.SendToConnectionRequest.fromPartial({
        connectionId,
        type: connectionService.SendToConnectionRequest_DataType.TEXT,
        data: dataBuffer,
    });

    return wsClient.send(request);
};

// Инициализация YDB на уровне модуля для повторного использования между инвокациями
const ydbConnectionString = 'grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/b1gl9td94vo809chfkpg/etn03t7e35bf32dhtqoh';
const ydbCredentialsProvider = new MetadataCredentialsProvider();
const ydbDriver = new Driver(ydbConnectionString, {
  credentialsProvider: ydbCredentialsProvider,
  'ydb.sdk.enable_discovery': false, // Улучшает производительность холодного старта
});
const ydbReadyPromise = ydbDriver.ready();
const ydbSql = query(ydbDriver);

export async function handler(event) {
  // Парсинг query параметров
  const step = event.queryStringParameters?.step ? parseInt(event.queryStringParameters.step, 10) : 0;

  // Валидация параметра step
  if (isNaN(step) || step < 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Invalid step parameter. Must be a non-negative integer.' })
    };
  }

  // Парсинг и базовая валидация тела запроса
  let message;
  if (!event || event.body == null) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Body is required' })
    };
  }

  if (typeof event.body === 'string') {
    try {
      message = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: 'Invalid JSON in body' })
      };
    }
  } else if (typeof event.body === 'object') {
    message = event.body;
  }

  if (message.type === 'wake-up') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ message: 'Wake up message received' })
    };
  }

  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Invalid body. Expected JSON object.' })
    };
  }

  try {
    await ydbReadyPromise;

    // Вычисляем OFFSET и LIMIT для пагинации
    const offset = step * 2500;
    const limit = 2500;

    // Запрашиваем только необходимые поля для уменьшения трафика и ускорения
    const result = await ydbSql`SELECT connectionId FROM wsconnections LIMIT ${limit} OFFSET ${offset}`;
    const connections = result[0] || [];

    // Сериализуем сообщение один раз для всех отправок
    // eslint-disable-next-line no-undef
    const payloadBuffer = Buffer.from(JSON.stringify(message), 'utf8');

    // Ограничиваем конкуренцию батчами, чтобы не упираться в лимиты сервиса
    const batchSize = 200;
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < connections.length; i += batchSize) {
      const batch = connections.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(conn =>
          sendMessage(conn.connectionId.toString('utf8'), payloadBuffer)
        )
      );

      for (const r of results) {
        if (r.status === 'fulfilled') {
          successful += 1;
        } else {
          failed += 1;
          console.error('Send failed:', r.reason);
        }
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        message: 'Broadcast completed',
        step,
        offset,
        limit,
        totalConnections: connections.length,
        successful,
        failed,
        messageSent: message
      })
    };
  } catch (error) {
    console.error('Broadcast error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'failed to broadcast message', details: String(error && error.message || error) })
    };
  }
};
