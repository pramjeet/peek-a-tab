/**
 * Created by pramj on 1/9/2017.
 */

//get peek-a-tab window id and listener for focus change
chrome.windows.getCurrent({}, function (peekATabWindow) {
  chrome.windows.onFocusChanged.addListener(function (newWindowId) {
    if (
      closeOnFocusChange &&
      newWindowId != peekATabWindow.id &&
      newWindowId != chrome.windows.WINDOW_ID_NONE
    ) {
      window.close();
    }
  });
});

//save width changes
window.addEventListener("resize", function (event) {
  var widthToStore = document.documentElement.clientWidth;
  if (widthToStore <= 300) {
    widthToStore = 300;
  }

  chrome.storage.sync.set({
    windowWidth: widthToStore,
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // searchInput.focus()
  searchInput.addEventListener("input", function () {
    populateTabs();
  });

  /**
   * get all tabs from all windows and populates the list
   */
  function populateTabs() {
    chrome.windows.getAll(
      { populate: true, windowTypes: ["normal"] },
      function (windows) {
        //if no window present, close peek-a-tab
        if (windows.length == 0) {
          window.close();
        }

        tabsListEl.innerHTML = "";

        for (var i = 0; i < windows.length; i++) {
          var aWindow = windows[i];
          var isActiveWindowText =
            activeWindowId == aWindow.id ? " (current)" : "";
          var windowTitle = document.createElement("li");
          windowTitle.classList.add("window-text");
          windowTitle.id = aWindow.id;
          windowTitle.dataset.nr = i + 1;
          windowTitle.textContent = "Window " + (i + 1) + isActiveWindowText;
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
                .indexOf(searchInput.value.trim().toLowerCase()) == -1
            ) {
              continue;
            }

            var tabEl = document.createElement("li");
            tabEl.classList.add("tab");
            tabEl.dataset.id = tab.id;
            tabEl.tabIndex = 0;
            tabEl.id = "tab-" + tab.id;

            tabsListEl.appendChild(tabEl);

            renderTabElement(tab, tabEl);

            if (aWindow.id == activeWindowId && tab.active) {
              changeActiveTab(tab);
            }
          }
        }
      }
    );
  }

  var mouseBehaviorImage = document.getElementById("mouse-behavior-image");

  function changeMouseBehaviorImage() {
    mouseBehaviorImage.src =
      "./images/cursor-pointer-" + mouseBehavior + ".png";
  }

  function saveMouseBehavior() {
    chrome.storage.sync.set({
      mouseBehavior: mouseBehavior,
    });
  }

  //show hint to change mouse behavior
  chrome.storage.sync.get(null, function (items) {
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
      (function (mouseBehaviorOption) {
        return function () {
          mouseBehavior = mouseBehaviorOption.dataset.mouseBehavior;
          changeMouseBehaviorImage();
          saveMouseBehavior();
        };
      })(mouseBehaviorOptions[i])
    );
  }

  mouseBehaviorImage.addEventListener("click", function (e) {
    e.stopPropagation();

    if (mouseBehaviorOptionsContainer.style.display != "block") {
      mouseBehaviorOptionsContainer.style.display = "block";
    } else {
      mouseBehaviorOptionsContainer.style.display = "none";
    }
  });

  document.addEventListener("click", function () {
    if (mouseBehaviorOptionsContainer.style.display != "none") {
      mouseBehaviorOptionsContainer.style.display = "none";
    }
  });

  populateTabs();
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    const tabEl = document.getElementById("tab-" + tab.id);
    if (tabEl) {
      renderTabElement(tab, tabEl);
    }
  });

  // anoouncements related stuff
  let announcementEl = document.getElementById("announcement-container");
  let announcementCloseIconEl = document.getElementById(
    "announcement-close-icon"
  );
  function showAnnouncement() {
    announcementEl.classList.add("visible");
  }

  function hideAnnouncement() {
    announcementEl.classList.remove("visible");
  }

  chrome.storage.sync.get(null, function (items) {
    if (items.announcementShowedForVersion != THIS_VERSION) {
      setTimeout(function () {
        showAnnouncement();
      }, 300);

      announcementCloseIconEl.addEventListener("click", function () {
        hideAnnouncement();

        chrome.storage.sync.set({
          announcementShowedForVersion: THIS_VERSION,
        });
      });
    }
  });
});
