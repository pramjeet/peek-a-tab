function changeActiveWindowTitle(oldWinId, newWinId) {
  oldWin = document.getElementById(oldWinId);
  oldWin.textContent = "Window " + oldWin.dataset.nr;

  newWin = document.getElementById(newWinId);
  newWin.textContent = "Window " + newWin.dataset.nr + " (current)";
}

function getActiveTabIndex() {
  var tabIndex;
  var tabEls = document.getElementsByClassName("tab");

  for (tabIndex = 0; tabIndex < tabEls.length; tabIndex++)
    if (activeTabElement.id == tabEls[tabIndex].id) return tabIndex;
}

function makeTabIndexActive(tabIndex) {
  var tabElement = document.getElementsByClassName("tab")[tabIndex];
  var tabId = tabElement.id;
  chrome.tabs.get(+tabId, function (tab) {
    changeActiveTab(tab);
  });
}

/**
 * make the tab active in browser, and add class 'active' to the corresponding element in the list and focuses on it
 * @param {*} tab
 */
function changeActiveTab(tab) {
  //if tab is in different window than change focus to that that window first
  if (tab.windowId != activeWindowId) {
    closeOnFocusChange = false;
    changeActiveWindowTitle(activeWindowId, tab.windowId);
    chrome.windows.update(tab.windowId, { focused: true }, function () {
      chrome.windows.update(peekATabWindowId, { focused: true }, function () {
        closeOnFocusChange = true;
      });
    });
  }

  chrome.tabs.update(tab.id, { active: true });
  activeWindowId = tab.windowId;

  if (activeTabElement) activeTabElement.classList.remove("active");

  activeTabElement = document.getElementById("tab-" + tab.id);

  activeTabElement.classList.add("active");
  if (document.activeElement != searchInput) {
    activeTabElement.focus();
  }
}

function hoveredOnTab(tab) {
  if (mouseBehavior == "hover") {
    changeActiveTab(tab);
  }
}

function clickedOnTab(tab) {
  if (mouseBehavior == "click") {
    changeActiveTab(tab);
  } else {
    changeActiveTabAndCloseWindow(tab);
  }
}

function doubleClickedOnTab(tab) {
  changeActiveTabAndCloseWindow(tab);
}

/**
 * Changes to the active tab and closes extention window
 * @param {*} tab
 */

function changeActiveTabAndCloseWindow(tab) {
  changeActiveTab(tab);
  window.close();
}

function makeNextTabActive() {
  var tabIndex = getActiveTabIndex();
  var tabEls = document.getElementsByClassName("tab");

  if (tabIndex < tabEls.length - 1) {
    makeTabIndexActive(tabIndex + 1);
    return;
  }
  makeTabIndexActive(0);
}

function makePreviousTabActive() {
  var tabIndex = getActiveTabIndex();
  var tabEls = document.getElementsByClassName("tab");
  if (tabIndex > 0) {
    makeTabIndexActive(tabIndex - 1);
    return;
  }

  makeTabIndexActive(tabEls.length - 1);
}

/**
 * removes the dom element and the corresponding tab from the browser
 * @param tabElement - DOM element from the list containing data-id attributes
 */
function removeTabElement(tabElement) {
  var tabId = tabElement.dataset.id;

  var tabEls = document.getElementsByClassName("tab");
  if (tabElement == activeTabElement) {
    for (var i = 0; i < tabEls.length; i++) {
      if (tabId == tabEls[i].id) {
        if (i == tabEls.length - 1) {
          makePreviousTabActive();
        } else if (tabEls.length > 1) {
          makeNextTabActive();
        }
        break;
      }
    }
  } else {
    activeTabElement.focus();
  }

  chrome.tabs.remove(+tabId);
  tabElement.remove();

  //if only one tab was present before closing this tab, close peek-a-tab window too
  if (tabEls.length == 1) {
    window.close();
  }
}

/**
 * kills the tab
 * @param tabElement - DOM element from the list containing data-id attributes
 */
