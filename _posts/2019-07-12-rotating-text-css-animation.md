---
title:  'Rotating text with CSS animations'
---

I've been toying with different ideas for how I can describe the work that I do to people visiting my website. One idea that I had involved rotating a single word or phrase inside of a sentence to list the different qualities of my work. Here's a quick tutorial of the prototype that I built for how this effect might be achieved using HTML and CSS.

Here's an example of what we will be building: 

<p class="codepen" data-height="500" data-theme-id="0" data-default-tab="result" data-user="keenanpayne" data-slug-hash="mxjGmo" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Rotating text with CSS animations">
  <span>See the Pen <a href="https://codepen.io/keenanpayne/pen/mxjGmo/">
  Rotating text with CSS animations</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

## Writing copy

Before writing any code, I knew that I wanted to have the following headline on my website:

{% include type/p-large.html content="I'll make your website... [insert adjective here]" %}

For my adjectives, I made a list of what I wanted to rotate through:

- beautiful
- maintainable
- perfect

Having a rough idea of the copy that I will be using helps me understand what the markup will need to look like as I'm coding. 

## Marking up the DOM

After writing up my copy, I started marking up the DOM. Marking up the DOM before embarking on styling allows me to define the semantics of how this code should be written, then write the styles to fit these semantics.

```html
<p class="rotatingText">
  I'll make your website&hellip;

  <span class="rotatingText-adjective">beautiful</span>
  <span class="rotatingText-adjective">maintainable</span>
  <span class="rotatingText-adjective">perfect 👌</span>
</p>
```

## Basic styles

After marking up the DOM, I styled my text so that I could get an understanding of how the styles would be changing as the animation runs.

```css
.rotatingText {
  font-family: 'Georgia', serif;
  font-style: italic;
  font-size: 18px;
  text-align: center;
}

.rotatingText-adjective { 
  font-family: 'Open Sans', sans-serif;
  font-size: 50px;
  font-style: normal;
  font-weight: 700;
  left: 0;
  margin-bottom: 0;
  margin-top: 50px;
  position: absolute;
  right: 0;
  text-align: center;
  text-transform: uppercase;
  top: 0;
}
```

<p class="codepen" data-height="350" data-theme-id="0" data-default-tab="result" data-user="keenanpayne" data-slug-hash="9b5c0f4a869310dfa38d21be5a42f004" style="height: 350px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Rotating text with CSS animations [step 1]">
  <span>See the Pen <a href="https://codepen.io/keenanpayne/pen/9b5c0f4a869310dfa38d21be5a42f004/">
  Rotating text with CSS animations [step 1]</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

## Adding the animation

Our headline is starting to come together after adding some styles. Now it's time to tackle the animation.

### Toggling visibility

The first step in the animation is ensuring that all of the adjectives in our headline are hidden until the animation runs. Hiding things on the web can be done in many different ways, and it's important that our approach will not impact the accessibility of our content for visitors using screen readers or other assistive technologies. For this project, the visibility of our content will change by toggling the [`opacity`](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity) property on the `.rotatingText-adjective` class.

```css
.rotatingText-adjective { 
  font-family: 'Open Sans', sans-serif;
  font-size: 50px;
  font-style: normal;
  font-weight: 700;
  left: 0;
  margin-bottom: 0;
  margin-top: 50px;
* opacity: 0;
  position: absolute;
  right: 0;
  text-align: center;
  text-transform: uppercase;
  top: 0;
}
```

> Hiding content on the web is tricky, I recommend reading Scott O'Hara's [article on inclusively hiding content](https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html), as well as Zell Liew's article on [using opacity to hide content](https://zellwk.com/blog/hide-content-accessibly/).

With the adjectives hidden, we can write an animation using CSS keyframes that toggle the `opacity` property.

```css
@keyframes rotate {
  0% {
    opacity: 0;
  }
  
  20%, 80% {
    opacity: 1;
  }
  
  100% {
    opacity: 0;
  }
}
```

We then add this animation to each of our adjectives so that it runs one after another. This effect is accomplished by staggering the values in the [`animation-delay`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay) property.

```css
.rotatingText-adjective:nth-of-type(1) {
  animation-name: rotate;
  animation-duration: 1.5s;
  animation-delay: .5s;
}

.rotatingText-adjective:nth-of-type(2) {
  animation-name: rotate;
  animation-duration: 1.5s;
  animation-delay: 1.75s;
}

.rotatingText-adjective:nth-of-type(3) {
  animation-name: rotate;
  animation-duration: 1.5s;
  animation-delay: 3s;
}
```

