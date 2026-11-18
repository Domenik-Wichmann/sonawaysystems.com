const offerMenu = document.querySelector('.offer-menu');
if (offerMenu) {
  document.addEventListener('click', (event) => {
    if (!offerMenu.contains(event.target)) offerMenu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !offerMenu.open) return;
    offerMenu.open = false;
    offerMenu.querySelector('summary').focus();
    event.stopImmediatePropagation();
  }, { capture: true });
}
