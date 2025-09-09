import { Driver } from '@ydbjs/core'
import { query } from '@ydbjs/query'
import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata'
import { cloudApi, serviceClients, Session } from '@yandex-cloud/nodejs-sdk'

const { serverless: { apigateway_connection_service: connectionService } } = cloudApi;

const cloudApiSession = new Session();
const wsClient = cloudApiSession.client(serviceClients.WebSocketConnectionServiceClient);

const sendMessage = async (connectionId, message) => {
    const request = connectionService.SendToConnectionRequest.fromPartial({
        connectionId,
        type: connectionService.SendToConnectionRequest_DataType.TEXT,
        // eslint-disable-next-line no-undef
        data: Buffer.from(JSON.stringify(message), 'utf8'),
    });

    return wsClient.send(request);
};

export async function handler() {
  let credentialsProvider = new MetadataCredentialsProvider()
  const connectionString = 'grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/b1gl9td94vo809chfkpg/etn03t7e35bf32dhtqoh';
  let driver = new Driver(connectionString, {
    credentialsProvider,
    'ydb.sdk.enable_discovery': false, // Улучшает производительность холодного старта
  });

  try {
    await driver.ready();
    const sql = query(driver);

    const result = await sql`SELECT * FROM wsconnections`;
    const connections = result[0] || [];

    // Сообщение для отправки всем соединениям
    const message = { type: 'event', percentage: 30 };

    // Отправляем сообщение всем активным соединениям
    const sendPromises = connections.map(conn =>
      sendMessage(conn.connectionId, message).catch(error => {
        console.error(`Failed to send message to connection ${conn.connectionId}:`, error);
        return { connectionId: conn.connectionId, error: error.message };
      })
    );

    const sendResults = await Promise.allSettled(sendPromises);

    const successful = sendResults.filter(result => result.status === 'fulfilled').length;
    const failed = sendResults.filter(result => result.status === 'rejected').length;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        message: 'Broadcast completed',
        totalConnections: connections.length,
        successful,
        failed,
        messageSent: message
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'failed to broadcast message', details: String(error && error.message || error) })
    };
  } finally {
    driver.close();
  }
};
