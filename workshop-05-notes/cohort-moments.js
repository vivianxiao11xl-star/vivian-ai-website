/* 原图链接提供无 JavaScript 回退；大图支持键盘与触摸。 */
(() => {
  const links = Array.from(document.querySelectorAll('.album-open'));
  const dialog = document.querySelector('.photo-dialog');
  if (!links.length || !dialog || typeof dialog.showModal !== 'function') return;
  const large = dialog.querySelector('.photo-large');
  const count = dialog.querySelector('.photo-count');
  const caption = dialog.querySelector('.photo-caption');
  const original = dialog.querySelector('.photo-original');
  let current = 0;
  let origin = null;
  function show(index) {
    current = (index + links.length) % links.length;
    const link = links[current];
    const thumbnail = link.querySelector('img');
    large.src = link.href;
    large.alt = thumbnail.alt;
    caption.textContent = thumbnail.alt;
    count.textContent = `${current + 1} / ${links.length}`;
    original.href = link.href;
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    origin = link;
    show(index);
    dialog.showModal();
    document.body.classList.add('album-viewing');
  }));
  dialog.querySelector('.photo-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.photo-prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.photo-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('album-viewing');
    if (origin) origin.focus({preventScroll:true});
  });
  let touch = null;
  const stage = dialog.querySelector('.photo-stage');
  stage.addEventListener('touchstart', event => {
    touch = event.touches.length === 1 ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;
  }, {passive:true});
  stage.addEventListener('touchend', event => {
    if (!touch || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
    touch = null;
  }, {passive:true});
})();
