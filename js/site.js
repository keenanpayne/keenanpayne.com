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
     * mobileNav()
     *
     * Mobile navigation functionality
     *
     * @returns null
     */
    mobileNav: function() {
      var $mobileNavToggle = $("[data-mobileNav-toggle]");

      $mobileNavToggle.click(function() {
        $mobileNavToggle.toggleClass('-is-active');
        $('.mobileNav').toggleClass('-is-active');
        $('body').toggleClass('-no-scroll');
      });
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
      var headings = ["h2", "h3"];

      jQuery.each(headings, function(i, heading) {
        var $heading = $(heading, '.post-content');
        var headingText = $heading.text();
        var headingID = $heading.attr("id");
        var headingLink = `<a class="post-content-header-link"
                              href="#${headingID}"
                              title="Link to ${headingText}">
                              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" data-icon="link-intact" width="32" height="32" data-container-transform="scale(1 1 ) translate(0 )" viewBox="0 0 32 32">
                                <path d="M24.5-.031c-1.918.001-3.808.714-5.25 2.156l-3.906 3.906 2.125 2.125 3.906-3.906c1.716-1.716 4.546-1.721 6.375.031 1.779 1.704 1.737 4.499 0 6.344-.01.011-.021.02-.031.031l-6.969 6.969c-1.716 1.716-4.577 1.753-6.406 0l-2.094 2.156c2.971 2.847 7.741 2.853 10.625-.031l7-7c2.832-2.955 2.98-7.74-.031-10.625-1.486-1.424-3.426-2.157-5.344-2.156zm-10.094 10c-1.918.001-3.839.714-5.281 2.156l-7 7a1.5 1.5 0 0 0 0 .031c-2.832 2.955-2.98 7.74.031 10.625 2.971 2.847 7.71 2.853 10.594-.031l4-4-2.125-2.125-4 4c-1.716 1.716-4.546 1.753-6.375 0-1.789-1.715-1.737-4.53.031-6.375l6.969-7c1.716-1.716 4.577-1.721 6.406.031l2.094-2.156c-1.486-1.424-3.426-2.157-5.344-2.156z"
                                />
                              </svg>
                              </a>`;

        $heading.append(headingLink);
      });
    },


    /**
     * navHover()
     *
     * Creates navigation opacity hover effect
     *
     * @param el {element} current navigation element
     * @returns null
     */
    navHover: function(el) {
      var $link = $(el);
      var $allLinks = $('.siteHeader-navigation a');

      $link.hover(function() {
        var $this = $(this);

        $allLinks.toggleClass('-is-inactive');
        $this.removeClass('-is-inactive');
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
      Helpers.mobileNav();
      Helpers.loadDisqus();
      Helpers.navHover('.siteHeader-navigation a');
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
