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
      var $comments = $('.post-comments');

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
      var content = document.querySelector('.post-content');
      var headings = document.querySelectorAll('.post-content h2, .post-content h3');

      for (var i = 0, len = headings.length; i < len; i++) { 
        let heading = headings[i];
        let id = heading.getAttribute('id');
        let text = heading.textContent;
        var link = document.createElement('a');

        link.classList.add('post-content-header-link');
        link.href = `#${id}`;
        link.setAttribute('title', `Link to ${text}`);
        link.textContent = "#";
        
        heading.prepend(link);
      }
    }
  };


  /**
   * When Document Ready
   */
  $document.ready(function() {
    Helpers.loadDisqus();
    Helpers.linkToHeader();
  });

  $window.on('scroll', function() {
    Helpers.loadDisqus();
  });
})(jQuery);
