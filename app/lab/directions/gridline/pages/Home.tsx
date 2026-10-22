import { homeWork, Html, useTo, type TemplateProps } from "../../../site";
import {
  Arrow,
  Band,
  Blueprint,
  Button,
  Cells,
  Eyebrow,
  KindWords,
  PostRows,
  SectionHead,
  ServiceCells,
  Stat,
  Terminal,
  WorkCards
} from "../parts";

export function Home({ content }: TemplateProps<"home">) {
  const to = useTo();
  const { profile, posts, work, services, testimonials } = content;

  return (
    <>
      <header className="gl-band gl-hero">
        <Eyebrow>
          {profile.name}
          <span className="gl-eyebrow__sep" aria-hidden="true">
            /
          </span>
          {profile.location.name}
        </Eyebrow>
        <h1 className="gl-display">{profile.role}</h1>
        <Html as="p" className="gl-lede" html={profile.bio} />
        <div className="gl-actions">
          <Button href={to("/project-inquiry/")}>
            Start a project <Arrow />
          </Button>
          <Button variant="ghost" href={to("/portfolio/")}>
            See the work
          </Button>
        </div>
      </header>

      <Band label="At the terminal">
        <Blueprint className="gl-hero__panel">
          <Terminal content={content} />
        </Blueprint>
      </Band>

      <Band label="By the numbers">
        <Cells cols={4}>
          <Stat value={profile.experience.years} label="Years on the web" />
          <Stat value={work.length} label="Case studies" />
          <Stat value={posts.length} label="Articles and tutorials" />
          <Stat
            value={profile.location.elevationFeet.toLocaleString("en-US")}
            label={`Feet up, in ${profile.location.city}`}
          />
        </Cells>
      </Band>

      <Band>
        <SectionHead
          index={1}
          eyebrow="Writing"
          title="Recent writing"
          description="Essays on craft and career, and tutorials from the work."
          more={{ text: "All writing", url: to("/archive/") }}
        />
        <PostRows posts={posts.slice(0, 5)} />
      </Band>

      <Band className="gl-band--gray">
        <SectionHead
          index={2}
          eyebrow="Work"
          title="Selected work"
          description="Marketing sites, content hubs, and design systems for teams I’ve partnered with."
          more={{ text: "All case studies", url: to("/portfolio/") }}
        />
        <WorkCards work={homeWork(content)} />
      </Band>

      <Band>
        <SectionHead
          index={3}
          eyebrow="Services"
          title="How I can help"
          more={{ text: "All services", url: to("/services/") }}
        />
        <ServiceCells services={services} />
      </Band>

      <KindWords testimonials={testimonials} index={4} />
    </>
  );
}
