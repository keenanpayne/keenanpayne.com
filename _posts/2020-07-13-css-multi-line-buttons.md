---
title:  'Building beautiful multi-line buttons with CSS'
meta: 
  description: 'Learn how to build beautiful multi-line buttons with CSS and HTML.'
  facebook_image: '/images/posts/multi-line-buttons/social_facebook.png'
  twitter_image: '/images/posts/multi-line-buttons/social_twitter.png'
---

Today I'm going to show you how to build some beautiful multi-line buttons with CSS and HTML. I initially built these buttons for a client project, but they ended up getting scrapped. So that my work was not entirely in vain, I decided to write a quick tutorial showing how I built these buttons.

<p class="codepen" data-height="265" data-theme-id="dark" data-default-tab="result" data-user="keenanpayne" data-slug-hash="JjGRqZp" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Multi-line buttons with arrow animation">
  <span>See the Pen <a href="https://codepen.io/keenanpayne/pen/JjGRqZp">
  Multi-line buttons with arrow animation</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

This is an example of what we are going to be building today. These buttons were designed by the wonderful [Ilija Vujinovic](https://dribbble.com/ilijav), who I have been collaborating with extensively on projects for [Rippling](/blog/re-architecting-rippling-css.html).

## Let's build buttons

### Writing button markup
We'll start building our buttons by writing accessible markup. Let's start with a  `<button>` element and add a class name to denote the background color. We also wrap our content in `<span>` tags to style each line of text individually.

{% include type/tip.html content="If you're wondering why we start with markup instead of writing styles, think about the human body: does the skeleton sit on top of the skin, or does the skin sit on top of the skeleton? Think of the markup as the skeleton for what we are building. Writing the markup first can inform how we approach implementing the design and interactions for this component." %}

{% include components/codepen.html
tab='html,result'
html='<button class="-bg-yellow">
  <span>Sign up &amp;</span>
  <span>Work with Rippling</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>

<button class="-bg-purple">
  <span>Sign up &amp;</span>
  <span>Use your own broker</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>'
%}

### Writing button styles

Now that we have the markup for our button let's start adding some styles.

{% include type/note.html content='I am using <a href="https://sass-lang.com/">Sass</a> as the pre-processor for my CSS for convenience (e.g., <a href="https://sass-lang.com/guide#topic-3">nesting</a>, <a href="https://sass-lang.com/documentation/syntax/comments">comments</a>, and <a href="https://sass-lang.com/documentation/at-rules/mixin">mixins</a> in this tutorial).' %}

{% include components/codepen.html
tab='css,result'
html='<button class="-bg-yellow">
  <span>Sign up &amp;</span>
  <span>Work with Rippling</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>

<button class="-bg-purple">
  <span>Sign up &amp;</span>
  <span>Use your own broker</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>'
scss='button {
  --button-background: transparent;
  --button-color: black;

  background-color: var(--button-background);
  border-radius: 4px;
  border: 0;
  box-shadow: none;
  color: var(--button-color);
  cursor: pointer;
  display: inline-block;
  font-size: 1rem;
  font-weight: 500;
  height: 64px;
  line-height: 1;
  padding-left: 1rem;
  padding-right: 2rem;
  position: relative;
  text-align: left;
  text-decoration: none;
  transition: box-shadow 150ms cubic-bezier(0.61, 1, 0.88, 1);
  white-space: nowrap;

  &:hover,
  &:focus {
    box-shadow: 0 3px 7px 1px rgba(50, 50, 50, 0.25);
  }
}'
%}

We start by using [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) for context-specific properties that we want to alter depending on what button color we are using. We'll then remove some of the default button styles such as the border, box-shadow, and apply our own unique styles for the type, spacing, and a custom hover state. 

Our button is starting to come together! However, we still have to style the text inside of our `<span>` elements. We'll nest the styles for our `<span>` element directly beneath all of the styles for our `<button>` for the purposes of this tutorial, but you could also write these styles within their own class and apply that class to the `<span>` element.

