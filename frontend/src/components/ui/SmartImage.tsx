// <img> that gracefully falls back to a branded placeholder when the source
// fails to load (offline, moved URL, empty string). Replaces the old
// text-only placeholder block in cards with a real visual treatment.

import { useState } from 'react';
import { Monogram } from '../brand/Brand';
import { FALLBACK_IMAGE } from '../../lib/images';

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  /** If provided, use this branded fallback rather than the default photo. */
  fallback?: string;
}

export function SmartImage({ src, alt, className = '', fallback }: SmartImageProps) {
  const [state, setState] = useState<{ src?: string; errored: boolean }>({
    src,
    errored: false,
  });

  const finalSrc = state.errored ? fallback ?? FALLBACK_IMAGE : state.src;

  if (!finalSrc) {
    return (
      <div className={`flex items-center justify-center bg-emerald-light ${className}`}>
        <div className="opacity-60">
          <Monogram className="h-10 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-emerald-light ${className}`}>
      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        onError={() => setState((s) => (s.errored ? s : { src: s.src, errored: true }))}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    </div>
  );
}