'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Trash2, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

export default function HabitCard({ habit, streak, onCheckIn, onDelete }) {
  const [loading, setLoading] = useState(false);
  // ✅ FIX: Update local state when prop changes (when navigating back)
  const [completedToday, setCompletedToday] = useState(habit.completedToday || false);

  // ✅ NEW: Sync local state with prop when it changes
  useEffect(() => {
    setCompletedToday(habit.completedToday || false);
  }, [habit.completedToday]);

  const handleCheck = async (completed) => {
    setLoading(true);
    try {
      const result = await onCheckIn(habit._id, completed);
      toast.success(completed ? '✅ Great job!' : '⏭️ Skipped');
      setCompletedToday(completed);
    } catch (err) {
      toast.error('Error checking in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/habits/${habit._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted successfully');
        onDelete(habit._id);
      } else toast.error('Failed to delete');
    } catch (err) {
      toast.error('Error deleting');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl hover:border-white/30 relative overflow-hidden">
      {/* Color accent stripe */}
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: habit.color }}
      ></div>
      
      {/* Completion status indicator */}
      {completedToday && (
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            ></div>
            <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
              {habit.habitName}
            </h3>
          </div>
          
          {habit.description && (
            <p className="text-white/60 text-sm mb-3 line-clamp-2 leading-relaxed">
              {habit.description}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-white/80 border border-white/20">
              {habit.category}
            </span>
            {completedToday && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-400/20 text-green-300 border border-green-400/30">
                ✓ Done
              </span>
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="relative">
            <div className="text-3xl font-black text-transparent bg-gradient-to-br from-orange-400 to-red-400 bg-clip-text drop-shadow-sm">
              {streak?.currentStreak || 0}
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <p className="text-xs text-white/50 font-medium mt-1">🔥 Day Streak</p>
          {streak?.longestStreak > 0 && streak?.longestStreak !== streak?.currentStreak && (
            <p className="text-xs text-white/30 mt-1">Best: {streak.longestStreak}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        {!completedToday ? (
          <>
            <button
              onClick={() => handleCheck(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              <CheckCircle size={18} /> 
              <span className="hidden sm:inline">Complete</span>
            </button>

            <button
              onClick={() => handleCheck(false)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white/90 py-3 px-4 rounded-xl font-medium transition-all duration-300 border border-white/20 hover:border-white/30 disabled:opacity-50"
            >
              <XCircle size={18} />
              <span className="hidden sm:inline">Skip</span>
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 text-green-400 py-3 px-4 rounded-xl font-medium border border-green-500/30">
            <CheckCircle size={18} />
            <span>Completed Today!</span>
          </div>
        )}

        <Link
          href={`/dashboard/habit/${habit._id}`}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[44px]"
        >
          <BarChart3 size={18} />
          <span className="hidden lg:inline">Analytics</span>
        </Link>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 py-3 px-4 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 min-w-[44px]"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}