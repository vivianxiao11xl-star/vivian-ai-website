'use strict';
document.querySelectorAll('[data-lock-site]').forEach(function (button) {
  button.addEventListener('click', function () {
    localStorage.removeItem('staticrypt_expiration');
    localStorage.removeItem('staticrypt_passphrase');
    location.href = 'index.html';
  });
});
