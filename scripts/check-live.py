"""Compare public Pages bytes with the checked-out, tested commit. Read-only."""
import argparse,hashlib,json,re,time,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
    p=argparse.ArgumentParser();p.add_argument('--url',required=True);p.add_argument('--commit',required=True);a=p.parse_args()
    if not re.fullmatch('[0-9a-f]{40}',a.commit):raise ValueError('Expected complete commit SHA')
    if a.url!='https://herothgf-cell.github.io/project-a/':raise ValueError('Unexpected deployment origin')
    version=json.loads((ROOT/'package.json').read_text())['version']
    def read(name,attempt=0):
        req=urllib.request.Request(a.url+name+'?verified='+a.commit+'-'+str(attempt),headers={'Cache-Control':'no-cache','User-Agent':'Ssanggye-release-check'})
        with urllib.request.urlopen(req,timeout=20) as r:
            if r.status!=200:raise ValueError('HTTP status '+str(r.status))
            return r.read()
    for attempt in range(12):
        try:
            info=json.loads(read('build-info.json',attempt))
            assert info=={'version':version,'commit':a.commit},info
            break
        except Exception:
            if attempt==11:raise
            time.sleep(5)
    html=(ROOT/'index.html').read_text()
    names=['index.html',*dict.fromkeys(re.findall(r'(?:src|href)="([^"?]+\.(?:js|css))(?:\?[^"\s]*)?"',html))]
    matched=[]
    for name in names:
        expected=hashlib.sha256((ROOT/name).read_bytes()).hexdigest()
        for attempt in range(4):
            actual=hashlib.sha256(read(name,attempt)).hexdigest()
            if actual==expected:break
            if attempt==3:raise AssertionError('Published content differs: '+name)
            time.sleep(3)
        matched.append(name)
    assert hashlib.sha256(read('')).digest()==hashlib.sha256((ROOT/'index.html').read_bytes()).digest()
    receipt={'version':version,'commit':a.commit,'root':'matched','assets':matched,'count':len(matched)}
    Path('live-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
    print(json.dumps(receipt,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
