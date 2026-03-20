import React, { useEffect, useState, useRef } from 'react';
import { VoiceProfile } from '../../types';
import { getVoiceFidelity } from '../../services/geminiService';
import { Activity } from 'lucide-react';

interface DynamicFidelityFeedbackProps {
  draft: string;
  voiceProfiles: VoiceProfile[];
}

export const DynamicFidelityFeedback: React.FC<DynamicFidelityFeedbackProps> = ({ draft, voiceProfiles }) => {
  const [score, setScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDraftRef = useRef<string>('');

  const masterVoice = voiceProfiles.find(v => v.isMasterVoice);

  useEffect(() => {
    if (!masterVoice || !draft.trim()) {
      setScore(null);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (draft === lastDraftRef.current) return;
      setIsCalculating(true);
      lastDraftRef.current = draft;
      const newScore = await getVoiceFidelity(draft, voiceProfiles);
      setScore(newScore);
      setIsCalculating(false);
    }, 3000); // 3 seconds debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [draft, voiceProfiles, masterVoice]);

  if (!masterVoice) return null;

  const getScoreColor = () => {
    if (score === null) return 'text-gray-400 bg-gray-100';
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const getScoreText = () => {
    if (score === null) return 'Analyzing...';
    if (score >= 80) return 'Voice Locked';
    if (score >= 60) return 'Drifting';
    return 'Voice Lost';
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-xs font-medium">
      <Activity className={`w-4 h-4 ${isCalculating ? 'animate-pulse text-indigo-500' : getScoreColor().split(' ')[0]}`} />
      <span className="text-gray-700">Master Voice:</span>
      <span className={`px-2 py-0.5 rounded-full ${getScoreColor()}`}>
        {score !== null ? `${score}% - ` : ''}{getScoreText()}
      </span>
    </div>
  );
};
