(()=>{
 document.querySelectorAll('[data-capability]').forEach(button=>button.addEventListener('click',()=>{
  const box=button.closest('.merge-capabilities');box.querySelectorAll('[data-capability]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  box.querySelector('.merge-capability-detail strong').textContent=button.dataset.title;box.querySelector('.merge-capability-detail p').textContent=button.dataset.copy;
 }));
 const tabs=[...document.querySelectorAll('[data-daily-tab]')];
 const select=tab=>tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active});
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();select(tabs[n]);tabs[n].focus()})});
 const aliases={'#story-ownership':'managed-support','#system':'daily-use','#story-insights':'daily-use','#story-answers':'daily-use','#story-delivery':'story-contact'};
 function reveal(){const id=aliases[location.hash];if(!id)return;const choice={'#system':'training','#story-insights':'insights','#story-answers':'answers'}[location.hash];if(choice){const tab=tabs.find(t=>t.dataset.dailyTab===choice);if(tab)select(tab)}document.getElementById(id).scrollIntoView({block:'start'})}
 window.addEventListener('hashchange',reveal);reveal();
})();

