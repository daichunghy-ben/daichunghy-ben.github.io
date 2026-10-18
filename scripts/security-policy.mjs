import { createHash } from 'node:crypto';

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const SECURITY_META_MARK = 'data-staged-security="csp"';

export const inlineScriptHashes = (html) => [...new Set(
  [...html.matchAll(SCRIPT_RE)]
    .filter(([, attrs, body]) => !/\bsrc\s*=/i.test(attrs) && body.trim())
    // HTML parsing normalizes line endings before CSP hashes are evaluated.
    .map(([, , body]) => `'sha256-${createHash('sha256').update(body.replace(/\r\n?/g, '\n')).digest('base64')}'`)
)];

export const scriptPolicy = (hashes) => `script-src 'self'${hashes.length ? ` ${hashes.join(' ')}` : ''}`;

export const contentSecurityPolicy = (hashes) => [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  scriptPolicy(hashes),
  "script-src-attr 'none'",
  // Inline styles are used by charts, motion and static page layouts.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  'upgrade-insecure-requests'
].join('; ');

export const injectSecurityMeta = (html) => {
  // Recompute from the final staged bytes, even if a prior staged policy exists.
  html = html.replace(/<meta\b[^>]*data-staged-security=["']csp["'][^>]*>\s*/gi, '');
  const policy = contentSecurityPolicy(inlineScriptHashes(html));
  const block = `<meta http-equiv="Content-Security-Policy" ${SECURITY_META_MARK} content="${policy}"/>`;
  const referrer = /<meta\b[^>]*name=["']referrer["']/i.test(html)
    ? '' : '\n<meta name="referrer" content="strict-origin-when-cross-origin"/>';
  const anchor = html.match(/<meta\b[^>]*\bcharset\b[^>]*>/i) || html.match(/<head\b[^>]*>/i);
  if (!anchor) throw new Error('Cannot insert CSP before page content: no charset or head.');
  const index = anchor.index + anchor[0].length;
  return `${html.slice(0, index)}\n${block}${referrer}\n${html.slice(index)}`;
};
