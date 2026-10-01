const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function payloads(root){const base=path.join(root,'legacy/v011'),file=path.join(base,'manifest.json'),out=new Map();if(!fs.existsSync(file))return out;const m=JSON.parse(fs.readFileSync(file));
 for(const [name,meta]of Object.entries(m.files)){const b=fs.readFileSync(path.join(base,name));if(crypto.createHash('sha256').update(b).digest('hex')!==meta.sha256)throw Error('Archived runtime changed: '+name);out.set('legacy/v011/'+name,b);}
 for(const [name,sha]of Object.entries(m.shared)){const b=fs.readFileSync(path.join(root,name));if(crypto.createHash('sha256').update(b).digest('hex')!==sha)throw Error('Archived shared art changed: '+name);out.set('legacy/v011/'+name,b);}
 out.set('legacy/v011/bootstrap.js',fs.readFileSync(path.join(base,'bootstrap.js')));return out;
}module.exports={payloads};
