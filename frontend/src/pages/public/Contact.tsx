// Contact / enquiry flow (§3.6, docs/09-enquiry-workflow.md). On success show a
// confirmation, a "Continue on WhatsApp" button (backend-built wa.me link) and
// live contact details from settings. Reads `?property=<slug>` to pre-fill.

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiArrowUpRight, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSubmitEnquiry } from '../../hooks/useEnquiries';
import { useSettings } from '../../hooks/useSettings';
import { ARCHETYPE_OPTIONS, BRAND, CONTACT_EMAIL } from '../../lib/brand';
import { IMAGES } from '../../lib/images';
import type { EnquiryResult } from '../../lib/types';
import { SectionLabel, DisplayHeading } from '../../components/brand/Brand';
import { Button, FieldError, FieldLabel, Input, Select, Textarea } from '../../components/ui/primitives';

interface FormState {
  name: string;
  email: string;
  archetype: string;
  message: string;
}

const EMPTY: FormState = { name: '', email: '', archetype: 'sovereign', message: '' };

export function Contact() {
  const [params] = useSearchParams();
  const property = params.get('property');
  const submit = useSubmitEnquiry();
  const { data: settings } = useSettings();

  const [form, setForm] = useState<FormState>(() =>
    property
      ? { ...EMPTY, message: `I would like to enquire privately about the property at ${property}.` }
      : EMPTY,
  );
  const [result, setResult] = useState<EnquiryResult | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const archetypeLabel = useMemo(
    () => ARCHETYPE_OPTIONS.find((o) => o.key === form.archetype)?.label ?? '',
    [form.archetype],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await submit.mutateAsync({
        ...form,
        propertySlug: property ?? undefined,
      });
      setResult(res);
    } catch {
      /* mutation error surfaced by ApiError; keep form for retry */
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <SectionLabel className="justify-center">Received</SectionLabel>
        <DisplayHeading className="mt-4">Thank you, {form.name.split(' ')[0]}.</DisplayHeading>
        <p className="editorial mt-4 text-parchment/75">
          We will be in touch shortly. {form.archetype === 'other' ? '' : `As an ${archetypeLabel} enquiry, your consideration will be handled with your expected discretion.`}
        </p>
        {result.whatsappLink ? (
          <div className="mt-8">
            <a href={result.whatsappLink} target="_blank" rel="noreferrer">
              <Button size="lg">
                Continue on WhatsApp
                <FaWhatsapp className="h-4 w-4" />
              </Button>
            </a>
          </div>
        ) : null}
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-parchment/50">
          {result.emailSent ? 'A confirmation email has been sent.' : 'Prefer email? We have your address on file.'}
        </p>
        <p className="mt-10 text-sm text-parchment/60">
          Direct line: <span className="text-brass">{settings?.contactPhoneLabel}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <SectionLabel>Engage</SectionLabel>
      <DisplayHeading className="mt-3">Begin the conversation.</DisplayHeading>
      <p className="editorial mt-3 max-w-2xl text-parchment/70">
        Every enquiry is handled directly by an advisor, never a desk. Tell us which
        archetype you represent and how we may serve you.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
        <form onSubmit={onSubmit} className="space-y-5 md:col-span-2">
          <div>
            <FieldLabel>Name</FieldLabel>
            <Input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <FieldLabel>Client archetype</FieldLabel>
            <Select value={form.archetype} onChange={(e) => set('archetype', e.target.value)}>
              {ARCHETYPE_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </Select>
            <FieldError>{ARCHETYPE_OPTIONS.find((o) => o.key === form.archetype)?.description}</FieldError>
          </div>
          <div>
            <FieldLabel>Message</FieldLabel>
            <Textarea required value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="How may we assist you?" />
          </div>
          <Button type="submit" disabled={submit.isPending}>
            {submit.isPending ? 'Sending…' : 'Submit Enquiry'}
            {!submit.isPending && <FiArrowUpRight />}
          </Button>
          {submit.isError ? (
            <p className="text-sm text-brass">There was an error sending your enquiry. Please try again.</p>
          ) : null}
        </form>

        <aside className="space-y-6 border border-parchment/10 bg-emerald-light p-0">
          <div className="relative h-44 overflow-hidden">
            <img src={IMAGES.contact} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald/80 to-transparent" />
          </div>
          <div className="space-y-6 px-6 pb-6">
            <div>
              <p className="eyebrow">Direct</p>
              <p className="mt-2 inline-flex items-center gap-2 text-parchment">
                <FiPhone className="h-4 w-4 text-gold" />
                {settings?.contactPhoneLabel ?? '—'}
              </p>
              {settings?.whatsappLink ? (
                <a
                  href={settings.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm text-brass hover:text-parchment"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  WhatsApp
                </a>
              ) : null}
            </div>
            <div>
              <p className="eyebrow">Email</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-2 inline-flex items-center gap-2 text-sm text-brass hover:text-parchment"
              >
                <FiMail className="h-4 w-4 text-gold" />
                {CONTACT_EMAIL}
              </a>
            </div>
            <div>
              <p className="eyebrow">Locations</p>
              <p className="mt-2 inline-flex items-start gap-2 text-sm text-parchment/70">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {BRAND.locations.lagos}
              </p>
              <p className="mt-1 inline-flex items-start gap-2 text-sm text-parchment/70">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {BRAND.locations.london}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}