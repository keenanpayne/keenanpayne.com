---
permalink: '/11ty-eleventy-introduction/'
title:  'Introduction to Eleventy (11ty)'
meta: 
  description: 
  facebook_image: 
  twitter_image: 
type: Tutorial
date: 2021-10-03
tags:
  - Static Site Generators
---

{% include atoms/figure.html, src: "/images/posts/eleventy-introduction/homepage.png", alt: "Screenshot of Eleventy homepage", caption: "", source_title: "https://11ty.dev", source_link: "https://11ty.dev" %}

[Eleventy](https://www.11ty.dev/) (11ty) is a static site generator (SSG) built on top of [Node.js](https://nodejs.org/en/) that compiles static website assets (i.e., HTML files). Eleventy provides a platform that helps web developers create organized and [DRY](https://en.wikipedia.org/wiki/Don't_repeat_yourself) codebases through its support for [templating languages](https://www.11ty.dev/docs/languages/), a robust [templating engine](https://www.11ty.dev/docs/templates/), flexible [data models](https://www.11ty.dev/docs/data/), and [plugins](https://www.11ty.dev/docs/plugins/).  

While Eleventy offers a lot, it's designed as a [zero-configuration](https://www.11ty.dev/docs/glossary/zero-config) platform that provides as much or as little overhead as you would like. This preference for simplicity, combined with a philosophy of tooling agnosticism (just look at their support for templating languages), provide a flexible and empowering developer experience.

Large websites don't only benefit from what Eleventy offers. Unless you are building the simplest low-maintenance websites, odds are that some aspect of Eleventy or another SSG will improve your workflow and codebase.

## SSG Ecosystem

Eleventy exists in an expansive ecosystem of SSGs, alongside the likes of [Next.js](https://nextjs.org/), [Jekyll](https://jekyllrb.com/), [Hugo](https://gohugo.io/), [Gatsby](https://www.gatsbyjs.org/), and [so many others](https://jamstack.org/generators/). In fact, Eleventy might seem like an underdog among these prominent options, but its frequency of updates and thriving community provide me with confidence using it for my projects.  

I don’t plan on covering the similarities and differences between different SSGs in this article. Instead, here's a list of resources you can consult if you're evaluating software.  

- [Defining metrics that help with static site generator evaluation](/evaluating-static-site-generators)
- [Questions to ask before choosing a static site generator](https://www.ample.co/blog/questions-to-ask-before-choosing-a-static-site-generator)
- [A List of Static Site Generators for Jamstack Sites](https://jamstack.org/generators/)
- [Why I left Hugo for Eleventy](https://www.brycewray.com/posts/2019/09/why-left-hugo-eleventy/)
- [Jekyll alternatives: The benefits to JavaScript static site generators](https://www.takeshape.io/articles/jekyll-alternatives-the-benefits-to-javascript-static-site-generators/)
- [Comparing Static Site Generator Build Times](https://css-tricks.com/comparing-static-site-generator-build-times/)

## My Take  

**I use Eleventy for _a lot_ of projects**  

I've used different SSGs in the past, predominantly Jekyll and Hugo. While I enjoyed the ubiquity of Jekyll and speed of Hugo, what keeps me coming back to Eleventy is its developer experience when used across a wide spectrum of web projects. About 90% of the projects I work on right now can be built with Eleventy, making it my go-to software for building websites of all shapes and sizes.  

{% include type/p_large.html, content: "The most important advice I would give those choosing software for <em>any</em> project is to be mindful about what you’re choosing and why." %}

Understand what problems you’re solving, determine which of these are most important, then choose a piece of software that seems to solve your most important problems in an ideal way. 

**If you're choosing the right tool for the job, or at least _trying_ to, that's what matters.**

{% include type/tip.html, content: "Don't buy into the hype of software X, paradigm Y, or language Z and instead, focus on understanding your problem domain and using that as your north star." %}

## Getting Started

