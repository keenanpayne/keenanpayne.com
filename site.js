(function($) {
  /**
   * Global Variables
   */
  var $window = $(window);
  var $document = $(document);
  var disqusLoaded = false;


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
          '.post',
          '.postList'
        ], '-animated'
      );
    },


    /**
     * disqusEmbed()
     *
     * Load Disqus comments per embed code
     *
     * @returns null
     */
    disqusEmbed: function() {
      var shortname = 'keenan-payne';
      var disqus = document.createElement('script');
      disqus.type = 'text/javascript';
      disqus.async = true;
      disqus.src = '//' + shortname + '.disqus.com/embed.js';

      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(disqus);

      disqusLoaded = true;
    },


    /**
     * loadDisqus()
     *
     * Conditions for when to load Disqus comments
     *
     * @returns null
     */
    loadDisqus: function() {
      // Load when comments are scrolled to
      var $comments = $('.comments');

      if (!disqusLoaded && $comments.length !== 0) {
        var commentsOffset = $comments.offset().top;
        var pageOffset = window.pageYOffset;
        var offsetTrigger = (commentsOffset - 1000);

        if(!disqusLoaded && pageOffset > offsetTrigger) {
          Helpers.disqusEmbed();
        }
      }
    },


    /**
     * linkToHeader()
     *
     * Prepend headers with jump links for accessibility
     *
     * @returns null
     */
    linkToHeader: function() {
      var headings = ["h1", "h2", "h3", "h4"];

      jQuery.each(headings, function(i, heading) {
        var $heading = $(heading, '.post-content');
        var headingText = $heading.text();
        var headingID = $heading.attr("id");
        var headingLink = `<a class="post-content-header-link"
                              href="#${headingID}"
                              title="Link to ${headingText}">#</a>`;

        $heading.prepend(headingLink);
      });
    },


    /**
     * init()
     *
     * Common functions to run on initialization
     *
     * @returns null
     */
    init: function() {
      Helpers.siteAnimations();
      Helpers.loadDisqus();
    }
  };


  /**
   * When Document Ready
   */
  $document.ready(function() {
    Helpers.init();
    Helpers.linkToHeader();
  });

  $window.on('scroll', function() {
    Helpers.init();
  });
})(jQuery);
