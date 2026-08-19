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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-3xl text-parchment">Properties</h1>
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
              <Th>Area</Th>
              <Th>Class</Th>
              <Th>Status</Th>
              <Th>Published</Th>
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
                  <Td>{p.area ?? '—'}</Td>
                  <Td>{p.assetClass}</Td>
                  <Td>{p.status}</Td>
                  <Td>{p.published ? 'Yes' : 'Draft'}</Td>
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