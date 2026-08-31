// Enquiries admin: list, filter New/Followed-up, mark followed up, copy wa.me.

import { useState } from 'react';
import { useEnquiries, useMarkEnquiry } from '../../hooks/useEnquiries';
import { getAccessToken } from '../../lib/session';
import { formatDate } from '../../lib/format';
import { Button } from '../../components/ui/primitives';
import { Table, THead, Th, Td, TRow } from '../../components/admin/Table';
import { useToast } from '../../components/ui/Toast';

export function EnquiriesAdmin() {
  const token = getAccessToken();
  const [filter, setFilter] = useState<'all' | 'new' | 'followed_up'>('all');
  const { data, isLoading } = useEnquiries(token, filter === 'all' ? undefined : filter);
  const mark = useMarkEnquiry(token!);
  const { toast } = useToast();

  const items = data ?? [];

  return (
    <div>
      <h1 className="display text-2xl text-parchment md:text-3xl">Enquiries</h1>
      <p className="mt-1 text-sm text-parchment/60">Leads from the public contact form.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {(['all', 'new', 'followed_up'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.15em] ${
              filter === f ? 'bg-brass text-emerald' : 'border border-parchment/20 text-parchment/70 hover:text-parchment'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-parchment/60">No enquiries.</p>
      ) : (
        <div className="mt-6">
          <Table>
            <THead>
              <Th>Name</Th>
              <Th className="hidden sm:table-cell">Archetype</Th>
              <Th className="hidden md:table-cell">Message</Th>
              <Th className="hidden sm:table-cell">Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </THead>
            <tbody>
              {items.map((enq) => (
                <TRow key={enq.id}>
                  <Td>
                    <span className="text-parchment">{enq.name}</span>
                    <a href={`mailto:${enq.email}`} className="block text-xs text-brass">{enq.email}</a>
                  </Td>
                  <Td className="capitalize hidden sm:table-cell">{enq.archetype}</Td>
                  <Td className="hidden md:table-cell max-w-xs">
                    <span className="line-clamp-2 text-parchment/70">
                      {enq.propertySlug ? `[${enq.propertySlug}] ` : ''}{enq.message}
                    </span>
                  </Td>
                  <Td className="hidden sm:table-cell">{formatDate(enq.createdAt)}</Td>
                  <Td className={enq.status === 'new' ? 'text-brass' : 'text-parchment/50'}>
                    {enq.status.replace('_', ' ')}
                  </Td>
                  <Td>
                    {enq.status === 'new' ? (
                      <Button
                        variant="ghost"
                        className="text-[0.6rem] px-3 py-1"
                        onClick={() =>
                          mark.mutate(enq.id, {
                            onSuccess: () => toast('Marked as followed up.'),
                            onError: () => toast('Update failed.'),
                          })
                        }
                      >
                        Mark followed up
                      </Button>
                    ) : null}
                  </Td>
                </TRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}