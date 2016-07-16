(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', '_ga');

_ga('create', 'UA-79860227-1', 'auto');
_ga('send', 'pageview');

document.addEventListener('DOMContentLoaded', function () {

    var browser = chrome;

    var activeWindowId = window.activeWindowId,
        selectedTabId = window.selectedTabId;

    $(document).mouseleave(function () {
        browser.tabs.update(selectedTabId, {active: true});
        window.close();
    });

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

            var li = "<li class='" + active + "' title='" + tab.title + "' data-tab-id=" + tab.id + ">" +
                "<div class='icon-div'>" +
                "<img class='icon' src='" + iconUrl + "' />" +
                "</div>" +
                "<div class='text-div'>" +
                "<p class='title'>" + title + "</p>" +
                "<p class='url'>" + url + "</p>" +
                "</div>" +
                "<img title='close' class='close-icon' src='close_icon.png' />" +
                "</li>";
            list.append(li);
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