import React from 'react';
import { BookOpen, PenTool, BarChart3, Mic2 } from 'lucide-react';

import { Screen } from '../types';

interface BottomNavBarProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

export function BottomNavBar({ currentScreen, setCurrentScreen }: BottomNavBarProps) {
  const navItems: { id: Screen, icon: any, label: string }[] = [
    { id: 'lore', icon: BookOpen, label: 'Lore' },
    { id: 'workspace', icon: PenTool, label: 'Workspace' },
    { id: 'analysis', icon: BarChart3, label: 'Analysis' },
    { id: 'voices', icon: Mic2, label: 'Voices' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface/90 backdrop-blur-md border-t border-on-surface/15 md:hidden">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-500 active:scale-95 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isActive 
                ? 'text-primary bg-surface-container-highest/50 shadow-[0_0_15px_rgba(183,159,255,0.2)]' 
                : 'text-on-surface/40 hover:bg-surface-container-low'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`} />
            <span className="font-label text-[10px] uppercase tracking-widest">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
