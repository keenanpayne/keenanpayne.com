import {
  useEffect,
  useEffectEvent,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode
} from "react";

import { HtmlContent } from "../../../components/HtmlContent";
import type { LabContent } from "../../../lib/types";
import {
  celsius,
  compass,
  conditionOf,
  coordinates,
  formFields,
  Html,
  NAVIGATION,
  pad,
  postsByYear,
  postTypes,
  relabel,
  useForecast,
  useLocalTime,
  useNow,
  useTo,
  WEATHER_CODES,
  zoneName,
  type SpecimenProps,
  type Specimens
} from "../../site";
import {
  Note,
  samplePostNav,
  Specimen,
  SpecimenGrid,
  TypeSample
} from "../../styleguide/kit";

import {
  clockFormat,
  dateFormat,
  Glyph,
  readingFormat,
  STATUS
} from "./Denver";
import { FACT_LABELS } from "./pages/About";
import { Equalizer } from "./pages/Archive";
import { FormField } from "./pages/Contact";
import { Gauge } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { SyncBar } from "./pages/Post";
import {
  Alert,
  AlertSide,
  Button,
  Feed,
  HexOutline,
  KindWords,
  Magi,
  MoreLink,
  Newsletter,
  PageHeader,
  Panel,
  PostCards,
  PostNav,
  Readout,
  recordCode,
  SectionBar,
  ServicesList,
  Ticker,
  Ticks,
  Transmission,
  Tri,
  UnitCard,
  UnitGrid,
  unitCode,
  Waveform
} from "./parts";
import { SECTORS } from "./Shell";

type Profile = LabContent["profile"];

/** A post type's archive, e.g. `/type/essays/` */
const typePath = (type: string) => `/type/${type.toLowerCase()}s/`;

/** The role as the home title card's lines, e.g. `…developer`, `& designer` */
const roleLines = (role: string) => role.split(/ (?=&)/);

/** The time zone's initials, e.g. `MT` */
const zoneInitials = ({ timeZoneName }: Profile["location"]) =>
  timeZoneName
    .split(" ")
    .map((word) => word[0])
    .join("");

/* Type scale
   ========================================================================== */

/** The local time, ticking on its own so nothing around it re-renders */
function Clock() {
  const now = useNow();
  return <time>{now ? clockFormat.format(now) : "--:--:--"}</time>;
}

