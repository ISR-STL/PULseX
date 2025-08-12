const assert = require('assert');

process.env.PORT = 0; // use ephemeral port for tests
const server = require('./server');
const port = server.address().port;

async function run() {
  const health = await fetch(`http://localhost:${port}/health`).then(r => r.json());
  assert.strictEqual(health.ok, true, 'health check');

  const resp = await fetch(`http://localhost:${port}/send-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'test' })
  }).then(r => r.json());
  assert.strictEqual(resp.status, 'ok', 'send-message');

  server.close();
  console.log('Smoke test passed');
}

run().catch(err => {
  server.close();
  console.error(err);
  process.exit(1);
});
