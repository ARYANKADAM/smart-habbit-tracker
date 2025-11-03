// app/dashboard/achievements/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const categories = {
  streaks: { name: 'Streaks', color: 'from-orange-500 to-red-500', icon: '🔥' },
  completion: { name: 'Completion', color: 'from-green-500 to-emerald-500', icon: '✅' },
  consistency: { name: 'Consistency', color: 'from-blue-500 to-indigo-500', icon: '📈' },
  milestones: { name: 'Milestones', color: 'from-purple-500 to-pink-500', icon: '🏆' },
  special: { name: 'Special', color: 'from-yellow-500 to-amber-500', icon: '⭐' }
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/achievements');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setAchievements(data.achievements);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Not unlocked';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-6 w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-white/10 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchAchievements}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 hover:border-white/30 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Achievements</h1>
          <p className="text-gray-300">Celebrate your habit-building journey!</p>
        </div>

        {/* Enhanced Stats Overview */}
        {stats && (
          <>
            {/* Main Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                <div className="text-3xl font-bold text-white">{stats.totalPoints}</div>
                <div className="text-sm text-gray-300">Total Points</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                <div className="text-3xl font-bold text-white">{stats.unlockedCount}</div>
                <div className="text-sm text-gray-300">Achievements Unlocked</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
                <div className="text-3xl font-bold text-white">{stats.totalCount}</div>
                <div className="text-sm text-gray-300">Total Available</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30">
                <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
                <div className="text-sm text-gray-300">Achievement Progress</div>
              </div>
            </div>
            
            {/* Current Progress Stats */}
            {stats.currentStats && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>📊</span> Current Progress
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{stats.currentStats.maxStreak}</div>
                    <div className="text-sm text-gray-300">Best Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.currentStats.totalHabits}</div>
                    <div className="text-sm text-gray-300">Active Habits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.currentStats.weeklyCompletionRate}%</div>
                    <div className="text-sm text-gray-300">Weekly Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{stats.currentStats.totalCompletedDays}</div>
                    <div className="text-sm text-gray-300">Total Days</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-lg border border-white/20'
              }`}
            >
              All Categories
            </button>
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-lg border border-white/20'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const category = categories[achievement.category];
            return (
              <div
                key={achievement.id}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  achievement.isUnlocked
                    ? `bg-gradient-to-br ${category.color} border-white/30 shadow-2xl`
                    : 'bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10'
                }`}
              >
                {/* Unlock Glow Effect */}
                {achievement.isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                )}
                
                <div className="relative p-6">
                  {/* Category Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                    achievement.isUnlocked 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    <span>{category.icon}</span>
                    {category.name}
                  </div>

                  {/* Achievement Icon */}
                  <div className={`text-4xl mb-4 ${achievement.isUnlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>

                  {/* Achievement Info */}
                  <h3 className={`text-xl font-bold mb-2 ${achievement.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${achievement.isUnlocked ? 'text-white/80' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar for Locked Achievements */}
                  {!achievement.isUnlocked && achievement.progressPercent > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs text-gray-400">{achievement.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                          style={{ width: `${achievement.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Points and Date */}
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${achievement.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                      <span className="text-lg">💎</span>
                      <span className="font-bold">{achievement.points} pts</span>
                    </div>
                    
                    {achievement.isUnlocked ? (
                      <div className="text-xs text-white/60">
                        {formatDate(achievement.unlockedAt)}
                      </div>
                    ) : achievement.meetsCondition ? (
                      <div className="text-xs text-green-400 font-medium">
                        Ready to unlock!
                      </div>
                    ) : null}
                  </div>

                  {/* Lock Overlay for Locked Achievements */}
                  {!achievement.isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                      <div className="text-4xl text-gray-400">🔒</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Achievements Message */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-2">No achievements yet</h2>
            <p className="text-gray-400">Keep building your habits to unlock achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
}