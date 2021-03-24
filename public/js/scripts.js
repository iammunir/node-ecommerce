const burger = document.querySelector('#burger');
const menu = document.querySelector('#menu');
const flashMessage = document.querySelector('#flash-message');
const flashMessageBtn = document.querySelector('#flash-message-btn');

burger.addEventListener('click', (e) => {
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
  } else {
    menu.classList.add('hidden');
  }
});

if (flashMessage) {
  flashMessageBtn.addEventListener('click', (e) => {
    flashMessage.style.display = 'none';
  });
}