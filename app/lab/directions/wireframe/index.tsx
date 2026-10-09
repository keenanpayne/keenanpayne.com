import type { Direction } from "../../site";

import { About } from "./pages/About";
import { CaseStudy } from "./pages/CaseStudy";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Page } from "./pages/Page";
import { Post } from "./pages/Post";
import { Service } from "./pages/Service";
import { Services } from "./pages/Services";
import { Testimonials } from "./pages/Testimonials";
import { Work } from "./pages/Work";
import { Writing } from "./pages/Writing";
import { Shell } from "./Shell";
import stylesheet from "./wireframe.css?url";

export default {
  // Add web font URLs here, before the stylesheet
  stylesheets: [stylesheet],
  Shell,
  templates: {
    home: Home,
    work: Work,
    caseStudy: CaseStudy,
    writing: Writing,
    post: Post,
    about: About,
    services: Services,
    service: Service,
    testimonials: Testimonials,
    contact: Contact,
    inquiry: Contact,
    page: Page,
    notFound: NotFound
  }
} satisfies Direction;
