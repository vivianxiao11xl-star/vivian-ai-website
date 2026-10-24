/* User-initiated local copy only; no network or analytics. */
document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy-note]');
  if (!button) return;
  const box = button.closest('.note-prompt');
  const value = box.querySelector('code').textContent;
  const status = box.querySelector('[role="status"]');
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
    await navigator.clipboard.writeText(value);
    status.textContent = '已复制。请先补入自己的真实信息，再交给 AI。';
  } catch (_) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(box.querySelector('code'));
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = '已选中提示词，请手动复制。';
  }
});
