"use client";

import type { TeamCharacterId } from "@/site.config";

type BodyTone = "ink" | "graphite" | "bone";
type EyeVariant = "round" | "slit" | "equal-flat" | "large-close-inverted" | "upward-smile";

type CharacterSpec = {
  /** Shared geometric body silhouette path in 200×220 viewBox. */
  silhouette: string;
  /** Optional subtle inner architectural detail (Graphite bevel on Ink, thin Bone inset edge on Graphite). */
  innerDetail?: string;
  bodyTone: BodyTone;
  eyeVariant: EyeVariant;
  /** Left & right eye centres (cx, cy) and radius. */
  eyes: [{ cx: number; cy: number }, { cx: number; cy: number }];
  eyeRadius: number;
  /** Grounded transform-origin for subtle 1.5% idle breathing. */
  breathOrigin: string;
};

const CHARACTER_SPECS: Record<TeamCharacterId, CharacterSpec> = {
  designer: {
    // Chunky squircle — Ink body with subtle Graphite lower plane
    silhouette:
      "M 76 34 H 124 A 34 34 0 0 1 158 68 V 126 A 34 34 0 0 1 124 160 H 76 A 34 34 0 0 1 42 126 V 68 A 34 34 0 0 1 76 34 Z",
    innerDetail:
      "M 42 118 H 158 V 126 A 34 34 0 0 1 124 160 H 76 A 34 34 0 0 1 42 126 Z",
    bodyTone: "ink",
    eyeVariant: "round",
    eyes: [
      { cx: 80, cy: 88 },
      { cx: 120, cy: 88 },
    ],
    eyeRadius: 12.5,
    breathOrigin: "100px 160px",
  },
  frontend: {
    // Tall capsule — Graphite body with thin Bone inset edge line
    silhouette:
      "M 100 22 A 48 48 0 0 1 148 70 V 118 A 48 48 0 0 1 100 166 A 48 48 0 0 1 52 118 V 70 A 48 48 0 0 1 100 22 Z",
    innerDetail:
      "M 100 27.5 A 42.5 42.5 0 0 1 142.5 70 V 118 A 42.5 42.5 0 0 1 100 160.5 A 42.5 42.5 0 0 1 57.5 118 V 70 A 42.5 42.5 0 0 1 100 27.5 Z",
    bodyTone: "graphite",
    eyeVariant: "slit",
    eyes: [
      { cx: 76, cy: 82 },
      { cx: 124, cy: 82 },
    ],
    eyeRadius: 12,
    breathOrigin: "100px 166px",
  },
  automation: {
    // Wide architectural arch — Ink body with subtle Graphite lower band
    silhouette:
      "M 36 150 V 96 A 64 64 0 0 1 164 96 V 150 A 14 14 0 0 1 150 164 H 50 A 14 14 0 0 1 36 150 Z",
    innerDetail:
      "M 36 130 H 164 V 150 A 14 14 0 0 1 150 164 H 50 A 14 14 0 0 1 36 150 Z",
    bodyTone: "ink",
    eyeVariant: "equal-flat",
    eyes: [
      { cx: 78, cy: 90 },
      { cx: 122, cy: 90 },
    ],
    eyeRadius: 11.5,
    breathOrigin: "100px 164px",
  },
  backend: {
    // Geometric circle — Bone body with crisp 2px Ink outline + inverted Ink eyes with Bone highlights
    silhouette:
      "M 100 30 A 58 58 0 1 1 100 146 A 58 58 0 1 1 100 30 Z",
    bodyTone: "bone",
    eyeVariant: "large-close-inverted",
    eyes: [
      { cx: 83, cy: 84 },
      { cx: 117, cy: 84 },
    ],
    eyeRadius: 14.5,
    breathOrigin: "100px 146px",
  },
  "client-lead": {
    // Single continuous stepped Bauhaus block — Graphite body with thin Bone inset edge line
    silhouette:
      "M 58 34 H 98 A 16 16 0 0 1 114 50 V 56 A 12 12 0 0 0 126 68 H 142 A 16 16 0 0 1 158 84 V 148 A 16 16 0 0 1 142 164 H 58 A 16 16 0 0 1 42 148 V 50 A 16 16 0 0 1 58 34 Z",
    innerDetail:
      "M 58 39.5 H 98 A 10.5 10.5 0 0 1 108.5 50 V 56 A 17.5 17.5 0 0 0 126 73.5 H 142 A 10.5 10.5 0 0 1 152.5 84 V 148 A 10.5 10.5 0 0 1 142 158.5 H 58 A 10.5 10.5 0 0 1 47.5 148 V 50 A 10.5 10.5 0 0 1 58 39.5 Z",
    bodyTone: "graphite",
    eyeVariant: "upward-smile",
    eyes: [
      { cx: 80, cy: 96 },
      { cx: 120, cy: 96 },
    ],
    eyeRadius: 12,
    breathOrigin: "100px 164px",
  },
};

