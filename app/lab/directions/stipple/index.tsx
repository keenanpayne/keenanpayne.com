import type { Direction } from "../../site";
import direction from "@keenanpayne/forma-ui/directions/stipple.json";
import stylesheet from "@keenanpayne/forma-ui/stipple.css?url";

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

export default {
  // Its web fonts, from its manifest, then its stylesheet
  stylesheets: [...direction.fonts, stylesheet],
  root: "st",
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
