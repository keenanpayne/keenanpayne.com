import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties
} from "react";

/**
 * Lazy loading
 * ==================================================
 * Port of the old `js/app.js`: media marked with `data-lazy` only receives
 * its real source once it scrolls into view.
 * Ref: https://web.dev/lazy-loading-video/
 */
function useInView<T extends Element>(enabled = true) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || inView || !element) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [enabled, inView]);

  return [ref, inView] as const;
}

export function LazyVideo({
  src,
  autoplay
}: {
  src: string;
  autoplay?: boolean;
}) {
  const [ref, inView] = useInView<HTMLVideoElement>();

  useEffect(() => {
    if (inView) ref.current?.load();
  }, [inView, ref]);

  return (
    <video
      ref={ref}
      muted
      controls
      data-lazy=""
      autoPlay={autoplay}
      loop={autoplay}
      playsInline={autoplay}
    >
      <source data-src={src} src={inView ? src : undefined} />
    </video>
  );
}

export function LazyImage({
  src,
  ...props
}: { src: string } & Omit<ComponentProps<"img">, "src">) {
  const [ref, inView] = useInView<HTMLImageElement>();

  return (
    <img
      ref={ref}
      data-lazy=""
      data-src={src}
      src={inView ? src : undefined}
      {...props}
    />
  );
}

/** Portfolio image tile whose image is a CSS background */
export function LazyImageTile({
  href,
  title,
  image,
  eager
}: {
  href?: string;
  title: string;
  image: string;
  eager?: boolean;
}) {
  const [ref, inView] = useInView<HTMLAnchorElement>(!eager);
  const style =
    eager || inView
      ? ({ "--background": `url(${image})` } as CSSProperties)
      : undefined;

  return (
    <a
      ref={ref}
      href={href}
      title={title}
      className="portfolioGrid-imageTile"
      data-src={image}
      data-lazy={eager ? undefined : ""}
      style={style}
      target="_blank"
      rel="noopener"
    ></a>
  );
}
