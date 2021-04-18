/**
 * @function accordion()
 *
 * Accordion component used throughout the site
 */
export default () => {
  const items = document.querySelectorAll('.accordion-header');
  const active = '-active';

  if (!items) return;

  // Don't collapse the accordion if there is only one item
  if (items.length == 1) {
    items[0].parentElement.classList.add(active);
  }

  items.forEach(item => {
    item.addEventListener('click', function() {
      if (this.parentElement.classList.contains(active)) {
        this.parentElement.classList.remove(active);
      } else {
        const currentlySelected = document.querySelector('.accordion-item.' + active)
        currentlySelected && currentlySelected.classList.remove(active);
        this.parentElement.classList.add(active);
      }
    });
  });

  // Open an accordion link according to the hash in the URL
  const hash = window.location.hash;

  if (hash) {
    document.querySelector(hash)?.classList.add(active);
  }
};
