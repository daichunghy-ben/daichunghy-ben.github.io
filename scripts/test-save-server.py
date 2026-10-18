"""Regression tests use temporary HTML only; never touch portfolio source."""
import contextlib
import http.client
import importlib.util
import io
from pathlib import Path
import tempfile
import threading
import unittest

spec = importlib.util.spec_from_file_location('save_server', Path(__file__).resolve().parents[1] / '_build/save_server.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SaveSecurityTests(unittest.TestCase):
    def test_authorization_and_atomic_recovery(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'index.html'
            target.write_text('original')
            server = module.create_server(0, target=target, token='test-session-only')
            self.assertEqual(server.server_address[0], '127.0.0.1')

            def request(method='POST', body=b'<html>replacement</html>', extra=None, route='/save'):
                worker = threading.Thread(target=server.handle_request)
                worker.start()
                client = http.client.HTTPConnection(*server.server_address, timeout=3)
                headers = {'Content-Type': 'text/html', 'X-Save-Token': 'test-session-only'}
                headers.update(extra or {})
                try:
                    client.request(method, route, body=body, headers=headers)
                    response = client.getresponse()
                    response.read()
                    return response.status, dict(response.getheaders())
                finally:
                    client.close()
                    worker.join(timeout=3)

            try:
                for headers, status in [
                    ({'X-Save-Token': ''}, 403),
                    ({'X-Save-Token': 'wrong'}, 403),
                    ({'Origin': 'https://attacker.example'}, 403),
                    ({'Origin': 'null'}, 403),
                    ({'Host': 'attacker.example'}, 403),
                    ({'Content-Type': 'text/plain'}, 415),
                    ({'Content-Length': '-1'}, 400),
                    ({'Content-Length': 'bad'}, 400),
                    ({'Content-Length': str(module.MAX_BYTES + 1)}, 413),
                    ({'Transfer-Encoding': 'chunked'}, 400),
                ]:
                    self.assertEqual(request(extra=headers)[0], status)
                    self.assertEqual(target.read_text(), 'original')
                self.assertEqual(request(route='/index.html')[0], 404)
                self.assertEqual(request(body=b'\xff')[0], 400)
                self.assertEqual(request(body=b'   ')[0], 400)
                self.assertEqual(request('OPTIONS', b'', {'Origin': 'https://attacker.example'})[0], 403)
                status, headers = request('OPTIONS', b'', {'Origin': module.PREVIEW_ORIGIN})
                self.assertEqual(status, 204)
                self.assertEqual(headers['Access-Control-Allow-Origin'], module.PREVIEW_ORIGIN)
                with contextlib.redirect_stdout(io.StringIO()):
                    status, headers = request(extra={'Origin': module.PREVIEW_ORIGIN})
                self.assertEqual(status, 200)
                self.assertTrue(server.saved)
                self.assertIn('<html>replacement</html>', target.read_text())
                backups = list(Path(directory).glob('*.bak'))
                self.assertEqual(len(backups), 1)
                self.assertEqual(backups[0].read_text(), 'original')
                self.assertEqual(module.TARGET, Path(__file__).resolve().parents[1] / 'portfolio/index.html')
            finally:
                server.server_close()


if __name__ == '__main__':
    unittest.main()
