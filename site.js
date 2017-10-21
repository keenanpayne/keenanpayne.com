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
