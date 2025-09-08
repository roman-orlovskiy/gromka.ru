module.exports.handler = async (event) => {
  const connectionId = event && event.requestContext && event.requestContext.connectionId;

  if (!connectionId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'connectionId is missing in request context' })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ 'My connectionId': connectionId })
  };
};
