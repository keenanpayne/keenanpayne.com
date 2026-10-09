import type { Direction } from "../../site";

import stylesheet from "./mech.css?url";
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

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&family=Shippori+Mincho+B1:wght@700;800&family=Share+Tech+Mono&display=swap";

export default {
  stylesheets: [FONTS_URL, stylesheet],
  Shell,
  templates: {
    home: Home,
    work: Work,
    caseStudy: CaseStudy,
    writing: Archive,
    post: Post,
    about: About,
    services: Services,
    service: (props) => <Generic {...props} isService />,
    testimonials: Testimonials,
    contact: (props) => <Contact {...props} variant="contact" />,
    inquiry: (props) => <Contact {...props} variant="inquiry" />,
    page: Generic,
    notFound: NotFound
  }
} satisfies Direction;
