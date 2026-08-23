// Small admin stats/utility components: StatTile + ImageUploader.

import { useRef, useState } from 'react';
import { getAccessToken } from '../../lib/session';
import { api } from '../../lib/api';

export function StatTile({
  label,
  value,
  to,
}: {
  label: string;
  value: number | undefined;
  to: string;
}) {
  return (
    <a
      href={to}
      className="block border border-parchment/10 bg-emerald-light p-6 transition-colors hover:border-gold/40"
    >
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-gold">{label}</p>
      <p className="display mt-2 text-4xl text-brass">{value ?? '–'}</p>
    </a>
  );
}

interface ImageUploaderProps {
  label: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
}

/** Uploads an image via POST /api/uploads and reports the returned public URL. */
export function ImageUploader({ label, currentUrl, onUploaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const token = getAccessToken();
      const url = await api.uploadImage(file, token!);
      onUploaded(url);
    } catch {
      setError('Upload failed. Check the backend is running and you are signed in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-block border border-gold/50 px-4 py-2 text-[0.7rem] uppercase tracking-[0.15em] text-brass hover:bg-gold/10"
        disabled={busy}
      >
        {busy ? 'Uploading…' : 'Upload image'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {currentUrl ? (
        <img src={currentUrl} alt={label} className="mt-3 h-32 w-48 object-cover" />
      ) : null}
      {error ? <p className="mt-2 text-xs text-brass">{error}</p> : null}
    </div>
  );
}