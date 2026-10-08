// Floating toggle button, bottom right by default. Drag to move; position is shared by all sites, on/off is per site.
const site = location.hostname;
const button = document.createElement('button');
button.textContent = '\u25D0';
button.title = 'Media Darkener (Alt+Shift+D)';
button.setAttribute('aria-label', 'Toggle Media Darkener');
button.style.cssText = 'all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647;touch-action:none;width:36px;height:36px;' +
  'border-radius:50%;color:#fff;font:20px/36px system-ui,sans-serif;text-align:center;cursor:pointer;opacity:.5;box-shadow:0 1px 4px #0008';
button.onmouseenter = () => { button.style.opacity = 1; };
button.onmouseleave = () => { button.style.opacity = .5; };

const isOn = () => !!document.getElementById('__inv');
const paint = () => { button.style.background = isOn() ? '#2e7d5b' : '#222'; };

function toggle() {
  invert();
  paint();
  chrome.storage.local.set({[site]: isOn()});
}

const place = (right, bottom) => {
  button.style.right = Math.min(Math.max(right, 0), innerWidth - 36) + 'px';
  button.style.bottom = Math.min(Math.max(bottom, 0), innerHeight - 36) + 'px';
};

let drag = null, dragged = false;
button.onpointerdown = e => {
  drag = {x: e.clientX, y: e.clientY, right: parseFloat(button.style.right), bottom: parseFloat(button.style.bottom)};
  dragged = false;
  button.setPointerCapture(e.pointerId);
};
button.onpointermove = e => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) dragged = true;
  if (dragged) place(drag.right - dx, drag.bottom - dy);
};
button.onpointerup = () => {
  if (dragged) chrome.storage.local.set({__position: [parseFloat(button.style.right), parseFloat(button.style.bottom)]});
  drag = null;
};
button.onclick = () => { if (!dragged) toggle(); dragged = false; };

chrome.runtime.onMessage.addListener(message => { if (message === 'toggle') toggle(); });
chrome.storage.local.get([site, '__position']).then(saved => {
  if (saved.__position) place(...saved.__position);
  if (saved[site] && !isOn()) invert();
  paint();
});
document.body.append(button);
