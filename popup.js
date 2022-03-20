document.addEventListener('DOMContentLoaded', () => {
  let popupWindow;

  const browser = chrome;

  chrome.storage.sync.get(null, (items) => {
    let width = 400;

    if (typeof items.windowWidth === 'number') {
      width = items.windowWidth;
    }

    browser.windows.getCurrent((win) => {
      browser.tabs.query({ windowId: win.id, active: true }, (tabs) => {
        const tab = tabs[0];

        chrome.windows.create({
          url: `${browser.runtime.getURL('app.html')}?${win.id}`,
          type: 'popup',
          focused: true,
          width,
          height: (win.height - 10),
          left: window.screenLeft,
          top: (window.screenTop - 70),
        });

        window.close(); // close the Chrome extension pop-up
      });
    });
  });
}, false);
