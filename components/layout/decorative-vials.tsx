"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const SOURCES = [
  "/decor/vials/vial-01.png",
  "/decor/vials/vial-02.png",
  "/decor/vials/vial-03.png",
  "/decor/vials/vial-04.png",
  "/decor/vials/vial-05.png",
  "/decor/vials/vial-06.png",
  "/decor/vials/vial-07.png",
  "/decor/vials/vial-08.png",
  "/decor/vials/vial-09.png",
  "/decor/vials/vial-10.png",
  "/decor/vials/vial-11.png",
];

type Breakpoint = "sm" | "md" | "lg" | "xl";
type TemplateKey =
  | "home"
  | "shop"
  | "product"
  | "researchProduct"
  | "contact"
  | "affiliate"
  | "auth"
  | "checkout"
  | "legal"
  | "generic";

type VialSpec = {
  srcIndex: number;
  side: "left" | "right";
  y: number; // percentage from top
  x: number; // percentage inset from side
  size: number; // px
  rotate: number; // deg, non-zero
  opacity: number;
  breakpoint: Breakpoint;
  blur?: boolean;
};

const SHOW_AT: Record<Breakpoint, string> = {
  sm: "hidden sm:block",
  md: "hidden md:block",
  lg: "hidden lg:block",
  xl: "hidden xl:block",
};

