---
title:  "Building a 'Pacman arrow' micro-interaction with CSS"
meta: 
  description: 'Learn how to build a beautiful arrow micro-interaction with CSS.'
  image: '/images/posts/css-arrow-interaction/social.gif'
---

I helped build the [Asana for Marketers](https://asana.com/teams/marketing) page with [Devin Jacoviello](http://jacoviello.com/) while I was still at Asana. Part of this work involved making a neat micro-interaction for an arrow icon that Devin wanted to use throughout the page. Today I am going to walk you through how I created this interaction and why I built it the way that I did. 

<p class="codepen" data-height="265" data-theme-id="dark" data-default-tab="result" data-user="keenanpayne" data-slug-hash="mdVRrGm" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="CSS &amp;quot;pacman arrow&amp;quot; micro-interaction">
  <span>See the Pen <a href="https://codepen.io/keenanpayne/pen/mdVRrGm">
  CSS &quot;pacman arrow&quot; micro-interaction</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

Our goal is to create an animation of an arrow following itself (hence the name "Pacman arrow") when we hover over an element on the page. We also want this interaction to exist in multiple elements throughout the page, so it is essential to build this in a context-agnostic way.

## Writing the markup
We'll start by writing the markup for this interaction. For this tutorial, I will be putting this arrow animation inside of a `<button>` element with some accompanying text. However, once you finish this tutorial, you should be able to use this interaction inside of any element. 

{% include components/codepen.html
tab='html,result'
html='<button>
  Just Do It
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>

      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>
    </div>
  </div>
</button>'
%}

The markup for this element is pretty straight-forward. We wrap our arrow inside of a `div` containing the class name `arrowPacman`. This element will be the outer-most container for our arrows. 

Next, we create a nested `div` with a class name `arrowPacman-clip`. This element is what we will be moving to create the left-to-right animation. More on that once we add some CSS. 

Lastly, we have two instances of the same SVG arrow, one right after the other that will aid in giving us the left-to-right effect.

## Adding the styles
The real magic of this interaction comes from the CSS that we write for the markup that we just created. 

### Styling the button 
We'll start by writing some simple styles for our `<button>` element:

{% include components/codepen.html
tab='css,result'
html='<button>
  Just Do It
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>

      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>
    </div>
  </div>
</button>'
scss='button {
  background-color: white;
  border: 2px solid black;
  border-radius: 25px;
  box-shadow: none;
  color: black;
  cursor: pointer;
  display: inline-block;
  font-weight: 600;
  padding: .75rem 2.5rem .75rem 1rem;
  position: relative;
  white-space: nowrap;
}'
%}

There is nothing too out of the ordinary here. The only thing to note is that we are giving our button some extra padding on the right side to account for the space that arrow will take up. 

### Styling arrow container
Now let's get to the fun stuff. To start building our arrow animation, we'll start by adding some styles to the `arrowPacman` class.

{% include components/codepen.html
tab='css,result'
html='<button>
  Just Do It
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>

      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>
    </div>
  </div>
</button>'
scss='.arrowPacman {
  --arrow-width: 20px;
  --arrow-spacer: 4px;
  --arrow-plus-spacer: calc(var(--arrow-width) + var(--arrow-spacer));
  
  overflow: hidden;
  position: absolute;
  right: -.2em;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--arrow-plus-spacer);
}

button {
  background-color: white;
  border: 2px solid black;
  border-radius: 25px;
  box-shadow: none;
  color: black;
  cursor: pointer;
  display: inline-block;
  font-weight: 600;
  padding: .75rem 2.5rem .75rem 1rem;
  position: relative;
  white-space: nowrap;
}'
%}

The first thing you will notice is that I am using [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) inside of the `arrowPacman` class to store a few values. These properties are important because creating this animation relies on clever use of our arrow width, as well as the space between our two arrows. We do this by storing each of these values in `--arrow-width`, and `--arrow-spacer`, respectively. We will also be using the combined width of both the arrow and it's spacer, so we store that value in `--arrow-plus-spacer` where we make use of the CSS [`calc`](https://developer.mozilla.org/en-US/docs/Web/CSS/calc) function to add the value of the two custom properties that we previously declared. 

We also want to position our arrow inside the button, so we give the `arrowPacman` element a value of **`absolute`** for the `position` property, along with values for `top`, `right`, and `transform` to create the alignment that we want. 

To ensure that only one of our arrows is visible, we set the `width` property on our `arrowPacman` class to the value of **`--arrow-plus-spacer`** along with the `overflow` property to **`hidden`**. These declarations will prevent our second arrow from being visible. 

### Styling SVG elements
We want to make sure that the two arrows inside of our button have the correct size and spacing, so let's add some styles inside of the `arrowPacman` class to target the `svg` elements. 

{% include components/codepen.html
tab='css,result'
html='<button>
  Just Do It
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>

      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>
    </div>
  </div>
</button>'
scss='.arrowPacman {
  --arrow-width: 20px;
  --arrow-spacer: 4px;
  --arrow-plus-spacer: calc(var(--arrow-width) + var(--arrow-spacer));
  
  overflow: hidden;
  position: absolute;
  right: -.2em;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--arrow-plus-spacer);

  svg {
    height: 16px;
    width: var(--arrow-width);
    
    &:last-of-type {
      margin-left: var(--arrow-spacer);
    }
  }
}

