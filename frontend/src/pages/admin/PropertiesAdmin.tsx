// Properties admin: list + create/edit (PropertyEditor) + delete-with-confirm.
// Requirement: admin can post properties.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminProperties, useDeleteProperty } from '../../hooks/useProperties';
import { getAccessToken } from '../../lib/session';
import { displayPrice } from '../../lib/format';
import { Button } from '../../components/ui/primitives';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Table, THead, Th, Td, TRow } from '../../components/admin/Table';
import { useToast } from '../../components/ui/Toast';

export function PropertiesAdmin() {
  const token = getAccessToken();
  const { data, isLoading } = useAdminProperties(token);
  const del = useDeleteProperty(token!);
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);

  const items = data ?? [];

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="display text-2xl text-parchment md:text-3xl">Properties</h1>
          <p className="mt-1 text-sm text-parchment/60">Publish and manage listings.</p>
        </div>
        <Link to="/admin/properties/new">
          <Button>New property</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-parchment/60">No properties yet.</p>
      ) : (
        <div className="mt-8">
          <Table>
            <THead>
              <Th>Title</Th>
              <Th className="hidden sm:table-cell">Area</Th>
              <Th className="hidden md:table-cell">Class</Th>
              <Th className="hidden sm:table-cell">Status</Th>
              <Th className="hidden sm:table-cell">Published</Th>
              <Th>Actions</Th>
            </THead>
            <tbody>
              {items.map((p) => (
                <TRow key={p.id}>
                  <Td>
                    <Link to={`/admin/properties/${p.id}`} className="text-parchment hover:text-brass">
                      {p.title}
                    </Link>
                    <span className="block text-xs text-parchment/40">{displayPrice(p)}</span>
                  </Td>
                  <Td className="hidden sm:table-cell">{p.area ?? '—'}</Td>
                  <Td className="hidden md:table-cell">{p.assetClass}</Td>
                  <Td className="hidden sm:table-cell">{p.status}</Td>
                  <Td className="hidden sm:table-cell">{p.published ? 'Yes' : 'Draft'}</Td>
                  <Td>
                    <button
                      onClick={() => setPending(p.id)}
                      className="text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment"
                    >
                      Delete
                    </button>
                  </Td>
                </TRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        title="Delete property"
        body="This permanently removes the listing. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) {
            del.mutate(pending, {
              onSuccess: () => toast('Property deleted.'),
              onError: () => toast('Delete failed.'),
            });
            setPending(null);
          }
        }}
      />
    </div>
  );
}