import './style.scss';
const closeBtns = document.getElementsByClassName('close-btn')!;
for(let i=0; i<closeBtns.length; i++) {
  const btn = closeBtns.item(i);
  if (btn) {
    btn.addEventListener('click', () => {
      window.__NAMEPASCAL__API.closeWindow();
    });
  }
}