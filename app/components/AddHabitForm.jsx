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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 space-y-6 shadow-2xl text-gray-100 animate-fadeIn"
      >

        <h2 className="text-2xl font-bold text-indigo-400 text-center">
          ✨ Add New Habit
        </h2>

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

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Habit'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}