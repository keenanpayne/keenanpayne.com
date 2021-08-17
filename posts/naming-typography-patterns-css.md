---
title:  'Naming typography patterns in CSS'
meta: 
  description: 'Why do we name patterns the way that we do when writing CSS? How are the patterns that we write providing clarity and utility to ourselves and others?'
date: 2019-06-26
tags: 
  - CSS
---

I read a great article the other day by Dan Mall titled [Typography in Design Systems](https://danmall.me/articles/typography-in-design-systems/). In it, Dan talks about how he approaches naming conventions for typography in design systems; specifically, some of the problems that he has encountered trying to scale common naming conventions. This is a topic that I've also been thinking about recently, having encountered similar issues as Dan in codebases that I work in. I’ve taken a different approach to address this problem, which is why I thought it would be useful to share my thoughts.

## Clothing and naming

When working on web projects, abstracting user interface patterns such as typography into easily reusable pieces of code is common, and often desirable. Doing so promotes design consistency and can improve developer efficiency. However, the details of how patterns and abstractions get implemented into a codebase will inform how useful they become. Naming is one such implementation detail that, when overlooked or not sufficiently evaluated, can impede usability and clarity. 

Many web developers are likely familiar with the clothing size metaphor when naming things in CSS. This naming convention can manifest in many ways, but one of the most common that I’ve encountered is for font-sizes. Here is a common way to create consistent font-sizes using Sass mixins:

```scss
@mixin fontSize-md() {
  font-size: 1rem;
}

@mixin fontSize-lg() {
  font-size: 1.5rem;
}

@mixin fontSize-xl() {
  font-size: 2.25rem;
  font-weight: 600;
}
```

*See an example of this typographic scale in action at* [*type-scale.com*](https://type-scale.com/?size=16&scale=1.500&text=Naming%20is%20hard&font=Playfair%20Display&fontweight=400&bodyfont=Poppins&bodyfontweight=400&lineheight=1.45&backgroundcolor=white&fontcolor=%23333&preview=false)

It is common to use clothing sizes as a metaphor for naming font-sizes. Initially, this seems like a useful metaphor. It can feel intuitive to call our smaller font-sizes "small" and our larger font-sizes "large." This metaphor can work well for systems that have a limited typographic scale (e.g., xs, sm, md, lg, xl), but how does this metaphor scale when we work in a system with more expansive typographic needs? Using such a metaphor, we might resort to naming something `fontSize-xxxxl`. Such a convention can work depending on the context—be that the needs of the business, preferred design/development workflow, or the preference of the developer—but it can be problematic for all of the same reasons. 

## Naming is not one size fits all

I am part of a group of folks working on building the first brand design system at [Asana](https://asana.com/?noredirect). As a part of this effort, I have been taking preliminary steps to think about how we want to architect our codebase to accommodate the type of design system that we hope to build. This includes thinking about how the building blocks of our web pages are architected so that developer efficiency and designer flexibility are optimized. One such building block that needed re-evaluating is how typography is handled in our codebase. 

We’ve run into issues with scaling the clothing size naming convention for typography in our codebase. Our designers prefer flexible, context-dependent styling for type, and the inherent limitations of scaling the clothing size metaphor make it difficult to achieve that. As a result, we have a growing list of font-size variables that is almost impossible to remember, which slows down development. Additionally, this naming convention adds overhead for designers who must name type styles in Sketch files so that there’s a one-to-one match with the variable names in our codebase. 

Our design system should use conventions that designers and developers can understand, facilitates the development of new pages and components, and can scale as our needs grow over time. Our current solution for naming typography is not checking these boxes, which indicates that it’s time for re-evaluation.

### Out of the metaphorical and into the literal

With this outcome in mind, my predominant thought around naming typography has been to move out of the metaphorical, and into the literal. Here’s an example of what this might look like: 

```scss
@mixin fontSize-16() { 
  font-size: 1rem;
}

@mixin fontSize-24() { 
  font-size: 1.5rem;
}

@mixin fontSize-36() { 
  font-size: 2.25rem;
  font-weight: 600;
}
```

In this example, we scrap the clothing size metaphor and name our mixins after their pixel representation. When we want a sixteen-pixel font-size, we reference `fontSize-16()` in our codebase. This mixin can then convert our font-size into ems or rems if we wish, as well as provide accompanying font styles if necessary (e.g., `font-weight`, `line-height`). 

A system like this could work well at Asana because our brand design team works with pixel font-sizes in their Sketch files. Translating a design into code could be made easier for developers, as there is a one-to-one match between our mixin names and the font-sizes that we see in design files. This means that we no longer have to continually cross-reference variable names with values to determine which to use. There’s also infinite room to scale our typography without impeding clarity; if we need a larger font-size, we can add a new mixin. Lastly, by removing the naming convention, we have reduced the work that designers have to do when building their files. Wins all around! 

## Architecture is contextual

Context is critical when making architectural decisions. What works under one set of circumstances may not work under another. In this instance, because web developers at Asana are building new pages and components from Sketch files, it’s important that developers can easily understand which class, mixin, or variable to use when translating designs into code. Because we have the additional requirement of wanting a flexible type system, it makes sense to use a naming convention that can easily scale as the needs of our designs change. These are all considerations that must be taken into account when making architectural decisions. 

It is also important to acknowledge that architectural decisions are rarely made without any trade-offs. There is never a silver bullet solution that solves every problem without consequence. In this instance, we make trade-offs if we move forward with this new naming convention: 

- **Difficult to remember:** One of the efficiencies that is provided by using a metaphor for naming conventions is the reduced cognitive overhead for remembering names. For me, it’s easier to remember “extra-small” than it is to remember a string of numbers (e.g., 16, 24, 36, etc.)
- **Infinite font sizes:** Using the clothing size metaphor, we were able to identify when typography styles started getting out of hand. Seeing something named “xxxxl” indicates that something needs re-evaluating: either the way that font-sizes are implemented in the codebase or the number of font-sizes that are used. 

Trade-offs should be evaluated on a case-by-case basis. The circumstances and priorities under which decisions are made will directly inform the value of various trade-offs, and should hopefully guide you in making a decision.

## Closing thoughts

Will we stick with this new naming convention for our font sizes? I’m not entirely sure at the moment. I think that this could be a decent solution for naming font-sizes, but more time must be spent evaluating our options and getting buy-in from teammates and stakeholders. Either way, it was fun to think outside of our existing paradigms and conventions and wonder how we can make improvements.

How would you have approached this problem? Have you had trouble scaling this clothing size metaphor with naming things well? Feel free to leave a comment below! I’d love to hear what you think. 