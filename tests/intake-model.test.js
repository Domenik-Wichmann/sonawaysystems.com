const {test}=require('node:test');const assert=require('node:assert/strict');const m=require('../assets/intake-model.js');
test('every offered route produces complete, scoped guidance and valid review',()=>{
 let count=0;const visit=(a,i)=>{if(i===m.keys.length){
  assert.equal(m.validate(a),true);const p=m.plan(a);count++;
  for(const field of ['property','venue','baseline','after','period','owner','guest','staff','manager']){assert.ok(p[field]);assert.ok(!p[field].includes('undefined'));}
  assert.ok(p.guest.includes(p.period));assert.ok(p.manager.includes(p.owner));
  if(a.scope==='event')assert.match(p.guest,/Other customers keep/);
  if(a.change==='private')assert.match(p.staff,/event list/);
  assert.equal(p.fallback.includes('until an approved replacement'),a.period==='ongoing');return;
 }for(const o of m.step(a,i).options)visit({...a,[m.keys[i]]:o.id},i+1);};visit({},0);assert.ok(count>500);
});
test('incomplete or incompatible choices cannot produce an approved plan',()=>{
 assert.equal(m.validate({}),false);assert.throws(()=>m.plan({}));
 const a={property:'alpine',venue:'main',change:'hours',detail:'06:00',period:'ongoing',scope:'all',owner:'fb'};
 assert.equal(m.validate(a),false);assert.throws(()=>m.plan(a));
});
test('changing venue and scope changes the resulting instructions',()=>{
 const a={property:'lakeside',venue:'main',change:'private',detail:'wedding',period:'dec18',scope:'alternative',owner:'duty'};
 assert.match(m.plan(a).guest,/Collection desk/);assert.match(m.plan({...a,scope:'room'}).guest,/delivery support/);
 const b={...a,change:'move',detail:'spa',scope:'event'};assert.match(m.plan(b).staff,/Priority desk/);assert.match(m.plan(b).guest,/Other customers keep their normal venue/);
});

