// The Advisors (§3.10): grid of public advisor profiles, each with a private
// enquiry link to /contact.

import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { useAdvisors } from '../../hooks/useAdvisors';
import { IMAGES } from '../../lib/images';
import { SectionLabel, DisplayHeading } from '../../components/brand/Brand';
import { Reveal } from '../../components/ui/Reveal';
import { SmartImage } from '../../components/ui/SmartImage';

export function Advisors() {
  const { data, isLoading } = useAdvisors();
  const items = (data?.items ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionLabel>Team</SectionLabel>
      <DisplayHeading className="mt-3">The Advisors</DisplayHeading>
      <p className="editorial mt-3 max-w-2xl text-parchment/70">
        The principals who advise on your legacy assets. Each enquiry is handled by a named
        advisor, never a desk.
      </p>

      {isLoading ? (
        <p className="mt-10 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-parchment/60">Advisors to be introduced shortly.</p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((a, i) => (
            <Reveal key={a.id} delay={i * 80}>
              <div className="group border border-parchment/10 bg-emerald-light transition-colors hover:border-gold/40">
                <div className="aspect-square overflow-hidden bg-emerald-light">
                  <SmartImage
                    src={a.photoUrl ?? IMAGES.advisors[i % IMAGES.advisors.length]}
                    alt={a.name}
                    className="h-full w-full"
                  />
                </div>
                <div className="p-5">
                  <h3 className="display text-xl text-parchment">{a.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.15em] text-gold">{a.role}</p>
                  {a.focus?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.focus.map((f) => (
                        <span key={f} className="text-[0.6rem] uppercase tracking-[0.12em] text-parchment/50">
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-3 line-clamp-3 text-sm text-parchment/70">{a.bio}</p>
                  <Link
                    to={`/contact?advisor=${a.name}`}
                    className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-brass hover:text-parchment"
                  >
                    Private enquiry
                    <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}