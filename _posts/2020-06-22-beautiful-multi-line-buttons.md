---
title:  'Building beautiful multi-line buttons'
meta: 
  description: 'Learn how to build some beautiful multi-line buttons with CSS and HTML.'
  image: '/images/posts/improve-project-execution/social.jpg'
  image_credits: 'https://unsplash.com/photos/cYUMaCqMYvI'
---

Today I'm going to show you how to build some beautiful multi-line buttons with CSS and HTML. I had originally built these buttons for a client project but they were scrapped from the design, so I figured that I could share what I built here. 

<p class="codepen" data-height="265" data-theme-id="dark" data-default-tab="result" data-user="keenanpayne" data-slug-hash="JjGRqZp" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Multi-line buttons with arrow animation">
  <span>See the Pen <a href="https://codepen.io/keenanpayne/pen/JjGRqZp">
  Multi-line buttons with arrow animation</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

This is an example of what we are going to be building today. These buttons were designed by the wonderful [Ilija Vujinovic](https://dribbble.com/ilijav), who I have been collaborating with extensively on projects for [Rippling](/blog/re-architecting-rippling-css).

## Let's build buttons

### Starting with markup
I like to write the markup for the component in an accessible fashion when building a new component. Let's start with a  `<button>` element with a class name to denote what background color we want our button to have. We also add our content wrapped in `<span>` tags so that we can style each line of text individually. 

{% include type/tip.html content="If you're wondering why you would start with markup as opposed to writing stylesheets, think about the human body. Does the skeleton sit on top of the skin, or does the skin sit on top of the skeleton? Think of the markup as the skeleton for what we are building. Building the skeleton first can inform how we approach implementing the design and interactions for this component." %}

{% include components/codepen.html
tab='html'
html='<button class="-bg-yellow">
  <span>Sign up &amp;</span>
  <span>Work with Rippling</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>

<button class=" -bg-purple">
  <span>Sign up &amp;</span>
  <span>Use your own broker</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>'
%}

### Adding styles

Now that we have the markup for our button, let's start adding some styles. Note that I am using [Sass](https://sass-lang.com/) as the pre-processor for my CSS for convenience (e.g., nesting, comments, and mixins soon).


{% include components/codepen.html
tab='css'
scss='button {
  --button-background: transparent;
  --button-height: 64px;
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
  height: var(--button-height);
  line-height: var(--button-height);
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
}'
%}

This is pretty standard fare as far as styling a button goes. I use [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) for context-specific properties that we want to alter such as the background, text colors, and the button height. We then remove some of the default button styles such as the border, box-shadow, and apply our own unique styles for the type, spacing, and a unique hover state. 

Our button is starting to come together, but the stacked text needs some refinement. Let's add some styles to match the design: 

{% include components/codepen.html
html='<button class="-bg-yellow">
  <span>Sign up &amp;</span>
  <span>Work with Rippling</span>
  <div>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.10081 0L5.88245 1.23617L10.7016 6.12576H0V7.87423H10.7016L5.88245 12.7638L7.10081 14L14 7L7.10081 0Z" fill="white"/>
    </svg>
  </div>
</button>

<button class=" -bg-purple">
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
  --button-height: 64px;
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
  height: var(--button-height);
  line-height: var(--button-height);
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

  // Descendants
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

To bring our two lines of text together I set distinct `line-height` values for the first and second `<span>` elements. This gives us the multi-line affect that we are looking for. 

### Supporting multiple backgrounds
The design for this component included two different backgrounds, so we want to write some CSS to support these different contexts. 

```css
// Styles for button including modifier classes
```

I scope two modifier classes inside of our button component for each context that this button supports. I then update the custom properties that we set earlier on our button to support the unique background and text colors that each context requires. Approaching our context-specific styles in this way allows us to only write our styles once, but redefine custom properties contextually. 

**Note:** Curious about how and why I write modifier classes starting with a single dash (`-`) and scoped directly inside of a component? [Read this article]() where I go over how and why I write modifier classes in this way. 

### Adding interaction
Interaction was not outliend for this component, so I decided to use the [pacman arrow]() micro-interaction that I've written a tutorial about. I simply swapped in the arrow SVG that was included in the design for this button, and everything worked like a charm. 

Here's what our HTML markup looks like now: 

```html
// Full markup of button including pacman arrow
```

Not much has changed here except for the inclusion of the "Pacman arrow" markup. 

Here's what our CSS (now Sass) looks like:

```
// Full CSS including Pacman arrow
```
As you can see, using Sass as a pre-processor for our CSS provides some convenience in the form of [mixins](), which we use to trigger the Pacman arrow animation when the user hovers over the button. Approaching this interaction in this way allows us to have one set of reusable styles for triggering the Pacman animation, which allows us to re-use these styles very easily across different contexts.

## Conclusion
In the end, even though these buttons ended up getting scrapped from the project I'm working on, I'm happy that I got the chance to build them and share that process with you. 

I think that buttons are such a fun component to build in the world of web development. Buttons can take on countless styles, and depending on the context of the button can have their own unique accessibility considerations. 

I encourage all of you to put your creativity to use and take what we've built in this tutorial and put your own twist on it! If you do, please share a link with what you've built in the comments, or with me on [Twitter](https://twitter.com/KeenanPayne_). I would love to see what you all build. 