function CharacterBody({ spec }: { spec: CharacterSpec }) {
  if (spec.bodyTone === "bone") {
    return (
      <path
        d={spec.silhouette}
        fill="var(--color-bone)"
        stroke="var(--color-ink)"
        strokeWidth="2.2"
      />
    );
  }

  if (spec.bodyTone === "graphite") {
    return (
      <>
        <path
          d={spec.silhouette}
          fill="var(--color-graphite)"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
        />
        {spec.innerDetail && (
          <path
            d={spec.innerDetail}
            fill="none"
            stroke="var(--color-bone)"
            strokeWidth="1.8"
            strokeOpacity="0.82"
          />
        )}
      </>
    );
  }

  return (
    <>
      <path d={spec.silhouette} fill="var(--color-ink)" />
      {spec.innerDetail && <path d={spec.innerDetail} fill="var(--color-graphite)" />}
    </>
  );
}

function CharacterFace({ spec }: { spec: CharacterSpec }) {
  const isInverted = spec.eyeVariant === "large-close-inverted";

  return (
    <>
      {spec.eyes.map((eye, idx) => (
        <g
          key={idx}
          data-char-eye={idx === 0 ? "left" : "right"}
          style={{ transformOrigin: `${eye.cx}px ${eye.cy}px` }}
        >
          {/* Eye sclera */}
          <circle
            cx={eye.cx}
            cy={eye.cy}
            r={spec.eyeRadius}
            fill={isInverted ? "var(--color-ink)" : "var(--color-bone)"}
            stroke="var(--color-ink)"
            strokeWidth="2"
          />

          {/* Eye pupil / highlight (moves smoothly inside data-char-pupil) */}
          <g data-char-pupil={idx === 0 ? "left" : "right"}>
            {spec.eyeVariant === "slit" ? (
              <rect
                x={eye.cx - 5.5}
                y={eye.cy - 2.6}
                width="11"
                height="5.2"
                rx="2.6"
                fill="var(--color-ink)"
              />
            ) : isInverted ? (
              <>
                <circle cx={eye.cx} cy={eye.cy - 1} r="5.2" fill="var(--color-bone)" />
                <circle cx={eye.cx + 4.5} cy={eye.cy - 4.5} r="2" fill="var(--color-bone)" opacity="0.85" />
              </>
            ) : spec.eyeVariant === "upward-smile" ? (
              <circle cx={eye.cx} cy={eye.cy - 2.8} r="5.2" fill="var(--color-ink)" />
            ) : (
              <circle
                cx={eye.cx}
                cy={eye.cy}
                r={spec.eyeVariant === "equal-flat" ? 5 : 5.5}
                fill="var(--color-ink)"
              />
            )}
          </g>
        </g>
      ))}

      {/* Subtle facial signature lines where specified */}
      {spec.eyeVariant === "equal-flat" && (
        <line
          x1="90"
          y1="118"
          x2="110"
          y2="118"
          stroke="var(--color-bone)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}

      {spec.eyeVariant === "upward-smile" && (
        <path
          d="M 88 122 Q 100 133 112 122"
          fill="none"
          stroke="var(--color-bone)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </>
  );
}

function RoleObject({
  characterId,
  reducedActive = false,
}: {
  characterId: TeamCharacterId;
  reducedActive?: boolean;
}) {
  switch (characterId) {
    case "designer":
      // Small canvas card + chunky geometric pencil; drawn Volt stroke hidden at rest and appears during animation
      return (
        <g data-char-prop="designer">
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
          <line x1="103" y1="154" x2="117" y2="154" stroke="var(--color-ink)" strokeWidth="2" strokeOpacity="0.28" strokeLinecap="round" />
          <line x1="103" y1="188" x2="141" y2="188" stroke="var(--color-ink)" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />

          {/* ONE Volt accent: drawn Volt line across canvas card (hidden at rest, drawn on animation) */}
          <g
            data-sig="draw-line"
            opacity={reducedActive ? 1 : 0}
            style={{ transformOrigin: "104px 171px" }}
          >
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

          {/* Chunky geometric pencil */}
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
      // Code brackets "</>" with ONE Volt cursor bar between them
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

          {/* ONE Volt accent: blinking cursor bar */}
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
      // Three small connected nodes + ONE Volt accent (pulse hidden at rest)
      return (
        <g data-char-prop="automation">
          <line
            x1="46"
            y1="190"
            x2="154"
            y2="190"
            stroke="var(--color-ink)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <g data-sig="auto-node-0">
            <circle cx="46" cy="190" r="13" fill="var(--color-ink)" />
            <circle cx="46" cy="190" r="6" fill="var(--color-bone)" />
            <circle data-sig="auto-lit-0" cx="46" cy="190" r="6.5" fill="var(--color-volt)" stroke="var(--color-ink)" strokeWidth="1.5" opacity="1" />
          </g>

          <g data-sig="auto-node-1">
            <circle cx="100" cy="190" r="13" fill="var(--color-ink)" />
            <circle cx="100" cy="190" r="6" fill="var(--color-bone)" />
            <circle data-sig="auto-lit-1" cx="100" cy="190" r="6.5" fill="var(--color-volt)" stroke="var(--color-ink)" strokeWidth="1.5" opacity={reducedActive ? 1 : 0} />
          </g>

          <g data-sig="auto-node-2">
            <circle cx="154" cy="190" r="13" fill="var(--color-ink)" />
            <circle cx="154" cy="190" r="6" fill="var(--color-bone)" />
            <circle data-sig="auto-lit-2" cx="154" cy="190" r="6.5" fill="var(--color-volt)" stroke="var(--color-ink)" strokeWidth="1.5" opacity={reducedActive ? 1 : 0} />
          </g>

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
          <g data-sig="db-disc-0">
            <rect x="44" y="138" width="112" height="19" rx="9.5" fill="var(--color-ink)" stroke="var(--color-bone)" strokeWidth="2" />
            <rect x="56" y="145" width="38" height="5" rx="2.5" fill="var(--color-bone)" fillOpacity="0.65" />
            <circle cx="140" cy="147.5" r="3" fill="var(--color-bone)" fillOpacity="0.55" />
          </g>

          <g data-sig="db-disc-1">
            <rect x="44" y="160" width="112" height="19" rx="9.5" fill="var(--color-graphite)" stroke="var(--color-ink)" strokeWidth="2.2" />
            <g data-sig="db-volt-row">
              <rect x="56" y="166.5" width="52" height="6" rx="3" fill="var(--color-volt)" />
            </g>
            <circle cx="140" cy="169.5" r="3" fill="var(--color-bone)" fillOpacity="0.6" />
          </g>

          <g data-sig="db-disc-2">
            <rect x="44" y="182" width="112" height="19" rx="9.5" fill="var(--color-ink)" stroke="var(--color-bone)" strokeWidth="2" />
            <rect x="56" y="189" width="28" height="5" rx="2.5" fill="var(--color-bone)" fillOpacity="0.5" />
            <circle cx="140" cy="191.5" r="3" fill="var(--color-bone)" fillOpacity="0.45" />
          </g>
        </g>
      );

    case "client-lead":
      // Crisp geometric speech bubble above right step terrace — HIDDEN at rest, appears only on trigger
      return (
        <g
          data-char-prop="client-lead"
          data-sig="lead-bubble"
          opacity={reducedActive ? 1 : 0}
          style={{ transformOrigin: "136px 64px" }}
        >
          <path
            d="M 132 10 H 174 A 12 12 0 0 1 186 22 V 46 A 12 12 0 0 1 174 58 H 142 L 128 68 V 58 H 132 A 12 12 0 0 1 120 46 V 22 A 12 12 0 0 1 132 10 Z"
            fill="var(--color-bone)"
            stroke="var(--color-ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* ONE Volt accent: crisp check badge with thin Ink outline so Volt stays sharp on Bone */}
          <g data-sig="lead-check" style={{ transformOrigin: "153px 34px" }}>
            <circle
              cx="153"
              cy="34"
              r="14"
              fill="var(--color-volt)"
              stroke="var(--color-ink)"
              strokeWidth="2.2"
            />
            <path
              d="M 146 34.5 L 151 39.5 L 160.5 29"
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
 * - Renders five distinct Bauhaus characters in our 4-token palette (Ink, Bone, Graphite, one Volt accent).
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
              strokeWidth="2.2"
            />
          </>
        ) : (
          <>
            <CharacterBody spec={spec} />
            <CharacterFace spec={spec} />
          </>
        )}

        {/* Role-specific signature object */}
        <RoleObject characterId={characterId} reducedActive={reducedActive} />
      </g>
    </svg>
  );
}
