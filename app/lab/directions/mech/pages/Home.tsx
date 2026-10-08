import type { LabContent } from "../../../../lib/types";
import {
  Alert,
  Button,
  KindWords,
  Magi,
  pad,
  Panel,
  PostCards,
  Readout,
  Section,
  Ticker,
  UnitGrid,
  useDenverTime,
  useTo
} from "../parts";

const AVATAR =
  "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,c_fill,g_face,ar_1:1,w_480/v1666204078/people/me/jun-27-2021_o8sd0l.jpg";

/** Avatar in a hexagon, ringed by a gauge like a cockpit clock */
function Gauge() {
  const ticks = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="mc-gauge" aria-hidden="true">
      <svg viewBox="0 0 320 320">
        <defs>
          <pattern
            id="mc-gauge-stripes"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="5" height="10" className="mc-gauge__stripe" />
          </pattern>
          <clipPath id="mc-gauge-hex">
            <path d="M112 72h96l48 88-48 88h-96l-48-88Z" />
          </clipPath>
        </defs>

        <circle cx="160" cy="160" r="156" className="mc-gauge__line" />
        <g className="mc-gauge__ticks">
          {ticks.map((i) => (
            <line
              key={i}
              x1="160"
              y1={i % 5 ? 12 : 8}
              x2="160"
              y2="20"
              transform={`rotate(${i * 6} 160 160)`}
            />
          ))}
        </g>
        <circle
          cx="160"
          cy="160"
          r="132"
          pathLength="100"
          className="mc-gauge__arc"
          strokeDasharray="72 100"
          transform="rotate(-90 160 160)"
        />
        <circle
          cx="160"
          cy="160"
          r="132"
          pathLength="100"
          className="mc-gauge__hazard"
          strokeDasharray="20 100"
          strokeDashoffset="-76"
          transform="rotate(-90 160 160)"
        />
        <circle cx="160" cy="160" r="104" className="mc-gauge__line" />

        <image
          href={AVATAR}
          x="64"
          y="72"
          width="192"
          height="176"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#mc-gauge-hex)"
          className="mc-gauge__avatar"
        />
        <path
          d="M112 72h96l48 88-48 88h-96l-48-88Z"
          className="mc-gauge__tint"
        />
        <path
          d="M112 72h96l48 88-48 88h-96l-48-88Z"
          className="mc-gauge__frame"
        />
      </svg>

      {/* Its own element, so it turns on the compositor */}
      <svg viewBox="0 0 320 320" className="mc-gauge__spin">
        <circle cx="160" cy="160" r="116" strokeDasharray="2 6 18 6" />
      </svg>

      <svg viewBox="0 0 320 320">
        <text x="160" y="46" className="mc-gauge__num">
          12
        </text>
        <text x="282" y="164" className="mc-gauge__num">
          3
        </text>
        <text x="38" y="164" className="mc-gauge__num">
          9
        </text>
      </svg>
    </div>
  );
}

export function Home({ content }: { content: LabContent }) {
  const to = useTo();
  const time = useDenverTime(false);

  return (
    <>
      <section className="mc-hero">
        <div className="mc-hero__main">
          <p className="mc-pageHeader__eyebrow">
            <span className="mc-pageHeader__episode">Episode:18</span>
            Eighteen years on the web
          </p>
          <div className="mc-titlecard mc-titlecard--hero">
            <h1 className="mc-titlecard__title">
              Keenan Payne,
              <span>web developer</span>
              <span>&amp; designer</span>
            </h1>
            <p className="mc-titlecard__jp" lang="ja">
              ウェブ開発者・デザイナー
            </p>
          </div>
          <p className="mc-hero__lede">
            I’m a full-stack web developer and designer with eighteen years of
            experience helping teams market and build products on the web. I
            spent five years growing the website at{" "}
            <a href={to("/portfolio/asana/")}>Asana</a>, and have since
            partnered with <a href={to("/portfolio/rippling/")}>Rippling</a>,{" "}
            <a href={to("/portfolio/gofundme/")}>GoFundMe</a>,{" "}
            <a href={to("/portfolio/neuralink/")}>Neuralink</a>, and many
            others. I also <a href={to("/archive/")}>write</a> about craft,
            career, and the occasional reflection.
          </p>
          <div className="mc-hero__actions">
            <Button href={to("/portfolio/")}>View case studies</Button>
            <Button href={to("/contact/")} tone="ghost">
              Open comms channel
            </Button>
          </div>
        </div>

        <Panel
          as="aside"
          className="mc-hero__status"
          label="Pilot status"
          code="Sync stable"
        >
          <Gauge />
          <dl className="mc-readouts mc-readouts--grid">
            <Readout label="Experience" value="18" unit="yrs" tone="amber" />
            <Readout
              label="Case studies"
              value={pad(content.work.length, 3)}
              tone="green"
            />
            <Readout
              label="Articles"
              value={pad(content.posts.length, 3)}
              tone="green"
            />
            <Readout label="Local time" value={time ?? "--:--"} unit="MT" />
          </dl>
          <p className="mc-hero__coords">
            <span>Denver, CO</span>
            <span>39.74°N 104.99°W</span>
          </p>
        </Panel>
      </section>

      <Ticker posts={content.posts} />

      <Section
        label="Records"
        jp="記録"
        code={`${content.posts.length} on file`}
        more={{ href: to("/archive/"), text: "Writing archive" }}
      >
        <PostCards posts={content.posts.slice(0, 4)} all={content.posts} />
      </Section>

      <Section
        label="Units deployed"
        jp="機体"
        code={`${content.work.length} units`}
        more={{ href: to("/portfolio/"), text: "All work" }}
      >
        <UnitGrid work={content.work} />
      </Section>

      <Section
        label="Magi system · Services"
        jp="業務"
        code={`${content.services.length} systems online`}
        more={{ href: to("/services/"), text: "All services" }}
      >
        <Magi services={content.services} />
      </Section>

      <Alert />

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
