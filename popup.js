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
                
                chrome.windows.create({
					'url': browser.runtime.getURL("app.html") + "?" + win.id,
					'type': 'popup',
					'focused': true,
					'width': width,
					'height': (win.height - 10),
					'left': window.screenLeft,
					'top': (window.screenTop - 70)
				});

                window.close(); // close the Chrome extension pop-up
            });
        });
    });
}, false);