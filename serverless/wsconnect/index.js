import { Driver } from '@ydbjs/core'
import { query } from '@ydbjs/query'
import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata'

// Инициализация YDB на уровне модуля (один раз на холодный старт)
const connectionString = 'grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/b1gl9td94vo809chfkpg/etn03t7e35bf32dhtqoh';
const credentialsProvider = new MetadataCredentialsProvider();

const driver = new Driver(connectionString, {
  credentialsProvider,
  'ydb.sdk.enable_discovery': false, // улучшает холодный старт
});

const driverReady = driver.ready();
const sql = query(driver);

export async function handler(event) {
  const connectionId = event?.requestContext?.connectionId;

  if (!connectionId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'connectionId is missing in request context' })
    };
  }

  try {
    await driverReady;

    // Теперь connectionId — строка (Utf8 в YDB)
    await sql`UPSERT INTO wsconnections (connectionId) VALUES (${connectionId})`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ 'Open wss': connectionId })
    };
  } catch (error) {
    console.error('YDB error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        error: 'failed to store connectionId',
        details: String(error?.message || error)
      })
    };
  }
}
