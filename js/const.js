const THIS_VERSION = "1.5.6";
var activeWindowId = window.location.search.substr(1);
var peekATabWindowId = null;
var closeOnFocusChange = true;

var activeTabElement = null;

var mouseBehavior = "click"; //click, hover or single-click

var tabsListEl = document.getElementById("tabs-list");
var searchInput = document.getElementById("search-input");
