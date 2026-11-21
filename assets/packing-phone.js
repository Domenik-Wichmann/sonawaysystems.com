(() => {
  const phone = document.querySelector('[data-packing-phone]');
  if (!phone) return;

  // Each language presents the same three packing-floor documents and their answers.
  const copy = {
    en: {
      brand: 'Packing floor', desk: 'Dispatch desk', library: 'Shift library', ask: 'Ask', files: 'Documents',
      intro: 'Three connected documents for the team packing produce orders.',
      kinds: ['Packing SOP', 'Work instruction', 'Shift meeting'],
      titles: ['Pack a produce order', 'Check the carton label', 'Monday handover'],
      pack: ['Match the produce and carton count to the order.', 'Check the customer label before sealing each carton.', 'Move checked cartons to the dispatch pallet.'],
      label: 'Match the customer name and order number on the label to the order sheet. If either differs, move the carton to the hold rack and tell the shift lead.',
      meeting: 'After two labels were mixed up, the team agreed to keep held cartons off the dispatch pallet. Only the shift lead releases them after checking the corrected label.',
      follow: 'Linked procedure', notes: 'Decision from the shift meeting', source: 'Source document', more: 'Ask another question',
      askTitle: 'Ask the shift guide', askIntro: 'Try a question from the packing floor.',
      questions: ['What if a label doesn’t match?', 'Who releases a held carton?', 'What do I check before sealing?'],
      answers: ['Put the carton on the hold rack and tell the shift lead. Keep it off the dispatch pallet.', 'The shift lead releases the carton after checking the corrected label.', 'Match the customer name and order number on the label to the order sheet.'],
      answer: 'From the shift guide', replay: 'Replay example', pause: 'Pause example'
    },
    es: {
      brand: 'Empaque', desk: 'Despacho', library: 'Guías del turno', ask: 'Preguntar', files: 'Documentos',
      intro: 'Tres documentos relacionados para el equipo que empaca los pedidos de frutas y verduras.',
      kinds: ['Procedimiento', 'Instrucción', 'Reunión de turno'],
      titles: ['Empacar un pedido', 'Revisar la etiqueta', 'Relevo del lunes'],
      pack: ['Comprueba el producto y el número de cajas del pedido.', 'Revisa la etiqueta del cliente antes de cerrar cada caja.', 'Lleva las cajas revisadas al palé de despacho.'],
      label: 'Comprueba que el nombre del cliente y el número de pedido en la etiqueta coincidan con la orden. Si hay una diferencia, lleva la caja al estante de retención y avisa al jefe de turno.',
      meeting: 'Tras una confusión con dos etiquetas, el equipo acordó dejar las cajas retenidas fuera del palé de despacho. Solo el jefe de turno puede liberarlas después de revisar la etiqueta corregida.',
      follow: 'Procedimiento relacionado', notes: 'Acuerdo de la reunión', source: 'Documento de origen', more: 'Hacer otra pregunta',
      askTitle: 'Pregunta a la guía', askIntro: 'Prueba una pregunta del equipo de empaque.',
      questions: ['¿Y si la etiqueta no coincide?', '¿Quién libera una caja retenida?', '¿Qué reviso antes de cerrar la caja?'],
      answers: ['Lleva la caja al estante de retención y avisa al jefe de turno. Déjala fuera del palé de despacho.', 'El jefe de turno libera la caja después de revisar la etiqueta corregida.', 'Comprueba que el nombre del cliente y el número de pedido en la etiqueta coincidan con la orden.'],
      answer: 'Respuesta de la guía', replay: 'Repetir el ejemplo', pause: 'Pausar el ejemplo'
    },
    de: {
      brand: 'Packstation', desk: 'Versand', library: 'Schichthandbuch', ask: 'Fragen', files: 'Dokumente',
      intro: 'Drei verknüpfte Dokumente für das Team, das Obst und Gemüse für den Versand verpackt.',
      kinds: ['Packanleitung', 'Arbeitsanweisung', 'Schichtbesprechung'],
      titles: ['Bestellung verpacken', 'Kartonetikett prüfen', 'Übergabe am Montag'],
      pack: ['Ware und Kartonanzahl mit dem Auftrag abgleichen.', 'Vor dem Verschließen jedes Kartons das Kundenetikett prüfen.', 'Geprüfte Kartons auf die Versandpalette stellen.'],
      label: 'Kundenname und Auftragsnummer auf dem Etikett mit dem Auftrag abgleichen. Bei einer Abweichung den Karton ins Sperrlager stellen und die Schichtleitung informieren.',
      meeting: 'Nach zwei vertauschten Etiketten hat das Team vereinbart, gesperrte Kartons von der Versandpalette fernzuhalten. Nur die Schichtleitung gibt sie nach Prüfung des korrigierten Etiketts frei.',
      follow: 'Verknüpfte Anleitung', notes: 'Beschluss der Schichtbesprechung', source: 'Quelldokument', more: 'Weitere Frage stellen',
      askTitle: 'Das Handbuch fragen', askIntro: 'Eine Frage aus der Packstation auswählen.',
      questions: ['Was tun, wenn das Etikett falsch ist?', 'Wer gibt gesperrte Kartons frei?', 'Was prüfe ich vor dem Verschließen?'],
      answers: ['Den Karton ins Sperrlager stellen und die Schichtleitung informieren. Der Karton bleibt von der Versandpalette getrennt.', 'Die Schichtleitung gibt den Karton nach Prüfung des korrigierten Etiketts frei.', 'Kundenname und Auftragsnummer auf dem Etikett mit dem Auftrag abgleichen.'],
      answer: 'Antwort aus dem Handbuch', replay: 'Beispiel wiederholen', pause: 'Beispiel pausieren'
    },
    zh: {
      brand: '包装车间', desk: '发货台', library: '班组资料库', ask: '提问', files: '文档',
      intro: '果蔬包装班组可以在这里查阅三份相互关联的文档。',
      kinds: ['包装规程', '作业指导书', '交班记录'],
      titles: ['按订单装箱', '核对外箱标签', '周一交班记录'],
      pack: ['按订单核对果蔬品种和箱数。', '每箱封箱前先核对客户标签。', '将核对无误的箱子放到发货托盘上。'],
      label: '核对标签上的客户名称和订单号是否与订单一致。任一项不符，都要把箱子放到待处理货架上，并通知班组长。',
      meeting: '上次有两张标签贴反了。班组决定，待处理的箱子不得放上发货托盘。只有班组长核对更正后的标签后才能放行。',
      follow: '相关作业指导书', notes: '班前会决定', source: '查看依据', more: '再问一个问题',
      askTitle: '向班组手册提问', askIntro: '试试包装车间的常见问题。',
      questions: ['标签和订单对不上怎么办？', '谁能放行待处理的箱子？', '封箱前要核对什么？'],
      answers: ['把箱子放到待处理货架上，并通知班组长。不要将它放上发货托盘。', '班组长核对更正后的标签后才能放行。', '核对标签上的客户名称和订单号是否与订单一致。'],
      answer: '班组手册的回答', replay: '重播示例', pause: '暂停示例'
    }
  };

  const chatLabels = {
    en: ['Choose a question', 'Send question', 'Which packing question can I help with? Pick one below.'],
    es: ['Elige una pregunta', 'Enviar pregunta', '¿Qué necesitas saber sobre el empaque? Elige una pregunta abajo.'],
    de: ['Frage auswählen', 'Frage senden', 'Was möchtest du über das Verpacken wissen? Wähle unten eine Frage aus.'],
    zh: ['选择问题', '发送问题', '包装时有什么疑问？请在下方选择一个问题。']
  };
  const content = phone.querySelector('[data-fp-content]');
  const dock = phone.querySelector('[data-fp-dock]');
  const select = phone.querySelector('[data-fp-language]');
  const tour = phone.querySelector('[data-fp-tour]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const picker = phone.querySelector('[data-fp-picker]');
  const composer = phone.querySelector('[data-fp-composer]');
  const send = phone.querySelector('[data-fp-send]');
  const invitation = phone.querySelector('[data-fp-try]');
  const steps = [
    ['.fp-file[data-fp-view="pack"]', 'pack', 2850],
    ['.fp-file[data-fp-view="label"]', 'label', 3550],
    ['.fp-file[data-fp-view="meeting"]', 'meeting', 3550],
    ['.fp-source[data-fp-view="ask"]', 'ask', 3550],
    ['[data-fp-language]', 'translate', 1200],
    ['[data-fp-picker]', 'choose', 1200],
    ['[data-fp-send]', 'send', 1100]
  ];
  const docs = ['pack', 'label', 'meeting'];
  const sources = ['label', 'meeting', 'label'];
  let view = 'library';
  let lang = 'en';
  let conversation = [];
  let draft = '';
  let step = 0;
  let pressed;
  let running = !motion.matches;
  let visible = false;
  let timer;

  function icon(kind) {
    const paths = {
      doc: '<path d="M6 2.5h8l4 4v15H6z M14 2.5v5h4 M9 12h6 M9 16h5"/>',
      chat: '<path d="M4 4h16v12H10l-5 4v-4H4z M8 9h8 M8 12h5"/>',
      library: '<path d="M3 5h4v14H3z M10 5h4v14h-4z M16 6l3-1 3 13-3 1z"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + paths[kind] + '</svg>';
  }

  // Only fixed, locally authored document text and navigation keys enter these templates.
  function documentButton(key) {
    const t = copy[lang], index = docs.indexOf(key);
    return '<button type="button" class="fp-file" data-fp-view="' + key + '">' + icon('doc') +
      '<span><small>' + t.kinds[index] + '</small>' + t.titles[index] + '</span></button>';
  }
  function heading(label, title) {
    return '<p class="fp-eyebrow">' + label + '</p><h3 tabindex="-1">' + title + '</h3>';
  }
  function render(focusPage = false) {
    const t = copy[lang];
    let body;
    if (view === 'library') {
      body = heading(t.desk, t.library) + '<p>' + t.intro + '</p>' + docs.map(documentButton).join('');
    } else if (view === 'ask') {
      body = heading(t.brand, t.askTitle);
      body += conversation.length ? conversation.map(i =>
        '<div class="fp-turn"><p class="fp-bubble">' + t.questions[i] + '</p><p class="fp-answer">' + t.answers[i] +
        '</p><p class="fp-eyebrow">' + t.source + '</p>' + documentButton(sources[i]) + '</div>'
      ).join('') : '<p class="fp-answer">' + chatLabels[lang][2] + '</p>';
    } else {
      const i = docs.indexOf(view);
      body = heading(t.kinds[i], t.titles[i]);
      if (view === 'pack') {
        body += '<ol>' + t.pack.map(step => '<li>' + step + '</li>').join('') + '</ol><p class="fp-eyebrow">' + t.follow + '</p>' + documentButton('label');
      } else if (view === 'label') {
        body += '<p>' + t.label + '</p><p class="fp-eyebrow">' + t.notes + '</p>' + documentButton('meeting');
      } else {
        body += '<p>' + t.meeting + '</p><button type="button" class="fp-source" data-fp-view="ask">' + icon('chat') + t.askTitle + '</button>';
      }
    }
    content.lang = lang;
    content.innerHTML = body;
    composer.hidden = view !== 'ask';
    composer.lang = lang;
    picker.setAttribute('aria-label', chatLabels[lang][0]);
    picker.innerHTML = '<option value="" disabled>' + chatLabels[lang][0] + '</option>' +
      t.questions.map((q, i) => '<option value="' + i + '">' + q + '</option>').join('');
    picker.value = draft;
    send.disabled = draft === '';
    send.setAttribute('aria-label', chatLabels[lang][1]);
    content.scrollTop = view === 'ask' && conversation.length ? content.scrollHeight : 0;
    phone.querySelector('[data-fp-brand]').textContent = t.brand;
    select.value = lang;
    dock.lang = lang;
    dock.hidden = false;
    dock.innerHTML = [['library', 'library', t.files], ['ask', 'chat', t.ask]].map(([key, glyph, text]) =>
      '<button type="button" data-fp-view="' + key + '"' +
      ((key === 'ask') === (view === 'ask') ? ' aria-current="page"' : '') + '>' + icon(glyph) + text + '</button>').join('');
    tour.hidden = false;
    updateTour();
    if (view === 'ask') content.setAttribute('aria-live', running ? 'off' : 'polite');
    else content.removeAttribute('aria-live');
    if (focusPage) {
      const target = view === 'ask' ? picker : content.querySelector('h3');
      target.focus({preventScroll: true});
    }
  }

  function updateTour() {
    tour.lang = lang;
    tour.textContent = running ? copy[lang].pause : copy[lang].replay;
  }
  function clearPress() {
    clearTimeout(timer);
    pressed?.classList.remove('fp-pressed');
    pressed = null;
  }
  function stopTour() {
    running = false;
    clearPress();
    updateTour();
  }
  function publishQuestion() {
    if (draft === '') return;
    conversation.push(Number(draft));
    draft = '';
  }
  function schedule() {
    clearPress();
    if (!running || !visible || document.hidden) return;
    const [selector, action, dwell] = steps[step];
    timer = setTimeout(() => {
      if (document.querySelector('dialog[open]')) { schedule(); return; }
      pressed = phone.querySelector(selector);
      if (content.contains(pressed)) {
        const amount = pressed.getBoundingClientRect().bottom - content.getBoundingClientRect().bottom;
        if (amount > 0) content.scrollTop += amount + 14;
      }
      pressed.classList.add('fp-pressed');
      timer = setTimeout(() => {
        clearPress();
        if (document.querySelector('dialog[open]')) { schedule(); return; }
        if (action === 'translate') lang = 'es';
        else if (action === 'choose') draft = '0';
        else if (action === 'send') publishQuestion();
        else view = action;
        step += 1;
        running = step < steps.length;
        render();
        schedule();
      }, 420);
    }, dwell);
  }
  function takeControl(event) {
    if (!tour.contains(event.target)) stopTour();
  }
  phone.addEventListener('focusin', takeControl);
  phone.addEventListener('pointerdown', takeControl);
  phone.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.type === 'submit') return;
    if (button === tour) {
      if (running) { stopTour(); return; }
      view = 'library'; lang = 'en'; conversation = []; draft = ''; step = 0; running = true;
      render(); schedule(); return;
    }
    stopTour();
    view = button === invitation ? 'ask' : button.dataset.fpView;
    render(true);
  });
  picker.addEventListener('change', () => {
    stopTour();
    draft = picker.value;
    send.disabled = draft === '';
  });
  composer.addEventListener('submit', event => {
    event.preventDefault();
    stopTour();
    publishQuestion();
    render(true);
  });
  select.addEventListener('change', () => { stopTour(); lang = select.value; render(); });
  motion.addEventListener('change', () => { if (motion.matches) stopTour(); });
  document.addEventListener('visibilitychange', schedule);
  render();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .38;
      if (visible) phone.classList.add('fp-arrived');
      schedule();
    }, {threshold: [0, .38]});
    observer.observe(phone);
  } else {
    visible = true;
    schedule();
  }
})();
