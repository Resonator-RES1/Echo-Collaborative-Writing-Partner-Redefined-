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
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <Cpu className="w-3 h-3" />
        <span>Intelligence Model</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {modelOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedModel(opt.id)}
            className={`
              flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-center
              ${selectedModel === opt.id 
                ? 'bg-purple-500/20 border-purple-500 text-purple-200 shadow-lg shadow-purple-500/10' 
                : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/50'}
            `}
            title={opt.description}
          >
            <div className={`${selectedModel === opt.id ? 'text-purple-400' : 'text-gray-500'}`}>
              {opt.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter leading-none">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
