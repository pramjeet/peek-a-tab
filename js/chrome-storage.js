const chromeStorage = {
  setWindowWidth: (newWidth) => {
    chrome.storage.sync.set({
      windowWidth: newWidth,
    });
  },

  getWindowWidth: (width) => {
    chrome.storage.sync.set({
      windowWidth: widthToStore,
    });
  },

  setMouseBehavior: (newMouseBehavior) => {
    chrome.storage.sync.set({
      mouseBehavior: newMouseBehavior,
    });
  },

  getMouseBehavior: (newMouseBehavior) => {
    chrome.storage.sync.set({
      mouseBehavior: newMouseBehavior,
    });
  },
};
