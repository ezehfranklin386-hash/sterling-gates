// Curations admin: list + create/edit (filter builder) + delete-with-confirm.

import { useState, type FormEvent } from 'react';
import { useAdminCurations, useCreateCuration, useUpdateCuration, useDeleteCuration } from '../../hooks/useCurations';
import { getAccessToken } from '../../lib/session';
import { slugify } from '../../lib/format';
import { AREAS, ASSET_CLASSES, PROPERTY_STATUSES } from '../../lib/brand';
import { Button, FieldLabel, Input, Textarea, Select, Toggle } from '../../components/ui/primitives';
import { Table, THead, Th, Td, TRow } from '../../components/admin/Table';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import type { Curation, CurationFilter } from '../../lib/types';

export function CurationsAdmin() {
  const token = getAccessToken()!;
  const { data } = useAdminCurations(token);
  const del = useDeleteCuration(token);
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [editor, setEditor] = useState(false);

  const items = data ?? [];

  function startNew() {
    setEditingId(null);
    setEditor(true);
  }

  function startEdit(id: string) {
    setEditingId(id);
    setEditor(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl text-parchment md:text-3xl">Curations</h1>
          <p className="mt-1 text-sm text-parchment/60">Curated property collections.</p>
        </div>
        <Button onClick={startNew}>New collection</Button>
      </div>

      {editor ? (
        <CurationEditor
          key={editingId ?? 'new'}
          token={token}
          initial={editingId ? items.find((c) => c.id === editingId) : undefined}
          onDone={() => setEditor(false)}
        />
      ) : (
        <div className="mt-8">
          <Table>
            <THead>
              <Th>Title</Th>
              <Th className="hidden sm:table-cell">Filter</Th>
              <Th>Published</Th>
              <Th>Actions</Th>
            </THead>
            <tbody>
              {items.map((c) => (
                <TRow key={c.id}>
                  <Td className="text-parchment">{c.title}</Td>
                  <Td className="hidden sm:table-cell text-xs text-parchment/60">{describeFilter(c.filter)}</Td>
                  <Td>{c.published ? 'Yes' : 'Draft'}</Td>
                  <Td>
                    <div className="flex gap-2 sm:gap-4">
                      <button onClick={() => startEdit(c.id)} className="text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment">
                        Edit
                      </button>
                      <button onClick={() => setPendingDelete(c.id)} className="text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment">
                        Delete
                      </button>
                    </div>
                  </Td>
                </TRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete collection"
        body="This removes the curated collection. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            del.mutate(pendingDelete, {
              onSuccess: () => toast('Collection deleted.'),
              onError: () => toast('Delete failed.'),
            });
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}

function describeFilter(f?: CurationFilter): string {
  if (!f) return '—';
  const parts = [f.assetClass, f.area, f.status, f.offMarket ? 'off-market' : undefined].filter(Boolean);
  return parts.join(' · ') || 'All properties';
}

function CurationEditor({
  token,
  initial,
  onDone,
}: {
  token: string;
  initial?: Curation;
  onDone: () => void;
}) {
  const create = useCreateCuration(token);
  const update = useUpdateCuration(token);
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<Curation>>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    published: initial?.published ?? false,
    filter: initial?.filter ?? {},
  });

  const set = <K extends keyof Curation>(key: K, value: Curation[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setFilter = (patch: Partial<CurationFilter>) =>
    setForm((f) => ({ ...f, filter: { ...(f.filter ?? {}), ...patch } }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || slugify(form.title ?? '') };
    try {
      if (initial) {
        await update.mutateAsync({ id: initial.id, body: payload });
        toast('Collection saved.');
      } else {
        await create.mutateAsync(payload);
        toast('Collection created.');
      }
      onDone();
    } catch {
      toast('Save failed.');
    }
  }

  return (
    <div className="mt-8 max-w-2xl border border-parchment/10 bg-emerald-light p-7">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <FieldLabel>Title</FieldLabel>
          <Input required value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Slug</FieldLabel>
          <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-from-title" />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Filter · asset class</FieldLabel>
            <Select value={form.filter?.assetClass ?? ''} onChange={(e) => setFilter({ assetClass: (e.target.value || undefined) as CurationFilter['assetClass'] })}>
              <option value="">Any</option>
              {ASSET_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel>Filter · area</FieldLabel>
            <Select value={form.filter?.area ?? ''} onChange={(e) => setFilter({ area: e.target.value || undefined })}>
              <option value="">Any</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel>Filter · status</FieldLabel>
            <Select value={form.filter?.status ?? ''} onChange={(e) => setFilter({ status: (e.target.value || undefined) as CurationFilter['status'] })}>
              <option value="">Any</option>
              {PROPERTY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-3 pt-6">
            <Toggle checked={!!form.filter?.offMarket} onChange={(v) => setFilter({ offMarket: v || undefined })} label="Off-market" />
            <Toggle checked={!!form.filter?.featured} onChange={(v) => setFilter({ featured: v || undefined })} label="Featured" />
          </div>
        </div>

        <Toggle checked={!!form.published} onChange={(v) => set('published', v)} label="Published" />
        <div className="flex gap-3">
          <Button type="submit" disabled={create.isPending || update.isPending}>Save</Button>
          <Button variant="ghost" type="button" onClick={onDone}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}