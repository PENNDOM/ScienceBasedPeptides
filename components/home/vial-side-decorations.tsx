"use client";

/** Tilted vials in left / right gutters (matches featured products block). */
type SideDecorSlot = {
  top: string;
  lateral: string;
  w: number;
  h: number;
  rot: number;
};

const LEFT_DECOR_SLOTS: SideDecorSlot[] = [
  { top: "4%", lateral: "6%", w: 76, h: 108, rot: -18 },
  { top: "22%", lateral: "-2%", w: 68, h: 96, rot: 14 },
  { top: "38%", lateral: "18%", w: 72, h: 102, rot: -11 },
  { top: "56%", lateral: "4%", w: 64, h: 90, rot: 19 },
  { top: "72%", lateral: "22%", w: 70, h: 98, rot: -15 },
  { top: "88%", lateral: "8%", w: 60, h: 84, rot: 10 },
  { top: "12%", lateral: "28%", w: 56, h: 78, rot: 22 },
  { top: "48%", lateral: "-8%", w: 58, h: 82, rot: -20 },
];

const RIGHT_DECOR_SLOTS: SideDecorSlot[] = [
  { top: "6%", lateral: "8%", w: 74, h: 104, rot: 16 },
  { top: "24%", lateral: "-4%", w: 70, h: 100, rot: -13 },
  { top: "40%", lateral: "16%", w: 66, h: 94, rot: 18 },
  { top: "58%", lateral: "6%", w: 72, h: 102, rot: -12 },
  { top: "74%", lateral: "20%", w: 62, h: 88, rot: 11 },
  { top: "90%", lateral: "10%", w: 68, h: 96, rot: -17 },
  { top: "14%", lateral: "26%", w: 54, h: 76, rot: -21 },
  { top: "50%", lateral: "-6%", w: 60, h: 86, rot: 15 },
];

const FALLBACK_URLS = [
  "/products/bpc-157-clean-2.png",
  "/products/tb-500-clean-2.png",
  "/products/cjc-1295-ipamorelin-blend-clean-2.png",
  "/products/melanotan-i-clean-2.png",
] as const;

export function buildDecorUrlCycle(sourceUrls: string[]): string[] {
  const base = sourceUrls.filter(Boolean);
  const urls = base.length > 0 ? base : [...FALLBACK_URLS];
  return Array.from({ length: 24 }, (_, i) => urls[i % urls.length]!);
}

type VialSides = "both" | "left" | "right";

export function VialSideDecorations({
  imageUrls,
  sides = "both",
  /** When `true`, side strips fill the parent width (use a narrow column for right-only decor). */
  fillContainer = false,
}: {
  imageUrls: string[];
  sides?: VialSides;
  fillContainer?: boolean;
}) {
  const decorImageUrls = buildDecorUrlCycle(imageUrls);
  const showLeft = sides === "both" || sides === "left";
  const showRight = sides === "both" || sides === "right";

  const stripW = fillContainer
    ? "w-full max-w-none"
    : "w-[min(20%,7.25rem)] lg:w-[min(22%,9.5rem)]";

  return (
    <>
      {showLeft ? (
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-0 hidden select-none md:block ${stripW}`}
          aria-hidden
        >
          <div className="relative h-full w-full [mask-image:linear-gradient(to_right,black_50%,transparent)]">
            {LEFT_DECOR_SLOTS.map((slot, i) => (
              <div
                key={`decor-l-${i}`}
                className="absolute bg-contain bg-center bg-no-repeat opacity-[0.22]"
                style={{
                  backgroundImage: decorImageUrls[i] ? `url(${decorImageUrls[i]})` : undefined,
                  top: slot.top,
                  left: slot.lateral,
                  width: slot.w,
                  height: slot.h,
                  transform: `rotate(${slot.rot}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
      {showRight ? (
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-0 hidden select-none md:block ${stripW}`}
          aria-hidden
        >
          <div className="relative h-full w-full [mask-image:linear-gradient(to_left,black_55%,transparent)]">
            {RIGHT_DECOR_SLOTS.map((slot, i) => (
              <div
                key={`decor-r-${i}`}
                className="absolute bg-contain bg-center bg-no-repeat opacity-[0.22]"
                style={{
                  backgroundImage: decorImageUrls[i + LEFT_DECOR_SLOTS.length]
                    ? `url(${decorImageUrls[i + LEFT_DECOR_SLOTS.length]})`
                    : undefined,
                  top: slot.top,
                  right: slot.lateral,
                  width: slot.w,
                  height: slot.h,
                  transform: `rotate(${slot.rot}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
