import type { Direction } from "../../site";

import stylesheet from "./neon.css?url";
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

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Tilt+Neon&family=Chakra+Petch:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Martian+Mono:wght@400;500&family=DotGothic16&display=swap";

export default {
  stylesheets: [FONTS_URL, stylesheet],
  root: "neon",
  Shell,
  templates: {
    home: Home,
    work: Work,
    caseStudy: CaseStudy,
    writing: Writing,
    post: Post,
    archive: Page,
    about: About,
    services: Services,
    service: Service,
    testimonials: Testimonials,
    contact: Contact,
    inquiry: Contact,
    page: Page,
    notFound: NotFound
  },
  specimens: () => import("./specimens")
} satisfies Direction;
