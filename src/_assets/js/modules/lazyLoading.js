export default () => {
  const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
  const lazyVideos = [].slice.call(document.querySelectorAll("video.lazy"));
  const lazyIFrames = [].slice.call(document.querySelectorAll("iframe.lazy"));

  const IntersectionObserverOptions = {
    rootMargin: "500px" // Trigger 500px ahead
  };

  if ("IntersectionObserver" in window) {
    const lazyMediaObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const lazyMedia = entry.target;

          // Check if the element is a video or an image
          if (entry.target.localName == 'video') {
            const source = Array.from(entry.target.children).filter(x => x.localName === "source")[0]
            source.src = source.dataset.src;
            lazyMedia.load();
            lazyMedia.play();
          } else {
            lazyMedia.src = lazyMedia.dataset.src;
            // TODO: Uncomment when adding srcsets
            // lazyMedia.srcset = lazyMedia.dataset.srcset;
          }

          lazyMedia.classList.remove("lazy");
          lazyMediaObserver.unobserve(lazyMedia);
        }
      });
    }, IntersectionObserverOptions);

    lazyImages.forEach(function(lazyImage) {
      lazyMediaObserver.observe(lazyImage);
    });

    // lazyVideos.forEach(function(lazyVideo){
    //   lazyMediaObserver.observe(lazyVideo);
    // });

    // lazyIFrames.forEach(function(lazyIFrame){
    //   lazyMediaObserver.observe(lazyIFrame);
    // });
  }
};
