/* Three local, fictional change workflows. No model calls or operational writes. */
(() => {
 'use strict';
 const scopes=['Warehouse A','Warehouse B','Both warehouses'];
 const commonScope={key:'scope',question:'Where should this change apply?',options:scopes};
 const period={key:'period',question:'When should it apply? These are fixed dates in this fictional example.',options:['9–15 November 2026 · temporary','From 9 November 2026 · ongoing']};
 const examples={
  access:{title:'Delivery access',request:'Move incoming deliveries to the rear entrance.',previous:'Main entrance · 08:00–16:00',questions:[commonScope,{key:'value',question:'Which entrance should deliveries use?',options:['Rear entrance','Side loading bay']},{key:'audience',question:'Which traffic is included? Customer collections use a separate route.',options:['Supplier deliveries only','All deliveries, not collections']},period,{key:'hours',question:'What access hours should the new instructions show?',options:['08:00–16:00','07:00–15:00']},{key:'owner',question:'Who owns this change and should receive the review?',options:['Warehouse manager','Operations director']}],affected:['Delivery access guide','Supplier arrival instructions','Receiving-team answer cards','Entrance QR guidance'],unchanged:['Customer collection route','Emergency access procedures'],sources:['Delivery access SOP · §2','Site entrance register','Supplier arrival guide']},
  cutoff:{title:'Order cutoff',request:'Change the daily order cutoff before the next busy week.',previous:'12:00 daily cutoff',questions:[commonScope,{key:'value',question:'What is the new order cutoff?',options:['11:00','14:00','15:00']},{key:'audience',question:'Which orders should use it? Dispatch schedules stay separate.',options:['Standard orders only','Standard and trade orders']},period,{key:'hours',question:'Which working days does this cover?',options:['Monday–Friday','Every day']},{key:'owner',question:'Who should review the operational and customer-facing wording?',options:['Operations director','Customer service lead']}],affected:['Order acceptance policy','Order-desk answer cards','Customer-service guidance','Approved website cutoff information'],unchanged:['Express-order exceptions','Carrier dispatch schedule'],sources:['Order acceptance policy · §3','Service-channel register','Dispatch schedule']},
  checklist:{title:'Equipment checks',request:'Add a seal inspection to the start-of-shift equipment check.',previous:'Visual start-of-shift check; seal inspection not listed',questions:[commonScope,{key:'value',question:'Which equipment should the new check cover?',options:['Sealer 01','Sealer 02','Both sealers']},{key:'audience',question:'Who performs the check? Maintenance repair instructions are separate.',options:['Shift operators','Shift operators with supervisor sign-off']},period,{key:'hours',question:'What should staff do if they find a damaged seal?',options:['Stop use and notify maintenance','Stop use and notify the shift supervisor']},{key:'owner',question:'Who must review this draft before any real rollout?',options:['Maintenance lead','Safety and quality lead']}],affected:['Start-of-shift checklist','Equipment QR answer card','Operator briefing','Supervisor handover notes'],unchanged:['Manufacturer service intervals','Authorized repair procedure'],sources:['Start-of-shift checklist · rev 4','Equipment register','Maintenance escalation policy']}
 };
 function report(key,answers){
  const ex=examples[key];
  if(!ex||ex.questions.some(q=>!q.options.includes(answers[q.key])))throw Error('Complete every review field first');
  const sites=answers.scope==='Both warehouses'?['Warehouse A','Warehouse B']:[answers.scope];
  return {title:ex.title,sites,previous:ex.previous,proposed:answers.value,audience:answers.audience,period:answers.period,conditions:answers.hours,owner:answers.owner,temporary:answers.period.includes('temporary'),affected:ex.affected,unchanged:[...ex.unchanged,...(sites.length===1?[sites[0]==='Warehouse A'?'Warehouse B instructions':'Warehouse A instructions']:[])],sources:ex.sources,notifications:[answers.owner,key==='cutoff'?'Order desk and customer service':key==='checklist'?'Operators and shift supervisors':'Receiving team and supplier coordinator','People who recently viewed the affected answer cards (illustrative)']};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={examples,report};
 if(typeof document==='undefined')return;
 const body=document.querySelector('#chat-body');if(!body)return;
 const output=document.querySelector('#change-report'),progress=document.querySelector('#guided-progress');
 let key='access',answers={},step=0,approved=false;
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
 const emit=()=>window.dispatchEvent(new CustomEvent('sonaway:intake',{detail:{example:key,answers:{...answers},stage:step,approved}}));
 function button(label,action,cls){const b=el('button',label,cls);b.type='button';b.addEventListener('click',action);return b;}
 function draw(){
  const ex=examples[key];body.replaceChildren();output.replaceChildren();output.hidden=true;
  document.querySelectorAll('[data-guide]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.guide===key)));
  progress.textContent=step<ex.questions.length?`${ex.title} · ${step+1} of ${ex.questions.length} details`:`${ex.title} · ${approved?'Approved in demo':'Ready for review'}`;
  body.append(el('div',ex.request,'chat-bubble user'));
  if(step<ex.questions.length){
   if(step){const trail=el('div',null,'guided-recap');for(const q of ex.questions.slice(0,step))trail.append(el('span',answers[q.key]));body.append(trail);}
   const q=ex.questions[step];body.append(el('div',q.question,'chat-bubble assistant'));
   const choices=el('div',null,'chat-choices');for(const value of q.options)choices.append(button(value,()=>{answers[q.key]=value;step++;draw();}));body.append(choices);
   if(step)body.append(button('← Previous detail',()=>{step--;approved=false;draw();},'guided-back'));
  }else{
   body.append(el('div',approved?'Demo change approved. The proposed update and notifications below have been simulated only.':'The details are complete. Review the proposed change, affected guidance and exceptions before approving this example.','chat-bubble assistant'));
   output.hidden=false;const r=report(key,answers);
   output.append(el('span',approved?'APPROVED IN DEMO':'DRAFT CHANGE REPORT','report-label'),el('h3',r.title),el('p','Fictional example. No business information is changed or sent.','report-note'));
   const dl=el('dl');for(const [label,value]of [['Location',r.sites.join(' + ')],['Current rule',r.previous],['Proposed change',r.proposed],['Applies to',r.audience],['Effective period',r.period],['Conditions / response',r.conditions],['Review owner',r.owner]]){dl.append(el('dt',label),el('dd',value));}output.append(dl);
   for(const [heading,items]of [['Guidance to update',r.affected],['Keep unchanged',r.unchanged],['Notify after approval',r.notifications],['Example source records',r.sources]]){output.append(el('h4',heading));const list=el('ul');items.forEach(item=>list.append(el('li',item)));output.append(list);}
   output.append(el('p',r.temporary?'Temporary projection: the normal rule stays underneath. This example returns to the normal rule on 16 November 2026.':'Ongoing change: the previous rule is retained in version history.','report-period'));
   if(!approved)output.append(button('Approve demo change',()=>{approved=true;draw();},'button'));
   else output.append(el('p','✓ Demo approval recorded · simulated updates ready · no messages sent','approval-receipt'));
   output.append(button('Revise the details',()=>{step=0;approved=false;draw();},'guided-back'));
  }
  emit();
 }
 document.querySelectorAll('[data-guide]').forEach(b=>b.addEventListener('click',()=>{key=b.dataset.guide;answers={};step=0;approved=false;draw();}));
 document.querySelector('#chat-reset').addEventListener('click',()=>{answers={};step=0;approved=false;draw();});
 draw();
})();
