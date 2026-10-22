import { useId, useState, type CSSProperties } from "react";

import type { ProfileModel } from "../../../lib/types";
import {
  celsius,
  compass,
  coordinates,
  cx,
  degrees,
  localFormat,
  clockParts,
  LocalTime,
  useForecast,
  useNow,
  twelveHour,
  zoneName,
  type Condition
} from "../../site";

import { Icon } from "./parts";

/*
 * Denver: local time and weather
 * ==================================================
 * The masthead's dateline opens a popover with the time in Denver and live
 * weather there, set as a newspaper's weather box: the clock in the light
 * serif, readings in columns between hairlines, and the sky as a dithered
 * plate, like the footer's edge.
 */

type Location = ProfileModel["location"];

const DATE: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric"
};

/** The plate's size, in CSS pixels, so each grain of the dither is one */
const WIDTH = 380;
const HEIGHT = 120;

/** A cloud's outline, its flat base at the origin */
const CLOUD =
  "M0 0h96a19 19 0 0 0 1-38a28 28 0 0 0-53-11a22 22 0 0 0-36 17A12 12 0 0 0 0 0z";

/** Falling marks (rain, snow) under a cloud, staggered */
const DROPS = [10, 26, 42, 58, 74, 90].map((x, index) => ({ x, index }));

/**
 * The sky as a dithered plate: drawn in grays on white, then screened to
 * ink and paper through noise, so a gray becomes a scatter of dots
 */
