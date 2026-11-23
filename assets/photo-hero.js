(()=>{
 const gallery=document.querySelector('[data-photo-accordion]');if(!gallery)return;
 const panels=[...gallery.querySelectorAll('[data-photo-panel]')];
 const buttons=panels.map(panel=>panel.querySelector('.ph-trigger'));
 const hover=window.matchMedia('(hover: hover) and (pointer: fine)');
 const mobileChoices=[...gallery.parentElement.querySelectorAll('[data-photo-choice]')];
 let active=0,hoverTimer;
 function select(index){
  if(index===active)return;active=index;
  panels.forEach((panel,i)=>{const expanded=i===active;panel.classList.toggle('is-active',expanded);buttons[i].setAttribute('aria-expanded',String(expanded));panel.querySelector('.ph-story').hidden=!expanded;});
  mobileChoices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));
  const selected=mobileChoices[active];
  if(selected&&window.matchMedia('(max-width: 600px)').matches){const strip=selected.parentElement;strip.scrollTo({left:selected.offsetLeft-strip.offsetLeft,behavior:'instant'});}
 }
 // Rotate only while the visitor can see the accordion and is not reading a
 // focused panel, hovering, or touching the gallery or its mobile controls.
 const region=gallery.parentElement;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false, hovered=hover.matches && region.matches(':hover'), rotationTimer;
 const touching=new Set();
 function scheduleRotation(){
  clearTimeout(rotationTimer);
  if(panels.length<2 || !visible || document.hidden || motion.matches ||
     hovered || touching.size || region.contains(document.activeElement))return;
  rotationTimer=setTimeout(()=>{
   select((active+1)%panels.length);
   scheduleRotation();
  },5000);
 }
 region.addEventListener('pointerenter',event=>{
  if(hover.matches && event.pointerType!=='touch'){hovered=true;scheduleRotation();}
 });
 region.addEventListener('pointerleave',()=>{hovered=false;scheduleRotation();});
 region.addEventListener('pointerdown',event=>{touching.add(event.pointerId);scheduleRotation();});
 function release(event){if(touching.delete(event.pointerId))scheduleRotation();}
 window.addEventListener('pointerup',release);
 window.addEventListener('pointercancel',release);
 region.addEventListener('focusin',()=>clearTimeout(rotationTimer));
 region.addEventListener('focusout',()=>queueMicrotask(scheduleRotation));
 motion.addEventListener('change',scheduleRotation);
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){touching.clear();clearTimeout(hoverTimer);}
  hovered=hover.matches && region.matches(':hover');
  scheduleRotation();
 });
 if('IntersectionObserver' in window){
  new IntersectionObserver(([entry])=>{
   visible=entry.isIntersecting;
   scheduleRotation();
  }).observe(gallery);
 }else{visible=true;scheduleRotation();}
 mobileChoices.forEach((button,i)=>button.addEventListener('click',()=>{clearTimeout(hoverTimer);select(i);}));
 panels.forEach((panel,i)=>{
  panel.addEventListener('pointerenter',()=>{if(!hover.matches)return;clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>select(i),100);});
  panel.addEventListener('pointerleave',()=>clearTimeout(hoverTimer));
  buttons[i].addEventListener('click',()=>{clearTimeout(hoverTimer);select(i);});
  buttons[i].addEventListener('focus',()=>{clearTimeout(hoverTimer);select(i);});
  buttons[i].addEventListener('keydown',event=>{let next;
   if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%panels.length;
   if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i+panels.length-1)%panels.length;
   if(event.key==='Home')next=0;if(event.key==='End')next=panels.length-1;
   if(next!==undefined){event.preventDefault();buttons[next].focus();}
  });
 });
})();

// Keep navigation close while giving the page room as visitors read.
(()=>{
 const header=document.querySelector('.site-header');
 if(!header||(!document.querySelector('.photo-hero')&&!document.body.classList.contains('story-interior')))return;
 const menu=header.querySelector('.mobile-menu-button');
 let anchor=Math.max(0,window.scrollY),previous=anchor,direction=0,pending=false;
 function show(){header.classList.remove('ph-header-hidden');}
 function update(){
  pending=false;
  const y=Math.max(0,window.scrollY),delta=y-previous;
  previous=y;
  if(y<100||header.contains(document.activeElement)||menu?.getAttribute('aria-expanded')==='true'){show();anchor=y;direction=0;return;}
  const nextDirection=Math.sign(delta);
  if(nextDirection&&nextDirection!==direction){anchor=y-delta;direction=nextDirection;}
  if(Math.abs(y-anchor)>=12){header.classList.toggle('ph-header-hidden',direction>0);anchor=y;}
 }
 window.addEventListener('scroll',()=>{if(!pending){pending=true;window.requestAnimationFrame(update);}},{passive:true});
 header.addEventListener('focusin',show);
 menu?.addEventListener('click',()=>{show();anchor=Math.max(0,window.scrollY);});
 if('ResizeObserver'in window)new ResizeObserver(()=>document.documentElement.style.setProperty('--ph-header-height',header.getBoundingClientRect().height+'px')).observe(header);
})();

