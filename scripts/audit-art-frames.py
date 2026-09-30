"""Read-only alpha-boundary audit. Passing is NOT visual/animation approval."""
import argparse
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def audit_frame(image, frame):
    x, y, width, height = frame['rect']
    if min(x, y) < 0 or min(width, height) <= 0 or x + width > image.width or y + height > image.height:
        return {'status': 'BLOCKED_ART', 'reason': 'frame outside atlas'}
    # In-memory inspection only: neither the atlas nor a derived image is saved.
    alpha = image.convert('RGBA').getchannel('A').crop((x, y, x + width, y + height))
    mask = alpha.point(lambda value: 255 if value > 32 else 0)
    bounds = mask.getbbox()
    if bounds is None:
        return {'status': 'BLOCKED_ART', 'reason': 'empty frame'}
    pixels = mask.load()
    edges = {
        'left': sum(pixels[0, row] > 0 for row in range(height)),
        'right': sum(pixels[width - 1, row] > 0 for row in range(height)),
        'top': sum(pixels[col, 0] > 0 for col in range(width)),
        'bottom': sum(pixels[col, height - 1] > 0 for col in range(width)),
    }
    return {'status': 'BLOCKED_ART' if any(edges.values()) else 'needs_visual_review',
            'bounds': list(bounds), 'edgePixels': edges,
            'padding': [bounds[0], bounds[1], width - bounds[2], height - bounds[3]]}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('--entity', default='hero')
    parser.add_argument('--action', default='attack1')
    parser.add_argument('--facing', required=True)
    args = parser.parse_args()
    data = json.loads(args.manifest.read_text(encoding='utf-8'))
    asset = next(a for a in data['assets'] if a['entityId'] == args.entity)
    frames = asset['clips'][args.action][args.facing]
    result = []
    for index, frame in enumerate(frames):
        atlas = asset['atlases'][frame['atlas']] if 'atlas' in frame else asset['atlas']
        with Image.open(ROOT / atlas['path']) as image:
            check = audit_frame(image, frame)
        result.append({'frame': index, 'path': atlas['path'], **check})
    print(json.dumps({'asset': asset['id'], 'action': args.action, 'facing': args.facing,
                      'approved': False, 'frames': result}, indent=2))
    return 1 if any(f['status'] == 'BLOCKED_ART' for f in result) else 0

if __name__ == '__main__':
    raise SystemExit(main())
