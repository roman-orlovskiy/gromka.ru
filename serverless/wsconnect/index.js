import { Driver } from '@ydbjs/core'
import { query } from '@ydbjs/query'

module.exports.handler = async (event) => {
  const connectionId = event && event.requestContext && event.requestContext.connectionId;

  if (!connectionId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'connectionId is missing in request context' })
    };
  }

  const connectionString = 'grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/b1gl9td94vo809chfkpg/etn03t7e35bf32dhtqoh';
  const driver = new Driver(connectionString);

  try {
    await driver.ready();
    const sql = query(driver);

    await sql`UPSERT INTO wsconnections (connectionId) VALUES (${connectionId})`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: true })
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
