import React, { useEffect, useState } from 'react';
import { getSetting, putSetting } from '../services/dbService';
import { Check } from 'lucide-react';

type Theme = 'midnight' | 'parchment';

export const ThemeManager: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('midnight');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getSetting('app_theme');
      if (savedTheme) {
        setCurrentTheme(savedTheme as Theme);
        if (savedTheme === 'parchment') {
          document.documentElement.classList.add('parchment');
        } else {
          document.documentElement.classList.remove('parchment');
        }
      }
    };
    loadTheme();
  }, []);

  const handleThemeChange = async (theme: Theme) => {
    setCurrentTheme(theme);
    await putSetting('app_theme', theme);
    if (theme === 'parchment') {
      document.documentElement.classList.add('parchment');
    } else {
      document.documentElement.classList.remove('parchment');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Midnight Lavender Card */}
        <button
          onClick={() => handleThemeChange('midnight')}
          className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left ${
            currentTheme === 'midnight' 
              ? 'border-primary bg-surface-container-high' 
              : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label font-bold text-on-surface">Midnight Lavender</span>
              {currentTheme === 'midnight' && (
                <div className="bg-primary text-on-primary-fixed p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Preview */}
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-[#0b1325] border border-white/10 shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#d0c0ff] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#2d3448] border border-white/10 shadow-lg" />
            </div>
            
            <p className="text-xs text-on-surface-variant">
              Deep navy and soft lavender. Perfect for late-night focus and atmospheric drafting.
            </p>
          </div>
        </button>

        {/* Classic Parchment Card */}
        <button
          onClick={() => handleThemeChange('parchment')}
          className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left ${
            currentTheme === 'parchment' 
              ? 'border-[#8b5e3c] bg-[#f1ebd7]' 
              : 'border-outline-variant bg-surface-container-low hover:border-[#8b5e3c]/50'
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`font-label font-bold ${currentTheme === 'parchment' ? 'text-[#3c3836]' : 'text-on-surface'}`}>
                Classic Parchment
              </span>
              {currentTheme === 'parchment' && (
                <div className="bg-[#8b5e3c] text-white p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Preview */}
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-[#fdfaf3] border border-[#d5c4a1] shadow-sm" />
              <div className="w-12 h-12 rounded-lg bg-[#8b5e3c] shadow-sm" />
              <div className="w-12 h-12 rounded-lg bg-[#dfd4b3] border border-[#d5c4a1] shadow-sm" />
            </div>
            
            <p className={`text-xs ${currentTheme === 'parchment' ? 'text-[#665c54]' : 'text-on-surface-variant'}`}>
              Warm cream and leather brown. Evokes the feeling of a physical study and traditional writing.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
