"""Read-only sprite checks must detect cropped silhouettes, not bless animation quality."""
import importlib.util
import json
from pathlib import Path
import unittest
from PIL import Image

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/audit-art-frames.py'

class FrameAuditTests(unittest.TestCase):
    def setUp(self):
        self.assertTrue(SCRIPT.exists(), 'frame boundary auditor is missing')
        spec = importlib.util.spec_from_file_location('art_audit', SCRIPT)
        self.api = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.api)

    def test_detects_opaque_sword_at_crop_boundary(self):
        image = Image.new('RGBA', (12, 12))
        image.putpixel((5, 4), (255, 255, 255, 255))
        result = self.api.audit_frame(image, {'rect': [0, 0, 6, 8]})
        self.assertEqual(result['edgePixels']['right'], 1)
        self.assertEqual(result['status'], 'BLOCKED_ART')

    def test_transparent_rgb_does_not_count_as_silhouette(self):
        image = Image.new('RGBA', (8, 8), (255, 0, 255, 0))
        image.putpixel((3, 4), (0, 0, 0, 255))
        result = self.api.audit_frame(image, {'rect': [0, 0, 8, 8]})
        self.assertEqual(result['bounds'], [3, 4, 4, 5])
        self.assertEqual(result['status'], 'needs_visual_review')
        self.assertEqual(sum(result['edgePixels'].values()), 0)

    def test_rejects_empty_or_out_of_bounds_frame(self):
        image = Image.new('RGBA', (8, 8))
        self.assertEqual(self.api.audit_frame(image, {'rect': [0, 0, 8, 8]})['reason'], 'empty frame')
        self.assertEqual(self.api.audit_frame(image, {'rect': [7, 0, 2, 8]})['reason'], 'frame outside atlas')

    def test_seal_and_ripple_do_not_bleed_across_runtime_cells(self):
        root = SCRIPT.parents[1]
        manifest = json.loads((root / 'assets/art/scene-candidate.json').read_text(encoding='utf-8'))
        for asset in manifest['assets']:
            if asset['id'] not in ('shared.vfx.seal', 'shared.vfx.ripple'):
                continue
            with Image.open(root / asset['atlas']['path']) as image:
                for action, facings in asset['clips'].items():
                    for frame in facings['none']:
                        with self.subTest(asset=asset['id'], action=action):
                            result = self.api.audit_frame(image, frame)
                            self.assertEqual(result['status'], 'needs_visual_review', result)

    def test_enemy_weapons_and_bodies_fit_every_se_runtime_cell(self):
        root = SCRIPT.parents[1]
        manifest = json.loads((root / 'assets/art/scene-candidate.json').read_text(encoding='utf-8'))
        for asset in [a for a in manifest['assets'] if a['kind'] == 'enemy']:
            for action, facings in asset['clips'].items():
                for index, frame in enumerate(facings['se']):
                    atlas = asset['atlases'][frame['atlas']] if 'atlas' in frame else asset['atlas']
                    with self.subTest(asset=asset['id'], action=action, frame=index), Image.open(root / atlas['path']) as image:
                        result = self.api.audit_frame(image, frame)
                        self.assertEqual(result['status'], 'needs_visual_review', result)

    def test_hero_motion_cells_do_not_clip_boots_hair_or_weapons(self):
        root = SCRIPT.parents[1]
        for world in ('reality', 'murim'):
            asset = json.loads((root / f'assets/art/{world}/hero/yunseo/candidate.json').read_text(encoding='utf-8'))['assets'][0]
            for action, facings in asset['clips'].items():
                if action.startswith('portrait'):
                    continue  # Portrait framing intentionally crops below the face.
                for facing, frames in facings.items():
                    for index, frame in enumerate(frames):
                        atlas = asset['atlases'][frame['atlas']] if 'atlas' in frame else asset['atlas']
                        with self.subTest(world=world, action=action, facing=facing, frame=index), Image.open(root / atlas['path']) as image:
                            result = self.api.audit_frame(image, frame)
                            self.assertEqual(result['status'], 'needs_visual_review', result)

    def test_dodge_recovery_does_not_grow_before_returning_to_idle(self):
        root = SCRIPT.parents[1]
        for world in ('reality', 'murim'):
            asset = json.loads((root / f'assets/art/{world}/hero/yunseo/candidate.json').read_text(encoding='utf-8'))['assets'][0]
            def rendered_height(frame):
                atlas = asset['atlases'][frame['atlas']]
                with Image.open(root / atlas['path']) as image:
                    result = self.api.audit_frame(image, frame)
                return (result['bounds'][3] - result['bounds'][1]) * frame['displayHeight'] / frame['rect'][3]
            for facing, frames in asset['clips']['dodge'].items():
                with self.subTest(world=world, facing=facing):
                    idle = rendered_height(asset['clips']['idle'][facing][0])
                    recovery = rendered_height(frames[-1])
                    self.assertLessEqual(recovery, idle * 1.1, 'recovering body visibly grows relative to idle')
                    self.assertGreaterEqual(recovery, idle * .8, 'recovering body visibly shrinks relative to idle')

if __name__ == '__main__':
    unittest.main()
