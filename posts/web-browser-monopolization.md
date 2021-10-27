---
permalink: '/web-browser-monopolization/'
title:  "How do we address the monopolization of web browsers?"
date: 2021-07-30
type: Essay
tags:
  - Web Browsers
  - Corporate Monopolies
source: https://twitter.com/KeenanPayne_/status/1421215458766647297
---

I recently stumbled upon an interesting Twitter thread by [Jeff Johnson](https://twitter.com/lapcatsoftware) on the state of corporate monopolization of the web, Safari and Chrome, web browser complexity, and fostering competition in the web browser landscape.

I have a different perspective on many points he discussed that I want to share in the pursuit of advancing this discussion. 

{% include type/notice.html, content: "Jeff, the author of the Twitter thread that I responded to, has deleted his thread because of vicious responses from folks. I find this unfortunate, as sincerely-held opinions, however disagreeable they might be, provide a valuable perspective as we attempt to understand the state of the world and address its issues.<br>I'm not keeping this essay published to draw negative attention towards Jeff or his opinions, but rather to advance the discussion that he started. However, I'm happy to unpublish or remove the original quotes if requested." %}
## Web browser complexity

<blockquote class="twitter-tweet" data-dnt="true">
  <p lang="en" dir="ltr">
    The web has massive feature bloat. It's a privacy and security nightmare.

    I personally think we should abolish JavaScript and not allow arbitrary remotely loaded code to execute on our computers.

    "I want web sites to do everything a native app can do" is a suicidal mistake.
  </p> 
  
  <cite>Jeff Johnson (@lapcatsoftware)<br>July 30, 2021</cite>
</blockquote>

I'm not convinced that web browsers having more functionality is problematic. Functionality increases complexity, but having a full-featured web is democratizing, allowing developers to build websites and applications for devices without worrying about platform-specific constraints. I believe we can enjoy a feature-rich internet while acknowledging that this comes at a cost—privacy, security, and competition—all of which we need to address. 

What I love about being a web developer is the ubiquity of my creations. Building websites and web applications allows me to build once and ship everywhere, so long as web browsers provide a consistent user experience (hence the issue between web developers and Safari).

Reducing functionality on the internet to increase privacy, security, and browser competition comes at a cost. In this world, instead of building web applications for Apple devices using HTML, CSS, and JavaScript, am I forced to use Apple’s programming language and IDE, Swift and Xcode, if I want to build a full-featured application? Doesn’t this seem antithetical to the argument against corporate monopolies?

{% include type/p_large.html, content: "Instead of building web applications at the behest of our browser overlords, we're building native applications at the behest of our device overlords." %}

**Furthermore, I don't want to build different applications for different platforms.**

## Web browser competition

<blockquote class="twitter-tweet" data-dnt="true">
  <p lang="en" dir="ltr">
    The more features that are added to the web, the less browser competition is possible! This is essential to recognize.

    And Google knows it! That's the whole point.

    Who can keep up with Google? Mozilla can't. Apple can't. Even Microsoft threw in the towel and adopted Chromium.

    Imagine a small company trying to write their own web browser from scratch nowadays. It's just not possible! The web is so complex, there's no choice but to adopt one of the few existing browser engines: Chromium, WebKit, Gecko. That's it. The competitive landscape is bleak.

    "Everyone has to adopt Chromium" is exactly Google's plan.
    
    Who controls the dominant browser engine controls the web.
  </p>

  <cite>Jeff Johnson (@lapcatsoftware)<br>July 30, 2021</cite>
</blockquote>

Should the automotive industry have remained stagnant, reducing complexity and functionality for the sake of increased competition? There's a high barrier of entry for automobile manufacturing, but it's not an industry without competition.

What about regulations placed on the automotive industry over the past century that benefit consumers? Regulations increase overhead for manufacturers but improve safety and reliability for consumers. How do you balance that trade-off? 

{% include type/question.html, content: "How do you balance the trade-off of regulations on companies and industries to increase competition, promote innovation, and respect the needs of consumers in the industry?<br>How do we incentivize tech companies like Google and Apple to continue investing in web browsers in a way that benefits both the company <em>and</em> the consumer?<br>How can the Justice Department's antitrust powers increase competition in the web browser market?<br>What if the paradigm shifts to web browsers being 'sponsored' by corporations?" %}

Regardless of how we get there, I think the incentive structure for corporate involvement in web browser development needs to change. Google and Apple have different incentive structures, which is evident by their choices for Chromium and Safari, respectively. 

We need incentive structures that allow corporations to meet their goals, but not at the expense of the consumer (e.g., privacy, choice of browser) or web developers through unilateral decision-making for the progression of web browsers (we see you, Google).

## Oppenness on the web

<blockquote class="twitter-tweet" data-dnt="true">
  <p lang="en" dir="ltr">
    In a sense, there's no point in even having "web standards" anymore.

    Web standards theoretically allow *anybody* to implement a browser engine. But if the "standards" are sufficiently huge, then practically *nobody* can implement a browser engine.
    
    The web is not "open" if nobody new can write a web browser engine. It's the illusion of openness.
  </p> 
  
  <cite>Jeff Johnson (@lapcatsoftware)<br>July 30, 2021</cite>
</blockquote>

On the subject of "openness" on the web, just because I cannot reasonably build a web browser that's up-to-date with the W3C standards does not mean that the web is not still "open". It simply means the barrier of entry is so high that I might want to focus my energy elsewhere. 

{% include type/question.html, content: "What are the principles and features of an 'open' and a 'closed' web?" %}

There are aspects of the web that blur the lines between an open and closed ecosystem. Features for web languages like HTML, CSS, and JavaScript are often implemented, if not outright conceived, by corporations, independent of the committees charged with steering their direction. Google is the primary offender for blurring these lines on the web, as they implement platform-specific features and functionality for common web languages. This makes it difficult for everyone—the W3C, web browser creators, and web developers—to foster an open ecosystem on the web and create shared buy-in on which features are a priority.

I’m not entirely sure how you solve the problem of Google unilaterally making decisions that impact so much of the web. Some of their feature implementations empower developers. Others are terrible, adding proprietary technology whose goal is to benefit the company, like AMP.

I would be remiss if I didn't mention some impactful web technologies that originated from tech companies. JavaScript was created at Netscape, TypeScript by Microsoft, Go by Google. Discussing the nuance of how these technologies originated, the incentive structures that drove their development, and the relative “openness” of their development and maintenance would be valuable to discuss, but I'll save that for another day.

## Looking forward

I’m not saying that the web is perfect. There is massive room for improvement for feature parity, security, fostering an open ecosystem, creating incentive structures that benefit corporations and consumers, and more. However, saying "there's no point in even having 'web standards'" is too nihilistic for me.

{% include type/p_large.html, content: "We have to be flexible and learn to grow, adapt and strive for constant improvement. This is as true for the internet as it is for everything else in life." %}

Still, I think this is an interesting discussion to have as we fight against corporate monopolization of the internet. There are many problems and many approaches to solving those problems, and I’m grateful to folks like Jeff fostering this discussion.
