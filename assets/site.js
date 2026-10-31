'use strict';

// All demonstrations run in the browser with fictional data. No AI/API calls.
(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (menu && nav) {
    const closeMenu = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); };
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('click', (event) => { if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  }

  const graph = document.querySelector('#knowledge-graph');
  if (graph) {
    const nodes = {
      core: { name: 'Business core', parent: null },
      warehouse: { name: 'Warehouse core', parent: 'core' },
      field: { name: 'Field operations', parent: 'core' },
      support: { name: 'Customer support', parent: 'core' },
      a: { name: 'Warehouse A', parent: 'warehouse' },
      b: { name: 'Warehouse B', parent: 'warehouse' },
      crew: { name: 'Service crews', parent: 'field' },
      public: { name: 'Customer website', parent: 'support' }
    };
    const scenarios = {
      cutoff: {
        title: 'An earlier order cutoff', label: 'Standard order cutoff', old: '12:00', next: '10:00', exception: '11:00', source: 'Order policy §2.1',
        proposal: 'Standard order cutoff, 12:00 → 10:00.',
        explanation: 'Warehouse B has its own approved 11:00 cutoff. It will be flagged for review.',
        affected: ['core', 'warehouse', 'field', 'support', 'a', 'crew', 'public'],
        descriptions: {
          core: 'The approved company policy. Connected teams inherit the relevant parts unless a specific exception applies.',
          warehouse: 'The shared warehouse procedure references the company cutoff. Site instructions use this same rule instead of a separate copy.',
          field: 'Field teams need the cutoff when promising delivery dates. A change affects their guidance as well as warehouse instructions.',
          support: 'The approved answer about delivery timing draws on the same order policy. It needs refreshing when the cutoff changes.',
          a: 'Warehouse A follows the shared rule. Its daily checklist and cached answer card are connected to this knowledge.',
          b: 'Warehouse B has an approved local cutoff. The parent change is flagged for review; the local value is not silently overwritten.',
          crew: 'Delivery guidance and a previously saved answer depend on the cutoff. Refresh the connected guidance and notify affected staff.',
          public: 'Customers can see the published order deadline. Internal staffing, approval notes and operational exceptions are outside this example’s public view.'
        },
        impacts: [['Company policy and inherited views', 'Update after approval'], ['Warehouse A checklist & answer card', 'Refresh connected outputs'], ['Field and support guidance', 'Refresh connected outputs'], ['Customer-facing deadline', 'Publish approved information'], ['Warehouse B: local 11:00 rule', 'Flag for owner review'], ['Recent recipients of affected answers', 'Notify about the change']]
      },
      event: {
        title: 'A temporary peak-week arrangement', label: 'Dispatch service hours', old: '08:00–17:00', next: '08:00–20:00', exception: '08:00–16:00', source: 'Dispatch policy §3 + peak-week context',
        proposal: 'Extend dispatch to 20:00 for the selected peak week.',
        explanation: 'The base schedule stays unchanged. The temporary view applies only during its approved period.',
        affected: ['core', 'warehouse', 'field', 'support', 'a', 'crew', 'public'],
        descriptions: {
          core: 'Base dispatch hours remain 08:00–17:00. The approved peak-week context temporarily changes the effective schedule for relevant views.',
          warehouse: 'Warehouse guidance can inherit the peak-week schedule without replacing its normal year-round instructions.',
          field: 'Field teams see the temporary hours during peak week, so their planning reflects the effective schedule.',
          support: 'Support receives the effective peak-week hours and the period they apply to, with a link to the approved context.',
          a: 'Warehouse A follows the peak-week arrangement. After the context expires, its effective view returns to the base schedule.',
          b: 'A separate site agreement keeps this warehouse at 08:00–16:00. Its owner must review whether peak-week changes should apply here.',
          crew: 'Crews receive the effective schedule and an update notification. Actual staffing changes would need their own agreed workflow.',
          public: 'The customer view shows the approved temporary dispatch hours and their dates, without exposing internal planning notes.'
        },
        impacts: [['Base schedule: 08:00–17:00', 'Keep unchanged'], ['Peak-week context', 'Activate for approved dates'], ['Connected team and customer views', 'Use effective schedule'], ['Warehouse B: site agreement', 'Flag for owner review'], ['Affected team members', 'Notify at activation'], ['End of approved period', 'Return to base schedule']]
      },
      returns: {
        title: 'One policy, different audiences', label: 'Standard returns window', old: '30 days', next: '45 days', exception: '14 days · special stock', source: 'Returns policy §4 + audience permissions',
        proposal: 'Standard returns window, 30 → 45 days.',
        explanation: 'Staff and customer views share the approved rule. Internal approval details stay internal.',
        affected: ['core', 'warehouse', 'field', 'support', 'a', 'crew', 'public'],
        descriptions: {
          core: 'The company policy defines the standard returns window, internal escalation rules and which information may be published.',
          warehouse: 'Receiving procedures use the shared window to guide acceptance. Internal handling instructions are available only to relevant staff.',
          field: 'Field staff need the current window when helping customers. They also see role-relevant escalation guidance.',
          support: 'Support answers combine the public rule with internal escalation instructions. Permissions govern which components are included.',
          a: 'Warehouse A inherits the standard returns window and its relevant receiving instructions from the shared knowledge.',
          b: 'An approved special-stock rule has a 14-day window. A standard-policy update does not automatically remove that exception.',
          crew: 'A staff-facing answer can include the returns window and an internal contact route. The customer answer has a narrower scope.',
          public: 'Customers receive the approved returns window and public instructions. Internal escalation thresholds and private contacts are excluded from this illustrative view.'
        },
        impacts: [['Standard policy and inherited views', 'Update after approval'], ['Staff receiving and support guidance', 'Refresh connected outputs'], ['Customer answer: returns window', 'Publish approved information'], ['Internal contacts & escalation rules', 'Keep restricted'], ['Warehouse B: special-stock rule', 'Flag for owner review'], ['Recently issued affected answers', 'Notify relevant recipients']]
      }
    };
    let scenarioKey = 'cutoff';
    let selected = 'core';
    let applied = false;
    let pulseTimer;
    const modal = document.querySelector('#impact-modal');
    const preview = document.querySelector('#preview-change');
    const graphSvg = graph.querySelector('svg');
    const setText = (selector, text) => { document.querySelector(selector).textContent = text; };
    const lineage = (id) => nodes[id].parent ? [...lineage(nodes[id].parent), nodes[id].name] : [nodes[id].name];

    function drawEdges(animate = false) {
      const bounds = graph.getBoundingClientRect();
      graphSvg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      graphSvg.replaceChildren();
      for (const [id, node] of Object.entries(nodes)) {
        if (!node.parent) continue;
        const p = graph.querySelector(`[data-node="${node.parent}"]`).getBoundingClientRect();
        const c = graph.querySelector(`[data-node="${id}"]`).getBoundingClientRect();
        const x1 = p.left + p.width / 2 - bounds.left;
        const y1 = p.bottom - bounds.top;
        const x2 = c.left + c.width / 2 - bounds.left;
        const y2 = c.top - bounds.top;
        const mid = (y1 + y2) / 2;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`);
        if (applied && scenarios[scenarioKey].affected.includes(id)) path.classList.add('affected');
        if (animate && id !== 'b') path.classList.add('pulse');
        graphSvg.append(path);
      }
    }

    function render() {
      const s = scenarios[scenarioKey];
      setText('#scenario-title', s.title);
      setText('#node-title', nodes[selected].name);
      setText('#node-label', s.label);
      const value = selected === 'b' ? s.exception : applied ? s.next : s.old;
      setText('#node-value', value);
      setText('#node-description', s.descriptions[selected]);
      setText('#node-source', `${s.source} → ${lineage(selected).join(' → ')}${selected === 'b' ? ' → Approved local exception' : ''}`);
      if (scenarioKey === 'event' && applied) setText('#node-label', 'Effective hours · peak-week example');
      const desc = document.querySelector('#change-description');
      desc.replaceChildren(document.createTextNode((applied ? 'Example applied: ' : 'Proposed change: ') + s.proposal));
      const detail = document.createElement('span');
      detail.textContent = applied ? 'Connected views refreshed in this illustration. Warehouse B remains flagged for review.' : s.explanation;
      desc.append(detail);
      const status = document.querySelector('#lab-status');
      status.classList.toggle('applied', applied);
      status.replaceChildren(Object.assign(document.createElement('i'), {}), document.createTextNode(applied ? 'Example updated' : 'Current version'));
      preview.textContent = applied ? 'Reset this example' : 'Preview the change';
      graph.querySelectorAll('[data-node]').forEach(button => {
        const id = button.dataset.node;
        button.setAttribute('aria-pressed', String(id === selected));
        button.classList.toggle('updated', applied && s.affected.includes(id) && id !== 'core');
        const tag = button.querySelector('.node-tag');
        tag.textContent = id === 'b' ? (applied ? 'OWNER REVIEW NEEDED' : 'LOCAL EXCEPTION') : id === 'core' ? (applied ? 'APPROVED EXAMPLE CHANGE' : 'APPROVED SHARED KNOWLEDGE') : applied ? 'CONNECTED VIEW REFRESHED' : { warehouse: 'SHARED SITE PROCEDURES', field: 'ROLE-SPECIFIC GUIDANCE', support: 'APPROVED RESPONSES', a: 'INHERITS SHARED RULES', crew: 'ANSWERS + CHECKLISTS', public: 'CUSTOMER-SAFE VIEW' }[id];
      });
      document.querySelectorAll('[data-scenario]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenario === scenarioKey)));
      requestAnimationFrame(() => drawEdges());
    }

    graph.addEventListener('click', event => { const node = event.target.closest('[data-node]'); if (!node) return; selected = node.dataset.node; render(); });
    document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => { clearTimeout(pulseTimer); scenarioKey = button.dataset.scenario; applied = false; selected = 'core'; render(); }));
    preview.addEventListener('click', () => {
      if (applied) { applied = false; render(); return; }
      const s = scenarios[scenarioKey];
      setText('#impact-description', `${s.proposal} ${s.explanation}`);
      const list = document.querySelector('#impact-list');
      list.replaceChildren();
      for (const [label, action] of s.impacts) {
        const li = document.createElement('li');
        const name = document.createElement('span'); name.textContent = label;
        const next = document.createElement('span'); next.textContent = action;
        li.append(name, next); list.append(li);
      }
      modal.showModal();
      document.body.classList.add('modal-open');
    });
    document.querySelector('.close-modal').addEventListener('click', () => modal.close());
    modal.addEventListener('click', event => { if (event.target === modal) { const r = modal.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close(); } });
    modal.addEventListener('close', () => { document.body.classList.remove('modal-open'); preview.focus({ preventScroll: true }); });
    document.querySelector('#approve-change').addEventListener('click', () => {
      applied = true;
      render();
      modal.close();
      requestAnimationFrame(() => drawEdges(true));
      pulseTimer = setTimeout(() => drawEdges(), 2400);
    });
    new ResizeObserver(() => drawEdges()).observe(graph);
    if (document.fonts) document.fonts.ready.then(() => drawEdges());
    render();
  }

  const chatBody = document.querySelector('#chat-body');
  if (chatBody) {
    let stage = 0;
    let site = '';
    let timing = '';
    const bubble = (role, text) => {
      const el = document.createElement('div'); el.className = `chat-bubble ${role} reveal`;
      if (role === 'assistant') { const label = document.createElement('small'); label.textContent = 'SONAWAY / GUIDED INTAKE'; el.append(label); }
      el.append(document.createTextNode(text)); chatBody.append(el);
    };
    const choices = options => {
      const wrap = document.createElement('div'); wrap.className = 'chat-choices';
      for (const label of options) { const b = document.createElement('button'); b.textContent = label; b.addEventListener('click', () => advance(label)); wrap.append(b); }
      chatBody.append(wrap);
    };
    const resetChat = () => {
      stage = 0; site = ''; timing = ''; chatBody.replaceChildren();
      bubble('user', 'We’re moving deliveries to the rear entrance.');
      bubble('assistant', 'Which location does this apply to? Warehouse A and Warehouse B have separate delivery instructions.');
      choices(['Warehouse A', 'Both warehouses']);
    };
    function advance(label) {
      chatBody.querySelector('.chat-choices')?.remove();
      if (stage === 0) {
        site = label; stage = 1;
        bubble('user', label);
        bubble('assistant', 'When should it apply? I’ll keep the normal instructions connected, so a temporary change doesn’t replace them permanently.');
        choices(['From next Monday onward', 'For one event week']);
      } else if (stage === 1) {
        timing = label; stage = 2;
        bubble('user', label);
        bubble('assistant', 'Does this include every delivery, or just supplier deliveries? Customer collections have a separate route.');
        choices(['Supplier deliveries only', 'All deliveries, not collections']);
      } else if (stage === 2) {
        stage = 3;
        bubble('user', label);
        const scope = site === 'Both warehouses' ? 'Warehouse A and Warehouse B' : 'Warehouse A';
        const period = timing === 'For one event week' ? 'a temporary event-week context, with exact dates still to confirm' : 'an ongoing change starting next Monday, with the exact date still to confirm';
        bubble('assistant', `Draft scope: ${scope}; ${label.toLowerCase()}; ${period}. Next we’d confirm access hours, identify affected instructions and route the change to the responsible person. No update is published yet.`);
        choices(['See the connected impact']);
      } else {
        document.querySelector('#explore').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        document.querySelector('[data-node="a"]').click();
        document.querySelector('#preview-change').focus({ preventScroll: true });
      }
    }
    document.querySelector('#chat-reset').addEventListener('click', resetChat);
    resetChat();
  }

  const calc = document.querySelector('.calculator');
  if (calc) {
    const fields = ['people', 'questions', 'minutes', 'rate', 'share'];
    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    function calculate() {
      const values = Object.fromEntries(fields.map(key => [key, Number(document.querySelector(`#calc-${key}`).value)]));
      fields.forEach(key => { document.querySelector(`#out-${key}`).textContent = key === 'rate' ? currency.format(values[key]) : key === 'share' ? `${values[key]}%` : key === 'minutes' ? `${values[key]} min` : String(values[key]); });
      const hours = values.people * values.questions * values.minutes / 60 * 22 * values.share / 100;
      document.querySelector('#calc-hours').textContent = `${hours.toLocaleString('en-US', { maximumFractionDigits: 1 })} h`;
      document.querySelector('#calc-value').textContent = currency.format(hours * values.rate);
    }
    calc.addEventListener('input', calculate);
    calculate();
  }

  const contact = document.querySelector('#contact-form');
  if (contact) {
    let brief = '';
    contact.addEventListener('submit', event => {
      event.preventDefault();
      if (!contact.reportValidity()) return;
      const d = new FormData(contact);
      brief = `Sonaway Systems — Project enquiry\n\nName: ${d.get('name')}\nEmail: ${d.get('email')}\nBusiness: ${d.get('business')}\nTeam size: ${d.get('size')}\nSupport: ${d.get('support')}\n\nWhat we’d like to improve:\n${d.get('message')}`;
      document.querySelector('#brief-output').textContent = brief;
      document.querySelector('#brief-ready').hidden = false;
      document.querySelector('#copy-status').textContent = '';
      const subject = `Sonaway Systems enquiry — ${d.get('business')}`;
      document.querySelector('#open-email').href = `mailto:domenik@sonaway.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief)}`;
    });
    document.querySelector('#copy-brief').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(brief); document.querySelector('#copy-status').textContent = 'Copied. Paste it into an email to domenik@sonaway.com.'; }
      catch { const range = document.createRange(); range.selectNodeContents(document.querySelector('#brief-output')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); document.querySelector('#copy-status').textContent = 'Select and copy the highlighted brief, then email it to domenik@sonaway.com.'; }
    });
  }
})();
