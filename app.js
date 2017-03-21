/**
 * Created by pramj on 1/9/2017.
 */
document.addEventListener('DOMContentLoaded', function () {

    var activeWindowId = window.initialWindowId;
    var peekATabWindowId = null;
    var closeOnFocusChange = true;

    var activeTabElement = null;

    var mouseBehavior = 'click'; //click, hover or single-click

    var tabsListEl = document.getElementById("tabs-list");
    var searchInput = document.getElementById("search-input");

    //keep search input focused
    searchInput.focus();
    searchInput.addEventListener("blur", function () {
        searchInput.focus();
    });

    searchInput.addEventListener("input", populateTabs);

    //save width changes
    window.addEventListener('resize', function (event) {
        var widthToStore = document.documentElement.clientWidth;
        if (widthToStore <= 300) {
            widthToStore = 300;
        }

        chrome.storage.sync.set({
            windowWidth: widthToStore
        });

    });

    function highlight(text, textToHighlight) {
        if (textToHighlight.length > 0)
            return text.toLowerCase().replace(textToHighlight, "<span class='highlight'>" + textToHighlight + "</span>")
        else return text;
    }

    /**
     * removes the dom element and the corresponding tab from the browser
     * @param tabElement - DOM element from the list containing data-id attributes
     */
    function closeTab(tabElement) {
        var tabId = tabElement.dataset.id;
        chrome.tabs.remove(+tabId);
        tabElement.remove();
    }

    //get peek-a-tab window id and listener for focus change
    chrome.windows.getCurrent({}, function (peekATabWindow) {
        peekATabWindowId = peekATabWindow.id;
        chrome.windows.onFocusChanged.addListener(function (newWindowId) {
            if (closeOnFocusChange && newWindowId != peekATabWindow.id && newWindowId != chrome.windows.WINDOW_ID_NONE) 
                window.close();
        });
    });


    function changeActiveTab(tab) {
        if (tab.windowId != activeWindowId) {
            closeOnFocusChange = false;
            chrome.windows.update(tab.windowId, {focused: true}, function () {
                chrome.windows.update(peekATabWindowId, {focused: true}, function () {
                    closeOnFocusChange = true;
                });
            });
        }

        chrome.tabs.update(tab.id, {active: true});
        activeWindowId = tab.windowId;

        if (activeTabElement) 
            activeTabElement.classList.remove("active");

        activeTabElement = document.getElementById(tab.id);
        activeTabElement.classList.add("active");
        scrollToShowActiveTab();
    }

    function changeActiveTabAndCloseWindow(tab) {
        changeActiveTab(tab);
        window.close();
    }

    function hoveredOnTab(tab) {
        if (mouseBehavior == "hover") 
            changeActiveTab(tab);
    }

    function clickedOnTab(tab) {
        if (mouseBehavior == "click") 
            changeActiveTab(tab);
        else if (mouseBehavior == "single-click") 
            changeActiveTabAndCloseWindow(tab);
    }

    function doubleClickedOnTab(tab) {
        changeActiveTabAndCloseWindow(tab);
    }

    function getActiveTabIndex() {
        var tabIndex, tabEls = document.getElementsByClassName('tab');

        for (tabIndex = 0; tabIndex < tabEls.length; tabIndex++) 
            if (activeTabElement.id == tabEls[tabIndex].id)
                return tabIndex;
    }

    function makeTabIndexActive(tabIndex) {
        var tabElement = document.getElementsByClassName('tab')[tabIndex];
        var tabId = tabElement.id;

        chrome.tabs.get(+tabId, changeActiveTab);
    }

    function makeNextTabActive() {
        var tabIndex = getActiveTabIndex(), tabEls = document.getElementsByClassName('tab');

        if (tabIndex < (tabEls.length - 1)) {
            makeTabIndexActive(tabIndex + 1);
            scrollToShowActiveTab();
            return;
        }

        makeTabIndexActive(0);
    }

    function makePreviousTabActive() {
        var tabIndex = getActiveTabIndex(), tabEls = document.getElementsByClassName('tab');

        if (tabIndex > 0) {
            makeTabIndexActive(tabIndex - 1);
            scrollToShowActiveTab();
            return;
        }

        makeTabIndexActive((tabEls.length - 1));
    }

    function scrollToShowActiveTab() {
        var tabIndex = getActiveTabIndex();

        chrome.windows.getAll({populate: true, windowTypes: ['normal']}, function (windows) {
            if ((tabsListEl.offsetHeight + tabsListEl.scrollTop) < (36 * (tabIndex + (windows.length + 1))))
                tabsListEl.scrollTop = (36 * (tabIndex + (windows.length + 1))) - tabsListEl.offsetHeight;
            else if (tabsListEl.scrollTop > (36 * tabIndex))
                tabsListEl.scrollTop = (36 * tabIndex);           
        });
    }

    /**
     * get all tabs from all windows and populates the list
     */
    function populateTabs() {
        chrome.windows.getAll({populate: true, windowTypes: ['normal']}, function (windows) {
            var aWindow, windowTitle;
            
            //if no window present, close peek-a-tab
            if (windows.length == 0)
                window.close();

            tabsListEl.innerHTML = "";

            for (var i = 0; i < windows.length; i++) {
                aWindow = windows[i];
                windowTitle = document.createElement('li');
                windowTitle.classList.add("window-text");
                windowTitle.textContent = "Window " + (i + 1);

                tabsListEl.appendChild(windowTitle);

                for (var j = 0; j < aWindow.tabs.length; j++) {
                    var tab = aWindow.tabs[j];

                    if (searchInput.value.trim() != "" && tab.title.toLowerCase().indexOf(searchInput.value.trim().toLowerCase()) == -1 &&
                        tab.url.toLowerCase().indexOf(searchInput.value.trim().toLowerCase()) == -1) {
                        continue;
                    }

                    var tabEl = document.createElement("li");
                    tabEl.classList.add("tab");
                    tabEl.dataset.id = tab.id;
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

                    tabCrossEl.addEventListener("click",
                        (function (tabElement) {
                            return function (e) {
                                e.stopPropagation();
                                closeTab(tabElement);
                            }
                        })(tabEl));

                    tabEl.addEventListener("mouseover",
                        (function (tab, tabElement) {
                            return function () {
                                hoveredOnTab(tab);
                            }
                        })(tab));

                    tabEl.addEventListener("click",
                        (function (tab, tabElement) {
                            return function () {
                                clickedOnTab(tab);
                            }
                        })(tab));

                    tabEl.addEventListener("dblclick",
                        (function (tab, tabElement) {
                            return function () {
                                doubleClickedOnTab(tab);
                            }
                        })(tab));

                    tabEl.appendChild(tabImgEl);
                    tabEl.appendChild(tabTitleEl);
                    tabEl.appendChild(tabCrossEl);
                    tabsListEl.appendChild(tabEl);

                    if (aWindow.id == activeWindowId && tab.active) {
                        changeActiveTab(tab);
                    }
                }
            }
        })
    }


    populateTabs();

    //key bindings
    document.onkeydown = function (e) {
        switch (e.keyCode) {
            case 38:
                makePreviousTabActive();
                break;
            case 40:
                makeNextTabActive();
                break;
            case 13: //enter
                window.close();
                break;
            case 27: //esc
                window.close();
                break;
        }
    };


    var mouseBehaviorImage = document.getElementById("mouse-behavior-image");

    function changeMouseBehaviorImage() {
        mouseBehaviorImage.src = "./images/cursor-pointer-" + mouseBehavior + ".png";
    }

    function saveMouseBehavior() {
        chrome.storage.sync.set({
            mouseBehavior: mouseBehavior
        });
    }

    //show hint to change mouse behavior
    chrome.storage.sync.get(null, function (items) {
        if (typeof items.mouseBehavior == "undefined")
            saveMouseBehavior();
        else
            mouseBehavior = items.mouseBehavior;

        changeMouseBehaviorImage();
    });


    var mouseBehaviorOptionsContainer = document.getElementById("mouse-behavior-options-container"),
        mouseBehaviorOptions = document.getElementsByClassName("mouse-behavior-option");

    for (var i = 0; i < mouseBehaviorOptions.length; i++) {
        mouseBehaviorOptions[i].addEventListener('click', (function (mouseBehaviorOption) {
            return function () {
                mouseBehavior = mouseBehaviorOption.dataset.mouseBehavior;
                changeMouseBehaviorImage();
                saveMouseBehavior();
            }
        })(mouseBehaviorOptions[i]));
    }

    mouseBehaviorImage.addEventListener("click", function (e) {
        e.stopPropagation();

        if (mouseBehaviorOptionsContainer.style.display != "block")
            mouseBehaviorOptionsContainer.style.display = "block";
        else
            mouseBehaviorOptionsContainer.style.display = "none";
    });

    document.addEventListener("click", function () {
        if (mouseBehaviorOptionsContainer.style.display != "none"
            mouseBehaviorOptionsContainer.style.display = "none";
    })
});
