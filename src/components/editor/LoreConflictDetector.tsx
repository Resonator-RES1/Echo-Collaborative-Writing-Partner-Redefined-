import React, { useEffect, useState, useRef } from 'react';
import { LoreEntry } from '../../types';
import { checkLoreConflicts } from '../../services/geminiService';
import { AlertTriangle } from 'lucide-react';

interface LoreConflictDetectorProps {
  draft: string;
  loreEntries: LoreEntry[];
}

export const LoreConflictDetector: React.FC<LoreConflictDetectorProps> = ({ draft, loreEntries }) => {
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDraftRef = useRef<string>('');

  useEffect(() => {
    if (loreEntries.length === 0 || !draft.trim()) {
      setConflicts([]);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (draft === lastDraftRef.current) return;
      setIsCalculating(true);
      lastDraftRef.current = draft;
      const newConflicts = await checkLoreConflicts(draft, loreEntries);
      setConflicts(newConflicts);
      setIsCalculating(false);
    }, 5000); // 5 seconds debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [draft, loreEntries]);

  if (loreEntries.length === 0) return null;

  const hasConflicts = conflicts.length > 0;

  return (
    <div className="relative flex items-center">
      <div 
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium cursor-pointer transition-colors ${
          hasConflicts ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100' : 'border-gray-200 bg-white text-gray-500'
        }`}
        onMouseEnter={() => hasConflicts && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AlertTriangle className={`w-4 h-4 ${isCalculating ? 'animate-pulse text-indigo-500' : hasConflicts ? 'text-amber-600' : 'text-gray-400'}`} />
        <span>{hasConflicts ? `${conflicts.length} Lore Conflict${conflicts.length > 1 ? 's' : ''}` : 'Lore Consistent'}</span>
      </div>

      {showTooltip && hasConflicts && (
        <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-surface-container-highest border border-outline-variant/30 rounded-lg shadow-xl z-50 text-sm text-on-surface">
          <h4 className="font-bold mb-2 text-amber-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Detected Conflicts
          </h4>
          <ul className="space-y-2 list-disc pl-4">
            {conflicts.map((conflict, i) => (
              <li key={i} className="text-on-surface-variant leading-tight">{conflict}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
