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
      const updatedStreak = await onCheckIn(habit._id, completed);
      toast.success(completed ? '✅ Great job!' : '⏭️ Skipped');
      setCompletedToday(true);
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
    <div
      className="bg-gray-900/70 p-6 rounded-2xl border border-gray-700 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
      style={{ borderLeft: `5px solid ${habit.color}` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-100">{habit.habitName}</h3>
          {habit.description && <p className="text-gray-400 mt-1">{habit.description}</p>}
          <span className="inline-block px-2 py-1 text-xs rounded-lg bg-gray-800 text-gray-300 mt-2">
            {habit.category}
          </span>
        </div>

        <div className="text-right">
          <div className="text-3xl font-extrabold text-orange-400 drop-shadow-sm">
            {streak?.currentStreak || 0}
          </div>
          <p className="text-xs text-gray-400">🔥 Streak</p>
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        {!completedToday && (
          <>
            <button
              onClick={() => handleCheck(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600/80 hover:bg-green-500 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              <CheckCircle size={18} /> Done
            </button>

            <button
              onClick={() => handleCheck(false)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-700/70 hover:bg-gray-600 text-gray-100 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              <XCircle size={18} /> Skip
            </button>
          </>
        )}

        <Link
          href={`/dashboard/habit/${habit._id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600/80 hover:bg-blue-500 text-white py-2 rounded-lg font-semibold transition"
        >
          <BarChart3 size={18} /> View
        </Link>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 bg-red-600/80 hover:bg-red-500 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}