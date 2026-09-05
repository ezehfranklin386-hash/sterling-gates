// Reusable Intelligence-Brief capture. Used on the Home hero and Intelligence
// section (docs/08-public-site-spec.md §3.7).

import { useState, type FormEvent } from 'react';
import { FiSend } from 'react-icons/fi';
import { useSubscribe } from '../../hooks/useNewsletter';
import { useToast } from '../ui/Toast';
import { BRAND } from '../../lib/brand';

export function NewsletterCapture({ compact = false }: { compact?: boolean }) {
  const subscribe = useSubscribe();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(false);
    try {
      await subscribe.mutateAsync(email);
      setDone(true);
      toast('Subscribed to the Brief.');
    } catch {
      setError(true);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-brass">Thank you — you are subscribed to the Brief.</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? '' : 'max-w-sm'}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          className="flex-1 border border-parchment/25 bg-emerald-light px-4 py-3 text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brass px-6 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-emerald transition-colors hover:bg-parchment disabled:opacity-60"
        >
          {subscribe.isPending ? 'Subscribing…' : BRAND.intelligence.cta}
          {!subscribe.isPending && <FiSend className="h-3.5 w-3.5" />}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-brass">Could not subscribe. Please try again.</p>
      ) : null}
    </form>
  );
}