// Keyboard shortcut: forward to the page. Pages without the content script (chrome://, Web Store) just ignore it.
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'toggle') chrome.tabs.sendMessage(tab.id, 'toggle').catch(() => {});
});
