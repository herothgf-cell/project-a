(function(root){'use strict';root.DevelopmentUI={create({game,show,node,refresh,commit,notes,close,character,prepare,objective=()=>{}}){
 const skills=SkillsScreen.create({game,show,node,refresh,commit,close,notes});
 const advancement=GrowthScreen.create({game,show,node,refresh,commit,close,character,skills:world=>skills.open(world),prepare,objective});
 const challenges=ResonanceUI.create({game,show,node,commit,close,refresh,prepare,back:objective,skills:()=>skills.open('reality')});
 function open(section='skills',subject=null){if(game().introActive)return;
  if(section==='realm'||section==='hunter')return advancement.open(section);
  if(section==='challenges'||section==='records')return challenges.open(section==='records'?'records':'goals');
  if(section==='stats'||subject==='crystal'||section==='status')return character.open('reality','crystal');
  if(section==='growth'&&['realm','hunter'].includes(subject))return advancement.open(subject);
  if(section==='growth'&&subject==='resonance')return character.open('reality','crystal');
  return skills.open(subject==='murim'||subject==='reality'?subject:WorldGrowth.worldOf(game()),subject);
 }
 return {open};
}};})(globalThis);
