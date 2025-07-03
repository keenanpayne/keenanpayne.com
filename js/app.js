document.addEventListener("DOMContentLoaded", function () {
  // Simple video lazy loading
  // Ref: https://web.dev/lazy-loading-video/
  var lazyElements = [].slice.call(document.querySelectorAll("[data-lazy]"));

  if (!lazyElements) return;

  if ("IntersectionObserver" in window) {
    var lazyElementsObserver = new IntersectionObserver(function (
      entries,
      observer
    ) {
      entries.forEach(function (element) {
        if (element.isIntersecting) {
          const elementTag = element.target.tagName;

          // Lazy load videos
          if (elementTag == "VIDEO") {
            for (var source in element.target.children) {
              var videoSource = element.target.children[source];
              if (
                typeof videoSource.tagName === "string" &&
                videoSource.tagName === "SOURCE"
              ) {
                videoSource.src = videoSource.dataset.src;
              }
            }

            element.target.load();

            // Lazy load background images
          } else if (elementTag == "A") {
            var imageSource = element.target.dataset.src;
            element.target.style.setProperty(
              "--background",
              `url("${imageSource}")`
            );

            // Lazy load images
          } else if (elementTag == "IMG") {
            var imageSource = element.target.dataset.src;
            element.target.src = imageSource;
          }

          lazyElementsObserver.unobserve(element.target);
        }
      });
    });

    lazyElements.forEach(function (lazyElement) {
      lazyElementsObserver.observe(lazyElement);
    });
  }
});
