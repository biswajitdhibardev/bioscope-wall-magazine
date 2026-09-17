'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, Search, User, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';

interface AdminArtist {
  id: string;
  name: string;
  biography: string | null;
  profile_image: string | null;
  artistic_style: string | null;
  education: string | null;
  social_links: Record<string, string> | null;
  artworks_count: number;
  created_at: string;
  updated_at: string;
}

type FormState = {
  name: string;
  biography: string;
  artistic_style: string;
  education: string;
  website: string;
  instagram: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  biography: '',
  artistic_style: '',
  education: '',
  website: '',
  instagram: '',
};

export default function ArtistsPage() {
  const [artists, setArtists] = useState<AdminArtist[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<AdminArtist | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const loadArtists = async () => {
    try {
      const response = await fetch('/api/admin/artists', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to load artists');
      setArtists(result.artists ?? []);
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Failed to load artists', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadArtists();
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

  const filteredArtists = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return artists;
    return artists.filter((artist) =>
      [artist.name, artist.artistic_style ?? '', artist.biography ?? '']
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [artists, search]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingArtist(null);
    setSelectedFile(null);
    setRemoveProfileImage(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (artist: AdminArtist) => {
    resetForm();
    setEditingArtist(artist);
    setForm({
      name: artist.name ?? '',
      biography: artist.biography ?? '',
      artistic_style: artist.artistic_style ?? '',
      education: artist.education ?? '',
      website: artist.social_links?.website ?? '',
      instagram: artist.social_links?.instagram ?? '',
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setRemoveProfileImage(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const saveArtist = async () => {
    if (!form.name.trim()) {
      showToast('Please enter the artist name.', 'error');
      return;
    }

    try {
      setSaving(true);
      const body = new FormData();
      body.append('name', form.name.trim());
      body.append('biography', form.biography);
      body.append('artistic_style', form.artistic_style);
      body.append('education', form.education);
      body.append('social_links', JSON.stringify({
        ...(form.website.trim() ? { website: form.website.trim() } : {}),
        ...(form.instagram.trim() ? { instagram: form.instagram.trim() } : {}),
      }));
      body.append('remove_profile_image', String(removeProfileImage));
      if (selectedFile) body.append('file', selectedFile);
      if (editingArtist) body.append('id', editingArtist.id);

      const response = await fetch('/api/admin/artists', {
        method: editingArtist ? 'PATCH' : 'POST',
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Could not save artist');

      setIsModalOpen(false);
      resetForm();
      await loadArtists();
      showToast(editingArtist ? 'Artist updated successfully.' : 'Artist added successfully.');
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Could not save artist', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteArtist = async (artist: AdminArtist) => {
    const artworkMessage = artist.artworks_count > 0
      ? ` This will unlink ${artist.artworks_count} artwork${artist.artworks_count === 1 ? '' : 's'} from the artist, but will not delete the artwork.`
      : '';

    if (!window.confirm(`Delete “${artist.name}”?${artworkMessage}`)) return;

    try {
      const response = await fetch('/api/admin/artists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: artist.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Could not delete artist');

      setArtists((current) => current.filter((item) => item.id !== artist.id));
      showToast('Artist deleted successfully.');
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Could not delete artist', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Artists</h1>
          <p className="text-sm text-gray-500 mt-1">Add and manage the artists shown throughout the wall magazine.</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
          Add Artist
        </Button>
      </div>

      <Card className="p-4 bg-[#141414] border-[#262626]">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search artists..."
              className="w-full pl-10 pr-4 py-2 bg-[#262626] border border-[#333] rounded-md text-white focus:outline-none focus:border-[#c9a84c]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#262626]/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Profile</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Style</th>
                <th className="px-4 py-3">Artworks</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading artists...</td></tr>
              ) : filteredArtists.map((artist) => (
                <tr key={artist.id} className="hover:bg-[#262626]/30">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 bg-[#333] rounded-full overflow-hidden flex items-center justify-center">
                      {artist.profile_image ? (
                        <img src={artist.profile_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-gray-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{artist.name}</td>
                  <td className="px-4 py-3 text-gray-300">{artist.artistic_style || '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{artist.artworks_count}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(artist)}
                        className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-[#333] transition-colors"
                        aria-label={`Edit ${artist.name}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => void deleteArtist(artist)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-900/20 transition-colors"
                        aria-label={`Delete ${artist.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredArtists.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No artists found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { if (!saving) { setIsModalOpen(false); resetForm(); } }}
        title={editingArtist ? 'Edit Artist' : 'Add Artist'}
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Artist Name" placeholder="Full artist name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Biography" placeholder="About the artist..." value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Artistic Style" placeholder="e.g. Contemporary" value={form.artistic_style} onChange={(e) => setForm({ ...form, artistic_style: e.target.value })} />
            <Input label="Website URL" placeholder="https://..." type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <Input label="Instagram URL" placeholder="https://instagram.com/..." type="url" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          </div>

          <Textarea label="Education & Awards" placeholder="Education, awards, achievements..." value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#fafafa]">Profile image</label>
            <div className="rounded-lg border border-dashed border-[#3a3a3a] bg-[#101010] p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#262626] flex items-center justify-center shrink-0">
                  {previewUrl || (editingArtist?.profile_image && !removeProfileImage) ? (
                    <img src={previewUrl || editingArtist!.profile_image!} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-500" size={28} />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-gray-300">
                    {selectedFile ? selectedFile.name : editingArtist?.profile_image && !removeProfileImage ? 'Keep the current image or choose a replacement.' : 'Choose a JPG, PNG, or WebP image (max 5 MB).'}
                  </p>
                  <div className="mt-3 flex gap-2 justify-center sm:justify-start flex-wrap">
                    <Button type="button" variant="secondary" icon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>
                      {selectedFile ? 'Choose another' : 'Choose image'}
                    </Button>
                    {selectedFile && (
                      <Button type="button" variant="ghost" icon={<X size={16} />} onClick={() => handleFileChange(null)}>
                        Clear
                      </Button>
                    )}
                    {editingArtist?.profile_image && !selectedFile && !removeProfileImage && (
                      <Button type="button" variant="ghost" onClick={() => setRemoveProfileImage(true)}>
                        Remove image
                      </Button>
                    )}
                    {removeProfileImage && (
                      <Button type="button" variant="ghost" onClick={() => setRemoveProfileImage(false)}>
                        Keep image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#262626]">
            <Button variant="ghost" disabled={saving} onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" isLoading={saving} onClick={() => void saveArtist()}>
              {editingArtist ? 'Save Changes' : 'Add Artist'}
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
