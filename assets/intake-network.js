/* Smooth scope-focused exploration; fictional data only. */
(() => {
 'use strict';
 function scene({example='access',answers={},stage=0,approved=false}={}){
  const focus=answers.scope==='Warehouse A'?'a':answers.scope==='Warehouse B'?'b':'warehouses';
  const nodes=[{id:'warehouses',label:'Warehouses'},{id:'a',label:'Warehouse A'},{id:'b',label:'Warehouse B'},{id:'change',label:example==='cutoff'?'Order cutoff':example==='checklist'?'Equipment checks':'Delivery access'}];
  const extras=[['value',answers.value||'Proposed rule'],['audience',answers.audience||'Who it applies to'],['period',answers.period?.includes('temporary')?'9–15 November':'From 9 November'],['hours',answers.hours||'Conditions'],['owner',answers.owner||'Review owner'],['report',approved?'Demo approved':'Change report']];
  extras.forEach(([id,label],i)=>{if(stage>i)nodes.push({id,label});});
  const others=nodes.filter(n=>n.id!==focus);
  for(const n of nodes){n.state=answers.scope&&answers.scope!=='Both warehouses'&&((n.id==='a'&&focus==='b')||(n.id==='b'&&focus==='a'))?'outside':n.id===focus?'draft':stage?'matched':'context';const angle=-Math.PI/2+others.indexOf(n)*Math.PI*2/others.length;n.x=n.id===focus?320:320+245*Math.cos(angle);n.y=n.id===focus?185:185+140*Math.sin(angle);}
  const edges=[['warehouses','a'],['warehouses','b'],[focus,'change']];extras.forEach(([id])=>{if(nodes.some(n=>n.id===id))edges.push([focus,id]);});
  return {nodes,edges,focus,caption:approved?'Demo approved. Connected guidance and notifications are simulated only.':!answers.scope?'Warehouses share a parent. Choose one site or both to explore their knowledge.':(answers.scope==='Both warehouses'?'The Warehouses group is the focus. ':answers.scope+' is the focus. ')+(stage<6?'Connected details appear as you complete the change.':'Review affected guidance before approving the draft.')};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={scene};
 if(typeof document==='undefined')return;
 const svg=document.querySelector('#intake-network-svg');if(!svg)return;
 const layer=svg.querySelector('.network-nodes'),links=svg.querySelector('.network-links'),tracer=svg.querySelector('.network-tracer'),skip=document.querySelector('#network-skip'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 const elements=new Map(),points=new Map();let frame=0,finish=null;
 const make=(tag,attrs)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e;};
 function stop(){cancelAnimationFrame(frame);tracer.setAttribute('visibility','hidden');skip.hidden=true;finish=null;}
 function render(detail){
  stop();const data=scene(detail),ids=new Set(data.nodes.map(n=>n.id)),start=new Map();
  for(const [id,e]of elements)if(!ids.has(id)){e.remove();elements.delete(id);points.delete(id);}
  for(const n of data.nodes){let g=elements.get(n.id);if(!g){g=make('g',{'data-record':n.id});g.append(make('circle',{r:22,class:'network-halo'}),make('circle',{r:8,class:'network-core'}),make('text',{y:32,'text-anchor':'middle'}));layer.append(g);elements.set(n.id,g);}g.setAttribute('class','network-record '+n.state+' discovered');g.querySelector('.network-core').setAttribute('r',n.id===data.focus?14:8);const label=g.querySelector('text');label.replaceChildren();let lines=[''];for(const word of n.label.split(' ')){if((lines.at(-1)+' '+word).trim().length>18)lines.push(word);else lines[lines.length-1]=(lines.at(-1)+' '+word).trim();}lines.forEach((line,i)=>{const span=make('tspan',{x:0,dy:i?18:0});span.textContent=line;label.append(span);});start.set(n.id,points.get(n.id)||points.get(data.focus)||{x:320,y:185});}
  links.replaceChildren();const paths=[],seen=new Set();for(const [a,b]of data.edges){if(a===b)continue;const key=[a,b].sort().join(':');if(seen.has(key))continue;seen.add(key);const outside=data.nodes.find(n=>n.id===b).state==='outside';const p=make('path',{class:'network-edge '+(outside?'outside':''),'data-from':a,'data-to':b});links.append(p);paths.push({a,b,p,outside});}
  function layout(t){for(const n of data.nodes){const old=start.get(n.id),p={x:old.x+(n.x-old.x)*t,y:old.y+(n.y-old.y)*t};points.set(n.id,p);elements.get(n.id).setAttribute('transform','translate('+p.x+' '+p.y+')');}for(const {a,b,p}of paths){const x=points.get(a),y=points.get(b);p.setAttribute('d','M '+x.x+' '+x.y+' Q '+((x.x+y.x)/2+12)+' '+((x.y+y.y)/2-14)+' '+y.x+' '+y.y);}}
  svg.dataset.focus=data.focus;document.querySelector('#network-caption').textContent=data.caption;svg.querySelector('#network-svg-desc').textContent=data.caption;
  finish=()=>{stop();layout(1);paths.filter(p=>!p.outside).forEach(({p})=>p.classList.add('traversed'));};
  if(motion.matches||document.hidden){finish();return;}
  skip.hidden=false;tracer.removeAttribute('hidden');const adj=new Map(data.nodes.map(n=>[n.id,[]]));for(const edge of paths){if(edge.outside)continue;adj.get(edge.a).push({to:edge.b,edge,forward:true});adj.get(edge.b).push({to:edge.a,edge,forward:false});}
  const visited=new Set(),walk=[];function visit(id){visited.add(id);for(const item of adj.get(id))if(!visited.has(item.to)){walk.push(item);visit(item.to);walk.push({...item,to:id,forward:!item.forward});}}visit(data.focus);
  let began=null,index=0,leg=null;function tick(time){if(began===null)began=time;const t=Math.min(1,(time-began)/720);layout(1-(1-t)**3);if(t===1&&walk.length){if(leg===null)leg=time;const item=walk[index],progress=Math.min(1,(time-leg)/180),p=item.edge.p,at=p.getPointAtLength(p.getTotalLength()*(item.forward?progress:1-progress));tracer.setAttribute('visibility','visible');tracer.setAttribute('cx',at.x);tracer.setAttribute('cy',at.y);if(progress===1){p.classList.add('traversed');index++;leg=null;if(index===walk.length){finish();return;}}}else if(t===1){finish();return;}frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);
 }
 skip.addEventListener('click',()=>finish?.());motion.addEventListener('change',()=>finish?.());document.addEventListener('visibilitychange',()=>{if(document.hidden)finish?.();});window.addEventListener('sonaway:intake',e=>render(e.detail));
})();
