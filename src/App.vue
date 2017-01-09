<template xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div id="app"
         @keyup.esc="closeWindow"
         @keydown.down="makeNextTabActive"
         @keydown.up="makePreviousTabActive"
         @keyup.enter="shiftAndCloseTabId(activeTabId)">

        <div id="options-header">
            <div id="search-div">
                <img id="search-icon" src="./search.png"/>
                <input placeholder="search title and url"
                       id="search-input" type="text"
                       v-model="searchText"/>
            </div>

            <div id="options">
                <div class="option">
                    <div @click="changeMouseBehavior" class="option-inner">
                        <img v-if="mouseBehavior=='click'" src="./cursor-pointer-clicked.png"/>
                        <img v-else src="./cursor-pointer.png"/>
                    </div>

                    <div v-show="mouseBehaviorHintText.length>0" class="option-hint">
                        <p class="option-hint-text">
                            <span>
                                {{mouseBehaviorHintText}}
                            </span>
                        </p>

                        <button @click="mouseBehaviorHintText=''" class="option-hint-button">
                            ok
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div id="notification" v-bind:class="{'visible':notificationText.length>0}">
            <p id="notification-text">
                {{notificationText}}
            </p>

            <img @click.stop="closeNotification()" title='close' id='notification-close-bttn' src='./close_icon.png'/>

        </div>
        <div id="tabs-list">
            <div class="" v-for="(aWindow, windowIndex) in windows">
                <div class="window-text">
                    <b>Window {{windowIndex+1}}</b>
                    <p class="no-result-text">No result found</p>
                </div>

                <div class="tab"
                     v-for="(tab, index) in aWindow.tabs"
                     @mouseenter="hoveredOnTab(tab)"
                     @click="clickedOnTab(tab)"
                     @dblclick="doubleClickedOnTab(tab)"
                     v-bind:class="{active:tab.id==activeTabId, visible:filteredTabIds.indexOf(tab.id)>-1}"
                     v-bind:title="tab.tooltip">

                    <img class='icon' v-bind:src='tab.favIconUrl'/>

                    <p class='title' v-html="highlight(tab.title,searchText)"></p>

                    <img @click.stop="closeTab(tab.id)" title='close' class='close-icon' src='./close_icon.png'/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        data: function () {
            return {
                notificationText: "",
                searchText: "",
                windows: [],
                activeTabId: 0,
                mouseBehavior: 'click',
                mouseBehaviorHintText: "",
                closeOnFocusChange: true,
                thisWindowId: 0,
                activeWindowId: 0
            }
        },
        mounted: function () {
            this.activeWindowId = window.targetWindowId;
            this.populateWindows();

            //keep search input focused
            setInterval(function () {
                document.getElementById("search-input").focus();
            }, 200);

            var $vm = this;

            //show hint to change mouse behavior
            chrome.storage.sync.get(null, function (items) {
                if (typeof items.mouseBehavior == "undefined") {
                    $vm.mouseBehaviorHintText = "Change mouse behavior here.";
                    chrome.storage.sync.set({
                        mouseBehavior: $vm.mouseBehavior
                    });
                } else {
                    $vm.mouseBehavior = items.mouseBehavior;
                }
            });


            //get peek-a-tab window id and listener for focus change
            chrome.windows.getCurrent({}, function (peekATabWindow) {
                $vm.thisWindowId = peekATabWindow.id;
                chrome.windows.onFocusChanged.addListener(function (newWindowId) {
                    if ($vm.closeOnFocusChange && newWindowId != peekATabWindow.id && newWindowId != chrome.windows.WINDOW_ID_NONE) {
                        window.close();
                    }
                });
            });

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

            //change active tab with search text
            this.$watch("searchText", function (newValue, oldValue) {
                this.activeTabId = this.filteredTabIds[0];
            });

        },
        computed: {

            /**
             * @returns {Array} tab ids of tabs containing search text in title or url
             */
            filteredTabIds: function () {
                var tabIds = [];
                var $vm = this;

                this.windows.forEach(function (aWindow) {
                    aWindow.tabs.filter(function (tab) {

                        if ($vm.searchText.trim() == "") {
                            tabIds.push(tab.id);
                        }
                        else if (tab.title.toLowerCase().indexOf($vm.searchText.trim().toLowerCase()) > -1 ||
                            tab.url.toLowerCase().indexOf($vm.searchText.trim().toLowerCase()) > -1) {
                            tabIds.push(tab.id);
                        }
                    })
                });

                return tabIds;
            }
        },
        methods: {
            
            closeWindow: function () {
                window.close();
            },
            populateWindows: function () {
                var $vm = this;
                $vm.windows=[];
                chrome.windows.getAll({populate: true, windowTypes: ['normal']}, function (windows) {

                    if(windows.length==0){
                        window.close();
                    }


                    $vm.windows = windows;

                    $vm.windows.forEach(function (aWindow) {
                        if (aWindow.id == $vm.activeWindowId) {
                            for (var i = 0; i < aWindow.tabs.length; i++) {
                                if (aWindow.tabs[i].active) {
                                    $vm.activeTabId = aWindow.tabs[i].id;

                                    (function (tabIndex) {
                                        $vm.scrollToShowTab(tabIndex + 3);
                                    })($vm.filteredTabIds.indexOf(aWindow.tabs[i].id))
                                }
                            }
                        }
                    });
                })
            },
            closeNotification: function () {
                this.notificationText = "";
            },
            changeMouseBehavior: function () {
                this.mouseBehaviorHintText = "";

                if (this.mouseBehavior == 'hover') {
                    this.mouseBehavior = 'click';
                    this.notificationText = "Single click to just select the tab and double click to select the tab and close the list too";
                } else {
                    this.mouseBehavior = 'hover';
                    this.notificationText = "Move mouse over the tab to just select and click to select the tab and close the list too";
                }

                chrome.storage.sync.set({
                    mouseBehavior: this.mouseBehavior
                });
            },
            hoveredOnTab: function (tab) {
                if (this.mouseBehavior == 'hover') {
                    this.setActiveTab(tab);
                }
            },
            clickedOnTab: function (tab) {
                if (this.mouseBehavior == 'hover') {
                    this.shiftAndClose(tab);
                } else {
                    this.setActiveTab(tab);
                }
            },
            doubleClickedOnTab: function (tab) {
                this.shiftAndClose(tab);
            },
            setActiveTabId: function (tabId) {
                var $vm = this;
                this.windows.forEach(function (aWindow) {
                    aWindow.tabs.forEach(function (tab) {
                        if (tab.id == tabId) {
                            $vm.setActiveTab(tab);
                            return;
                        }
                    })
                })
            },
            setActiveTab: function (tab) {

                var $vm = this;

                if (this.activeWindowId != tab.windowId) {
                    this.activeWindowId = tab.windowId;

                    this.closeOnFocusChange = false;
                    chrome.windows.update(tab.windowId, {focused: true}, function () {
                        chrome.windows.update($vm.thisWindowId, {focused: true}, function () {
                            $vm.closeOnFocusChange = true;
                        });
                    });
                }

                this.activeTabId = tab.id;
                chrome.tabs.update(tab.id, {active: true});
            },

            shiftAndCloseTabId: function (tabId) {
                var $vm = this;
                this.windows.forEach(function (aWindow) {
                    aWindow.tabs.forEach(function (tab) {
                        if (tab.id == tabId) {
                            $vm.shiftAndClose(tab);
                            return;
                        }
                    })
                })
            },
            shiftAndClose: function (tab) {
                chrome.tabs.update(tab.id, {active: true});
                chrome.windows.update(tab.windowId, {focused: true}, function () {
                    this.closeWindow();
                });
            },
            closeTab: function (tabId) {

                var $vm = this;
                chrome.tabs.remove(tabId, function () {
                    setTimeout(function () {
                        $vm.populateWindows();
                    },50);
                });

            },
            makeNextTabActive: function () {

                for (var i = 0; i < this.filteredTabIds.length; i++) {
                    if (this.filteredTabIds[i] == this.activeTabId && i < (this.filteredTabIds.length - 1)) {
                        this.setActiveTabId(this.filteredTabIds[i + 1]);
                        this.scrollToShowTab(i + 1);
                        return;
                    }
                }

                this.setActiveTabId(this.filteredTabIds[0]);
                this.scrollToShowTab(0);
            },
            makePreviousTabActive: function () {
                for (var i = 0; i < this.filteredTabIds.length; i++) {
                    if (this.filteredTabIds[i] == this.activeTabId) {

                        if (i > 0) {
                            this.setActiveTabId(this.filteredTabIds[i - 1]);
                            this.scrollToShowTab(i - 1);
                            return;
                        }
                    }
                }

                this.setActiveTabId(this.filteredTabIds[this.filteredTabIds.length - 1]);
                this.scrollToShowTab(this.filteredTabIds.length - 1);
            },
            scrollToShowTab: function (tabIndex) {

                var tabsListEl = document.getElementById("tabs-list");
                if ((tabsListEl.offsetHeight + tabsListEl.scrollTop) < (36 * (tabIndex + (this.windows.length + 1)))) {
                    tabsListEl.scrollTop = (36 * (tabIndex + (this.windows.length + 1))) - tabsListEl.offsetHeight;
                } else if (tabsListEl.scrollTop > (36 * tabIndex)) {
                    tabsListEl.scrollTop = (36 * tabIndex);
                }

            },

            highlight: function (text, textToHighlight) {
                if (textToHighlight.length > 0) {
                    return text.toLowerCase().replace(textToHighlight, "<span class='highlight'>" + textToHighlight + "</span>")
                } else {
                    return text;
                }
            }
        }
    }
