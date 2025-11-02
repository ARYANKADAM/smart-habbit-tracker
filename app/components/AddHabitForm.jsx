'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

const CATEGORIES = ['Health', 'Productivity', 'Learning', 'Mindfulness', 'Other'];

export default function AddHabitForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  const selectedColor = watch('color', '#3b82f6');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Failed to create habit');
        return;
      }

      toast.success('✅ Habit created!');
      reset();
      
      // ✅ Pass the new habit to parent instead of just calling onSuccess()
      onSuccess?.(result.habit);
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4">
      <div className="relative w-full max-w-lg">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
        
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 space-y-6 shadow-2xl text-white"
        >
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Create New Habit
            </h2>
            <p className="text-white/60 text-sm">
              Build consistency one day at a time
            </p>
          </div>

        {/* Habit Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Habit Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            {...register('habitName', { required: 'Habit name is required' })}
            className="w-full px-4 py-2 rounded-lg bg-gray-800/60 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-100 placeholder-gray-400"
            placeholder="e.g., Exercise"
          />
          {errors.habitName && (
            <p className="text-red-400 text-sm mt-1">{errors.habitName.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows="2"
            placeholder="Why do you want to build this habit?"
            className="w-full px-4 py-2 rounded-lg bg-gray-800/60 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-100 placeholder-gray-400"
          />
        </div>

        {/* Category and Color */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              {...register('category')}
              defaultValue="Other"
              className="w-full px-4 py-2 rounded-lg bg-gray-800/60 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-100"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => {
                const isSelected = selectedColor === color;
                return (
                  <label
                    key={color}
                    className={`cursor-pointer relative rounded-full transition 
                      ${isSelected ? 'ring-2 ring-offset-2 ring-indigo-400' : ''}`}
                  >
                    <input
                      type="radio"
                      value={color}
                      {...register('color')}
                      defaultChecked={color === '#3b82f6'}
                      className="hidden"
                    />
                    <div
                      className={`w-7 h-7 rounded-full border-2 ${
                        isSelected ? 'border-indigo-400 scale-110' : 'border-gray-600'
                      } transition-transform duration-150`}
                      style={{ backgroundColor: color }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 rounded-full bg-white/10 pointer-events-none" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

          {/* Enhanced Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Habit
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white/90 py-4 rounded-xl font-semibold transition-all duration-300 border border-white/20 hover:border-white/30"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}