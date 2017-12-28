---
layout: personal
title: Style Guide
navigation_weight:
narrow_container: true
permalink: style-guide.html

## Page Sections
sections:
  - name: 'masthead'

## Masthead
masthead: Style Guide
masthead_subtitle: The bits and bytes that make up this website
masthead_center: true
---

<h3 class="-bottom-border">Typography</h3>

<p class="-content-heading">Headings</p>

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

<p class="-content-heading">Paragraph</p>

This is an example post for my blog. I can use this as a starting post for any articles that I write. This file should include all formatting that can be used on any post for easy reference.

Here's a link to [a website](http://foo.bar), to a [local
doc](local-doc.html), and to a [section heading in the current
doc](#an-h2-header). Here's a footnote [^1].

[^1]: Footnote text goes here.

2nd paragraph. *Italic*, **bold**, and `monospace`.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all in chapters 12--14"). Three dots ... will be converted to an ellipsis.

<p class="-content-heading">Paragraph Callout</p>

{% include post/p-large.html content="I set a goal to read <strong>24 books in 2017</strong>. I have already read 3 books in the last 3 weeks" %}

<p class="-content-heading">Lists</p>

  * this one
  * that one
  * the other one

  1. first item
  2. second item
  3. third item

  1. First, get these ingredients:
       - carrots
       - celery
       - lentils
  2. Boil some water.
  3. Dump everything in the pot and follow this algorithm:
  4. Do not bump wooden spoon or it will fall.

<p class="-content-heading">Blockquote</p>

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote.

<p class="-content-heading">Tables</p>

    # Let me re-iterate ...
    for i in 1 .. 10 { do-something(i) }

<p class="-content-heading">Code Snippet</p>

~~~scss
define foobar() {
    print "Welcome to flavor country!";
}
~~~

~~~python
import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
~~~

**Tables can look like this:**

&nbsp; | First Header | Second Header
--- | ------------ | -------------
**Y Value** | Content from cell 1 | Content from cell 2
**Y Value** | Content in the first column | Content in the second column

Table: Shoes, their sizes, and what they're made of

A horizontal rule follows.

***

Again, text is indented 4 spaces. (Put a blank line between each
term/definition pair to spread things out more.)

and images can be specified like so:

![example image](https://luna1.co/4c8bb1.jpg "An exemplary image")

And note that you can backslash-escape any punctuation characters
which you wish to be displayed literally, ex.: \`foo\`, \*bar\*, etc.
