import Link from 'next/link';

export default function Home() {
  return (
     <div className="min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30 flex flex-col relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      {/* Enhanced Navigation */}
      <nav className="flex justify-between items-center p-4 sm:p-6 max-w-7xl mx-auto w-full flex-shrink-0 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Habit Tracker</h1>
        </div>
        <div className="flex gap-3 sm:gap-4">
          <Link 
            href="/auth/login"
            className="px-4 sm:px-6 py-2.5 text-white hover:text-purple-300 transition-all duration-300 font-medium text-sm sm:text-base hover:bg-white/5 rounded-lg"
          >
            Login
          </Link>
          <Link 
            href="/auth/signup"
            className="px-6 sm:px-8 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Enhanced Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 relative z-10">
        <div className="max-w-6xl w-full text-center space-y-12 sm:space-y-16">
          
          {/* Enhanced Hero Section */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
              ✨ Transform Your Life, One Habit at a Time
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight">
              Build Better
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 animate-gradient">
                Habits Daily
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Track your progress, build lasting streaks, and receive personalized reminders to stay on track with your goals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link 
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
              >
                Start Building Today 🚀
              </Link>
              <Link 
                href="/auth/login"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm"
              >
                Already have an account?
              </Link>
            </div>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-16">
            <div className="group p-6 sm:p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                📧
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Reminders</h3>
              <p className="text-gray-300 leading-relaxed">
                Get personalized email notifications at the perfect time to keep your habits on track.
              </p>
            </div>

            <div className="group p-6 sm:p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-green-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                📊
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Visual Progress</h3>
              <p className="text-gray-300 leading-relaxed">
                Beautiful charts and analytics help you understand your patterns and celebrate wins.
              </p>
            </div>

            <div className="group p-6 sm:p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-orange-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🔥
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Streak Power</h3>
              <p className="text-gray-300 leading-relaxed">
                Build momentum with streak counters and unlock achievements as you grow.
              </p>
            </div>
          </div>

          {/* Enhanced Quote Section */}
          <div className="relative max-w-4xl mx-auto mt-20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-full"></div>
            <div className="relative p-8 sm:p-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
              <div className="text-4xl text-purple-400 mb-4">"</div>
              <p className="text-xl sm:text-2xl md:text-3xl text-white font-light italic leading-relaxed mb-6">
                We are what we repeatedly do. Excellence is not an act, but a habit.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                <p className="text-purple-300 text-lg font-medium">Aristotle</p>
              </div>
            </div>
          </div>

          {/* Social Proof / Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 opacity-70">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">1000+</div>
              <div className="text-sm text-gray-400">Habits Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">95%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">30d</div>
              <div className="text-sm text-gray-400">Avg. Streak</div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="mt-20 py-8 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <p className="text-gray-400 text-sm">© 2025 Habit Tracker. Built with ❤️</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-purple-300 transition-colors text-sm font-medium">About</a>
              <a href="#" className="text-gray-400 hover:text-purple-300 transition-colors text-sm font-medium">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-purple-300 transition-colors text-sm font-medium">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}