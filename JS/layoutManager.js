function applyLayout() {
  const w = window.innerWidth;

  const win1 = document.querySelector('.window1');
  const win2 = document.querySelector('.window2');
  const win3 = document.querySelector('.Window3');

  if (w >= 1200) {
    // desktop grande
    set(win1, 80, 120, 600);
    set(win2, 240, 820, 450);
    set(win3, 80, 600, 420);
  }
  else if (w >= 768) {
    // tablet
    stack([win1, win2, win3], false);
  }
  else {
    // móvil
    stack([win1, win2, win3], true);
  }
}

function set(el, top, left, width) {
  if (!el) return;
  el.style.position = 'absolute';
  el.style.top = top + 'px';
  el.style.left = left + 'px';
  el.style.width = width + 'px';
}

function stack(windows, fullWidth) {
  windows.forEach(win => {
    if (!win) return;
    win.style.position = 'relative';
    win.style.margin = '20px auto';
    win.style.top = 'auto';
    win.style.left = 'auto';
    win.style.width = fullWidth ? '92%' : '80%';
  });
}

window.addEventListener('resize', applyLayout);
window.addEventListener('load', applyLayout);