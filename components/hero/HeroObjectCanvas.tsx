"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/site.config";

export type HeroObjectCanvasProps = {
  /** Reusable 0→1 progress input for Stage 2 scroll-driven transformation. */
  progress: number;
  /** Compact, lower-vertex variant for mobile viewports. */
  isMobile: boolean;
  /** Disables cursor spring tilt (touch devices / mobile). */
  isTouch: boolean;
  /** Static, fully assembled pose with zero ongoing animation frames. */
  reducedMotion: boolean;
  /** True only while the hero container intersects the viewport. */
  isVisible: boolean;
};

// ── Slab geometry dimensions (3:2 editorial browser ratio) ──────────────────
const W = 3.24;
const H = 2.16;
const D = 0.085;
const R = 0.13;
const HALF_D = D / 2;

/** Matches the site's cubic-bezier(0.16, 1, 0.3, 1) ease-out curve closely for procedural draw-in. */
function easeOutExpoish(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c === 1 ? 1 : 1 - Math.pow(2, -10 * c);
}

/** Closed clockwise rounded-rectangle point loop at z = 0 (clean for drawRange tracing). */
function roundedRectPoints(cx: number, cy: number, w: number, h: number, r: number, segs: number): THREE.Vector3[] {
  const hw = w / 2;
  const hh = h / 2;
  const cr = Math.min(r, hw, hh);
  const pts: THREE.Vector3[] = [];

  const corners: [number, number, number, number][] = [
    [cx - hw + cr, cy + hh - cr, Math.PI, Math.PI / 2], // top-left
    [cx + hw - cr, cy + hh - cr, Math.PI / 2, 0], // top-right
    [cx + hw - cr, cy - hh + cr, 0, -Math.PI / 2], // bottom-right
    [cx - hw + cr, cy - hh + cr, -Math.PI / 2, -Math.PI], // bottom-left
  ];

  for (const [ox, oy, a0, a1] of corners) {
    for (let i = 0; i <= segs; i++) {
      const a = a0 + ((a1 - a0) * i) / segs;
      pts.push(new THREE.Vector3(ox + Math.cos(a) * cr, oy + Math.sin(a) * cr, 0));
    }
  }
  pts.push(pts[0].clone());
  return pts;
}

/** Rounded-rectangle THREE.Shape for solid slab / card face fills. */
function roundedRectShape(cx: number, cy: number, w: number, h: number, r: number): THREE.Shape {
  const hw = w / 2;
  const hh = h / 2;
  const cr = Math.min(r, hw, hh);
  const x0 = cx - hw;
  const x1 = cx + hw;
  const y0 = cy - hh;
  const y1 = cy + hh;

  const s = new THREE.Shape();
  s.moveTo(x0 + cr, y1);
  s.lineTo(x1 - cr, y1);
  s.quadraticCurveTo(x1, y1, x1, y1 - cr);
  s.lineTo(x1, y0 + cr);
  s.quadraticCurveTo(x1, y0, x1 - cr, y0);
  s.lineTo(x0 + cr, y0);
  s.quadraticCurveTo(x0, y0, x0, y0 + cr);
  s.lineTo(x0, y1 - cr);
  s.quadraticCurveTo(x0, y1, x0 + cr, y1);
  return s;
}

