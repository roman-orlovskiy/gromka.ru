import { Driver } from '@ydbjs/core'
import { query } from '@ydbjs/query'
import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata'

// Инициализация YDB на уровне модуля для повторного использования между инвокациями (warm start)
const connectionString = 'grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/b1gl9td94vo809chfkpg/etn03t7e35bf32dhtqoh';
const credentialsProvider = new MetadataCredentialsProvider();
const driver = new Driver(connectionString, {
  credentialsProvider,
  'ydb.sdk.enable_discovery': false,
});

// Готовим один экземпляр sql и промис готовности драйвера
const readyPromise = driver.ready();
const sql = query(driver);

export async function handler() {
  try {
    await readyPromise;
    const result = await sql`SELECT COUNT(*) as count FROM wsconnections`;

    const count = result[0] && result[0][0] && result[0][0].count ?
      parseInt(result[0][0].count) : 0;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        total: count
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Failed to get connection IDs', details: String(error && error.message || error) })
    };
  }
};
