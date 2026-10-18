"""Operator-only loopback recovery endpoint; never part of the live site.

POST text/html to http://127.0.0.1:9999/save with the printed X-Save-Token.
Browser callers must use the preview origin http://127.0.0.1:4173. Exits
after one successful save or five minutes; retains a hidden sibling backup.
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
import os
import re
import secrets
import shutil
import tempfile
import time

TARGET = Path(__file__).resolve().parents[1] / 'portfolio' / 'index.html'
PREVIEW_ORIGIN = 'http://127.0.0.1:4173'
MAX_BYTES = 2 * 1024 * 1024


class H(BaseHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(5)

    def allowed_request(self):
        port = self.server.server_port
        if self.headers.get('Host') not in {f'127.0.0.1:{port}', f'localhost:{port}'}:
            self.send_error(403, 'Invalid host')
            return False
        if self.path != '/save':
            self.send_error(404)
            return False
        origin = self.headers.get('Origin')
        if origin is not None and origin != PREVIEW_ORIGIN:
            self.send_error(403, 'Invalid origin')
            return False
        return True

    def cors_headers(self):
        if self.headers.get('Origin') == PREVIEW_ORIGIN:
            self.send_header('Access-Control-Allow-Origin', PREVIEW_ORIGIN)
            self.send_header('Vary', 'Origin')

    def do_OPTIONS(self):
        if not self.allowed_request():
            return
        self.send_response(204)
        self.cors_headers()
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Save-Token')
        self.end_headers()

    def do_POST(self):
        if not self.allowed_request():
            return
        token = self.headers.get('X-Save-Token', '')
        if not secrets.compare_digest(token.encode(), self.server.save_token.encode()):
            self.send_error(403, 'Invalid token')
            return
        if self.headers.get_content_type() != 'text/html':
            self.send_error(415, 'Expected text/html')
            return
        lengths = self.headers.get_all('Content-Length', [])
        if self.headers.get('Transfer-Encoding') or len(lengths) != 1 or not lengths[0].isascii() or not lengths[0].isdigit():
            self.send_error(400, 'Expected one valid Content-Length')
            return
        length = int(lengths[0])
        if not 0 < length <= MAX_BYTES:
            self.send_error(413, 'Invalid body size')
            return
        try:
            raw = self.rfile.read(length)
            if len(raw) != length:
                raise ValueError('Incomplete body')
            body = raw.decode('utf-8')
        except (UnicodeDecodeError, ValueError, TimeoutError):
            self.send_error(400, 'Invalid HTML body')
            return
        if not body.strip():
            self.send_error(400, 'Empty HTML body')
            return
        body = re.sub(r'<style id="antigravity-scroll-lock-style">.*?</style>', '', body, flags=re.DOTALL)
        body = re.sub(r'<style>\s*body::-webkit-scrollbar.*?</style>', '', body, flags=re.DOTALL)
        body = re.sub(r'<div id="preact-border-shadow-host".*?</div>', '', body, flags=re.DOTALL)
        body = body.replace(' class=""', '')
        if not body.lstrip().lower().startswith('<!doctype'):
            body = '<!DOCTYPE html>\n' + body
        # The request and startup cwd never choose the destination.
        target = self.server.save_target
        if target.is_symlink():
            self.send_error(409, 'Target cannot be a symbolic link')
            return
        with tempfile.NamedTemporaryFile(dir=target.parent, prefix='.index-recovery-', suffix='.bak', delete=False) as backup:
            if target.exists():
                with target.open('rb') as previous:
                    shutil.copyfileobj(previous, backup)
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=target.parent, prefix='.index-recovery-', delete=False) as staged:
                temporary = staged.name
                staged.write(body)
            os.replace(temporary, target)
        finally:
            if temporary and os.path.exists(temporary):
                os.unlink(temporary)
        self.server.saved = True
        self.send_response(200)
        self.cors_headers()
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(b'OK')
        print(f'Saved {target}; backup: {backup.name}', flush=True)


def create_server(port=9999, *, target=TARGET, token=None):
    server = HTTPServer(('127.0.0.1', port), H)
    server.save_target = Path(target)
    server.save_token = token or secrets.token_urlsafe(32)
    server.saved = False
    server.timeout = 1
    return server


def main():
    with create_server() as server:
        print(f'POST http://127.0.0.1:{server.server_port}/save', flush=True)
        print(f'X-Save-Token: {server.save_token}', flush=True)
        print(f'Target: {server.save_target}', flush=True)
        deadline = time.monotonic() + 300
        while not server.saved and time.monotonic() < deadline:
            server.handle_request()
    print('Server done.')


if __name__ == '__main__':
    main()
