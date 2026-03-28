import React, { useState } from 'react';
import { Clock, Trash2, ChevronRight, History, Sparkles, Calendar, Eye, Activity, Copy, ShieldCheck, Bookmark, Flag, BookmarkCheck } from 'lucide-react';
import { RefinedVersion, LoreCorrection } from '../../types';
import { SideBySideDiff } from './SideBySideDiff';
import { formatReportForCopy } from '../../utils/reportFormatter';
import { motion, AnimatePresence } from 'motion/react';

interface ArchivePanelProps {
    versionHistory: RefinedVersion[];
    currentVersionIndex: number;
    originalDraft: string;
    onSelectVersion: (index: number) => void;
    onDeleteVersion: (id: string) => void;
    onUpdateVersion?: (version: RefinedVersion) => void;
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
    onUpdateVersion,
    onClearHistory,
    onAcceptVersion,
    showToast,
    onRevertSpecificLore,
    setActiveTab
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [pinningId, setPinningId] = useState<string | null>(null);
    const [milestoneLabel, setMilestoneLabel] = useState('');

    if (versionHistory.length === 0) {
        return (
            <div className="flex flex-col flex-1 min-h-0 items-center justify-center text-center p-12 animate-in fade-in duration-700">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
                    <History className="w-10 h-10 text-on-surface-variant/10" />
                </div>
                <h3 className="font-headline text-2xl font-light mb-2">Archive is Silent</h3>
                <p className="text-on-surface-variant max-w-xs mx-auto text-sm leading-relaxed italic">
                    Your previous refinements will be stored here for review and comparison.
                </p>
            </div>
        );
    }

    const handlePin = (version: RefinedVersion) => {
        if (onUpdateVersion) {
            onUpdateVersion({
                ...version,
                isPinned: true,
                milestoneLabel: milestoneLabel || 'MILESTONE'
            });
            setPinningId(null);
            setMilestoneLabel('');
            showToast(`Milestone "${milestoneLabel || 'MILESTONE'}" pinned.`);
        }
    };

    const handleUnpin = (version: RefinedVersion) => {
        if (onUpdateVersion) {
            onUpdateVersion({
                ...version,
                isPinned: false,
                milestoneLabel: undefined
            });
            showToast("Milestone unpinned.");
        }
    };

    const handleSeeReport = React.useCallback(() => {
        if (selectedIdx !== null) {
            onSelectVersion(selectedIdx);
            setActiveTab('report');
        }
    }, [selectedIdx, onSelectVersion, setActiveTab]);

    const handleAcceptChanges = React.useCallback(() => {
        if (selectedIdx !== null && onAcceptVersion) {
            onAcceptVersion(versionHistory[selectedIdx]);
            setViewMode('list');
        }
    }, [selectedIdx, onAcceptVersion, versionHistory]);

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
                        Back to Ledger
                    </button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => {
                                const reportText = formatReportForCopy(version);
                                navigator.clipboard.writeText(reportText);
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3 bg-surface-container-highest/50 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-primary hover:text-on-primary-fixed transition-all shadow-sm group border border-outline-variant/10 w-full sm:w-auto"
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
                            <div className="flex flex-wrap items-center gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5 text-on-surface-variant/60">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500/40 border border-emerald-400/50 rounded-sm"></span> 
                                    Style
                                </span>
                                <span className="flex items-center gap-1.5 text-on-surface-variant/60">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500/40 border border-blue-400/50 rounded-sm"></span> 
                                    Preserved
                                </span>
                                <span className="flex items-center gap-1.5 text-on-surface-variant/60">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500/40 border border-red-400/50 rounded-sm"></span> 
                                    Lore
                                </span>
                                <span className="flex items-center gap-1.5 text-on-surface-variant/60">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500/40 border border-amber-400/50 rounded-sm"></span> 
                                    Fraying
                                </span>
                            </div>
                        </div>
                        <SideBySideDiff 
                            original={originalDraft} 
                            polished={version.text} 
                            report={version as any}
                            onSeeReport={handleSeeReport}
                            onAcceptChanges={handleAcceptChanges}
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
                    <h3 className="font-headline text-2xl sm:text-3xl font-bold">Git Ledger</h3>
                    <p className="text-[9px] sm:text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Refinement History & Milestones</p>
                </div>
                <button 
                    onClick={onClearHistory}
                    className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-3 bg-accent-rose/10 border border-accent-rose/30 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-accent-rose hover:bg-accent-rose hover:text-white rounded-2xl transition-all shadow-sm active:scale-95 group hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
                >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                    <span>Clear Ledger</span>
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-1">
                    {versionHistory.map((version, index) => (
                        <div 
                            key={version.id}
                            className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 cursor-pointer border ${
                                currentVersionIndex === index 
                                    ? 'bg-primary/5 border-primary/20' 
                                    : 'bg-surface-container-lowest border-transparent hover:bg-surface-container-low hover:border-outline-variant/10'
                            }`}
                            onClick={() => { setSelectedIdx(index); setViewMode('detail'); }}
                        >
                            {/* Timestamp */}
                            <div className="w-12 shrink-0 font-mono text-[10px] text-on-surface-variant/40">
                                {new Date(version.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </div>

                            {/* Delta Badge */}
                            <div className="w-20 shrink-0 flex items-center gap-1.5">
                                {version.wordCountDelta ? (
                                    <div className="flex items-center gap-1 text-[9px] font-bold">
                                        <span className="text-emerald-500">+{version.wordCountDelta.added}</span>
                                        <span className="text-on-surface-variant/20">/</span>
                                        <span className="text-error">-{version.wordCountDelta.removed}</span>
                                    </div>
                                ) : (
                                    <div className="text-[9px] text-on-surface-variant/20 font-bold uppercase tracking-tighter">No Delta</div>
                                )}
                            </div>

                            {/* Title & Milestone */}
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                                <h4 className={`text-xs font-medium truncate transition-colors ${currentVersionIndex === index ? 'text-primary' : 'text-on-surface'}`}>
                                    {version.title || `Commit ${versionHistory.length - index}`}
                                </h4>
                                {version.isPinned && (
                                    <span className="px-2 py-0.5 bg-primary text-on-primary-fixed text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                        {version.milestoneLabel || 'MASTER'}
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                {pinningId === version.id ? (
                                    <div className="flex items-center gap-1 bg-surface-container-highest rounded-full px-2 py-1 animate-in slide-in-from-right-2">
                                        <input 
                                            type="text"
                                            value={milestoneLabel}
                                            onChange={e => setMilestoneLabel(e.target.value)}
                                            placeholder="Label..."
                                            className="bg-transparent border-none outline-none text-[10px] w-20 text-on-surface placeholder:text-on-surface-variant/30"
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handlePin(version);
                                                if (e.key === 'Escape') setPinningId(null);
                                            }}
                                        />
                                        <button onClick={() => handlePin(version)} className="text-primary hover:scale-110 transition-transform">
                                            <BookmarkCheck className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            if (version.isPinned) handleUnpin(version);
                                            else setPinningId(version.id);
                                        }}
                                        className={`p-2 rounded-full transition-all ${version.isPinned ? 'text-primary bg-primary/10' : 'text-on-surface-variant/40 hover:text-primary hover:bg-primary/10'}`}
                                        title={version.isPinned ? "Unpin Milestone" : "Pin as Milestone"}
                                    >
                                        <Bookmark className={`w-3.5 h-3.5 ${version.isPinned ? 'fill-current' : ''}`} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => onDeleteVersion(version.id)}
                                    className="p-2 rounded-full text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all"
                                    title="Delete Commit"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

