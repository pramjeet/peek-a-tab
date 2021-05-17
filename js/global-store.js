const THIS_VERSION = "1.5.6";
var activeWindowId = window.location.search.substr(1);
var peekATabWindowId = null;
var closeOnFocusChange = true;

var activeTabElement = null;

var mouseBehavior = "click"; //click, hover or single-click

var tabsListEl = document.getElementById("tabs-list");
var searchInput = document.getElementById("search-input");

var navTabAllCountEl = document.getElementById("allCountSpan");
var navTabAudibleCountEl = document.getElementById("audibleCountSpan");
var navTabKilledCountEl = document.getElementById("killedCountSpan");
var navTabSavedCountEl = document.getElementById("savedCountSpan");
var navTabHistoryCountEl = document.getElementById("historyCountSpan");

var globals = {
  activeWindowId: null,
  peekATabWindowId: null,
  activeTabId: -1,
  closeOnFocusChange: true,
  mouseBehavior: "click",
  searchInputEl: null,
  navTabSelected: "all",
  navTabsEl: document.getElementById("nav-tabs"),
  setGlobals: () => {
    globals.activeWindowId = window.location.search.substr(1);
    globals.peekATabWindowId = null;
    globals.activeTabId = -1;
    globals.closeOnFocusChange = true;
    globals.mouseBehavior = "click";
    globals.searchInputEl = document.getElementById("search-input");
    globals.navTabSelected = "all";
  },
};
