(function() {
  /**
   * Global Variables
   */
  var disqusLoaded = false;


  /**
   * JavaScript Helpers
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
      var comments = document.querySelector('.post-comments');
      
      if (comments) { 
        if (!disqusLoaded && comments.length !== 0) {
          var commentsOffset = comments.offsetTop;
          var pageOffset = window.pageYOffset;
          var offsetTrigger = (commentsOffset - 1000);

          if(!disqusLoaded && pageOffset > offsetTrigger) {
            Helpers.disqusEmbed();
          }
        }
      }
    },


    /**
     * linkToHeader()
     *
     * Prepend headers with anchor links 
     *
     * @returns null
     */
    linkToHeader: function() {
      var headings = document.querySelectorAll('.post-content h2, .post-content h3');

      if (headings.length) { 
        for (var i = 0, len = headings.length; i < len; i++) { 
          let heading = headings[i];
          let id = heading.getAttribute('id');
          let text = heading.textContent;
          var link = document.createElement('a');

          link.classList.add('post-content-header-link');
          link.href = `#${id}`;
          link.setAttribute('title', text);
          link.textContent = "#";
          
          heading.prepend(link);
        }
      }
    }
  };


  /**
   * Initialize
   */
  window.onload = function() { 
    Helpers.loadDisqus();
    Helpers.linkToHeader();
  };

  window.onscroll = function() { 
    Helpers.loadDisqus();
  };
})();
