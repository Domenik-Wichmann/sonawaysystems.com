/* Business situations shown with illustrative workflows. No live data or actions. */
(() => {
 const dialog=document.querySelector('#benefit-details');
 if(!dialog)return;
 const items={
  capture:{
   kicker:'SALE, SUCCESSION & BUSINESS HANDOVER',title:'Prepare for a sale or handover.',
   situation:'“How much of the operation still depends on the owner being available?”',
   lead:'A buyer can feel more confident stepping into your business when they can see how it runs without you. An up-to-date playbook lets them follow a real order, see who makes each decision and check what happens when something goes wrong.',
   exampleTitle:'Walk a buyer through an order',
   highlights:['Who can approve a rush order','Where the current price list lives','Who takes over if a shipment is late'],
   flow:[['Show the normal route','Follow an order from the first quote to dispatch.'],['Show one exception','Open the rule your team uses when a customer changes the order.'],['Show how it stays current','Let the buyer see who owns the rule and when it was last updated.']],
   href:'knowledge-capture.html',link:'Explore knowledge capture'
  },
  consistent:{
   photo:{src:'assets/overview-guide.webp',alt:'A housekeeper checks the room-turnover guide on her linen cart.'},
   kicker:'TRAINING & ONBOARDING',title:'Help new hires find their feet.',
   situation:'“Every starter gets a slightly different explanation of the same job.”',
   lead:'A new housekeeper opens the room-turnover guide on the linen cart. It shows which supplies to restock, what the finished room should look like and when to call the supervisor for inspection.',
   highlights:['Role-specific onboarding','Reusable lessons','Current source material'],
   flow:[['Agree the working standard','Resolve differences with the process owner.'],['Build the first-shift guide','Turn the approved steps into concise lessons and checks.'],['Keep learning connected','Update the relevant lessons when the procedure changes.']],
   stat:'Gallup reported that only 12% of U.S. employees said their company did a good job of onboarding.',
   source:'https://www.gallup.com/workplace/353096/how-to-improve-employee-onboarding.aspx',sourceLabel:'Gallup, 2021',
   href:'custom-systems.html#daily-use',link:'Explore custom training'
  },
  daily:{
   kicker:'TIME BACK FOR THE WORK',title:'Answer fewer repeat questions.',
   situation:'“The instruction exists, but everyone still has to ask the shift lead.”',
   lead:'Put approved guidance where people can reach it. A searchable handbook, station QR guide or source-linked staff assistant can handle routine lookups and show when to escalate.',
   highlights:['Guidance on shift','Source-linked answers','Clear escalation'],
   flow:[['Capture the recurring question','Find the procedure and the details people keep missing.'],['Make the answer accessible','Use the tools staff already open or build a focused interface.'],['Review unanswered questions','Investigate gaps with the source owner.']],
   stat:'Illustrative arithmetic: 20 repeated questions at 2 minutes each consume 40 minutes of the answering person’s time per day. Adjust the calculator to your operation.',
   href:'custom-systems.html#what-we-build',link:'Try the custom workspace'
  },
  procedure:{
   kicker:'KNOWLEDGE CONTINUITY',title:'Keep knowledge when people leave.',
   situation:'“Only one person knows the exceptions, and they’re leaving next month.”',
   lead:'Before an experienced packer leaves, ask them to show the next person how they spot a mixed lot. Their recording and a marked-up photo become a guide the next shift can use, even after their last day.',
   exampleTitle:'Hand over the mixed-lot check',
   highlights:['What to look for','What to set aside','Who can release the order'],
   flow:[['Record the check','Ask the packer to point out the two lot codes they compare.'],['Confirm the exception','The shift lead checks what to do when the codes differ.'],['Try the handover','The next packer uses the guide on a sample order and flags anything unclear.']],
   href:'knowledge-capture.html#reconcile',link:'See how we capture the detail'
  },
  training:{
   kicker:'NEW LOCATIONS & FRANCHISES',title:'Open the next location with a playbook.',
   situation:'“Which opening checks stay the same at our second site?”',
   lead:'Your second packing site can open with the receiving checklist the first team already uses. Its supervisor adds the local unloading bay, delivery hours and contact number. A new starter sees one checklist for the site where they work.',
   exampleTitle:'Set up the second packing site',
   highlights:['One company receiving checklist','Local instructions for each site','Updates reach both crews'],
   flow:[['Start with the shared checks','Both sites count cartons and match lot codes before signing.'],['Add the local details','The new team unloads at Bay 2 and calls its own receiving lead.'],['Update the standard once','A revised carton check reaches both teams. Each keeps its own bay and contact.']],
   href:'custom-systems.html#knowledge-projections',link:'Explore shared rules and local guidance'
  },
  safety:{
   kicker:'PROCESS IMPROVEMENT',title:'Find the friction between steps.',
   situation:'“Both teams think the other one has already checked it.”',
   lead:'Compare how people describe the same workflow. Missing handoffs, duplicate checks and conflicting instructions become visible when the process is mapped across roles.',
   highlights:['Cross-role process maps','Conflicting guidance surfaced','Clear responsibility'],
   flow:[['Compare the accounts','Review recordings and existing instructions together.'],['Agree the handoff','Confirm the input, required check and next responsible role.'],['Build useful visibility','Add dashboards, facility maps or operational analysis where the available data supports them.']],
   href:'custom-systems.html',link:'Explore custom analytics and systems'
  }
 };
 let opener=null,active=null,previousOverflow='';
 const fill=(selector,value)=>{dialog.querySelector(selector).textContent=value;};
 function close(){
  dialog.close();document.body.style.overflow=previousOverflow;opener?.focus({preventScroll:true});
 }
 document.querySelectorAll('[data-benefit]').forEach(button=>{
  button.disabled=false;
  button.addEventListener('click',()=>{
   active=items[button.dataset.benefit];opener=button;
   fill('#benefit-dialog-kicker',active.kicker);fill('#benefit-dialog-title',active.title);
   fill('#benefit-situation',active.situation);fill('#benefit-dialog-lead',active.lead);
   fill('#benefit-example-title', active.exampleTitle || 'How it works');
   const photo=dialog.querySelector('#benefit-dialog-photo');
   photo.hidden=!active.photo;
   if(active.photo) {
    photo.src=active.photo.src;
    photo.alt=active.photo.alt;
   } else {
    photo.removeAttribute('src');
    photo.alt='';
   }
   const list=dialog.querySelector('#benefit-dialog-steps');list.replaceChildren();
   active.highlights.forEach(label=>{const li=document.createElement('li');const strong=document.createElement('strong');strong.textContent=label;li.append(strong);list.append(li);});
   const visual=dialog.querySelector('#benefit-example-flow');visual.replaceChildren();visual.className='reason-visual';
   active.flow.forEach(([heading,copy])=>{const row=document.createElement('div');const strong=document.createElement('strong');const p=document.createElement('p');strong.textContent=heading;p.textContent=copy;row.append(strong,p);visual.append(row);});
   dialog.querySelector('.reason-stat')?.remove();
   if(active.stat){
    const stat=document.createElement('p');stat.className='reason-stat';stat.textContent=active.stat;
    if(active.source){const a=document.createElement('a');a.href=active.source;a.textContent=active.sourceLabel;a.target='_blank';a.rel='noopener noreferrer';stat.append(document.createTextNode(' '),a);}
    dialog.querySelector('#benefit-dialog-lead').after(stat);
   }
   const next=dialog.querySelector('#benefit-see-demo');next.textContent=active.link+' →';
   previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
   dialog.showModal();dialog.scrollTop=0;dialog.querySelector('.benefit-close').focus({preventScroll:true});
  });
 });
 dialog.querySelector('.benefit-close').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)close();});
 dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;});
 dialog.querySelector('#benefit-see-demo').addEventListener('click',()=>{if(active)location.href=active.href;});
})();
