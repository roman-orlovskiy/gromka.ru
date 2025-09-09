import { Driver } from '@ydbjs/core'
import { query } from '@ydbjs/query'
import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata'

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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ connections: result[0] || [] })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'failed to store connectionId', details: String(error && error.message || error) })
    };
  } finally {
    driver.close();
  }
};
