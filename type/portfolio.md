---
permalink: '/portfolio/'
layout: layouts/base.njk
seoPriority: 0.9
title: Portfolio
description:

eleventyNavigation:
  key: Portfolio
  order: 2

sections: 
  - type: intro
    heading: "Case studies"
    subheading: "Below are a few of my favorite projects I've worked on over the past few years."
  - type: entries
    showCovers: true
    orientation: horizontal
    heading: "Featured projects"
    columns: 2
    spacing: 8
    items: 
      from: portfolio
      limit: 6
      featured:
        - asana
        - rippling
        - neuralink
        - gofundme
        - getwhys
        - sparrow
  - type: entries
    showCovers: true
    orientation: horizontal
    heading: "More projects"
    spacing: 8
    items: 
      from: portfolio
      limit: 1
  - type: cta
---
