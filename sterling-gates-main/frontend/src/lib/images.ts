// Curated on-brand photography for the Sterling Gates site.
//
// Note: Pinterest pins are copyrighted and are not suitable to bundle or
// hotlink. Instead these are license-free Unsplash photos chosen to match the
// luxury "Pinterest real-estate" aesthetic (warm light, architectural detail,
// restrained palettes). Swap any URL here for your own commissioned photography
// before launch. Every <img> also falls back to a brand monogram placeholder if
// a URL fails (see components/ui/SmartImage.tsx).

/** Appends Unsplash sizing params for consistent crops. */
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  hero: u('photo-1600596542815-ffad4c1539a9', 2000),
  heroAlt: u('photo-1613490493576-7fde63acd811', 2000),
  philosophy: u('photo-1600210492486-724fe5c67fb0', 1200),
  services: u('photo-1486406146926-c627a92ad1ab', 1400),
  intelligence: u('photo-1480714378408-67cf0d13bc1b', 1600),
  contact: u('photo-1600585154340-be6161a56a0c', 1400),

  propertyFallback: u('photo-1512917774080-9991f1c4c750', 1200),
  blogFallback: u('photo-1497366754035-f200968a6e72', 1200),

  neighbourhoods: {
    'eko-atlantic': u('photo-1477959858617-67f85cf4f1df', 1200),
    ikoyi: u('photo-1600607687939-ce8a6c25118c', 1200),
    'victoria-island': u('photo-1494526585095-c41746248156', 1200),
    'lekki-phase-1': u('photo-1512453979798-5ea266f8880c', 1200),
  },

  advisors: [
    u('photo-1560250097-0b93528c311a', 800),
    u('photo-1573496359142-b8d87734a5a2', 800),
    u('photo-1472099645785-5658abf4ff4e', 800),
    u('photo-1580489944761-15a19d654956', 800),
  ],
} as const;

/** Default asset image when a listing has none (brand-fallback layer). */
export const FALLBACK_IMAGE = IMAGES.propertyFallback;