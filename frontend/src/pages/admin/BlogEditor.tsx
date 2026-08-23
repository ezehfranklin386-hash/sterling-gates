// Create/edit a blog post. Cover upload via ImageUploader, slug auto from title
// (editable), body as plain text/HTML, published toggle.

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUpdateBlog, useCreateBlog, useAdminBlogs } from '../../hooks/useBlogs';
import { getAccessToken } from '../../lib/session';
import { slugify } from '../../lib/format';
import { Button, FieldLabel, Input, Textarea, Toggle } from '../../components/ui/primitives';
import { ImageUploader } from '../../components/admin/AdminUI';
import { useToast } from '../../components/ui/Toast';
import type { Blog } from '../../lib/types';

export function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = getAccessToken()!;
  const { toast } = useToast();

  const { data: all } = useAdminBlogs(token);
  const editing = id && id !== 'new' ? all?.find((b) => b.id === id) : undefined;

  const [form, setForm] = useState<Partial<Blog>>({
    title: '',
    slug: '',
    excerpt: '',
    author: '',
    body: '',
    coverImageUrl: '',
    tags: [] as string[],
    published: false,
  });
  const [tagsInput, setTagsInput] = useState('');
  const [loaded, setLoaded] = useState(false);

  const update = useUpdateBlog(token);
  const create = useCreateBlog(token);

  // Hydrate from the existing record once loaded.
  useEffect(() => {
    if (loaded || !editing) return;
    setForm({
      title: editing.title,
      slug: editing.slug,
      excerpt: editing.excerpt,
      author: editing.author,
      body: editing.body,
      coverImageUrl: editing.coverImageUrl,
      tags: editing.tags ?? [],
      published: editing.published,
    });
    setTagsInput((editing.tags ?? []).join(', '));
    setLoaded(true);
  }, [editing, loaded]);

  const slugTouched = useMemo(() => form.slug && form.slug !== slugify(form.title ?? ''), [form.slug, form.title]);

  const set = <K extends keyof Blog>(key: K, value: Blog[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function applyTitle(title: string) {
    if (!slugTouched) setForm((f) => ({ ...f, title, slug: f.slug || slugify(title) }));
    else setForm((f) => ({ ...f, title }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title ?? ''),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      publishedAt: form.published ? (editing?.publishedAt ?? new Date().toISOString()) : undefined,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: payload });
        toast('Article saved.');
      } else {
        const created = await create.mutateAsync(payload);
        toast('Article created.');
        navigate(`/admin/blogs/${created.id}`, { replace: true });
      }
    } catch {
      toast('Save failed. Check the backend is running.');
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link to="/admin/blogs" className="text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment">
            ← Blogs
          </Link>
          <h1 className="display mt-2 text-3xl text-parchment">
            {editing ? 'Edit article' : 'New article'}
          </h1>
        </div>
        <Button onClick={() => void onSubmit} disabled={update.isPending || create.isPending}>
          Save
        </Button>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div>
          <FieldLabel>Title</FieldLabel>
          <Input required value={form.title} onChange={(e) => applyTitle(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Slug</FieldLabel>
          <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-from-title" />
        </div>
        <div>
          <FieldLabel>Excerpt</FieldLabel>
          <Textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Author</FieldLabel>
          <Input value={form.author} onChange={(e) => set('author', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Tags (comma-separated)</FieldLabel>
          <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Cover image</FieldLabel>
          <ImageUploader
            label="Cover"
            currentUrl={form.coverImageUrl}
            onUploaded={(url) => set('coverImageUrl', url)}
          />
        </div>
        <div>
          <FieldLabel>Body</FieldLabel>
          <Textarea
            className="min-h-[320px] font-mono text-xs"
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Write in HTML or plain text. Rendered in the editorial Georgia style."
          />
        </div>
        <Toggle checked={!!form.published} onChange={(v) => set('published', v)} label="Published" />
      </form>
    </div>
  );
}