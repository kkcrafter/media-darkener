// Floating toggle button, bottom right by default. Drag to move; position is shared by all sites, on/off is per site.
const isOn = () => !!document.getElementById('__inv');

if (window === top) {
  const site = location.hostname;
  const button = document.createElement('button');
  button.textContent = '◐';
  button.title = 'Media Darkener (Alt+Shift+D)';
  button.setAttribute('aria-label', 'Toggle Media Darkener');
  button.style.cssText = 'all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647;touch-action:none;width:36px;height:36px;' +
    'border-radius:50%;color:#fff;font:20px/36px system-ui,sans-serif;text-align:center;cursor:pointer;opacity:.5;box-shadow:0 1px 4px #0008';
  button.onmouseenter = () => { button.style.opacity = 1; };
  button.onmouseleave = () => { button.style.opacity = .5; };

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
} else {
  // Cross-site frame (e.g. a Genially or YouTube embed): the parent's filter cannot reach in, so darken this
  // frame's own page and follow the top page's on/off state. Same-site frames are covered by the parent.
  const origins = location.ancestorOrigins;
  const topOrigin = origins && origins[origins.length - 1];
  if (topOrigin && topOrigin !== location.origin) {
    const site = new URL(topOrigin).hostname;
    const follow = on => { if (!!on !== isOn()) invert('html'); };
    chrome.storage.local.get(site).then(saved => follow(saved[site]));
    chrome.storage.onChanged.addListener(changes => { if (site in changes) follow(changes[site].newValue); });
  }
}
