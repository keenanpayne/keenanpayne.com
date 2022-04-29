---
permalink: '/trust-suspicion/'
title:  'Trust and suspicion'
type: Article
date: 2022-04-28
meta: 
  description: 'Reflections on native browser features and third-party library adoption.'
lede: Reflections on native browser features and third-party library adoption.
tags: 
  - Web Browsers
  - Libraries and Frameworks
---

I've enjoyed the ongoing conversation on native browser features and third-party libraries and frameworks, spurred by a [recent article](https://adactio.com/journal/19021) from Jeremy Keith.

Jeremy's perception is that developers seem to instinctively reach for and trust third-party libraries over native browser implementations/features:

{% include type/blockquote.html, content: "The mindset I’ve noticed is that many developers are suspicious of browser features but trusting of third-party libraries.", author: "Jeremy Keith" %}

He builds upon this premise by questioning the trustworthiness of third-party libraries compared with native browser features: 

{% include type/blockquote.html, content: "I’m much more trusting of native browser features—HTML elements, CSS features, and JavaScript APIs. They’re not always perfect, but a lot of thought goes into their development. By the time they land in browsers, a whole lot of smart people have kicked the tyres and considered many different angles. As a bonus, I don’t need to install them. Even better, end users don’t need to install them." %}

There's more to his article, so definitely give it a read. 

Seeing others weigh in on the topic inspired me to share my thoughts. Let's get into it.

## The role of web browsers

It's important to remember that the current era of web browser cohesion and cooperation follows an era of fractured browser support, corporate opaqueness, and inconsistent APIs.

Web browser vendors haven't historically done an outstanding job building trust amongst web developers. We've sailed some rough waters during the past couple of decades. 

Things are smoother now, which I'm _incredibly_ grateful for. Still, it's important to remember where we've been.

[Chris Coyier](https://chriscoyier.net/2022/04/27/trust/) shares his take:

{% include type/blockquote.html, content: "Third-party code (like the referenced Bootstrap and React) have a history of smoothing over significant cross-browser issues and providing better-than-browser ergonomic APIs. jQuery was created to smooth over cross-browser JavaScript problems. That’s trust.", author: "Chris Coyier" %}

I remember spending _a lot_ of time fumbling over cross-browser issues for almost a decade during the 2000s when web development was a much more finicky bastard.

{% include type/p_large.html, content: "Who wasn't using a library like jQuery while supporting the likes of Internet Explorer 6?" %}

After using third-party libraries to solve so many problems for so many years, I understand why folks might lean on them for so many problems.

[Jim Nielsen](https://blog.jim-nielsen.com/2022/trusting-browsers/) shares his thoughts:

{% include type/blockquote.html, content: "We distrust the browser because we’ve been trained to. Years of fighting browser deficiencies where libraries filled the gaps. Browser enemy; library friend.

For example: jQuery did wonders to normalize working across browsers. Write code once, run it in any browser — confidently.", author: "Jim Nielsen" %}

Yes, we've been trained. Now it's time to re-train.

Web browsers have changed. We are in an entirely new era where cross-browser support is much more manageable and APIs are much more consistent. Sure, there's room for improvement, but it's a night and day difference from where we were 10 years ago.

## The role of third-party libraries

When browser support for features isn't where we want it to be, libraries can fill in the gap. Once browser support improves, we can use polyfills or native solutions.

Third-party libraries can be a playground where ideas and paradigms are conceived and proven. Sometimes these become standardized. It's part of how the web evolves.

Third-party libraries can also add more of everything—complexity, room for error, code shipped, dependency hell, abstraction from lower-level technologies—making the experience worse for developers and users alike.

But there's no denying that some libraries provide an elegant API that makes writing code more effortless, enabling us to solve _real-world problems_ with less effort.

## Closing thoughts

Ultimately, we write software to solve problems. It's our responsibility as developers to adequately understand the problem domain we're writing software for so we can make thoughtful decisions.

Instincts overruling thoughtfulness are where problems can occur. Sometimes your instincts are correct, sometimes they lead you astray.

I like Jim's closing line: 

{% include type/blockquote.html, content: "Where available, default to browser-native features over third party code, abstractions, or idioms.", author: "Jim Nielsen" %}

Great idea. 

Here are some reminders when deciding whether to use third-party libraries:

- Always check native browser APIs before using a third-party library.
- Weigh the trade-offs between using native vs. third-party solutions.
- Make decisions deliberately. Be mindful of instincts overriding thoughtfulness.

Here's to more conversations over blogs!