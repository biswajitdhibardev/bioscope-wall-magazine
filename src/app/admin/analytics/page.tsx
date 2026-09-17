'use client';

import { useSyncExternalStore } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';

const MOCK_RATING_DIST = [
  { stars: '1 Star', count: 5 },
  { stars: '2 Stars', count: 12 },
  { stars: '3 Stars', count: 45 },
  { stars: '4 Stars', count: 120 },
  { stars: '5 Stars', count: 250 },
];

const MOCK_TIME_SERIES = [
  { date: 'Mon', count: 20 },
  { date: 'Tue', count: 45 },
  { date: 'Wed', count: 30 },
  { date: 'Thu', count: 60 },
  { date: 'Fri', count: 85 },
  { date: 'Sat', count: 110 },
  { date: 'Sun', count: 90 },
];

const MOCK_REACTIONS = [
  { name: 'Heart', value: 400 },
  { name: 'Clap', value: 300 },
  { name: 'Mind Blown', value: 200 },
  { name: 'Fire', value: 100 },
];

const COLORS = ['#c9a84c', '#8b5cf6', '#3b82f6', '#ef4444'];

export default function AnalyticsPage() {
  // SSR-safe "has this hydrated on the client yet" flag (recharts needs
  // real DOM measurements), without an effect+state dance.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-[#141414] border-[#262626]">
          <h2 className="text-lg font-medium text-white mb-6">Rating Distribution</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_RATING_DIST}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="stars" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#262626', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#333', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#c9a84c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-[#141414] border-[#262626]">
          <h2 className="text-lg font-medium text-white mb-6">Feedback Over Time</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_TIME_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#333', color: '#fff' }}
                />
                <Line type="monotone" dataKey="count" stroke="#c9a84c" strokeWidth={2} dot={{fill: '#c9a84c', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-[#141414] border-[#262626] lg:col-span-2">
          <h2 className="text-lg font-medium text-white mb-6">Reaction Breakdown</h2>
          <div className="h-[300px] w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_REACTIONS}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {MOCK_REACTIONS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#333', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
