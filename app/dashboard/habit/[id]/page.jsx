'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HabitDetailPage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = params;

  useEffect(() => {
    fetchHabitAnalytics();
  }, [id]);

  const fetchHabitAnalytics = async () => {
    try {
      const res = await fetch(`/api/habits/${id}/analytics`);
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading habit analytics...
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Habit not found
      </div>
    );

  const { habit, streak, completionRate, chartData } = data;

  const formatDateInTimezone = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}`;
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30 text-white">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="text-indigo-400 hover:text-indigo-300 mb-4 inline-block"
      >
        ← Back to Dashboard
      </Link>

      {/* Habit Header Card */}
      <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">{habit.habitName}</h1>
            {habit.description && (
              <p className="text-gray-300 mt-2">{habit.description}</p>
            )}
            <span className="inline-block mt-3 px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
              {habit.category}
            </span>
          </div>
          <div
            className="w-16 h-16 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
        </div>

        {/* Streaks & Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center">
            <p className="text-gray-400 text-sm">Current Streak</p>
            <p className="text-3xl font-bold text-orange-400">{streak.currentStreak} 🔥</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center">
            <p className="text-gray-400 text-sm">Longest Streak</p>
            <p className="text-3xl font-bold text-purple-400">{streak.longestStreak}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center">
            <p className="text-gray-400 text-sm">Completion Rate</p>
            <p className="text-3xl font-bold text-green-400">{completionRate}%</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center">
            <p className="text-gray-400 text-sm">Days Completed</p>
            <p className="text-3xl font-bold text-blue-400">{data.totalCompleted}/{data.totalDays}</p>
          </div>
        </div>
      </div>

      {/* Last 30 Days Grid */}
      <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Last 30 Days</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {chartData.map((day, index) => {
            const formattedDate = formatDateInTimezone(day.date);
            const dayName = getDayName(day.date);

            return (
              <div
                key={index}
                className="flex flex-col items-center gap-1"
                title={`${formattedDate} (${dayName})`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    day.completed
                      ? 'bg-green-400 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  <span className="text-[9px]">{formattedDate}</span>
                  <span className="text-[9px]">{dayName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
