import React, { useState } from 'react';
import { Clock, Trash2, ChevronRight, History, Sparkles, Calendar, Eye, Activity, Copy, CheckCircle2, ShieldCheck, BarChart3 } from 'lucide-react';
import { RefinedVersion, LoreCorrection } from '../../types';
import { SideBySideDiff } from './SideBySideDiff';
import { formatReportForCopy } from '../../utils/reportFormatter';

interface ArchivePanelProps {
    versionHistory: RefinedVersion[];
    currentVersionIndex: number;
    originalDraft: string;
    onSelectVersion: (index: number) => void;
    onDeleteVersion: (id: string) => void;
    onClearHistory: () => void;
    onAcceptVersion?: (version: RefinedVersion) => void;
    showToast: (message: string) => void;
    onRevertSpecificLore?: (correction: LoreCorrection) => void;
    setActiveTab: (tab: any) => void;
}

export const ArchivePanel: React.FC<ArchivePanelProps> = ({
    versionHistory,
    currentVersionIndex,
    originalDraft,
    onSelectVersion,
    onDeleteVersion,
    onClearHistory,
    onAcceptVersion,
    showToast,
    onRevertSpecificLore,
    setActiveTab
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    if (versionHistory.length === 0) {
        return (
            <div className="flex flex-col flex-1 min-h-0 items-center justify-center text-center p-12 animate-in fade-in duration-700">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
                    <History className="w-10 h-10 text-on-surface-variant/20" />
                </div>
                <h3 className="font-headline text-2xl font-light mb-2">Archive is Empty</h3>
                <p className="text-on-surface-variant max-w-xs mx-auto text-sm leading-relaxed">
                    Your previous refinements will be stored here for review and comparison.
                </p>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedIdx !== null) {
        const version = versionHistory[selectedIdx];
        return (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 mb-4 sm:mb-8">
                    <button 
                        onClick={() => setViewMode('list')}
                        className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all self-start sm:self-auto"
                    >
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                        Back
                    </button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => {
                                const reportText = formatReportForCopy(version);
                                navigator.clipboard.writeText(reportText);
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3 bg-surface-container-highest/50 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all shadow-sm group border border-outline-variant/10 w-full sm:w-auto"
                        >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                            <span>Copy</span>
                        </button>
                        <button 
                            onClick={() => onSelectVersion(selectedIdx)}
                            className="flex items-center justify-center gap-2 sm:gap-3 px-6 py-4 sm:px-8 sm:py-4 bg-surface-container-highest text-on-surface-variant font-label uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs font-black rounded-2xl hover:bg-surface-container-highest/80 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:scale-95 group relative overflow-hidden border-b-2 border-outline-variant/20 w-full sm:w-auto"
                        >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
                            <span>Preview</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-6 sm:space-y-8 pb-12">
                    <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 p-4 sm:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h4 className="font-headline text-lg sm:text-xl font-bold flex items-center gap-2">
                                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                Comparison View
                            </h4>
                            <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1 text-error/70"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-error/50 rounded-full"></span> Original</span>
                                <span className="flex items-center gap-1 text-accent-emerald/70"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-emerald/50 rounded-full"></span> Polished</span>
                            </div>
                        </div>
                        <SideBySideDiff 
                            original={originalDraft} 
                            polished={version.text} 
                            onSeeReport={() => {
                                onSelectVersion(selectedIdx);
                                setActiveTab('report');
                            }}
                            onAcceptChanges={() => {
                                if (onAcceptVersion) {
                                    onAcceptVersion(version);
                                    setViewMode('list');
                                }
                            }}
                        />
                    </div>

                    {version.loreCorrections && version.loreCorrections.length > 0 && (
                        <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 p-4 sm:p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 text-accent-rose">
                                <ShieldCheck className="w-5 h-5" />
                                <h4 className="font-headline text-lg sm:text-xl font-bold">Lore Corrections Detected</h4>
                            </div>
                            <div className="space-y-4">
                                {version.loreCorrections.map((correction, idx) => (
                                    <div key={idx} className="p-4 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/10 group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-bold text-on-surface-variant/50 line-through">{correction.original}</span>
                                                    <ChevronRight className="w-3 h-3 text-on-surface-variant/30" />
                                                    <span className="text-sm font-bold text-on-surface">{correction.refined}</span>
                                                </div>
                                                <p className="text-xs text-on-surface-variant/70 italic leading-relaxed">{correction.reason}</p>
                                            </div>
                                            <button 
                                                onClick={() => onRevertSpecificLore?.(correction)}
                                                className="px-4 py-2 bg-accent-rose/10 text-accent-rose text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-accent-rose hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                Revert
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden animate-in fade-in duration-500">
            <div className="flex-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 mb-4 sm:mb-8">
                <div className="space-y-0.5 sm:space-y-1">
                    <h3 className="font-headline text-2xl sm:text-3xl font-bold">Echo Archive</h3>
                    <p className="text-[9px] sm:text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Refinement History</p>
                </div>
                <button 
                    onClick={onClearHistory}
                    className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-3 bg-accent-rose/10 border border-accent-rose/30 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-accent-rose hover:bg-accent-rose hover:text-white rounded-2xl transition-all shadow-sm active:scale-95 group hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
                >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                    <span>Clear</span>
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-3 sm:space-y-4">
                {versionHistory.map((version, index) => (
                    <div 
                        key={version.id}
                        onClick={() => { setSelectedIdx(index); setViewMode('detail'); }}
                        className={`group p-4 sm:p-6 rounded-3xl border transition-all duration-500 cursor-pointer relative overflow-hidden ${
                            currentVersionIndex === index 
                                ? 'bg-primary/5 border-primary/30 shadow-lg shadow-primary/5' 
                                : 'bg-surface-container-low border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-highest/30'
                        }`}
                    >
                        {currentVersionIndex === index && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                        )}
                        
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors ${currentVersionIndex === index ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <h4 className={`font-headline text-base sm:text-lg font-bold transition-colors ${currentVersionIndex === index ? 'text-primary' : 'text-on-surface'}`}>
                                        {version.title || `Refinement ${versionHistory.length - index}`}
                                    </h4>
                                    <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest">
                                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            {new Date(version.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest">
                                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            {new Date(version.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteVersion(version.id); }}
                                className="p-2 rounded-full text-on-surface-variant/30 hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </div>

                        <p className="text-[11px] sm:text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3 sm:mb-4 italic">
                            {version.summary}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1.5 sm:gap-2">
                                {version.metrics && Object.entries(version.metrics).slice(0, 2).map(([key, metric]: [string, any]) => (
                                    <div key={key} className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-surface-container-highest/50 rounded-lg border border-outline-variant/5">
                                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter text-on-surface-variant/40">{key.split('_')[0]}</span>
                                        <span className="text-[9px] sm:text-[10px] font-black text-primary">{metric.score}</span>
                                    </div>
                                ))}
                            </div>
                            <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] transition-all ${currentVersionIndex === index ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary group-hover:translate-x-1'}`}>
                                View Details
                                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
