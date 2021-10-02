---
permalink: '/evaluating-static-site-generators/'
title:  'Defining metrics that help with static site generator evaluation'
meta: 
  description: 'A brief reflection on what metrics one might use when evaluating different static site generators.'
type: Reflection
tags: 
  - Static Site Generators
date: 2018-07-26
---

When choosing a static site generator (SSG) for your next project, how do you decide on which tool to use? What is important to you or your organization? Different individuals or organizations often have drastically different priorities when it comes to choosing software.

While evaluating software to use, it is important to surface the metrics and considerations that are important to you or your organization. You need to have something by which different pieces of software are evaluated, and defining metrics is an important step in doing that.

For the past few months at Asana, our web development team has recently been evaluating SSGs with the hope of finding one that will scale with both our growing website and our growing team. As we started evaluating software, it became apparent that each member of our team was using different metrics to do evaluations. Each team member has different things that they believe are important. Having different opinions can be helpful for surfacing metrics that would have otherwise been left out. However, using inconsistent metrics can lead to a lack of shared understanding which can create friction when making a decision.

When our team first kick-started the evaluation, we were sharing feedback that included all sorts of metrics. We were all prioritizing something different as we did our evaluation. After recognizing that this would never lead to a conclusive answer, we took a step back and had a few discussions around what metrics were important to us when deciding our next SSG. To have a productive evaluation, our team needed to create a shared understanding of the metrics we would measure to compare the different tools. After a few discussions, our metrics list looked like this:

- Architecture (extensibility, language(s), framework(s))
- Developer velocity (set-up and hot reloading times)
- Project build time (compiling static pages and assets)

We also had "considerations" that are important points to note but are harder to quantify:

- Recruitment efforts around our tech stack
- Long-term viability

With these metrics in mind we restarted our evaluation efforts with the hopes of finding an SSG to suit our website and our development needs. We could have saved time by defining these metrics ahead of time, then proceeding with the evaluation. Yet I am still grateful that I was able to learn something from the experience, and I hope it is useful for you.

What metrics have you used when evaluating a static site generator? Do you have any other advice for your fellow developers hoping to choose a piece of software?
