/**
 * The local time and weather readout
 * ==================================================
 * Every direction's Shell has a clock that opens a popover with the time
 * where Keenan is and the weather there. This wires the two the same way
 * everywhere, as `useSubmission()` wires a form: a direction spreads
 * `button` on its clock and `popover` on its readout, and draws the rest.
 */

import { useId, useState, type ToggleEventHandler } from "react";

import type { ProfileModel } from "../../lib/types";

import { useForecast, type ForecastReading } from "./weather";

/** Where the weather comes from, credited inside every readout */
export const WEATHER_CREDIT = {
  href: "https://open-meteo.com/",
  text: "Open-Meteo"
};

/**
 * What the popover is named, and how the clock is described, e.g. `Denver
 * local time and weather`. The clock's name is what it shows (the time),
 * so what a visitor sees is what a voice user says (WCAG 2.5.3).
 */
export const readoutLabel = (city: string) => `${city} local time and weather`;

export interface Readout extends ForecastReading {
  /**
   * Attributes for the header clock, the `<button>` that opens the popover.
   * Its name is its text, so it must show some (the time, say).
   */
  button: {
    type: "button";
    popoverTarget: string;
    "aria-description": string;
  };
  /**
   * Attributes for the popover: a dialog named like the clock, which starts
   * reading the forecast as it opens
   */
  popover: {
    id: string;
    popover: "auto";
    role: "dialog";
    "aria-label": string;
    onToggle: ToggleEventHandler<HTMLElement>;
  };
  /** Attributes for a Close button inside the popover, if the skin has one */
  close: {
    type: "button";
    popoverTarget: string;
    popoverTargetAction: "hide";
    "aria-label": string;
  };
  /** Whether the popover is open, e.g. to run a clock only while it is */
  open: boolean;
  /** The weather's source, to link inside the popover (`WEATHER_CREDIT`) */
  credit: typeof WEATHER_CREDIT;
}

/**
 * What a direction's clock and readout need: spread `button` on the clock
 * (the direction draws its face) and `popover` on the readout, link
 * `credit` inside it, and read the rest from `useForecast()` (`current`,
 * `label`, `tone`, `note`, …). The popover refreshes the forecast as it
 * opens, and `open` says whether it is, so a clock inside it can tick only
 * then (`useNow(open)`). Call it once, in the Shell, and hand the result to
 * both parts; a Shell with several clocks spreads the same `button` on each.
 */
export function useReadout(
  location: Pick<ProfileModel["location"], "city">
): Readout {
  const id = useId();
  const [open, setOpen] = useState(false);
  const reading = useForecast();
  const label = readoutLabel(location.city);

  return {
    ...reading,
    button: { type: "button", popoverTarget: id, "aria-description": label },
    popover: {
      id,
      popover: "auto",
      role: "dialog",
      "aria-label": label,
      onToggle: (event) => {
        const opening = event.newState === "open";
        setOpen(opening);
        if (opening) reading.refresh();
      }
    },
    close: {
      type: "button",
      popoverTarget: id,
      popoverTargetAction: "hide",
      "aria-label": "Close"
    },
    open,
    credit: WEATHER_CREDIT
  };
}
