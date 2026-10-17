import type { DribbbleSection } from "../../lib/types";

export function Dribbble({ section }: { section: DribbbleSection }) {
  return (
    <div
      className={section.modifier ? `dribbble ${section.modifier}` : "dribbble"}
    >
      <h2 className="dribbble-headline _text-h1">Dribbble Shots</h2>

      <div className="dribbble-items">
        {section.items.map((item, index) =>
          item.src ? (
            <div className="dribbble-item" key={index}>
              {item.type === "video" ? (
                <video controls src={item.src}></video>
              ) : (
                <img src={item.src} alt={item.alt} />
              )}
            </div>
          ) : null
        )}
      </div>

      <p className="dribbble-text _text-small">
        Dribbble shots courtesy of
        <br />
        <a href="https://visualsbymarcus.com" target="_blank" rel="noopener">
          Visuals by Marcus
        </a>
      </p>
    </div>
  );
}
