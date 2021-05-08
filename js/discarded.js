document.addEventListener(
  "DOMContentLoaded",
  function () {
    const params = new URLSearchParams(window.location.search);
    console.log("params url:", params.get("url"));
    console.log("params title:", params.get("title"));
    console.log("params favIconUrl:", params.get("favIconUrl"));

    const tabUrl = params.get("url");

    const tabTitle = params.get("title");
    const tabFaviconUrl = params.get("favIconUrl");

    document.title = tabTitle;
    const faviconEl = document.getElementById("discarded-html-favicon");
    faviconEl.href = tabFaviconUrl;

    const reloadBtnEl = document.getElementById("reloadBtn");
    reloadBtnEl.addEventListener("click", function () {
      window.location.replace(tabUrl);
    });
  },
  false
);
