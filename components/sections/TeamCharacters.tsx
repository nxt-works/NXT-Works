"use client";

import type { TeamCharacterId } from "@/site.config";

type CharacterSpec = {
  /** Shared geometric body silhouette path in 200×220 viewBox. */
  silhouette: string;
  /** Subtle Graphite architectural plane detail inside the body. */
  facet: string;
  /** Left & right eye centres (cx, cy). */
  eyes: [{ cx: number; cy: number }, { cx: number; cy: number }];
  /** Grounded transform-origin for subtle 1.5% idle breathing. */
  breathOrigin: string;
};

const CHARACTER_SPECS: Record<TeamCharacterId, CharacterSpec> = {
  designer: {
    // Chunky squircle
    silhouette:
      "M 76 34 H 124 A 34 34 0 0 1 158 68 V 126 A 34 34 0 0 1 124 160 H 76 A 34 34 0 0 1 42 126 V 68 A 34 34 0 0 1 76 34 Z",
    facet: "M 42 118 H 158 V 126 A 34 34 0 0 1 124 160 H 76 A 34 34 0 0 1 42 126 Z",
    eyes: [
      { cx: 80, cy: 88 },
      { cx: 120, cy: 88 },
    ],
    breathOrigin: "100px 160px",
  },
  frontend: {
    // Tall capsule
    silhouette:
      "M 100 22 A 48 48 0 0 1 148 70 V 118 A 48 48 0 0 1 100 166 A 48 48 0 0 1 52 118 V 70 A 48 48 0 0 1 100 22 Z",
    facet: "M 52 116 H 148 V 118 A 48 48 0 0 1 100 166 A 48 48 0 0 1 52 118 Z",
    eyes: [
      { cx: 82, cy: 82 },
      { cx: 118, cy: 82 },
    ],
    breathOrigin: "100px 166px",
  },
  automation: {
    // Wide architectural arch
    silhouette:
      "M 36 150 V 96 A 64 64 0 0 1 164 96 V 150 A 14 14 0 0 1 150 164 H 50 A 14 14 0 0 1 36 150 Z",
    facet: "M 36 128 H 164 V 150 A 14 14 0 0 1 150 164 H 50 A 14 14 0 0 1 36 150 Z",
    eyes: [
      { cx: 78, cy: 96 },
      { cx: 122, cy: 96 },
    ],
    breathOrigin: "100px 164px",
  },
  backend: {
    // Geometric circle
    silhouette:
      "M 100 30 A 58 58 0 1 1 100 146 A 58 58 0 1 1 100 30 Z",
    facet: "M 45 106 A 58 58 0 0 0 155 106 Z",
    eyes: [
      { cx: 80, cy: 84 },
      { cx: 120, cy: 84 },
    ],
    breathOrigin: "100px 146px",
  },
  "client-lead": {
    // Stepped Bauhaus block
    silhouette:
      "M 70 36 H 130 A 14 14 0 0 1 144 50 V 74 H 150 A 14 14 0 0 1 164 88 V 152 A 14 14 0 0 1 150 166 H 50 A 14 14 0 0 1 36 152 V 88 A 14 14 0 0 1 50 74 H 56 V 50 A 14 14 0 0 1 70 36 Z",
    facet: "M 36 134 H 164 V 152 A 14 14 0 0 1 150 166 H 50 A 14 14 0 0 1 36 152 Z",
    eyes: [
      { cx: 80, cy: 108 },
      { cx: 120, cy: 108 },
    ],
    breathOrigin: "100px 166px",
  },
};

