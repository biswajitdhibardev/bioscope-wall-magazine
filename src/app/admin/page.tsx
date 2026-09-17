'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Users, MessageSquare, Star, Plus, BarChart2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { DashboardOverview } from '@/lib/types';

// Mock data fallback
const MOCK_DATA: DashboardOverview = {
  total_artworks: 124,
  total_artists: 45,
  total_feedback: 892,
  average_rating: 4.6,
  most_rated_artwork: { title: 'The Enigma', count: 156 },
  highest_rated_artwork: { title: 'Silent Echoes', rating: 4.9 },
  recent_feedback: [
    { id: '1', artwork_id: '1', rating: 5, feedback: 'Absolutely stunning work!', reactions: null, anonymous_session_id: null, created_at: new Date().toISOString(), artwork_title: 'The Enigma' },
    { id: '2', artwork_id: '2', rating: 4, feedback: 'Very emotional piece.', reactions: null, anonymous_session_id: null, created_at: new Date().toISOString(), artwork_title: 'Silent Echoes' },
    { id: '3', artwork_id: '3', rating: 5, feedback: 'Love the colors.', reactions: null, anonymous_session_id: null, created_at: new Date().toISOString(), artwork_title: 'Neon Dreams' },
  ]
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(true);
        setData(MOCK_DATA); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-gray-400">Welcome to the Bioscope admin dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/artworks">
            <Button variant="primary" size="sm" icon={<Plus size={16} />}>Add Artwork</Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline" size="sm" icon={<BarChart2 size={16} />}>View Analytics</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-sm">
          Warning: Could not connect to live data. Showing sample data.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="Total Artworks" value={data?.total_artworks} icon={<ImageIcon size={24} />} isLoading={isLoading} />
        <StatCard title="Total Artists" value={data?.total_artists} icon={<Users size={24} />} isLoading={isLoading} />
        <StatCard title="Total Feedback" value={data?.total_feedback} icon={<MessageSquare size={24} />} isLoading={isLoading} />
        <StatCard title="Avg Rating" value={data?.average_rating} suffix="/5" icon={<Star size={24} />} isLoading={isLoading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Feedback */}
        <Card className="lg:col-span-2 p-6 bg-[#141414] border-[#262626]">
          <h2 className="text-lg font-medium text-white mb-4">Recent Feedback</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-[#262626]/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Artwork</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Feedback</th>
                    <th className="px-4 py-3 rounded-tr-lg">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {data?.recent_feedback?.map((fb) => (
                    <tr key={fb.id} className="hover:bg-[#262626]/30">
                      <td className="px-4 py-3 font-medium text-white">{fb.artwork_title}</td>
                      <td className="px-4 py-3">
                        <div className="flex text-[#c9a84c]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < fb.rating ? "currentColor" : "none"} className={i >= fb.rating ? "text-gray-600" : ""} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 truncate max-w-[200px]">{fb.feedback}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(fb.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Highlights */}
        <div className="space-y-6">
          <Card className="p-6 bg-[#141414] border-[#262626]">
            <h2 className="text-sm font-medium text-gray-400 mb-1">Most Rated Artwork</h2>
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
              <div>
                <p className="text-xl font-medium text-white truncate">{data?.most_rated_artwork?.title}</p>
                <p className="text-sm text-[#c9a84c] mt-1">{data?.most_rated_artwork?.count} reviews</p>
              </div>
            )}
          </Card>
          
          <Card className="p-6 bg-[#141414] border-[#262626]">
            <h2 className="text-sm font-medium text-gray-400 mb-1">Highest Rated Artwork</h2>
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
              <div>
                <p className="text-xl font-medium text-white truncate">{data?.highest_rated_artwork?.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star size={16} className="text-[#c9a84c]" fill="currentColor" />
                  <span className="text-sm text-[#c9a84c]">{data?.highest_rated_artwork?.rating}/5</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, suffix = '', isLoading }: { title: string, value?: number, icon: React.ReactNode, suffix?: string, isLoading: boolean }) {
  return (
    <Card className="p-6 bg-[#141414] border-[#262626]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <h3 className="text-3xl font-bold text-white mt-1">
              {value !== undefined ? value : '-'}{suffix}
            </h3>
          )}
        </div>
        <div className="p-3 bg-[#262626]/50 rounded-lg text-[#c9a84c]">
          {icon}
        </div>
      </div>
    </Card>
  );
}
