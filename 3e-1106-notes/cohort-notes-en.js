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
    status.textContent = 'Copied. Fill in your own information before giving this prompt to AI.';
  } catch (_) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(box.querySelector('code'));
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Prompt selected. Please copy it manually.';
  }
});

/* Same zoom interaction as the approved Cohort 06 notes, with focus restore. */
(()=>{const d=document.querySelector('.note-slide-dialog');if(!d)return;const im=d.querySelector('img'),cap=d.querySelector('p');let opener;
document.querySelectorAll('.lesson-slide a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();opener=a;const s=a.querySelector('img');im.src=s.src;im.alt=s.alt;cap.textContent=a.closest('figure').querySelector('figcaption').textContent;d.showModal()}));
d.querySelector('button').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>opener?.focus());})();
