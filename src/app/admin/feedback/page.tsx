'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';

const MOCK_FEEDBACK = [
  { id: '1', artworkTitle: 'The Enigma', rating: 5, text: 'Masterpiece!', reactions: ['heart', 'mind-blown'], createdAt: '2024-03-10T12:00:00Z' },
  { id: '2', artworkTitle: 'Silent Echoes', rating: 4, text: 'Very nice colors.', reactions: ['clap'], createdAt: '2024-03-09T15:30:00Z' },
];

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState(MOCK_FEEDBACK);
  const [filterRating, setFilterRating] = useState('all');
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filtered = feedback.filter(f => 
    filterRating === 'all' ? true : f.rating === parseInt(filterRating)
  );

  const deleteFeedback = (id: string) => {
    if (confirm('Delete this feedback?')) {
      setFeedback(feedback.filter(f => f.id !== id));
      setToast({ message: 'Feedback deleted', type: 'success' });
    }
  };

  const exportCSV = () => {
    setToast({ message: 'Exporting CSV...', type: 'success' });
    // Mock export
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Feedback & Ratings</h1>
        <Button variant="outline" icon={<Download size={16} />} onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      <Card className="p-4 bg-[#141414] border-[#262626]">
        <div className="flex gap-4 mb-4">
          <div className="w-48">
            <Select 
              label="Filter by Rating"
              options={[
                {label: 'All Ratings', value: 'all'},
                {label: '5 Stars', value: '5'},
                {label: '4 Stars', value: '4'},
                {label: '3 Stars', value: '3'},
                {label: '2 Stars', value: '2'},
                {label: '1 Star', value: '1'},
              ]}
              onChange={(e) => setFilterRating(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#262626]/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Artwork</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Feedback</th>
                <th className="px-4 py-3">Reactions</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#262626]/30">
                  <td className="px-4 py-3 font-medium text-white">{item.artworkTitle}</td>
                  <td className="px-4 py-3">
                    <div className="flex text-[#c9a84c]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < item.rating ? "currentColor" : "none"} className={i >= item.rating ? "text-gray-600" : ""} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{item.text || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {item.reactions?.map(r => (
                        <span key={r} className="px-2 py-0.5 bg-[#262626] text-xs rounded-full text-gray-300">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => deleteFeedback(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No feedback found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white shadow-lg`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
