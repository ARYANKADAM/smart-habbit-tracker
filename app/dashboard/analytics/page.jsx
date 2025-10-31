'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/weekly');
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-400 text-lg animate-pulse">
        Loading Analytics...
      </div>
    );
  if (!data)
    return (
      <div className="text-center mt-20 text-gray-400">
        No analytics data available.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-6 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 transition"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-indigo-300 drop-shadow-sm">
            📊 Weekly Analytics
          </h1>
        </div>

        {/* Weekly Overview */}
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Week Overview</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-gray-400 text-sm">Weekly Completion Rate</p>
              <p className="text-5xl font-bold text-indigo-400 mt-1">
                {data.weeklyPercentage}%
              </p>
            </div>
            <div className="w-36 h-36 relative">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeDasharray={`${(data.weeklyPercentage / 100) * 282.7} 282.7`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-indigo-300">
                {data.weeklyPercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Daily Completion Stats */}
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">
            Daily Completion
          </h2>
          <div className="space-y-3">
            {data.dailyStats.map((stat) => (
              <div
                key={stat.date}
                className="flex items-center justify-between p-3 bg-gray-800/70 rounded-lg hover:bg-gray-700/70 transition"
              >
                <span className="text-gray-300 font-medium">
                  {new Date(stat.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-300 font-semibold">
                    {stat.completedCount}/{stat.totalHabits}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Performance */}
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">
            Habit Performance
          </h2>
          <div className="space-y-5">
            {data.habitStats.map((habit) => (
              <div
                key={habit.id}
                className="p-4 bg-gray-800/60 rounded-xl border-l-4 border-indigo-500 hover:bg-gray-700/60 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-100">{habit.name}</h3>
                    <p className="text-xs text-gray-500">{habit.category}</p>
                  </div>
                  <span className="text-2xl font-bold text-orange-400 drop-shadow-sm">
                    {habit.currentStreak} 🔥
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${habit.percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-300 text-sm">
                    {habit.completed}/7
                  </span>
                  <span className="text-gray-400 text-sm">
                    {habit.percentage}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Best Streak:{' '}
                  <span className="font-semibold text-indigo-400">
                    {habit.longestStreak}
                  </span>{' '}
                  days
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
