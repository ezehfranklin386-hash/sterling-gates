// Home page — sections mirroring docs/08-public-site-spec.md §3.1 + §3.7/3.9:
// hero, philosophy, services, archetypes, intelligence (newsletter), featured
// properties, latest insights, contact CTA.

import { Link } from 'react-router-dom';
import { FiArrowDown, FiArrowUpRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { BRAND, CONTACT_EMAIL } from '../../lib/brand';
import { useLatestForHome } from '../../hooks/useHomeData';
import { useSettings } from '../../hooks/useSettings';
import { IMAGES } from '../../lib/images';
import { Reveal } from '../../components/ui/Reveal';
import { Button } from '../../components/ui/primitives';
import {
  SectionLabel,
  DisplayHeading,
  BodyText,
} from '../../components/brand/Brand';
import { NewsletterCapture } from '../../components/sections/NewsletterCapture';
import { PropertyCard, BlogCard } from '../../components/cards/Cards';

export function Home() {
  const { featured, latestPosts } = useLatestForHome();
  const { data: settings } = useSettings();

  return (
    <>
      {/* 1. Hero — full-bleed photography */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center">
        <div className="absolute inset-0" aria-hidden="true">
          <img src={IMAGES.hero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald/80 via-emerald/70 to-emerald" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_0%,transparent,rgba(17,27,24,0.5))]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel className="justify-center">{BRAND.outlook}</SectionLabel>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display mx-auto mt-6 max-w-4xl text-5xl leading-tight text-parchment md:text-7xl">
              {BRAND.hero.headline}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="editorial mx-auto mt-8 max-w-2xl text-lg text-parchment/80">
              {BRAND.hero.sub}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/contact" className="group">
                <Button size="lg">
                  {BRAND.hero.ctaPrimary}
                  <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </Link>
              <a href="#philosophy">
                <Button size="lg" variant="outline">
                  {BRAND.hero.ctaSecondary}
                  <FiArrowDown />
                </Button>
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-parchment/20 pt-6 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-parchment/60">
              {BRAND.hero.meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
              {settings?.whatsappLink ? (
                <a
                  href={settings.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-brass"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Newsletter — §3.7 (Intelligence band) */}
      <section className="relative overflow-hidden border-b border-parchment/10 px-5 py-16">
        <div className="absolute inset-0" aria-hidden="true">
          <img src={IMAGES.intelligence} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-emerald/90" />
        </div>
        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <SectionLabel>{BRAND.intelligence.eyebrow}</SectionLabel>
            <h2 className="display mt-3 text-3xl text-parchment">{BRAND.intelligence.title}</h2>
            <p className="mt-2 max-w-lg text-parchment/70">{BRAND.intelligence.body}</p>
          </div>
          <NewsletterCapture compact />
        </div>
      </section>

      {/* 2. Philosophy */}
      <section id="philosophy" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <Reveal>
              <div className="relative overflow-hidden">
                <img src={IMAGES.philosophy} alt="Interior of a considered legacy residence" className="aspect-[4/5] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald/60 to-transparent" />
                <div className="absolute bottom-5 left-5 border border-gold/40 bg-emerald/70 px-4 py-3 backdrop-blur-sm">
                  <p className="font-display text-sm italic text-brass">{BRAND.tagline}</p>
                </div>
              </div>
            </Reveal>
            <div>
              <Reveal>
                <SectionLabel>Philosophy</SectionLabel>
                <DisplayHeading className="mt-4">{BRAND.philosophy.headline}</DisplayHeading>
              </Reveal>
              <div className="mt-10 space-y-8">
                {BRAND.philosophy.pillars.map((p, i) => (
                  <Reveal key={p.numeral} delay={i * 120}>
                    <div className="flex gap-5 border-b border-parchment/10 pb-8">
                      <span className="font-display text-4xl leading-none text-brass/70">{p.numeral}</span>
                      <div>
                        <h3 className="display text-xl text-parchment">{p.title}</h3>
                        <BodyText className="mt-2 text-sm">{p.body}</BodyText>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Services */}
      <section className="relative overflow-hidden border-t border-parchment/10 px-5 py-24">
        <div className="absolute inset-0" aria-hidden="true">
          <img src={IMAGES.services} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-emerald/80" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <SectionLabel>{BRAND.services.eyebrow}</SectionLabel>
            <DisplayHeading className="mt-4">{BRAND.services.title}</DisplayHeading>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-px bg-parchment/10 sm:grid-cols-2 lg:grid-cols-3">
            {BRAND.services.items.map((s, i) => (
              <Reveal key={s} delay={(i % 3) * 80}>
                <div className="group flex items-center gap-4 bg-emerald-light/95 p-5 backdrop-blur-sm transition-colors hover:bg-emerald-darker">
                  <span className="font-sans text-sm text-gold transition-colors group-hover:text-brass">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="editorial text-parchment/85 group-hover:text-parchment">{s}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Archetypes */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionLabel>{BRAND.archetypes.eyebrow}</SectionLabel>
            <DisplayHeading className="mt-4">{BRAND.archetypes.title}</DisplayHeading>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {BRAND.archetypes.items.map((a, i) => (
              <Reveal key={a.key} delay={i * 120}>
                <div className="border border-parchment/10 p-7 transition-colors hover:border-gold/40">
                  <h3 className="display text-xl text-brass">{a.label}</h3>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.18em] text-gold">{a.tag}</p>
                  <BodyText className="mt-4 text-sm">{a.body}</BodyText>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured properties */}
      <section className="border-t border-parchment/10 bg-emerald-light px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <div>
              <SectionLabel>Showcase</SectionLabel>
              <DisplayHeading className="mt-4">Featured Properties</DisplayHeading>
            </div>
            <Link to="/properties" className="group hidden items-center gap-2 text-xs uppercase tracking-[0.18em] text-brass hover:text-parchment md:inline-flex">
              View all
              <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {(featured.data?.items ?? []).slice(0, 3).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Latest insights */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <div>
              <SectionLabel>Perspective</SectionLabel>
              <DisplayHeading className="mt-4">Latest Insights</DisplayHeading>
            </div>
            <Link to="/insights" className="group hidden items-center gap-2 text-xs uppercase tracking-[0.18em] text-brass hover:text-parchment md:inline-flex">
              All articles
              <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {(latestPosts.data?.items ?? []).slice(0, 3).map((b) => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Contact CTA */}
      <section className="relative overflow-hidden border-t border-parchment/10 px-5 py-28 text-center">
        <div className="absolute inset-0" aria-hidden="true">
          <img src={IMAGES.contact} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald via-emerald/85 to-emerald" />
        </div>
        <div className="relative mx-auto max-w-2xl">
          <Reveal>
            <SectionLabel className="justify-center">{BRAND.contactCta.eyebrow}</SectionLabel>
            <DisplayHeading className="mt-4">{BRAND.contactCta.title}</DisplayHeading>
            <p className="editorial mt-4 text-parchment/75">
              {settings?.contactPhoneLabel ?? ''}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/contact" className="group">
                <Button size="lg">
                  {BRAND.contactCta.button}
                  <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </Link>
              {settings?.whatsappLink ? (
                <a href={settings.whatsappLink} target="_blank" rel="noreferrer">
                  <Button size="lg" variant="outline">
                    <FaWhatsapp className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              ) : null}
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-parchment/60">
              <FiArrowUpRight className="h-4 w-4" />
              <a href={`mailto:${settings?.adminEmail ?? CONTACT_EMAIL}`} className="hover:text-brass">{settings?.adminEmail ?? CONTACT_EMAIL}</a>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}