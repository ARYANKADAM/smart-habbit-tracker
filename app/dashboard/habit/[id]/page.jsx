'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';

export default function HabitDetailPage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = use(params);

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
    // 🌍 FIXED: Always format dates in Asia/Kolkata timezone for consistency
    const date = DateTime.fromISO(dateString).setZone('Asia/Kolkata');
    return date.toFormat('dd/MM');
  };

  const getDayName = (dateString) => {
    // 🌍 FIXED: Always get day name in Asia/Kolkata timezone for consistency
    const date = DateTime.fromISO(dateString).setZone('Asia/Kolkata');
    return date.toFormat('ccc'); // 'ccc' gives short day name like 'Mon', 'Tue', etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-blue-950/30 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-500/6 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8">
        {/* Enhanced Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 group mb-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 hover:bg-white/10"
        >
          <svg 
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        {/* Enhanced Habit Header Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: habit.color }}
                >
                  <span className="text-3xl">📊</span>
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{habit.habitName}</h1>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm font-medium border border-white/20">
                      <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: habit.color }}></span>
                      {habit.category}
                    </span>
                  </div>
                </div>
              </div>
              {habit.description && (
                <p className="text-white/70 text-lg leading-relaxed max-w-2xl">{habit.description}</p>
              )}
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-white/60 text-sm font-medium mb-2">Current Streak</p>
              <p className="text-3xl font-black text-orange-400">{streak.currentStreak}</p>
              <p className="text-orange-300/60 text-xs mt-1">days in a row</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-white/60 text-sm font-medium mb-2">Best Streak</p>
              <p className="text-3xl font-black text-purple-400">{streak.longestStreak}</p>
              <p className="text-purple-300/60 text-xs mt-1">personal record</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-white/60 text-sm font-medium mb-2">Success Rate</p>
              <p className="text-3xl font-black text-green-400">{completionRate}%</p>
              <p className="text-green-300/60 text-xs mt-1">completion rate</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-white/60 text-sm font-medium mb-2">Days Completed</p>
              <p className="text-3xl font-black text-blue-400">{data.totalCompleted}</p>
              <p className="text-blue-300/60 text-xs mt-1">out of {data.totalDays} days</p>
            </div>
          </div>
        </div>

        {/* Enhanced Last 30 Days Section */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">30-Day Progress</h2>
              <p className="text-white/60">Your daily habit completion journey</p>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {chartData.map((day, index) => {
              const formattedDate = formatDateInTimezone(day.date);
              const dayName = getDayName(day.date);

              return (
                <div
                  key={index}
                  className="group flex flex-col items-center gap-2"
                  title={`${formattedDate} (${dayName}) - ${day.completed ? 'Completed' : 'Not completed'}`}
                >
                  <div className="text-xs text-white/50 font-medium">{dayName}</div>
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 group-hover:scale-110 ${
                      day.completed
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30'
                        : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-bold">{formattedDate.split('/')[0]}</div>
                      {day.completed && <div className="text-xs">✓</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Progress Summary */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-white/60">
                <span className="text-2xl font-bold text-white">{data.totalCompleted}</span> completed days
              </div>
              <div className="text-white/60">
                <span className="text-2xl font-bold text-white">{completionRate}%</span> success rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
