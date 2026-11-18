(() => {
  const scenes = [...document.querySelectorAll('.photo-scene')];
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const activate = (scene) => scenes.forEach((item) => {
    const current = item === scene;
    item.querySelector('button').setAttribute('aria-expanded', String(current));
    item.querySelector('.photo-scene-copy').hidden = !current;
  });
  scenes.forEach((scene) => {
    scene.querySelector('button').addEventListener('click', () => activate(scene));
    scene.addEventListener('pointerenter', () => {
      if (finePointer.matches) activate(scene);
    });
  });
  const rail = document.querySelector('.chapter-rail');
  if (!rail) return;
  const links = [...rail.querySelectorAll('a')];
  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
  function update() {
    let current = 0;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= window.innerHeight * .44) current = index;
    });
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
