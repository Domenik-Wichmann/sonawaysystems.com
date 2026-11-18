(()=>{
 const menu=document.querySelector('.mobile-menu-button');
 const mobile=document.querySelector('.mobile-nav');
 if(menu&&mobile){
  menu.addEventListener('click',()=>{const open=mobile.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});
  mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
 }
 const examples={
  guest:{question:'Wann öffnet der Spa-Bereich?',answer:'<p>In diesem Beispiel ist der Spa-Bereich täglich von 9 bis 20 Uhr geöffnet.</p><p>Für eine Behandlung wenden Sie sich bitte an die Rezeption.</p>',source:"Customer information · Example dispatch hours"},
  pool:{question:"What should the closing manager check before shutting down the equipment?",answer:"<p>For the current summer closing procedure, the manager should:</p><ol><li>Confirm the final remaining work and clear the area.</li><li>Record required shutdown checks and report exceptions.</li><li>Complete the closing safety inspection and sign-off.</li></ol>",source:"Equipment shutdown SOP · Summer operations"},
  front:{question:"A customer arrives early. What should dispatch desk check first?",answer:"<p>Based on the example early-collection procedure:</p><ol><li>Confirm reservation and current order status.</li><li>Check packing team availability and priority requests.</li><li>Offer approved alternatives if the order is not ready.</li></ol>",source:"Dispatch arrival SOP · Site policies"},
  dining:{question:"What should the evening dispatch manager review at handover?",answer:'<p>For the illustrative dinner-service handover:</p><ol><li>Review reservations and special requests.</li><li>Confirm unavailable items and approved menu changes.</li><li>Check outstanding prep tasks and staff assignments.</li></ol>',source:"Dispatch shift handover · Evening service"}
 };
 document.querySelectorAll('#demo-widget').forEach(widget=>{widget.querySelectorAll('.scenario').forEach(btn=>btn.addEventListener('click',()=>{
  const d=examples[btn.dataset.scenario];if(!d)return;
  widget.querySelectorAll('.scenario').forEach(item=>(item.classList.toggle('active',item===btn),item.setAttribute('aria-pressed',String(item===btn))));
  widget.querySelector('#demo-question').textContent=d.question;
  for(const id of ['#demo-question','#demo-answer']) widget.querySelector(id).setAttribute('lang',btn.dataset.scenario==='guest'?'de':'en');
  widget.querySelector('#demo-answer').innerHTML=d.answer;
  widget.querySelector('#demo-source').textContent=d.source;
 }))});
 const form=document.querySelector('#contact-form');
 if(form)form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form);
  const name=String(data.get('name')||'').trim();
  const email=String(data.get('email')||'').trim();
  const business=String(data.get('business')||'').trim();
  const type=String(data.get('type')||'').trim();
  const message=String(data.get('message')||'').trim();
  const support=String(data.get('support')||'Not specified').trim();
  const subject='Sonaway project inquiry'+(business?' — '+business:'');
  const body=['Name: '+name,'Email: '+email,'Business: '+business,'Operation: '+type,'Support preference: '+support,'','What we would like to explore:',message].join('\n');
  location.href='mailto:domenik@sonaway.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 });
})();

;(()=>{const roles={housekeeping:["Packing team · Packing operator","North wing · Morning shift","Preparing a order for early arrival","Follow the current order-priority checklist and escalation steps.","6-minute refresher","Packing team SOP · Approved"],dining:["Dispatch · Service lead","Main dispatch desk · Evening shift","Allergen questions and menu substitutions","Review the approved packing lead escalation and customer communication procedure.","4-minute refresher","Service SOP · Approved"],spa:["Dispatch & maintenance · Closing manager","Wellness facility · Closing shift","Equipment shutdown and exception reporting","Check required readings, escalation rules and the closing safety procedure.","8-minute refresher","Equipment SOP · Approved"]};const ids=["training-person","training-context","training-title","training-detail","training-length","training-reference"];const buttons=[...document.querySelectorAll(".ops-role")];for(const b of buttons)b.addEventListener("click",()=>{const v=roles[b.dataset.role];if(!v)return;for(const x of buttons){x.classList.toggle("active",x===b);x.setAttribute("aria-pressed",String(x===b))}ids.forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=v[i]})})})();


