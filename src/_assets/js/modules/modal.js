export default () => {
  const modals = document.querySelectorAll('.modal');
  const noScroll = '-no-scroll';

  // Ignore if there are no modals
  if (!modals) return;

  // Add -no-scroll whenever we enter the page with a modal identifier
  if (window.location.hash !== '' && document.querySelector(window.location.hash) && document.querySelector(window.location.hash).classList.contains('modal') && !document.documentElement.classList.contains(noScroll)) {
    document.documentElement.classList.add(noScroll);
  }

  // Whenever we change the URL hash we check if we are opening a modal
  // if so then we add -no-scroll
  window.addEventListener('hashchange', function(){
    if (window.location.hash !== '' && document.querySelector(window.location.hash) && document.querySelector(window.location.hash).classList.contains('modal') && !document.documentElement.classList.contains(noScroll)) {
      document.documentElement.classList.add(noScroll);
    }

    // Remove any -no-scroll class whenever a modal is not open nor the main nav
    if (window.location.hash == '') {
      document.documentElement.classList.remove(noScroll);
    }
  })

  document.querySelectorAll('.modal-close').forEach(close => {
    close.addEventListener('click', function() {
      // Only remove the -no-scroll class if the main nav is not open
      if (!document.querySelector('.-nav-open')) {
        document.documentElement.classList.remove(noScroll);
      }
    });
  });
};