{% include components/codepen.html
tab='css,result'
html='<button class="-bg-yellow">
  <span>Sign up &amp;</span>
  <span>Work with Rippling</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>

<button class="-bg-purple">
  <span>Sign up &amp;</span>
  <span>Use your own broker</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>'

scss='button {
  --button-background: transparent;
  --button-color: black;

  background-color: var(--button-background);
  border-radius: 4px;
  border: 0;
  box-shadow: none;
  color: var(--button-color);
  cursor: pointer;
  display: inline-block;
  font-size: 1rem;
  font-weight: 500;
  height: 64px;
  line-height: 1;
  padding-left: 1rem;
  padding-right: 2rem;
  position: relative;
  text-align: left;
  text-decoration: none;
  transition: box-shadow 150ms cubic-bezier(0.61, 1, 0.88, 1);
  white-space: nowrap;

  &:hover,
  &:focus {
    box-shadow: 0 3px 7px 1px rgba(50, 50, 50, 0.25);
  }

  // Button text
  > span {
    display: block;
    line-height: 1;
    padding-right: 1.5rem;

    &:first-of-type {
      color: white;
      font-size: .75rem;
      line-height: 1.5;
    }
  }
}'
%}

To bring our two lines of text together, I set distinct `line-height` values for the first and second `<span>` elements. This gives us the multi-line appearance that we are looking for.

### Supporting multiple button backgrounds
The design for this component included two different backgrounds, so we want to write some CSS to support these different contexts.

{% include components/codepen.html
tab='css,result'
html='<button class="-bg-yellow">
  <span>Sign up &amp;</span>
  <span>Work with Rippling</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>

<button class="-bg-purple">
  <span>Sign up &amp;</span>
  <span>Use your own broker</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>'

scss='button {
  --button-background: transparent;
  --button-color: black;

  background-color: var(--button-background);
  border-radius: 4px;
  border: 0;
  box-shadow: none;
  color: var(--button-color);
  cursor: pointer;
  display: inline-block;
  font-size: 1rem;
  font-weight: 500;
  height: 64px;
  line-height: 1;
  padding-left: 1rem;
  padding-right: 2rem;
  position: relative;
  text-align: left;
  text-decoration: none;
  transition: box-shadow 150ms cubic-bezier(0.61, 1, 0.88, 1);
  white-space: nowrap;

  &:hover,
  &:focus {
    box-shadow: 0 3px 7px 1px rgba(50, 50, 50, 0.25);
  }
  
  // Background colors
  &.-bg-yellow {
    --button-background: #ffb31c;
  }

  &.-bg-purple {
    --button-background: #502d3c;
    --button-color: #ffb31c;
  }

  // Button text
  > span {
    display: block;
    line-height: 1;
    padding-right: 1.5rem;

    &:first-of-type {
      color: white;
      font-size: .75rem;
      line-height: 1.5;
    }
  }
}'
%}

We will write two classes inside of our `<button>` component for each background color that this button supports. Inside of each of these update the custom properties that we declared earlier for the unique background and text color that each button requires. Approaching context-specific styles in this way allows us write style declarations once, but redefine their values on a case-by-case basis.

### Adding button interactions
Interaction was not outlined for this component, so I decided to use the [pacman arrow](/blog/css-arrow-interaction.html) micro-interaction that I've written a tutorial about. To get this interaction working, I simply copied over the markup, swapped in the arrow SVG that was included in the design for this button, and copied over the styles. It works like a charm!

Let's start by adding the necessary markup required for this micro-interaction:

