// Settings admin — the contact-number requirement: edit display label + link
// number, admin email, toggles, with a live wa.me preview.

import { useEffect, useState, type FormEvent } from 'react';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import { getAccessToken } from '../../lib/session';
import { Button, FieldLabel, Input, Toggle } from '../../components/ui/primitives';
import { useToast } from '../../components/ui/Toast';
import type { PublicSettings } from '../../lib/types';

function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function SettingsAdmin() {
  const { data: rawData } = useSettings();
  const data = rawData as PublicSettings | undefined;
  const update = useUpdateSettings();
  const token = getAccessToken()!;
  const { toast } = useToast();

  const [contactPhone, setContactPhone] = useState('');
  const [contactPhoneLabel, setContactPhoneLabel] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [emailsEnabled, setEmailsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready || !data) return;
    setContactPhone(data.contactPhone ?? '');
    setContactPhoneLabel(data.contactPhoneLabel ?? '');
    setAdminEmail(data.adminEmail ?? '');
    setEmailsEnabled(data.emailsEnabled ?? true);
    setWhatsappEnabled(data.whatsappEnabled ?? true);
    setReady(true);
  }, [data, ready]);

  const normalized = sanitizePhone(contactPhone);
  const preview = whatsappEnabled && normalized ? `https://wa.me/${normalized}` : null;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({
        body: {
          contactPhone: normalized,
          contactPhoneLabel,
          adminEmail,
          emailsEnabled,
          whatsappEnabled,
        },
        token,
      });
      toast('Settings saved.');
    } catch {
      toast('Save failed.');
    }
  }

  return (
    <div className="max-w-full sm:max-w-2xl">
      <h1 className="display text-3xl text-parchment">Settings</h1>
      <p className="mt-1 text-sm text-parchment/60">
        The contact number here is what clients see and how the enquiry's WhatsApp link is built.
      </p>

      <form onSubmit={onSave} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 border border-parchment/10 bg-emerald-light p-7">
        <div>
          <FieldLabel>Contact number (display form)</FieldLabel>
          <Input value={contactPhoneLabel} onChange={(e) => setContactPhoneLabel(e.target.value)} placeholder="+234 801 234 5678" />
          <p className="mt-1 text-xs text-parchment/50">As shown to clients on the site.</p>
        </div>
        <div>
          <FieldLabel>Contact number (for WhatsApp links)</FieldLabel>
          <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="2348012345678" />
          <p className="mt-1 text-xs text-parchment/50">Digits only; the wa.me link is built from this.</p>
        </div>
        <div>
          <FieldLabel>Admin email (receives enquiry emails)</FieldLabel>
          <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="enquiries@sterlinggates.ng" />
        </div>
        <div className="flex flex-col gap-4">
          <Toggle checked={emailsEnabled} onChange={setEmailsEnabled} label="Email enquiries to admin" />
          <Toggle checked={whatsappEnabled} onChange={setWhatsappEnabled} label="Show WhatsApp link on submissions" />
        </div>

        {/* Live preview */}
        <div className="border border-gold/30 bg-emerald-darker p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-gold">Live preview</p>
          <p className="mt-2 text-sm text-parchment">{contactPhoneLabel || '—'}</p>
          {preview ? (
            <a href={preview} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-brass hover:text-parchment">
              {preview}
            </a>
          ) : (
            <p className="mt-1 text-xs text-parchment/40">Enter a number to generate the link.</p>
          )}
        </div>

        <Button type="submit" disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save settings'}</Button>
      </form>
    </div>
  );
}
