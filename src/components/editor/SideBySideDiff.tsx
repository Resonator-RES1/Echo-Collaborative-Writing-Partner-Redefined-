import React, { useMemo, useState, useEffect } from 'react';
import { diffWordsWithSpace } from 'diff';
import { getHighlightRanges } from '../../utils/highlightUtils';
import { RefineDraftResult } from '../../services/gemini/refine';
import { Sparkles } from 'lucide-react';

// --- Component ---
export const SideBySideDiff: React.FC<{ 
    original: string; 
    polished: string;
    report?: RefineDraftResult;
    onSeeReport?: () => void;
    onAcceptChanges?: () => void;
}> = React.memo(({ original, polished, report, onSeeReport, onAcceptChanges }) => {
    const [viewMode, setViewMode] = useState<'split' | 'original' | 'polished'>('split');
    const [isMobile, setIsMobile] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<{ id: string; text: string } | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && viewMode === 'split') {
                setViewMode('polished');
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [viewMode]);

    const diffResult = useMemo(() => {
        return diffWordsWithSpace(original, polished);
    }, [original, polished]);

    const highlightRanges = useMemo(() => {
        if (!report) return [];
        return getHighlightRanges(polished, report);
    }, [polished, report]);

    const { leftPane, rightPane } = useMemo(() => {
        const left: React.ReactNode[] = [];
        const right: React.ReactNode[] = [];
        let polishedIndex = 0;

        diffResult.forEach((part, index) => {
            const key = `diff-${index}`;
            if (part.added) {
                const start = polishedIndex;
                const end = polishedIndex + part.value.length;
                
                // Find lore highlights in this added part
                const partRanges = highlightRanges.filter(r => 
                    (r.type === 'lore' || r.type === 'restraint' || r.type === 'fraying') && 
                    Math.max(r.start, start) < Math.min(r.end, end)
                );
                
                if (partRanges.length > 0) {
                    let currentPos = start;
                    const segments: React.ReactNode[] = [];
                    
                    partRanges.forEach((range, rIdx) => {
                        const rangeStart = Math.max(range.start, start);
                        const rangeEnd = Math.min(range.end, end);

                        if (rangeStart > currentPos) {
                            segments.push(
                                <span key={`${key}-s-${rIdx}`} className="bg-[var(--highlight-emerald-bg)] text-[var(--highlight-emerald-text)] rounded px-1">
                                    {polished.substring(currentPos, rangeStart)}
                                </span>
                            );
                        }

                        let className = "";
                        let tooltip = "";

                        if (range.type === 'lore') {
                            className = "bg-[var(--highlight-red-bg)] text-[var(--highlight-red-text)] rounded px-1 border-b border-red-400 cursor-pointer transition-colors hover:bg-red-500/40";
                            tooltip = `Lore Correction: ${range.metadata.reason}`;
                        } else if (range.type === 'fraying') {
                            className = "bg-[var(--highlight-amber-bg)] text-[var(--highlight-amber-text)] rounded px-1 border-b border-amber-400 cursor-pointer transition-colors hover:bg-amber-500/40";
                            tooltip = `Lore Fraying: ${range.metadata.conflict}\nSuggestion: ${range.metadata.suggestion}`;
                        } else {
                            className = "bg-[var(--highlight-blue-bg)] text-[var(--highlight-blue-text)] rounded px-1 border-b border-blue-400 cursor-pointer transition-colors hover:bg-blue-500/30";
                            tooltip = `Restrained: ${range.metadata.justification}`;
                        }

                        segments.push(
                            <span 
                                key={`${key}-l-${rIdx}`} 
                                className={className}
                                onClick={() => setActiveTooltip({ id: `${key}-l-${rIdx}`, text: tooltip })}
                            >
                                {polished.substring(rangeStart, rangeEnd)}
                            </span>
                        );
                        currentPos = rangeEnd;
                    });
                    
                    if (currentPos < end) {
                        segments.push(
                            <span key={`${key}-s-end`} className="bg-[var(--highlight-emerald-bg)] text-[var(--highlight-emerald-text)] rounded px-1">
                                {polished.substring(currentPos, end)}
                            </span>
                        );
                    }
                    right.push(<span key={key}>{segments}</span>);
                } else {
                    right.push(<span key={key} className="bg-[var(--highlight-emerald-bg)] text-[var(--highlight-emerald-text)] rounded px-1">{part.value}</span>);
                }
                polishedIndex += part.value.length;
            } else if (part.removed) {
                left.push(<span key={key} className="bg-[var(--highlight-error-bg)] text-[var(--highlight-error-text)] rounded px-1">{part.value}</span>);
            } else {
                const start = polishedIndex;
                const end = polishedIndex + part.value.length;
                
                // Find restraint highlights in this unchanged part
                const partRanges = highlightRanges.filter(r => 
                    (r.type === 'lore' || r.type === 'restraint' || r.type === 'fraying') && 
                    Math.max(r.start, start) < Math.min(r.end, end)
                );
                
                if (partRanges.length > 0) {
                    let currentPos = start;
                    const segments: React.ReactNode[] = [];
                    
                    partRanges.forEach((range, rIdx) => {
                        const rangeStart = Math.max(range.start, start);
                        const rangeEnd = Math.min(range.end, end);

                        if (rangeStart > currentPos) {
                            segments.push(<span key={`${key}-n-${rIdx}`}>{polished.substring(currentPos, rangeStart)}</span>);
                        }

                        let className = "";
                        let tooltip = "";

                        if (range.type === 'lore') {
                            className = "bg-[var(--highlight-red-bg)] text-[var(--highlight-red-text)] rounded px-1 border-b border-red-400 cursor-pointer transition-colors hover:bg-red-500/40";
                            tooltip = `Lore Correction: ${range.metadata.reason}`;
                        } else if (range.type === 'fraying') {
                            className = "bg-[var(--highlight-amber-bg)] text-[var(--highlight-amber-text)] rounded px-1 border-b border-amber-400 cursor-pointer transition-colors hover:bg-amber-500/40";
                            tooltip = `Lore Fraying: ${range.metadata.conflict}\nSuggestion: ${range.metadata.suggestion}`;
                        } else {
                            className = "bg-[var(--highlight-blue-bg)] text-[var(--highlight-blue-text)] rounded px-1 border-b border-blue-400 cursor-pointer transition-colors hover:bg-blue-500/30";
                            tooltip = `Preserved: ${range.metadata.justification}`;
                        }

                        segments.push(
                            <span 
                                key={`${key}-r-${rIdx}`} 
                                className={className}
                                onClick={() => setActiveTooltip({ id: `${key}-r-${rIdx}`, text: tooltip })}
                            >
                                {polished.substring(rangeStart, rangeEnd)}
                            </span>
                        );
                        currentPos = rangeEnd;
                    });
                    
                    if (currentPos < end) {
                        segments.push(<span key={`${key}-n-end`}>{polished.substring(currentPos, end)}</span>);
                    }
                    left.push(<span key={`${key}-left`}>{part.value}</span>);
                    right.push(<span key={key}>{segments}</span>);
                } else {
                    left.push(<span key={key}>{part.value}</span>);
                    right.push(<span key={key}>{part.value}</span>);
                }
                polishedIndex += part.value.length;
            }
        });

        return { leftPane: left, rightPane: right };
    }, [diffResult, highlightRanges, polished]);

    return (
        <div className="flex flex-col w-full bg-surface-container-low border border-outline-variant/20 rounded-[0.75rem] overflow-hidden max-h-[60vh]">
            <div className="flex p-1 bg-surface-container-highest/50 border-b border-outline-variant/20 sticky top-0 z-20">
                {!isMobile && (
                    <button 
                        onClick={() => setViewMode('split')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'split' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant/60'}`}
                    >
                        Side-by-Side
                    </button>
                )}
                <button 
                    onClick={() => setViewMode('original')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'original' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant/60'}`}
                >
                    Original
                </button>
                <button 
                    onClick={() => setViewMode('polished')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'polished' ? 'bg-primary text-on-primary-fixed shadow-lg' : 'text-on-surface-variant/60'}`}
                >
                    Polished
                </button>
            </div>
            
            {!isMobile && viewMode === 'split' && (
                <div className="flex w-full border-b border-outline-variant/20 bg-surface-container-low sticky top-0 z-10">
                    <div className="w-1/2 p-4 border-r border-outline-variant/20">
                        <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant m-0">Original Draft</h4>
                    </div>
                    <div className="w-1/2 p-4">
                        <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant m-0">Polished Version</h4>
                    </div>
                </div>
            )}

            <div className={`flex w-full overflow-y-auto custom-scrollbar flex-1 ${isMobile || viewMode !== 'split' ? 'flex-col' : ''}`}>
                {(viewMode === 'split' || viewMode === 'original') && (
                    <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} p-6 whitespace-pre-wrap font-headline text-sm leading-relaxed border-r border-outline-variant/20 text-on-surface/80`}>
                        {viewMode !== 'split' && <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4">Original Draft</h4>}
                        <p>{leftPane}</p>
                    </div>
                )}
                {(viewMode === 'split' || viewMode === 'polished') && (
                    <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} p-6 whitespace-pre-wrap font-headline text-sm leading-relaxed text-on-surface/80 flex flex-col justify-between`}>
                        {viewMode !== 'split' && <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4">Polished Version</h4>}
                        <p>{rightPane}</p>
                        
                        {(onSeeReport || onAcceptChanges) && (
                            <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-end gap-4">
                                {onSeeReport && (
                                    <button 
                                        onClick={onSeeReport}
                                        className="px-6 py-2.5 rounded-full border border-outline-variant/30 text-on-surface-variant font-label text-xs uppercase tracking-widest hover:bg-surface-container-highest hover:text-primary transition-all w-full sm:w-auto text-center"
                                    >
                                        See Editorial Report
                                    </button>
                                )}
                                {onAcceptChanges && (
                                    <button 
                                        onClick={onAcceptChanges}
                                        className="px-6 py-2.5 rounded-full bg-primary text-on-primary-fixed font-label text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-full sm:w-auto text-center"
                                    >
                                        Accept These Changes
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {activeTooltip && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveTooltip(null)}>
                    <div className="bg-surface-container-highest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-headline text-sm font-bold text-on-surface mb-2 uppercase tracking-widest opacity-50">Context Card</h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{activeTooltip.text}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveTooltip(null)}
                            className="mt-6 w-full py-2.5 bg-surface-container-low text-on-surface-variant font-label text-[10px] uppercase tracking-widest rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});
