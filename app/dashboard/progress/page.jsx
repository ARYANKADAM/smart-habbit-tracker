'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, Flame, TrendingUp, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProgressPage() {
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, goalsRes, challengesRes, habitsRes] = await Promise.all([
        fetch('/api/statistics'),
        fetch('/api/goals'),
        fetch('/api/challenges'),
        fetch('/api/habits'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (goalsRes.ok) {
        const data = await goalsRes.json();
        setGoals(data.goals);
      }

      if (challengesRes.ok) {
        const data = await challengesRes.json();
        setChallenges(data.challenges);
      }

      if (habitsRes.ok) {
        const data = await habitsRes.json();
        setHabits(data.habits);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (habitId, targetCount, period) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, targetCount, period }),
      });

      if (res.ok) {
        toast.success('🎯 Goal created!');
        fetchData();
        setShowGoalModal(false);
      } else {
        toast.error('Failed to create goal');
      }
    } catch (error) {
      console.error('Create goal error:', error);
      toast.error('Failed to create goal');
    }
  };

  const createChallenge = async (habitId, targetDays, duration) => {
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, targetDays, duration }),
      });

      if (res.ok) {
        toast.success('🔥 Challenge created!');
        fetchData();
        setShowChallengeModal(false);
      } else {
        toast.error('Failed to create challenge');
      }
    } catch (error) {
      console.error('Create challenge error:', error);
      toast.error('Failed to create challenge');
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Delete this goal?')) return;
    
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Goal deleted');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const deleteChallenge = async (challengeId) => {
    if (!confirm('Delete this challenge?')) return;
    
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Challenge deleted');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete challenge');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-blue-950/30 flex items-center justify-center">
        <div className="text-xl text-white/80 animate-pulse">Loading progress...</div>
      </div>
    );
  }

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
          {/* Header Section */}
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
                    <span className="text-3xl">🎯</span>
                  </div>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-1">
                      Your Progress
                    </h1>
                    <p className="text-white/60 text-lg">Goals, challenges, and achievements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={<Target className="w-8 h-8" />}
            label="Total Habits"
            value={stats.overview.totalHabits}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="Overall Rate"
            value={`${stats.overview.overallCompletionRate}%`}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<Flame className="w-8 h-8" />}
            label="Longest Streak"
            value={stats.streakStats.longestStreak}
            gradient="from-orange-500 to-red-500"
          />
          <StatCard
            icon={<Award className="w-8 h-8" />}
            label="Total Completions"
            value={stats.overview.totalCompletions}
            gradient="from-purple-500 to-pink-500"
          />
        </div>
      )}
      {/* Active Goals Section */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Active Goals</h2>
              <p className="text-white/60">Track your progress toward specific targets</p>
            </div>
          </div>
          <button
            onClick={() => setShowGoalModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
          >
            + New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.filter(g => g.status === 'active').map(goal => (
            <GoalCard key={goal._id} goal={goal} onDelete={deleteGoal} />
          ))}
          {goals.filter(g => g.status === 'active').length === 0 && (
            <div className="col-span-2 text-center py-12 text-white/60">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No active goals. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Streak Challenges Section */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Streak Challenges</h2>
              <p className="text-white/60">Time-limited challenges to maintain consistency</p>
            </div>
          </div>
          <button
            onClick={() => setShowChallengeModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
          >
            + New Challenge
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.filter(c => c.status === 'active').map(challenge => (
            <ChallengeCard key={challenge._id} challenge={challenge} onDelete={deleteChallenge} />
          ))}
          {challenges.filter(c => c.status === 'active').length === 0 && (
            <div className="col-span-2 text-center py-12 text-white/60">
              <Flame className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No active challenges. Create one to push yourself!</p>
            </div>
          )}
        </div>
      </div>
      {/* Statistics Section */}
      {stats && (
        <>
          {/* Habit Trends */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Habit Performance</h3>
                <p className="text-white/60">Last 30 days completion rates</p>
              </div>
            </div>
            <div className="space-y-6">
              {stats.habitTrends.map(trend => (
                <div key={trend.habitId} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold text-white text-lg">{trend.habitName}</span>
                    <span className="text-white/70">
                      {trend.last30DaysCompletions}/30 days ({trend.completionRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${trend.completionRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Days & Monthly Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📅</span> Best Days
              </h3>
              <div className="space-y-3">
                {stats.bestWorstDays.allDays.slice(0, 3).map((day, idx) => (
                  <div key={day.day} className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-white/10">
                    <span className="text-white font-medium">{idx + 1}. {day.day}</span>
                    <span className="font-bold text-green-400">{day.count} completions</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Monthly Comparison
              </h3>
              <div className="space-y-4">
                {stats.monthlyComparison.map(month => (
                  <div key={month.month}>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/90 font-medium">{month.month}</span>
                      <span className="text-white/70 font-semibold">{month.completionRate}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${month.completionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <GoalModal
          habits={habits}
          onClose={() => setShowGoalModal(false)}
          onCreate={createGoal}
        />
      )}

      {/* Challenge Modal */}
      {showChallengeModal && (
        <ChallengeModal
          habits={habits}
          onClose={() => setShowChallengeModal(false)}
          onCreate={createChallenge}
        />
      )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, gradient }) {
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <div className="text-white/70 text-sm font-medium mb-1">{label}</div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function GoalCard({ goal, onDelete }) {
  const percentage = Math.min(100, Math.round((goal.currentProgress / goal.targetCount) * 100));

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-white">{goal.habitId.displayName || goal.habitId.habitName}</h3>
          <p className="text-sm text-white/60 capitalize">{goal.period} Goal</p>
        </div>
        <button
          onClick={() => onDelete(goal._id)}
          className="text-white/40 hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-2 text-white/80">
          <span>{goal.currentProgress} / {goal.targetCount} completions</span>
          <span className="font-bold text-white">{percentage}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-white/50">
        Ends: {new Date(goal.endDate).toLocaleDateString()}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, onDelete }) {
  const percentage = Math.min(100, Math.round((challenge.currentStreak / challenge.targetDays) * 100));

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-white">{challenge.habitId.displayName || challenge.habitId.habitName}</h3>
          <p className="text-sm text-white/60">{challenge.targetDays}-Day Streak Challenge</p>
        </div>
        <button
          onClick={() => onDelete(challenge._id)}
          className="text-white/40 hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-2 text-white/80">
          <span>🔥 {challenge.currentStreak} / {challenge.targetDays} days</span>
          <span className="font-bold text-white">{percentage}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-white/50">
        Ends: {new Date(challenge.endDate).toLocaleDateString()}
      </div>
    </div>
  );
}

function GoalModal({ habits, onClose, onCreate }) {
  const [habitId, setHabitId] = useState('');
  const [targetCount, setTargetCount] = useState(20);
  const [period, setPeriod] = useState('monthly');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!habitId) return;
    onCreate(habitId, targetCount, period);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              Create New Goal
            </h2>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Habit Selection */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-white/90">
                <span className="text-lg">🎯</span>
                Select Habit
              </label>
              <select
                value={habitId}
                onChange={(e) => setHabitId(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              >
                <option value="" className="bg-slate-800">Choose a habit...</option>
                {habits.map(habit => (
                  <option key={habit._id} value={habit._id} className="bg-slate-800">
                    {habit.displayName || habit.habitName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Target Completions */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-white/90">
                  <span className="text-lg">🎲</span>
                  Target
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center text-2xl font-bold"
                  required
                />
                <p className="text-xs text-white/50 text-center mt-2">completions</p>
              </div>

              {/* Period Selection */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-white/90">
                  <span className="text-lg">📅</span>
                  Period
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center font-semibold"
                >
                  <option value="weekly" className="bg-slate-800">📆 Weekly</option>
                  <option value="monthly" className="bg-slate-800">📊 Monthly</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            {habitId && (
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-4 border border-indigo-500/20">
                <p className="text-sm text-white/70 mb-1">Goal Preview:</p>
                <p className="text-white font-semibold">
                  Complete <span className="text-indigo-400">{habits.find(h => h._id === habitId)?.displayName || habits.find(h => h._id === habitId)?.habitName}</span> {targetCount} times this {period === 'weekly' ? 'week' : 'month'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!habitId}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                Create Goal 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ChallengeModal({ habits, onClose, onCreate }) {
  const [habitId, setHabitId] = useState('');
  const [targetDays, setTargetDays] = useState(7);
  const [duration, setDuration] = useState(14);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!habitId) return;
    onCreate(habitId, targetDays, duration);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              Streak Challenge
            </h2>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Habit Selection */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-white/90">
                <span className="text-lg">🎯</span>
                Select Habit
              </label>
              <select
                value={habitId}
                onChange={(e) => setHabitId(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              >
                <option value="" className="bg-slate-800">Choose a habit...</option>
                {habits.map(habit => (
                  <option key={habit._id} value={habit._id} className="bg-slate-800">
                    {habit.displayName || habit.habitName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Target Streak */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-white/90">
                  <span className="text-lg">🔥</span>
                  Target Streak
                </label>
                <input
                  type="number"
                  min="3"
                  value={targetDays}
                  onChange={(e) => setTargetDays(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center text-2xl font-bold"
                  required
                />
                <p className="text-xs text-white/50 text-center mt-2">days in a row</p>
              </div>

              {/* Challenge Duration */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-white/90">
                  <span className="text-lg">⏱️</span>
                  Time Limit
                </label>
                <input
                  type="number"
                  min={targetDays}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center text-2xl font-bold"
                  required
                />
                <p className="text-xs text-white/50 text-center mt-2">days total</p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-orange-500/10 rounded-2xl p-4 border border-orange-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <p className="text-sm text-white/70 mb-1">Challenge Details:</p>
                  <p className="text-white/90 text-sm">
                    Complete a <span className="text-orange-400 font-bold">{targetDays}-day streak</span> within{' '}
                    <span className="text-orange-400 font-bold">{duration} days</span>
                    {duration > targetDays && (
                      <span className="text-white/60"> ({duration - targetDays} days buffer)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            {habitId && (
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-4 border border-orange-500/20">
                <p className="text-sm text-white/70 mb-1">Challenge Preview:</p>
                <p className="text-white font-semibold">
                  Maintain a <span className="text-orange-400">{targetDays}-day streak</span> for{' '}
                  <span className="text-orange-400">{habits.find(h => h._id === habitId)?.displayName || habits.find(h => h._id === habitId)?.habitName}</span> within {duration} days
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!habitId}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                Start Challenge 🔥
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
