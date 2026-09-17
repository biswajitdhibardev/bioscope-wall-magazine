'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';

interface AdminExhibition {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  artworks_count: number;
  created_at: string;
  updated_at: string;
}

type FormState = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

const EMPTY_FORM: FormState = { name: '', description: '', start_date: '', end_date: '', is_active: true };

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<AdminExhibition[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<AdminExhibition | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const loadExhibitions = async () => {
    try {
      const response = await fetch('/api/admin/exhibitions', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to load exhibitions');
      setExhibitions(result.exhibitions ?? []);
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Failed to load exhibitions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadExhibitions(); }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exhibitions;
    return exhibitions.filter((exhibition) => `${exhibition.name} ${exhibition.description ?? ''}`.toLowerCase().includes(query));
  }, [exhibitions, search]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingExhibition(null);
    setSelectedFile(null);
    setRemoveCoverImage(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddModal = () => { resetForm(); setIsModalOpen(true); };
  const openEditModal = (exhibition: AdminExhibition) => {
    resetForm();
    setEditingExhibition(exhibition);
    setForm({
      name: exhibition.name ?? '',
      description: exhibition.description ?? '',
      start_date: exhibition.start_date ?? '',
      end_date: exhibition.end_date ?? '',
      is_active: exhibition.is_active,
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setRemoveCoverImage(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const saveExhibition = async () => {
    if (!form.name.trim()) return showToast('Please enter the exhibition name.', 'error');
    if (form.start_date && form.end_date && form.start_date > form.end_date) return showToast('End date cannot be before start date.', 'error');

    try {
      setSaving(true);
      const body = new FormData();
      body.append('name', form.name.trim());
      body.append('description', form.description);
      body.append('start_date', form.start_date);
      body.append('end_date', form.end_date);
      body.append('is_active', String(form.is_active));
      body.append('remove_cover_image', String(removeCoverImage));
      if (selectedFile) body.append('file', selectedFile);
      if (editingExhibition) body.append('id', editingExhibition.id);

      const response = await fetch('/api/admin/exhibitions', { method: editingExhibition ? 'PATCH' : 'POST', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Could not save exhibition');

      setIsModalOpen(false);
      resetForm();
      await loadExhibitions();
      showToast(editingExhibition ? 'Exhibition updated successfully.' : 'Exhibition added successfully.');
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Could not save exhibition', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (exhibition: AdminExhibition) => {
    const body = new FormData();
    body.append('id', exhibition.id);
    body.append('name', exhibition.name);
    body.append('description', exhibition.description ?? '');
    body.append('start_date', exhibition.start_date ?? '');
    body.append('end_date', exhibition.end_date ?? '');
    body.append('is_active', String(!exhibition.is_active));
    try {
      const response = await fetch('/api/admin/exhibitions', { method: 'PATCH', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Could not update status');
      setExhibitions((current) => current.map((item) => item.id === exhibition.id ? result.exhibition : item));
      showToast('Status updated successfully.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update status', 'error');
    }
  };

  const deleteExhibition = async (exhibition: AdminExhibition) => {
    const message = exhibition.artworks_count > 0
      ? `Delete “${exhibition.name}”? This will unlink ${exhibition.artworks_count} artwork${exhibition.artworks_count === 1 ? '' : 's'}, but will not delete the artwork.`
      : `Delete “${exhibition.name}”?`;
    if (!window.confirm(message)) return;
    try {
      const response = await fetch('/api/admin/exhibitions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: exhibition.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Could not delete exhibition');
      setExhibitions((current) => current.filter((item) => item.id !== exhibition.id));
      showToast('Exhibition deleted successfully.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not delete exhibition', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Exhibitions</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage exhibitions shown on the wall magazine.</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>Add Exhibition</Button>
      </div>

      <Card className="p-4 bg-[#141414] border-[#262626]">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search exhibitions..." className="w-full pl-10 pr-4 py-2 bg-[#262626] border border-[#333] rounded-md text-white focus:outline-none focus:border-[#c9a84c]" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#262626]/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Cover</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Artworks</th><th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading exhibitions...</td></tr> : filtered.map((exhibition) => (
                <tr key={exhibition.id} className="hover:bg-[#262626]/30">
                  <td className="px-4 py-3"><div className="w-16 h-10 bg-[#333] rounded overflow-hidden flex items-center justify-center">{exhibition.cover_image ? <img src={exhibition.cover_image} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-500" />}</div></td>
                  <td className="px-4 py-3 font-medium text-white">{exhibition.name}</td>
                  <td className="px-4 py-3 text-gray-300">{formatDate(exhibition.start_date)}{exhibition.end_date ? ` — ${formatDate(exhibition.end_date)}` : ''}</td>
                  <td className="px-4 py-3"><button onClick={() => void toggleActive(exhibition)} className={`px-2.5 py-1 text-xs font-medium rounded-full ${exhibition.is_active ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>{exhibition.is_active ? 'Active' : 'Inactive'}</button></td>
                  <td className="px-4 py-3 text-gray-300">{exhibition.artworks_count}</td>
                  <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditModal(exhibition)} className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-[#333]" aria-label={`Edit ${exhibition.name}`}><Edit2 size={16} /></button><button onClick={() => void deleteExhibition(exhibition)} className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-900/20" aria-label={`Delete ${exhibition.name}`}><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No exhibitions found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { if (!saving) { setIsModalOpen(false); resetForm(); } }} title={editingExhibition ? 'Edit Exhibition' : 'Add Exhibition'} size="lg">
        <div className="space-y-4">
          <Input label="Name" placeholder="Exhibition name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description" placeholder="About the exhibition..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /><Input label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#fafafa]">Cover image</label>
            <div className="rounded-lg border border-dashed border-[#3a3a3a] bg-[#101010] p-4"><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} /><div className="flex flex-col sm:flex-row gap-4 items-center"><div className="w-28 h-20 rounded-lg overflow-hidden bg-[#262626] flex items-center justify-center shrink-0">{previewUrl || (editingExhibition?.cover_image && !removeCoverImage) ? <img src={previewUrl || editingExhibition!.cover_image!} alt="Cover preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-500" size={28} />}</div><div className="flex-1 text-center sm:text-left"><p className="text-sm text-gray-300">{selectedFile ? selectedFile.name : editingExhibition?.cover_image ? 'Keep the current cover or choose a replacement.' : 'Choose a JPG, PNG, or WebP image (max 10 MB).'}</p><div className="mt-3 flex gap-2 justify-center sm:justify-start"><Button type="button" variant="secondary" icon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>{selectedFile ? 'Choose another' : 'Choose image'}</Button>{selectedFile && <Button type="button" variant="ghost" icon={<X size={16} />} onClick={() => handleFileChange(null)}>Clear</Button>}{editingExhibition?.cover_image && !selectedFile && <Button type="button" variant="ghost" onClick={() => setRemoveCoverImage(!removeCoverImage)}>{removeCoverImage ? 'Keep image' : 'Remove image'}</Button>}</div></div></div></div>
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-[#c9a84c]" />Show this exhibition as active/featured</label>
          <div className="pt-4 flex justify-end gap-3 border-t border-[#262626]"><Button variant="ghost" disabled={saving} onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button><Button variant="primary" isLoading={saving} onClick={() => void saveExhibition()}>{editingExhibition ? 'Save Changes' : 'Add Exhibition'}</Button></div>
        </div>
      </Modal>

      {toast && <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white shadow-lg`}>{toast.message}</div>}
    </div>
  );
}
