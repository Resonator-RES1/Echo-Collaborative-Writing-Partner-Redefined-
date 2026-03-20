import React from 'react';
import { Cpu, Zap, Brain } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: any) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, setSelectedModel }) => {
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
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium">
        <Cpu className="w-3.5 h-3.5" />
        <span>Intelligence Model</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {modelOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedModel(opt.id)}
            className={`
              flex flex-col items-center gap-2 p-3 rounded-[0.75rem] border transition-all text-center
              ${selectedModel === opt.id 
                ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                : 'bg-surface-container-highest/30 border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/40 hover:bg-surface-container-highest/50'}
            `}
            title={opt.description}
          >
            <div className={`${selectedModel === opt.id ? 'text-primary' : 'text-on-surface-variant/70'}`}>
              {opt.icon}
            </div>
            <span className="font-label text-[10px] uppercase tracking-wider leading-none font-bold">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
