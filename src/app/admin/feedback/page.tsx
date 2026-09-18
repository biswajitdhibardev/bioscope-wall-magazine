'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';

type Feedback = {
  id: string;
  artwork_title?: string | null;
  rating: number;
  feedback?: string | null;
  reactions?: string[] | null;
  created_at: string;
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filterRating, setFilterRating] = useState('all');
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Load real feedback from Supabase through the admin API
  const loadFeedback = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        '/api/admin/feedback?page=1&limit=1000',
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.error || 'Failed to load feedback'
        );
      }

      const result = await response.json();

      setFeedback(result.data || []);
    } catch (error) {
      console.error('Failed to load feedback:', error);

      setToast({
        message: 'Failed to load feedback',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load feedback when page opens
  useEffect(() => {
    loadFeedback();
  }, []);

  // Toast timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Keep the existing rating filter
  const filtered = feedback.filter((f) =>
    filterRating === 'all'
      ? true
      : f.rating === parseInt(filterRating, 10)
  );

  // Delete real feedback from Supabase
  const deleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.error || 'Failed to delete feedback'
        );
      }

      // Remove it from the UI after successful deletion
      setFeedback((current) =>
        current.filter((item) => item.id !== id)
      );

      setToast({
        message: 'Feedback deleted',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to delete feedback:', error);

      setToast({
        message: 'Failed to delete feedback',
        type: 'error',
      });
    }
  };

  // Connect existing Export CSV button to real API
  const exportCSV = () => {
    setToast({
      message: 'Exporting CSV...',
      type: 'success',
    });

    window.location.href = '/api/admin/feedback/export';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">
          Feedback & Ratings
        </h1>

        <Button
          variant="outline"
          icon={<Download size={16} />}
          onClick={exportCSV}
        >
          Export CSV
        </Button>
      </div>

      <Card className="p-4 bg-[#141414] border-[#262626]">
        <div className="flex gap-4 mb-4">
          <div className="w-48">
            <Select
              label="Filter by Rating"
              options={[
                { label: 'All Ratings', value: 'all' },
                { label: '5 Stars', value: '5' },
                { label: '4 Stars', value: '4' },
                { label: '3 Stars', value: '3' },
                { label: '2 Stars', value: '2' },
                { label: '1 Star', value: '1' },
              ]}
              onChange={(e) => setFilterRating(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#262626]/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">
                  Artwork
                </th>

                <th className="px-4 py-3">
                  Rating
                </th>

                <th className="px-4 py-3">
                  Feedback
                </th>

                <th className="px-4 py-3">
                  Reactions
                </th>

                <th className="px-4 py-3">
                  Date
                </th>

                <th className="px-4 py-3 text-right rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#262626]">

              {/* Loading state */}
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading feedback...
                  </td>
                </tr>
              )}

              {/* Real feedback */}
              {!loading &&
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#262626]/30"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {item.artwork_title || '-'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex text-[#c9a84c]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={
                              i < item.rating
                                ? 'currentColor'
                                : 'none'
                            }
                            className={
                              i >= item.rating
                                ? 'text-gray-600'
                                : ''
                            }
                          />
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                      {item.feedback || '-'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {item.reactions?.map((reaction, index) => (
                          <span
                            key={`${reaction}-${index}`}
                            className="px-2 py-0.5 bg-[#262626] text-xs rounded-full text-gray-300"
                          >
                            {reaction}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-400">
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleString()
                        : '-'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          deleteFeedback(item.id)
                        }
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

              {/* No feedback */}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No feedback found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg ${
            toast.type === 'success'
              ? 'bg-green-600'
              : 'bg-red-600'
          } text-white shadow-lg`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}