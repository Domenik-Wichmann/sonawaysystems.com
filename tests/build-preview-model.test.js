const {test}=require('node:test'),assert=require('node:assert/strict');const scenes=require('../assets/build-preview-model.js');
test('each scenario has a different connected layout with relevant records',()=>{
 const shapes=[];for(const s of Object.values(scenes)){const ids=new Set(s.nodes.map(n=>n[0]));assert.equal(ids.size,s.nodes.length);assert.ok(ids.has('core'));for(const [a,b,phase] of s.edges){assert.ok(ids.has(a)&&ids.has(b));assert.ok(['capture','review','deliver'].includes(phase));}const reached=new Set(['core']);let old=0;while(reached.size!==old){old=reached.size;for(const [a,b] of s.edges)if(reached.has(a)||reached.has(b)){reached.add(a);reached.add(b);}}assert.equal(reached.size,ids.size);shapes.push(s.nodes.map(n=>n.slice(2).join(',')).join('|'));assert.equal(s.captions.length,3);}assert.equal(new Set(shapes).size,3);
 assert.ok(scenes.starter.nodes.some(n=>n[1]==='Shift practice'));assert.ok(scenes.spa.nodes.some(n=>n[1]==='Closure & dates'));assert.ok(scenes.breakfast.nodes.some(n=>n[1]==='Dispatch procedure'));
});

