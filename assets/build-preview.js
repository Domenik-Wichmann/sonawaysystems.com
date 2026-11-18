/* Scripted visual: scenario changes morph node positions and connector geometry. */
(()=>{
 const panel=document.querySelector('.build-preview'),scenes=window.SonawayBuildScenes;if(!panel||!scenes)return;
 const svg=panel.querySelector('.bp-network'),nodeLayer=svg.querySelector('.bp-nodes'),edgeLayer=svg.querySelector('.bp-links'),NS='http://www.w3.org/2000/svg';
 let key='breakfast',step=0,paused=false,visible=false,timer=null,raf=0,last=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)'),nodes=new Map(),edges=new Map();
 const make=(tag,attrs)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));return e;};
 function textLines(label){const lines=[];for(const word of label.split(' ')){if(!lines.length||(lines.at(-1)+' '+word).length>19)lines.push(word);else lines[lines.length-1]+=' '+word;}return lines;}
 function draw(now){let moving=false;const phase=['capture','review','deliver'][step];
  for(const [id,n] of nodes){const t=reduced.matches?1:Math.min(1,(now-n.start)/950),ease=t*t*(3-2*t);n.x=n.sx+(n.tx-n.sx)*ease;n.y=n.sy+(n.ty-n.sy)*ease;n.opacity=n.so+(n.to-n.so)*ease;n.el.setAttribute('transform',`translate(${n.x} ${n.y})`);n.el.style.opacity=n.opacity;if(t<1)moving=true;else if(!n.to){n.el.remove();nodes.delete(id);}}
  for(const [id,e] of edges){const a=nodes.get(e.a),b=nodes.get(e.b),t=reduced.matches?1:Math.min(1,(now-e.start)/950);if(!a||!b){e.el.remove();edges.delete(id);continue;}const d=`M${a.x},${a.y} L${b.x},${b.y}`;e.el.setAttribute('d',d);e.el.style.opacity=(e.so+(e.to-e.so)*t)*Math.min(a.opacity,b.opacity);if(t<1)moving=true;else if(!e.to){e.el.remove();edges.delete(id);}}
  if(moving)raf=requestAnimationFrame(draw);
 }
 function morph(){cancelAnimationFrame(raf);const now=performance.now(),s=scenes[key],wanted=new Set(s.nodes.map(n=>n[0]));
  for(const [id,n] of nodes){n.sx=n.x;n.sy=n.y;n.so=n.opacity;n.start=now;if(!wanted.has(id))n.to=0;}
  s.nodes.forEach(([id,label,x,y])=>{let n=nodes.get(id);if(!n){const core=nodes.get('core');const group=make('g',{'class':'bp-dot'+(id==='core'?' bp-core':''),'data-node':id});group.append(make('circle',{r:id==='core'?26:17,class:'bp-node-aura'}),make('circle',{r:id==='core'?12:7}));const text=make('text',{'text-anchor':'middle'});group.append(text);nodeLayer.append(group);n={el:group,x:core?.x??x,y:core?.y??y,opacity:0};nodes.set(id,n);}n.sx=n.x;n.sy=n.y;n.tx=x;n.ty=y;n.so=n.opacity;n.to=1;n.start=now;const text=n.el.querySelector('text');text.replaceChildren(...textLines(label).map((line,i)=>{const t=make('tspan',{x:0,y:27+i*16});t.textContent=line;return t;}));});
  const wantedEdges=new Set(s.edges.map(e=>e[0]+'>'+e[1]));for(const [id,e] of edges){e.so=Number(e.el.style.opacity)||0;e.start=now;if(!wantedEdges.has(id))e.to=0;}
  s.edges.forEach(([a,b,route])=>{const id=a+'>'+b;let e=edges.get(id);if(!e){const path=make('path',{'data-route':route});edgeLayer.append(path);e={el:path,a,b,so:0};edges.set(id,e);}e.el.setAttribute('data-route',route);e.to=1;e.start=now;});
  light();draw(now);panel.classList.remove('bp-message-arrive');void panel.offsetWidth;panel.classList.add('bp-message-arrive');
 }
 function light(){const phase=['capture','review','deliver'][step],lit=new Set(scenes[key].edges.filter(e=>e[2]===phase).flatMap(e=>e.slice(0,2)));nodes.forEach((n,id)=>n.el.classList.toggle('bp-lit',lit.has(id)));}
 function render(){const s=scenes[key];panel.dataset.phase=['capture','review','deliver'][step];panel.dataset.scene=key;panel.querySelector('#bp-message').textContent=s.message;panel.querySelector('#bp-step').textContent=['01 / CONNECT','02 / REVIEW','03 / PUT TO WORK'][step];panel.querySelector('#bp-caption').textContent=s.captions[step];panel.querySelectorAll('[data-build-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.buildScene===key)));panel.classList.toggle('bp-still',paused||reduced.matches);panel.querySelector('.bp-pause').textContent=paused?'Play animation':'Pause animation';panel.querySelector('.bp-pause').setAttribute('aria-pressed',String(paused));light();}
 function schedule(){clearTimeout(timer);if(paused||!visible||document.hidden||reduced.matches)return;timer=setTimeout(()=>{step=(step+1)%3;render();schedule();},3000);}
 panel.querySelectorAll('[data-build-scene]').forEach(b=>b.addEventListener('click',()=>{if(key===b.dataset.buildScene)return;key=b.dataset.buildScene;step=reduced.matches?2:0;render();morph();schedule();}));panel.querySelector('.bp-pause').addEventListener('click',()=>{paused=!paused;render();schedule();});
 document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{if(reduced.matches)step=2;render();morph();schedule();});new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(panel);
 if(reduced.matches)step=2;render();morph();
})();


