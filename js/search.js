const searchFunctions = {
  getSearchInputEl: () => {
    return document.getElementById("search-input");
  },
  focusSearchInput: () => {
    return searchFunctions.getSearchInputEl().focus();
  },
  blurSearchInput: () => {
    return searchFunctions.getSearchInputEl().blur();
  },
  startInputListening: () => {
    /**
     * Listens for input in search
     */
    searchFunctions.getSearchInputEl().addEventListener("input", function () {
      tabFunctions.populateTabs();
    });
  },
};
