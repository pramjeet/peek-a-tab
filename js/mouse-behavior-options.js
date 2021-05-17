const mouseBehaviorFunctions = {
  /**
   *
   */
  toggleMouseBehaviorOptions: () => {
    if (mouseBehaviorOptionsContainer.style.display != "block") {
      mouseBehaviorOptionsContainer.style.display = "block";
    } else {
      mouseBehaviorOptionsContainer.style.display = "none";
    }
  },

  syncMouseBehaviorOptionsImage: () => {
    var mouseBehaviorImage = document.getElementById("mouse-behavior-image");

    function changeMouseBehaviorImage() {
      mouseBehaviorImage.src =
        "./images/cursor-pointer-" + mouseBehavior + ".png";
    }
  },

  saveMouseBehavior: () => {
    chrome.storage.sync.set({
      mouseBehavior: mouseBehavior,
    });
  },
};

document.addEventListener("DOMContentLoaded", function () {
  /**
   *
   */
  mouseBehaviorFunctions.syncMouseBehaviorOptionsImage();

  //show hint to change mouse behavior
  chrome.storage.sync.get(null, function (items) {
    if (typeof items.mouseBehavior == "undefined") {
      saveMouseBehavior();
    } else {
      mouseBehavior = items.mouseBehavior;
    }

    changeMouseBehaviorImage();
  });

  var mouseBehaviorOptionsContainer = document.getElementById(
    "mouse-behavior-options-container"
  );

  var mouseBehaviorOptions = document.getElementsByClassName(
    "mouse-behavior-option"
  );

  for (var i = 0; i < mouseBehaviorOptions.length; i++) {
    mouseBehaviorOptions[i].addEventListener(
      "click",
      (function (mouseBehaviorOption) {
        return function () {
          mouseBehavior = mouseBehaviorOption.dataset.mouseBehavior;
          changeMouseBehaviorImage();
          saveMouseBehavior();
        };
      })(mouseBehaviorOptions[i])
    );
  }

  mouseBehaviorImage.addEventListener("click", function (e) {
    e.stopPropagation();
  });
});
