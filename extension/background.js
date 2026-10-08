// Toolbar icon and keyboard shortcut: forward to the page. Pages without the content script (chrome://, Web Store) just ignore it.
const toggle = tab => chrome.tabs.sendMessage(tab.id, 'toggle').catch(() => {});
chrome.action.onClicked.addListener(toggle);
chrome.commands.onCommand.addListener((command, tab) => { if (command === 'toggle') toggle(tab); });