export function SkyPlate({
  condition,
  night
}: {
  condition?: Condition;
  night: boolean;
}) {
  const id = useId();
  const [screen, glow, shade, haze] = ["screen", "glow", "shade", "haze"].map(
    (name) => `${id}${name}`
  );
  const falling =
    condition === "rain" || condition === "storm" || condition === "snow";
  const cloudy = condition === "cloudy" || falling;
  const overcast = falling || condition === "fog";
  // Passing clouds sit low, so the sun or moon shows over them; rain and
  // snow clouds sit high, over what's falling
  const [far, near] =
    condition === "cloudy"
      ? ["translate(186 92) scale(0.7)", "translate(232 108)"]
      : ["translate(192 56) scale(0.75)", "translate(232 70)"];

  return (
    <svg
      className="mg-den__plate"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
      data-condition={condition ?? "unknown"}
    >
      <defs>
        {/* Gray plus noise, cut at the middle: ink below, paper above */}
        <filter
          id={screen}
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="1"
            seed="11"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"
            result="gray"
          />
          {/* Spread out to about even odds, so a gray's share of ink is
              about its darkness */}
          <feComponentTransfer in="gray" result="grain">
            <feFuncR type="linear" slope="5" intercept="-2" />
            <feFuncG type="linear" slope="5" intercept="-2" />
            <feFuncB type="linear" slope="5" intercept="-2" />
          </feComponentTransfer>
          <feComposite
            in="SourceGraphic"
            in2="grain"
            operator="arithmetic"
            k2="1"
            k3="0.98"
            k4="-0.49"
            result="mixed"
          />
          <feComponentTransfer in="mixed" result="cut">
            <feFuncR type="discrete" tableValues="0 1" />
            <feFuncG type="discrete" tableValues="0 1" />
            <feFuncB type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          {/* Ink where it's dark; the paper shows through elsewhere */}
          <feColorMatrix in="cut" type="luminanceToAlpha" result="light" />
          <feComponentTransfer in="light" result="dark">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feFlood className="mg-den__ink" />
          <feComposite in2="dark" operator="in" />
        </filter>

        {/* By day the light darkens the paper; by night it lifts the ink */}
        <radialGradient id={glow}>
          <stop offset="0.3" stopColor={night ? "#c4c4c4" : "#999"} />
          <stop
            offset="1"
            stopColor={night ? "#c4c4c4" : "#999"}
            stopOpacity="0"
          />
        </radialGradient>
        <linearGradient id={shade} x2="0" y2="1">
          <stop offset="0.35" stopColor="#fff" />
          <stop offset="1" stopColor="#9a9a9a" />
        </linearGradient>
        {/* The sky darkens toward the light, away from the caption */}
        <linearGradient id={haze} x1="0.2" y1="1" x2="0.9" y2="0">
          <stop offset="0.25" stopColor="#fff" />
          <stop
            offset="1"
            stopColor={night ? "#5a5a5a" : overcast ? "#b0b0b0" : "#e6e6e6"}
          />
        </linearGradient>
      </defs>

      <g filter={`url(#${screen})`}>
        <rect width={WIDTH} height={HEIGHT} fill={`url(#${haze})`} />

        {!condition && (
          <g className="mg-den__seek">
            <circle cx="304" cy="56" r="34" fill={`url(#${glow})`} />
            <circle cx="304" cy="56" r="13" fill="#fff" stroke="#000" />
          </g>
        )}

        {(condition === "clear" || condition === "cloudy") &&
          (night ? (
            <g className="mg-den__moon">
              <circle cx="304" cy="48" r="48" fill={`url(#${glow})`} />
              <path
                d="M304 26a22 22 0 1 0 18 34a17 17 0 0 1-18-34z"
                fill="#fff"
              />
              <circle
                className="mg-den__star"
                cx="232"
                cy="24"
                r="1.5"
                fill="#fff"
              />
              <circle
                className="mg-den__star"
                cx="262"
                cy="92"
                r="1.5"
                fill="#fff"
              />
              <circle
                className="mg-den__star"
                cx="354"
                cy="98"
                r="1.5"
                fill="#fff"
              />
            </g>
          ) : (
            <g className="mg-den__sun">
              <circle cx="304" cy="48" r="48" fill={`url(#${glow})`} />
              <circle cx="304" cy="48" r="17" fill="#000" />
            </g>
          ))}

        {cloudy && (
          <g className="mg-den__clouds">
            <path
              className="mg-den__cloud mg-den__cloud--far"
              d={CLOUD}
              transform={far}
              fill={`url(#${shade})`}
              stroke="#000"
            />
            <path
              className="mg-den__cloud"
              d={CLOUD}
              transform={near}
              fill={`url(#${shade})`}
              stroke="#000"
            />
          </g>
        )}

        {condition === "fog" && (
          <g className="mg-den__fog">
            {[40, 58, 76, 94].map((y, index) => (
              <rect
                key={y}
                x={index % 2 ? 186 : 212}
                y={y}
                width={index % 2 ? 170 : 150}
                height="7"
                fill="#8a8a8a"
                style={{ "--mg-i": index } as CSSProperties}
              />
            ))}
          </g>
        )}

        {falling && (
          <g
            className={cx(
              "mg-den__fall",
              condition === "snow" && "mg-den__fall--snow"
            )}
            transform="translate(234 76)"
          >
            {DROPS.map(({ x, index }) =>
              condition === "snow" ? (
                <circle
                  key={x}
                  cx={x}
                  cy="10"
                  r="2.5"
                  fill="#fff"
                  stroke="#000"
                  style={{ "--mg-i": index } as CSSProperties}
                />
              ) : (
                <path
                  key={x}
                  d={`M${x} 4l-6 14`}
                  stroke="#000"
                  strokeWidth="1.5"
                  style={{ "--mg-i": index } as CSSProperties}
                />
              )
            )}
          </g>
        )}

        {condition === "storm" && (
          <path
            className="mg-den__bolt"
            d="M286 74l-12 20h11l-7 18l20-25h-11l7-13z"
          />
        )}
      </g>
    </svg>
  );
}

