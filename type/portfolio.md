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
        - neuralink
        - gofundme
        - collectivei
        - sparrow
  - type: entries
    orientation: horizontal
    heading: "More projects"
    spacing: 8
    items: 
      from: portfolio
      limit: 1
  - type: cta
    heading: "Interested in working together?"
    subheading: "I'm booked until until Q2 2023, but I'm interested in talking with folks who want to collaborate in Q3–Q4."
    link:
      text: "Get in touch"
      url: "/contact"
    spacing: 10
---
