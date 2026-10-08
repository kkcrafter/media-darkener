// Toolbar icon and keyboard shortcut: forward to the page. Pages without the content script (chrome://, Web Store) just ignore it.
const toggle = tab => chrome.tabs.sendMessage(tab.id, 'toggle').catch(() => {});
chrome.action.onClicked.addListener(toggle);
chrome.commands.onCommand.addListener((command, tab) => { if (command === 'toggle') toggle(tab); });

// Dev auto-reload: when loaded unpacked (Load unpacked), reload the extension within ~30s of a file change on disk.
// Store installs are not 'development', so this does nothing there. Open tabs still need a refresh to get the new code.
const watched = ['manifest.json', 'background.js', 'content.js', 'media-darkener.js'];
chrome.runtime.onInstalled.addListener(() => chrome.management.getSelf(self => {
  if (self.installType === 'development') chrome.alarms.create('dev-reload', {periodInMinutes: 0.5});
}));
chrome.alarms.onAlarm.addListener(async ({name}) => {
  if (name !== 'dev-reload') return;
  const files = await Promise.all(watched.map(f => fetch(f, {cache: 'no-store'}).then(r => r.text())));
  const snapshot = files.join('\n');
  const {devSnapshot} = await chrome.storage.session.get('devSnapshot');
  if (devSnapshot && devSnapshot !== snapshot) chrome.runtime.reload();
  else chrome.storage.session.set({devSnapshot: snapshot});
});
