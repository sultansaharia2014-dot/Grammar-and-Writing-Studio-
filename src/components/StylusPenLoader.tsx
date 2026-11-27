import { useEffect, useRef, useState } from 'react';
import { LanguageMode } from '../types/studio';

const INK_RIBBON_PATH =
  'M 290 14 C 216 18, 108 26, 114 44 C 120 62, 276 58, 270 80 C 264 100, 146 108, 42 104';

const CYCLE_MS = 4000;

function Stylus3DPenSvg() {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[152px] h-[152px] sm:w-[188px] sm:h-[188px] drop-shadow-[0_18px_22px_rgba(32,48,76,0.22)]"
      aria-hidden="true"
    >
      <defs>
        {/* 3D pearl-white cylindrical shading across body width */}
        <linearGradient id="stylusBody3d" x1="56" y1="68" x2="72" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E6EBF3" />
          <stop offset="22%" stopColor="#FFFFFF" />
          <stop offset="56%" stopColor="#F4F7FB" />
          <stop offset="84%" stopColor="#D8DFEB" />
          <stop offset="100%" stopColor="#B8C2D2" />
        </linearGradient>

        {/* Flat magnetic side facet highlight */}
        <linearGradient id="stylusFacet3d" x1="28" y1="104" x2="128" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#EDF1F7" stopOpacity="0.88" />
        </linearGradient>

        {/* Smooth 3D dome cap gradient */}
        <linearGradient id="stylusCap3d" x1="118" y1="8" x2="134" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#EEF2F8" />
          <stop offset="100%" stopColor="#C4CDDC" />
        </linearGradient>

        {/* Tapered white cone shading */}
        <linearGradient id="stylusCone3d" x1="16" y1="108" x2="32" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5F7FB" />
          <stop offset="32%" stopColor="#FFFFFF" />
          <stop offset="76%" stopColor="#DCE2EE" />
          <stop offset="100%" stopColor="#B7C1D1" />
        </linearGradient>

        {/* Smooth replaceable fine nib */}
        <linearGradient id="stylusNib3d" x1="9" y1="120" x2="21" y2="132" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#ECEFF6" />
          <stop offset="100%" stopColor="#C1CAD9" />
        </linearGradient>

        {/* Recessed USB-C port metallic rim */}
        <linearGradient id="usbPortRim" x1="105" y1="21" x2="117" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9DA7B8" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Soft contact shadow beneath nib tip */}
      <ellipse cx="13" cy="131.5" rx="7" ry="2.2" fill="#183856" fillOpacity="0.16" />

      {/* Main 3D rounded cap & cylindrical pearl-white stylus body */}
      <path
        d="M 27.5 101.5 L 120.5 8.5 C 124.2 4.8 130.2 4.8 133.8 8.4 C 137.4 12.0 137.4 18.0 133.7 21.7 L 40.7 114.7 L 27.5 101.5 Z"
        fill="url(#stylusBody3d)"
        stroke="#CED6E4"
        strokeWidth="0.7"
      />

      {/* Smooth flat magnetic side facet running along upper cylinder */}
      <path
        d="M 32.5 102.5 L 122 13 L 127 18 L 37.5 107.5 Z"
        fill="url(#stylusFacet3d)"
      />

      {/* Top crisp specular rim highlight for 3D depth */}
      <path
        d="M 31 102 L 122.5 10.5"
        stroke="#FFFFFF"
        strokeOpacity="0.95"
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      {/* Top dome cap subtle bevel seam ring */}
      <path
        d="M 118.2 10.8 C 122 14 126.5 18.5 130.8 22.8"
        stroke="#CBD3E2"
        strokeWidth="1.0"
        strokeLinecap="round"
      />

      {/* Dome cap top specular sheen */}
      <path
        d="M 122.8 8.8 C 125.8 6.8 129.6 7.0 131.8 9.2"
        stroke="#FFFFFF"
        strokeOpacity="0.9"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Recessed pill-shaped USB-C charging port near cap */}
      <g transform="rotate(-45 113 26.5)">
        <rect
          x="106.2"
          y="23.5"
          width="13.6"
          height="6"
          rx="3"
          fill="url(#usbPortRim)"
        />
        <rect
          x="107"
          y="24.2"
          width="12"
          height="4.6"
          rx="2.3"
          fill="#1B1F2A"
        />
        <rect
          x="109.2"
          y="25.9"
          width="7.6"
          height="1.2"
          rx="0.6"
          fill="#4A5266"
        />
      </g>

      {/* Three signature micro-LED battery dots below port */}
      <circle cx="104.2" cy="35.4" r="1.25" fill="#9AA4B6" />
      <circle cx="99.9" cy="39.7" r="1.25" fill="#A6B0C2" />
      <circle cx="95.6" cy="44.0" r="1.25" fill="#B4BDCF" />

      {/* Smooth tapered lower cone */}
      <path
        d="M 17.6 116.8 L 27.5 101.5 L 40.7 114.7 L 25.4 124.6 L 17.6 116.8 Z"
        fill="url(#stylusCone3d)"
        stroke="#CFD7E5"
        strokeWidth="0.6"
      />
      {/* Cone specular edge */}
      <path
        d="M 19.8 116.5 L 29.2 103.8"
        stroke="#FFFFFF"
        strokeOpacity="0.9"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Seam line between body cone and replaceable stylus nib */}
      <path
        d="M 17.6 116.8 L 25.4 124.6"
        stroke="#B8C2D4"
        strokeWidth="0.85"
        strokeLinecap="round"
      />

      {/* Smooth precision white stylus nib terminating cleanly at (10, 130) */}
      <path
        d="M 10.0 130.0 C 9.7 130.3 10.1 130.6 10.4 130.3 L 25.4 124.6 L 17.6 116.8 L 10.0 130.0 Z"
        fill="url(#stylusNib3d)"
        stroke="#C5CEDE"
        strokeWidth="0.55"
        strokeLinejoin="round"
      />

      {/* Soft aqua-cyan ink shimmer right at nib contact point */}
      <circle cx="10" cy="130" r="2.4" fill="#00E8C8" fillOpacity="0.78" />
    </svg>
  );
}

