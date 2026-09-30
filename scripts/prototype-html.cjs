'use strict';
function prototypeHtml(html,{commit,publicBuild=false}={}){
 const boot='<script>document.documentElement.setAttribute("data-art-loading","");'+(publicBuild?'globalThis.SSANGGYE_PROTOTYPE=true;':'')+'</script><style>#cover{visibility:hidden}html[data-art-loading] canvas{visibility:hidden}html[data-art-loading]::after{content:"새 아트를 불러오는 중…";position:fixed;inset:0;display:grid;place-items:center;background:#101e24;color:#ffe1a3;z-index:210;pointer-events:none}</style><script defer src="art-runtime.js"></script><script defer src="art-preview-runtime.js"></script>';
 let result=html.replace('</head>',boot+'</head>');
 if(commit)result=result.replace(/((?:src|href)=")([^"?]+\.(?:js|css))(?:\?[^"\s]*)?"/g,(_,prefix,file)=>prefix+file+'?build='+commit+'"');
 return result;
}
module.exports={prototypeHtml};
