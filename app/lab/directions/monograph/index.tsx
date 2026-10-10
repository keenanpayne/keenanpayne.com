import type { Direction } from "../../site";

import stylesheet from "./monograph.css?url";
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
import { specimens } from "./specimens";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=IBM+Plex+Mono:wght@400;500&display=swap";

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
