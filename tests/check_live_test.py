"""Live verification must compare every declared binary and reject a different release."""
import hashlib
import importlib.util
import json
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('check_live', Path(__file__).resolve().parents[1] / 'scripts/check-live.py')
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)

class LiveVerificationTests(unittest.TestCase):
    def fixture(self):
        content = {'index.html': b'<html>game</html>', 'assets/art/reality/hero/test/idle.png': b'\x89PNG\r\n\x1a\nactual-art'}
        manifest = {'version': '0.8.0', 'commit': 'a' * 40, 'assets': {name: hashlib.sha256(data).hexdigest() for name, data in content.items()}}
        remote = {**content, '': content['index.html'], 'asset-manifest.json': json.dumps(manifest).encode(), 'build-info.json': json.dumps({'version': '0.8.0', 'commit': 'a' * 40}).encode()}
        return manifest, remote

    def test_binary_mismatch_fails_even_when_build_info_matches(self):
        self.assertTrue(hasattr(checker, 'verify_release'), 'shared release verifier must exist')
        manifest, remote = self.fixture()
        remote['assets/art/reality/hero/test/idle.png'] = b'old image'
        with self.assertRaises(AssertionError):
            checker.verify_release(manifest, remote.__getitem__)

    def test_declared_manifest_and_all_bytes_must_match(self):
        self.assertTrue(hasattr(checker, 'verify_release'), 'shared release verifier must exist')
        manifest, remote = self.fixture()
        result = checker.verify_release(manifest, remote.__getitem__)
        self.assertEqual(result['count'], 2)
        other = dict(manifest, commit='b' * 40)
        remote['asset-manifest.json'] = json.dumps(other).encode()
        with self.assertRaises(AssertionError):
            checker.verify_release(manifest, remote.__getitem__)

if __name__ == '__main__':
    unittest.main()
