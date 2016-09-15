document.addEventListener('DOMContentLoaded', function () {
    var popupWindow;

    var browser=chrome;

    browser.windows.getCurrent(function (win) {
        browser.tabs.query({windowId: win.id, active: true}, function (tabs) {
            var tab = tabs[0];
            popupWindow = window.open(
                browser.extension.getURL("app.html"),
                "Tabs you can peek at",
                "alwaysOnTop=yes,width=300,height=" + (win.height - 10) + ",left=" + window.screenLeft + ",top=" + (window.screenTop - 70)
            );
            popupWindow.activeWindowId = win.id;
            popupWindow.selectedTabId = tab.id;


            browser.windows.

            window.close(); // close the Chrome extension pop-up
        });
    });

}, false);