function TypeScale({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work, services, testimonials } = content;
  const post = posts[1];
  const [featured, unit] = work;
  const quote = [...testimonials].sort(
    (a, b) => a.content.length - b.content.length
  )[0];

  return (
    <>
      <TypeSample label="Title card, home" measure=".mc-titlecard__title">
        <div className="mc-titlecard mc-titlecard--hero">
          <h1 className="mc-titlecard__title">
            {`${profile.name},`}
            {roleLines(profile.role).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
        </div>
      </TypeSample>
      <TypeSample label="Title card">
        <div className="mc-titlecard">
          <h1 className="mc-titlecard__title">{featured.name}</h1>
        </div>
      </TypeSample>
      <TypeSample label="Title card, post">
        <div className="mc-titlecard mc-titlecard--post">
          <h1 className="mc-titlecard__title">{post.title}</h1>
        </div>
      </TypeSample>
      <TypeSample label="Featured unit">
        <h3 className="mc-feature__name">
          <a href={featured.url}>{featured.name}</a>
        </h3>
      </TypeSample>
      <TypeSample label="Stage title">
        <h3 className="mc-sequence__title">{profile.process[0].title}</h3>
      </TypeSample>
      <TypeSample label="Log year" measure=".mc-log__year span">
        <h3 className="mc-log__year">
          <span>{post.year}</span>
          <span className="mc-log__rule" aria-hidden="true" />
          <span className="mc-log__count">
            {`${pad(posts.filter((item) => item.year === post.year).length)} records`}
          </span>
        </h3>
      </TypeSample>
      <TypeSample label="Japanese gloss">
        <div className="mc-titlecard">
          <p className="mc-titlecard__jp" lang="ja">
            機体記録
          </p>
        </div>
      </TypeSample>

      <TypeSample label="Prose heading 2">
        <div className="mc-prose">
          <h2>{posts[2].title}</h2>
        </div>
      </TypeSample>
      <TypeSample label="Prose heading 3">
        <div className="mc-prose">
          <h3>{services[0].title}</h3>
        </div>
      </TypeSample>
      <TypeSample label="Prose heading 4">
        <div className="mc-prose">
          <h4>{services[1].title}</h4>
        </div>
      </TypeSample>
      <TypeSample label="Unit name">
        <h3 className="mc-unit__name">
          <a href={unit.url}>{unit.name}</a>
        </h3>
      </TypeSample>
      <TypeSample label="Card title">
        <h3 className="mc-card__title">
          <a href={post.url}>{post.title}</a>
        </h3>
      </TypeSample>
      <TypeSample label="List title">
        <span className="mc-list__title">{services[0].title}</span>
      </TypeSample>
      <TypeSample label="Section bar" measure=".mc-bar__label">
        <SectionBar label="Records" jp="記録" />
      </TypeSample>
      <TypeSample label="Kicker">
        <p className="mc-kicker">Pilot briefing</p>
      </TypeSample>

      <TypeSample label="Hero lede">
        <Html as="p" className="mc-hero__lede" html={profile.bio} />
      </TypeSample>
      <TypeSample label="Lede">
        <p className="mc-pageHeader__lede">{post.lede}</p>
      </TypeSample>
      <TypeSample label="Body">
        <div className="mc-prose">
          <p>{posts[2].lede}</p>
        </div>
      </TypeSample>
      <TypeSample label="Transmission">
        <Html as="blockquote" className="mc-quote__text" html={quote.content} />
      </TypeSample>
      <TypeSample label="Card copy">
        <p className="mc-card__copy">{post.lede}</p>
      </TypeSample>

      <TypeSample label="Eyebrow">
        <p className="mc-pageHeader__eyebrow">
          <span className="mc-pageHeader__episode">{`Episode:${profile.experience.years}`}</span>
          {profile.experience.text}
        </p>
      </TypeSample>
      <TypeSample label="Episode" measure=".mc-pageHeader__episode">
        <p className="mc-pageHeader__eyebrow">
          <span className="mc-pageHeader__episode">{`Episode:${profile.experience.years}`}</span>
          {profile.experience.text}
        </p>
      </TypeSample>
      <TypeSample label="Gloss, small">
        <span className="mc-bar__jp" lang="ja">
          記録
        </span>
      </TypeSample>
      <TypeSample label="Panel label" measure=".mc-panel__label">
        <Panel as="div" label="Pilot status" code="Sync stable">
          {null}
        </Panel>
      </TypeSample>
      <TypeSample label="Panel code" measure=".mc-panel__code">
        <Panel as="div" label="Pilot status" code="Sync stable">
          {null}
        </Panel>
      </TypeSample>
      <TypeSample label="Readout label" measure="dt">
        <dl className="mc-readouts">
          <Readout label="Latest" value={posts[0].date} />
        </dl>
      </TypeSample>
      <TypeSample label="Readout" measure="dd">
        <dl className="mc-readouts">
          <Readout label="Latest" value={posts[0].date} />
        </dl>
      </TypeSample>
      <TypeSample label="Readout, green" measure="dd">
        <dl className="mc-readouts">
          <Readout label="Records" value={pad(posts.length, 3)} tone="green" />
        </dl>
      </TypeSample>
      <TypeSample label="Button" measure=".mc-btn__text">
        <Button href={to("/portfolio/")}>View case studies</Button>
      </TypeSample>
      <TypeSample label="More link" measure=".mc-more span">
        <MoreLink href={unit.url}>Access file</MoreLink>
      </TypeSample>
      <TypeSample label="Field label">
        <span className="mc-field__label">
          {formFields("contact")[0].label}
        </span>
      </TypeSample>
      <TypeSample label="Chip" measure="li">
        <ul className="mc-chips">
          <li>{featured.services[0]}</li>
        </ul>
      </TypeSample>
      <TypeSample label="Meta">
        <p className="mc-unit__meta">
          {[unit.industry, unit.role].filter(Boolean).join(" · ")}
        </p>
      </TypeSample>
      <TypeSample label="Clock">
        <p className="mc-den__clock" style={{ margin: 0 }}>
          <Clock />
        </p>
      </TypeSample>
    </>
  );
}

/* Motifs
   ========================================================================== */

/** Kinds of weather, by WMO code, each with what its sky readout does */
const SKIES: { code: number; night?: boolean; note: string }[] = [
  { code: 0, note: "A warm glow and a turning ring" },
  { code: 0, night: true, note: "A field of twinkling stars" },
  { code: 2, note: "Cloud banks drift across" },
  { code: 45, note: "Hazy bands shift over a softened readout" },
  { code: 63, note: "Two sheets of rain" },
  { code: 73, note: "Three layers of falling flakes" },
  { code: 95, note: "Red alert: rain, lightning, and a hazard edge" }
];

/** The sky readout for one kind of weather */
function Sky({ code, night = false }: { code: number; night?: boolean }) {
  const [label, condition] = WEATHER_CODES[code];
  const [tone, text] = STATUS[condition];

  return (
    <div
      className="mc-panel mc-den"
      data-condition={condition}
      data-night={night ? "" : undefined}
      style={{ maxWidth: "100%" }}
    >
      <div className="mc-den__sky">
        <span className="mc-den__fx" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <Glyph condition={condition} night={night} />
        <div className="mc-den__reading">
          <p className="mc-den__condition">
            {label}
            {night && " · Night"}
          </p>
        </div>
      </div>
      <p className="mc-den__status" data-tone={tone}>
        <span className="mc-dot" aria-hidden="true" />
        {text}
      </p>
    </div>
  );
}

/**
 * The header clock with its popover open, laid out in place (on a page the
 * popover sits in the top layer, anchored to the clock), reading the live
 * time and weather
 */
function Scan({ location }: { location: Profile["location"] }) {
  const now = useNow();
  const { forecast, readAt, status, refresh } = useForecast();

  const load = useEffectEvent(refresh);
  useEffect(() => load(), []);

  const current = forecast?.current;
  const [label, condition] = forecast ? conditionOf(forecast) : ["", undefined];
  const night = current?.is_day === 0;
  const stale = status === "error" && !!current;
  const [tone, statusText] =
    status === "error"
      ? [
          "amber",
          stale && readAt
            ? `Telemetry offline · Last reading ${readingFormat.format(readAt)}`
            : "Telemetry offline · Weather unavailable"
        ]
      : condition
        ? STATUS[condition]
        : ["amber", "Acquiring telemetry"];

  const fahrenheit = (value: number) => `${Math.round(value)}°`;
  const time = (iso?: string) => iso?.slice(11) ?? "--:--";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        justifyItems: "end",
        gap: 10
      }}
    >
      <div className="mc-hud__status">
        <button
          type="button"
          className="mc-hud__clock"
          aria-label={`${location.city} local time and weather`}
        >
          <span>{location.city.slice(0, 3)}</span>
          <time>{now ? clockFormat.format(now) : "--:--:--"}</time>
        </button>
      </div>

      <div
        className="mc-panel mc-den"
        data-condition={condition}
        data-night={night ? "" : undefined}
        style={{ maxWidth: "100%" }}
      >
        <div className="mc-panel__head">
          <span className="mc-panel__label">Atmospheric scan</span>
          <span className="mc-panel__code">{location.short}</span>
          <button type="button" className="mc-den__close" aria-label="Close">
            ×
          </button>
        </div>

        <div className="mc-den__time">
          <p className="mc-den__kicker">
            Local time
            {now && (
              <span>
                {zoneName(now, "short")} · {zoneName(now, "offset")}
              </span>
            )}
          </p>
          <p className="mc-den__clock">
            <time>{now ? clockFormat.format(now) : "--:--:--"}</time>
          </p>
          <p className="mc-den__date">{now ? dateFormat.format(now) : " "}</p>
        </div>

        <div className="mc-den__sky">
          <span className="mc-den__fx" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {current && condition ? (
            <>
              <Glyph condition={condition} night={night} />
              <div className="mc-den__reading">
                <p className="mc-den__temp">
                  {fahrenheit(current.temperature_2m)}
                  <span>F</span>
                  <small>{celsius(current.temperature_2m)}°C</small>
                </p>
                <p className="mc-den__condition">
                  {label}
                  {night && condition === "clear" && " · Night"}
                </p>
              </div>
            </>
          ) : (
            <p className="mc-den__message">
              {status === "error" ? (
                <>
                  Telemetry offline
                  <button type="button" onClick={refresh}>
                    Retry
                  </button>
                </>
              ) : (
                "Acquiring telemetry…"
              )}
            </p>
          )}
        </div>

        {current && forecast && (
          <>
            <dl className="mc-den__readouts">
              <div>
                <dt>Feels like</dt>
                <dd>{fahrenheit(current.apparent_temperature)}</dd>
              </div>
              <div>
                <dt>High</dt>
                <dd>{fahrenheit(forecast.daily.temperature_2m_max[0])}</dd>
              </div>
              <div>
                <dt>Low</dt>
                <dd>{fahrenheit(forecast.daily.temperature_2m_min[0])}</dd>
              </div>
              <div>
                <dt>Humidity</dt>
                <dd>{current.relative_humidity_2m}%</dd>
              </div>
              <div>
                <dt>Wind</dt>
                <dd>
                  {Math.round(current.wind_speed_10m)}
                  <small> mph </small>
                  {compass(current.wind_direction_10m)}
                </dd>
              </div>
              <div>
                <dt>Elevation</dt>
                <dd>
                  5,280<small> ft</small>
                </dd>
              </div>
            </dl>
            <p className="mc-den__sun">
              <span>Sunrise {time(forecast.daily.sunrise[0])}</span>
              <span>Sunset {time(forecast.daily.sunset[0])}</span>
            </p>
          </>
        )}

        <p className="mc-den__status" data-tone={tone}>
          <span className="mc-dot" aria-hidden="true" />
          {statusText}
          {stale && (
            <button type="button" onClick={refresh}>
              Retry
            </button>
          )}
        </p>
        <p className="mc-den__credit">
          Weather data: <a href="https://open-meteo.com/">Open-Meteo</a> ·{" "}
          {coordinates(location)}
        </p>
      </div>
    </div>
  );
}

