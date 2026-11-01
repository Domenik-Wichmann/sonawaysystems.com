/* Local, fictional delivery-access map. No requests or operational changes. */
(() => {
  'use strict';
  const positions = {
    change: [310,198], a: [133,108], b: [504,105], rear: [318,65],
    normal: [97,284], period: [309,335], suppliers: [510,269],
    deliveries: [514,350], collections: [120,365], instructions: [490,170],
    owner: [130,205]
  };
  function scene({stage=0,site='',timing='',delivery=''}={}) {
    const both=site==='Both warehouses', temporary=timing==='For one event week';
    const all=delivery==='All deliveries, not collections';
    const nodes=[
      ['change','Delivery access','draft'],
      ['a','Warehouse A',stage?'matched':'context'],
      ['b','Warehouse B',stage?(both?'matched':'outside'):'context'],
      ['rear','Rear entrance',stage?'matched':'context'],
      ['normal','Normal instructions','context'],
    ];
    const edges=[['change','a'],['change','b'],['change','rear'],['a','normal']];
    if(stage>=1){nodes.push(['period',stage>=2?(temporary?'Event week':'From next Monday'):'When it applies',stage>=2?'matched':'context']);edges.push(['normal','period']);}
    if(stage>=2){nodes.push(['suppliers','Supplier deliveries',stage>=3?'matched':'context'],['collections','Customer collections','outside']);edges.push(['rear','suppliers'],['normal','collections']);}
    if(stage>=3){nodes.push(['deliveries','Other deliveries',all?'matched':'outside'],['instructions',both?'Both delivery guides':'Warehouse A guide','matched'],['owner','Responsible person','context']);edges.push(['suppliers','deliveries'],['suppliers','instructions'],['a','owner']);if(both)edges.push(['b','instructions']);}
    const captions=[
      'Two locations. Separate instructions. First, choose where the change belongs.',
      `${both?'Both warehouses are':'Warehouse A is'} in scope. Next, connect the change to its dates.`,
      `${temporary?'Keep the normal route beneath a temporary exception.':'Keep the previous instructions in history.'} Customer collections have their own route.`,
      `${both?'Two delivery guides':'One delivery guide'} linked to the draft. Collections stay unchanged. Exact dates, access hours and approval still need confirmation.`
    ];
    return {nodes:nodes.map(([id,label,state])=>({id,label,state,x:positions[id][0],y:positions[id][1]})),edges,caption:captions[Math.min(stage,3)]};
  }
  // Export the small state model for provider-free branch checks.
  if(typeof module!=='undefined'&&module.exports)module.exports={scene};
  if(typeof document==='undefined')return;
  const svg=document.querySelector('#intake-network-svg');if(!svg)return;
  const ns='http://www.w3.org/2000/svg', links=svg.querySelector('.network-links'), layer=svg.querySelector('.network-nodes');
  const tracer=svg.querySelector('.network-tracer'),skip=document.querySelector('#network-skip'),caption=document.querySelector('#network-caption');
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const elements=new Map(),paths=new Map();let frame=0,finish=null;
  const make=(tag,attrs)=>{const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));return n;};
  function stop(){cancelAnimationFrame(frame);frame=0;tracer.setAttribute('visibility','hidden');skip.hidden=true;finish=null;}
  function render(detail){
    stop();const data=scene(detail), byId=new Map(data.nodes.map(n=>[n.id,n]));
    for(const [id,e] of elements)if(!byId.has(id)){e.remove();elements.delete(id);}
    for(const n of data.nodes){
      let group=elements.get(n.id);
      if(!group){group=make('g',{'data-record':n.id,transform:`translate(${n.x} ${n.y})`});group.append(make('circle',{r:22,class:'network-halo'}),make('circle',{r:n.id==='change'?12:8,class:'network-core'}));const label=make('text',{y:38,'text-anchor':'middle'});group.append(label);layer.append(group);elements.set(n.id,group);}
      group.setAttribute('class',`network-record ${n.state}`);const label=group.querySelector('text');label.replaceChildren();const lines=[''];for(const word of n.label.split(' ')){if((lines.at(-1)+' '+word).trim().length>16)lines.push(word);else lines[lines.length-1]=(lines.at(-1)+' '+word).trim();}lines.forEach((line,i)=>{const span=make('tspan',{x:0,dy:i?20:0});span.textContent=line;label.append(span);});
    }
    links.replaceChildren();paths.clear();
    for(const [a,b] of data.edges){const p=byId.get(a),q=byId.get(b);const bend=(p.x+q.x)/2;
      const path=make('path',{d:`M ${p.x} ${p.y} Q ${bend} ${p.y-28} ${q.x} ${q.y}`,class:`network-edge ${q.state==='outside'?'outside':''}`});links.append(path);paths.set(`${a}:${b}`,path);
    }
    svg.querySelector('#network-svg-desc').textContent=data.caption;
    caption.textContent=data.caption;
    // Depth-first walk follows actual edges, including return journeys.
    const adjacent=new Map(data.nodes.map(n=>[n.id,[]]));for(const [a,b]of data.edges){adjacent.get(a).push(b);adjacent.get(b).push(a);}
    const visited=new Set(),walk=[];
    function visit(a){visited.add(a);for(const b of adjacent.get(a))if(!visited.has(b)){walk.push([a,b]);visit(b);walk.push([b,a]);}}
    visit('change');
    finish=()=>{stop();for(const e of elements.values())e.classList.add('discovered');for(const p of paths.values())p.classList.add('traversed');};
    if(motion.matches||document.hidden){finish();return;}
    for(const e of elements.values())e.classList.remove('discovered');elements.get('change').classList.add('discovered');
    skip.hidden=false;tracer.removeAttribute('hidden');tracer.setAttribute('visibility','visible');let start=null,index=0;
    const tick=time=>{if(start===null)start=time;const [a,b]=walk[index];const forward=paths.has(`${a}:${b}`);const path=paths.get(forward?`${a}:${b}`:`${b}:${a}`);const t=Math.min(1,(time-start)/240),eased=t*t*(3-2*t);const point=path.getPointAtLength(path.getTotalLength()*(forward?eased:1-eased));tracer.setAttribute('cx',point.x);tracer.setAttribute('cy',point.y);
      if(t===1){path.classList.add('traversed');elements.get(b).classList.add('discovered');index++;start=null;if(index>=walk.length){finish();return;}}
      frame=requestAnimationFrame(tick);
    };frame=requestAnimationFrame(tick);
  }
  skip.addEventListener('click',()=>finish?.());
  motion.addEventListener('change',()=>finish?.());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish?.();});
  window.addEventListener('sonaway:intake',e=>render(e.detail));
})();
