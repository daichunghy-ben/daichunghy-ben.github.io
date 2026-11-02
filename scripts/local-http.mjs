import http from 'node:http';

// Consume every local response before opening the next request. This avoids
// abandoned bodies and the Undici parser crash seen with Python's HTTP server.
export function fetchLocal(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    if (target.hostname !== '127.0.0.1' || target.protocol !== 'http:') {
      reject(new Error(`Expected a local HTTP URL: ${url}`));
      return;
    }
    let timer;
    const request = http.get(target, { agent: false }, response => {
      const chunks = [];
      const type = String(response.headers['content-type'] || '');
      const keep = /text|javascript|json|xml/i.test(type);
      response.on('data', chunk => { if (keep) chunks.push(chunk); });
      response.on('error', reject);
      response.on('end', () => {
        clearTimeout(timer);
        const status = response.statusCode;
        resolve({ status, ok: status >= 200 && status < 300,
          headers: new Map(Object.entries(response.headers)),
          text: async () => Buffer.concat(chunks).toString('utf8') });
      });
    });
    timer = setTimeout(() => request.destroy(new Error(`Local request timed out: ${url}`)), timeoutMs);
    request.on('error', error => { clearTimeout(timer); reject(error); });
    request.on('close', () => clearTimeout(timer));
  });
}
