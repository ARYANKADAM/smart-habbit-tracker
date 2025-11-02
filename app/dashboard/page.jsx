'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HabitCard from '@/components/HabitCard';
import AddHabitForm from '@/components/AddHabitForm';
import AchievementNotification from '@/components/AchievementNotification';
import { DateTime } from 'luxon';

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState([]);

  const userTimezone = currentUser?.timezone || 'Asia/Kolkata';

  // Function to get display name with proper fallback
  const getDisplayName = () => {
    console.log('🔍 Getting display name...');
    if (currentUser?.displayName && currentUser.displayName.trim() !== '') {
      console.log('✅ Using displayName:', currentUser.displayName);
      return currentUser.displayName.trim();
    }
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      console.log('⚠️ Using email fallback:', emailName);
      return emailName;
    }
    console.log('❌ No user data, using fallback');
    return 'User';
  };

  // Fetch user data and habits on mount
  useEffect(() => {
    fetchUserData();
    fetchHabits();
  }, []);

  // Fetch user data from API
  const fetchUserData = async () => {
    setUserLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/auth/login');
        return;
      }
      const data = await res.json();
      console.log('🔍 Fetched user data:', data.user);
      console.log('🔍 Display name from API:', data.user?.displayName);
      setCurrentUser(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/auth/login');
    } finally {
      setUserLoading(false);
    }
  };

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
          h._id === habitId ? { ...h, completedToday: completed } : h
        )
      );
      return data;
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  const handleDeleteHabit = (habitId) =>
    setHabits((prev) => prev.filter((h) => h._id !== habitId));

  const handleAchievementUnlock = (newAchievements) => {
    setAchievementNotifications(newAchievements);
  };

  const handleCloseAchievements = () => {
    setAchievementNotifications([]);
  };

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

  if (loading || userLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
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
        {/* Enhanced Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Left: Welcome Section */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Welcome back, {getDisplayName()}! 👋
              </h1>
              <p className="text-white/60 text-sm sm:text-base">
                Ready to build some amazing habits today?
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Habit
              </button>

              {/* Enhanced Profile Dropdown */}
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-white/20 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="max-w-32 truncate">
                    {getDisplayName()}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      showDropdown ? 'rotate-180' : 'rotate-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-52 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-20 overflow-hidden">
                    <button
                      onClick={() => handleDropdownRoute('/dashboard/settings')}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Settings
                    </button>
                    <button
                      onClick={() => handleDropdownRoute('/dashboard/analytics')}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      Analytics
                    </button>
                    <button
                      onClick={() => handleDropdownRoute('/dashboard/achievements')}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
                    >
                      <span className="w-4 h-4 text-center">🏆</span>
                      Achievements
                    </button>
                    <div className="border-t border-white/10">
                      <button
                        onClick={() => handleDropdownRoute('/auth/login')}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 01-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          {habits.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{habits.length}</div>
                <div className="text-white/60 text-sm">Total Habits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {habits.filter(h => h.completedToday).length}
                </div>
                <div className="text-white/60 text-sm">Completed Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {Math.round(Object.values(streaks).reduce((sum, s) => sum + (s?.currentStreak || 0), 0) / Math.max(habits.length, 1))}
                </div>
                <div className="text-white/60 text-sm">Avg Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((habits.filter(h => h.completedToday).length / Math.max(habits.length, 1)) * 100)}%
                </div>
                <div className="text-white/60 text-sm">Success Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Add Habit Form */}
        {showForm && (
          <AddHabitForm
            onSuccess={handleHabitCreated}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Enhanced Habits Section */}
        {habits.length === 0 ? (
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 p-16 rounded-3xl text-center shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🎯</span>
            </div>
            <h3 className="text-white text-2xl font-semibold mb-3">Ready to Start Your Journey?</h3>
            <p className="text-white/70 text-lg mb-6 max-w-md mx-auto">
              Create your first habit and begin building the life you want, one day at a time.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></span>
                Your Habits ({habits.length})
              </h2>
              <p className="text-white/60">Track your progress and build consistency</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => (
                <HabitCard
                  key={habit._id}
                  habit={habit}
                  streak={streaks[habit._id]}
                  onCheckIn={handleCheckIn}
                  onDelete={handleDeleteHabit}
                  onAchievementUnlock={handleAchievementUnlock}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Achievement Notifications */}
      {achievementNotifications.length > 0 && (
        <AchievementNotification
          achievements={achievementNotifications}
          onClose={handleCloseAchievements}
        />
      )}
    </div>
  );
}