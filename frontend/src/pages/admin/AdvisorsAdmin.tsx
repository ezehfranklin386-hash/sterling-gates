// Advisors admin: create/edit/delete with photo upload + sort order + published.
// Publishing an advisor makes them appear on the public /advisors grid.

import { useState, type FormEvent } from 'react';
import { useAdminAdvisors, useCreateAdvisor, useUpdateAdvisor, useDeleteAdvisor } from '../../hooks/useAdvisors';
import { getAccessToken } from '../../lib/session';
import { Button, FieldLabel, Input, Textarea, Toggle } from '../../components/ui/primitives';
import { ImageUploader } from '../../components/admin/AdminUI';
import { Table, THead, Th, Td, TRow } from '../../components/admin/Table';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import type { Advisor } from '../../lib/types';

export function AdvisorsAdmin() {
  const token = getAccessToken()!;
  const { data } = useAdminAdvisors(token);
  const del = useDeleteAdvisor(token);
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editor, setEditor] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const items = (data ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="display text-3xl text-parchment">Advisors</h1>
          <p className="mt-1 text-sm text-parchment/60">Team profiles shown on the public site.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setEditor(true); }}>New advisor</Button>
      </div>

      {editor ? (
        <AdvisorEditor
          key={editingId ?? 'new'}
          token={token}
          initial={editingId ? items.find((a) => a.id === editingId) : undefined}
          maxOrder={items.length}
          onDone={() => setEditor(false)}
        />
      ) : (
        <div className="mt-8">
          <Table>
            <THead>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>Order</Th>
              <Th>Published</Th>
              <Th>Actions</Th>
            </THead>
            <tbody>
              {items.map((a) => (
                <TRow key={a.id}>
                  <Td className="text-parchment">{a.name}</Td>
                  <Td>{a.role}</Td>
                  <Td>{a.sortOrder}</Td>
                  <Td>{a.published ? 'Yes' : 'Draft'}</Td>
                  <Td>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                      <button onClick={() => { setEditingId(a.id); setEditor(true); }} className="text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment">
                        Edit
                      </button>
                      <button onClick={() => setPendingDelete(a.id)} className="text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment">
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
        title="Delete advisor"
        body="This removes the advisor profile. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            del.mutate(pendingDelete, {
              onSuccess: () => toast('Advisor deleted.'),
              onError: () => toast('Delete failed.'),
            });
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}

function AdvisorEditor({
  token,
  initial,
  maxOrder,
  onDone,
}: {
  token: string;
  initial?: Advisor;
  maxOrder: number;
  onDone: () => void;
}) {
  const create = useCreateAdvisor(token);
  const update = useUpdateAdvisor(token);
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<Advisor>>({
    name: initial?.name ?? '',
    role: initial?.role ?? '',
    bio: initial?.bio ?? '',
    photoUrl: initial?.photoUrl ?? '',
    focus: initial?.focus ?? [],
    sortOrder: initial?.sortOrder ?? maxOrder + 1,
    published: initial?.published ?? false,
  });
  const [focusInput, setFocusInput] = useState((initial?.focus ?? []).join(', '));

  const set = <K extends keyof Advisor>(key: K, value: Advisor[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = { ...form, focus: focusInput.split(',').map((s) => s.trim()).filter(Boolean) };
    try {
      if (initial) {
        await update.mutateAsync({ id: initial.id, body: payload });
        toast('Advisor saved.');
      } else {
        await create.mutateAsync(payload);
        toast('Advisor created.');
      }
      onDone();
    } catch {
      toast('Save failed.');
    }
  }

  return (
    <div className="mt-8 max-w-full sm:max-w-2xl border border-parchment/10 bg-emerald-light p-7">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
          <div>
            <FieldLabel>Name</FieldLabel>
            <Input required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Role</FieldLabel>
            <Input value={form.role} onChange={(e) => set('role', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
          <div>
            <FieldLabel>Sort order</FieldLabel>
            <Input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
          </div>
          <div>
            <FieldLabel>Focus (comma-separated)</FieldLabel>
            <Input value={focusInput} onChange={(e) => setFocusInput(e.target.value)} />
          </div>
        </div>
        <div>
          <FieldLabel>Bio</FieldLabel>
          <Textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Photo</FieldLabel>
          <ImageUploader label="Photo" currentUrl={form.photoUrl} onUploaded={(url) => set('photoUrl', url)} />
        </div>
        <Toggle checked={!!form.published} onChange={(v) => set('published', v)} label="Published" />
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button type="submit" disabled={create.isPending || update.isPending}>Save</Button>
          <Button variant="ghost" type="button" onClick={onDone}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}