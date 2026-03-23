import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { WritingGoal } from '../types';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: WritingGoal;
  onSave: (goal: WritingGoal) => void;
}

export function GoalsModal({ isOpen, onClose, goal, onSave }: GoalsModalProps) {
  const [targetWords, setTargetWords] = useState(goal.targetWords.toString());
  const [dailyTarget, setDailyTarget] = useState(goal.dailyTarget?.toString() || '');
  const [deadline, setDeadline] = useState(goal.deadline || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      targetWords: parseInt(targetWords) || 50000,
      dailyTarget: dailyTarget ? parseInt(dailyTarget) : undefined,
      deadline: deadline || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-outline-variant/10 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-headline text-lg lg:text-xl text-on-surface">Writing Goals</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 lg:p-6 space-y-6">
          <div className="space-y-2">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Manuscript Target (Words)</label>
            <input 
              type="number" 
              value={targetWords}
              onChange={(e) => setTargetWords(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="e.g., 50000"
            />
          </div>

          <div className="space-y-2">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Daily Target (Words)</label>
            <input 
              type="number" 
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="e.g., 1000"
            />
          </div>

          <div className="space-y-2">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Deadline (Optional)</label>
            <input 
              type="date" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="p-4 lg:p-6 border-t border-outline-variant/10 bg-surface-container-lowest flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-full font-label text-xs uppercase tracking-widest hover:bg-surface-container-highest transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-sm"
          >
            Save Goals
          </button>
        </div>
      </div>
    </div>
  );
}
