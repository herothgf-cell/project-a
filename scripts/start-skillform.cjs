'use strict';
const {createServer}=require('../server.cjs');
const port=Number(process.env.PORT||3103);
if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');
const server=createServer({artReview:true});
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('무공 조합 수련장: http://127.0.0.1:'+server.address().port+'/__dev/skillform?dev=1'));
