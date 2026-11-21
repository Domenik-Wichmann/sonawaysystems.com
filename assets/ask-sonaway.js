(() => {
  const form = document.querySelector('#ask-sonaway');
  if (!form) return;
  const input = form.elements.question;
  const output = document.querySelector('#sonaway-answer');
  const answer = output.querySelector('p');
  const sources = output.querySelector('ul');
  const submit = form.querySelector('button');
  const contact = output.querySelector('[data-contact]');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (question.length < 3 || submit.disabled) return;
    submit.disabled = true;
    output.hidden = false;
    sources.replaceChildren();
    contact.hidden = true;
    answer.textContent = 'Looking that up…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 46000);
    try {
      const response = await fetch('/ask/index.php', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin', body: JSON.stringify({question}), signal: controller.signal
      });
      const data = await response.json();
      answer.textContent = data.answer || data.error || 'Please try again.';
      for (const source of data.sources || []) {
        const url = new URL(source.url, location.origin);
        if (url.origin !== location.origin) continue;
        const link = document.createElement('a');
        link.href = url.href;
        link.textContent = source.title;
        const row = document.createElement('li');
        row.append(link);
        sources.append(row);
      }
      contact.hidden = ['saved','generated'].includes(data.kind);
    } catch {
      answer.textContent = 'Search is unavailable. Open a common question below or contact us.';
      contact.hidden = false;
    } finally {
      clearTimeout(timer);
      submit.disabled = false;
    }
  });
})();
