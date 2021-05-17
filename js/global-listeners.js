//get peek-a-tab window id and listener for focus change
chrome.windows.getCurrent({}, function (peekATabWindow) {});

/**
 * Listens for focus change of windows,
 * if peek-a-tab loses focus and it is not shifting to another window,
 * then close peek-a-tab window
 */
chrome.windows.onFocusChanged.addListener(function (newWindowId) {
  if (
    globals.closeOnFocusChange &&
    newWindowId != globals.peekATabWindowId &&
    newWindowId != chrome.windows.WINDOW_ID_NONE
  ) {
    // window.close();
  }
});

/**
 * Saves width changes in storage
 */
window.addEventListener("resize", function (event) {
  var widthToStore = document.documentElement.clientWidth;
  if (widthToStore <= 300) {
    widthToStore = 300;
  }

  chromeStorage.setWindowWidth(widthToStore);
});

/**
 *
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  tabFunctions.renderTab(tab);
});

/**
 *
 */

// document.addEventListener("click", function () {
//   if (mouseBehaviorOptionsContainer.style.display != "none") {
//     mouseBehaviorOptionsContainer.style.display = "none";
//   }
// });
