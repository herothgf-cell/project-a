const {run}=require('./browser-harness.cjs');
module.exports={run:fn=>run(fn,{legacy:true})};
