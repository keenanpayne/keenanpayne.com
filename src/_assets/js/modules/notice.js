/**
 * @function notice()
 *
 * Notice component used throughout the site
 */
export default () => {
  const notices = document.querySelectorAll('.notice');
  const noticeHidden = '-hidden';
  const noticeVisible = '-visible';
  const noticePresent = '-notice-visible';
  const header = document.querySelector('.header');

  if (!notices) return;

  // Handle each notice that exists
  notices.forEach(notice => {
    let id = notice.getAttribute('id');
    let close = notice.querySelector('.notice-close');

    // Check state to ensure notices shouldn't be hidden
    let state = localStorage.getItem(id);

    if (state !== 'hidden') {
      header.classList.add('-beneath-notice');
      notice.classList.remove(noticeHidden);
      notice.classList.add(noticeVisible);
      document.documentElement.classList.add(noticePresent);
    }

    // Close notice and save state
    close.addEventListener('click', function() {
      localStorage.setItem(id, 'hidden');
      notice.classList.add(noticeHidden);
      notice.classList.remove(noticeVisible);
      document.documentElement.classList.remove(noticePresent);

      setTimeout(() => {
        const notices = document.querySelector('.notices');
        const noticesHeight = notices ? notices.offsetHeight : 0;

        document.querySelector('.header').style.top = `${noticesHeight}px`;
      }, 200)

      const isThereABanner = document.querySelector('.-avoidBanner');
      if (isThereABanner) {
        isThereABanner.classList.remove('-avoidBanner');
      }
    });
  });
};
