window.addEventListener("load",function(){var e,t;e="-active",(t=document.querySelector(".hamburger")).addEventListener("click",function(r){window.matchMedia("(max-width: 768px)").matches&&(r.preventDefault(),t.classList.toggle(e),document.documentElement.classList.toggle("-no-scroll"),document.querySelector(".navigation").classList.toggle(e))}),function(){var e=[].slice.call(document.querySelectorAll("img.lazy"));if([].slice.call(document.querySelectorAll("video.lazy")),[].slice.call(document.querySelectorAll("iframe.lazy")),"IntersectionObserver"in window){var t=new IntersectionObserver(function(e,r){e.forEach(function(e){if(e.isIntersecting){var r=e.target;if("video"==e.target.localName){var c=Array.from(e.target.children).filter(function(e){return"source"===e.localName})[0];c.src=c.dataset.src,r.load(),r.play()}else r.src=r.dataset.src;r.classList.remove("lazy"),t.unobserve(r)}})},{rootMargin:"500px"});e.forEach(function(e){t.observe(e)})}}()});
//# sourceMappingURL=app.esm.js.map
