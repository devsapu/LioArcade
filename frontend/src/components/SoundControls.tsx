'use client';

import { useState } from 'react';
import { useSound } from '@/hooks/useSound';

export function SoundControls() {
  const {
    playSound,
    toggleSound,
    toggleBackgroundMusic,
    setVolume,
    setBackgroundMusicVolume,
    soundEnabled,
    backgroundMusicEnabled,
    volume,
    backgroundMusicVolume,
  } = useSound();

  const [showControls, setShowControls] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => {
          setShowControls(!showControls);
          playSound('click');
        }}
        className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-2 border-primary-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:scale-110"
        aria-label="Sound controls"
      >
        <span className="text-2xl">
          {soundEnabled ? '🔊' : '🔇'}
        </span>
      </button>

      {/* Controls Panel */}
      {showControls && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 min-w-[200px] border-2 border-primary-200 dark:border-gray-700 animate-slide-up">
          <div className="space-y-4">
            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound Effects</span>
              <button
                onClick={() => {
                  toggleSound();
                  playSound('click');
                }}
                className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                  soundEnabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects Volume */}
            {soundEnabled && (
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Effects Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    playSound('click');
                  }}
                  className="w-full"
                />
              </div>
            )}

            {/* Background Music Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Music</span>
              <button
                onClick={() => {
                  toggleBackgroundMusic();
                  playSound('click');
                }}
                className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                  backgroundMusicEnabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    backgroundMusicEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Background Music Volume */}
            {backgroundMusicEnabled && (
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Music Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={backgroundMusicVolume}
                  onChange={(e) => setBackgroundMusicVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Test Sound Button */}
            <button
              onClick={() => playSound('success')}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Test Sound
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
