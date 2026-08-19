// Brand typography primitives. All public copy renders through these so the
// font/tone hierarchy stays consistent (docs/frontend-spec.md §2).

import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function Monogram({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width="40"
      height="40"
      className={className}
      role="img"
      aria-label="Sterling Gates monogram"
    >
      <rect x="1" y="1" width="46" height="46" fill="#111B18" stroke="#8C764D" strokeWidth="2" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="22"
        fill="#E6CB85"
      >
        SG
      </text>
    </svg>
  );
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="gold-rule" aria-hidden="true" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}

export function DisplayHeading({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h2 className={`display text-4xl md:text-5xl text-parchment ${className}`}>{children}</h2>;
}

export function BodyText({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`editorial text-parchment/80 ${className}`}>{children}</p>;
}