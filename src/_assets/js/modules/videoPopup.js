/**
 * @function videoPopup()
 *
 * Displays popup video on the Science page
 * TODO: Allow this to be closed with `esc` key
 */
export default () => {
  const element = document.querySelector('.popupVideo');
  const trigger = document.querySelectorAll('[data-trigger="popupVideo"]');
  const active = '-visible';

  if (!element) return;

  const videoElement = element.querySelector('video');
  const videoSource = element.querySelector('source');
  const close = element.querySelector('.popupVideo-close');

  // Take the `href` attribute from all triggers and use to populate
  // the `<source>` element then load and play the `<video>` element
  trigger.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      const videoFile = link.getAttribute('href');
      videoSource.src = videoFile;
      videoElement.load();
      videoElement.play();
      element.classList.add(active);
    });
  });

  // Close popup and pause video
  close.addEventListener('click', function() {
    element.classList.remove(active);
    videoElement.pause();
  });
};
