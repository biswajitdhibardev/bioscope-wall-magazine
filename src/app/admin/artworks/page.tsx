'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ARTWORK_CATEGORIES } from '@/lib/constants';
import { getArtworkImageUrl } from '@/lib/artwork-image';

type ArtistOption = { id: string; name: string };
type ExhibitionOption = { id: string; name: string };

type AdminArtwork = {
  id: string;
  title: string;
  description: string | null;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
  category: string | null;
  image_url: string | null;
  image_path?: string | null;
  is_published: boolean;
  display_order: number;
  artist_id: string | null;
  exhibition_id: string | null;
  artist: ArtistOption | ArtistOption[] | null;
};

type FormState = {
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  year: string;
  category: string;
  artist_id: string;
  exhibition_id: string;
  is_published: boolean;
};

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  medium: '',
  dimensions: '',
  year: '',
    category: ARTWORK_CATEGORIES[0],
  artist_id: 'none',
  exhibition_id: 'none',
  is_published: true,
};

function artistName(artist: AdminArtwork['artist']) {
  if (Array.isArray(artist)) return artist[0]?.name || 'Unknown Artist';
  return artist?.name || 'Unknown Artist';
}

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<AdminArtwork[]>([]);
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [exhibitions, setExhibitions] = useState<ExhibitionOption[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<AdminArtwork | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const loadArtworks = async () => {
    try {
      const response = await fetch('/api/admin/artworks', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to load artworks');
      setArtworks(result.artworks ?? []);
      setArtists(result.artists ?? []);
      setExhibitions(result.exhibitions ?? []);
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Failed to load artworks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialArtworks = async () => {
      try {
        const response = await fetch('/api/admin/artworks', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || 'Failed to load artworks');
        if (cancelled) return;
        setArtworks(result.artworks ?? []);
        setArtists(result.artists ?? []);
        setExhibitions(result.exhibitions ?? []);
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          showToast(error instanceof Error ? error.message : 'Failed to load artworks', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadInitialArtworks();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const filteredArtworks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return artworks;
    return artworks.filter((artwork) =>
      [artwork.title, artwork.category ?? '', artistName(artwork.artist)]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [artworks, search]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingArtwork(null);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (artwork: AdminArtwork) => {
    resetForm();
    setEditingArtwork(artwork);
    setForm({
      title: artwork.title ?? '',
      description: artwork.description ?? '',
      medium: artwork.medium ?? '',
      dimensions: artwork.dimensions ?? '',
      year: artwork.year?.toString() ?? '',
            category: artwork.category || ARTWORK_CATEGORIES[0],
      artist_id: artwork.artist_id || 'none',
      exhibition_id: artwork.exhibition_id || 'none',
      is_published: artwork.is_published,
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const saveArtwork = async () => {
    if (!form.title.trim()) {
      showToast('Please enter an artwork title.', 'error');
      return;
    }
    if (!editingArtwork && !selectedFile) {
      showToast('Please choose an artwork image.', 'error');
      return;
    }

    try {
      setSaving(true);
      const body = new FormData();
      body.append('title', form.title.trim());
      body.append('description', form.description);
      body.append('medium', form.medium);
      body.append('dimensions', form.dimensions);
      body.append('year', form.year);
      body.append('category', form.category);
      body.append('artist_id', form.artist_id);
      body.append('exhibition_id', form.exhibition_id);
      body.append('is_published', String(form.is_published));
      if (selectedFile) body.append('file', selectedFile);
      if (editingArtwork) body.append('id', editingArtwork.id);

      const response = await fetch('/api/admin/artworks', {
        method: editingArtwork ? 'PATCH' : 'POST',
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Could not save artwork');

      setIsModalOpen(false);
      resetForm();
      await loadArtworks();
      showToast(editingArtwork ? 'Artwork updated successfully.' : 'Artwork uploaded successfully.');
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Could not save artwork', 'error');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (artwork: AdminArtwork) => {
    try {
      const body = new FormData();
      body.append('id', artwork.id);
      body.append('title', artwork.title);
      body.append('description', artwork.description ?? '');
      body.append('medium', artwork.medium ?? '');
      body.append('dimensions', artwork.dimensions ?? '');
      body.append('year', artwork.year?.toString() ?? '');
      body.append('category', artwork.category ?? '');
      body.append('artist_id', artwork.artist_id ?? 'none');
      body.append('exhibition_id', artwork.exhibition_id ?? 'none');
      body.append('is_published', String(!artwork.is_published));

      const response = await fetch('/api/admin/artworks', { method: 'PATCH', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Could not update status');

      setArtworks((current) => current.map((item) => item.id === artwork.id ? result.artwork : item));
      showToast(result.artwork.is_published ? 'Artwork published.' : 'Artwork hidden.');
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Could not update status', 'error');
    }
  };

  const deleteArtwork = async (artwork: AdminArtwork) => {
    if (!window.confirm(`Delete “${artwork.title}”? This also removes its stored image.`)) return;

    try {
      const response = await fetch('/api/admin/artworks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: artwork.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Could not delete artwork');

      setArtworks((current) => current.filter((item) => item.id !== artwork.id));
      showToast('Artwork deleted.');
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Could not delete artwork', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Artworks</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage the artworks shown on the public wall magazine.</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
          Add Artwork
        </Button>
      </div>

      <Card className="p-4 bg-[#141414] border-[#262626]">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search artworks..."
              className="w-full pl-10 pr-4 py-2 bg-[#262626] border border-[#333] rounded-md text-white focus:outline-none focus:border-[#c9a84c]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#262626]/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Image</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Artist</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading artworks...</td></tr>
              ) : filteredArtworks.map((artwork) => (
                <tr key={artwork.id} className="hover:bg-[#262626]/30">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 bg-[#333] rounded overflow-hidden flex items-center justify-center">
                      {(artwork.image_path || artwork.image_url) ? (
                        <img src={getArtworkImageUrl(artwork)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={20} className="text-gray-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{artwork.title}</td>
                  <td className="px-4 py-3 text-gray-300">{artistName(artwork.artist)}</td>
                  <td className="px-4 py-3 text-gray-300">{artwork.category || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => void togglePublish(artwork)}
                      aria-label={artwork.is_published ? 'Hide artwork' : 'Publish artwork'}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${artwork.is_published ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${artwork.is_published ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(artwork)} className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-[#333] transition-colors" aria-label="Edit artwork">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => void deleteArtwork(artwork)} className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-900/20 transition-colors" aria-label="Delete artwork">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredArtworks.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No artworks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { if (!saving) { setIsModalOpen(false); resetForm(); } }}
        title={editingArtwork ? 'Edit Artwork' : 'Add Artwork'}
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Title" placeholder="Artwork title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" placeholder="About the artwork..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Medium" placeholder="e.g. Oil on Canvas" value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} />
            <Input label="Year" type="number" placeholder="2026" min="1900" max="2100" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <Input label="Dimensions" placeholder="e.g. 60 × 80 cm" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} />
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={ARTWORK_CATEGORIES.map((category) => ({ label: category, value: category }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Artist" value={form.artist_id} onChange={(e) => setForm({ ...form, artist_id: e.target.value })} options={[{ label: 'No artist', value: 'none' }, ...artists.map((artist) => ({ label: artist.name, value: artist.id }))]} />
            <Select label="Exhibition" value={form.exhibition_id} onChange={(e) => setForm({ ...form, exhibition_id: e.target.value })} options={[{ label: 'No exhibition', value: 'none' }, ...exhibitions.map((exhibition) => ({ label: exhibition.name, value: exhibition.id }))]} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#fafafa]">Artwork image {!editingArtwork && <span className="text-[#c9a84c]">*</span>}</label>
            <div className="rounded-lg border border-dashed border-[#3a3a3a] bg-[#101010] p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#262626] flex items-center justify-center shrink-0">
                  {previewUrl || (editingArtwork && (editingArtwork.image_path || editingArtwork.image_url)) ? (
                    <img src={previewUrl || getArtworkImageUrl(editingArtwork!)} alt="Artwork preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-500" size={28} />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-gray-300">{selectedFile ? selectedFile.name : editingArtwork ? 'Keep the current image or choose a replacement.' : 'Choose a JPG, PNG, or WebP image (max 10 MB).'}</p>
                  <div className="mt-3 flex gap-2 justify-center sm:justify-start">
                    <Button type="button" variant="secondary" icon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>
                      {selectedFile ? 'Choose another' : 'Choose image'}
                    </Button>
                    {selectedFile && (
                      <Button type="button" variant="ghost" icon={<X size={16} />} onClick={() => handleFileChange(null)}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 accent-[#c9a84c]" />
            Publish this artwork on the public gallery immediately
          </label>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#262626]">
            <Button variant="ghost" disabled={saving} onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" isLoading={saving} onClick={() => void saveArtwork()}>
              {editingArtwork ? 'Save Changes' : 'Upload Artwork'}
            </Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div role="status" className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white shadow-lg`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
