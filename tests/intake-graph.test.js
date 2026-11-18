const {test}=require('node:test');const assert=require('node:assert/strict');
const m=require('../assets/intake-model.js'),g=require('../assets/intake-graph.js');
test('selected records become the starting node of the next neighborhood',()=>{
 const visit=(a,i)=>{const s=g.scene(m,a,i);if(i===7)return;
 for(const o of m.step(a,i).options){const candidate=s.nodes.find(n=>n.choice===o.id),next={...a,[m.keys[i]]:o.id};assert.equal(g.scene(m,next,i+1).source,candidate.id);visit(next,i+1);}
 };visit({},0);
});
test('every search route follows actual connections, backtracks, and reaches all relevant nodes',()=>{
 const visit=(a,i)=>{const s=g.scene(m,a,i),ids=new Set(s.nodes.map(n=>n.id));assert.equal(ids.size,s.nodes.length);
 for(const n of s.nodes){assert.ok(n.x>=0&&n.x<=640);assert.ok(n.y>=0&&n.y<=s.height);assert.notEqual(n.kind,'UPDATED');}
 let at=s.source;const reached=new Set([at]);for(const step of g.walk(s)){const edge=s.edges.find(e=>e.id===step.edge);assert.equal(step.from,at);assert.ok(edge);assert.deepEqual(new Set([step.from,step.to]),new Set([edge.from,edge.to]));reached.add(step.to);at=step.to;}
 assert.equal(reached.size,ids.size);assert.ok(g.walk(s).some(step=>step.backtrack));
 if(i===7){assert.equal(g.scene(m,a,i,true).nodes.filter(n=>n.kind==='UPDATED').length,4);return;}
 for(const o of m.step(a,i).options)visit({...a,[m.keys[i]]:o.id},i+1);
 };visit({},0);
});
test('questions change topology, and alternate service changes explore different neighborhoods',()=>{
 const a={property:'alpine',venue:'summit',change:'hours'};
 const signatures=Array.from({length:4},(_,i)=>{const s=g.scene(m,a,i);return s.nodes.map(n=>`${n.x},${n.y}`).join('|');});assert.equal(new Set(signatures).size,4);
 const hours=g.scene(m,a,3),event=g.scene(m,{...a,change:'private'},3),move=g.scene(m,{...a,change:'move'},3);
 const degrees=s=>s.nodes.map(n=>s.edges.filter(e=>!e.cross&&e.from===n.id).length).sort().join(',');assert.notEqual(degrees(hours),degrees(event));assert.notEqual(hours.nodes.length,move.nodes.length);
 assert.ok(hours.nodes.some(n=>n.label==='Packing lead readiness'));assert.ok(event.nodes.some(n=>n.label==='Event bookings'));assert.ok(move.nodes.some(n=>n.label==='Alternative dining'));
});

