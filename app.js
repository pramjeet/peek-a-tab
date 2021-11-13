/**
 * Created by fudongdong on 2021-11-13
 */

document.addEventListener("DOMContentLoaded", function() {
  var activeWindowId = window.location.search.substr(1);
  var peekATabWindowId = null;
  var closeOnFocusChange = true;

  var activeTabElement = null;

  var mouseBehavior = "click"; //click, hover or single-click

  var tabsListEl = document.getElementById("tabs-list");
  var searchInput = document.getElementById("search-input");

  // searchInput.focus()
  searchInput.addEventListener("input", function() {
    populateTabs();
  });
  //save width changes
  window.addEventListener("resize", function(event) {
    var widthToStore = document.documentElement.clientWidth;
    if (widthToStore <= 300) {
      widthToStore = 300;
    }

    chrome.storage.sync.set({
      windowWidth: widthToStore
    });
  });

  function highlight(text, textToHighlight) {
    if (textToHighlight.length > 0) {
      var keywords = [getChineseKeyWordsByPinyin(text,textToHighlight)].concat(textToHighlight).filter(function(str){
        return str != null && str.trim() != '';
      });
      console.info('keywords is ',keywords)
      var regex = new RegExp(keywords.join('|'),'g')
      console.info('regex and text is ',regex,text)
      return text.toLowerCase()
        .replace(regex,function(kw){
          return "<span class='highlight'>" + kw + "</span>"
        })
    }
    else return text;
  }

  function getChineseKeyWordsByPinyin(text,pinyin){
    var chars = text.split('');
    var pinyins = chars.map(function(char){
      return pinyinUtil.getPinyin(char);
    })
    var keywords = [];
    for(var i = 0;i<pinyins.length;i++){
      var _char = chars[i];
      var _pinyin = pinyins[i]
      if(pinyin.indexOf(_pinyin) >= 0 && _char != _pinyin && _char.trim() != ''){
        keywords.push(_char);
      }
    }
    return keywords.join('');
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

  //get peek-a-tab window id and listener for focus change
  chrome.windows.getCurrent({}, function(peekATabWindow) {
    peekATabWindowId = peekATabWindow.id;
    chrome.windows.onFocusChanged.addListener(function(newWindowId) {
      if (
        closeOnFocusChange &&
        newWindowId != peekATabWindow.id &&
        newWindowId != chrome.windows.WINDOW_ID_NONE
      ) {
        window.close();
      }
    });
  });

  /**
   * make the tab active in browser, and add class 'active' to the corresponding element in the list and focuses on it
   * @param {*} tab
   */
  function changeActiveTab(tab) {
    //if tab is in different window than change focus to that that window first
    if (tab.windowId != activeWindowId) {
      closeOnFocusChange = false;
      changeActiveWindowTitle(activeWindowId, tab.windowId);
      chrome.windows.update(tab.windowId, { focused: true }, function() {
        chrome.windows.update(peekATabWindowId, { focused: true }, function() {
          closeOnFocusChange = true;
        });
      });
    }

    chrome.tabs.update(tab.id, { active: true });
    activeWindowId = tab.windowId;

    if (activeTabElement) activeTabElement.classList.remove("active");

    activeTabElement = document.getElementById(tab.id);

    activeTabElement.classList.add("active");
    if (document.activeElement != searchInput) {
      activeTabElement.focus();
    }
  }

  function changeActiveWindowTitle(oldWinId, newWinId) {
    oldWin = document.getElementById(oldWinId);
    oldWin.textContent = "窗口 " + oldWin.dataset.nr;

    newWin = document.getElementById(newWinId);
    newWin.textContent = "窗口 " + newWin.dataset.nr + " (当前窗口)";
  }

  function changeActiveTabAndCloseWindow(tab) {
    changeActiveTab(tab);
    window.close();
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

  function getActiveTabIndex() {
    var tabIndex;
    var tabEls = document.getElementsByClassName("tab");

    for (tabIndex = 0; tabIndex < tabEls.length; tabIndex++)
      if (activeTabElement.id == tabEls[tabIndex].id) return tabIndex;
  }

  function makeTabIndexActive(tabIndex) {
    var tabElement = document.getElementsByClassName("tab")[tabIndex];
    var tabId = tabElement.id;
    chrome.tabs.get(+tabId, function(tab) {
      changeActiveTab(tab);
    });
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
   * get all tabs from all windows and populates the list
   */
  function populateTabs() {
    chrome.windows.getAll({ populate: true, windowTypes: ["normal"] }, function(
      windows
    ) {
      //if no window present, close peek-a-tab
      if (windows.length == 0) {
        window.close();
      }

      tabsListEl.innerHTML = "";

      for (var i = 0; i < windows.length; i++) {
        var aWindow = windows[i];
        var isActiveWindowText =
          activeWindowId == aWindow.id ? " (当前窗口)" : "";
        var windowTitle = document.createElement("li");
        windowTitle.classList.add("window-text");
        windowTitle.id = aWindow.id;
        windowTitle.dataset.nr = i + 1;
        windowTitle.textContent = "窗口 " + (i + 1) + isActiveWindowText;
        tabsListEl.appendChild(windowTitle);

        for (var j = 0; j < aWindow.tabs.length; j++) {
          var tab = aWindow.tabs[j];

          if (
            searchInput.value.trim() != "" &&
            tab.title
              .toLowerCase()
              .indexOf(searchInput.value.trim().toLowerCase()) == -1 &&
            tab.url
              .toLowerCase()
              .indexOf(searchInput.value.trim().toLowerCase()) == -1 &&

            // chinese search
            pinyinUtil.getPinyin(tab.title)
              .replace(/\W/g,'')
              .indexOf(searchInput.value.trim().toLowerCase()) == -1
          ) {
            continue;
          }

          var tabEl = document.createElement("li");
          tabEl.classList.add("tab");
          tabEl.dataset.id = tab.id;
          tabEl.tabIndex = 0;
          tabEl.id = tab.id;

          var tabImgEl = document.createElement("img");
          tabImgEl.classList.add("icon");
          tabImgEl.src = tab.favIconUrl || "";

          var tabTitleEl = document.createElement("p");
          tabTitleEl.classList.add("title");
          tabTitleEl.innerHTML = highlight(tab.title, searchInput.value);

          var tabCrossEl = document.createElement("img");
          tabCrossEl.title = "close";
          tabCrossEl.classList.add("close-icon");
          tabCrossEl.src = "images/close_icon.png";

          tabCrossEl.addEventListener(
            "click",
            (function(tabElement) {
              return function(e) {
                e.stopPropagation();
                removeTabElement(tabElement);
              };
            })(tabEl)
          );

          tabEl.addEventListener(
            "mouseover",
            (function(tab, tabElement) {
              return function() {
                hoveredOnTab(tab);
              };
            })(tab)
          );

          tabEl.addEventListener(
            "click",
            (function(tab, tabElement) {
              return function() {
                clickedOnTab(tab);
              };
            })(tab)
          );

          tabEl.addEventListener(
            "dblclick",
            (function(tab, tabElement) {
              return function() {
                doubleClickedOnTab(tab);
              };
            })(tab)
          );

          tabEl.appendChild(tabImgEl);
          tabEl.appendChild(tabTitleEl);
          tabEl.appendChild(tabCrossEl);
          tabsListEl.appendChild(tabEl);

          if (aWindow.id == activeWindowId && tab.active) {
            changeActiveTab(tab);
          }
        }
      }
    });
  }

  //key bindings
  document.onkeydown = function(e) {
    switch (e.keyCode) {
      case 38: //up arrow
        e.preventDefault();
        searchInput.blur();
        makePreviousTabActive();
        break;
      case 40: //down arrow
        e.preventDefault();
        searchInput.blur();
        makeNextTabActive();
        break;
      case 13: //enter
        // open first tab when where is no actived tab
        var activeTab = document.querySelector("li.tab.active");
        if(!activeTab){
          var arrowDownEvent = new Event('keydown');
          arrowDownEvent.keyCode = 40;
          document.dispatchEvent(arrowDownEvent)
        }else{
          window.close()
        }
        break;
      case 27: //esc
        window.close();
        break;
      case 8: //backspace
      case 46: //delete
        if (document.activeElement != searchInput) {
          //search input is not focused
          removeTabElement(activeTabElement);
        }
        break;
      default:
        //if search input is not focused and space or any of alphanumeric keys is pressed
        if (document.activeElement != searchInput) {
          searchInput.focus();
          // searchInput.value = searchInput.value + String.fromCharCode(e.keyCode)
        }
        populateTabs();
    }
  };

  var mouseBehaviorImage = document.getElementById("mouse-behavior-image");

  function changeMouseBehaviorImage() {
    mouseBehaviorImage.src =
      "./images/cursor-pointer-" + mouseBehavior + ".png";
  }

  function saveMouseBehavior() {
    chrome.storage.sync.set({
      mouseBehavior: mouseBehavior
    });
  }

  //show hint to change mouse behavior
  chrome.storage.sync.get(null, function(items) {
    if (typeof items.mouseBehavior == "undefined") {
      saveMouseBehavior();
    } else {
      mouseBehavior = items.mouseBehavior;
    }

    changeMouseBehaviorImage();
  });

  var mouseBehaviorOptionsContainer = document.getElementById(
    "mouse-behavior-options-container"
  );

  var mouseBehaviorOptions = document.getElementsByClassName(
    "mouse-behavior-option"
  );

  for (var i = 0; i < mouseBehaviorOptions.length; i++) {
    mouseBehaviorOptions[i].addEventListener(
      "click",
      (function(mouseBehaviorOption) {
        return function() {
          mouseBehavior = mouseBehaviorOption.dataset.mouseBehavior;
          changeMouseBehaviorImage();
          saveMouseBehavior();
        };
      })(mouseBehaviorOptions[i])
    );
  }

  mouseBehaviorImage.addEventListener("click", function(e) {
    e.stopPropagation();

    if (mouseBehaviorOptionsContainer.style.display != "block") {
      mouseBehaviorOptionsContainer.style.display = "block";
    } else {
      mouseBehaviorOptionsContainer.style.display = "none";
    }
  });

  document.addEventListener("click", function() {
    if (mouseBehaviorOptionsContainer.style.display != "none") {
      mouseBehaviorOptionsContainer.style.display = "none";
    }
  });

  populateTabs();

});
