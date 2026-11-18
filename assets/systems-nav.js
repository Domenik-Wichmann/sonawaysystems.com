(() => {
 const menus=[...document.querySelectorAll('.systems-offer')];
 document.addEventListener('click',event=>menus.forEach(menu=>{if(!menu.contains(event.target))menu.open=false;}));
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const menu=menus.find(menu=>menu.open);
  if(menu){menu.open=false;menu.querySelector('summary').focus();}
 });
})();
