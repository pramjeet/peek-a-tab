/**
 * Created by pramj on 1/9/2017.
 */

document.addEventListener("DOMContentLoaded", function () {
  /**
   * set globals
   */
  globals.setGlobals();

  /**
   * get all tabs from all windows and populates the list
   */
  tabFunctions.populateTabs();

  /**
   * start listening for navbar clicks
   */
  nav.startClickListening();

  /**
   * start listening for search input
   */
  searchFunctions.startInputListening();
});
