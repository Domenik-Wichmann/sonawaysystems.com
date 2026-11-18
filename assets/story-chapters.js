(()=>{
 const chapters=[...document.querySelectorAll('[data-story-chapter]')];
 const links=[...document.querySelectorAll('[data-story-link]')];
 if(!chapters.length||!links.length)return;
 const screens=[...document.querySelectorAll('.story-screen')];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let pending=false;
 function update(){
  pending=false;const target=window.innerHeight*.38;
  let current=0;for(let i=0;i<chapters.length;i++){const box=chapters[i].getBoundingClientRect();if(box.top<=target)current=i;if(box.top>target)break;}
  links.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 }
 function schedule(){if(!pending){pending=true;window.requestAnimationFrame(update);}}
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
 links.forEach((link,i)=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();const target=chapters[i].querySelector('.story-screen')||chapters[i];
  target.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
  history.replaceState(null,'','#'+chapters[i].id);
 }));
 // Let keyboard readers move by screen without intercepting controls or demo inputs.
 document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||window.innerWidth<1024||document.querySelector('dialog[open]'))return;
  if(event.target.closest('input,textarea,select,button,a,[contenteditable=true]'))return;
  if(!['PageDown','PageUp'].includes(event.key))return;
  const index=screens.reduce((best,screen,i)=>Math.abs(screen.getBoundingClientRect().top)<Math.abs(screens[best].getBoundingClientRect().top)?i:best,0);
  const next=index+(event.key==='PageDown'?1:-1);if(next<0||next>=screens.length)return;
  event.preventDefault();screens[next].scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
 });
 update();
})();

