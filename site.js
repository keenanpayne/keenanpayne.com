(function($) {
  /**
   * JavaScript Helpers
   *
   * @author Keenan Payne
   */
  Helpers = {
    /**
     * isOnScreen()
     *
     * Used to determine if an element is currently visible in the viewport.
     * http://upshots.org/javascript/jquery-test-if-element-is-in-viewport-visible-on-screen
     *
     * @param {element} Element to test against
     * @returns {boolean} Returns true if element is in viewport; false if it is not
     */
    isOnScreen: function(el) {
      if (el.length) {
        var viewport = {};
        viewport.top = $(window).scrollTop();
        viewport.bottom = viewport.top + $(window).height();

        var bounds = {};
        bounds.top = el.offset().top;
        bounds.bottom = bounds.top + el.outerHeight();

        // Ensure that elements are displayed if window is reloaded below elements
        // that would otherwise be animated. i.e. no element animates as you scroll up
        if (viewport.top >= bounds.top) {
          return true;
        } else {
          return ((bounds.top <= viewport.bottom) && (bounds.bottom >= viewport.top));
        }
      }
    },


    /**
     * animateVisibleElement()
     *
     * Adds an animation (ie, modifier class) to an element or set of elements
     * once they are in the viewport.
     *
     * @param {array,element} Array of elements or single element
     * @param {element} Animation modifier class to be added
     * @returns null
     */
    animateVisibleElement: function(el, animation) {
      function showElement(el) {
        var visibility = Helpers.isOnScreen(el);

        if (visibility == true) {
          el.addClass(animation);
        }
      }

      if (el instanceof Array) {
        for (var i = 0; i < el.length; i++) {
          var $current = $(el[i]);
          showElement($current);
        }
      } else {
        var $current = $(el);
        showElement($current);
      }
    },


    /**
     * siteAnimations()
     *
     * Easy grouping of animations across the website
     *
     * @returns null
     */
    siteAnimations: function() {
      Helpers.animateVisibleElement(
        [
          'h1',
          '.tile',
          '.tile-header',
          '.tile-description',
          '.masthead',
          '.contentBox',
          '.lab',
          '.contact',
          '.wufoo',
          '.project',
          '.testimonial',
          'main dl:nth-of-type(1) span',
          'main dl:nth-of-type(2) span',
          '.post'
        ], '-animated'
      );
    },


    /**
     * findTop()
     */
    findTop: function(obj) {
      var curtop = 0;

      if (obj.offsetParent) {
        do {
          curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);

        return curtop;
      }
    },


    /**
     * disqusEmbed()
     *
     * Load Disqus comments per embed code
     *
     * @returns null
     */
    disqusEmbed: function() {
      var disqus_shortname = 'keenan-payne';
      var dsq = document.createElement('script');
      dsq.type = 'text/javascript';
      dsq.async = true;
      dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';

      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);

      disqusLoaded = true;
    },


    /**
     * loadDisqus()
     *
     * @returns null
     */
    loadDisqus() {
      var comments = document.getElementsByClassName('comments')[0];
      var disqusLoaded = false;

      if(window.location.hash.indexOf('#comments') > 0) {
        Helpers.disqusEmbed();
      }

      if(comments) {
        var commentsOffset = Helpers.findTop(comments);

        window.onscroll = function() {
          if(!disqusLoaded && window.pageYOffset > commentsOffset - 1000) {
            Helpers.disqusEmbed();
          }
        }
      }
    }
  };


  /**
   * When Document Ready
   */
  $(document).ready(function() {
    Helpers.siteAnimations();

    var disqus_shortname = 'keenan-payne';
    var dsq = document.createElement('script');
    dsq.type = 'text/javascript';
    dsq.async = true;
    dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    disqusLoaded = true;
  });

  $(window).on('scroll resize', function() {
    Helpers.siteAnimations();
  });
})(jQuery);
