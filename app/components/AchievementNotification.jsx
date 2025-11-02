// app/components/AchievementNotification.jsx
'use client';

import { useState, useEffect } from 'react';

export default function AchievementNotification({ achievements, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievements.length > 0) {
      setIsVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievements]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  if (achievements.length === 0) return null;

  const achievement = achievements[currentIndex];

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 max-w-md w-full transform transition-all duration-300 ${
        isVisible ? 'scale-100 rotate-0' : 'scale-95 rotate-3'
      }`}>
        {/* Sparkle Animation */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-4 left-4 text-yellow-200 animate-pulse">✨</div>
          <div className="absolute top-8 right-6 text-yellow-100 animate-bounce">⭐</div>
          <div className="absolute bottom-6 left-8 text-yellow-300 animate-ping">💫</div>
          <div className="absolute bottom-4 right-4 text-yellow-200 animate-pulse">✨</div>
        </div>

        <div className="relative text-center">
          {/* Header */}
          <div className="text-white text-lg font-bold mb-2">🎉 Achievement Unlocked!</div>
          
          {/* Achievement Icon */}
          <div className="text-6xl mb-4 animate-bounce">
            {achievement.icon}
          </div>

          {/* Achievement Info */}
          <h2 className="text-2xl font-bold text-white mb-2">
            {achievement.title}
          </h2>
          
          <p className="text-white/90 mb-4">
            {achievement.description}
          </p>

          {/* Points */}
          <div className="flex items-center justify-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
            <span className="text-yellow-200 text-xl">💎</span>
            <span className="text-white font-bold">+{achievement.points} points</span>
          </div>

          {/* Progress Indicator */}
          {achievements.length > 1 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {achievements.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200"
            >
              Close
            </button>
            
            {achievements.length > 1 && currentIndex < achievements.length - 1 && (
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-white/90 transition-colors duration-200 font-medium"
              >
                Next ({currentIndex + 1}/{achievements.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}