import React, { useRef } from 'react';
import { PenTool, Sparkles, Trash2, Plus, Download, Upload } from 'lucide-react';
import { AuthorVoice } from '../../types';

interface AuthorVoicesListProps {
  authorVoices: AuthorVoice[];
  onEdit: (voice: AuthorVoice) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
  onImport: (voices: AuthorVoice[]) => void;
}

export function AuthorVoicesList({
  authorVoices,
  onEdit,
  onAddNew,
  onDelete,
  onImport
}: AuthorVoicesListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(authorVoices, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'echo-author-voices.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const voices = JSON.parse(content);
        if (Array.isArray(voices)) {
          onImport(voices);
        }
      } catch (error) {
        console.error("Failed to import author voices:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="lg:col-span-12 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-headline text-3xl flex items-center gap-3">
            Author Voices
            <PenTool className="text-secondary w-7 h-7" />
          </h3>
          <span className="font-label text-xs font-normal text-on-surface-variant py-1 px-3 bg-surface-container rounded-full uppercase tracking-tighter">
            {String(authorVoices.length).padStart(2, '0')} Styles
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="p-2 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-secondary transition-all"
            title="Export Author Voices"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-secondary transition-all"
            title="Import Author Voices"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authorVoices.map(voice => (
          <div 
            key={voice.id} 
            onClick={() => onEdit(voice)}
            className={`glass-slab p-6 rounded-2xl border transition-all duration-500 group cursor-pointer ${voice.isActive ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/20' : 'border-outline-variant/10 hover:border-secondary/30'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${voice.isActive ? 'bg-secondary text-on-secondary' : 'bg-secondary/10 text-secondary'}`}>
                <PenTool className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                {voice.isActive && (
                  <span className="font-label text-[9px] uppercase tracking-widest text-secondary bg-secondary/10 py-1 px-2 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2 h-2" />
                    Active Master
                  </span>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(voice.id); }}
                  className="text-on-surface-variant/30 hover:text-error transition-colors"
                  title="Delete Author Voice"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <h4 className="font-headline text-xl mb-2 group-hover:text-secondary transition-colors">{voice.name}</h4>
            <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 italic">
              {voice.narrativeStyle || "No style description defined."}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-surface-container rounded-[4px] text-[9px] text-on-surface-variant uppercase tracking-wider">Prose</span>
              <span className="px-2 py-0.5 bg-surface-container rounded-[4px] text-[9px] text-on-surface-variant uppercase tracking-wider">Pacing</span>
            </div>
          </div>
        ))}

        <div 
          onClick={onAddNew}
          className="group border border-dashed border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-secondary/40 transition-all duration-500 cursor-pointer bg-surface-container/10"
        >
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
            <Plus className="text-on-surface-variant group-hover:text-secondary transition-colors w-6 h-6" />
          </div>
          <p className="font-label text-sm text-on-surface-variant group-hover:text-secondary transition-colors">Create Author Voice</p>
        </div>
      </div>
    </div>
  );
}
