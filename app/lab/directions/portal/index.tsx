import type { Direction } from "../../site";
import direction from "@keenanpayne/forma-ui/directions/portal.json";
import stylesheet from "@keenanpayne/forma-ui/portal.css?url";

import { About } from "./pages/About";
import { Archive } from "./pages/Archive";
import { CaseStudy } from "./pages/CaseStudy";
import { Contact } from "./pages/Contact";
import { Generic } from "./pages/Generic";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Post } from "./pages/Post";
import { Services } from "./pages/Services";
import { Testimonials } from "./pages/Testimonials";
import { Work } from "./pages/Work";
import { Shell } from "./Shell";

export default {
  // Its web fonts, from its manifest, then its stylesheet
  stylesheets: [...direction.fonts, stylesheet],
  root: "pt",
  Shell,
  templates: {
    home: Home,
    work: Work,
    caseStudy: CaseStudy,
    writing: Archive,
    post: Post,
    archive: Generic,
    about: About,
    services: Services,
    service: (props) => <Generic {...props} isService />,
    testimonials: Testimonials,
    contact: (props) => <Contact {...props} variant="contact" />,
    inquiry: (props) => <Contact {...props} variant="inquiry" />,
    page: Generic,
    notFound: NotFound
  },
  specimens: () => import("./specimens")
} satisfies Direction;
