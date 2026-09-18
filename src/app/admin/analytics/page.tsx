'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type Feedback = {
  id: string;
  artwork_id: string;
  artwork_title?: string | null;
  rating: number;
  feedback?: string | null;
  reactions?: string[] | null;
  created_at: string;
};

const COLORS = [
  '#c9a84c',
  '#8b5cf6',
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

export default function AnalyticsPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // LOAD REAL FEEDBACK

  const loadAnalytics = async () => {
    try {
      setError(null);

      // Load the first page of feedback

      const firstResponse = await fetch(
        '/api/admin/feedback?page=1&limit=1000',
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      if (!firstResponse.ok) {
        const errorData =
          await firstResponse.json().catch(() => null);

        throw new Error(
          errorData?.error ||
            'Failed to load analytics'
        );
      }

      const firstResult =
        await firstResponse.json();

      let allFeedback: Feedback[] =
        firstResult.data || [];

      const total =
        Number(firstResult.total) ||
        allFeedback.length;

      // If the total feedback exceeds the page size, fetch additional pages

      const pageSize = 1000;

      if (total > pageSize) {
        const totalPages = Math.ceil(
          total / pageSize
        );

        for (
          let page = 2;
          page <= totalPages;
          page++
        ) {
          const response = await fetch(
            `/api/admin/feedback?page=${page}&limit=${pageSize}`,
            {
              method: 'GET',
              cache: 'no-store',
            }
          );

          if (!response.ok) {
            break;
          }

          const result =
            await response.json();

          if (result.data) {
            allFeedback = [
              ...allFeedback,
              ...result.data,
            ];
          }
        }
      }

      setFeedback(allFeedback);

      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        'Analytics loading error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load analytics'
      );
    } finally {
      setLoading(false);
    }
  };

  // Load analytics when page opens and refresh every 10 seconds

  useEffect(() => {
    loadAnalytics();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadAnalytics();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // RATING DISTRIBUTION

  const ratingDistribution = useMemo(() => {
    const counts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    feedback.forEach((item) => {
      const rating = Number(item.rating);

      if (
        rating >= 1 &&
        rating <= 5
      ) {
        counts[
          rating as keyof typeof counts
        ]++;
      }
    });

    return [
      {
        stars: '1 Star',
        count: counts[1],
      },
      {
        stars: '2 Stars',
        count: counts[2],
      },
      {
        stars: '3 Stars',
        count: counts[3],
      },
      {
        stars: '4 Stars',
        count: counts[4],
      },
      {
        stars: '5 Stars',
        count: counts[5],
      },
    ];
  }, [feedback]);

  // Feedback Over Time (Last 7 Days)

  const timeSeries = useMemo(() => {
    const days: {
      dateKey: string;
      date: string;
      count: number;
    }[] = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);

      date.setHours(0, 0, 0, 0);
      date.setDate(
        date.getDate() - i
      );

      const year = date.getFullYear();
      const month = String(
        date.getMonth() + 1
      ).padStart(2, '0');
      const day = String(
        date.getDate()
      ).padStart(2, '0');

      const dateKey =
        `${year}-${month}-${day}`;

      days.push({
        dateKey,
        date: date.toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
          }
        ),
        count: 0,
      });
    }

    feedback.forEach((item) => {
      if (!item.created_at) return;

      const created = new Date(
        item.created_at
      );

      const year =
        created.getFullYear();

      const month = String(
        created.getMonth() + 1
      ).padStart(2, '0');

      const day = String(
        created.getDate()
      ).padStart(2, '0');

      const dateKey =
        `${year}-${month}-${day}`;

      const matchingDay =
        days.find(
          (day) =>
            day.dateKey === dateKey
        );

      if (matchingDay) {
        matchingDay.count++;
      }
    });

    return days.map(
      ({
        dateKey,
        date,
        count,
      }) => ({
        dateKey,
        date,
        count,
      })
    );
  }, [feedback]);

  // REACTIONS

  const reactions = useMemo(() => {
    const counts: Record<
      string,
      number
    > = {};

    feedback.forEach((item) => {
      if (!item.reactions) return;

      item.reactions.forEach(
        (reaction) => {
          if (!reaction) return;

          counts[reaction] =
            (counts[reaction] || 0) + 1;
        }
      );
    });

    return Object.entries(counts)
      .sort(
        (a, b) => b[1] - a[1]
      )
      .map(
        ([name, value]) => ({
          name,
          value,
        })
      );
  }, [feedback]);

  // Total Average Rating and Total Feedback

  const totalFeedback =
    feedback.length;

  const averageRating = useMemo(() => {
    if (!feedback.length) return 0;

    const total = feedback.reduce(
      (sum, item) =>
        sum + Number(item.rating || 0),
      0
    );

    return total / feedback.length;
  }, [feedback]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Analytics
          </h1>

          <div className="flex items-center gap-3 mt-1">
            {loading ? (
              <span className="text-xs text-gray-500">
                Updating...
              </span>
            ) : (
              <span className="text-xs text-gray-500">
                Live data • {totalFeedback}{' '}
                feedback
                {totalFeedback !== 1
                  ? 's'
                  : ''}
              </span>
            )}

            {lastUpdated && (
              <span className="text-xs text-gray-600">
                Updated{' '}
                {lastUpdated.toLocaleTimeString(
                  'en-IN'
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Main Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Rating Distribution */}
        <Card className="p-6 bg-[#141414] border-[#262626]">
          <h2 className="text-lg font-medium text-white mb-6">
            Rating Distribution
          </h2>

          <div className="h-[300px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  ratingDistribution
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#262626"
                  vertical={false}
                />

                <XAxis
                  dataKey="stars"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  cursor={{
                    fill: '#262626',
                    opacity: 0.4,
                  }}
                  contentStyle={{
                    backgroundColor:
                      '#141414',
                    borderColor:
                      '#333',
                    color: '#fff',
                  }}
                />

                <Bar
                  dataKey="count"
                  fill="#c9a84c"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Feedback Over Time */}
        <Card className="p-6 bg-[#141414] border-[#262626]">
          <h2 className="text-lg font-medium text-white mb-6">
            Feedback Over Time
          </h2>

          <div className="h-[300px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={timeSeries}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#262626"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      '#141414',
                    borderColor:
                      '#333',
                    color: '#fff',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#c9a84c"
                  strokeWidth={2}
                  dot={{
                    fill: '#c9a84c',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Reaction Breakdown */}
        <Card className="p-6 bg-[#141414] border-[#262626] lg:col-span-2">
          <h2 className="text-lg font-medium text-white mb-6">
            Reaction Breakdown
          </h2>

          <div className="h-[300px] w-full flex justify-center">
            {reactions.length === 0 ? (
              <div className="flex items-center justify-center text-gray-500">
                No reactions yet
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={reactions}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {reactions.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        '#141414',
                      borderColor:
                        '#333',
                      color: '#fff',
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

      </div>

      {/* Small live information section */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Card className="p-4 bg-[#141414] border-[#262626]">
            <p className="text-sm text-gray-400">
              Total Feedback
            </p>

            <p className="text-2xl font-bold text-white mt-1">
              {totalFeedback}
            </p>
          </Card>

          <Card className="p-4 bg-[#141414] border-[#262626]">
            <p className="text-sm text-gray-400">
              Average Rating
            </p>

            <p className="text-2xl font-bold text-white mt-1">
              {averageRating.toFixed(2)}
              <span className="text-sm text-gray-500">
                /5
              </span>
            </p>
          </Card>

        </div>
      )}

    </div>
  );
}