// Newsletter (Intelligence Brief) admin: list subscribers + remove.

import { useNewsletterSubscribers, useRemoveSubscriber } from '../../hooks/useNewsletter';
import { getAccessToken } from '../../lib/session';
import { formatDate } from '../../lib/format';
import { Table, THead, Th, Td, TRow } from '../../components/admin/Table';
import { useToast } from '../../components/ui/Toast';

export function NewsletterAdmin() {
  const token = getAccessToken();
  const { data, isLoading } = useNewsletterSubscribers(token);
  const remove = useRemoveSubscriber(token!);
  const { toast } = useToast();

  const items = data ?? [];

  return (
    <div>
      <h1 className="display text-2xl text-parchment md:text-3xl">Newsletter</h1>
      <p className="mt-1 text-sm text-parchment/60">Subscribers to The Sterling Intelligence Brief.</p>

      {isLoading ? (
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-parchment/60">No subscribers yet.</p>
      ) : (
        <div className="mt-8">
          <Table>
            <THead>
              <Th>Email</Th>
              <Th className="hidden sm:table-cell">Status</Th>
              <Th className="hidden sm:table-cell">Subscribed</Th>
              <Th>Actions</Th>
            </THead>
            <tbody>
              {items.map((s) => (
                <TRow key={s.id}>
                  <Td className="text-parchment">{s.email}</Td>
                  <Td className="hidden sm:table-cell capitalize">{s.status}</Td>
                  <Td className="hidden sm:table-cell">{formatDate(s.createdAt)}</Td>
                  <Td>
                    <button
                      onClick={() =>
                        remove.mutate(s.id, {
                          onSuccess: () => toast('Subscriber removed.'),
                          onError: () => toast('Remove failed.'),
                        })
                      }
                      className="text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment"
                    >
                      Remove
                    </button>
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