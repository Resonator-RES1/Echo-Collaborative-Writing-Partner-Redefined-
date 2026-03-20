import React from 'react';

import { Screen } from '../types';

interface TopAppBarProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  versionCount?: number;
}

export function TopAppBar({ currentScreen, setCurrentScreen, versionCount = 0 }: TopAppBarProps) {
  return (
    <header className="sticky top-0 left-0 w-full z-30 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentScreen('lore')}>
        <h1 className="font-headline text-primary italic tracking-tighter text-2xl">
          Echo <span className="text-xs not-italic font-label uppercase tracking-[0.2em] text-on-surface/40 ml-2">Collaborative Writing Partner</span>
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <nav className="flex gap-8 font-label text-xs uppercase tracking-wider text-on-surface/60">
          <button 
            onClick={() => setCurrentScreen('lore')}
            className={`hover:text-primary transition-all duration-500 ${currentScreen === 'lore' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
          >
            Lore
          </button>
          <button 
            onClick={() => setCurrentScreen('workspace')}
            className={`hover:text-primary transition-all duration-500 ${currentScreen === 'workspace' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
          >
            Workspace
          </button>
          <button 
            onClick={() => setCurrentScreen('analysis')}
            className={`hover:text-primary transition-all duration-500 ${currentScreen === 'analysis' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
          >
            Analysis
          </button>
          <button 
            onClick={() => setCurrentScreen('voices')}
            className={`hover:text-primary transition-all duration-500 ${currentScreen === 'voices' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
          >
            Voices
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {currentScreen === 'workspace' && (
          <button className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-highest ghost-border hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-sm">history</span>
            <span className="font-label text-xs uppercase tracking-wider">v1.0.{versionCount}</span>
          </button>
        )}
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${currentScreen === 'workspace' ? 'bg-gradient-to-tr from-primary to-primary-container p-0.5' : 'border border-primary/20 bg-surface-container'} overflow-hidden`}>
          <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center overflow-hidden">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1Yn_jDDQshln0qgr5EFoaf9iL4KnugqxRzUtTnYh5bd5mxkEE23ToxDGXdked3Y9MuSI-XckDjx5ER-i6rzuStSXEdDFCBsIqw5JQU_bJLQ7lCrgBLCrBD9s5g_cz4cQntKU-L1UkUOklR9MTIaDhVJBXPyuhurd69HQwlRFUDmwAqbhDnRJn1II1HAxaBMIpGZxa0A1v9S9xc5D3tgnHJgj7FKh_j-TWTTHNI5B5MqLeTGayL8YXXAfWggbvRwMO_ZyZwyRC2NY" 
              alt="Author Profile" 
              className={`w-full h-full object-cover ${currentScreen !== 'workspace' ? 'grayscale contrast-125' : ''}`} 
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 bg-gradient-to-b from-surface-container-low to-transparent h-px w-full"></div>
    </header>
  );
}
