import lazyLoading from './modules/lazyLoading';
import mobileNavigation from './modules/mobileNavigation';


// Initialize
window.addEventListener('load', () => {
  mobileNavigation();
  lazyLoading();
});