function RoleObject({
  characterId,
  reducedActive = false,
}: {
  characterId: TeamCharacterId;
  reducedActive?: boolean;
}) {
  switch (characterId) {
    case "designer":
      // Small canvas card + chunky geometric pencil + ONE Volt drawn line (with thin Ink outline on Bone)
      return (
        <g data-char-prop="designer">
          {/* Canvas card */}
          <rect
            x="92"
            y="142"
            width="84"
            height="58"
            rx="11"
            fill="var(--color-bone)"
            stroke="var(--color-ink)"
            strokeWidth="2.5"
          />
          {/* Subtle architectural crop marks inside card */}
          <line x1="103" y1="154" x2="117" y2="154" stroke="var(--color-ink)" strokeWidth="2" strokeOpacity="0.28" strokeLinecap="round" />
          <line x1="103" y1="188" x2="141" y2="188" stroke="var(--color-ink)" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />

          {/* ONE Volt accent: drawn Volt stroke across the canvas card (thin Ink outline for contrast on Bone) */}
          <g data-sig="draw-line" style={{ transformOrigin: "104px 171px" }}>
            <rect
              x="104"
              y="165"
              width="58"
              height="12"
              rx="6"
              fill="var(--color-volt)"
              stroke="var(--color-ink)"
              strokeWidth="2.2"
            />
          </g>

          {/* Geometric chunky pencil (Ink barrel, Graphite cap, Bone nib) */}
          <g data-sig="pencil" transform="translate(0, 0)">
            <g transform="translate(154, 166) rotate(-32)">
              <rect x="0" y="-6.5" width="32" height="13" rx="3" fill="var(--color-ink)" />
              <rect x="25" y="-6.5" width="7" height="13" rx="2.5" fill="var(--color-graphite)" stroke="var(--color-bone)" strokeWidth="1.2" />
              <polygon points="0,-6.5 -12,0 0,6.5" fill="var(--color-bone)" stroke="var(--color-ink)" strokeWidth="2" strokeLinejoin="round" />
              <polygon points="-8,-2.2 -12,0 -8,2.2" fill="var(--color-ink)" />
            </g>
          </g>
        </g>
      );

    case "frontend":
      // Code brackets "</>" with ONE Volt blinking cursor between them
      return (
        <g data-char-prop="frontend">
          <rect
            x="34"
            y="148"
            width="132"
            height="50"
            rx="14"
            fill="var(--color-ink)"
            stroke="var(--color-bone)"
            strokeWidth="2.5"
          />
          <rect
            x="39"
            y="153"
            width="122"
            height="40"
            rx="10"
            fill="var(--color-graphite)"
          />

          {/* Left chevron "<" */}
          <g data-sig="bracket-left">
            <path
              d="M 76 162 L 60 173 L 76 184"
              fill="none"
              stroke="var(--color-bone)"
              strokeWidth="5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </g>

          {/* Slash "/" */}
          <g data-sig="bracket-slash">
            <line
              x1="93"
              y1="185"
              x2="105"
              y2="161"
              stroke="var(--color-bone)"
              strokeOpacity="0.65"
              strokeWidth="4"
              strokeLinecap="square"
            />
          </g>

          {/* ONE Volt accent: blinking vertical cursor bar */}
          <g data-sig="fe-cursor">
            <rect
              x="109"
              y="160"
              width="7"
              height="26"
              rx="1.5"
              fill="var(--color-volt)"
            />
          </g>

          {/* Right chevron ">" */}
          <g data-sig="bracket-right">
            <path
              d="M 124 162 L 140 173 L 124 184"
              fill="none"
              stroke="var(--color-bone)"
              strokeWidth="5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </g>
        </g>
      );

    case "automation":
      // Three small connected nodes + ONE Volt pulse & sequential node highlight
      return (
        <g data-char-prop="automation">
          {/* Connector track */}
          <line
            x1="46"
            y1="190"
            x2="154"
            y2="190"
            stroke="var(--color-ink)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Node 0 */}
          <g data-sig="auto-node-0">
            <circle cx="46" cy="190" r="13" fill="var(--color-ink)" />
            <circle cx="46" cy="190" r="6" fill="var(--color-bone)" />
            <circle data-sig="auto-lit-0" cx="46" cy="190" r="6.5" fill="var(--color-volt)" stroke="var(--color-ink)" strokeWidth="1.5" opacity="1" />
          </g>

          {/* Node 1 */}
          <g data-sig="auto-node-1">
            <circle cx="100" cy="190" r="13" fill="var(--color-ink)" />
            <circle cx="100" cy="190" r="6" fill="var(--color-bone)" />
            <circle data-sig="auto-lit-1" cx="100" cy="190" r="6.5" fill="var(--color-volt)" stroke="var(--color-ink)" strokeWidth="1.5" opacity={reducedActive ? 1 : 0} />
          </g>

          {/* Node 2 */}
          <g data-sig="auto-node-2">
            <circle cx="154" cy="190" r="13" fill="var(--color-ink)" />
            <circle cx="154" cy="190" r="6" fill="var(--color-bone)" />
            <circle data-sig="auto-lit-2" cx="154" cy="190" r="6.5" fill="var(--color-volt)" stroke="var(--color-ink)" strokeWidth="1.5" opacity={reducedActive ? 1 : 0} />
          </g>

          {/* Travelling Volt pulse (hidden at rest so only ONE Volt accent is visible at rest) */}
          <g data-sig="auto-pulse" opacity="0">
            <circle
              cx="46"
              cy="190"
              r="6"
              fill="var(--color-volt)"
              stroke="var(--color-ink)"
              strokeWidth="2"
            />
          </g>
        </g>
      );

    case "backend":
      // Stack of three chunky database discs, ONE Volt row accent
      return (
        <g data-char-prop="backend">
          {/* Disc 0 (top) */}
          <g data-sig="db-disc-0">
            <rect x="44" y="138" width="112" height="19" rx="9.5" fill="var(--color-ink)" stroke="var(--color-bone)" strokeWidth="2" />
            <rect x="56" y="145" width="38" height="5" rx="2.5" fill="var(--color-bone)" fillOpacity="0.65" />
            <circle cx="140" cy="147.5" r="3" fill="var(--color-bone)" fillOpacity="0.55" />
          </g>

          {/* Disc 1 (middle — carries the ONE Volt row accent) */}
          <g data-sig="db-disc-1">
            <rect x="44" y="160" width="112" height="19" rx="9.5" fill="var(--color-graphite)" stroke="var(--color-ink)" strokeWidth="2.2" />
            <g data-sig="db-volt-row">
              <rect x="56" y="166.5" width="52" height="6" rx="3" fill="var(--color-volt)" />
            </g>
            <circle cx="140" cy="169.5" r="3" fill="var(--color-bone)" fillOpacity="0.6" />
          </g>

          {/* Disc 2 (bottom) */}
          <g data-sig="db-disc-2">
            <rect x="44" y="182" width="112" height="19" rx="9.5" fill="var(--color-ink)" stroke="var(--color-bone)" strokeWidth="2" />
            <rect x="56" y="189" width="28" height="5" rx="2.5" fill="var(--color-bone)" fillOpacity="0.5" />
            <circle cx="140" cy="191.5" r="3" fill="var(--color-bone)" fillOpacity="0.45" />
          </g>
        </g>
      );

    case "client-lead":
      // Crisp geometric speech bubble at top-right shoulder + ONE Volt check badge (thin Ink outline on Bone)
      return (
        <g data-char-prop="client-lead" data-sig="lead-bubble" style={{ transformOrigin: "136px 66px" }}>
          <path
            d="M 132 16 H 174 A 12 12 0 0 1 186 28 V 52 A 12 12 0 0 1 174 64 H 142 L 128 74 V 64 H 132 A 12 12 0 0 1 120 52 V 28 A 12 12 0 0 1 132 16 Z"
            fill="var(--color-bone)"
            stroke="var(--color-ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Subtle chat lines at rest */}
          <g data-sig="lead-lines" opacity="0.32">
            <line x1="133" y1="35" x2="173" y2="35" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
            <line x1="133" y1="45" x2="158" y2="45" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* ONE Volt accent: crisp check badge with thin Ink outline so Volt stays sharp on Bone */}
          <g data-sig="lead-check" style={{ transformOrigin: "153px 40px" }}>
            <circle
              cx="153"
              cy="40"
              r="14"
              fill="var(--color-volt)"
              stroke="var(--color-ink)"
              strokeWidth="2.2"
            />
            <path
              d="M 146 40.5 L 151 45.5 L 160.5 35"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      );
  }
}

