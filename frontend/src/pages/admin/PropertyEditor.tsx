// Create/edit a property. All schema §5 fields, multi-image gallery upload,
// featured / offMarket / published toggles, area + assetReference (enhancements).

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUpdateProperty, useCreateProperty, useAdminProperties } from '../../hooks/useProperties';
import { getAccessToken } from '../../lib/session';
import { slugify } from '../../lib/format';
import { AREAS, ASSET_CLASSES, PROPERTY_STATUSES } from '../../lib/brand';
import { Button, FieldLabel, Input, Textarea, Select, Toggle } from '../../components/ui/primitives';
import { ImageUploader } from '../../components/admin/AdminUI';
import { useToast } from '../../components/ui/Toast';
import type { Property } from '../../lib/types';

export function PropertyEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = getAccessToken()!;
  const { toast } = useToast();

  const { data: all } = useAdminProperties(token);
  const editing = id && id !== 'new' ? all?.find((p) => p.id === id) : undefined;

  const [form, setForm] = useState<Partial<Property>>({
    title: '',
    slug: '',
    assetClass: 'Residential',
    area: '',
    location: '',
    price: 0,
    size: { value: 0, unit: 'sqm' },
    bedrooms: undefined,
    bathrooms: undefined,
    status: 'available',
    offMarket: false,
    featured: false,
    published: false,
    assetReference: '',
    description: '',
    features: [] as string[],
    heroImageUrl: '',
    imageUrls: [] as string[],
  });
  const [featuresInput, setFeaturesInput] = useState('');
  const [loaded, setLoaded] = useState(false);

  const update = useUpdateProperty(token);
  const create = useCreateProperty(token);

  useEffect(() => {
    if (loaded || !editing) return;
    setForm({
      title: editing.title,
      slug: editing.slug,
      assetClass: editing.assetClass,
      area: editing.area,
      location: editing.location,
      price: editing.price,
      size: editing.size,
      bedrooms: editing.bedrooms,
      bathrooms: editing.bathrooms,
      status: editing.status,
      offMarket: editing.offMarket,
      featured: editing.featured,
      published: editing.published,
      assetReference: editing.assetReference,
      description: editing.description,
      features: editing.features ?? [],
      heroImageUrl: editing.heroImageUrl,
      imageUrls: editing.imageUrls ?? [],
    });
    setFeaturesInput((editing.features ?? []).join(', '));
    setLoaded(true);
  }, [editing, loaded]);

  const set = <K extends keyof Property>(key: K, value: Property[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addGalleryImage = (url: string) => {
    if (!form.heroImageUrl) setForm((f) => ({ ...f, heroImageUrl: url }));
    else setForm((f) => ({ ...f, imageUrls: [...(f.imageUrls ?? []), url] }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title ?? ''),
      features: featuresInput.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: payload });
        toast('Property saved.');
      } else {
        const created = await create.mutateAsync(payload);
        toast('Property created.');
        navigate(`/admin/properties/${created.id}`, { replace: true });
      }
    } catch {
      toast('Save failed. Check the backend is running.');
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/properties" className="text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment">
            ← Properties
          </Link>
          <h1 className="display mt-2 text-3xl text-parchment">
            {editing ? 'Edit property' : 'New property'}
          </h1>
        </div>
        <Button onClick={() => void onSubmit} disabled={update.isPending || create.isPending}>
          Save
        </Button>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel>Title</FieldLabel>
          <Input required value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Slug</FieldLabel>
          <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-from-title" />
        </div>
        <div>
          <FieldLabel>Asset reference (discreet)</FieldLabel>
          <Input value={form.assetReference ?? ''} onChange={(e) => set('assetReference', e.target.value)} placeholder="e.g. SG-2026-014" />
        </div>
        <div>
          <FieldLabel>Asset class</FieldLabel>
          <Select value={form.assetClass} onChange={(e) => set('assetClass', e.target.value as Property['assetClass'])}>
            {ASSET_CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel>Neighbourhood / area</FieldLabel>
          <Select value={form.area} onChange={(e) => set('area', e.target.value)}>
            <option value="">—</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Location / street</FieldLabel>
          <Input value={form.location} onChange={(e) => set('location', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Price (USD)</FieldLabel>
          <Input type="number" value={form.price ?? 0} onChange={(e) => set('price', Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Size value</FieldLabel>
            <Input type="number" value={form.size?.value ?? 0} onChange={(e) => set('size', { ...(form.size ?? { value: 0, unit: 'sqm' }), value: Number(e.target.value) })} />
          </div>
          <div>
            <FieldLabel>Unit</FieldLabel>
            <Select value={form.size?.unit ?? 'sqm'} onChange={(e) => set('size', { ...(form.size ?? { value: 0, unit: 'sqm' }), unit: e.target.value as 'sqm' | 'sqft' })}>
              <option value="sqm">sqm</option>
              <option value="sqft">sqft</option>
            </Select>
          </div>
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <Select value={form.status} onChange={(e) => set('status', e.target.value as Property['status'])}>
            {PROPERTY_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Bedrooms</FieldLabel>
            <Input type="number" value={form.bedrooms ?? ''} onChange={(e) => set('bedrooms', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div>
            <FieldLabel>Bathrooms</FieldLabel>
            <Input type="number" value={form.bathrooms ?? ''} onChange={(e) => set('bathrooms', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </div>

        <div className="md:col-span-2">
          <FieldLabel>Description</FieldLabel>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Features (comma-separated)</FieldLabel>
          <Input value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <FieldLabel>Gallery (hero + additional)</FieldLabel>
          <ImageUploader label="Gallery" currentUrl={form.heroImageUrl} onUploaded={addGalleryImage} />
          {(form.imageUrls ?? []).length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.imageUrls?.map((u, i) => (
                <img key={i} src={u} alt="" className="h-16 w-24 object-cover" />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 md:col-span-2">
          <Toggle checked={!!form.published} onChange={(v) => set('published', v)} label="Published" />
          <Toggle checked={!!form.featured} onChange={(v) => set('featured', v)} label="Featured on Home" />
          <Toggle checked={!!form.offMarket} onChange={(v) => set('offMarket', v)} label="Off-market (POA)" />
        </div>
      </form>
    </div>
  );
}