// Simple video lazy loading
// Ref: https://web.dev/lazy-loading-video/
document.addEventListener("DOMContentLoaded", function() {
  var lazyElements = [].slice.call(document.querySelectorAll("[data-lazy]"));

  if (!lazyElements) return;

  if ("IntersectionObserver" in window) {
    var lazyElementsObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(element) {
        if (element.isIntersecting) {
          // Lazy load videos
          if (element.target.tagName == 'VIDEO') {
            for (var source in element.target.children) {
              var videoSource = element.target.children[source];
              if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
                videoSource.src = videoSource.dataset.src;
              }
            }
  
            element.target.load();

          // Lazy load images
          } else {
            var imageSource = element.target.dataset.src;
            element.target.style.setProperty('--background', `url(${imageSource})`);
          }
          lazyElementsObserver.unobserve(element.target);
        }
      });
    });

    lazyElements.forEach(function(lazyElement) {
      lazyElementsObserver.observe(lazyElement);
    });
  }
});