// Shared finishing layers: every shot goes through the same grain / chromatic aberration / vignette
// so GPT stills, Live2D and code-drawn art read as one film.
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/** Film grain: per-frame turbulence, overlaid. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity, pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={f % 997} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number; color?: string }> = ({ strength = 0.35, color = '20,10,40' }) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(${color},0) 55%, rgba(${color},${strength}) 100%)`,
    }}
  />
);

/** Full-frame colour flash (white by default), amount 0..1. */
export const Flash: React.FC<{ amount: number; color?: string }> = ({ amount, color = '#fff' }) =>
  amount <= 0.001 ? null : <AbsoluteFill style={{ background: color, opacity: Math.min(1, amount), pointerEvents: 'none' }} />;

/**
 * Chromatic aberration on everything inside: red shifted left, blue right, by `px`.
 * Needs a unique id when used more than once per frame.
 */
export const Aberration: React.FC<{ px?: number; id?: string; children: React.ReactNode }> = ({ px = 2, id = 'ca', children }) => {
  if (px < 0.05) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ filter: `url(#${id})` }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={-px} result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={px} result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/** The standard finishing stack placed over a shot. */
export const Finish: React.FC<{ grain?: number; vignette?: number }> = ({ grain = 0.1, vignette = 0.3 }) => (
  <>
    <Vignette strength={vignette} />
    <Grain opacity={grain} />
  </>
);