<p class="codepen" data-height="350" data-theme-id="0" data-default-tab="result" data-user="keenanpayne" data-slug-hash="7f725b7f624840b9155fe2c6127c143b" style="height: 350px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Rotating text with CSS animations [step 2]">
  <span>See the Pen <a href="https://codepen.io/keenanpayne/pen/7f725b7f624840b9155fe2c6127c143b/">
  Rotating text with CSS animations [step 2]</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

### Finessing the last adjective
The animation is successfully running! However, our last adjective slides away with the rest, so we'll need to make some adjustments so that it stays on the screen. To do this, we can create a set of keyframes specifically for our last animation:

```css
@keyframes rotate-last {
  0% {
    opacity: 0;
  }
  
  100% {
    opacity: 1;
  }
}
```

We then apply this animation to our last adjective:

```css
.rotatingText-adjective:nth-of-type(3) {
* animation-name: rotate-last;
  animation-duration: 1.5s;
  animation-delay: 3s;
* animation-fill-mode: forwards;
}
```

Also note that I added the declaration [`animation-fill-mode: forwards`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode) which indicates that the animation should stop on the last frame of the animation after running.

### Moving the text

Now that the visibility of the text is toggled, we can update our keyframes to create the rotating effect that we want:

```css
@keyframes rotate {
  0% {
    opacity: 0;
    transform: translate3d(0, 50px, 0);
  }
  
  20%, 80% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  
  100% {
    opacity: 0;
    transform: translate3d(0, -25px, 0);
  }
}
```

This is done by animating the [`translate3d()`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translate3d) value inside of the [`transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) property. The `translate3d()` value accepts three arguments: x, y, and z-axis positions. Because our text should be moving from the bottom up, we are only concerned with updating the y-axis.

To give our text the effect of moving from the bottom up, we push it down on the y-axis fifty pixels. We move our text into position by resetting our y-axis to zero. Finally, we slide our text out of place by negative twenty-five pixels on the y-axis. This gives us the rotating effect that we want.

We will use a slightly modified version of this code for our last adjective. Because our last adjective should stay in place, we can omit the declaration that moves our adjective negative twenty-five pixels.

```css
@keyframes rotate-last {
  0% {
    opacity: 0;
    transform: translate3d(0, 50px, 0);
  }
  
  50%, 100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
```

With that, we have a fully functional rotating headline just like we wanted:

<p class="codepen" data-height="350" data-theme-id="0" data-default-tab="result" data-user="keenanpayne" data-slug-hash="dd5fe271f920ab9c22b2506a590e0e9d" style="height: 350px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Rotating text with CSS animations [step 3]">
  <span>See the Pen <a href="https://codepen.io/keenanpayne/pen/dd5fe271f920ab9c22b2506a590e0e9d/">
  Rotating text with CSS animations [step 3]</a> by Keenan Payne (<a href="https://codepen.io/keenanpayne">@keenanpayne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

Our final code looks like this:

### HTML
```html
<p class="rotatingText">
  I'll make your website&hellip;

  <span class="rotatingText-adjective">beautiful</span>
  <span class="rotatingText-adjective">maintainable</span>
  <span class="rotatingText-adjective">perfect 👌</span>
</p>
```

### CSS
```css
.rotatingText {
  font-family: "Georgia", serif;
  font-style: italic;
  font-size: 18px;
  text-align: center;
}

.rotatingText-adjective {
  font-family: "Open Sans", sans-serif;
  font-size: 50px;
  font-style: normal;
  font-weight: 700;
  left: 0;
  margin-bottom: 0;
  margin-top: 50px;
  opacity: 0;
  position: absolute;
  right: 0;
  text-align: center;
  text-transform: uppercase;
  top: 0;
}

.rotatingText-adjective:nth-of-type(1) {
  animation-name: rotate;
  animation-duration: 1.5s;
  animation-delay: 0.5s;
}

.rotatingText-adjective:nth-of-type(2) {
  animation-name: rotate;
  animation-duration: 1.5s;
  animation-delay: 1.75s;
}

.rotatingText-adjective:nth-of-type(3) {
  animation-name: rotate-last;
  animation-duration: 1.5s;
  animation-delay: 3s;
  animation-fill-mode: forwards;
}

@keyframes rotate {
  0% {
    opacity: 0;
    transform: translate3d(0, 50px, 0);
  }
  
  20%, 80% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  
  100% {
    opacity: 0;
    transform: translate3d(0, -25px, 0);
  }
}

@keyframes rotate-last {
  0% {
    opacity: 0;
    transform: translate3d(0, 50px, 0);
  }
  
  50%, 100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
```

## Wrap-up

Animating the `translate3d()` value on the `transform` property is a simple but powerful way to move elements on a page. This same property can be used to move elements along all three axes, offering many different animation possibilities.

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>