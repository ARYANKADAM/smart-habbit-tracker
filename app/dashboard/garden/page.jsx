'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, TrendingUp, Award } from 'lucide-react';
import { getPlantStage, getPlantMessage, getDaysToNextStage, getPlantHealth } from '@/lib/plantGrowth';

export default function GardenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [habitsWithStreaks, setHabitsWithStreaks] = useState([]);

  useEffect(() => {
    fetchHabitsWithStreaks();
  }, []);

  const fetchHabitsWithStreaks = async () => {
    setLoading(true);
    try {
      // Fetch all habits
      const habitsRes = await fetch('/api/habits');
      const habitsData = await habitsRes.json();
      
      if (habitsData.habits) {
        // Fetch streaks for each habit in parallel
        const streakPromises = habitsData.habits.map(async (habit) => {
          const streakRes = await fetch(`/api/habits/${habit._id}/streak`);
          const streakData = await streakRes.json();
          return {
            ...habit,
            currentStreak: streakData.currentStreak || 0,
            longestStreak: streakData.longestStreak || 0,
            isCurrentStreak: streakData.isCurrentStreak || false,
          };
        });

        const habitsWithStreakData = await Promise.all(streakPromises);
        setHabitsWithStreaks(habitsWithStreakData);
      }
    } catch (error) {
      console.error('Failed to fetch garden data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalGardenStats = () => {
    const totalPlants = habitsWithStreaks.length;
    const healthyPlants = habitsWithStreaks.filter(h => h.isCurrentStreak).length;
    const bloomingPlants = habitsWithStreaks.filter(h => h.currentStreak >= 200).length;
    const avgHealth = habitsWithStreaks.length > 0
      ? Math.round(habitsWithStreaks.reduce((sum, h) => sum + getPlantHealth(h.currentStreak, h.isCurrentStreak), 0) / habitsWithStreaks.length)
      : 0;

    return { totalPlants, healthyPlants, bloomingPlants, avgHealth };
  };

  const stats = getTotalGardenStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">🌱</div>
          <p className="text-white">Loading your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              🌱 Habit Garden
              <Sparkles className="text-yellow-400" size={24} />
            </h1>
            <p className="text-gray-400 mt-1">Watch your habits grow into a beautiful garden</p>
          </div>
        </div>

        {/* Garden Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Plants</div>
            <div className="text-2xl font-bold text-white">{stats.totalPlants} 🌿</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Healthy</div>
            <div className="text-2xl font-bold text-green-400">{stats.healthyPlants} 💚</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Blooming</div>
            <div className="text-2xl font-bold text-pink-400">{stats.bloomingPlants} 🌸</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Avg Health</div>
            <div className="text-2xl font-bold text-purple-400">{stats.avgHealth}% 💪</div>
          </div>
        </div>

        {/* Garden Grid */}
        {habitsWithStreaks.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-white mb-2">Your garden is empty</h3>
            <p className="text-gray-400 mb-6">Create your first habit to start growing your garden!</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
            >
              Create First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitsWithStreaks.map((habit) => {
              const plantStage = getPlantStage(habit.currentStreak, habit.isCurrentStreak);
              const plantHealth = getPlantHealth(habit.currentStreak, habit.isCurrentStreak);
              const message = getPlantMessage(plantStage, habit.name);
              const { daysLeft, nextStage } = getDaysToNextStage(habit.currentStreak);

              return (
                <div
                  key={habit._id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => router.push(`/dashboard/habit/${habit._id}`)}
                >
                  {/* Plant Display */}
                  <div className="text-center mb-4">
                    <div
                      className="text-7xl mb-2 transition-transform group-hover:scale-110"
                      style={{ filter: plantHealth < 50 ? 'grayscale(50%)' : 'none' }}
                    >
                      {plantStage.emoji}
                    </div>
                    <div
                      className="text-sm font-semibold mb-1"
                      style={{ color: plantStage.color }}
                    >
                      {plantStage.name}
                    </div>
                    <div className="text-xs text-gray-400">{plantStage.description}</div>
                  </div>

                  {/* Habit Name */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{habit.habitName || habit.name}</h3>
                    <div className="text-xs text-gray-400 capitalize">
                      {habit.category} • {habit.frequency}
                    </div>
                  </div>

                  {/* Health Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Health</span>
                      <span>{plantHealth}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${plantHealth}%` }}
                      />
                    </div>
                  </div>

                  {/* Streak Info */}
                  <div className="flex justify-between items-center text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-purple-400" />
                      <span className="text-white font-semibold">{habit.currentStreak} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-yellow-400" />
                      <span className="text-gray-400">Best: {habit.longestStreak}</span>
                    </div>
                  </div>

                  {/* Next Stage Progress */}
                  {nextStage && (
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">
                        {daysLeft} days until {nextStage.emoji}
                      </div>
                      <div className="text-xs font-semibold" style={{ color: nextStage.color }}>
                        {nextStage.name}
                      </div>
                    </div>
                  )}

                  {/* Motivational Message */}
                  <div className="mt-3 text-xs text-center text-gray-400 italic">
                    "{message}"
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20} />
            Garden Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>🌰 <strong>Seed (0-6 days):</strong> Just getting started - keep watering!</li>
            <li>🌱 <strong>Sprout (7-20 days):</strong> Your habit is taking root - stay consistent!</li>
            <li>🌿 <strong>Young Plant (21-49 days):</strong> Growing strong - you're building momentum!</li>
            <li>🪴 <strong>Mature Plant (50-99 days):</strong> Well established - keep it up!</li>
            <li>🌳 <strong>Tree (100-199 days):</strong> Deeply rooted - you're a champion!</li>
            <li>🌸 <strong>Blooming (200+ days):</strong> Full bloom - you've mastered this habit!</li>
            <li>🥀 <strong>Wilted:</strong> Missed a day? No worries - start watering again!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
