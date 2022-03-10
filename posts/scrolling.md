---
permalink: '/scrolling/'
title:  'Altering scrolling mechanics by scroll-jacking'
meta:
  description: ''
  image: '/images/posts/android-iphone/macbook-iphone-watch-stack.jpg'
  image_alt: ''
lede: 
type: Article
date: 2022-03-09
tags:
  - Featured
  - Web Design
  - Web Development
  - User Experience (UX)
---

{% include atoms/figure.html, src: "/images/posts/android-iphone/macbook-iphone-watch-stack.jpg", alt: "", caption: "", source_title: "Visuals by Marcus", source_link: "https://www.instagram.com/visuals_by_marcus/" %}

Scrolling is how I use a computer. I also scroll _a lot_ on my smartphone. I scroll elsewhere, such as through menus on video game consoles, through books on my Kindle, through apps on my Apple Watch&hellip;

You get the point. I scroll a lot.

And you might as well. In fact, most people who use modern computing devices navigate their devices through scrolling. Of course, there are other ways of navigating some devices, such as searching and jumping to a specific spot on our device or in a document. Keyboards and accessibility devices such as screen readers can also help navigate computers. However, such affordances aren't provided across all devices, nor is such functionality as widely understood and adopted as the mechanics of scrolling.

You get the point. _We_ scroll a lot.

## My zeal for scrolling  

I've spent 20+ years scrolling through interfaces on countless devices. Such incessant scrolling has informed a more-or-less "intuitive" understanding of how scrolling should feel. I'm used to scrolling through websites in my web browser, as I'm used to scrolling through timelines on [my iPhone](/switch-from-android-to-iphone/).

If I could sum up my relationship with scrolling in three concise bullet points, it would be:  
- I know what to expect when scrolling  
- Scrolling reliably gets me from point A to point B  
- Scrolling isn't something I have to think about because it happens so naturally  

Which is why I'm such a stickler for _how_ scrolling is implemented on the devices that I use.

And why shouldn't I be?

{% include type/p_large.html, content: "Scrolling is one of my primary means for navigating a bevy of technological devices. Please don't fuck it up." %}

## The current state of scrolling  

In my experience, websites are the greatest offender for altering scrolling mechanics for **no good reason**. There's nothing more jarring than loading a web page, beginning to scroll through it, and immediately recognizing how unnatural the scrolling feels.

What's worse is realizing that such a core mechanic has been altered for **no good reason**.

I stress the fact that scrolling mechanics are often changed for **no good reason** because of how mindless such alterations seem to be thrust upon us. If I don't understand _why_ you've altered scrolling within the first 5 seconds, you're altered it for **no good reason**.

This isn't to say there aren't well-intentioned web designers and developers behind the scenes making such decisions who surely mean no ill will to the rest of us. I've been there. But we can do better.

{% include atoms/figure.html, src: "/images/posts/android-iphone/me-on-iphone-with-laptop.jpg", alt: "", caption: "", source_title: "Visuals by Marcus", source_link: "https://www.instagram.com/visuals_by_marcus/" %}

## Deciding whether to alter scrolling mechanics  

Anybody building websites or user interfaces should recognize the importance of consistency with mechanics [of human-computer interaction](https://en.wikipedia.org/wiki/Human-computer_interaction).

I _never_ want core scrolling functionality to change. If I can't quickly jump down your page using the `Space` key or `CMD + ⇩` then you've fucked up. You _might_ be able to get away with altering the physics, but only if it's for a **very good reason**.

Furthermore, scrolling isn't something I want to notice or pay attention to when visiting your website. I want the action of scrolling to be as "invisible" as possible when navigating an interface so I can accomplish whatever I've set out to do—reading an article, navigating pages, etc.

{% include type/p_large.html, content: "The goal isn't to enjoy the scrolling mechanic. The goal is to use the scrolling mechanic to <u>do something</u> enjoyable." %}

Here are some **very bad reasons** for altering scrolling:  
- You _think_ it adds to the "experience"  
- You _think_ it feels "cool" or "fun"  
- You _think_ it makes your website "dynamic"  
- You _think_ it enhances the animations you've added  
- You _think_ I will enjoy it  

Here are some **very reasonable reasons** for altering scrolling:  
- Scrolling is part of the mechanics for a game  
- You intentionally want to create something experimental and push the boundaries of human-computer interaction  

Here are some **very good reasons** for altering scrolling:  
- *[crickets chirping](https://www.youtube.com/watch?v=RktX4lbe_g4)*  

## Focus on what matters  

If I could succinctly summarize my thoughts on altering scrolling mechanics for websites [^1], it would be to do so _sparingly_ and _intentionally_. 

[^1]: Though I'm not one for succinctly summarizing my thoughts on anything.

If you aren't 100% confident that changing the scrolling mechanics is _absolutely_ necessary for what you want to accomplish, don't do it. Just don't. 

Focus your attention elsewhere—the content of your website, the art direction, the cool animations you want to trigger as I scroll through the page, accessibility, usability, etc.

**Focus on what matters. Don't create new problems by trying to solve a problem that doesn't exist.**  

{% include type/p_large.html, content: "Focus on what matters. Don't create new problems by trying to solve a problem that doesn't exist." %}

## Examples and resources  

I haven't proactively searched for resources on this subject. Rather, today's screed is brought to you by _Keenan's Stream of Consciousness (TM)_. I will update this section with examples of scroll-jacking as well as other resources on the subject as I find them.

If you have any examples or resources you would like to share, don't hesitate to drop a comment down below, shoot me an [email](/contact), or hit me up on [Twitter](https://twitter.com/KeenanPayne_)!

<h3 class="_text-h4">Very good examples</h3>

- [The Boat](https://www.sbs.com.au/theboat/)
  - My inspiration Art direction interaction Design Animation storytelling  media/Comic List: Media Scrolling

<h3 class="_text-h4">Very reasonable examples</h3>

- _The fate of half-lucky souls rest here_

<h3 class="_text-h4">Very bad examples</h3>

- _The fate of unlucky souls will rest here_

<h3 class="_text-h4"> Libraries</h3>

- [Smooth Scrollbar](https://idiotwu.github.io/smooth-scrollbar/) Software Library JavaScript Scrolling

<h3 class="_text-h4">Articles</h3>

- [Scrolljacking](https://www.robinrendle.com/notes/scrolljacking/) media/Article status/To Read Scrolling
