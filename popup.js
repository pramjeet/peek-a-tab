document.addEventListener('DOMContentLoaded', function () {
    var popupWindow;

    var browser = chrome;

    chrome.storage.sync.get(null, function (items) {

        var width = 400;

        if (typeof items.windowWidth == "number") {
            width = items.windowWidth;
        }


        browser.windows.getCurrent(function (win) {
            browser.tabs.query({windowId: win.id, active: true}, function (tabs) {
                var tab = tabs[0];
                popupWindow = window.open(
                    browser.extension.getURL("app.html"),
                    "Tabs you can peek at",
                    "alwaysOnTop=yes,width=" + width + ",height=" + (win.height - 10) + ",left=" + window.screenLeft + ",top=" + (window.screenTop - 70)
                );
                popupWindow.initialWindowId = win.id;

                window.close(); // close the Chrome extension pop-up
            });
        });
    });
}, false);