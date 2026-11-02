import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { fetchLocal } from './local-http.mjs';

test('consumes binary, missing and text responses repeatedly', async () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/slow') return;
    res.writeHead(req.url === '/missing' ? 404 : 200, {
      'Content-Type': req.url === '/binary' ? 'application/octet-stream' : 'text/plain'
    });
    res.end(req.url === '/binary' ? Buffer.alloc(1024 * 1024) : 'verified');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (let i = 0; i < 20; i++) {
      assert.equal((await fetchLocal(base + '/binary')).status, 200);
      assert.equal((await fetchLocal(base + '/missing')).status, 404);
      assert.equal(await (await fetchLocal(base + '/text')).text(), 'verified');
    }
    await assert.rejects(fetchLocal(base + '/slow', 50), /timed out/);
    await assert.rejects(fetchLocal('https://example.com'), /local HTTP/);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