</script>
<style>

    html, body {
        margin: 0;
        font-family: 'Rubik', sans-serif;
        overflow: hidden;
        height: 100%;
    }

    #app {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
        overflow: hidden;
    }

    #options-header {
        position: fixed;
        top: 0;
        height: 35px;
        width: 100%;
        background: white;
        /* border-top: 1px solid #efefef; */
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        z-index: 2;
        display: flex;
    }

    #search-div {
        flex: 1;
        height: 80%;
        box-sizing: border-box;
        display: block;
        margin: 3px 8px;
        position: relative;
        float: left;
    }

    #search-icon {
        width: 20px;
        top: 3px;
        left: 5px;
        position: absolute;
    }

    #search-input {
        outline: none;
        font-size: 12px;
        font-family: 'Rubik', sans-serif;
        border: 1px solid #eee;
        width: 100%;
        height: 100%;
        padding: 0 10px 0 30px;
        box-sizing: border-box;
        display: block;
        border-radius: 2px;
    }

    ::-webkit-input-placeholder {
        /* Chrome/Opera/Safari */
        font-weight: 300;
        color: #dadada;
    }

    #search-input:focus {
        border-color: #1f00ff;
        box-shadow: 0 0 2px #0010ff;
    }

    #options {
        float: right;
        padding: 3px;
    }

    .option {
        position: relative;
        width: 26px;
        height: 26px;
        margin-right: 10px;
        cursor: pointer;
        border: 1px solid #eee;
        border-radius: 2px;
    }

    .option img {
        width: 100%;
    }

    .option-hint {
        position: absolute;
        width: 180px;
        right: 0;
        top: 120%;
        background: #fff;
        color: #000;
        padding: 10px;
        text-align: right;
        border: 2px solid;
    }

    .option-hint:before {
        bottom: 100%;
        right: 4px;
        border: 8px solid transparent;
        border-bottom-color: #fff;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
        z-index: 20;
    }

    .option-hint:after {
        bottom: 100%;
        right: 2px;
        border: 10px solid transparent;
        border-bottom-color: #404040;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
        z-index: 10;
    }

    .option-hint-text {
        margin: 0;
        text-align: left;
    }

    .option-hint-button {
        margin: 10px 0 0;
        border: none;
        background: none;
        color: #175fb9;
        font-size: 12px;
        text-transform: uppercase;
    }

    #notification {
        position: absolute;
        width: 250px;
        min-height: 60px;
        right: 20px;
        top: 36px;
        background: #3cbd4d;
        color: #fff;
        padding: 15px 20px 15px 15px;
        text-align: left;
        z-index: 3;
        font-size: 14px;
        transition: .1s;
        opacity: 0;
        transform: translateX(100%);
        box-shadow: 0 0 2px rgba(0, 0, 0, .24);
        overflow: hidden;
        box-sizing: border-box;
    }

    #notification.visible {
        opacity: 1;
        transform: translateX(0);
    }

    #notification-text {
        margin: 0;
    }

    #notification-close-bttn {
        position: absolute;
        top: 2px;
        right: 2px;
        height: 20px;
        padding: 3px;
        background-color: #e05454;
        cursor: pointer;
        border-radius: 50%;
        box-sizing: border-box;
    }

    #tabs-list {
        position: absolute;
        top: 35px;
        bottom: 0;
        width: 100%;
        overflow-y: scroll;
        list-style: none;
        padding: 0;
        margin: 0;
        background: #fafafa;
    }

    .window-text {
        position: relative;
        margin: 10px;
    }

    .no-result-text {
        margin-top: 10px;
        position: absolute;
        color: #b3b3b3;
    }

    .tab {
        display: none;
        position: relative;
        border-radius: 3px;
        height: 36px;
        border: 2px solid transparent;
        color: #101010;
        box-sizing: border-box;
        cursor: pointer;
        vertical-align: middle;
        overflow: hidden;
        padding: 6px 7px;
        background: #fafafa;
    }

    .tab.visible {
        display: block;
    }

    .tab:hover {
        border-color: #b0dbfb;
        /* background: #eee; */
        /* box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); */
        /* color: #2e7fb9; */
    }

    .tab.active {
        border-color: #2e7fb9;
        /* background: #eee; */
        /* box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); */
        color: #2e7fb9;
    }

    .icon {
        width: 20px;
        height: 20px;
        float: left;
        margin: 0 10px 0 0;
        /* background: #e0e0e0; */
        /* border: 2px solid #f3f3f3; */
        border-radius: 3px;
        overflow: hidden;
        padding: 0;
        box-sizing: border-box;
    }

    .title {
        font-size: 13px;
        margin: 2px 0;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
    }

    .highlight {
        background: #ffd64d;
        color: white;
        border-radius: 5px;
        padding: 2px;
    }

    .close-icon {
        position: absolute;
        top: 6px;
        right: 5px;
        height: 20px;
        padding: 3px;
        background-color: #e05454;
        cursor: pointer;
        border-radius: 50%;
        box-sizing: border-box;
        display: none;
    }

    .tab:hover .close-icon {
        display: block;
    }

    .tab.active .close-icon {
        display: block;
    }
</style>