const TEMPLATE_MAP: Record<TemplateKey, VialSpec[]> = {
  home: [
    { srcIndex: 0, side: "left", y: 9, x: 8, size: 168, rotate: -16, opacity: 0.15, breakpoint: "md", blur: true },
    { srcIndex: 1, side: "right", y: 12, x: 9, size: 162, rotate: 14, opacity: 0.14, breakpoint: "md", blur: true },
    { srcIndex: 2, side: "left", y: 33, x: 7, size: 146, rotate: -12, opacity: 0.13, breakpoint: "lg" },
    { srcIndex: 3, side: "right", y: 37, x: 8, size: 142, rotate: 13, opacity: 0.13, breakpoint: "lg" },
    { srcIndex: 4, side: "left", y: 61, x: 6, size: 138, rotate: -18, opacity: 0.12, breakpoint: "lg" },
    { srcIndex: 5, side: "right", y: 66, x: 7, size: 136, rotate: 17, opacity: 0.12, breakpoint: "lg" },
    { srcIndex: 6, side: "left", y: 86, x: 10, size: 106, rotate: -10, opacity: 0.1, breakpoint: "xl" },
    { srcIndex: 7, side: "right", y: 84, x: 10, size: 104, rotate: 12, opacity: 0.1, breakpoint: "xl" },
  ],
  shop: [
    { srcIndex: 8, side: "left", y: 11, x: 6, size: 154, rotate: -14, opacity: 0.13, breakpoint: "md", blur: true },
    { srcIndex: 9, side: "right", y: 16, x: 6, size: 148, rotate: 12, opacity: 0.13, breakpoint: "md", blur: true },
    { srcIndex: 10, side: "left", y: 39, x: 5, size: 136, rotate: -11, opacity: 0.12, breakpoint: "lg" },
    { srcIndex: 0, side: "right", y: 46, x: 5, size: 132, rotate: 13, opacity: 0.12, breakpoint: "lg" },
    { srcIndex: 1, side: "left", y: 70, x: 6, size: 130, rotate: -16, opacity: 0.11, breakpoint: "lg" },
    { srcIndex: 2, side: "right", y: 76, x: 6, size: 126, rotate: 15, opacity: 0.11, breakpoint: "lg" },
    { srcIndex: 3, side: "left", y: 90, x: 11, size: 98, rotate: -9, opacity: 0.09, breakpoint: "xl" },
    { srcIndex: 4, side: "right", y: 88, x: 11, size: 98, rotate: 11, opacity: 0.09, breakpoint: "xl" },
  ],
  product: [
    { srcIndex: 5, side: "left", y: 16, x: 7, size: 140, rotate: -12, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 6, side: "right", y: 23, x: 8, size: 134, rotate: 13, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 7, side: "left", y: 58, x: 7, size: 120, rotate: -15, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 8, side: "right", y: 68, x: 8, size: 118, rotate: 16, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 9, side: "left", y: 88, x: 12, size: 92, rotate: -10, opacity: 0.08, breakpoint: "xl" },
    { srcIndex: 10, side: "right", y: 86, x: 12, size: 92, rotate: 12, opacity: 0.08, breakpoint: "xl" },
  ],
  researchProduct: [
    { srcIndex: 0, side: "left", y: 14, x: 8, size: 138, rotate: -13, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 1, side: "right", y: 20, x: 8, size: 132, rotate: 14, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 2, side: "left", y: 56, x: 7, size: 122, rotate: -16, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 3, side: "right", y: 66, x: 8, size: 118, rotate: 15, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 4, side: "left", y: 90, x: 12, size: 92, rotate: -10, opacity: 0.08, breakpoint: "xl" },
    { srcIndex: 5, side: "right", y: 88, x: 12, size: 92, rotate: 12, opacity: 0.08, breakpoint: "xl" },
  ],
  contact: [
    { srcIndex: 6, side: "left", y: 13, x: 8, size: 132, rotate: -14, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 7, side: "right", y: 18, x: 9, size: 128, rotate: 13, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 8, side: "left", y: 58, x: 7, size: 114, rotate: -17, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 9, side: "right", y: 72, x: 7, size: 112, rotate: 16, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 10, side: "left", y: 88, x: 12, size: 90, rotate: -11, opacity: 0.08, breakpoint: "xl" },
  ],
  affiliate: [
    { srcIndex: 1, side: "left", y: 10, x: 7, size: 148, rotate: -15, opacity: 0.12, breakpoint: "md", blur: true },
    { srcIndex: 2, side: "right", y: 15, x: 8, size: 142, rotate: 14, opacity: 0.12, breakpoint: "md", blur: true },
    { srcIndex: 3, side: "left", y: 40, x: 6, size: 128, rotate: -12, opacity: 0.11, breakpoint: "lg" },
    { srcIndex: 4, side: "right", y: 48, x: 7, size: 124, rotate: 15, opacity: 0.11, breakpoint: "lg" },
    { srcIndex: 5, side: "left", y: 74, x: 6, size: 120, rotate: -18, opacity: 0.1, breakpoint: "lg" },
    { srcIndex: 6, side: "right", y: 80, x: 7, size: 118, rotate: 18, opacity: 0.1, breakpoint: "lg" },
  ],
  auth: [
    { srcIndex: 7, side: "left", y: 18, x: 8, size: 126, rotate: -14, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 8, side: "right", y: 22, x: 8, size: 124, rotate: 13, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 9, side: "left", y: 72, x: 7, size: 112, rotate: -16, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 10, side: "right", y: 76, x: 7, size: 110, rotate: 15, opacity: 0.09, breakpoint: "lg" },
  ],
  checkout: [
    { srcIndex: 0, side: "left", y: 14, x: 6, size: 132, rotate: -12, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 1, side: "right", y: 18, x: 6, size: 130, rotate: 11, opacity: 0.1, breakpoint: "md", blur: true },
    { srcIndex: 2, side: "left", y: 54, x: 6, size: 118, rotate: -15, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 3, side: "right", y: 62, x: 6, size: 116, rotate: 14, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 4, side: "left", y: 86, x: 11, size: 92, rotate: -10, opacity: 0.08, breakpoint: "xl" },
    { srcIndex: 5, side: "right", y: 84, x: 11, size: 92, rotate: 12, opacity: 0.08, breakpoint: "xl" },
  ],
  legal: [
    { srcIndex: 6, side: "left", y: 12, x: 8, size: 118, rotate: -13, opacity: 0.09, breakpoint: "md", blur: true },
    { srcIndex: 7, side: "right", y: 16, x: 8, size: 114, rotate: 12, opacity: 0.09, breakpoint: "md", blur: true },
    { srcIndex: 8, side: "left", y: 70, x: 8, size: 106, rotate: -15, opacity: 0.08, breakpoint: "lg" },
    { srcIndex: 9, side: "right", y: 76, x: 8, size: 102, rotate: 14, opacity: 0.08, breakpoint: "lg" },
  ],
  generic: [
    { srcIndex: 10, side: "left", y: 12, x: 7, size: 136, rotate: -14, opacity: 0.11, breakpoint: "md", blur: true },
    { srcIndex: 0, side: "right", y: 16, x: 7, size: 132, rotate: 13, opacity: 0.11, breakpoint: "md", blur: true },
    { srcIndex: 1, side: "left", y: 45, x: 6, size: 124, rotate: -12, opacity: 0.1, breakpoint: "lg" },
    { srcIndex: 2, side: "right", y: 54, x: 6, size: 120, rotate: 14, opacity: 0.1, breakpoint: "lg" },
    { srcIndex: 3, side: "left", y: 80, x: 7, size: 112, rotate: -17, opacity: 0.09, breakpoint: "lg" },
    { srcIndex: 4, side: "right", y: 86, x: 7, size: 108, rotate: 16, opacity: 0.09, breakpoint: "lg" },
  ],
};

