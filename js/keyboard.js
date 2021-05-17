//key bindings
document.onkeydown = function (e) {
  switch (e.keyCode) {
    case 38: //up arrow
      e.preventDefault();
      searchFunctions.blurSearchInput();
      tabFunctions.focusPreviousTab();
      break;
    case 40: //down arrow
      e.preventDefault();
      searchFunctions.blurSearchInput();
      tabFunctions.focusNextTab();
      break;
    case 13: //enter
      // open first tab when where is no actived tab

      var activeTab = document.querySelector("li.tab.active");
      if (!activeTab) {
        makeTabIndexActive(0);
      } else {
        window.close();
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
        searchFunctions.focusSearchInput();
        // searchInput.value = searchInput.value + String.fromCharCode(e.keyCode)
      }
  }
};
