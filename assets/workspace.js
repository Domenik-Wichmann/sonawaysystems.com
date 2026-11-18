(() => {
  const workspace = document.querySelector('.ops-workspace');
  if (!workspace) return;
  const panel = workspace.querySelector('#ops-panel');
  const buttons = [...workspace.querySelectorAll('[data-view]')];
  const answers = panel.innerHTML;
  const views = {
    answers,
    library: '<p class="ops-context">Procedure library · Assembly</p><h3>Find the approved instructions</h3><dl class="ops-details"><div><dt>Drawing release procedure</dt><dd>Approved · Rev. 4</dd></div><div><dt>B-214 work order checklist</dt><dd>Approved · Rev. 2</dd></div><div><dt>Revision mismatch escalation</dt><dd>Owner · Quality</dd></div></dl><p class="ops-source">Each record has a source, an owner and a revision.</p>',
    locations: '<p class="ops-context">Company standard · Two workshops</p><h3>One drawing rule, different access points</h3><dl class="ops-details"><div><dt>Workshop A</dt><dd>Station tablet</dd></div><div><dt>Workshop B</dt><dd>QR guide</dd></div></dl><p class="ops-source">Both locations use the same approved revision rule.</p>',
    training: '<p class="ops-context">Assembly operator · Before your first B-214 order</p><h3>Check the drawing revision</h3><ol><li>Read the drawing revision on the work order traveler.</li><li>Open the matching drawing from the station’s QR guide.</li><li>Ask Quality to resolve a mismatch before continuing.</li></ol><p class="ops-source">2-minute refresher · Drawing release procedure §3</p>',
    changes: '<p class="ops-context">Pending review · Workshop B</p><h3>Move the drawing check earlier</h3><p>Proposed by the shift lead: verify the revision when opening the order, before pulling parts.</p><dl class="ops-details"><div><dt>Review owner</dt><dd>Quality lead</dd></div><div><dt>Affected guidance</dt><dd>Station QR guide, assembly checklist, shift refresher</dd></div></dl><p class="ops-source">Draft · Current instructions still apply</p>',
    insights: '<p class="ops-context">Workshop B · Example week</p><h3>Where staff needed clarification</h3><dl class="ops-details"><div><dt>Which drawing revision applies?</dt><dd>12 questions</dd></div><div><dt>Who approves a mismatch?</dt><dd>5 questions</dd></div></dl><p class="ops-source">Suggested follow-up · Add the Quality contact to the station guide.</p>'
  };
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    panel.innerHTML = views[button.dataset.view];
  }));
})();
