(() => {
  const workspace = document.querySelector('#capture-workspace');
  const content = document.querySelector('#capture-content');
  const next = document.querySelector('#capture-next');
  const buttons = [...workspace.querySelectorAll('[data-stage]')];
  const stages = [
    `<h3>Start with three versions of the same job.</h3>
    <dl><div><dt>Operator walkthrough · 00:48</dt><dd>“I check the customer label against the order before sealing.”</dd></div>
    <div><dt>Supervisor interview · 02:16</dt><dd>“For retail orders, a second person verifies the first carton.”</dd></div>
    <div><dt>Paper checklist · Rev. 2</dt><dd>“Apply label after sealing.” The checklist omits verification.</dd></div></dl>`,
    `<h3>Map the steps and the people responsible.</h3>
    <ol><li>Operator matches the label to the order.</li><li>Determine whether a second check applies.</li><li>Operator seals the carton and applies the verified label.</li></ol>
    <p>Follow-up for the supervisor: does the second check apply to every carton or just the first carton of a retail order?</p>`,
    `<h3>Resolve the missing verification rule.</h3>
    <p>The checklist and walkthrough describe different actions. The operator checks the label <em>before</em> sealing and applies it <em>after</em> sealing.</p>
    <dl><div><dt>Proposed rule · awaiting owner review</dt><dd>For retail orders, a shift lead verifies the first carton’s label before it is sealed. The operator checks the label on every carton against the order.</dd></div>
    <div><dt>Supporting evidence</dt><dd>Operator walkthrough · 00:48 and supervisor interview · 02:16.</dd></div></dl>`,
    `<h3>Review what will change before publishing.</h3>
    <ul><li>Revise the packing SOP and retire the old checklist.</li><li>Refresh the station’s QR guide and shift lead’s training.</li><li>Make the approved rule available to staff search and AI answers, if included.</li></ul>
    <p>Process owner: Packing supervisor. Scope: retail orders only for the second check.</p>`
  ];
  let stage = 0;
  let approved = false;
  function render() {
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === stage)));
    content.innerHTML = stages[stage] + (stage === 3 && approved ? '<p class="capture-approved">Approved in this demo. The SOP, QR guide and training are ready to publish.</p>' : '');
    next.textContent = ['Map the work →', 'Review the conflict →', 'Review the release →', approved ? 'Start again ↺' : 'Approve example'][stage];
  }
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    stage = index;
    render();
  }));
  next.addEventListener('click', () => {
    if (stage < stages.length - 1) stage += 1;
    else if (!approved) approved = true;
    else {
      approved = false;
      stage = 0;
    }
    render();
  });
  render();
})();
