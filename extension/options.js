document.addEventListener('DOMContentLoaded', function () {

    var checkbox = document.getElementsByTagName("input")[0];

    var closeWindowOnMouseLeave = false;
    chrome.storage.sync.get(null, function (items) {

        console.log(items);

        closeWindowOnMouseLeave = items.closeWindowOnMouseLeave !== false;

        if (closeWindowOnMouseLeave) {
            checkbox.checked = true;
        } else {
            checkbox = false;
        }
    });

    checkbox.addEventListener('change', function (event) {
        console.log(event.target.checked);
        if (event.target.checked) {
            chrome.storage.sync.set({
                closeWindowOnMouseLeave: true
            },function(){
                chrome.storage.sync.get(null, function (items) {
                    console.log(items);
                });
            });
        }else{
            chrome.storage.sync.set({
                closeWindowOnMouseLeave: false
            });
        }
    });

}, false);