'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HabitCard from '@/components/HabitCard';
import AddHabitForm from '@/components/AddHabitForm';
import { DateTime } from 'luxon';

export default function DashboardPage({ currentUser }) {
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const userTimezone = currentUser?.timezone || 'Asia/Kolkata';

  // Fetch habits on mount
  useEffect(() => {
    fetchHabits();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.user-dropdown')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/habits');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch habits');

      // Mark completedToday based on lastCompletedDate with timezone handling
      const today = DateTime.now().setZone(userTimezone).startOf('day');

      console.log('🔍 Today in timezone:', {
        timezone: userTimezone,
        today: today.toISO(),
        todayMillis: today.toMillis()
      });

      const habitsWithTodayFlag = data.habits.map((habit) => {
        if (!habit.lastCompletedDate) {
          console.log(`❌ ${habit.habitName}: No lastCompletedDate`);
          return { ...habit, completedToday: false };
        }
        
        const lastDate = DateTime.fromISO(habit.lastCompletedDate, { zone: userTimezone }).startOf('day');
        const completedToday = lastDate.toMillis() === today.toMillis();
        
        console.log(`🔍 ${habit.habitName}:`, {
          lastCompletedDate: habit.lastCompletedDate,
          lastDateISO: lastDate.toISO(),
          lastDateMillis: lastDate.toMillis(),
          todayMillis: today.toMillis(),
          match: completedToday,
          diff: Math.abs(lastDate.toMillis() - today.toMillis())
        });
        
        return { ...habit, completedToday };
      });

      setHabits(habitsWithTodayFlag);

      // Fetch streaks
      const streakData = {};
      for (const habit of habitsWithTodayFlag) {
        const resStreak = await fetch(`/api/habits/${habit._id}/streak`);
        const dataStreak = await resStreak.json();
        streakData[habit._id] = dataStreak.streak || { currentStreak: 0, longestStreak: 0 };
      }
      setStreaks(streakData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (habitId, completed) => {
    try {
      const logDate = DateTime.now().setZone(userTimezone).startOf('day').toISO();
      
      console.log('📝 Check-in request:', {
        habitId,
        completed,
        logDate,
        timezone: userTimezone
      });
      
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, completed, date: logDate, timezone: userTimezone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check in');

      console.log('✅ Check-in response:', data);

      // Update streak and mark completedToday
      setStreaks((prev) => ({ ...prev, [habitId]: data.streak }));
      setHabits((prev) =>
        prev.map((h) =>
          h._id === habitId ? { ...h, completedToday: true } : h
        )
      );
      return data.streak;
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  const handleDeleteHabit = (habitId) =>
    setHabits((prev) => prev.filter((h) => h._id !== habitId));

  const handleDropdownRoute = (path) => {
    router.push(path);
    setShowDropdown(false);
  };

  // ✅ Handle new habit creation without refetching
  const handleHabitCreated = async (newHabit) => {
    setShowForm(false);
    
    // Add the new habit to the list with completedToday: false
    setHabits((prev) => [...prev, { ...newHabit, completedToday: false }]);
    
    // Fetch streak for the new habit only
    try {
      const resStreak = await fetch(`/api/habits/${newHabit._id}/streak`);
      const dataStreak = await resStreak.json();
      setStreaks((prev) => ({
        ...prev,
        [newHabit._id]: dataStreak.streak || { currentStreak: 0, longestStreak: 0 }
      }));
    } catch (err) {
      console.error('Failed to fetch streak for new habit:', err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading your habits...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30 p-4 sm:p-8">
      {/* Navbar */}
      <div className="flex justify-between items-center mb-8">
        {/* Left: App Title */}
        <h1 className="text-3xl font-bold text-white">Habit Tracker</h1>

        {/* Right: Add Habit + Profile Dropdown */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-500/20"
          >
            + Add Habit
          </button>

          <div className="relative user-dropdown">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              {currentUser?.displayName || 'Profile'}
              <svg
                className={`w-4 h-4 transition-transform ${
                  showDropdown ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleDropdownRoute('/dashboard/settings')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                >
                  Settings
                </button>
                <button
                  onClick={() => handleDropdownRoute('/dashboard/achievements')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                >
                  Achievements
                </button>
                <button
                  onClick={() => handleDropdownRoute('/dashboard/analytics')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                >
                  Analytics
                </button>
                <button
                  onClick={() => handleDropdownRoute('/auth/login')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Habit Form */}
      {showForm && (
        <AddHabitForm
          onSuccess={handleHabitCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-12 rounded-lg text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-gray-300 text-xl mb-2">No habits yet.</p>
          <p className="text-gray-500">Create your first habit to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <HabitCard
              key={habit._id}
              habit={habit}
              streak={streaks[habit._id]}
              onCheckIn={handleCheckIn}
              onDelete={handleDeleteHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
}