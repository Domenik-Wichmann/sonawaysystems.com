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
      c: { name: 'Warehouse C', parent: 'warehouse' },
      crew: { name: 'Service crews', parent: 'field' },
      public: { name: 'Customer website', parent: 'support' }
    };
    const scenarios = {
      cutoff: {
        title: 'Shared policy, different local rules', label: 'Standard order cutoff', source: 'Order policy §2.1',
        rules: { core: '12:00', warehouse: '11:00', c: '10:00', support: '13:00' },
        options: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
        suggested: { core: '14:00', warehouse: '15:00', c: '09:00' }
      },
      event: {
        title: 'Temporary hours, with local context', label: 'Dispatch closing time', source: 'Dispatch policy §3 · peak-week view',
        rules: { core: '17:00', warehouse: '15:00', c: '14:00', support: '18:00' },
        options: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
        suggested: { core: '20:00', warehouse: '19:00', c: '16:00' }
      },
      returns: {
        title: 'One policy model, staff and customer views', label: 'Returns acceptance window', source: 'Returns policy §4 · audience-specific guidance',
        rules: { core: '30 days', warehouse: '21 days', c: '14 days', support: '45 days' },
        options: ['7 days', '14 days', '21 days', '30 days', '45 days', '60 days'],
        suggested: { core: '45 days', warehouse: '30 days', c: '21 days' }
      }
    };
    let scenarioKey = 'cutoff';
    let rules = { ...scenarios.cutoff.rules };
    let selected = 'core';
    let updated = [];
    let reviewed = [];
    let changeCount = 0;
    let pending = null;
    let pulseTimer;
    const graphSvg = graph.querySelector('svg');
    const modal = document.querySelector('#impact-modal');
    const targetSelect = document.querySelector('#change-target');
    const newRule = document.querySelector('#new-rule');
    const inherit = document.querySelector('#inherit-change');
    const preview = document.querySelector('#preview-change');
    const reset = document.querySelector('#reset-graph');
    const setText = (selector, value) => { document.querySelector(selector).textContent = value; };
    const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
    const lineage = id => nodes[id].parent ? [...lineage(nodes[id].parent), id] : [id];
    const effective = (id, model = rules) => owns(model, id) ? { value: model[id], origin: id } : effective(nodes[id].parent, model);

    function makeProposal() {
      const target = targetSelect.value;
      const next = { ...rules };
      if (inherit.checked && target !== 'core') delete next[target];
      else next[target] = newRule.value;
      const affected = Object.keys(nodes).filter(id => {
        const before = effective(id);
        const after = effective(id, next);
        return before.value !== after.value || before.origin !== after.origin;
      });
      const preserved = Object.keys(rules).filter(id => id !== target && lineage(id).includes(target));
      return { target, next, affected, preserved, previous: { ...rules }, restoresInheritance: inherit.checked && target !== 'core' };
    }

    function updateProposalSummary() {
      const proposal = makeProposal();
      const before = effective(proposal.target).value;
      const after = effective(proposal.target, proposal.next).value;
      const description = document.querySelector('#change-description');
      description.replaceChildren(document.createTextNode(proposal.restoresInheritance
        ? `${nodes[proposal.target].name}: restore inheritance from ${nodes[nodes[proposal.target].parent].name}.`
        : `${nodes[proposal.target].name}: ${before} → ${after}.`));
      const line = document.createElement('span');
      const count = proposal.affected.length;
      line.textContent = count ? `${count} connected ${count === 1 ? 'view will' : 'views will'} change. ${proposal.preserved.length ? `${proposal.preserved.length} explicit overrides stay in place for review.` : 'Other branches keep their current rules.'}` : 'Choose a different value or restore inheritance to see a change.';
      description.append(line);
      preview.disabled = count === 0;
      preview.textContent = count === 0 ? 'Choose a different rule' : 'Preview update';
    }

    function configureEditor() {
      const s = scenarios[scenarioKey];
      const target = targetSelect.value;
      newRule.replaceChildren();
      for (const value of s.options) {
        const option = document.createElement('option'); option.value = value; option.textContent = value; newRule.append(option);
      }
      const recommended = s.suggested[target];
      newRule.value = recommended !== effective(target).value ? recommended : s.options[(s.options.indexOf(recommended) + 1) % s.options.length];
      inherit.checked = false;
      inherit.disabled = target === 'core';
      newRule.disabled = false;
      setText('#target-explainer', target === 'core' ? 'Company changes reach inheriting branches. Department and site overrides keep their own values.' : 'Edit this rule, or remove its override to inherit the parent rule again.');
      updateProposalSummary();
    }

    function describeNode(id) {
      const source = effective(id);
      const local = owns(rules, id);
      if (id === 'core') return scenarioKey === 'event'
        ? 'The shared closing time in this illustrative peak-week context. Changes affect inheriting branches; ending the context restores the original example.'
        : 'The company default. Only branches that inherit this rule follow a change to it. Department and site overrides remain explicit.';
      if (id === 'public') return `This customer-facing view uses the ${source.value} rule from ${nodes[source.origin].name}. Only approved public guidance is shown; internal contacts and escalation details stay restricted.`;
      if (local) return id === 'c'
        ? `An approved site-specific exception sets ${source.value}. Warehouse A and B can follow the warehouse default while C keeps this separate rule. You can restore inheritance using the controls above.`
        : `This department sets its own ${source.value} rule. Its inheriting teams follow this value, even when the company default differs. A parent change does not silently replace it.`;
      return `This view inherits ${source.value} from ${nodes[source.origin].name}. It has no independent copy of the rule, so a change at that source flows through automatically in this illustration.`;
    }

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
        if (owns(rules, id)) path.classList.add('blocked');
        if (updated.includes(id)) path.classList.add('affected');
        if (animate && updated.includes(id)) path.classList.add('pulse');
        graphSvg.append(path);
      }
    }

    function render() {
      const s = scenarios[scenarioKey];
      setText('#scenario-title', s.title);
      graph.querySelectorAll('[data-node]').forEach(button => {
        const id = button.dataset.node;
        const source = effective(id);
        const local = owns(rules, id);
        const tag = id === 'core' ? 'COMPANY DEFAULT' : local ? (id === 'c' ? 'SITE EXCEPTION' : 'DEPARTMENT OVERRIDE') : `FROM ${nodes[source.origin].name.toUpperCase()}`;
        button.querySelector('.node-time').textContent = source.value;
        button.querySelector('.node-tag').textContent = tag;
        button.setAttribute('aria-label', `${nodes[id].name}, ${source.value}, ${tag.toLowerCase()}${updated.includes(id) ? ', updated' : ''}${reviewed.includes(id) ? ', override preserved for review' : ''}`);
        button.setAttribute('aria-pressed', String(id === selected));
        button.classList.toggle('override', id !== 'core' && local);
        button.classList.toggle('updated', updated.includes(id));
        button.classList.toggle('review', reviewed.includes(id));
      });
      const source = effective(selected);
      setText('#node-title', nodes[selected].name);
      setText('#node-label', s.label);
      setText('#node-value', source.value);
      setText('#node-description', describeNode(selected));
      const activePath = lineage(selected).slice(lineage(selected).indexOf(source.origin));
      setText('#node-source', `${activePath.map(id => nodes[id].name).join(' → ')} · ${s.source}`);
      const status = document.querySelector('#lab-status');
      status.classList.toggle('applied', changeCount > 0);
      status.replaceChildren(document.createElement('i'), document.createTextNode(changeCount ? `${updated.length} ${updated.length === 1 ? 'view' : 'views'} updated` : 'Current rules'));
      reset.textContent = scenarioKey === 'event' && changeCount ? 'End peak-week context' : 'Reset example';
      document.querySelectorAll('[data-scenario]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenario === scenarioKey)));
      updateProposalSummary();
      requestAnimationFrame(() => { drawEdges(); if (window.innerWidth < 650 && changeCount === 0 && selected === 'core') graph.parentElement.scrollLeft = (graph.scrollWidth - graph.parentElement.clientWidth) / 2; });
    }

    graph.addEventListener('click', event => {
      const button = event.target.closest('[data-node]');
      if (!button) return;
      selected = button.dataset.node;
      render();
    });
    targetSelect.addEventListener('change', () => { selected = targetSelect.value; configureEditor(); render(); });
    newRule.addEventListener('change', updateProposalSummary);
    inherit.addEventListener('change', () => { newRule.disabled = inherit.checked; updateProposalSummary(); });
    const resetScenario = () => {
      clearTimeout(pulseTimer); rules = { ...scenarios[scenarioKey].rules }; updated = []; reviewed = []; changeCount = 0; selected = 'core'; targetSelect.value = 'core'; configureEditor(); render();
    };
    document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => { scenarioKey = button.dataset.scenario; resetScenario(); }));
    reset.addEventListener('click', resetScenario);
    preview.addEventListener('click', () => {
      pending = makeProposal();
      if (!pending.affected.length) return;
      const from = effective(pending.target).value;
      const to = effective(pending.target, pending.next).value;
      setText('#impact-description', `${nodes[pending.target].name}: ${from} → ${to}.${pending.restoresInheritance ? ' The explicit override will be removed, restoring the parent rule.' : ''}${scenarioKey === 'event' ? ' This applies only inside the illustrative peak-week context.' : ''}`);
      const list = document.querySelector('#impact-list');
      list.replaceChildren();
      for (const id of pending.affected) {
        const li = document.createElement('li');
        const label = document.createElement('span'); label.textContent = nodes[id].name;
        const action = document.createElement('span'); action.textContent = `${effective(id).value} → ${effective(id, pending.next).value}`;
        li.append(label, action); list.append(li);
      }
      for (const id of pending.preserved) {
        const li = document.createElement('li');
        const label = document.createElement('span'); label.textContent = nodes[id].name;
        const action = document.createElement('span'); action.className = 'impact-kept'; action.textContent = `${effective(id).value} · override kept for review`;
        li.append(label, action); list.append(li);
      }
      modal.showModal(); document.body.classList.add('modal-open');
    });
    document.querySelector('.close-modal').addEventListener('click', () => modal.close());
    modal.addEventListener('click', event => {
      if (event.target !== modal) return;
      const r = modal.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
    });
    modal.addEventListener('close', () => { document.body.classList.remove('modal-open'); preview.focus({ preventScroll: true }); });
    document.querySelector('#approve-change').addEventListener('click', () => {
      if (!pending) return;
      rules = pending.next; updated = pending.affected; reviewed = pending.preserved; selected = pending.target; changeCount++;
      pending = null; configureEditor(); render(); modal.close();
      requestAnimationFrame(() => drawEdges(true));
      clearTimeout(pulseTimer); pulseTimer = setTimeout(() => drawEdges(), 2500);
    });
    new ResizeObserver(() => drawEdges()).observe(graph);
    if (document.fonts) document.fonts.ready.then(() => drawEdges());
    configureEditor(); render();
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
