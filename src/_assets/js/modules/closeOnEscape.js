export default () => {
  const noScroll = '-no-scroll';

  // Close any open modal or menu when pressing the Esc key
  document.addEventListener('keydown', function(e) {
    // Close modals
    if (e.key == "Escape") {
      if (window.location.hash !== '' && document.querySelector(window.location.hash) && document.documentElement.classList.contains(noScroll)) {
        // Close the modal window
        window.location.hash = '#close'
      }

      // Remove the -no-scroll in all cases
      document.documentElement.classList.remove(noScroll);
    }
  })
};
