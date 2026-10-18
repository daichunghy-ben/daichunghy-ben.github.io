import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { inlineScriptHashes, injectSecurityMeta } from './security-policy.mjs';
import { onRequest } from '../functions/_middleware.js';

test('legacy redirects retain the primary origin for hostile path references', async () => {
  const primary = 'https://daichunghy-ben.github.io/portfolio/';
  for (const suffix of ['/portfolio/about.html?lang=vi', '//attacker.example/path?q=1', '/%2f%2fattacker.example/', '/%5c%5cattacker.example/']) {
    const request = new Request(`https://chunghy.pages.dev${suffix}`);
    const response = await onRequest({ request, env: { SITE_URL: primary }, next: () => assert.fail('expected redirect') });
    const destination = new URL(response.headers.get('Location'));
    assert.equal(destination.origin, new URL(primary).origin);
    assert.equal(destination.pathname, new URL(request.url).pathname);
    assert.equal(destination.search, new URL(request.url).search);
  }
  const result = await onRequest({ request: new Request(`${primary}index.html`), env: { SITE_URL: primary }, next: () => 'next' });
  assert.equal(result, 'next');
});

test('CSP hashes exact normalized script bodies and refreshes stale policies', () => {
  const code = '\nwindow.test=1;\n';
  const hash = `'sha256-${createHash('sha256').update(code).digest('base64')}'`;
  const source = `<html><head><meta charset="utf-8"></head><body><script>${code.replaceAll('\n', '\r\n')}</script></body></html>`;
  assert.deepEqual(inlineScriptHashes(source), [hash]);
  const staged = injectSecurityMeta(source);
  assert.ok(staged.includes(`script-src 'self' ${hash}; script-src-attr 'none'`));
  assert.ok(!/script-src[^;]*unsafe-inline/.test(staged));
  const refreshed = injectSecurityMeta(staged.replace('window.test=1', 'window.test=2'));
  assert.ok(!refreshed.includes(hash));
  assert.equal([...refreshed.matchAll(/data-staged-security="csp"/g)].length, 1);
});

test('every staged HTML document, including nested pages and both 404s, has matching CSP', async () => {
  const root = path.resolve('.deploy/public');
  const paths = [];
  async function walk(dir) {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.isFile() && p.endsWith('.html')) paths.push(p);
    }
  }
  await walk(root);
  assert.ok(paths.includes(path.join(root, '404.html')));
  assert.ok(paths.includes(path.join(root, 'portfolio/404.html')));
  const headers = await fs.readFile(path.join(root, '_headers'), 'utf8');
  for (const p of paths) {
    const html = await fs.readFile(p, 'utf8');
    const meta = html.match(/<meta\b[^>]*data-staged-security="csp"[^>]*>/)?.[0];
    assert.ok(meta, p);
    assert.ok(!/script-src[^;]*unsafe-inline/.test(meta), p);
    assert.ok(meta.includes("script-src-attr 'none'"), p);
    assert.ok(!/\son\w+\s*=/i.test(html), `Move inline handlers to external JS: ${p}`);
    assert.ok(html.indexOf(meta) < (html.search(/<script\b/i) === -1 ? Infinity : html.search(/<script\b/i)), p);
    for (const hash of inlineScriptHashes(html)) {
      assert.ok(meta.includes(hash), `Missing page hash: ${p}`);
      assert.ok(headers.includes(hash), `Missing alternate-host hash: ${p}`);
    }
  }
});
