---
permalink: '/portfolio/'
layout: layouts/base.njk
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
        - gofundme
        - collectivei
        - sparrow
  - type: entries
    orientation: horizontal
    heading: "Even more projects"
    spacing: 8
    items: 
      from: portfolio
      limit: 1
  - type: cta
    heading: "Interested in working together?"
    subheading: "I'm scheduled out until the end of 2022 but I am interested in talking with folks who want to collaborate next year."
    link:
      text: "Get in touch"
      url: "/contact"
    spacing: 10
---
