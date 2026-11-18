const {test} = require('node:test');
const assert = require('node:assert/strict');
const {resolve} = require('../assets/knowledge-model.js');

test('date and question determine the most specific applicable source',()=>{
  const examples=[
    ['2026-06-15','base',['base','base','base']],
    ['2026-12-10','winter',['winter','winter','winter']],
    ['2026-12-25','christmas',['christmas','christmas','christmas']],
    ['2026-12-18','wedding',['wedding','wedding','winter']],
    ['2026-03-15','spring',['spring','base','base']],
    ['2026-04-12','festival',['festival','festival','base']],
    ['2026-04-16','gala',['gala','festival','gala']]
  ];
  for(const [date,leaf,sources] of examples){
    ['restaurant','buffet','room'].forEach((policy,i)=>{
      const result=resolve(date,policy);
      assert.equal(result.leaf,leaf,`${date} ${policy} context`);
      assert.equal(result.source,sources[i],`${date} ${policy} source`);
      assert.ok(result.path.includes(result.source));
    });
  }
});
test('event exceptions expire and seasonal boundaries include their end dates',()=>{
  for(const [date,leaf] of [['2026-11-30','base'],['2026-12-01','winter'],['2026-12-17','winter'],['2026-12-19','winter'],['2026-12-23','winter'],['2026-12-24','christmas'],['2026-12-30','christmas'],['2026-12-31','winter'],['2027-01-01','winter'],['2027-02-28','winter'],['2027-03-01','spring'],['2026-04-09','spring'],['2026-04-10','festival'],['2026-04-17','festival'],['2026-04-20','festival'],['2026-04-21','spring'],['2026-05-31','spring'],['2026-06-01','base']]) assert.equal(resolve(date,'restaurant').leaf,leaf,date);
});
test('inherited fields keep the correct ancestor rather than an unrelated event rule',()=>{
  const galaBuffet=resolve('2026-04-16','buffet');
  assert.deepEqual(galaBuffet.path,['base','spring','festival','gala']);
  assert.equal(galaBuffet.value,'7–11 AM · festival buffet');
  const weddingRoom=resolve('2026-12-18','room');
  assert.deepEqual(weddingRoom.path,['base','winter','wedding']);
  assert.equal(weddingRoom.value,'6 AM–midnight');
  assert.match(resolve('2026-12-18','buffet').answer,/Other customers.*Collection desk/);
});
test('invalid dates and unknown policy IDs return no answer',()=>{
  for(const date of ['', '2026-02-30','2026-13-01','12/18/2026','2026-02-29'])assert.equal(resolve(date,'buffet'),null);
  assert.equal(resolve('2026-12-18','unknown'),null);
});

