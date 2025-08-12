process.env.PORT = 0;
process.env.DRY_RUN = 'true';
process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const axios = require('axios');
const server = require('./server');

const port = server.address().port;
const baseURL = `http://localhost:${port}`;

(async () => {
  try {
    const health = await axios.get(`${baseURL}/health`);
    if (!health.data || !health.data.ok) throw new Error('health failed');

    const send = await axios.post(`${baseURL}/send-message`, { message: 'test' });
    if (!send.data || send.data.status !== 'ok') throw new Error('send failed');

    console.log('smoke test passed');
    server.close();
  } catch (err) {
    console.error(err);
    server.close();
    process.exit(1);
  }
})();
