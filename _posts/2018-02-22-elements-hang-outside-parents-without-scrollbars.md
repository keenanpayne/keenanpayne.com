---
title:  'Allow elements to hang outside of their fixed-width parents without scrollbars'
---

I was recently working on a landing page at Asana that was designed by [Devin Jacoviello](http://jacoviello.com/), one of our talented communication designers at Asana. The page was beautiful and seemed to be a relatively straight-forward project. As we discussed developing the page during our design hand-off, there was one area that did not seem straight-forward in its implementation.

The area that confused me was the component that we call the "masthead." This component lives at the top of the page and contains our page title, subtitle, and a CTA. Additionally, the masthead component for this specific landing page has floating elements that surround the content and provide some visual elegance.

Because this landing page is not live, let's say the design looks something like this:

{% include atoms/figure.html src="/images/posts/elements-hang-outside-parents/example-design.png" alt="Landing page design" %}

As Devin and I walked through the implementation details, he described the interaction for the masthead component. He explained that at sub-1920 pixel viewports the floating elements would be positioned off-screen surrounding the content. If the screen grew larger, the elements would remain at their location, but more of the element would be visible to the user.

When described to me, this seemed like a pretty straight-forward interaction. I had never built something like this before, but I wouldn't imagine it being very hard to accomplish.

If that were the case, I wouldn't be writing this blog post.

## Approaches

### Solution 1

During my first pass at implementing the design, I built a layout with a fixed-width container that contains many child elements that are absolutely positioned to achieve the desired effect.

<p data-height="500" data-theme-id="dark" data-slug-hash="a4d4d78c334a82834eec8a23d1aa94a3" data-default-tab="result" data-user="keenanpayne" data-embed-version="2" data-pen-title="Allow elements to hang outside of a fixed-width container [Attempt 1]" class="codepen">See the Pen <a href="https://codepen.io/keenanpayne/pen/a4d4d78c334a82834eec8a23d1aa94a3/">Allow elements to hang outside of a fixed-width container [Attempt 1]</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

This solution achieves the desired effect, with one caveat: we have horizontal overflow because of our off-screen content.

### Solution 2

Naturally, if we want to remove the horizontal overflow for our off-screen content, we can apply `overflow-x: hidden;` to our container and see if that solves our problem.

<p data-height="500" data-theme-id="dark" data-slug-hash="f61d113cfe2f39438c845b32e3e90c73" data-default-tab="result" data-user="keenanpayne" data-embed-version="2" data-pen-title="Allow elements to hang outside of a fixed-width container [Solution 2]" class="codepen">See the Pen <a href="https://codepen.io/keenanpayne/pen/f61d113cfe2f39438c845b32e3e90c73/">Allow elements to hang outside of a fixed-width container [Solution 2]</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>) on <a href="https://codepen.io">CodePen</a>.</p>

This solution works well on sub-1920 pixel viewports, but when you have a larger viewport, we get the following issue:

{% include atoms/figure.html src="/images/posts/elements-hang-outside-parents/example-complete.png" alt="Landing page design" %}

Because we're removing all horizontal overflow from our container, when you have a viewport larger than 1920 pixels, the remaining parts of our floating elements are cut off.

### Solution 3

We need a solution that allows our floating elements to be positioned off-screen on sub-1920 pixel viewports without any horizontal overflow, and on viewports larger than 1920 pixels the entire floating elements are visible.

To achieve this, we are going to add an additional container to our layout.

<p data-height="600" data-theme-id="dark" data-slug-hash="321f001ab7cfd3ba9b696192cba6614c" data-default-tab="result" data-user="keenanpayne" data-embed-version="2" data-pen-title="Allow elements to hang outside of a fixed-width container" class="codepen">See the Pen <a href="https://codepen.io/keenanpayne/pen/321f001ab7cfd3ba9b696192cba6614c/">Allow elements to hang outside of a fixed-width container</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>) on <a href="https://codepen.io">CodePen</a>.</p>

_Note: Reduce the zoom of your browser window if you have a monitor smaller than 1920 pixels and wish to see the effect._

Now, when our user visits this page on a 1920 pixel monitor, they will see all of the floating content, similar to the image at the beginning of this post.

Why does this work? It's because we shift the logic to ensure that horizontal overflow is not visible. We place `overflow-x: hidden;` on our outer-most container, and in our inner container, we nest all of our absolutely positioned floating elements. Because we are not hiding the overflow in our inner container, the elements that are nested inside of it will display on larger viewports but will not overflow on smaller viewports thanks to our outer container. It's a pretty simple trick and only requires one extra element to work properly.

## Shouts Out

Quick shout out to [Chris Silich](https://chrissilich.com/) that wrote a blog post about this a few years ago, but no longer seems to be published. This post was one of the only resources I found documenting this solution, and I thought it would be valuable to write about it again since his original post contains broken images and no working examples.
