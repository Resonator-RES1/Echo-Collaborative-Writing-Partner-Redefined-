import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Brain, Key } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: any) => void;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, setSelectedModel }) => {
  const [hasCustomKey, setHasCustomKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasCustomKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasCustomKey(true);
    }
  };

  const modelOptions = [
    { 
      id: 'gemini-3.1-flash-lite-preview', 
      label: 'Flash Lite', 
      icon: <Zap className="w-4 h-4" />, 
      description: 'Ultra-fast, efficient refinement.' 
    },
    { 
      id: 'gemini-3-flash-preview', 
      label: 'Flash', 
      icon: <Cpu className="w-4 h-4" />, 
      description: 'Balanced speed and narrative depth.' 
    },
    { 
      id: 'gemini-3.1-pro-preview', 
      label: 'Pro', 
      icon: <Brain className="w-4 h-4" />, 
      description: 'Deepest reasoning for complex epics.' 
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/50 font-black">
          <Cpu className="w-3.5 h-3.5" />
          <span>Intelligence Model</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {modelOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedModel(opt.id)}
            className={`
              flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all text-center group relative overflow-hidden
              ${selectedModel === opt.id 
                ? 'bg-primary text-on-primary-fixed border-primary shadow-lg scale-[1.02] z-10' 
                : 'bg-surface-container-highest/20 border-outline-variant/10 text-on-surface-variant hover:border-outline-variant/30 hover:bg-surface-container-highest/40'}
            `}
            title={opt.description}
          >
            <div className={`transition-transform duration-300 group-hover:scale-110 ${selectedModel === opt.id ? 'text-on-primary-fixed' : 'text-primary'}`}>
              {opt.icon}
            </div>
            <span className="font-label text-[9px] uppercase tracking-[0.15em] leading-none font-black relative z-10">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
      {hasCustomKey && (
        <p className="text-[9px] text-accent-emerald/60 font-black uppercase tracking-widest text-center">
          Using personal Gemini API quota
        </p>
      )}
    </div>
  );
};
