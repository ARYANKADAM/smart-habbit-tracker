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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-blue-950/30 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-500/6 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header Section */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300 group bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              
              <div className="text-center sm:text-right">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-3xl">📊</span>
                  </div>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-1">
                      Monthly Analytics
                    </h1>
                    <p className="text-white/60 text-lg">Your progress insights and trends (Last 30 days)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Weekly Overview */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Last 30 Days Performance</h2>
                <p className="text-white/60">Your overall habit completion summary</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <p className="text-white/70 text-lg mb-2">Monthly Completion Rate</p>
                  <p className="text-6xl font-black text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
                    {data.weeklyPercentage}%
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-white/60 text-sm mb-1">Last 30 Days</p>
                    <p className="text-2xl font-bold text-white">{Math.round(data.weeklyPercentage)}%</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-white/60 text-sm mb-1">Goal</p>
                    <p className="text-2xl font-bold text-white">100%</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 relative">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="6"
                        strokeDasharray={`${(data.weeklyPercentage / 100) * 282.7} 282.7`}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out drop-shadow-lg"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-black text-white">{data.weeklyPercentage}%</div>
                        <div className="text-white/60 text-sm">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Daily Completion Stats */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Daily Progress</h2>
                <p className="text-white/60">Day-by-day habit completion breakdown</p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {data.dailyStats.map((stat, index) => (
                <div
                  key={stat.date}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                        stat.percentage === 100 ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                        stat.percentage >= 75 ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                        stat.percentage >= 50 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                        'bg-gradient-to-br from-red-500 to-pink-500'
                      }`}>
                        {stat.percentage === 100 ? '✓' : Math.round(stat.percentage)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {new Date(stat.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {stat.completedCount} of {stat.totalHabits} habits completed
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex-1 sm:w-64 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            stat.percentage === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                            stat.percentage >= 75 ? 'bg-gradient-to-r from-blue-400 to-indigo-400' :
                            stat.percentage >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                            'bg-gradient-to-r from-red-400 to-pink-400'
                          }`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{Math.round(stat.percentage)}%</div>
                        <div className="text-white/60 text-sm">{stat.completedCount}/{stat.totalHabits}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Habit Performance */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Individual Habit Performance</h2>
                <p className="text-white/60">Detailed breakdown of each habit's progress</p>
              </div>
            </div>
            
            <div className="grid gap-6">
              {data.habitStats.map((habit, index) => (
                <div
                  key={habit.id}
                  className="group bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Habit Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center">
                        <span className="text-2xl">📈</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{habit.name}</h3>
                          <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-medium border border-white/20">
                            {habit.category}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/70 text-sm">Monthly Progress</span>
                            <span className="text-white font-semibold">{habit.completed}/30 days</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                habit.percentage === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                                habit.percentage >= 75 ? 'bg-gradient-to-r from-blue-400 to-indigo-400' :
                                habit.percentage >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                                'bg-gradient-to-r from-red-400 to-pink-400'
                              }`}
                              style={{ width: `${habit.percentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <p className="text-white/60 text-sm">
                          Best Streak: <span className="font-semibold text-purple-400">{habit.longestStreak}</span> days
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="flex gap-4">
                      <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center min-w-[100px]">
                        <div className="text-2xl font-black text-transparent bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text">
                          {habit.currentStreak}
                        </div>
                        <div className="text-white/60 text-xs mt-1">🔥 Current</div>
                      </div>
                      
                      <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center min-w-[100px]">
                        <div className="text-2xl font-black text-white">
                          {Math.round(habit.percentage)}%
                        </div>
                        <div className="text-white/60 text-xs mt-1">Last 30 Days</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