{% include components/codepen.html
tab='html'
html='<button class="-bg-yellow">
  <span>Sign up &amp;</span>
  <span>Work with Rippling</span>
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
      </svg>
      
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
      </svg>
    </div>
  </div>
</button>

<button class="-bg-purple">
  <span>Sign up &amp;</span>
  <span>Use your own broker</span>
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
      </svg>
      
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
      </svg>
    </div>
  </div>
</button>'

scss='button {
  --button-background: transparent;
  --button-color: black;

  background-color: var(--button-background);
  border-radius: 4px;
  border: 0;
  box-shadow: none;
  color: var(--button-color);
  cursor: pointer;
  display: inline-block;
  font-size: 1rem;
  font-weight: 500;
  height: 64px;
  line-height: 1;
  padding-left: 1rem;
  padding-right: 2rem;
  position: relative;
  text-align: left;
  text-decoration: none;
  transition: box-shadow 150ms cubic-bezier(0.61, 1, 0.88, 1);
  white-space: nowrap;

  &:hover,
  &:focus {
    box-shadow: 0 3px 7px 1px rgba(50, 50, 50, 0.25);
  }
  
  // Background colors
  &.-bg-yellow {
    --button-background: #ffb31c;
  }

  &.-bg-purple {
    --button-background: #502d3c;
    --button-color: #ffb31c;
  }

  // Button text
  > span {
    display: block;
    line-height: 1;
    padding-right: 1.5rem;

    &:first-of-type {
      color: white;
      font-size: .75rem;
      line-height: 1.5;
    }
  }
}'
%}

Now let's add the necessary CSS to make our arrows are formatted correctly, and the interaction can run. 

I'm borrowing all of these styles from the tutorial that I've written for the [pacman arrow interaction](/blog/css-arrow-interaction.html) so, if you want a more in-depth overview of how these styles work in creating this interaction, I suggest reading that tutorial. 

{% include components/codepen.html
tab='css,result'
html='<button class="-bg-yellow">
  <span>Sign up &amp;</span>
  <span>Work with Rippling</span>
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
      </svg>
      
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
      </svg>
    </div>
  </div>
</button>

<button class="-bg-purple">
  <span>Sign up &amp;</span>
  <span>Use your own broker</span>
  
  <div class="arrowPacman">
    <div class="arrowPacman-clip">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
      </svg>
      
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
      </svg>
    </div>
  </div>
</button>'

scss='// Pacman Arrow

.arrowPacman {
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

// Button
button {
  --button-background: transparent;
  --button-color: black;

  background-color: var(--button-background);
  border-radius: 4px;
  border: 0;
  box-shadow: none;
  color: var(--button-color);
  cursor: pointer;
  display: inline-block;
  font-size: 1rem;
  font-weight: 500;
  height: 64px;
  line-height: 1;
  padding-left: 1rem;
  padding-right: 2rem;
  position: relative;
  text-align: left;
  text-decoration: none;
  transition: box-shadow 150ms cubic-bezier(0.61, 1, 0.88, 1);
  white-space: nowrap;

  &:hover,
  &:focus {
    @include arrowPacmanInteraction();

    box-shadow: 0 3px 7px 1px rgba(50, 50, 50, 0.25);
  }
  
  // Background colors
  &.-bg-yellow {
    --button-background: #ffb31c;
  }

  &.-bg-purple {
    --button-background: #502d3c;
    --button-color: #ffb31c;
  }

  // Button text
  > span {
    display: block;
    line-height: 1;
    padding-right: 1.5rem;

    &:first-of-type {
      color: white;
      font-size: .75rem;
      line-height: 1.5;
    }
  }
}'
%}

Just like that, you've built a beautiful multi-line button with HTML and CSS!

## Conclusion
I think that buttons are such a fun component to build as a web developer. They are seemingly small and insignificant, but buttons play a key part in many of the interfaces that we interact with on the web. Buttons can also have countless styles, and depending on the context of the button, they can have their own unique accessibility considerations. 

I encourage all of you to put your creativity to use and take what we've built in this tutorial and put your own twist on it. If you do, please share a link with what you've created in the comments, or hit me up on [Twitter](https://twitter.com/KeenanPayne_). I would love to see what you build! 