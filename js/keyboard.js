//key bindings
document.onkeydown = function (e) {
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
      if (!activeTab) {
        var arrowDownEvent = new Event("keydown");
        arrowDownEvent.keyCode = 40;
        document.dispatchEvent(arrowDownEvent);
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
        searchInput.focus();
        // searchInput.value = searchInput.value + String.fromCharCode(e.keyCode)
      }
      populateTabs();
  }
};