button {
  background-color: white;
  border: 2px solid black;
  border-radius: 25px;
  box-shadow: none;
  color: black;
  cursor: pointer;
  display: inline-block;
  font-weight: 600;
  padding: .75rem 2.5rem .75rem 1rem;
  position: relative;
  white-space: nowrap;
}'
%}

We set the `width` and `height` of each SVG element accordingly, and give our last SVG a `margin-left` value of **`--arrow-spacer`**. This added space ensures that our two arrows are not sitting right next to each other. 

### Styling the arrow "clip"
To create the left-to-right effect that we are looking for, we need to add some styles to our `arrowPacman-clip` element. 

{% include components/codepen.html
tab='css,result'
html='<button>
  Just Do It
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>

      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>
    </div>
  </div>
</button>'
scss='.arrowPacman {
  --arrow-width: 20px;
  --arrow-spacer: 4px;
  --arrow-plus-spacer: calc(var(--arrow-width) + var(--arrow-spacer));
  
  overflow: hidden;
  position: absolute;
  right: -.2em;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--arrow-plus-spacer);

  svg {
    height: 16px;
    width: var(--arrow-width);
    
    &:last-of-type {
      margin-left: var(--arrow-spacer);
    }
  }
}

.arrowPacman-clip {
  align-items: center;
  display: flex;
  overflow: hidden;
  transform: translateX(calc(var(--arrow-plus-spacer) * -1));
  width: calc(var(--arrow-plus-spacer) + var(--arrow-width));
}

button {
  background-color: white;
  border: 2px solid black;
  border-radius: 25px;
  box-shadow: none;
  color: black;
  cursor: pointer;
  display: inline-block;
  font-weight: 600;
  padding: .75rem 2.5rem .75rem 1rem;
  position: relative;
  white-space: nowrap;
}'
%}

We use [flexbox](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox) to align our two arrows. Next, we set the `transform` property to **`-24px`** by utilizing the `--arrow-plus-spacer` custom property that we declared earlier, and multiplying it by **`-1`**. This moves our entire `arrowPacman-clip` to the left, which is how we will create the left-to-right animation.

Lastly, we set the width of this element to **`44px`** by once again utilizing the CSS `calc` function, adding the `--arrow-plus-spacer` and `--arrow-width` custom properties. This width value is important because it is the total width of both arrows plus the space between the arrows, which is crucial in creating a seamless left-to-right animation.

### Creating the arrow animation
Now that we've set the stage let's add the styles necessary to make this animation work. 

{% include components/codepen.html
tab='css,result'
html='<button>
  Just Do It
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>

      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="black"/>
      </svg>
    </div>
  </div>
</button>'
scss='.arrowPacman {
  --arrow-width: 20px;
  --arrow-spacer: 4px;
  --arrow-plus-spacer: calc(var(--arrow-width) + var(--arrow-spacer));
  
  overflow: hidden;
  position: absolute;
  right: -.2em;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--arrow-plus-spacer);

  svg {
    height: 16px;
    width: var(--arrow-width);
    
    &:last-of-type {
      margin-left: var(--arrow-spacer);
    }
  }
}

.arrowPacman-clip {
  align-items: center;
  display: flex;
  overflow: hidden;
  transform: translateX(calc(var(--arrow-plus-spacer) * -1));
  width: calc(var(--arrow-plus-spacer) + var(--arrow-width));
}

@keyframes pacman {
  to {
    transform: translateX(0);
  }
}

@mixin arrowPacmanInteraction() {
  .arrowPacman-clip {
    animation-delay: 150ms;
    animation-duration: 0.8s;
    animation-name: pacman;
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(0.55, 0, 0.21, 1);
  }
}

button {
  background-color: white;
  border: 2px solid black;
  border-radius: 25px;
  box-shadow: none;
  color: black;
  cursor: pointer;
  display: inline-block;
  font-weight: 600;
  padding: .75rem 2.5rem .75rem 1rem;
  position: relative;
  white-space: nowrap;

  &:hover { 
    @include arrowPacmanInteraction();
  }
}'
%}

The first thing we do is use [CSS @keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes) to define the `pacman` animation, which contains the styles that will be applied for our animation. Because we want to move our arrow left to right, we define our styles as `transform: translateX(0)`. We intend to apply styles to the `arrowPacman-clip` element. Because we've moved the `arrowPacman-clip` element to the left by **-24px** earlier, resetting the value to **0** gives us the left-to-right animation.

One of the powerful features of Sass is that you can define [mixins](https://sass-lang.com/documentation/at-rules/mixin), which allow you to define a set of styles that can be reused across multiple contexts. The styles in this mixin are what allow this interaction to work with the button that we just built. We start by creating a mixin named `arrowPacmanInteraction`, which contains all of the styles that will enable our animation to run. Then we include this mixin in the hover state for our button by using `@include arrowPacmanInteraction()`, which allows the animation to run when we hover over the button.

That's it! We now have a cute little "Pacman arrow" animation for our button. 

## Conclusion
I hope you all had as much fun building this micro-interaction as I did. While the approach I took in this article works well for animating arrows, this same approach can be applied to create all sorts of interactions in different directions. 

If like this article, consider subscribing to my [newsletter](https://keenanpayne.us3.list-manage.com/subscribe/post?u=adccd14711a389b26182cef03&id=c7f1290469) for more content just like this. Also, don't hesitate to reach out to me in the comments or on [Twitter](https://twitter.com/KeenanPayne_) to share what you've built, and ask questions. 