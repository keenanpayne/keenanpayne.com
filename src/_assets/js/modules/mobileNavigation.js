export default () => {
  const active = '-active';
  const hamburger = document.querySelector('.hamburger');

  hamburger.addEventListener('click', function(event) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    if (isMobile) {
      event.preventDefault();

      hamburger.classList.toggle(active);

      document.documentElement.classList.toggle('-no-scroll');
      document.querySelector('.navigation').classList.toggle(active);
    }
  });
};