function hashPath(path: string): number {
  let hash = 0;
  for (let i = 0; i < path.length; i += 1) {
    hash = (hash << 5) - hash + path.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededValue(seed: number, index: number, min: number, max: number) {
  const x = Math.sin(seed * (index + 1) * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return min + frac * (max - min);
}

function enforceTilt(value: number) {
  const minTilt = 9;
  if (Math.abs(value) >= minTilt) return value;
  return value < 0 ? -minTilt : minTilt;
}

function getTemplate(pathname: string): TemplateKey {
  if (pathname.startsWith("/shop") || pathname.startsWith("/research")) return "shop";
  // Reuse the same working visual baseline used on Shop/Research across all public routes.
  return "shop";
}

export function DecorativeVials() {
  const pathname = usePathname();
  const seed = hashPath(pathname || "/");
  const template = getTemplate(pathname || "/");
  const placements = useMemo(() => {
    const base = TEMPLATE_MAP[template];
    return base
      .map((spec, index) => {
        const y = Math.max(10, Math.min(88, spec.y + seededValue(seed, index + 5, -2.2, 2.2)));
        // Keep decorations in outer background gutters only.
        const x = Math.max(4, Math.min(12, spec.x + seededValue(seed, index + 11, -1.8, 1.8)));
        const size = Math.round(Math.max(82, spec.size + seededValue(seed, index + 17, -9, 9)));
        const rawRotate = spec.rotate + seededValue(seed, index + 23, -2.6, 2.6);
        const rotate = enforceTilt(rawRotate);
        // Subtle, premium range to avoid content competition.
        const opacity = Math.max(0.07, Math.min(0.13, spec.opacity + seededValue(seed, index + 29, -0.018, 0.018)));
        const routeShift = seed % SOURCES.length;
        const src = SOURCES[(spec.srcIndex + routeShift + index * 2) % SOURCES.length];
        // Route-level deterministic skip to avoid repeated silhouettes page-to-page.
        const show = ((seed + index * 19) % 11) > 1;
        if (!show) return null;
        return {
          src,
          className: `absolute ${SHOW_AT[spec.breakpoint]} ${spec.blur ? "blur-[1.5px]" : ""}`,
          style: {
            top: `${y}%`,
            [spec.side]: `${x}%`,
            width: `${size}px`,
            height: `${size}px`,
            transform: `translateY(-50%) rotate(${rotate.toFixed(1)}deg)`,
            opacity,
          } as Record<string, string | number>,
        };
      })
      .filter(Boolean) as Array<{
      src: string;
      className: string;
      style: Record<string, string | number>;
    }>;
  }, [seed, template]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[30] overflow-hidden">
      {placements.map((vial, index) => (
        <div key={`${vial.src}-${index}`} className={vial.className} style={vial.style}>
          <Image
            src={vial.src}
            alt=""
            fill
            className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
            sizes="200px"
            priority={index < 2}
          />
        </div>
      ))}
    </div>
  );
}

