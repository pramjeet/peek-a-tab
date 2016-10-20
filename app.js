document.addEventListener('DOMContentLoaded', function () {

    var appWindowId;
    chrome.windows.getCurrent({populate: false}, function (appWindow) {
        appWindowId = appWindow.id;
    });

    //chrome.windows.onFocusChanged.addListener(function () {
    //    chrome.windows.update(appWindowId, {focused: true});
    //});

    var browser = chrome;

    var activeWindowId = window.activeWindowId,
        selectedTabId = window.selectedTabId;

    $(document).mouseleave(function () {
        browser.tabs.update(selectedTabId, {active: true});
    });

    chrome.storage.sync.get(null, function (items) {

        if (typeof items.closeWindowOnMouseLeave === "undefined") {
            $(document).mouseleave(function () {
                $("#close_msg_overlay").show();
            });

        } else if (items.closeWindowOnMouseLeave == true) {
            $(document).mouseleave(function () {
                window.close();
            });
        }
    });

    $("#close_msg_yes").click(function () {
        chrome.storage.sync.set({
            closeWindowOnMouseLeave: true
        });
        $("#close_msg_overlay").hide();

        $(document).mouseleave(function () {
            window.close();
        });
    });

    $("#close_msg_no").click(function () {
        chrome.storage.sync.set({
            closeWindowOnMouseLeave: false
        });
        $("#close_msg_overlay").hide();
        $(document).mouseleave(function () {
            $("#close_msg_overlay").hide();
        });
    });

    var i = 0;
    browser.tabs.getAllInWindow(activeWindowId, function (tabs) {
        var list = $("#tabs-list");
        tabs.forEach(function (tab) {
            var iconUrl = tab.favIconUrl,
                title = tab.title,
                url = tab.url;

            if (iconUrl == undefined) {
                iconUrl = "";
            }

            var active = "";
            if (tab.id == selectedTabId) {
                active = "active";
            }

            if (url.length > 32) {
                url = url.substr(0, 32) + "...";
            }

            var $li = $("<li class='" + active + "' data-tab-id='" + tab.id + "'>" +
                "<img class='icon' src='" + iconUrl + "' />" +
                "<p class='title'>" + title + "</p>" +
                "<img title='close' class='close-icon' src='close_icon.png' />" +
                "</li>" +
                "<div class='desc'>" + tab.title + "</div>"
            );
            list.append($li);


            setTimeout(function () {
                $li.addClass('visible');
            }, i * 30);
            i++;
        });
    });

    $(document).on("mouseover", "#tabs-list li", function () {
        var tabId = $(this).data("tab-id");
        browser.tabs.update(tabId, {active: true});
    });

    $(document).on("click", "#tabs-list li", function () {
        window.close();
    });

    $(document).on("click", ".close-icon", function (event) {
        var li = $(this).parent('li');
        var tabId = li.data("tab-id");

        var listItems = $("#tabs-list").find("li");

        if (listItems.length == 1) {
            browser.tabs.create({windowId: activeWindowId});
        }

        li.remove();
        browser.tabs.remove(tabId);
        event.stopPropagation();

        if (listItems.length == 1) {
            window.close();
        }
    });

}, false);