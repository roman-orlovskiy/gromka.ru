import { Driver } from '@ydbjs/core'
import { query } from '@ydbjs/query'
import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata'

export async function handler(event) {
  const connectionId = event && event.requestContext && event.requestContext.connectionId;

  if (!connectionId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'connectionId is missing in request context' })
    };
  }

  let credentialsProvider = new MetadataCredentialsProvider()
  const connectionString = 'grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/b1gl9td94vo809chfkpg/etn03t7e35bf32dhtqoh';
  let driver = new Driver(connectionString, {
    credentialsProvider,
    'ydb.sdk.enable_discovery': false,
  });

  try {
    await driver.ready();
    const sql = query(driver);

    await sql`DELETE FROM wsconnections WHERE connectionId = ${connectionId}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ 'Close wss': connectionId })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'failed to delete connectionId', details: String(error && error.message || error) })
    };
  } finally {
    driver.close();
  }
};