export function StylusPenLoader({
  headline,
  subtext,
  lang,
}: {
  headline: string;
  subtext: string;
  lang: LanguageMode;
}) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [penPose, setPenPose] = useState({
    xPct: (42 / 360) * 100,
    yPct: (104 / 116) * 100,
    dashOffset: 0,
    tiltZ: 0,
    tiltY: -6,
    inkOpacity: 1,
  });

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      return;
    }

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const pathEl = pathRef.current;
      if (pathEl) {
        const totalLength = pathEl.getTotalLength();
        const rawT = ((now - startTime) % CYCLE_MS) / CYCLE_MS;

        let drawProgress = 1;
        let inkOpacity = 1;
        let pt: DOMPoint;
        let prevPt: DOMPoint;

        if (rawT <= 0.78) {
          const u = rawT / 0.78;
          // Gentle ease-out-in blend so the stroke flows immediately without stalling
          drawProgress = 0.65 * u + 0.35 * (0.5 - 0.5 * Math.cos(Math.PI * u));
          const dist = drawProgress * totalLength;
          pt = pathEl.getPointAtLength(dist);
          prevPt = pathEl.getPointAtLength(Math.max(0, dist - 2.5));
        } else if (rawT <= 0.90) {
          drawProgress = 1;
          pt = pathEl.getPointAtLength(totalLength);
          prevPt = pathEl.getPointAtLength(Math.max(0, totalLength - 2.5));
        } else {
          const resetU = (rawT - 0.90) / 0.10;
          const easeReset = 0.5 - 0.5 * Math.cos(Math.PI * resetU);
          inkOpacity = Math.max(0.08, 1 - resetU * 1.1);
          drawProgress = 1;
          const endPt = pathEl.getPointAtLength(totalLength);
          const startPt = pathEl.getPointAtLength(0);
          pt = new DOMPoint(
            endPt.x + (startPt.x - endPt.x) * easeReset,
            endPt.y + (startPt.y - endPt.y) * easeReset,
          );
          prevPt = pt;
        }

        const dx = pt.x - prevPt.x;
        const tiltZ = Math.max(-5, Math.min(5, dx * 1.3));
        const tiltY = Math.max(-12, Math.min(12, dx * 3.0));

        setPenPose({
          xPct: (pt.x / 360) * 100,
          yPct: (pt.y / 116) * 100,
          dashOffset: (1 - drawProgress) * 100,
          tiltZ,
          tiltY,
          inkOpacity,
        });
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      data-testid="writer-loading-card"
      role="status"
      aria-live="polite"
      aria-label={lang === 'bn' ? 'লেখা তৈরি হচ্ছে' : headline}
      className="glass-panel px-5 py-6 sm:px-8 sm:py-8 min-w-0 overflow-hidden"
    >
      {/* Open-air 3D stylus + glowing cyan-to-violet S-curve ink directly on glass (no page) */}
      <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[430px] pt-32 sm:pt-40 pb-2">
        <div className="relative w-full aspect-[360/116]">
          <svg
            viewBox="0 0 360 116"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              {/* Exact gradient from uploaded reference: periwinkle-indigo -> azure blue -> aqua cyan */}
              <linearGradient id="stylusInkGrad" x1="290" y1="14" x2="42" y2="104" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7C7BFF" stopOpacity="0.82" />
                <stop offset="28%" stopColor="#2E9BFF" />
                <stop offset="65%" stopColor="#09C8F5" />
                <stop offset="100%" stopColor="#00F0CE" />
              </linearGradient>
              <filter id="stylusInkGlow" x="-15%" y="-15%" width="130%" height="130%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Soft luminous under-glow ribbon */}
            <path
              d={INK_RIBBON_PATH}
              pathLength={100}
              stroke="url(#stylusInkGrad)"
              strokeWidth="8.5"
              strokeLinecap="round"
              strokeDasharray="100"
              strokeDashoffset={penPose.dashOffset}
              strokeOpacity={penPose.inkOpacity * 0.24}
              fill="none"
            />

            {/* Main smooth cyan -> blue -> indigo ribbon stroke */}
            <path
              ref={pathRef}
              d={INK_RIBBON_PATH}
              pathLength={100}
              stroke="url(#stylusInkGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="100"
              strokeDashoffset={penPose.dashOffset}
              strokeOpacity={penPose.inkOpacity}
              filter="url(#stylusInkGlow)"
              fill="none"
              className="stylus-ink-ribbon"
            />
          </svg>

          {/* 3D Smooth Stylus Pen locked precisely onto the active ink tip */}
          <div
            data-testid="stylish-pen-loader"
            style={{
              left: `${penPose.xPct}%`,
              top: `${penPose.yPct}%`,
              transform: `translate3d(-7.143%, -92.857%, 0) perspective(850px) rotateX(6deg) rotateY(${penPose.tiltY.toFixed(2)}deg) rotateZ(${penPose.tiltZ.toFixed(2)}deg)`,
              transformOrigin: '7.143% 92.857%',
              willChange: 'left, top, transform',
            }}
            className="pointer-events-none absolute z-10"
          >
            <Stylus3DPenSvg />
          </div>
        </div>
      </div>

      <div className="mt-2 text-center space-y-1">
        <p className="text-sm sm:text-base font-extrabold text-[#362419]">{headline}</p>
        <p className="text-xs text-[#7A6252] max-w-md mx-auto">{subtext}</p>
      </div>
    </div>
  );
}
