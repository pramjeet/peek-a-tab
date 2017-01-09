/**
 * Created by pramj on 1/9/2017.
 */
document.addEventListener('DOMContentLoaded', function () {


    var activeTab = null;

    function makeActiveTab(tab) {
        activeTab = tab;
    }


    var tabsList = document.getElementById("tabs-list");

    function populateTabs() {
        chrome.windows.getAll({populate: true, windowTypes: ['normal']}, function (windows) {

            //if no window present, close peek-a-tab
            if (windows.length == 0) {
                window.close();
            }

            for (var i = 0; i < windows.length; i++) {
                var aWindow = windows[i];
                var windowTitle = document.createElement('div');
                windowTitle.classList.add("window-text");
                windowTitle.textContent = "Window " + (i + 1);

                tabsList.appendChild(windowTitle);

                for (var j = 0; j < aWindow.tabs.length; j++) {
                    var tab = aWindow.tabs[j];

                    var tabEl = document.createElement("div");
                    tabEl.classList.add("tab");
                    tabEl.dataset.id = tab.id;

                    var tabImgEl = document.createElement("img");
                    tabImgEl.classList.add("icon");
                    tabImgEl.src = tab.favIconUrl || "";

                    var tabTitleEl = document.createElement("p");
                    tabTitleEl.classList.add("title");
                    tabTitleEl.textContent = tab.title;  //highlight(tab.title,searchText);

                    var tabCrossEl = document.createElement("img");
                    tabCrossEl.title = "close";
                    tabCrossEl.classList.add("close-icon");
                    tabCrossEl.src = "images/close_icon.png";

                    tabCrossEl.addEventListener("click",
                        (function (tabElement) {
                            return function () {
                                deleteTab(tabElement);
                            }
                        })(tabEl));

                    if (aWindow.tabs[j].active) {
                        makeActiveTab(tab);
                        tabEl.classList.add("active");
                    }

                    tabEl.appendChild(tabImgEl);
                    tabEl.appendChild(tabTitleEl);
                    tabEl.appendChild(tabCrossEl);
                    tabsList.appendChild(tabEl);
                }

            }
        })
    }

    function deleteTab(tabElement) {
        var tabId=tabElement.dataset.id;
        chrome.tabs.remove(+tabId);
        tabElement.remove();
    }

    populateTabs();


});