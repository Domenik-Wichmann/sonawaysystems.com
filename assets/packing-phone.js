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
      threads: {
        pack: ["How do I pack this order?", "Match the produce and carton count to the order.", "Check the customer label before sealing."],
        mismatch: ["What if the label doesn’t match?", "Move the carton to the hold rack.", "Tell the shift lead which detail differs."],
        place: ["Where should I put the label?", "Choose one flat face of the carton.", "Press the entire label flat, clear of corners and seams."],
        seal: ["What do I check before sealing?", "Compare the customer name and order number with the order sheet.", "Check that the label lies flat."],
        crease: ["What if the label is creased?", "Keep the carton off the dispatch pallet.", "Ask the shift lead to check the replacement label."],
        hold: ["Where does a held carton go?", "Set it on the hold rack, separate from cleared orders.", "Leave it there until the shift lead releases it."],
        release: ["Who releases a held carton?", "The shift lead checks the corrected label against the order.", "Only then can the carton go to dispatch."],
        dispatch: ["Where does the checked carton go?", "Seal the checked carton.", "Move it to the dispatch pallet for that order."],
      },
      conversationLabels: ["Related questions", "New topic", "Choose a follow-up", "Start a new topic", "Hands press a shipping label onto one flat side of a carton."],
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
      threads: {
        pack: ["¿Cómo empaco este pedido?", "Comprueba el producto y el número de cajas del pedido.", "Revisa la etiqueta del cliente antes de cerrar la caja."],
        mismatch: ["¿Y si la etiqueta no coincide?", "Lleva la caja al estante de retención.", "Dile al jefe de turno qué dato no coincide."],
        place: ["¿Dónde coloco la etiqueta?", "Elige una cara plana de la caja.", "Alisa toda la etiqueta, lejos de las esquinas y las uniones."],
        seal: ["¿Qué reviso antes de cerrar la caja?", "Compara el nombre del cliente y el número de pedido con la orden.", "Comprueba que la etiqueta esté lisa."],
        crease: ["¿Y si la etiqueta está arrugada?", "Deja la caja fuera del palé de despacho.", "Pide al jefe de turno que revise la nueva etiqueta."],
        hold: ["¿Dónde dejo una caja retenida?", "Ponla en el estante de retención, separada de los pedidos listos.", "Déjala allí hasta que el jefe de turno la libere."],
        release: ["¿Quién libera una caja retenida?", "El jefe de turno compara la etiqueta corregida con la orden.", "Solo entonces puede pasar la caja a despacho."],
        dispatch: ["¿Dónde va la caja revisada?", "Cierra la caja revisada.", "Llévala al palé de despacho de ese pedido."],
      },
      conversationLabels: ["Preguntas relacionadas", "Otro tema", "Elige una pregunta relacionada", "Empieza otro tema", "Dos manos presionan una etiqueta de envío sobre una cara plana de la caja."],
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
      threads: {
        pack: ["Wie verpacke ich diesen Auftrag?", "Ware und Anzahl der Kartons mit dem Auftrag abgleichen.", "Vor dem Verschließen das Kundenetikett prüfen."],
        mismatch: ["Was tun, wenn das Etikett falsch ist?", "Den Karton ins Sperrlager stellen.", "Der Schichtleitung sagen, welche Angabe abweicht."],
        place: ["Wo bringe ich das Etikett an?", "Eine ebene Fläche am Karton wählen.", "Das Etikett glatt aufdrücken und Kanten und Nähte frei lassen."],
        seal: ["Was prüfe ich vor dem Verschließen?", "Kundenname und Auftragsnummer mit dem Auftrag abgleichen.", "Prüfen, ob das Etikett glatt anliegt."],
        crease: ["Was tun, wenn das Etikett zerknittert ist?", "Den Karton von der Versandpalette fernhalten.", "Die Schichtleitung das Ersatzetikett prüfen lassen."],
        hold: ["Wohin kommt ein gesperrter Karton?", "Den Karton getrennt von freigegebener Ware ins Sperrlager stellen.", "Dort bleibt er bis zur Freigabe durch die Schichtleitung."],
        release: ["Wer gibt gesperrte Kartons frei?", "Die Schichtleitung gleicht das korrigierte Etikett mit dem Auftrag ab.", "Erst danach darf der Karton in den Versand."],
        dispatch: ["Wohin kommt der geprüfte Karton?", "Den geprüften Karton verschließen.", "Auf die Versandpalette für diesen Auftrag stellen."],
      },
      conversationLabels: ["Passende Folgefragen", "Neues Thema", "Folgefrage wählen", "Neues Thema wählen", "Zwei Hände drücken ein Versandetikett auf eine flache Seite des Kartons."],
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
      threads: {
        pack: ["这份订单怎么装箱？", "按订单核对果蔬品种和箱数。", "封箱前检查客户标签。"],
        mismatch: ["标签和订单对不上怎么办？", "把箱子放到待处理货架上。", "告诉班组长哪项信息不符。"],
        place: ["标签应该贴在哪里？", "选箱子上平整的一面。", "把整张标签压平，避开棱角和接缝。"],
        seal: ["封箱前要核对什么？", "核对客户名称和订单号是否与订单一致。", "确认标签贴得平整。"],
        crease: ["标签起皱了怎么办？", "先别把箱子放上发货托盘。", "请班组长核对更换后的标签。"],
        hold: ["待处理的箱子放在哪里？", "放到待处理货架上，与已放行的订单分开。", "班组长放行后才能移走。"],
        release: ["谁能放行待处理的箱子？", "班组长按订单核对更正后的标签。", "核对无误后，箱子才能发货。"],
        dispatch: ["核对好的箱子放在哪里？", "将核对无误的箱子封好。", "放到该订单的发货托盘上。"],
      },
      conversationLabels: ["相关问题", "新话题", "选择后续问题", "选择新话题", "双手把运输标签压在纸箱平整的一面。"],
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
    ['[data-fp-picker]', 'pick-pack', 1200],
    ['[data-fp-send]', 'send', 1100],
    ['[data-fp-picker]', 'pick-place', 3600],
    ['[data-fp-send]', 'send', 1000]
  ];
  const docs = ['pack', 'label', 'meeting'];
  const starters = ['pack', 'mismatch', 'place'];
  const paths = {
    pack: {source: 'pack', next: ['place', 'seal']},
    place: {source: 'label', next: ['crease', 'seal']},
    seal: {source: 'label', next: ['mismatch', 'dispatch']},
    crease: {source: 'label', next: ['hold', 'release']},
    mismatch: {source: 'label', next: ['hold', 'release']},
    hold: {source: 'meeting', next: ['release']},
    release: {source: 'meeting', next: []},
    dispatch: {source: 'pack', next: []}
  };
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
  function reply(key) {
    const t = copy[lang];
    const [question, ...instructions] = t.threads[key];
    // Reference photograph: Liza Summer, Pexels 6348093.
    const image = key === 'place' ? '<img class="fp-reference" src="assets/carton-label-example.webp" width="640" height="320" alt="' + t.conversationLabels[4] + '">' : '';
    return '<div class="fp-turn"><p class="fp-bubble">' + question + '</p><div class="fp-answer">' + image +
      '<ol>' + instructions.map(line => '<li>' + line + '</li>').join('') + '</ol></div>' +
      '<p class="fp-eyebrow">' + t.source + '</p>' + documentButton(paths[key].source) + '</div>';
  }
  function fillPicker() {
    const t = copy[lang];
    const last = conversation.at(-1);
    const followups = last ? paths[last].next : [];
    const [related, newTopic, chooseNext, startOver] = t.conversationLabels;
    const hint = last ? (followups.length ? chooseNext : startOver) : chatLabels[lang][0];
    const options = keys => keys.map(key => '<option value="' + key + '">' + t.threads[key][0] + '</option>').join('');
    const roots = starters.filter(key => !followups.includes(key) && key !== last);
    picker.setAttribute('aria-label', hint);
    picker.innerHTML = '<option value="" disabled>' + hint + '</option>' +
      (followups.length ? '<optgroup label="' + related + '">' + options(followups) + '</optgroup>' : '') +
      '<optgroup label="' + newTopic + '">' + options(roots) + '</optgroup>';
    picker.value = draft;
  }
  function render(focusPage = false) {
    const t = copy[lang];
    let body;
    if (view === 'library') {
      body = heading(t.desk, t.library) + '<p>' + t.intro + '</p>' + docs.map(documentButton).join('');
    } else if (view === 'ask') {
      body = heading(t.brand, t.askTitle);
      body += conversation.length ? conversation.map(reply).join('') : '<p class="fp-answer">' + chatLabels[lang][2] + '</p>';
    } else {
      const i = docs.indexOf(view);
      body = heading(t.kinds[i], t.titles[i]);
      if (view === 'pack') {
        body += '<ol>' + t.pack.map(step => '<li>' + step + '</li>').join('') + '</ol><p class="fp-eyebrow">' + t.follow + '</p>' + documentButton('label');
      } else if (view === 'label') {
        body += '<p>' + t.label + '</p><p>' + t.threads.place.slice(1).join(' ') + '</p><p>' + t.threads.crease.slice(1).join(' ') + '</p><p class="fp-eyebrow">' + t.notes + '</p>' + documentButton('meeting');
      } else {
        body += '<p>' + t.meeting + '</p><button type="button" class="fp-source" data-fp-view="ask">' + icon('chat') + t.askTitle + '</button>';
      }
    }
    content.lang = lang;
    content.innerHTML = body;
    composer.hidden = view !== 'ask';
    composer.lang = lang;
    fillPicker();
    send.disabled = draft === '';
    send.setAttribute('aria-label', chatLabels[lang][1]);
    const latest = content.querySelector('.fp-turn:last-child');
    content.scrollTop = latest ? latest.offsetTop - content.clientTop : 0;
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
    conversation.push(draft);
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
        else if (action.startsWith('pick-')) draft = action.slice(5);
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
