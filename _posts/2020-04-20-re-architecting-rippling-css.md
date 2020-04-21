---
title:  'Re-architecting the CSS for Rippling.com'
---

I recently led an effort to rebuild the entire website for [Rippling](https://rippling.com), a San Francisco-based startup that builds software that helps companies manage different parts of their organization, such as HR and IT. Rippling had been using its former website since early in the company's life and wanted me to help provide a complete overhaul of their web presence. This overhaul coincided with an extensive marketing campaign by the company, which included a significant advertising push inside of San Francisco boldly targeting their direct competitors. 

<div grid>
  <div column="6">
    {% include atoms/figure.html src='/images/rippling-legacy.png' alt='Preview of what the Rippling website looked like before' caption="Preview of what the Rippling website looked like before" %}
  </div>

  <div column="6">
    {% include atoms/figure.html src='/images/rippling-new.png' alt='Preview of what the Rippling website looks like now' caption="Preview of what the Rippling website looks like now" %}
  </div>
</div>

## Move fast and build things

I was fortunate enough to be the lead developer during this project, working closely with marketing stakeholders and other engineers to bring the new website to fruition. It was a fun project to work on, but the circumstances under which we did the work were not ideal. One such circumstance was the deadlines that were in place to launch the new advertising efforts prior to any planning around the development of the website. Sequencing work in this way created a tight window of time to plan, build, and launch the website. I'm happy with what we were able to achieve, but the process was immensely stressful and, at times, overwhelming. 

As one might expect, working under such tight timelines to achieve a project goal is not conducive to creating the type of freedom that would allow for thoughtful planning before executing a project. We were moving fast and trying to build a website with a fresh codebase in two months. This provided little time to consider how we might want to create different abstractions for components or determine what sort of build tooling might be the most efficient, given the circumstances. We were designing and building as we were going, and these two things happening in tandem is not how you thoughtfully create many things [^1]. 

## Dealing with a sinking tower

We built a great website, but the architectural underpinnings are not ideal. Now, there are a few ways that I've seen this situation unfold in my prior experience (and I'm sure there are plenty more that I have not experienced): 

### Ignore and move on

Ignore the implications of a sub-optimal architecture and just go with what has been built. I mean, if it looks good, and it meets the expectations of stakeholders, then surely there are bigger fish to fry than going back and rethinking work that had only just been completed? 

Ignoring will lead to the inevitable future where the entire codebase must be rebuilt when embarking on another ambitious initiative such as a redesign. 

### Put off

There is cross-functional buy-in that the underlying architecture is indeed a problem but this work gets pushed further down the road in favor of short-term company initiatives. It can be a hard pill to swallow that what has just been built needs some rebuilding, so instead of approaching this work shortly after launching, it is compartmentalized and turned into something to complete "at a later date." 

In my experience, this work rarely gets prioritized. It is too easily kicked down the road until it turns into "ignore and move on," at which point, the inevitability of an extensive codebase rearchitecture surfaces during a large initiative such as a redesign.

### Prioritize and start

There is cross-functional buy-in on improving the architecture of a project as a worthwhile endeavor shortly after a project launch, and making architectural improvements is seen as a blocker to future work. Architectural work is prioritized and broken down into discrete pieces, with the single most important piece of architectural work prioritized before the next initiative. This piece of work is generally seen as being in service of the next initiative. 

In my experience, this is a winning formula for making substantial architectural improvements. Cross-functional buy-in and finding work to address immediately prevents kicking things further down the road while allowing room for incremental improvements alongside other company initiatives. 

{% include type/p-large.html content=" I find any approach that writes-off architectural concerns in the pursuit of new, short-term goals to be short-sighted. This attitude displays ignorance in the importance of building a strong foundation that facilitates long-term maintenance and scalability." %}

Fortunately, I was not the only person working on redesigning the Rippling website that understood the shortcuts that were taken to achieve our short-term goals. Other engineers on the team were keenly aware that although on the surface the website looks great, the underlying codebase left a bit to be desired. As a result, engineers who have been working with Rippling for much longer than myself (shout-out to Balram and Deb) voiced their concerns to stakeholders about the long-term issues that would surface as a result of leaving the website architecture as-is, as did myself. Such exclamation created the impetus for stakeholder buy-in on tackling large parts of the architectural work shortly after we launched the redesign, which landed us squarely on "prioritize and start," which I am quite happy with. 

## Preventing a sinking tower

As somebody who enjoys thinking about and writing code at a high-level (i.e., the architecture), it pains me when my back is against the wall on a project, and I have to take shortcuts to meet the project goals. This pain gets compounded by the fact that I might never go back and fix the shortcuts that I took to achieve the result that we did. I *hate* writing sloppy code, and I equally hate having to maintain sloppy code that I've written (and empathize dearly for those that have to maintain it).

Fortunately, this a future I get to avoid. I am now leading a new project for Rippling that will include re-architecting all of the CSS on the website, as well as rethinking our build tooling for managing and compiling CSS. Looking over the entire architecture for the website, this stood out as the highest-impact work that would maximize short- and long-term company goals. I am immensely pleased with the level of buy-in for tackling this work, as it will ensure that Rippling has a website that can be more easily maintained and built upon in the future. 

## Join me on this project

As a part of this project for Rippling, I think that it would be fun to document and share what I'm doing so that others can follow along as well. I can only see positive things occurring as a result of sharing what I'm doing: 

- Writing serves as a point of reflection because it forces me to think about whatever I'm writing about, which, in return, opens me up to new ideas, and a more comprehensive understanding of what I already believe.
- I'm not the only person working on a project like this or solving these problems, nor will I be the last. Sharing my thoughts on how I am approaching this project might be useful to others who can learn from how I approach and tackle this project. 
- Writing about a client project in real-time gives me content to share for an indefinite period. I have a list of blog post ideas that I could write, and there are some good ideas in there. However, using client projects that I am actively working on as a touchstone for my writing will hopefully make writing much easier, as I am recounting my experiences in real-time. This should serve as a useful mechanism for me to improve my writing habits. 

[//]: <> (TODO: Add link to the RSS feed)

Join me on my journey! I will be going step-by-step through the process of organizing, structuring, and executing this project. Posts will be happening very frequently, so if you always want to be kept in-the-loop, [follow me on Twitter](https://twitter.com/KeenanPayne_) or [subscribe to the email newsletter](#newsletter). 

[^1]: The analogy is simple: do architects design a building as contractors are building it? No, because that would be insane. The same applies here, except that the architectural underpinnings of a website can be redesigned with some time and planning as an afterthought to the initial implementation. Failing to think ahead as you architect a building is how you end up with the [Millenium Tower](https://en.wikipedia.org/wiki/Millennium_Tower_(San_Francisco)) in San Francisco, which is currently sinking into the ground as I write this. 