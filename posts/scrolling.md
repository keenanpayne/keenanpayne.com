---
permalink: '/scrolling/'
title:  "Don't alter scrolling mechanics by scroll-jacking"
meta:
  description: 'Thoughts on how important scrolling is for navigating our devices and what can go wrong when we try to change the mechanics by scroll-jacking.'
  image: '/images/posts/android-iphone/macbook-iphone-watch-stack.jpg'
  image_alt: 'iPhone and Apple Watch stacked on top of Macbook Air'
lede: 'Thoughts on how important scrolling is for navigating our devices and what can go wrong when we try to change such mechanics through scroll-jacking.'
type: Article
date: 2022-03-09
tags:
  - Featured
  - Web Design
  - Web Development
  - User Experience (UX)
---

{% include atoms/figure.html, src: "/images/posts/android-iphone/macbook-iphone-watch-stack.jpg", alt: "iPhone and Apple Watch stacked on top of Macbook Air", caption: "", source_title: "Visuals by Marcus", source_link: "https://www.instagram.com/visuals_by_marcus/" %}

Scrolling is how I use a computer. I also scroll _a lot_ on my smartphone. I scroll elsewhere—through menus on video game consoles, books on my Kindle, apps on my Apple Watch&hellip;

You get the point. I scroll **a lot**.

Most people who use modern computing devices navigate them, in part, by scrolling. Of course, there are other ways to navigate devices. You might search and jump to a specific spot on your device or document. Keyboards and accessibility devices also help us navigate computers. However, such affordances aren't uniformly provided across devices, nor is such functionality as widely understood and adopted as scrolling.

You get the point. _We_ scroll **a lot**.

## My zeal for scrolling  

I've spent 20+ years scrolling through interfaces on countless devices. Such incessant scrolling has informed a more-or-less "intuitive" understanding of how it should feel. I'm used to scrolling through websites and apps on my computer and [iPhone](/switch-from-android-to-iphone/).

If I could sum up my relationship with scrolling in three concise bullet points:
- I know what to expect when scrolling  
- Scrolling reliably gets me from point A to point B  
- Scrolling isn't something I have to think about because it happens so naturally  

This is why I'm such a stickler for how scrolling is implemented. 

And why shouldn't I be?

{% include type/p_large.html, content: "Scrolling is one of my primary means for navigating a bevy of technological devices." %}

## The current state of scrolling  

In my experience, websites are the primary offender for altering scrolling mechanics for **no good reason**. There's nothing more jarring than loading a web page, beginning to scroll through it, and immediately recognizing how unnatural the scrolling feels.

{% include type/note.html content: 'Changing how default scrolling mechanics work in an application is commonly referred to as <em>scroll-jacking</em>.' %}

What's worse is realizing that such a core mechanic was altered for **no good reason**.

I emphasize that scrolling mechanics are frequently changed for **no good reason** because of how mindlessly such changes are thrust upon us. If I don't understand why you've altered scrolling within the first 5 seconds, you've done it for **no good reason**.

This isn't to say there aren't well-intentioned web designers and developers behind the scenes making such decisions who surely mean no ill will to the rest of us. I've been there. But we can do better.

{% include atoms/figure.html, src: "/images/posts/android-iphone/me-on-iphone-with-laptop.jpg", alt: "Me scrolling on my iPhone with a Macbook nearby", caption: "", source_title: "Visuals by Marcus", source_link: "https://www.instagram.com/visuals_by_marcus/" %}

## Deciding whether to alter scrolling mechanics  

Anybody building websites or user interfaces should recognize the importance of consistency with the mechanics of [human-computer interaction](https://en.wikipedia.org/wiki/Human-computer_interaction).

I _never_ want core scrolling functionality to change. If I can't quickly jump down your page using the `Space` key or `CMD + ⇩`, you've fucked up. 

You _might_ be able to get away with altering the physics, but only if it's for a **very good reason**. 

Spoiler alert: it probably isn't.

Furthermore, I don't want to notice or pay attention to scrolling when visiting your website. I like the action of scrolling to be as "invisible" as possible when navigating an interface so I can accomplish what I've set out to do.

{% include type/p_large.html, content: "The goal isn't to enjoy scrolling. The goal is to use scrolling to do something enjoyable." %}

Here are some **very bad reasons** for altering scrolling:  
- You _think_ it adds to the "experience"
- You _think_ it feels "cool" or "fun"
- You _think_ it makes your website "dynamic"
- You _think_ it enhances the animations
- You _think_ I will enjoy it

Here are some **very reasonable reasons** for altering scrolling:  
- Scrolling is part of the mechanics for a game
- You intentionally want to create something experimental and push the boundaries of human-computer interaction while acknowledging the downsides that such alterations incur

Here are some **very good reasons** for altering scrolling:  
- *[crickets chirping](https://www.youtube.com/watch?v=RktX4lbe_g4)*  

## Focus on what matters  

If I could succinctly summarize my thoughts on altering scrolling mechanics for websites, it would be to do so _sparingly_ and _intentionally_. [^1]

[^1]: Though I'm not one for succinctly summarizing my thoughts on anything.

Don't do it if you aren't **100% confident** that changing the scrolling mechanics is _absolutely_ necessary for your goals. Just don't.

Focus your attention elsewhere—the content of your website, art direction, animations, accessibility, usability, etc.

{% include type/p_large.html, content: "Focus on what matters. Don't create new problems by solving a problem that doesn't exist." %}

## Examples and resources  

I haven't proactively searched for resources on this subject. Instead, today's screed is brought to you by _Keenan's Stream of Consciousness (TM)_. I will update this section with examples of scroll-jacking and other resources as I find them.

If you have any examples or resources you would like to share, don't hesitate to drop a comment down below, shoot me an [email](/contact), or hit me up on [Twitter](https://twitter.com/KeenanPayne_)!

<h3 class="_text-h4">Very good examples</h3>

- [The Boat](https://www.sbs.com.au/theboat/)

<h3 class="_text-h4">Very reasonable examples</h3>

- _The fate of half-lucky souls rest here_

<h3 class="_text-h4">Very bad examples</h3>

- _The fate of unlucky souls rest here_

<h3 class="_text-h4">Articles</h3>

- [Scrolljacking, by Robin Rendle](https://www.robinrendle.com/notes/scrolljacking/)

<h3 class="_text-h4">Libraries</h3>

- [Smooth Scrollbar](https://idiotwu.github.io/smooth-scrollbar/)
  - I _frequently_ see this library used across the web. I hate it. No, I don't hate who creates, uses, or maintains it. But I hate how the library is used. It may be a "high performance" plugin, but I strongly dislike having the momentum and physics of scrolling changed.