/** The masthead's dateline: a button that opens the weather box */
export function DenverClock({
  box,
  location,
  className
}: {
  /** The weather box popover's id */
  box: string;
  location: Location;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      popoverTarget={box}
      aria-label={`${location.city} local time and weather`}
    >
      <Icon name="pin" />
      {location.short} · <LocalTime placeholder="--:--" />
    </button>
  );
}

/** The popover: Denver's time, sky, and weather readings */
export function DenverBox({
  id,
  location
}: {
  id: string;
  location: Location;
}) {
  const [open, setOpen] = useState(false);
  const now = useNow(open);
  const {
    forecast,
    current,
    label,
    condition,
    night,
    stale,
    status,
    tone,
    note,
    refresh
  } = useForecast();

  const { time, period } = clockParts(now);

  return (
    <div
      id={id}
      popover="auto"
      className="mg-den"
      role="dialog"
      aria-label={`${location.city} local time and weather`}
      onToggle={(event) => {
        const opening = event.newState === "open";
        setOpen(opening);
        if (opening) refresh();
      }}
    >
      <header className="mg-den__head">
        <p className="mg-label">
          <Icon name="pin" />
          The weather in {location.short}
        </p>
        <button
          type="button"
          className="mg-den__close"
          popoverTarget={id}
          popoverTargetAction="hide"
          aria-label="Close"
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </header>

      <div className="mg-den__time">
        <p className="mg-den__kicker">
          <span>Local time</span>
          {now && (
            <span>{`${zoneName(now, "short")} · ${zoneName(now, "offset")}`}</span>
          )}
        </p>
        <p className="mg-den__clock">
          <time>{time || "--:--:--"}</time>
          {period && <span>{period}</span>}
        </p>
        <p className="mg-den__date">
          {now ? localFormat(DATE).format(now) : " "}
        </p>
      </div>

      <figure className="mg-den__sky">
        <SkyPlate condition={condition} night={night} />
        <figcaption>
          {current ? (
            <>
              <p className="mg-den__temp">
                {degrees(current.temperature_2m)}
                <span>F</span>
              </p>
              <p className="mg-den__condition">
                {label}
                {night && condition === "clear" && " · Night"}
                {` · ${celsius(current.temperature_2m)}°C`}
              </p>
            </>
          ) : (
            <p className="mg-den__message">
              {status === "error" ? (
                <>
                  Weather unavailable
                  <button type="button" onClick={refresh}>
                    Retry
                  </button>
                </>
              ) : (
                "Reading the sky…"
              )}
            </p>
          )}
        </figcaption>
      </figure>

      {current && forecast && (
        <>
          <dl className="mg-den__facts">
            <div>
              <dt>Feels like</dt>
              <dd>{degrees(current.apparent_temperature)}</dd>
            </div>
            <div>
              <dt>High</dt>
              <dd>{degrees(forecast.daily.temperature_2m_max[0])}</dd>
            </div>
            <div>
              <dt>Low</dt>
              <dd>{degrees(forecast.daily.temperature_2m_min[0])}</dd>
            </div>
            <div>
              <dt>Humidity</dt>
              <dd>{`${current.relative_humidity_2m}%`}</dd>
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
                {location.elevationFeet.toLocaleString("en-US")}
                <small> ft</small>
              </dd>
            </div>
          </dl>
          <p className="mg-den__sun">
            <span>{`Sunrise ${twelveHour(forecast.daily.sunrise[0])}`}</span>
            <span aria-hidden="true">–</span>
            <span>{`Sunset ${twelveHour(forecast.daily.sunset[0])}`}</span>
          </p>
        </>
      )}

      <p className="mg-den__status" data-tone={tone}>
        <span className="mg-den__dot" aria-hidden="true" />
        {note}
        {stale && (
          <button type="button" onClick={refresh}>
            Retry
          </button>
        )}
      </p>
      <p className="mg-den__credit">
        Weather from <a href="https://open-meteo.com/">Open-Meteo</a> ·{" "}
        {coordinates(location)}
      </p>
    </div>
  );
}