export type TeamCharacterProps = {
  characterId: TeamCharacterId;
  photo?: string;
  clipId: string;
  /** Simple still Volt highlight when triggered under prefers-reduced-motion. */
  reducedActive?: boolean;
};

/**
 * Shared geometric character builder.
 * - Renders an original chunky Bauhaus character in our 4-token palette (Ink, Bone, Graphite, one Volt accent).
 * - If `photo` is provided, renders the photo cleanly clipped inside the exact same body silhouette.
 */
export default function TeamCharacter({
  characterId,
  photo,
  clipId,
  reducedActive = false,
}: TeamCharacterProps) {
  const spec = CHARACTER_SPECS[characterId];
  const hasPhoto = Boolean(photo && photo.trim().length > 0);

  return (
    <svg
      viewBox="0 0 200 220"
      aria-hidden="true"
      focusable="false"
      className="block h-auto w-full select-none"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={spec.silhouette} />
        </clipPath>
      </defs>

      {/* Main body group (targets gentle 1.5% idle breathing around grounded base) */}
      <g data-char-body="" style={{ transformOrigin: spec.breathOrigin }}>
        {hasPhoto ? (
          <>
            <image
              href={photo}
              x="28"
              y="18"
              width="144"
              height="156"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />
            <path
              d={spec.silhouette}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="2.5"
            />
          </>
        ) : (
          <>
            {/* Chunky geometric body silhouette */}
            <path d={spec.silhouette} fill="var(--color-ink)" />
            {/* Subtle Graphite architectural lower bevel */}
            <path d={spec.facet} fill="var(--color-graphite)" />

            {/* Two expressive round Bone eyes with Ink pupils */}
            {spec.eyes.map((eye, idx) => (
              <g
                key={idx}
                data-char-eye={idx === 0 ? "left" : "right"}
                style={{ transformOrigin: `${eye.cx}px ${eye.cy}px` }}
              >
                <circle
                  cx={eye.cx}
                  cy={eye.cy}
                  r="13"
                  fill="var(--color-bone)"
                  stroke="var(--color-ink)"
                  strokeWidth="2"
                />
                <g data-char-pupil={idx === 0 ? "left" : "right"}>
                  <circle cx={eye.cx} cy={eye.cy} r="5.5" fill="var(--color-ink)" />
                </g>
              </g>
            ))}
          </>
        )}

        {/* Role-specific signature object */}
        <RoleObject characterId={characterId} reducedActive={reducedActive} />
      </g>
    </svg>
  );
}
