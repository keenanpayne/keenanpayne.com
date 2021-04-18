---
title: "Style Guide"

seo:
  title:
  tagline:
  description:

# Sections
sections: 
  - type: hero
    headline: 
      size: h1
      text: Style Guide
    subheading: 
      modifiers: _type-size-h5
      text: This contains all of the styles included by Eleventy Boilerplate
    cta:
      text:
      link:
  - type: style-guide
  - type: hero
    headline: 
      size: h1
      text: Hero
    subheading: 
      modifiers: _type-size-h5
      text: Subheading
    cta:
      text: CTA
      link: /
  - type: horizontalPresentation
    alignment: 'image-left'
    container: true 
    eyebrow: 'Eyebrow'
    headline: 
      size: h2
      text: Headline
    subheading: 
      modifiers: _type-size-h5
      text: Subheading
    cta:
      text: 
      link: 
    image: 
      src: https://d33wubrfki0l68.cloudfront.net/5e1b4d65a017c0f05dc9c4983d4377e373d6ee84/3e37d/images/content/approach-link-head.png
      alt: 
  # - type: greenhouse
  - type: columnPresentation
    headline:
      text: Column Presentation
      size: h2
    subheading:
      text: This is a component that allows you to display content in columns side-by-side.
    columns:
      - image: https://d33wubrfki0l68.cloudfront.net/43572a4e0672b5e7e00424a6711662c0c3b6e1d7/0a1a8/images/departments/implant.jpg
        headline:
          text: Implant
          size: h2
        subheading:
          text: |
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla odio odio, malesuada sit amet eros et, fringilla eleifend nibh. Aenean aliquam, nisl ut dignissim aliquam, arcu lacus placerat nisi, quis accumsan nibh magna tincidunt nulla. Duis tempor leo ut lectus tincidunt gravida. Praesent varius dui nec ex consequat, et sagittis lacus posuere.

      - image: https://d33wubrfki0l68.cloudfront.net/f444e4823ff9893014d413733e50893f8f4d3ee5/ec731/images/departments/robotics.jpg
        headline:
          text: Column
          size: h2
        subheading:
          text: |
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla odio odio, malesuada sit amet eros et, fringilla eleifend nibh. Aenean aliquam, nisl ut dignissim aliquam, arcu lacus placerat nisi, quis accumsan nibh magna tincidunt nulla. Duis tempor leo ut lectus tincidunt gravida. Praesent varius dui nec ex consequat, et sagittis lacus posuere.
  - type: popupVideo
    source: "https://d2w07qfgh81qmg.cloudfront.net/qv8qsqHKnpxk6dELyGyG.mp4"
  - type: pageList
    items:
      - headline:
          size: h3
          text: Understanding <br>the Brain
        cta:
          text: Science
          link: /science
          title: Learn about the science behind Neuralink
        image:
          src: /images/pages/red-desktop-thumbnail.png
          alt:

      - headline:
          size: h3
          text: Interfacing <br>with the Brain
        cta:
          text: Approach
          link: /approach
          title: Learn about Neuralink's approach
        image:
          src: /images/pages/blue-desktop-thumbnail.png
          alt:

      - headline:
          size: h3
          text: Engineering <br>with the Brain
        cta:
          text: Applications
          link: /applications
          title: Learn about practical applications
        image:
          src: /images/pages/green-desktop-thumbnail.png
          alt:
  - type: pardot-get-started
  - type: modal
    id: modal-test
  - type: faq
    headline: 'FAQ'
    questions: 
      - question: Lorem ipsum dolor sit amet, consectetur adipiscing elit
        answer: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ultrices neque eget odio sodales, eu congue ante cursus. Integer cursus vitae metus vitae aliquam.
      - question: Lorem ipsum dolor sit amet, consectetur adipiscing elit
        answer: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ultrices neque eget odio sodales, eu congue ante cursus. Integer cursus vitae metus vitae aliquam.
      - question: Lorem ipsum dolor sit amet, consectetur adipiscing elit
        answer: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ultrices neque eget odio sodales, eu congue ante cursus. Integer cursus vitae metus vitae aliquam.
  - type: notice
    id: 'notice-id'
    message: 'This is a notice that we display to visitors'
    link:
      url: '#'
      text: 'Learn More'
---