/** Packs an array of closed loops or 2-point segments into one LineSegments BufferGeometry. */
function buildSegmentsGeometry(
  loops: THREE.Vector3[][],
  extraSegments: [THREE.Vector3, THREE.Vector3][] = [],
): THREE.BufferGeometry {
  const verts: number[] = [];
  for (const loop of loops) {
    for (let i = 0; i < loop.length - 1; i++) {
      const a = loop[i];
      const b = loop[i + 1];
      verts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  for (const [a, b] of extraSegments) {
    verts.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  return geo;
}

function circleLoop(cx: number, cy: number, r: number, segs = 14): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
  }
  return pts;
}

/**
 * Demand-mode frame driver: invalidates the R3F canvas only when visible,
 * tab-active, and something is actually animating. Stops completely when
 * off-screen or in reduced-motion static state.
 */
function DemandDriver({
  isVisible,
  reducedMotion,
  progress,
}: {
  isVisible: boolean;
  reducedMotion: boolean;
  progress: number;
}) {
  const invalidate = useThree((s) => s.invalidate);

  // Trigger a render whenever visibility or progress changes (including in reduced motion).
  useEffect(() => {
    if (isVisible) invalidate();
  }, [isVisible, progress, reducedMotion, invalidate]);

  useEffect(() => {
    if (!isVisible || reducedMotion) return;

    let rafId = 0;
    const loop = () => {
      if (document.visibilityState === "visible") {
        invalidate();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const onVisibility = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isVisible, reducedMotion, invalidate]);

  return null;
}

function BrowserSlab({
  progress,
  isMobile,
  isTouch,
  reducedMotion,
}: Omit<HeroObjectCanvasProps, "isVisible">) {
  const groupRef = useRef<THREE.Group>(null);
  const contentLayerRef = useRef<THREE.Group>(null);
  const cursorRef = useRef<THREE.Mesh>(null);

  // Pointer target & spring state (kept in refs — zero React re-renders).
  const pointerTarget = useRef({ x: 0, y: 0 });
  const spring = useRef({ rx: 0, ry: 0, vx: 0, vy: 0 });
  const elapsedRef = useRef(0);
  const smoothProgressRef = useRef(progress);

  // Listen to window pointermove on desktop fine pointers for smooth cursor tilt.
  useEffect(() => {
    if (isTouch || isMobile || reducedMotion) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointerTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerTarget.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      pointerTarget.current.x = 0;
      pointerTarget.current.y = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [isMobile, isTouch, reducedMotion]);

  // Build all procedural geometries & materials once per mobile/desktop profile.
  const assets = useMemo(() => {
    const curveSegs = isMobile ? 7 : 14;
    const dotSegs = isMobile ? 10 : 14;

    // 1. Solid Graphite slab core (thin extruded rounded rect centered on Z).
    const slabShape = roundedRectShape(0, 0, W, H, R);
    const slabGeo = new THREE.ExtrudeGeometry(slabShape, {
      depth: D,
      bevelEnabled: false,
      curveSegments: curveSegs,
    });
    slabGeo.translate(0, 0, -HALF_D);
    const slabMat = new THREE.MeshBasicMaterial({
      color: colors.graphite,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    // 2. Subtle inner block fills (modulated by `progress` 0→1).
    const heroFillGeo = new THREE.ShapeGeometry(roundedRectShape(0, 0.16, 2.84, 0.88, 0.06), curveSegs);
    const cardW = 0.87;
    const cardH = 0.56;
    const cardGap = 0.115;
    const cardXs = [-(cardW + cardGap), 0, cardW + cardGap];
    const cardFillGeos = cardXs.map(
      (cx) => new THREE.ShapeGeometry(roundedRectShape(cx, -0.65, cardW, cardH, 0.05), curveSegs),
    );
    const blockFillMat = new THREE.MeshBasicMaterial({
      color: colors.bone,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    // 3. Outer perimeter lines (animated drawRange during 1.2s assembly).
    const perimeterPts = roundedRectPoints(0, 0, W, H, R, curveSegs);
    const frontPerimeterGeo = new THREE.BufferGeometry().setFromPoints(perimeterPts);
    const frontPerimeterMat = new THREE.LineBasicMaterial({
      color: colors.volt,
      transparent: true,
      opacity: 0.95,
    });
    const frontPerimeterLine = new THREE.Line(frontPerimeterGeo, frontPerimeterMat);

    const backPerimeterGeo = new THREE.BufferGeometry().setFromPoints(perimeterPts);
    const backPerimeterMat = new THREE.LineBasicMaterial({
      color: colors.volt,
      transparent: true,
      opacity: 0.28,
    });
    const backPerimeterLine = new THREE.Line(backPerimeterGeo, backPerimeterMat);

    // Corner depth struts connecting front & back faces (desktop only).
    const strutOffX = W / 2 - R * 0.29;
    const strutOffY = H / 2 - R * 0.29;
    const strutsGeo = buildSegmentsGeometry(
      [],
      [
        [new THREE.Vector3(-strutOffX, strutOffY, -HALF_D), new THREE.Vector3(-strutOffX, strutOffY, HALF_D)],
        [new THREE.Vector3(strutOffX, strutOffY, -HALF_D), new THREE.Vector3(strutOffX, strutOffY, HALF_D)],
        [new THREE.Vector3(strutOffX, -strutOffY, -HALF_D), new THREE.Vector3(strutOffX, -strutOffY, HALF_D)],
        [new THREE.Vector3(-strutOffX, -strutOffY, -HALF_D), new THREE.Vector3(-strutOffX, -strutOffY, HALF_D)],
      ],
    );
    const strutsMat = new THREE.LineBasicMaterial({
      color: colors.volt,
      transparent: true,
      opacity: 0,
    });
    const strutsLines = new THREE.LineSegments(strutsGeo, strutsMat);

    // 4. Browser top chrome (divider, 3 window dots, address bar pill + url rule).
    const chromeY = 0.91;
    const chromeDividerY = 0.74;
    const addressBarLoop = roundedRectPoints(0.14, chromeY, 1.72, 0.16, 0.08, Math.max(4, Math.floor(curveSegs / 2)));
    const dot1Loop = circleLoop(-1.39, chromeY, 0.036, dotSegs);
    const dot2Loop = circleLoop(-1.26, chromeY, 0.036, dotSegs);
    const dot3Loop = circleLoop(-1.13, chromeY, 0.036, dotSegs);

    const chromeVoltGeo = buildSegmentsGeometry(
      [dot1Loop, addressBarLoop],
      [[new THREE.Vector3(-W / 2, chromeDividerY, 0), new THREE.Vector3(W / 2, chromeDividerY, 0)]],
    );
    const chromeVoltMat = new THREE.LineBasicMaterial({
      color: colors.volt,
      transparent: true,
      opacity: 0,
    });
    const chromeVoltLines = new THREE.LineSegments(chromeVoltGeo, chromeVoltMat);

    const chromeMutedGeo = buildSegmentsGeometry(
      [dot2Loop, dot3Loop],
      [[new THREE.Vector3(-0.62, chromeY, 0), new THREE.Vector3(-0.14, chromeY, 0)]],
    );
    const chromeMutedMat = new THREE.LineBasicMaterial({
      color: colors.bone,
      transparent: true,
      opacity: 0,
    });
    const chromeMutedLines = new THREE.LineSegments(chromeMutedGeo, chromeMutedMat);

    // Blinking Volt cursor inside the address bar.
    const cursorGeo = new THREE.PlaneGeometry(0.024, 0.084);
    const cursorMat = new THREE.MeshBasicMaterial({
      color: colors.volt,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    // 5. Page blocks (large hero block, headline lines, CTA pill, 3 cards).
    const heroBox = roundedRectPoints(0, 0.16, 2.84, 0.88, 0.06, Math.max(5, Math.floor(curveSegs / 2)));
    const headlineLine1 = roundedRectPoints(-0.68, 0.34, 1.18, 0.09, 0.02, 3);
    const headlineLine2 = roundedRectPoints(-0.84, 0.18, 0.86, 0.09, 0.02, 3);
    const ctaPill = roundedRectPoints(-1.04, -0.05, 0.46, 0.11, 0.055, 4);

    const cardLoops = cardXs.map((cx) =>
      roundedRectPoints(cx, -0.65, cardW, cardH, 0.05, Math.max(4, Math.floor(curveSegs / 2))),
    );

    const pagePrimaryLoops: THREE.Vector3[][] = [heroBox, headlineLine1, headlineLine2, ctaPill, ...cardLoops];
    const pagePrimarySegs: [THREE.Vector3, THREE.Vector3][] = [];

    // Desktop-only detail: mini preview frame on right side of hero block + card index ticks.
    if (!isMobile) {
      pagePrimaryLoops.push(roundedRectPoints(0.76, 0.16, 0.98, 0.62, 0.04, 4));
      for (const cx of cardXs) {
        pagePrimarySegs.push([new THREE.Vector3(cx - 0.31, -0.49, 0), new THREE.Vector3(cx - 0.12, -0.49, 0)]);
      }
    }

    const pagePrimaryGeo = buildSegmentsGeometry(pagePrimaryLoops, pagePrimarySegs);
    const pagePrimaryMat = new THREE.LineBasicMaterial({
      color: colors.volt,
      transparent: true,
      opacity: 0,
    });
    const pagePrimaryLines = new THREE.LineSegments(pagePrimaryGeo, pagePrimaryMat);

    // Secondary muted content rules inside cards & mini hero frame.
    const secondarySegs: [THREE.Vector3, THREE.Vector3][] = [];
    for (const cx of cardXs) {
      secondarySegs.push([new THREE.Vector3(cx - 0.31, -0.64, 0), new THREE.Vector3(cx + 0.25, -0.64, 0)]);
      secondarySegs.push([new THREE.Vector3(cx - 0.31, -0.74, 0), new THREE.Vector3(cx + 0.08, -0.74, 0)]);
    }
    if (!isMobile) {
      // Subtle geometric corner registration crosshairs + mini-frame diagonal reference.
      secondarySegs.push([new THREE.Vector3(0.32, -0.10, 0), new THREE.Vector3(1.20, 0.42, 0)]);
      const tick = 0.08;
      const tx = W / 2 + 0.16;
      const ty = H / 2 + 0.12;
      secondarySegs.push(
        [new THREE.Vector3(tx - tick, ty, 0), new THREE.Vector3(tx + tick, ty, 0)],
        [new THREE.Vector3(tx, ty - tick, 0), new THREE.Vector3(tx, ty + tick, 0)],
        [new THREE.Vector3(-tx - tick, -ty, 0), new THREE.Vector3(-tx + tick, -ty, 0)],
        [new THREE.Vector3(-tx, -ty - tick, 0), new THREE.Vector3(-tx, -ty + tick, 0)],
      );
    }

    const pageSecondaryGeo = buildSegmentsGeometry([], secondarySegs);
    const pageSecondaryMat = new THREE.LineBasicMaterial({
      color: colors.bone,
      transparent: true,
      opacity: 0,
    });
    const pageSecondaryLines = new THREE.LineSegments(pageSecondaryGeo, pageSecondaryMat);

    return {
      perimeterCount: perimeterPts.length,
      slabGeo,
      slabMat,
      heroFillGeo,
      cardFillGeos,
      blockFillMat,
      frontPerimeterGeo,
      frontPerimeterMat,
      frontPerimeterLine,
      backPerimeterGeo,
      backPerimeterMat,
      backPerimeterLine,
      strutsGeo,
      strutsMat,
      strutsLines,
      chromeVoltGeo,
      chromeVoltMat,
      chromeVoltLines,
      chromeMutedGeo,
      chromeMutedMat,
      chromeMutedLines,
      cursorGeo,
      cursorMat,
      pagePrimaryGeo,
      pagePrimaryMat,
      pagePrimaryLines,
      pageSecondaryGeo,
      pageSecondaryMat,
      pageSecondaryLines,
    };
  }, [isMobile]);

  // Ref mirror so useFrame mutates GPU materials/drawRanges cleanly under React 19 immutability checks.
  const assetsRef = useRef(assets);
  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  // Clean up GPU buffers and materials on unmount or profile switch.
  useEffect(() => {
    return () => {
      assets.slabGeo.dispose();
      assets.slabMat.dispose();
      assets.heroFillGeo.dispose();
      assets.cardFillGeos.forEach((g) => g.dispose());
      assets.blockFillMat.dispose();
      assets.frontPerimeterGeo.dispose();
      assets.frontPerimeterMat.dispose();
      assets.backPerimeterGeo.dispose();
      assets.backPerimeterMat.dispose();
      assets.strutsGeo.dispose();
      assets.strutsMat.dispose();
      assets.chromeVoltGeo.dispose();
      assets.chromeVoltMat.dispose();
      assets.chromeMutedGeo.dispose();
      assets.chromeMutedMat.dispose();
      assets.cursorGeo.dispose();
      assets.cursorMat.dispose();
      assets.pagePrimaryGeo.dispose();
      assets.pagePrimaryMat.dispose();
      assets.pageSecondaryGeo.dispose();
      assets.pageSecondaryMat.dispose();
    };
  }, [assets]);

  // Base architectural pose facing subtly toward the headline on the left.
  const baseRotY = isMobile ? -0.18 : -0.34;
  const baseRotX = isMobile ? 0.08 : 0.13;
  const baseRotZ = isMobile ? -0.015 : -0.03;

  useFrame((_state, rawDelta) => {
    const a = assetsRef.current;
    const dt = Math.min(rawDelta, 0.05);
    const t = reducedMotion ? 10 : (elapsedRef.current += dt);

    // Smooth the reusable `progress` prop (0 = airy wireframe, 1 = filled solid card).
    const clampedP = Math.min(1, Math.max(0, progress));
    smoothProgressRef.current = reducedMotion
      ? clampedP
      : smoothProgressRef.current + (clampedP - smoothProgressRef.current) * Math.min(1, dt * 8);
    const p = smoothProgressRef.current;

    // ── 1.2s assembly sequence (immediate in reduced motion) ───────────────
    const edgeProgress = reducedMotion ? 1 : easeOutExpoish(t / 0.72);
    const fillProgress = reducedMotion ? 1 : easeOutExpoish((t - 0.34) / 0.62);
    const chromeProgress = reducedMotion ? 1 : easeOutExpoish((t - 0.44) / 0.56);
    const pageProgress = reducedMotion ? 1 : easeOutExpoish((t - 0.58) / 0.62);

    const drawCount = Math.max(2, Math.round(edgeProgress * a.perimeterCount));
    a.frontPerimeterGeo.setDrawRange(0, drawCount);
    a.backPerimeterGeo.setDrawRange(0, drawCount);

    // Opacities modulated by assembly + `progress` prop.
    a.frontPerimeterMat.opacity = Math.min(1, edgeProgress * 2.5);
    a.backPerimeterMat.opacity = 0.32 * edgeProgress * (1 - p * 0.35);
    a.strutsMat.opacity = 0.38 * fillProgress;
    a.slabMat.opacity = fillProgress * (0.38 + p * 0.56);
    a.blockFillMat.opacity = pageProgress * (0.03 + p * 0.095);

    a.chromeVoltMat.opacity = chromeProgress * 0.78;
    a.chromeMutedMat.opacity = chromeProgress * 0.42;
    a.pagePrimaryMat.opacity = pageProgress * (0.82 + p * 0.16);
    a.pageSecondaryMat.opacity = pageProgress * (0.34 + p * 0.16);

    // Blinking Volt caret in the address bar (solid in reduced motion).
    const blinkOn = reducedMotion ? 1 : Math.floor(t * 2) % 2 === 0 ? 1 : 0.08;
    a.cursorMat.opacity = chromeProgress * 0.95 * blinkOn;

    // Lift content lines gently in Z as `progress` approaches 1.
    if (contentLayerRef.current) {
      contentLayerRef.current.position.z = HALF_D + 0.005 + p * 0.03;
    }

    // ── Idle float + slow breathing rotation + cursor spring tilt ──────────
    const grp = groupRef.current;
    if (!grp) return;

    if (reducedMotion) {
      grp.position.set(0, 0, 0);
      grp.rotation.set(baseRotX * (1 - p * 0.45), baseRotY * (1 - p * 0.55), baseRotZ * (1 - p * 0.5));
      return;
    }

    const floatY = Math.sin(t * 0.85) * 0.065;
    const idleRotY = Math.sin(t * 0.42) * 0.075;
    const idleRotX = Math.cos(t * 0.36) * 0.032;

    // Spring physics toward cursor (limited range, disabled on touch/mobile).
    const targetTiltY = isTouch || isMobile ? 0 : pointerTarget.current.x * 0.17;
    const targetTiltX = isTouch || isMobile ? 0 : -pointerTarget.current.y * 0.11;
    const sp = spring.current;
    const stiffness = 26;
    const damping = 7.2;
    sp.vx += ((targetTiltX - sp.rx) * stiffness - sp.vx * damping) * dt;
    sp.vy += ((targetTiltY - sp.ry) * stiffness - sp.vy * damping) * dt;
    sp.rx += sp.vx * dt;
    sp.ry += sp.vy * dt;

    // Subtle scale settles into place during initial edge assembly.
    const introScale = 0.95 + 0.05 * edgeProgress;
    grp.scale.setScalar(introScale);
    grp.position.set(0, floatY, 0);
    grp.rotation.set(
      baseRotX * (1 - p * 0.45) + idleRotX + sp.rx,
      baseRotY * (1 - p * 0.55) + idleRotY + sp.ry,
      baseRotZ * (1 - p * 0.5),
    );

    if (cursorRef.current) {
      cursorRef.current.position.z = HALF_D + 0.006;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Faint Graphite slab body */}
      <mesh geometry={assets.slabGeo} material={assets.slabMat} />

      {/* Crisp Volt front & back rounded perimeters + corner struts */}
      <primitive object={assets.frontPerimeterLine} position={[0, 0, HALF_D + 0.002]} />
      {!isMobile && <primitive object={assets.backPerimeterLine} position={[0, 0, -HALF_D]} />}
      {!isMobile && <primitive object={assets.strutsLines} />}

      {/* Browser top bar: 3 dots, address bar, blinking Volt cursor */}
      <primitive object={assets.chromeVoltLines} position={[0, 0, HALF_D + 0.004]} />
      <primitive object={assets.chromeMutedLines} position={[0, 0, HALF_D + 0.004]} />
      <mesh
        ref={cursorRef}
        geometry={assets.cursorGeo}
        material={assets.cursorMat}
        position={[-0.08, 0.91, HALF_D + 0.006]}
      />

      {/* Page layout blocks (hero block, headline lines, CTA pill, 3 cards) */}
      <group ref={contentLayerRef} position={[0, 0, HALF_D + 0.005]}>
        <mesh geometry={assets.heroFillGeo} material={assets.blockFillMat} position={[0, 0, -0.002]} />
        {assets.cardFillGeos.map((geo, idx) => (
          <mesh key={idx} geometry={geo} material={assets.blockFillMat} position={[0, 0, -0.002]} />
        ))}
        <primitive object={assets.pagePrimaryLines} />
        <primitive object={assets.pageSecondaryLines} />
      </group>
    </group>
  );
}

export default function HeroObjectCanvas(props: HeroObjectCanvasProps) {
  const { isMobile, isVisible, reducedMotion, progress } = props;

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ position: [0, 0, isMobile ? 5.85 : 5.75], fov: 36, near: 0.1, far: 30 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <DemandDriver isVisible={isVisible} reducedMotion={reducedMotion} progress={progress} />
      <BrowserSlab {...props} />
    </Canvas>
  );
}
