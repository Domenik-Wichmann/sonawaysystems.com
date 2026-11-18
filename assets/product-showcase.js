(()=>{
 const studio=document.querySelector('.pk-studio');if(!studio)return;
 const play=studio.querySelector('.pk-play-voice'),status=studio.querySelector('#pk-update-status'),review=studio.querySelector('#pk-review-status');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let busy=false;
 play.addEventListener('click',()=>{
  if(busy)return;busy=true;play.disabled=true;studio.classList.remove('pk-updated');studio.classList.add('pk-playing');
  status.textContent='Example: a staff member shares a voice note.';review.textContent='The change is connected to the property and date.';
  window.setTimeout(()=>{
   studio.classList.remove('pk-playing');studio.classList.add('pk-updated');status.textContent='Example note captured. Draft ready for review.';
   review.textContent="Dispatch terrace update prepared for the duty manager. Staff guidance, the customer notice and a relevant refresher are linked.";
   play.querySelector('span').textContent='Try the example again';play.disabled=false;busy=false;
  },reduced.matches?0:1400);
 });
})();