function Motifs({ content }: SpecimenProps) {
  const { profile, testimonials } = content;
  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .join("");

  return (
    <>
      <Note>
        The lattice and vignette behind every specimen here are the root’s own
        background, the same as behind every page.
      </Note>
      <SpecimenGrid min={220}>
        <Specimen label="Hazard stripes" note="Footer, command deck, alerts">
          <span className="mc-hazard" aria-hidden="true" />
        </Specimen>
        <Specimen label="Corner brackets" note="On every panel">
          <Panel as="div" label="Panel" code="KP-01">
            <div style={{ minHeight: 72 }} />
          </Panel>
        </Specimen>
        <Specimen label="Ticks" note="Close every label strip">
          <Ticks />
        </Specimen>
        <Specimen
          label="Triangles"
          note="Right, left, up, down; in the text color"
        >
          <div style={{ display: "flex", gap: 16 }}>
            <Tri />
            <Tri dir="left" />
            <Tri dir="up" />
            <Tri dir="down" />
          </div>
        </Specimen>
        <Specimen label="Status dot" note="Blinks; takes its line’s tone">
          <span className="mc-dot" aria-hidden="true" />
        </Specimen>
        <Specimen label="Hex badge" note="The header’s ID plate">
          <span className="mc-badge" aria-hidden="true">
            <HexOutline />
            {initials}
          </span>
        </Specimen>
        <Specimen label="Ruler" note="Under the header on wide screens">
          <div className="mc-ruler" aria-hidden="true" />
        </Specimen>
        <Specimen
          label="Waveform"
          note="Seeded per transmission; one sweep runs through every trace on screen"
        >
          <Waveform seed={testimonials[0].id} />
        </Specimen>
        <Specimen label="Scanlines" note="Over every page, from the Shell">
          {/* Contained, so the fixed overlay covers only this box */}
          <div style={{ position: "relative", contain: "layout" }}>
            <Button>Open comms channel</Button>
            <div className="mc-scan" aria-hidden="true" />
          </div>
        </Specimen>
        <Specimen label="Hex tile" note="The MAGI cluster’s status cell">
          <span className="mc-hex mc-hex--status" aria-hidden="true">
            <span className="mc-hex__mode">Magi system</span>
            <span className="mc-hex__title">All systems nominal</span>
            <span className="mc-hex__number">
              <span className="mc-dot" />
            </span>
          </span>
        </Specimen>
        <Specimen
          label="Warning hexagon"
          note="Flanks the alert banner on wide screens"
        >
          <div style={{ maxWidth: 160 }}>
            <AlertSide />
          </div>
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid min={360}>
        <Specimen
          label="Clock and atmospheric scan"
          note="The header clock and the popover it opens, live"
        >
          <Scan location={profile.location} />
        </Specimen>
        {SKIES.map((sky) => (
          <Specimen
            key={`${sky.code}${sky.night ? "-night" : ""}`}
            label={`Sky, ${WEATHER_CODES[sky.code][1]}${sky.night ? " at night" : ""}`}
            note={sky.note}
          >
            <Sky code={sky.code} night={sky.night} />
          </Specimen>
        ))}
        <Specimen label="Sky, offline" note="A reading that failed">
          <div className="mc-panel mc-den" style={{ maxWidth: "100%" }}>
            <div className="mc-den__sky">
              <span className="mc-den__fx" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <p className="mc-den__message">
                Telemetry offline
                <button type="button">Retry</button>
              </p>
            </div>
            <p className="mc-den__status" data-tone="amber">
              <span className="mc-dot" aria-hidden="true" />
              Telemetry offline · Weather unavailable
            </p>
          </div>
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid>
        <Specimen
          label="Defensive screen"
          note="The 404 page: MAGI rings repeating the error, routes out"
          wide
        >
          <NotFound />
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

/* Imagery
   ========================================================================== */

function Imagery({ content }: SpecimenProps) {
  const time = useLocalTime({ hour12: false });
  const { profile, posts, work, testimonials } = content;
  const { experience, location, photos } = profile;
  const [featured, ...units] = work;
  const pictured = posts.find((post) => post.image);
  const blank = posts.find((post) => !post.image);
  const person = testimonials.find(
    (testimonial) => testimonial.person?.image
  )?.person;
  // The photo on show in the lightbox frame, chosen by a frame's Enlarge
  const [shown, setShown] = useState(0);
  const photo = photos[shown];
  const step = (by: number) =>
    setShown((shown + by + photos.length) % photos.length);

  return (
    <>
      <SpecimenGrid min={240}>
        <Specimen
          label="Feed"
          note="Tinted amber, scanned; full color on hover"
        >
          <Feed src={pictured?.image} href={pictured?.url} />
        </Specimen>
        <Specimen label="Feed, natural" note="Photos keep their own colors">
          <Feed src={photos[1]?.src} alt={photos[1]?.alt} natural />
        </Specimen>
        <Specimen label="Feed, labeled" note="The featured unit’s cover">
          <Feed src={featured.cover} label="Visual feed · Live" />
        </Specimen>
        {blank && (
          <Specimen label="No visual feed" note="A record without an image">
            <Feed href={blank.url} label={blank.year} />
          </Specimen>
        )}
        {person?.image && (
          <Specimen label="Portrait" note="Transmissions, cut to a hexagon">
            <figure style={{ margin: 0 }}>
              <figcaption className="mc-quote__person">
                <img src={person.image} alt="" loading="lazy" />
                <span>
                  <strong>{person.name}</strong>
                  {person.position && <span>{person.position}</span>}
                </span>
              </figcaption>
            </figure>
          </Specimen>
        )}
      </SpecimenGrid>

      <SpecimenGrid min={340}>
        <Specimen
          label="Pilot status"
          note="Home: the avatar in a hexagon, ringed by a gauge; full color on hover"
        >
          <Panel
            as="aside"
            className="mc-hero__status"
            label="Pilot status"
            code="Sync stable"
          >
            <Gauge avatar={profile.avatar} />
            <dl className="mc-readouts mc-readouts--grid">
              <Readout
                label="Experience"
                value={experience.years}
                unit="yrs"
                tone="amber"
              />
              <Readout
                label="Case studies"
                value={pad(work.length, 3)}
                tone="green"
              />
              <Readout
                label="Articles"
                value={pad(posts.length, 3)}
                tone="green"
              />
              <Readout
                label="Local time"
                value={time ?? "--:--"}
                unit={zoneInitials(location)}
              />
            </dl>
            <p className="mc-hero__coords">
              <span>{location.short}</span>
              <span>{coordinates(location)}</span>
            </p>
          </Panel>
        </Specimen>
        <Specimen label="Cover" note="A case study’s, in full">
          <Panel
            as="figure"
            className="mc-case__cover"
            label="Visual feed · Primary"
            code={unitCode(0)}
          >
            <img src={featured.cover} alt="" />
          </Panel>
        </Specimen>
        <Specimen
          label="Gallery"
          note="Case studies: a linked title, a title and caption, or the image alone; covers stand in for screenshots"
          wide
        >
          <div className="mc-gallery mc-gallery--3">
            {units.slice(0, 3).map((item, index) => (
              <figure className="mc-gallery__item" key={item.url}>
                <a
                  className="mc-gallery__media"
                  href={item.cover}
                  tabIndex={-1}
                >
                  <img src={item.cover} alt={item.name} loading="lazy" />
                </a>
                {index < 2 && (
                  <figcaption>
                    {index === 0 ? (
                      <MoreLink href={item.url}>{item.name}</MoreLink>
                    ) : (
                      <span className="mc-gallery__title">{item.name}</span>
                    )}
                    {index === 1 && item.industry && (
                      <span>{item.industry}</span>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </Specimen>
        <Specimen
          label="Photo frames"
          note="About; Enlarge shows the photo in the lightbox below"
          wide
        >
          <div className="mc-grid mc-grid--3">
            {photos.map((item, index) => (
              <Panel
                as="figure"
                key={item.src}
                className="mc-photo"
                label={`Frame ${pad(index + 1, 3)}`}
                code="Rec"
              >
                <Feed
                  src={item.src}
                  alt={item.alt}
                  natural
                  onZoom={() => setShown(index)}
                />
                <figcaption>{item.alt}</figcaption>
              </Panel>
            ))}
          </div>
        </Specimen>
        <Specimen
          label="Lightbox"
          note="The enlarged view, here in place rather than over the page"
          wide
        >
          <div className="mc-panel mc-lightbox__frame">
            <div className="mc-panel__head">
              <span className="mc-panel__label">Frame {pad(shown + 1, 3)}</span>
              <span className="mc-panel__code">
                Rec · {pad(shown + 1)} / {pad(photos.length)}
              </span>
              <button type="button" className="mc-lightbox__button">
                Close <span aria-hidden="true">×</span>
              </button>
            </div>
            <figure className="mc-lightbox__figure">
              <div className="mc-lightbox__media">
                <img key={photo.large} src={photo.large} alt={photo.alt} />
              </div>
              <figcaption className="mc-lightbox__caption">
                <Tri />
                {photo.alt}
              </figcaption>
            </figure>
            {photos.length > 1 && (
              <div className="mc-lightbox__controls">
                <button
                  type="button"
                  className="mc-lightbox__button"
                  onClick={() => step(-1)}
                >
                  <Tri dir="left" /> Previous
                </button>
                <span className="mc-lightbox__dots" aria-hidden="true">
                  {photos.map((item, index) => (
                    <span
                      key={item.src}
                      className={index === shown ? "is-current" : undefined}
                    />
                  ))}
                </span>
                <button
                  type="button"
                  className="mc-lightbox__button"
                  onClick={() => step(1)}
                >
                  Next <Tri />
                </button>
              </div>
            )}
          </div>
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

/* Page header
   ========================================================================== */

function PageHeaders({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work, services } = content;
  const { experience } = profile;
  const post = posts[1];
  const [featured] = work;
  const [service] = services;
  const years = postsByYear(posts);

  return (
    <SpecimenGrid min={420}>
      <Specimen
        label="Hero"
        note="Home: episode, title card, bio, and calls to action; the Pilot status panel beside it is under Imagery"
        wide
      >
        <div className="mc-hero__main">
          <p className="mc-pageHeader__eyebrow">
            <span className="mc-pageHeader__episode">{`Episode:${experience.years}`}</span>
            {experience.text}
          </p>
          <div className="mc-titlecard mc-titlecard--hero">
            <h1 className="mc-titlecard__title">
              {`${profile.name},`}
              {roleLines(profile.role).map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="mc-titlecard__jp" lang="ja">
              ウェブ開発者・デザイナー
            </p>
          </div>
          <Html as="p" className="mc-hero__lede" html={profile.bio} />
          <div className="mc-hero__actions">
            <Button href={to("/portfolio/")}>View case studies</Button>
            <Button href={to("/contact/")} tone="ghost">
              Open comms channel
            </Button>
          </div>
        </div>
      </Specimen>

      <Specimen
        label="Page header, with readouts"
        note="Index pages: episode, gloss, and readouts beside the title on wide screens"
        wide
      >
        <PageHeader
          episode="Episode:02"
          eyebrow="Writing"
          jp="記録"
          title="Writing"
          aside={
            <dl className="mc-readouts mc-readouts--grid">
              <Readout
                label="Records"
                value={pad(posts.length, 3)}
                tone="green"
              />
              <Readout
                label="Years"
                value={pad(years.length, 3)}
                tone="green"
              />
              <Readout
                label="Classes"
                value={pad(postTypes(posts).length, 3)}
                tone="green"
              />
              <Readout label="Latest" value={posts[0]?.date ?? "—"} />
            </dl>
          }
        />
      </Specimen>

      <Specimen
        label="Case study"
        note="Unit code and breadcrumb, client, gloss, lede, then a strip of readouts"
        wide
      >
        <header className="mc-pageHeader">
          <div className="mc-pageHeader__main">
            <p className="mc-pageHeader__eyebrow">
              <span className="mc-pageHeader__episode">{unitCode(0)}</span>
              <a href={to("/portfolio/")}>Work</a>
              <span aria-hidden="true">/</span>
              Case study
            </p>
            <div className="mc-titlecard">
              <h1 className="mc-titlecard__title">{featured.name}</h1>
              <p className="mc-titlecard__jp" lang="ja">
                機体記録
              </p>
            </div>
            {featured.lede && (
              <Html
                as="p"
                className="mc-pageHeader__lede"
                html={featured.lede}
              />
            )}
          </div>
        </header>
        <dl className="mc-readouts mc-readouts--strip">
          {featured.industry && (
            <Readout label="Sector" value={featured.industry} />
          )}
          {featured.year && (
            <Readout label="Active" value={featured.year} tone="green" />
          )}
          {featured.services.length > 0 && (
            <Readout label="Services" value={featured.services.join(", ")} />
          )}
        </dl>
      </Specimen>

      <Specimen
        label="Post"
        note="Record code and breadcrumb, a smaller title card in sentence case, lede"
        wide
      >
        <header className="mc-pageHeader mc-post__header">
          <div className="mc-pageHeader__main">
            <p className="mc-pageHeader__eyebrow">
              <span className="mc-pageHeader__episode">
                {recordCode(posts, post.url)}
              </span>
              <a href={to("/archive/")}>Records</a>
              {post.type && (
                <>
                  <span aria-hidden="true">/</span>
                  <a href={to(typePath(post.type))}>{post.type}</a>
                </>
              )}
            </p>
            <div className="mc-titlecard mc-titlecard--post">
              <h1 className="mc-titlecard__title">{post.title}</h1>
            </div>
            {post.lede && <p className="mc-pageHeader__lede">{post.lede}</p>}
          </div>
        </header>
      </Specimen>

      <Specimen
        label="Service"
        note="System number; the MAGI tile’s title flies into it as the page opens"
        wide
      >
        <PageHeader
          episode="Sys-01"
          eyebrow="Service"
          jp="業務"
          title={service.title}
          lede={service.lede}
        />
      </Specimen>
    </SpecimenGrid>
  );
}

/* Buttons & links
   ========================================================================== */

function Actions({ content }: SpecimenProps) {
  const to = useTo();
  const { work, socials } = content;

  return (
    <>
      <SpecimenGrid min={240}>
        <Specimen
          label="Button"
          note="Hover or focus: charges green, locks on, decodes its label"
        >
          <Button href={to("/portfolio/")}>View case studies</Button>
        </Specimen>
        <Specimen label="Button, ghost" note="A keyline that turns green">
          <Button href={to("/contact/")} tone="ghost">
            Open comms channel
          </Button>
        </Specimen>
        <Specimen label="Button, submit" note="Forms and the newsletter">
          <Button type="submit">Transmit</Button>
        </Specimen>
        <Specimen
          label="Button, invert"
          note="On the alert banner: charges to black with a hazard-yellow edge"
        >
          <Button tone="invert" href={to("/project-inquiry/")}>
            Initiate project inquiry
          </Button>
        </Specimen>
        <Specimen label="More link" note="Bracketed; cards, panels, the 404">
          <MoreLink href={work[1].url}>Access file</MoreLink>
        </Specimen>
        <Specimen label="More link, back">
          <MoreLink href={to("/archive/")} back>
            Writing archive
          </MoreLink>
        </Specimen>
        <Specimen label="Bar link" note="Ends a section bar">
          <a className="mc-bar__more" href={to("/archive/")}>
            Writing archive
            <Tri />
          </a>
        </Specimen>
        <Specimen
          label="Text link"
          note="Prose and ledes: amber, green on hover"
        >
          <div className="mc-prose">
            <p>
              Questions or thoughts?{" "}
              <a href={to("/contact/")}>Open a channel</a>.
            </p>
          </div>
        </Specimen>
        <Specimen label="Frame buttons" note="The lightbox’s controls">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" className="mc-lightbox__button">
              <Tri dir="left" /> Previous
            </button>
            <button type="button" className="mc-lightbox__button">
              Next <Tri />
            </button>
          </div>
        </Specimen>
        <Specimen label="Relay links" note="The footer’s links elsewhere">
          <ul className="mc-footer__social">
            {socials.map((social) => (
              <li key={social.url}>
                <a href={social.url} rel={social.rel}>
                  {social.text}
                </a>
              </li>
            ))}
            <li>
              <a href="/feed.xml">RSS</a>
            </li>
          </ul>
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid>
        <Specimen
          label="Alert banner"
          note="Ends most pages, after the battle stations screens; the heading varies by page"
          wide
        >
          <Alert />
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

/* Labels & tags
   ========================================================================== */

function Labels({ content }: SpecimenProps) {
  const to = useTo();
  const time = useLocalTime({ hour12: false });
  const { profile, posts, work } = content;
  const { experience, location } = profile;
  const post = posts[1];
  const [featured, unit] = work;

  return (
    <SpecimenGrid min={240}>
      <Specimen label="Kicker" note="Opens a column of copy">
        <p className="mc-kicker">Pilot briefing</p>
      </Specimen>
      <Specimen label="Eyebrow" note="Episode number, then the page">
        <p className="mc-pageHeader__eyebrow">
          <span className="mc-pageHeader__episode">Episode:03</span>
          About
        </p>
      </Specimen>
      <Specimen
        label="Label strip"
        note="Heads every panel: label, code, ticks"
      >
        <Panel as="div" label="Personnel file" code="KP-01">
          {null}
        </Panel>
      </Specimen>
      <Specimen label="Chips" note="Services and technologies">
        <ul className="mc-chips">
          {featured.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      </Specimen>
      <Specimen
        label="Chips, small"
        note="A post’s tags, linked; post types stand in"
      >
        <ul className="mc-chips mc-chips--small">
          {postTypes(posts).map((type) => (
            <li key={type}>
              <a href={to(typePath(type))}>{type}</a>
            </li>
          ))}
        </ul>
      </Specimen>
      <Specimen label="Codes" note="Records, systems, and stages, in green">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          <span className="mc-log__code">{recordCode(posts, post.url)}</span>
          <span className="mc-list__code">Sys-01</span>
          <span className="mc-sequence__stage">Stage 01</span>
        </div>
      </Specimen>
      <Specimen label="Readout">
        <dl className="mc-readouts">
          <Readout label="Latest" value={posts[0].date} />
        </dl>
      </Specimen>
      <Specimen label="Readout, green" note="Counts">
        <dl className="mc-readouts">
          <Readout label="Units" value={pad(work.length, 3)} tone="green" />
        </dl>
      </Specimen>
      <Specimen label="Readout, amber" note="With a unit">
        <dl className="mc-readouts">
          <Readout
            label="Experience"
            value={experience.years}
            unit="yrs"
            tone="amber"
          />
        </dl>
      </Specimen>
      <Specimen label="Readout, with unit">
        <dl className="mc-readouts">
          <Readout
            label="Local time"
            value={time ?? "--:--"}
            unit={zoneInitials(location)}
          />
        </dl>
      </Specimen>
      <Specimen label="Rec tag" note="The ticker’s recording light">
        <span className="mc-ticker__rec">
          <span className="mc-dot" />
          Rec
        </span>
      </Specimen>
      <Specimen label="Signal" note="Status, with a blinking dot">
        <span className="mc-deck__signal">
          <span className="mc-dot" aria-hidden="true" />
          All systems nominal
        </span>
      </Specimen>
      <Specimen label="Card foot" note="Date and a read link">
        <p className="mc-card__foot">
          <time>{post.date}</time>
          <a href={post.url} tabIndex={-1} aria-hidden="true">
            Read <Tri />
          </a>
        </p>
      </Specimen>
      <Specimen label="Unit meta" note="Sector and role">
        <p className="mc-unit__meta">
          {[unit.industry, unit.role].filter(Boolean).join(" · ")}
        </p>
      </Specimen>
      <Specimen label="Coordinates" note="Foot of the Pilot status panel">
        <p className="mc-hero__coords">
          <span>{location.short}</span>
          <span>{coordinates(location)}</span>
        </p>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Sections & panels
   ========================================================================== */

function Surfaces({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, services } = content;
  const [challenge, solution] = services.filter((service) => service.lede);

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Panel"
        note="Amber keyline, corner brackets, and a label strip"
      >
        <Panel label="Objective" code="Challenge" className="mc-pillar">
          <p className="mc-pillar__text">{challenge?.lede}</p>
        </Panel>
      </Specimen>
      <Specimen label="Panel, green" note="A case study’s resolution">
        <Panel
          label="Resolution"
          code="Solution"
          className="mc-pillar mc-pillar--green"
        >
          <p className="mc-pillar__text">{solution?.lede}</p>
        </Panel>
      </Specimen>
      <Specimen
        label="Section bar"
        note="Opens a section: label, gloss, rule, count (wider screens), and a link"
        wide
      >
        <SectionBar
          label="Records"
          jp="記録"
          code={`${posts.length} on file`}
          more={{ href: to("/archive/"), text: "Writing archive" }}
        />
      </Specimen>
      <Specimen label="Section bar, short" note="Label and gloss" wide>
        <SectionBar label="Signal history" jp="履歴" />
      </Specimen>
      <Specimen
        label="Split"
        note="Copy beside a side panel, two columns on wide screens; About and service pages"
        wide
      >
        <section
          className="mc-section mc-split mc-split--reverse"
          style={{ marginTop: 0 }}
        >
          <div>
            <p className="mc-kicker">Briefing</p>
            <Html className="mc-prose" html={profile.bio} />
          </div>
          <Panel as="aside" label="System status" code="Online">
            <ServicesList services={services.slice(1, 5)} numbered={false} />
          </Panel>
        </section>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Cards
   ========================================================================== */

function Cards({ content }: SpecimenProps) {
  const { posts, work, services } = content;
  const pictured = posts.filter((post) => post.image).slice(0, 3);
  const blank = posts.find((post) => !post.image);

  return (
    <SpecimenGrid>
      <Specimen
        label="Record card"
        note="Writing: class and record code, feed, title, lede, date; the last has no image"
        wide
      >
        <PostCards
          posts={blank ? [...pictured, blank] : posts.slice(0, 4)}
          all={posts}
        />
      </Specimen>
      <Specimen
        label="Featured unit"
        note="The first case study: wide feed, lede, readouts, chips, and a button"
        wide
      >
        <UnitGrid work={work.slice(0, 1)} />
      </Specimen>
      <Specimen
        label="Unit card"
        note="Work: designation and years, square cover, name, sector and role"
        wide
      >
        <div className="mc-grid mc-grid--3">
          {work.slice(1, 4).map((item, index) => (
            <UnitCard key={item.url} item={item} index={index + 1} />
          ))}
        </div>
      </Specimen>
      <Specimen
        label="MAGI cluster"
        note="Services as hexagons, then a status cell; amber on hover"
        wide
      >
        <Magi services={services} />
      </Specimen>
    </SpecimenGrid>
  );
}

/* Lists & tables
   ========================================================================== */

function Lists({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work, services, socials } = content;
  const post = posts[1];
  const types = postTypes(posts);
  const [type] = types;
  const recent = posts.slice(0, 6);
  const entries = posts.filter((item) => item.type === type).slice(0, 4);
  const classes = types.map(
    (name) => [name, posts.filter((item) => item.type === name).length] as const
  );
  const most = Math.max(1, ...classes.map(([, count]) => count));
  const photo = profile.photos[0];

  const facts: [string, ReactNode][] = [
    ...relabel(profile.facts, FACT_LABELS).map((fact): [string, ReactNode] => [
      fact.label,
      fact.url ? (
        <a href={fact.url}>{fact.text}</a>
      ) : fact.id === "role" ? (
        `KP-01 · ${fact.text}`
      ) : (
        fact.text
      )
    ]),
    [
      "Relays",
      socials.map((social, index) => (
        <span key={social.url}>
          {index > 0 && " · "}
          <a href={social.url} rel={social.rel}>
            {social.text}
          </a>
        </span>
      ))
    ]
  ];

  return (
    <SpecimenGrid min={340}>
      <Specimen
        label="Ticker"
        note="Home: the latest headlines, scrolling; pauses on hover"
        wide
      >
        <Ticker posts={posts} />
      </Specimen>

      <Specimen
        label="Record log"
        note="Writing archive, by year; the newest six here"
        wide
      >
        {postsByYear(recent).map(([year, items]) => (
          <div className="mc-log" key={year}>
            <h3 className="mc-log__year">
              <span>{year}</span>
              <span className="mc-log__rule" aria-hidden="true" />
              <span className="mc-log__count">
                {pad(items.length)} record{items.length === 1 ? "" : "s"}
              </span>
            </h3>
            <ol className="mc-log__rows">
              {items.map((item) => (
                <li key={item.url}>
                  <a href={item.url}>
                    <span className="mc-log__code">
                      {recordCode(posts, item.url)}
                    </span>
                    <span className="mc-log__date">
                      {item.date.slice(0, 6)}
                    </span>
                    <span className="mc-log__title">{item.title}</span>
                    <span className="mc-log__type">{item.type}</span>
                    <Tri />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </Specimen>

      {type && (
        <Specimen
          label="Entries"
          note={`Type and tag archives: number, title, lede; ${type.toLowerCase()}s here`}
          wide
        >
          <ol className="mc-log__rows mc-log__rows--entries">
            {entries.map((entry, index) => (
              <li key={entry.url}>
                <a href={entry.url}>
                  <span className="mc-log__code">{pad(index + 1, 3)}</span>
                  <span className="mc-log__title">{entry.title}</span>
                  {entry.lede && (
                    <span className="mc-log__type">{entry.lede}</span>
                  )}
                  <Tri />
                </a>
              </li>
            ))}
          </ol>
        </Specimen>
      )}

      <Specimen
        label="Unit registry"
        note="Work, as a table; scrolls sideways on phones"
        wide
      >
        <div className="mc-tableWrap">
          <table className="mc-table">
            <thead>
              <tr>
                <th scope="col">Unit</th>
                <th scope="col">Client</th>
                <th scope="col">Sector</th>
                <th scope="col">Role</th>
                <th scope="col">Years</th>
                <th scope="col">
                  <span className="mc-visually-hidden">Link</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {work.slice(0, 5).map((item, index) => (
                <tr key={item.url}>
                  <td className="mc-table__code">{unitCode(index)}</td>
                  <th scope="row">
                    <a href={item.url}>{item.name}</a>
                  </th>
                  <td>{item.industry}</td>
                  <td>{item.role}</td>
                  <td className="mc-table__num">{item.year}</td>
                  <td className="mc-table__go">
                    <Tri />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Specimen>

      <Specimen
        label="System manifest"
        note="Services: system number, title, lede; four columns on wide screens"
        wide
      >
        <ServicesList services={services} />
      </Specimen>

      <Specimen
        label="Launch sequence"
        note="Services: how a project runs, stage by stage"
        wide
      >
        <ol className="mc-sequence">
          {profile.process.map((step, index) => (
            <li key={step.title}>
              <span className="mc-sequence__stage">Stage {pad(index + 1)}</span>
              <h3 className="mc-sequence__title">{step.title}</h3>
              <p className="mc-card__copy">{step.text}</p>
            </li>
          ))}
        </ol>
      </Specimen>

      <Specimen
        label="Output by year"
        note="Writing archive: records per year as hexagon cells, the peak in green"
        wide
      >
        <Equalizer years={postsByYear(posts)} />
      </Specimen>

      <Specimen
        label="Level meter"
        note="Testimonials: the qualities mentioned most; records by class stand in"
      >
        <Panel label="Signal analysis" code="By class">
          <ul className="mc-levels">
            {classes.map(([name, count]) => (
              <li key={name}>
                <span className="mc-levels__label">{name}</span>
                <span
                  className="mc-levels__bar"
                  style={{ "--level": count / most } as CSSProperties}
                  aria-hidden="true"
                />
                <span className="mc-levels__value">{pad(count)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Specimen>

      <Specimen
        label="Spec sheet"
        note="A post’s rail: terms over details (also read time and tags)"
      >
        <Panel label="File data" code={recordCode(posts, post.url)}>
          <dl className="mc-spec">
            <div>
              <dt>Logged</dt>
              <dd>
                <time dateTime={post.iso}>{post.date}</time>
              </dd>
            </div>
            {post.type && (
              <div>
                <dt>Class</dt>
                <dd>
                  <a href={to(typePath(post.type))}>{post.type}</a>
                </dd>
              </div>
            )}
          </dl>
        </Panel>
      </Specimen>

      <Specimen
        label="Spec sheet, compact"
        note="About: the facts in Mech’s words, beside their terms, under an ID photo"
      >
        <Panel as="aside" label="Personnel file" code="KP-01">
          <div className="mc-dossier">
            <Feed
              className="mc-dossier__photo"
              src={photo.src}
              alt={photo.alt}
              label="ID · KP-01"
              natural
            />
            <dl className="mc-spec mc-spec--compact">
              {facts.map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Panel>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Testimonials
   ========================================================================== */

function Quotes({ content }: SpecimenProps) {
  const { testimonials } = content;

  return (
    <SpecimenGrid>
      <Specimen
        label="Kind words"
        note="Home, Work, Services, and service pages: transmissions in a row of three"
        wide
      >
        <KindWords testimonials={testimonials} />
      </Specimen>
      <Specimen
        label="Transmissions, masonry"
        note="The Testimonials page: columns of natural height (the same three here)"
        wide
      >
        <div className="mc-masonry">
          {testimonials.map((testimonial, index) => (
            <Transmission
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Forms
   ========================================================================== */

function Forms({ content }: SpecimenProps) {
  const to = useTo();
  const time = useLocalTime({ hour12: false, seconds: true });
  const { email, location } = content.profile;
  const [sent, setSent] = useState<"contact" | "inquiry">();
  const submit = (form: "contact" | "inquiry") => (event: FormEvent) => {
    event.preventDefault();
    setSent(form);
  };

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Contact"
        note="formFields(“contact”), beside the comms channel"
        wide
      >
        <section className="mc-split mc-contact" style={{ marginTop: 0 }}>
          <Panel as="aside" label="Comms channel" code="Open">
            <div className="mc-contact__aside">
              <dl className="mc-spec mc-spec--compact">
                <div>
                  <dt>Frequency</dt>
                  <dd>
                    <a href={`mailto:${email}`}>{email}</a>
                  </dd>
                </div>
                <div>
                  <dt>Base</dt>
                  <dd>{`${location.name} (${location.timeZoneName})`}</dd>
                </div>
                <div>
                  <dt>Local time</dt>
                  <dd className="mc-contact__time">{time ?? "--:--:--"}</dd>
                </div>
              </dl>
              <MoreLink href={to("/project-inquiry/")}>
                Start a project inquiry instead
              </MoreLink>
            </div>
          </Panel>

          <Panel
            label="Compose transmission"
            code={sent === "contact" ? "Held" : "Ready"}
          >
            <form className="mc-form" onSubmit={submit("contact")}>
              {formFields("contact").map((field) => (
                <FormField key={field.name} field={field} />
              ))}
              <div className="mc-form__actions mc-field--wide">
                <Button type="submit">Transmit</Button>
                <p className="mc-form__status" role="status">
                  {sent === "contact"
                    ? "Transmission held — mockup only, nothing was sent."
                    : "Mockup only — this form doesn’t send anything."}
                </p>
              </div>
            </form>
          </Panel>
        </section>
      </Specimen>

      <Specimen
        label="Project inquiry"
        note="formFields(“inquiry”): inputs, a date, toggles for checkboxes and radios"
        wide
      >
        <Panel
          label="Mission request"
          code={sent === "inquiry" ? "Held" : "Ready"}
        >
          <form className="mc-form" onSubmit={submit("inquiry")}>
            {formFields("inquiry").map((field) => (
              <FormField key={field.name} field={field} />
            ))}
            <div className="mc-form__actions mc-field--wide">
              <Button type="submit">Send inquiry</Button>
              <p className="mc-form__status" role="status">
                {sent === "inquiry"
                  ? "Transmission held — mockup only, nothing was sent."
                  : "Mockup only — this form doesn’t send anything."}
              </p>
            </div>
          </form>
        </Panel>
      </Specimen>

      <Specimen
        label="Newsletter"
        note="Writing archive and posts: a panel with an inline form"
        wide
      >
        <Newsletter />
      </Specimen>
    </SpecimenGrid>
  );
}

/* Wayfinding
   ========================================================================== */

function Wayfinding({ content }: SpecimenProps) {
  const to = useTo();
  const { posts, work, socials } = content;
  const post = posts[1];
  const types = postTypes(posts);
  const [filter, setFilter] = useState<string>();
  const [, second] = work;

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Breadcrumb"
        note="A post’s eyebrow: record code, then up"
      >
        <p className="mc-pageHeader__eyebrow">
          <span className="mc-pageHeader__episode">
            {recordCode(posts, post.url)}
          </span>
          <a href={to("/archive/")}>Records</a>
          {post.type && (
            <>
              <span aria-hidden="true">/</span>
              <a href={to(typePath(post.type))}>{post.type}</a>
            </>
          )}
        </p>
      </Specimen>
      <Specimen label="Breadcrumb, case study" note="Unit code, then up">
        <p className="mc-pageHeader__eyebrow">
          <span className="mc-pageHeader__episode">{unitCode(0)}</span>
          <a href={to("/portfolio/")}>Work</a>
          <span aria-hidden="true">/</span>
          Case study
        </p>
      </Specimen>

      <Specimen
        label="Class filter"
        note="Writing archive: switches for the record log, with counts"
        wide
      >
        <div className="mc-filter" role="group" aria-label="Filter by class">
          {[undefined, ...types].map((type) => (
            <button
              type="button"
              key={type ?? "all"}
              aria-pressed={filter === type}
              onClick={() => setFilter(type)}
            >
              {type ?? "All classes"}
              <span>
                {pad(
                  type
                    ? posts.filter((item) => item.type === type).length
                    : posts.length
                )}
              </span>
            </button>
          ))}
        </div>
      </Specimen>

      <Specimen
        label="End of record"
        note="A post’s sign-off and previous and next, with the Sync gauge, which fills as the page scrolls (a bar along the top below 1200px)"
        wide
      >
        {/* Contained, so the gauge (fixed to the screen on a post) sits in
            this box */}
        <div
          style={{
            position: "relative",
            contain: "layout",
            minHeight: 400,
            paddingRight: 40
          }}
        >
          <SyncBar />
          <footer
            className="mc-post__footer"
            style={{ marginTop: 0, marginLeft: 0 }}
          >
            <p>
              <span className="mc-kicker">End of record</span>
              Thanks for reading. Questions or thoughts?{" "}
              <a href={to("/contact/")}>Open a channel</a>.
            </p>
            {post.type && (
              <MoreLink
                href={to(typePath(post.type))}
              >{`More ${post.type.toLowerCase()}s`}</MoreLink>
            )}
          </footer>
          <PostNav nav={samplePostNav(posts)} />
        </div>
      </Specimen>

      {second && (
        <Specimen
          label="Previous and next, one side"
          note="Case studies, by unit; the first has only a next"
          wide
        >
          <PostNav
            nav={{ next: { url: second.url, text: second.name } }}
            noun="unit"
          />
        </Specimen>
      )}

      <Specimen
        label="Command deck"
        note="Phones: the menu opens into a stack of launch bays; About is engaged"
        wide
      >
        <div style={{ maxWidth: 420 }}>
          <span className="mc-hazard" aria-hidden="true" />
          <p className="mc-panel__head mc-deck__head">
            <span className="mc-panel__label">Command deck</span>
            <span className="mc-panel__code">
              {`${NAVIGATION.length} sectors`}
            </span>
            <Ticks />
          </p>
          <nav aria-label="Command deck">
            <ol className="mc-deck__list">
              {NAVIGATION.map((item, index) => {
                const current = item.path === "/about/";
                return (
                  <li
                    key={item.path}
                    style={{ "--mc-i": index } as CSSProperties}
                  >
                    <a
                      href={to(item.path)}
                      aria-current={current ? "page" : undefined}
                    >
                      <span className="mc-deck__num">0{index + 1}</span>
                      <span className="mc-deck__text">{item.text}</span>
                      {current && (
                        <span className="mc-deck__here">Engaged</span>
                      )}
                      <span className="mc-deck__sector" lang="ja">
                        {SECTORS[item.path]}
                      </span>
                      <Tri />
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
          <div className="mc-deck__foot">
            <span className="mc-deck__signal">
              <span className="mc-dot" aria-hidden="true" />
              All systems nominal
            </span>
            <ul className="mc-deck__links">
              {socials.map((social) => (
                <li key={social.url}>
                  <a href={social.url} rel={social.rel}>
                    {social.text}
                  </a>
                </li>
              ))}
              <li>
                <a href="/feed.xml">RSS</a>
              </li>
            </ul>
          </div>
        </div>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Prose
   ========================================================================== */

const Prose = ({ prose }: SpecimenProps) => (
  <HtmlContent className="mc-prose mc-post__body" html={prose} />
);

export const specimens: Specimens = {
  root: "mc",
  sections: {
    type: TypeScale,
    motifs: Motifs,
    imagery: Imagery,
    pageHeader: PageHeaders,
    actions: Actions,
    labels: Labels,
    surfaces: Surfaces,
    cards: Cards,
    lists: Lists,
    quotes: Quotes,
    forms: Forms,
    wayfinding: Wayfinding,
    prose: Prose
  }
};
