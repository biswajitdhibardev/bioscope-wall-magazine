'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function QRCodesPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'existing'>('generate');
  const [targetType, setTargetType] = useState('exhibition');
  const [label, setLabel] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleGenerate = () => {
    // Mock generate
    if (!label) return setToast({ message: 'Please enter a label', type: 'error' });
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bioscope.com';
    const url = `${baseUrl}/${targetType}/12345`;
    setGeneratedUrl(url);
    setToast({ message: 'QR Code generated', type: 'success' });
  };

  const handleDownload = () => {
    // A simplified download logic for the SVG would go here
    setToast({ message: 'Downloading...', type: 'success' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">QR Codes</h1>

      <div className="flex border-b border-[#262626]">
        <button 
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'generate' ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          Generate QR
        </button>
        <button 
          onClick={() => setActiveTab('existing')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'existing' ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          Existing QR Codes
        </button>
      </div>

      {activeTab === 'generate' ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 bg-[#141414] border-[#262626] space-y-4">
            <h2 className="text-lg font-medium text-white">Configuration</h2>
            <Select 
              label="Target Type"
              options={[
                {label: 'Exhibition', value: 'exhibition'},
                {label: 'Artwork', value: 'artwork'},
              ]}
              onChange={(e) => setTargetType(e.target.value)}
              value={targetType}
            />
            <Input 
              label="Custom Label" 
              placeholder="e.g. Main Entrance Banner" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Button variant="primary" className="w-full" onClick={handleGenerate}>
              Generate QR Code
            </Button>
          </Card>

          {generatedUrl && (
            <Card className="p-6 bg-[#141414] border-[#262626] flex flex-col items-center justify-center space-y-6 text-center">
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG value={generatedUrl} size={200} bgColor="#ffffff" fgColor="#000000" level="H" includeMargin />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Target URL</p>
                <p className="text-sm font-mono text-[#c9a84c] break-all">{generatedUrl}</p>
              </div>
              <Button variant="outline" icon={<Download size={16} />} onClick={handleDownload}>
                Download PNG
              </Button>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-4 bg-[#141414] border-[#262626]">
           <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#262626]/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Label</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              <tr className="hover:bg-[#262626]/30">
                <td className="px-4 py-3 font-medium text-white">Lobby Poster</td>
                <td className="px-4 py-3 text-gray-300">Exhibition</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">/exhibition/1</td>
                <td className="px-4 py-3 text-gray-400">2024-03-10</td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-900/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white shadow-lg`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
