// One short cycle keeps the headline readable after the introduction.
(() => {
  const word = document.querySelector('[data-rotate-word]');
  if (!word || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words = ['its processes.', 'its SOPs.', 'its playbook.', 'its knowledge.'];
  word.closest('h1').setAttribute('aria-label', 'Your business is its knowledge, processes, SOPs and playbook.');
  const pause = document.createElement('button');
  pause.className = 'word-control';
  pause.type = 'button';
  let position = 0;
  let timer;
  function setPlaying(playing) {
    clearInterval(timer);
    pause.dataset.playing = String(playing);
    pause.setAttribute('aria-label', playing ? 'Pause rotating words' : 'Play rotating words');
    if (!playing) return;
    timer = setInterval(() => {
      word.textContent = words[position];
      word.animate([{opacity: 0, transform: 'translateY(.12em)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 320});
      position = (position + 1) % words.length;
      if (position === 0) setPlaying(false);
    }, 2600);
  }
  // Keep the control outside the heading's accessible name.
  word.closest('h1').after(pause);
  pause.addEventListener('click', () => setPlaying(pause.dataset.playing === 'false'));
  setPlaying(true);
})();
