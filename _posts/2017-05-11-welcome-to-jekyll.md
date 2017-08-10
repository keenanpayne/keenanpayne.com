---
title:  "Welcome to Jekyll!"
date:   2017-05-11 00:12:52 -0700
---

This is an example post for my blog. I can use this as a starting post for any articles that I write. This file should include all formatting that can be used on any post for easy reference.

2nd paragraph. *Italic*, **bold**, and `monospace`. Itemized lists
look like:

  * this one
  * that one
  * the other one

Note that --- not considering the asterisk --- the actual text
content starts at 4-columns in.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all
in chapters 12--14"). Three dots ... will be converted to an ellipsis.
Unicode is supported. ☺



## An h2 header

Here's a numbered list:

 1. first item
 2. second item
 3. third item

Note again how the actual text starts at 4 columns in (4 characters
from the left side). Here's a code sample:

    # Let me re-iterate ...
    for i in 1 .. 10 { do-something(i) }

As you probably guessed, indented 4 spaces. By the way, instead of
indenting the block, you can use delimited blocks, if you like:

~~~
define foobar() {
    print "Welcome to flavor country!";
}
~~~

(which makes copying & pasting easier). You can optionally mark the
delimited block for Pandoc to syntax highlight it:

~~~python
import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
~~~



### An h3 header

Now a nested list:

 1. First, get these ingredients:
      - carrots
      - celery
      - lentils
 2. Boil some water.
 3. Dump everything in the pot and follow this algorithm:
 4. Do not bump wooden spoon or it will fall.

Notice again how text always lines up on 4-space indents (including
that last line which continues item 3 above).

Here's a link to [a website](http://foo.bar), to a [local
doc](local-doc.html), and to a [section heading in the current
doc](#an-h2-header). Here's a footnote [^1].

[^1]: Footnote text goes here.

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