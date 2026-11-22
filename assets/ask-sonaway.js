(() => {
  if (document.querySelector('.sa-chat')) return;
  const widget = document.createElement('div');
  widget.className = 'sa-chat';
  const icon = '<svg aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M27.5 14.5c0 6.5-5 10.8-11.4 10.8-1.6 0-3.1-.2-4.5-.7l-6.9 2.2 1.9-6.2a9.6 9.6 0 0 1-2.2-6.1C4.4 8.2 9.4 4 16 4s11.5 4.2 11.5 10.5Z"/><path d="M12.8 11.2c.3-1.5 1.6-2.5 3.4-2.5 2 0 3.3 1.1 3.3 2.8 0 2.5-3.3 2.5-3.3 5"/><circle cx="16.2" cy="20" r="1" fill="currentColor" stroke="none"/></svg>';
  widget.innerHTML = `
    <button class="sa-launch" aria-label="Open Ask Sonaway" aria-expanded="false" aria-controls="sa-panel">${icon}<span>Ask Sonaway</span></button>
    <section class="sa-panel" id="sa-panel" role="dialog" aria-label="Ask Sonaway" hidden>
      <header class="sa-head"><span class="sa-mark">${icon}</span><strong>Ask Sonaway</strong><button class="sa-close" aria-label="Close chat">×</button></header>
      <div class="sa-scroll">
        <div class="sa-start"><p>What would you like to know about working with us?</p></div>
        <div class="sa-feed" role="log" aria-live="polite" aria-label="Conversation"></div>
        <div class="sa-choices"></div>
      </div>
      <div class="sa-foot"><button class="sa-suggest-toggle" hidden>Suggested questions</button>
        <form class="sa-form"><label class="sa-sr" for="sa-question">Your question</label><input id="sa-question" name="question" autocomplete="off" placeholder="Ask a question…" minlength="3" maxlength="400" required>
        <button class="sa-send" aria-label="Send question"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 18V6m-5 5 5-5 5 5"/></svg></button></form></div>
    </section>`;
  document.body.append(widget);
  const el = selector => widget.querySelector(selector);
  const launch = el('.sa-launch'), panel = el('.sa-panel'), form = el('form'), input = form.elements.question;
  const feed = el('.sa-feed'), scroll = el('.sa-scroll'), choices = el('.sa-choices'), toggle = el('.sa-suggest-toggle');
  const faqList = document.querySelector('#common-questions .faq-items');
  const original = new Map(Array.from(faqList?.querySelectorAll('[data-faq-id]') || [], d => [d.dataset.faqId,d]));
  let faqs = [], expanded = false, busy = false, previousQuestion = '', fetchedAt = 0, loading;
  function button(text, handler, className) {
    const b = document.createElement('button'); b.type = 'button'; b.className = className; b.textContent = text;
    b.addEventListener('click', handler); return b;
  }
  function showChoices() {
    choices.replaceChildren();
    const shown = expanded ? faqs : faqs.slice(0,4);
    for (const f of shown) choices.append(button(f.question, () => ask(f.question), 'sa-chip'));
    if (!expanded && faqs.length > shown.length) choices.append(button('View all questions', () => { expanded = true; showChoices(); }, 'sa-more'));
  }
  function safeLink(source) {
    try {
      const url = new URL(source.url,location.origin);
      if (url.origin !== location.origin) return null;
      const a = document.createElement('a'); a.href = url.href; a.textContent = source.title;
      return a;
    } catch { return null; }
  }
  function inlineText(element, text) {
    // Only bold spans are markup. Everything else stays literal text.
    for (const part of text.split(/(\*\*[^*\n]+\*\*)/g)) {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const strong = document.createElement('strong');
        strong.textContent = part.slice(2, -2);
        element.append(strong);
      } else element.append(document.createTextNode(part));
    }
  }
  function answerBody(text, flow) {
    const body = document.createElement('div');
    body.className = 'sa-answer-body';
    let group = null;
    let fence = false;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (line.startsWith('```')) { fence = !fence; group = null; continue; }
      if (fence && line.includes('→')) {
        const stages = line.split('→').map(stage => stage.trim());
        if (stages.length >= 2 && stages.length <= 10 && stages.every(Boolean)) {
          if (!flow?.length) flow = stages;
          continue;
        }
      }
      if (!line) {
        if (group?.localName === 'p') group = null;
        continue;
      }
      const heading = line.match(/^#{1,4}\s+(.+)/);
      const step = line.match(/^(\d{1,2})[.)]\s+(.+)/);
      const bullet = line.match(/^[-*•]\s+(.+)/);
      if (step || bullet) {
        const tag = step ? 'ol' : 'ul';
        if (group?.localName !== tag) {
          group = document.createElement(tag);
          if (step) group.start = Number(step[1]);
          body.append(group);
        }
        const item = document.createElement('li');
        inlineText(item, step ? step[2] : bullet[1]);
        group.append(item);
      } else if (heading) {
        const title = document.createElement('h3');
        inlineText(title, heading[1]);
        body.append(title);
        group = null;
      } else {
        if (group?.localName !== 'p') {
          group = document.createElement('p');
          body.append(group);
        } else group.append(' ');
        inlineText(group, line);
      }
    }
    if (Array.isArray(flow) && flow.length >= 2 && flow.length <= 6 && flow.every(label => typeof label === 'string' && label.trim() && label.length <= 100)) {
      const chart = document.createElement('ol');
      chart.className = 'sa-flow';
      chart.setAttribute('role','list');
      chart.setAttribute('aria-label','Workflow');
      for (const label of flow) {
        const node = document.createElement('li');
        node.textContent = label;
        chart.append(node);
      }
      body.append(chart);
    } else {
      // Keep a procedural answer visual even when the model only returns steps.
      for (const list of body.querySelectorAll('ol')) {
        if (list.start === 1 && list.children.length >= 2) list.classList.add('sa-step-path');
      }
    }
    return body;
  }
  function orderHome() {
    if (!faqList || faqList.querySelector('[open]') || faqList.contains(document.activeElement)) return;
    const top = faqs.slice(0,6);
    if (!top.length) return;
    const rows = top.map(f => {
      if (original.has(f.id)) return original.get(f.id);
      const d = document.createElement('details'); d.name = 'owner-faq'; d.dataset.faqId = f.id;
      const s = document.createElement('summary'); s.textContent = f.question;
      const p = answerBody(f.answer);
      const a = safeLink({url:f.url,title:'Read more'}); if (a) p.append(a);
      d.append(s,p); return d;
    });
    faqList.replaceChildren(...rows);
  }
  async function ranking() {
    if (Date.now()-fetchedAt < 30000) return;
    if (loading) return loading;
    loading = (async () => {
      try {
        let data;
        try {
          const res = await fetch('/ask/suggestions.php');
          if (!res.ok) throw Error();
          data = await res.json();
        } catch {
          const res = await fetch('/ask/index-data.json');
          if (!res.ok) return;
          data = await res.json();
        }
        faqs = data.filter(f => typeof f.question==='string' && typeof f.id==='string');
        fetchedAt = Date.now(); showChoices(); orderHome();
      } catch { /* Typed questions and the original homepage FAQs remain usable. */ }
      finally { loading = null; }
    })();
    return loading;
  }
  function openChat(open) {
    panel.hidden = !open;
    launch.setAttribute('aria-expanded',String(open));
    launch.setAttribute('aria-label',open ? 'Close Ask Sonaway' : 'Open Ask Sonaway');
    if (open) {
      ranking();
      const firstControl = matchMedia('(pointer: coarse)').matches ? el('.sa-close') : input;
      firstControl.focus({preventScroll:true});
    }
    else launch.focus({preventScroll:true});
  }
  launch.addEventListener('click',() => openChat(panel.hidden));
  el('.sa-close').addEventListener('click',() => openChat(false));
  document.addEventListener('keydown',e => {
    if (e.key==='Escape' && !panel.hidden) { e.preventDefault(); openChat(false); }
  });
  toggle.addEventListener('click',() => {
    choices.hidden = !choices.hidden;
    toggle.setAttribute('aria-expanded',String(!choices.hidden));
    if (!choices.hidden) { expanded=false; showChoices(); choices.scrollIntoView({block:'nearest'}); }
  });
  function bubble(text, role) {
    const item = document.createElement('div'); item.className = 'sa-bubble sa-'+role;
    item.setAttribute('aria-label',role==='visitor' ? 'You' : 'Sonaway');
    const p = document.createElement('p'); p.textContent = text; item.append(p); feed.append(item);
    scroll.scrollTop = scroll.scrollHeight; return item;
  }
  async function ask(question) {
    if (busy || question.length<3) return;
    if (choices.contains(document.activeElement)) input.focus({preventScroll:true});
    busy=true; el('.sa-send').disabled=true; input.value='';
    choices.hidden=true; toggle.hidden=true; el('.sa-start').hidden=true;
    bubble(question,'visitor'); const item=bubble('Looking that up…','answer');
    const timerController = new AbortController();
    const timer = setTimeout(() => timerController.abort(),46000);
    try {
      const res=await fetch('/ask/index.php',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
        body:JSON.stringify({question,previousQuestion}),signal:timerController.signal});
      const result=await res.json();
      item.replaceChildren(answerBody(result.answer || result.error || 'Please try again.', result.flow));
      const links=document.createElement('div'); links.className='sa-sources';
      for (const s of result.sources || []) { const a=safeLink(s); if(a) links.append(a); }
      if (!['saved','generated'].includes(result.kind)) links.append(safeLink({url:'/contact.html',title:'Ask Domenik directly'}));
      if (links.childElementCount) item.append(links);
      if (['saved','generated'].includes(result.kind)) previousQuestion=question;
      else previousQuestion='';
    } catch {
      item.firstChild.textContent='Search is unavailable right now. Try again or contact Sonaway.';
      item.append(safeLink({url:'/contact.html',title:'Contact Sonaway'}));
    } finally {
      clearTimeout(timer); busy=false; el('.sa-send').disabled=false; toggle.hidden=false; toggle.setAttribute('aria-expanded','false');
      scroll.scrollTop += item.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 12;
    }
  }
  form.addEventListener('submit',e => { e.preventDefault(); ask(input.value.trim()); });
  if (faqList) {
    ranking();
    faqList.addEventListener('click',e => {
      const row=e.target.closest('summary')?.parentElement;
      if (!row?.dataset.faqId || row.open) return;
      fetch('/ask/index.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({openedFaq:row.dataset.faqId}),keepalive:true}).catch(()=>{});
    });
  }
})();
