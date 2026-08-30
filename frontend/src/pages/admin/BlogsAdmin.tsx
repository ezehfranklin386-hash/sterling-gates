// Blogs admin: list + create/edit (BlogEditor) + delete-with-confirm.
// Requirement: admin can post blogs.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminBlogs, useDeleteBlog } from '../../hooks/useBlogs';
import { getAccessToken } from '../../lib/session';
import { formatDate } from '../../lib/format';
import { Button } from '../../components/ui/primitives';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Table, THead, Th, Td, TRow } from '../../components/admin/Table';
import { useToast } from '../../components/ui/Toast';

export function BlogsAdmin() {
  const token = getAccessToken();
  const { data, isLoading } = useAdminBlogs(token);
  const del = useDeleteBlog(token!);
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);

  const items = data ?? [];

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="display text-3xl text-parchment">Blogs</h1>
          <p className="mt-1 text-sm text-parchment/60">Publish and manage articles.</p>
        </div>
        <Link to="/admin/blogs/new">
          <Button>New article</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-parchment/50">Loading&#8230;</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-parchment/60">No articles yet.</p>
      ) : (
        <div className="mt-8">
          <Table>
            <THead>
              <Th>Title</Th>
              <Th>Author</Th>
              <Th>Published</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </THead>
            <tbody>
              {items.map((b) => (
                <TRow key={b.id}>
                  <Td>
                    <Link to={`/admin/blogs/${b.id}`} className="text-parchment hover:text-brass">
                      {b.title}
                    </Link>
                  </Td>
                  <Td>{b.author}</Td>
                  <Td>{b.published ? 'Yes' : 'Draft'}</Td>
                  <Td>{formatDate(b.publishedAt ?? b.createdAt)}</Td>
                  <Td>
                    <button
                      onClick={() => setPending(b.id)}
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
        title="Delete article"
        body="This permanently removes the article. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) {
            del.mutate(pending, {
              onSuccess: () => toast('Article deleted.'),
              onError: () => toast('Delete failed.'),
            });
            setPending(null);
          }
        }}
      />
    </div>
  );
}