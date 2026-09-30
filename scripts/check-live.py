"""Compare public Pages bytes with the checked-out, tested commit. Read-only."""
import argparse,hashlib,json,re,time,urllib.request,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def verify_release(expected, read):
    info=json.loads(read('build-info.json'))
    assert info=={'version':expected['version'],'commit':expected['commit']},info
    published=json.loads(read('asset-manifest.json'))
    assert published==expected,'Published asset manifest differs from local tested build'
    for name,sha in expected['assets'].items():
        assert hashlib.sha256(read(name)).hexdigest()==sha,'Published content differs: '+name
    assert hashlib.sha256(read('')).hexdigest()==expected['assets']['index.html'],'Public root differs'
    return {'version':info['version'],'commit':info['commit'],'root':'matched','assets':list(expected['assets']),'count':len(expected['assets'])}

def main():
    p=argparse.ArgumentParser();p.add_argument('--url',required=True);p.add_argument('--commit',required=True);p.add_argument('--include-prototype',action='store_true');a=p.parse_args()
    if not re.fullmatch('[0-9a-f]{40}',a.commit):raise ValueError('Expected complete commit SHA')
    if a.url!='https://herothgf-cell.github.io/project-a/':raise ValueError('Unexpected deployment origin')
    # Use the exact packaging function, including approved-only catalog serialization.
    with tempfile.TemporaryDirectory(prefix='ssanggye-live-') as out:
        subprocess.run(['node',str(ROOT/'scripts/build-site.cjs'),out,a.commit]+(['--include-prototype'] if a.include_prototype else []),cwd=ROOT,check=True,capture_output=True)
        expected=json.loads((Path(out)/'asset-manifest.json').read_text())
    def read(name,attempt=0):
        req=urllib.request.Request(a.url+name+'?verified='+a.commit+'-'+str(attempt),headers={'Cache-Control':'no-cache','User-Agent':'Ssanggye-release-check'})
        with urllib.request.urlopen(req,timeout=20) as r:
            if r.status!=200:raise ValueError('HTTP status '+str(r.status))
            return r.read()
    for attempt in range(12):
        try:
            receipt=verify_release(expected,lambda name:read(name,attempt))
            break
        except Exception:
            if attempt==11:raise
            time.sleep(5)
    Path('live-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
    print(json.dumps(receipt,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
