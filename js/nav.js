const nav = {
  updateNavTabsData: () => {
    const allTabsCount = document.getElementsByClassName("tab").length;
    const audibleTabsCount = document.getElementsByClassName("audible").length;
    const killedTabsCount = document.getElementsByClassName("killed").length;
    const savedTabsCount = 20;
    const historyTabsCount = 20;

    navTabAllCountEl.innerHTML = allTabsCount;
    navTabAudibleCountEl.innerHTML = audibleTabsCount;
    navTabKilledCountEl.innerHTML = killedTabsCount;
    navTabSavedCountEl.innerHTML = savedTabsCount;
    navTabHistoryCountEl.innerHTML = historyTabsCount;
  },
  startClickListening: () => {
    // Get the element, add a click listener...
    document.getElementById("nav-tabs").addEventListener("click", function (e) {
      // e.target is the clicked element!
      // If it was a list item

      const navTab = e.target.closest("a.nav-tab");
      if (navTab) {
        nav.selectNavTab(navTab.id);
      }
    });
  },
  selectNavTab: (tabId) => {
    const activeNavTab = document.querySelector("a.nav-tab.active");

    if (activeNavTab) {
      activeNavTab.classList.remove("active");
    }
    document.getElementById(tabId).classList.add("active");

    const navTabSelected = tabId.split("-")[2];
    globals.navTabSelected = navTabSelected;
    tabFunctions.populateTabs();

    if (navTabSelected === "all") {
      actionFunctions.showActionBar();
    } else {
      actionFunctions.hideActionBar();
    }
  },
  getSelectedNavTab: () => {
    return globals.navTabSelected;
  },
};
