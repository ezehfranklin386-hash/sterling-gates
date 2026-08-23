// Site footer: brand, tagline, live WhatsApp/email contact from settings,
// newsletter capture, legal line.

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { BRAND, CONTACT_EMAIL } from '../../lib/brand';
import { useSettings } from '../../hooks/useSettings';
import { useSubscribe } from '../../hooks/useNewsletter';
import { useToast } from '../ui/Toast';
import { Monogram } from '../brand/Brand';

export function Footer() {
  return <FooterInner />;
}

function FooterInner() {
  const { data: settings } = useSettings();
  const subscribe = useSubscribe();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  async function onSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribe.mutateAsync(email);
      setDone(true);
      toast('Subscribed to the Brief.');
    } catch {
      toast('Subscription failed. Please try again.');
    }
  }

  return (
    <footer className="border-t border-parchment/10 bg-emerald-darker">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Monogram />
            <span className="font-display text-xl text-parchment">Sterling Gates</span>
          </div>
          <p className="mt-3 font-display text-lg italic text-brass">{BRAND.tagline}</p>
          <p className="mt-3 max-w-md text-sm text-parchment/60">
            {BRAND.locations.lagos}. {BRAND.locations.london}. {BRAND.locations.note}
          </p>
        </div>

        <div>
          <h4 className="text-[0.7rem] uppercase tracking-[0.2em] text-gold">Navigate</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {BRAND.footer.nav.map((label) => {
              const to =
                label.toLowerCase() === 'home'
                  ? '/'
                  : `/${label.toLowerCase()}`;
              return (
                <li key={label}>
                  <Link to={to} className="text-parchment/70 hover:text-brass">
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-2.5 text-sm">
            <a
              href={`mailto:${settings?.adminEmail ?? CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2.5 text-parchment/70 transition-colors hover:text-brass"
            >
              <FiMail className="h-4 w-4 text-gold" />
              {settings?.adminEmail ?? CONTACT_EMAIL}
            </a>
            {settings?.contactPhoneLabel ? (
              <p className="inline-flex items-center gap-2.5 text-parchment/70">
                <FiPhone className="h-4 w-4 text-gold" />
                {settings.contactPhoneLabel}
              </p>
            ) : null}
            {settings?.whatsappLink ? (
              <a
                href={settings.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 text-parchment/70 transition-colors hover:text-brass"
              >
                <FaWhatsapp className="h-4 w-4 text-gold" />
                WhatsApp
              </a>
            ) : null}
            <p className="inline-flex items-center gap-2.5 text-parchment/70">
              <FiMapPin className="h-4 w-4 text-gold" />
              Lagos · London
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-[0.7rem] uppercase tracking-[0.2em] text-gold">
            {BRAND.intelligence.subscribe}
          </h4>
          <p className="mt-3 text-sm text-parchment/60">Global legacy-asset market intelligence, edited for a select list.</p>
          {done ? (
            <p className="mt-4 text-sm text-brass">Thank you. You're subscribed.</p>
          ) : (
            <form onSubmit={onSubscribe} className="mt-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full border border-parchment/20 bg-emerald-light px-3 py-2 text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-brass px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] text-emerald transition-all hover:bg-parchment"
              >
                Subscribe
                <FiArrowUpRight />
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="border-t border-parchment/10 px-5 py-5 text-center text-[0.7rem] uppercase tracking-[0.15em] text-parchment/40">
        {BRAND.footer.legal}
      </div>
    </footer>
  );
}