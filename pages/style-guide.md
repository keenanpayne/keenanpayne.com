---
layout: personal
title: Style Guide
navigation_weight: 3
navigation_hide_header: true
permalink: style-guide.html

## Page Planks
planks:
  - name: 'masthead'

## Masthead
masthead: Style Guide
masthead_subtitle: The bits and bytes that make up this website
---

<!--
  Only elements that are atoms should be displayed on this page.
  No complex components. Modifiers for atoms should be included.
-->

{% include type/section-heading.html content="Typography" %}

{% include type/content-heading.html text="Headings" %}

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

{% include type/content-heading.html text="Paragraph" %}

Here's a link to [a website](https://foo.bar), to a [local doc](local-doc.html), and to a [section heading in the current doc](#an-h2-header). Here's a footnote [^1]. Sometimes you just need to use a *little* bit of **emphasis** when talking about `code` --- if you want to learn more, see chapters 2--4 and maybe you'll find a surprise as well...

[^1]: Footnote text goes here.

<p class="-secondary">This is secondary text that shouldn't stand out as much.</p>

<p class="-small">This is some small text.</p>

{% include type/content-heading.html text="Links" %}

<p><a>This is a standalone link</a></p>

<p><a class="-cta">This is a CTA link</a></p>

<p><a class="-arrow">This is a link with an arrow</a></p>

{% include type/content-heading.html text="Paragraph Callout" %}

{% include type/p-large.html content="I set a goal to read <strong>24 books in 2017</strong>. I have already read 3 books in the last 3 weeks" %}

{% include type/content-heading.html text="Blockquotes" %}

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote.

{% include type/content-heading.html text="OpenType Modifiers" %}

<p class="-small-caps">Small Caps</p>

<p class="-all-small-caps">All Small Caps</p>

<p class="-proportional-numbers">12345 (proportional numbers)</p>

<p class="-fraction">1/2</p>

<p class="-ordinal">1st 2nd 3rd 4th 96o</p>

{% include type/section-heading.html content="Lists" %}

**Unordered lists**

  * this one
      * another one
  * that one
  * the other one

**Ordered lists**

  1. First, get these ingredients:
      1. carrots
      2. celery
      3. lentils
  2. Boil some water.
  3. Dump everything in the pot and follow this algorithm:
  4. Do not bump wooden spoon or it will fall.


{% include type/section-heading.html content="Buttons" %}

<button>Only used for submissions</button>


{% include type/section-heading.html content="Tables" %}

&nbsp; | First Header | Second Header
--- | ------------ | -------------
**Y Value** | Content from cell 1 | Content from cell 2
**Y Value** | Content in the first column | Content in the second column


{% include type/section-heading.html content="Code" %}

**Language-agnostic**

    # Let me re-iterate ...
    for i in 1 .. 10 { do-something(i) }

**Language-specific**

~~~python
import time

# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
~~~


{% include type/section-heading.html content="Images" %}

![example image](/images/pages/style-guide/example-image.jpg "An exemplary image")
