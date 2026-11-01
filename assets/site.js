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

  let automaticDemoScroll = false;
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    let previousY = Math.max(0, window.scrollY);
    let scrollQueued = false;
    window.addEventListener('scroll', () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - previousY;
        if (automaticDemoScroll) siteHeader.classList.add('header-hidden');
        else if (currentY < 90 || nav?.classList.contains('open')) siteHeader.classList.remove('header-hidden');
        else if (Math.abs(delta) > 3) siteHeader.classList.toggle('header-hidden', delta > 0);
        previousY = currentY;
        scrollQueued = false;
      });
    }, { passive: true });
    siteHeader.addEventListener('focusin', () => siteHeader.classList.remove('header-hidden'));
    menu?.addEventListener('click', () => siteHeader.classList.remove('header-hidden'));
  }

  const graph = document.querySelector('#knowledge-graph');
  if (graph) {
    const nodes = {
      core: { name: 'Business core', short: 'Business', parent: null, ink: '#24553b', bg: '#e2eddf', line: '#709e7b' },
      warehouse: { name: 'Warehouse core', short: 'Warehouse', parent: 'core', ink: '#63418d', bg: '#eee5f7', line: '#a486bf' },
      field: { name: 'Field operations', short: 'Field ops', parent: 'core', ink: '#22616c', bg: '#e0f0ee', line: '#8abbbb' },
      support: { name: 'Customer support', short: 'Support', parent: 'core', ink: '#245c90', bg: '#e2edf8', line: '#7ba4c7' },
      a: { name: 'Warehouse A', short: 'WH A', parent: 'warehouse', ink: '#893d64', bg: '#f3e2ed', line: '#cca0b8' },
      b: { name: 'Warehouse B', short: 'WH B', parent: 'warehouse', ink: '#70417f', bg: '#efe1f1', line: '#b99bc5' },
      c: { name: 'Warehouse C', short: 'WH C', parent: 'warehouse', ink: '#89501e', bg: '#f8ead8', line: '#c89961' },
      crew: { name: 'Service crews', short: 'Crews', parent: 'field', ink: '#6f5b21', bg: '#f1edda', line: '#c4b988' },
      public: { name: 'Customer website', short: 'Website', parent: 'support', ink: '#8e4034', bg: '#f5e5df', line: '#d0a299' }
    };
    const scenarios = {
      cutoff: { title: 'Standard order cutoff', rules: { core: '12:00', warehouse: '11:00', c: '10:00', support: '13:00' }, options: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
      event: { title: 'Dispatch closing time · peak-week example', rules: { core: '17:00', warehouse: '15:00', c: '14:00', support: '18:00' }, options: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
      returns: { title: 'Returns acceptance window', rules: { core: '30 days', warehouse: '21 days', c: '14 days', support: '45 days' }, options: ['7 days', '14 days', '21 days', '30 days', '45 days', '60 days'] }
    };
    let scenarioKey = 'cutoff';
    let rules = { ...scenarios.cutoff.rules };
    let selected = 'core';
    let updated = [];
    let history = [];
    let animationTimer;
    let statusText = 'Click any node to edit. Changes stay in this example.';
    const graphSvg = graph.querySelector('svg');
    const undo = document.querySelector('#undo-change');
    const reset = document.querySelector('#reset-graph');
    const owns = (model, id) => Object.prototype.hasOwnProperty.call(model, id);
    const effective = (id, model = rules) => owns(model, id) ? { value: model[id], origin: id } : effective(nodes[id].parent, model);
    const lineage = id => nodes[id].parent ? [...lineage(nodes[id].parent), id] : [id];
    const differences = (before, after) => Object.keys(nodes).filter(id => {
      const a = effective(id, before), b = effective(id, after);
      return a.value !== b.value || a.origin !== b.origin;
    });
    function closeEditors(focus = false) {
      graph.querySelectorAll('.is-editing').forEach(card => {
        card.classList.remove('is-editing'); card.querySelector('.node-editor').hidden = true;
        card.querySelector('.node-trigger').setAttribute('aria-expanded', 'false');
        if (focus) card.querySelector('.node-trigger').focus({ preventScroll: true });
      });
    }
    function drawEdges(animate = false) {
      const bounds = graph.getBoundingClientRect();
      graphSvg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      graphSvg.replaceChildren();
      for (const [id, node] of Object.entries(nodes)) {
        if (!node.parent) continue;
        const parent = graph.querySelector(`[data-node="${node.parent}"]`).getBoundingClientRect();
        const child = graph.querySelector(`[data-node="${id}"]`).getBoundingClientRect();
        const x1 = parent.left + parent.width / 2 - bounds.left, y1 = parent.bottom - bounds.top;
        const x2 = child.left + child.width / 2 - bounds.left, y2 = child.top - bounds.top;
        const mid = (y1 + y2) / 2;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`);
        path.style.stroke = nodes[effective(id).origin].ink;
        if (owns(rules, id)) path.classList.add('own-rule');
        // A local rule starts a new branch: its incoming edge carries no update.
        // Only animate edges that actually pass the changed rule to an inheritor.
        path.dataset.from = node.parent;
        path.dataset.to = id;
        if (animate && updated.includes(id) && !owns(rules, id)) path.classList.add('flowing');
        graphSvg.append(path);
      }
    }
    function render() {
      document.querySelector('#scenario-title').textContent = scenarios[scenarioKey].title;
      graph.querySelectorAll('[data-node]').forEach(card => {
        const id = card.dataset.node, source = effective(id), palette = nodes[source.origin];
        card.style.setProperty('--source-bg', palette.bg);
        card.style.setProperty('--source-ink', palette.ink);
        card.style.setProperty('--source-line', palette.line);
        card.dataset.origin = source.origin;
        card.classList.toggle('is-selected', selected === id);
        card.classList.toggle('just-updated', updated.includes(id));
        card.querySelector('.node-time').textContent = source.value;
        card.querySelector('.node-tag').textContent = source.origin === id ? (id === 'core' ? 'COMPANY DEFAULT' : 'OWN RULE') : `FROM ${nodes[source.origin].short.toUpperCase()}`;
        const trigger = card.querySelector('.node-trigger');
        trigger.setAttribute('aria-label', `Edit ${nodes[id].name} rule, ${source.value}, ${source.origin === id ? 'sets its own rule' : `inherits from ${nodes[source.origin].name}`}`);
        trigger.setAttribute('aria-pressed', String(id === selected));
        trigger.setAttribute('aria-expanded', String(card.classList.contains('is-editing')));
      });
      const source = effective(selected);
      document.querySelector('#node-readout').textContent = source.origin === selected
        ? `${nodes[selected].name} sets ${source.value}. Matching colors show which views use this rule.`
        : `${nodes[selected].name} inherits ${source.value} from ${nodes[source.origin].name}.`;
      document.querySelector('#lab-status').textContent = statusText;
      const legend = document.querySelector('#source-colors'); legend.replaceChildren();
      const origins = [...new Set(Object.keys(nodes).map(id => effective(id).origin))];
      for (const id of origins) {
        const entry = document.createElement('span'); const dot = document.createElement('i'); dot.style.backgroundColor = nodes[id].ink;
        entry.append(dot, document.createTextNode(nodes[id].short)); legend.append(entry);
      }
      undo.disabled = history.length === 0;
      document.querySelectorAll('[data-scenario]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenario === scenarioKey)));
      requestAnimationFrame(() => drawEdges());
    }
    function frameDemo() {
      const stage = document.querySelector('#interactive-demo');
      const rect = stage.getBoundingClientRect();
      if (rect.top >= 12 && rect.bottom <= window.innerHeight - 12) return;
      automaticDemoScroll = true;
      siteHeader?.classList.add('header-hidden');
      stage.scrollIntoView({ behavior: 'instant', block: 'start' });
      requestAnimationFrame(() => requestAnimationFrame(() => { automaticDemoScroll = false; }));
    }
    document.querySelectorAll('a[href="#interactive-demo"]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      frameDemo();
      window.history.replaceState(null, '', '#interactive-demo');
    }));
    function openEditor(id) {
      frameDemo();
      closeEditors(); selected = id; render();
      const card = graph.querySelector(`[data-node="${id}"]`), editor = card.querySelector('.node-editor');
      editor.replaceChildren();
      if (nodes[id].parent) {
        const parent = effective(nodes[id].parent);
        const option = document.createElement('option'); option.value = '__inherit__'; option.textContent = `↳ Use parent rule (${parent.value})`; editor.append(option);
      }
      for (const value of scenarios[scenarioKey].options) {
        const option = document.createElement('option'); option.value = value; option.textContent = value; editor.append(option);
      }
      editor.value = owns(rules, id) ? rules[id] : '__inherit__';
      card.classList.add('is-editing'); editor.hidden = false;
      card.querySelector('.node-trigger').setAttribute('aria-expanded', 'true');
      editor.focus({ preventScroll: true });
      // Open the native picker directly where supported, within the click gesture.
      try { if (typeof editor.showPicker === 'function') editor.showPicker(); } catch { /* Normal select interaction remains available. */ }
    }
    function applyChange(id, value) {
      const before = { ...rules }, next = { ...rules };
      if (value === '__inherit__' && nodes[id].parent) delete next[id]; else next[id] = value;
      const changed = differences(before, next);
      closeEditors();
      if (!changed.length) return;
      history.push({ rules: before, selected: id });
      rules = next; selected = id; updated = changed;
      const unchangedOverrides = Object.keys(rules).filter(other => other !== id && lineage(other).includes(id)).length;
      statusText = `${nodes[id].name}: ${effective(id, before).value} → ${effective(id).value}. ${changed.length} ${changed.length === 1 ? 'view updated' : 'views updated'}${unchangedOverrides ? `; ${unchangedOverrides} ${unchangedOverrides === 1 ? 'override kept' : 'overrides kept'}` : ''}.`;
      render();
      graph.querySelector(`[data-node="${id}"] .node-trigger`).focus({ preventScroll: true });
      requestAnimationFrame(() => drawEdges(true));
      clearTimeout(animationTimer); animationTimer = setTimeout(() => { updated = []; graph.querySelectorAll('.just-updated').forEach(c => c.classList.remove('just-updated')); drawEdges(); }, 1800);
    }
    graph.addEventListener('click', event => {
      const trigger = event.target.closest('.node-trigger');
      if (trigger) openEditor(trigger.closest('[data-node]').dataset.node);
    });
    graph.addEventListener('change', event => {
      if (event.target.matches('.node-editor')) applyChange(event.target.closest('[data-node]').dataset.node, event.target.value);
    });
    graph.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); closeEditors(true); } });
    graph.addEventListener('focusout', () => { queueMicrotask(() => { if (!graph.contains(document.activeElement)) closeEditors(); }); });
    document.addEventListener('click', event => { if (!graph.contains(event.target)) closeEditors(); });
    undo.addEventListener('click', () => {
      const snapshot = history.pop(); if (!snapshot) return;
      clearTimeout(animationTimer); const before = rules; rules = snapshot.rules; selected = snapshot.selected;
      updated = differences(before, rules); statusText = 'Last edit undone. Values, inheritance and source colors restored.'; closeEditors(); render();
    });
    const resetScenario = () => {
      clearTimeout(animationTimer); closeEditors(); rules = { ...scenarios[scenarioKey].rules }; selected = 'core'; updated = []; history = [];
      statusText = 'Click any node to edit. Changes stay in this example.'; render();
    };
    reset.addEventListener('click', resetScenario);
    document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => { scenarioKey = button.dataset.scenario; resetScenario(); }));
    new ResizeObserver(() => drawEdges()).observe(graph);
    if (document.fonts) document.fonts.ready.then(() => drawEdges());
    render();
  }

  const chatBody = document.querySelector('#chat-body');
  if (chatBody) {
    let stage = 0;
    let site = '';
    let timing = '';
    let delivery = '';
    const updateNetwork = () => window.dispatchEvent(new CustomEvent('sonaway:intake', { detail: { stage, site, timing, delivery } }));
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
      stage = 0; site = ''; timing = ''; delivery = ''; chatBody.replaceChildren();
      bubble('user', 'We’re moving deliveries to the rear entrance.');
      bubble('assistant', 'Which location does this apply to? Warehouse A and Warehouse B have separate delivery instructions.');
      choices(['Warehouse A', 'Both warehouses']);
      updateNetwork();
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
        stage = 3; delivery = label;
        bubble('user', label);
        const scope = site === 'Both warehouses' ? 'Warehouse A and Warehouse B' : 'Warehouse A';
        const period = timing === 'For one event week' ? 'a temporary event-week context, with exact dates still to confirm' : 'an ongoing change starting next Monday, with the exact date still to confirm';
        bubble('assistant', `Draft scope: ${scope}; ${label.toLowerCase()}; ${period}. Next we’d confirm access hours, identify affected instructions and route the change to the responsible person. No update is published yet.`);
        choices(['See the connected impact']);
      } else {
        document.querySelector('#interactive-demo').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        document.querySelector('[data-node="a"] .node-trigger').click();
        document.querySelector('[data-node="a"] .node-trigger').focus({ preventScroll: true });
      }
      updateNetwork();
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

