---
permalink: /archive/
title: Writing Archive
eleventyNavigation:
  key: Writing
  order: 3
changefreq: weekly
sections: 
  - type: intro
    heading: "Writing archives"
    subheading: "Writing is one of my favorite hobbies. You can find some of what I've shared online here."
  # - type: entries
  #   showCovers: true
  #   heading: "Featured articles"
  #   spacing: 10
  #   orientation: horizontal
  #   columns: 2
  #   items: 
  #     from: featured
  #     limit: 2
  - type: entries
    showCovers: false
    heading: "All articles"
    spacing: 10
    orientation: archive
    items: 
      from: posts
      limit: -100
  - type: newsletter
    spacing: 10
---