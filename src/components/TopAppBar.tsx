import React, { useState } from 'react';
import { Target, Settings } from 'lucide-react';
import { Screen, WritingGoal } from '../types';
import { ProjectManager } from './ProjectManager';
import { GoalsModal } from './GoalsModal';

interface TopAppBarProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  versionCount?: number;
  showToast: (message: string) => void;
  wordCount?: number;
}

export function TopAppBar({ currentScreen, setCurrentScreen, versionCount = 0, showToast, wordCount = 0 }: TopAppBarProps) {
  const [showGoals, setShowGoals] = useState(false);
  const [goal, setGoal] = useState<WritingGoal>(() => {
    const saved = localStorage.getItem('echo-writing-goal');
    return saved ? JSON.parse(saved) : { targetWords: 50000 };
  });

  const handleSaveGoal = (newGoal: WritingGoal) => {
    setGoal(newGoal);
    localStorage.setItem('echo-writing-goal', JSON.stringify(newGoal));
    showToast('Writing goals updated.');
  };

  const progress = Math.min(100, Math.round((wordCount / goal.targetWords) * 100));

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-50 flex flex-col px-4 md:px-6 py-3 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 gap-3 overflow-visible">
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-0" onClick={() => setCurrentScreen('lore')}>
            <h1 className="font-headline text-primary italic tracking-tighter text-xl md:text-2xl whitespace-nowrap">
              Echo <span className="hidden md:inline text-xs not-italic font-label uppercase tracking-[0.2em] text-on-surface/40 ml-2">Collaborative Writing Partner</span>
            </h1>
          </div>

          <nav className="flex gap-4 md:gap-8 font-label text-[10px] md:text-xs uppercase tracking-wider text-on-surface/60 overflow-x-auto scrollbar-hide no-scrollbar py-1">
            <button 
              onClick={() => setCurrentScreen('lore')}
              className={`hover:text-primary transition-all duration-500 whitespace-nowrap ${currentScreen === 'lore' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
            >
              Lore
            </button>
            <button 
              onClick={() => setCurrentScreen('manuscript')}
              className={`hover:text-primary transition-all duration-500 whitespace-nowrap ${currentScreen === 'manuscript' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
            >
              Manuscript
            </button>
            <button 
              onClick={() => setCurrentScreen('workspace')}
              className={`hover:text-primary transition-all duration-500 whitespace-nowrap ${currentScreen === 'workspace' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
            >
              Workspace
            </button>
            <button 
              onClick={() => setCurrentScreen('voices')}
              className={`hover:text-primary transition-all duration-500 whitespace-nowrap ${currentScreen === 'voices' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
            >
              Voices
            </button>
            <button 
              onClick={() => setCurrentScreen('settings')}
              className={`hover:text-primary transition-all duration-500 whitespace-nowrap ${currentScreen === 'settings' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
            >
              Settings
            </button>
            <button 
              onClick={() => setCurrentScreen('welcome')}
              className={`hover:text-primary transition-all duration-500 whitespace-nowrap ${currentScreen === 'welcome' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`}
            >
              Home
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4 flex-wrap overflow-visible">
          <ProjectManager showToast={showToast} />
          {currentScreen === 'workspace' && (
            <>
              <button 
                onClick={() => setShowGoals(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-surface-container-highest ghost-border hover:bg-surface-container-high transition-colors shrink-0 group relative overflow-hidden"
                title={`${wordCount} / ${goal.targetWords} words`}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
                <Target className="w-3.5 h-3.5 text-primary relative z-10" />
                <span className="font-label text-[10px] md:text-xs uppercase tracking-wider relative z-10">
                  {progress}%
                </span>
              </button>
              <button className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-surface-container-highest ghost-border hover:bg-surface-container-high transition-colors shrink-0">
                <span className="material-symbols-outlined text-sm">history</span>
                <span className="font-label text-[10px] md:text-xs uppercase tracking-wider">v1.0.{versionCount}</span>
              </button>
            </>
          )}
        </div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-b from-surface-container-low to-transparent h-px w-full"></div>
      </header>

      <GoalsModal 
        isOpen={showGoals} 
        onClose={() => setShowGoals(false)} 
        goal={goal} 
        onSave={handleSaveGoal} 
      />
    </>
  );
}
