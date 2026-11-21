/* Shared click affordances. Decorative only; controls retain their native behavior. */
(()=>{
 'use strict';
 const selector='button,a.btn,a.nav-contact,.desktop-nav a,.mobile-nav a,.story-index-link,a.text-link,.footer-nav a,summary,.kl-node';
 const observed=new Set();let sequence=0,pending=false;
 const visible=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('sm-visible',entry.isIntersecting)),{threshold:.08});
 function needsCue(control){
  if(control.disabled||control.getAttribute('aria-disabled')==='true')return false;
  if(control.matches('.kl-node,.kl-context-card,#knowledge-lab [data-audience],.build-detail-trigger'))return true;
  if(control.matches('.pw-spotlight[data-pw-action]'))return true;
  if(control.matches('#benefit-see-demo'))return !!control.closest('dialog[open]');
  if(control.matches('.gi-approve'))return true;
  if(control.matches('.gi-choices button')){const counter=control.closest('.gi-shell')?.querySelector('.gi-counter')?.textContent||'';return !counter.startsWith('Clarification 1 ')}
  return false;
 }
 function decorate(control){
  if(control.closest('.site-header,.footer,.sa-chat')||control.matches('.kl-node-trigger'))return;
  control.classList.toggle('sm-edge-only',control.matches('.kl-node,.kl-context-card'));
  control.classList.toggle('sm-disclosure',control.matches('summary'));
  if(!observed.has(control)){observed.add(control);visible.observe(control);control.style.setProperty('--sm-delay',String(-(sequence++%9)*.8)+'s')}
  if(getComputedStyle(control).position==='static')control.classList.add('sm-position');
  control.classList.add('sm-control');
  if(!control.querySelector(':scope > sonaway-motion')){
   const effect=document.createElement('sonaway-motion');effect.setAttribute('aria-hidden','true');
   ['sheen','halo','rim'].forEach(name=>effect.append(document.createElement('sonaway-'+name)));
   control.append(effect);
  }
  control.classList.toggle('sm-next-step',needsCue(control));
 }
 function update(){pending=false;document.querySelectorAll(selector).forEach(decorate);for(const el of observed)if(!el.isConnected){visible.unobserve(el);observed.delete(el)}}
 function schedule(records){if(records&&records.every(record=>record.type==='childList'&&[...record.addedNodes,...record.removedNodes].every(node=>node.nodeType===1&&node.tagName==='SONAWAY-MOTION')))return;if(!pending){pending=true;requestAnimationFrame(update)}}
 update();
 new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','aria-disabled','aria-pressed','aria-selected','open','hidden']});
 document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('sm-backgrounded',document.hidden));
})();