function discardOrReviveTab(tab, tabEl) {
  if (getDomainNameFromUrl(tab.url) === chrome.runtime.id) {
    const params = new URL(tab.url).searchParams;
    tabUrl = params.get("url");
    chrome.tabs.update(tab.id, {
      url: tabUrl,
    });
  } else {
    const tabUrl = encodeURIComponent(tab.url);
    const tabTitle = encodeURIComponent(tab.title);
    const favIconUrl = encodeURIComponent(tab.favIconUrl);

    chrome.tabs.update(tab.id, {
      url:
        "discarded.html?title=" +
        tabTitle +
        "&url=" +
        tabUrl +
        "&favIconUrl=" +
        favIconUrl,
    });
  }
}

/**
 *
 * @param {*} tab
 * @param {*} tabEl
 */

function renderTabElement(tab, tabEl) {
  tabEl.innerHTML = "";
  tabEl.classList.remove("killed");

  let tabUrl = tab.url;
  let tabDomain = getDomainNameFromUrl(tabUrl);

  let tabTitle = tab.title;
  let tabFaviconUrl = tab.favIconUrl || "";

  let isTabKilled = false;

  // if tab is 'killed' by peek-a-tab
  if (tabDomain === chrome.runtime.id) {
    const params = new URL(tabUrl).searchParams;
    tabUrl = params.get("url");
    tabTitle = params.get("title");
    tabFaviconUrl = params.get("favIconUrl");
    isTabKilled = true;
  }

  var tabImgEl = document.createElement("img");
  tabImgEl.classList.add("icon");
  tabImgEl.src = tabFaviconUrl;

  var tabTextsEl = document.createElement("div");

  var tabTitleEl = document.createElement("p");
  tabTitleEl.classList.add("title");
  tabTitleEl.innerHTML = highlight(tabTitle, searchInput.value);

  var tabUrlEl = document.createElement("p");
  tabUrlEl.classList.add("url");
  tabUrlEl.innerHTML = highlight(
    getDomainNameFromUrl(tabUrl),
    searchInput.value
  );

  tabTextsEl.appendChild(tabTitleEl);
  tabTextsEl.appendChild(tabUrlEl);

  var tabCloseBtnEl = document.createElement("img");
  tabCloseBtnEl.title = "close";
  tabCloseBtnEl.classList.add("close-btn");
  tabCloseBtnEl.src = "images/close_icon.png";

  var tabKillReviveBtnEl = document.createElement("img");
  tabKillReviveBtnEl.classList.add("kill-revive-btn");
  if (isTabKilled) {
    tabKillReviveBtnEl.title = "revive";
    tabKillReviveBtnEl.src = "images/close_icon.png";
    tabKillReviveBtnEl.classList.add("revive-btn");
  } else {
    tabKillReviveBtnEl.title = "kill";
    tabKillReviveBtnEl.src = "images/close_icon.png";
    tabKillReviveBtnEl.classList.add("kill-btn");
  }

  var tabBtnsEl = document.createElement("div");
  tabBtnsEl.classList.add("btns");
  tabBtnsEl.appendChild(tabKillReviveBtnEl);
  tabBtnsEl.appendChild(tabCloseBtnEl);

  if (tab.audible) {
    var tabAudioEl = document.createElement("img");
    tabAudioEl.title = "audible";
    tabAudioEl.classList.add("speaker-icon");
    tabAudioEl.src = "images/close_icon.png";
  }

  tabKillReviveBtnEl.addEventListener(
    "click",
    (function (tabElement) {
      return function (e) {
        e.stopPropagation();
        discardOrReviveTab(tab, tabEl);
      };
    })(tabEl)
  );

  tabCloseBtnEl.addEventListener(
    "click",
    (function (tabElement) {
      return function (e) {
        e.stopPropagation();
        removeTabElement(tabEl);
      };
    })(tabEl)
  );

  tabEl.addEventListener(
    "mouseover",
    (function (tab, tabElement) {
      return function () {
        hoveredOnTab(tab);
      };
    })(tab)
  );

  tabEl.addEventListener(
    "click",
    (function (tab, tabElement) {
      return function () {
        clickedOnTab(tab);
      };
    })(tab)
  );

  tabEl.addEventListener(
    "dblclick",
    (function (tab, tabElement) {
      return function () {
        doubleClickedOnTab(tab);
      };
    })(tab)
  );

  tabEl.appendChild(tabImgEl);
  tabEl.appendChild(tabTextsEl);
  tabEl.appendChild(tabBtnsEl);

  if (isTabKilled) {
    tabEl.classList.add("killed");
  }
}
