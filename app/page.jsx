import Link from 'next/link';

export default function Home() {
  return (
     <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30 flex flex-col">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-3 sm:p-6 max-w-8xl mx-auto w-full flex-shrink-0">
        <h1 className="text-xl mx-6 sm:text-2xl font-bold text-white">🎯 Habit Tracker</h1>
        <div className="flex gap-2 sm:gap-4 mx-6">
          <Link 
            href="/auth/login"
            className="px-4 sm:px-6 py-2 text-white hover:text-purple-400 transition font-medium text-sm sm:text-base"
          >
            Login
          </Link>
          <Link 
            href="/auth/signup"
            className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm sm:text-base"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-6xl w-full text-center space-y-8 sm:space-y-12">
          
          {/* Hero */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              Build Better Habits,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                One Day at a Time
              </span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Track your habits, receive daily reminders, and watch your progress grow
            </p>
          </div>

          {/* Features - Compact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📧</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Daily Reminders</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Personalized email reminders at your time
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📊</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Track Progress</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Charts, streaks, and detailed insights
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🔥</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Build Streaks</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Momentum with counters and badges
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-900/20 to-purple-800/20 backdrop-blur-sm rounded-lg border border-purple-500/10 max-w-3xl mx-auto">
            <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light italic">
              "We are what we repeatedly do. Excellence is not an act, but a habit."
            </p>
            <p className="text-purple-400 mt-2 text-sm sm:text-base">— Aristotle</p>
          </div>
        </div>
      </main>

      {/* Footer - Compact */}
      <footer className=" py-4 sm:py-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <p className="text-gray-500">© 2025 Habit Tracker</p>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="text-gray-500 hover:text-white transition">About</a>
              <a href="#" className="text-gray-500 hover:text-white transition">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-white transition">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}