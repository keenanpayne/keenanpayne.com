import type { Direction } from "../../site";

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
import stylesheet from "./portal.css?url";
import { Shell } from "./Shell";
import { specimens } from "./specimens";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Saira:ital,wdth,wght@0,50..125,100..900;1,50..125,100..900&family=Silkscreen:wght@400;700&display=swap";

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
  },
  specimens
} satisfies Direction;
