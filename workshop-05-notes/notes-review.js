/* Same-origin encrypted pages share Staticrypt's derived passphrase, never a plaintext password. */
document.querySelectorAll('[data-lock-site]').forEach(button=>button.addEventListener('click',()=>{localStorage.removeItem('staticrypt_expiration');localStorage.removeItem('staticrypt_passphrase');sessionStorage.removeItem('welcome0913Shown');location.href='index.html';}));
