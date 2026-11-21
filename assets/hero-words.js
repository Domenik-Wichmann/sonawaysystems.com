(() => {
  const word = document.querySelector('[data-rotate-word]');
  if (!word) return;

  const words = ['knowledge.', 'SOPs.', 'playbook.', 'processes.'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let position = 0;
  let timer;

  function rotate() {
    position = (position + 1) % words.length;
    word.textContent = words[position];
    if (!reducedMotion.matches) {
      word.animate([{opacity: 0, transform: 'translateY(.1em)'}, {opacity: 1, transform: 'none'}], {duration: 270});
    }
  }

  function schedule() {
    clearInterval(timer);
    if (!document.hidden) timer = setInterval(rotate, 2400);
  }
  document.addEventListener('visibilitychange', schedule);
  schedule();
})();
