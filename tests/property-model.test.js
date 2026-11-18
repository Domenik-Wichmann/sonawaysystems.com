const {test}=require('node:test');
const assert=require('node:assert/strict');
const p=require('../assets/property-model.js');
test('group edits propagate through inherited levels and preserve local exceptions',()=>{
  const before=p.createState(),state=p.edit(before,'core','12:00');
  assert.equal(before.core,'11:00');
  assert.deepEqual(p.affected('core',state),['core','lake','garden','rooms']);
  for(const id of ['core','lake','garden','rooms'])assert.equal(p.valueFor(id,state),'12:00');
  assert.equal(p.valueFor('alpine',state),'10:00');assert.equal(p.valueFor('chalet',state),'09:00');
});
test('Alpine changes reach both sibling lodges, never an independent matching value',()=>{
  const state=p.edit(p.createState(),'alpine','13:00');
  assert.deepEqual(p.affected('alpine',state),['alpine','lodgeA','lodgeB']);
  assert.equal(p.valueFor('suites',state),'13:00');assert.equal(p.sourceFor('suites',state),'suites');
  assert.equal(p.valueFor('chalet',state),'09:00');
});
test('editing any inherited node creates a local rule with the right descendants',()=>{
  let state=p.edit(p.createState(),'garden','12:30');
  assert.deepEqual(p.affected('garden',state),['garden','rooms']);
  state=p.edit(state,'core','14:00');assert.equal(p.valueFor('rooms',state),'12:30');
  state=p.edit(state,'lodgeA','15:00');state=p.edit(state,'alpine','13:00');
  assert.equal(p.valueFor('lodgeA',state),'15:00');assert.equal(p.valueFor('lodgeB',state),'13:00');
  assert.deepEqual(p.affected('alpine',state),['alpine','lodgeB']);
});
test('restoring inheritance reconnects the branch and reset creates clean defaults',()=>{
  let state=p.edit(p.createState(),'garden','12:30');state=p.edit(state,'core','14:00');
  state=p.inherit(state,'garden');assert.equal(p.valueFor('rooms',state),'14:00');
  assert.equal(p.sourceFor('rooms',state),'core');
  assert.deepEqual(p.createState(),{core:'11:00',alpine:'10:00',suites:'13:00',chalet:'09:00'});
  assert.throws(()=>p.inherit(state,'core'));
});
test('times are validated and formatted consistently',()=>{
  assert.equal(p.format('00:00'),'12 AM');assert.equal(p.format('12:30'),'12:30 PM');
  assert.throws(()=>p.edit(p.createState(),'core','25:00'));assert.throws(()=>p.edit(p.createState(),'missing','12:00'));
});
test('matching a parent rejoins its branch and follows future edits',()=>{
 let s=p.edit(p.createState(),'alpine','11:00');
 assert.equal(p.sourceFor('alpine',s),'core');assert.equal(p.sourceFor('lodgeB',s),'core');
 s=p.edit(s,'core','12:00');assert.equal(p.valueFor('lodgeA',s),'12:00');assert.equal(p.valueFor('chalet',s),'09:00');
});
test('changing a parent to an existing child value also couples the branch',()=>{
 const before=p.createState();let s=p.edit(before,'core','10:00');
 assert.equal(p.sourceFor('alpine',s),'core');assert.ok(p.changed(before,s).includes('lodgeA'));
 s=p.edit(s,'core','14:00');assert.equal(p.valueFor('lodgeB',s),'14:00');
 assert.equal(p.valueFor('suites',s),'13:00');
});
test('normalization merges matching ancestors recursively without mutating input',()=>{
 const s={core:'11:00',alpine:'11:00',lodgeA:'11:00',chalet:'09:00'};
 const next=p.normalize(s);assert.deepEqual(next,{core:'11:00',chalet:'09:00'});assert.ok(s.lodgeA);
});

