/* Business situations shown with illustrative workflows. No live data or actions. */
(() => {
 const dialog=document.querySelector('#benefit-details');
 if(!dialog)return;
 const items={
  capture:{
   kicker:'SALE, SUCCESSION & BUSINESS HANDOVER',title:'Prepare for a sale or handover.',
   situation:'“How much of the operation still depends on the owner being available?”',
   lead:'A buyer, successor or incoming manager needs to understand how the business runs. Document the routines, decisions, handoffs and exceptions that currently depend on a few people.',
   highlights:['Documented responsibilities','Repeatable procedures','Visible exceptions'],
   flow:[['Capture the owner’s decisions','Record the checks, approvals and judgement calls that keep work moving.'],['Give each process an owner','Show who does the work and where issues are escalated.'],['Prepare a usable handover','Deliver a playbook the next manager can review and maintain.']],
   note:'Keep agreed responsibilities and operating records together for a buyer or incoming manager.',
   detail:'Start with a workflow that stops when the owner is away. Knowledge capture can establish a practical handover before a wider system is built.',
   href:'knowledge-capture.html',link:'Explore knowledge capture'
  },
  consistent:{
   kicker:'TRAINING & ONBOARDING',title:'Help new hires find their feet.',
   situation:'“Every starter gets a slightly different explanation of the same job.”',
   lead:'A new housekeeper opens the room-turnover guide on the linen cart. It shows which supplies to restock, what the finished room should look like and when to call the supervisor for inspection.',
   highlights:['Role-specific onboarding','Reusable lessons','Current source material'],
   flow:[['Agree the working standard','Resolve differences with the process owner.'],['Build the first-shift guide','Turn the approved steps into concise lessons and checks.'],['Keep learning connected','Update the relevant lessons when the procedure changes.']],
   stat:'Gallup reported that only 12% of U.S. employees said their company did a good job of onboarding.',
   source:'https://www.gallup.com/workplace/353096/how-to-improve-employee-onboarding.aspx',sourceLabel:'Gallup, 2021',
   note:'Managers define readiness and supervise practical work. Training content supports that responsibility.',
   detail:'Custom learning tools can present a refresher by role, workstation or current task, using the same approved procedures as staff answers.',
   href:'custom-systems.html#daily-use',link:'Explore custom training'
  },
  daily:{
   kicker:'TIME BACK FOR THE WORK',title:'Answer fewer repeat questions.',
   situation:'“The instruction exists, but everyone still has to ask the shift lead.”',
   lead:'Put approved guidance where people can reach it. A searchable handbook, station QR guide or source-linked staff assistant can handle routine lookups and show when to escalate.',
   highlights:['Guidance on shift','Source-linked answers','Clear escalation'],
   flow:[['Capture the recurring question','Find the procedure and the details people keep missing.'],['Make the answer accessible','Use the tools staff already open or build a focused interface.'],['Review unanswered questions','Investigate gaps with the source owner.']],
   stat:'Illustrative arithmetic: 20 repeated questions at 2 minutes each consume 40 minutes of the answering person’s time per day. Adjust the calculator to your operation.',
   note:'Use the calculator with your own team’s figures.',
   detail:'An assistant should cite the approved source and direct uncertain questions to the responsible person. The custom systems page shows this workflow.',
   href:'custom-systems.html#what-we-build',link:'Try the custom workspace'
  },
  procedure:{
   kicker:'KNOWLEDGE CONTINUITY',title:'Keep knowledge when people leave.',
   situation:'“Only one person knows the exceptions, and they’re leaving next month.”',
   lead:'Capture the decisions an experienced colleague makes between the written steps. Connect their walkthroughs, photos and explanations to reviewed procedures before the handover.',
   highlights:['Recorded working knowledge','Explicit decision points','Named process owners'],
   flow:[['Walk through a real task','Ask what changes when the usual conditions do not apply.'],['Close the gaps','Compare the explanation with existing documents and other roles.'],['Leave a usable reference','Publish the approved steps, exceptions and escalation contacts.']],
   note:'The experienced person and process owner review the result. Tacit judgement may need demonstration and supervised practice.',
   detail:'You can begin with one role or a single critical process, then expand the playbook as staff contribute more material.',
   href:'knowledge-capture.html#reconcile',link:'See how we capture the detail'
  },
  training:{
   kicker:'NEW LOCATIONS & FRANCHISES',title:'Open the next location with a playbook.',
   situation:'“The new site needs our standard without copying every old document.”',
   lead:'Reuse the company’s approved process knowledge and onboarding. Give site leaders an explicit way to propose local differences, with an owner and an approval trail.',
   highlights:['Shared company standards','Approved local variations','Reusable training'],
   flow:[['Establish the core standard','Separate company requirements from site-specific detail.'],['Prepare the new location','Reuse the relevant SOPs, role guides and onboarding.'],['Manage changes deliberately','Show which sites inherit a rule and which hold an approved exception.']],
   note:'A knowledge system supports consistency. Managers still verify that staff can perform the work and local requirements are met.',
   detail:'Custom systems can select the right guidance by role, site and effective date, with a review step before changes are published.',
   href:'custom-systems.html#knowledge-projections',link:'Explore shared rules and local guidance'
  },
  safety:{
   kicker:'PROCESS IMPROVEMENT',title:'Find the friction between steps.',
   situation:'“Both teams think the other one has already checked it.”',
   lead:'Compare how people describe the same workflow. Missing handoffs, duplicate checks and conflicting instructions become visible when the process is mapped across roles.',
   highlights:['Cross-role process maps','Conflicting guidance surfaced','Clear responsibility'],
   flow:[['Compare the accounts','Review recordings and existing instructions together.'],['Agree the handoff','Confirm the input, required check and next responsible role.'],['Build useful visibility','Add dashboards, facility maps or operational analysis where the available data supports them.']],
   note:'Interview-led mapping identifies issues to investigate. Event-log process mining requires suitable system data and is scoped separately.',
   detail:'Custom dashboards can connect review queues, recurring questions and agreed operational data. The first step is defining what a manager needs to decide.',
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
   fill('#benefit-example-title','What this can look like');fill('#benefit-example-note',active.note);
   dialog.querySelector('#benefit-dialog-photo').hidden=true;
   const list=dialog.querySelector('#benefit-dialog-steps');list.replaceChildren();
   active.highlights.forEach(label=>{const li=document.createElement('li');const strong=document.createElement('strong');strong.textContent=label;li.append(strong);list.append(li);});
   const visual=dialog.querySelector('#benefit-example-flow');visual.replaceChildren();visual.className='reason-visual';
   active.flow.forEach(([heading,copy])=>{const row=document.createElement('div');const strong=document.createElement('strong');const p=document.createElement('p');strong.textContent=heading;p.textContent=copy;row.append(strong,p);visual.append(row);});
   const full=dialog.querySelector('#benefit-full-detail');full.replaceChildren();
   const detail=document.createElement('p');detail.textContent=active.detail;full.append(detail);
   dialog.querySelector('.benefit-more').open=false;
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
