// Floating toggle button next to the scrollbar. On/off is remembered per site.
const site = location.hostname;
const button = document.createElement('button');
button.textContent = '\u25D0';
button.title = 'Media Darkener (Alt+Shift+D)';
button.setAttribute('aria-label', 'Toggle Media Darkener');
button.style.cssText = 'all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647;width:36px;height:36px;' +
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

button.onclick = toggle;
chrome.runtime.onMessage.addListener(message => { if (message === 'toggle') toggle(); });
chrome.storage.local.get(site).then(saved => {
  if (saved[site] && !isOn()) invert();
  paint();
});
document.body.append(button);
