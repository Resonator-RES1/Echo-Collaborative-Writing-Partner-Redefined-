import React, { useMemo } from 'react';
import { diffWordsWithSpace } from 'diff';
import { getHighlightRanges } from '../../utils/highlightUtils';
import { RefineDraftResult } from '../../services/gemini/refine';

// --- Component ---
export const SideBySideDiff: React.FC<{ 
    original: string; 
    polished: string;
    report?: RefineDraftResult;
    onSeeReport?: () => void;
    onAcceptChanges?: () => void;
}> = React.memo(({ original, polished, report, onSeeReport, onAcceptChanges }) => {
    const [viewMode, setViewMode] = React.useState<'split' | 'original' | 'polished'>('split');
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
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

    const leftPane: React.ReactNode[] = [];
    const rightPane: React.ReactNode[] = [];

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
                            <span key={`${key}-s-${rIdx}`} className="bg-emerald-500/20 text-emerald-300 rounded px-1">
                                {polished.substring(currentPos, rangeStart)}
                            </span>
                        );
                    }

                    let className = "";
                    let tooltip = "";

                    if (range.type === 'lore') {
                        className = "bg-red-500/30 text-red-200 rounded px-1 border-b border-red-400 cursor-help transition-colors hover:bg-red-500/40";
                        tooltip = `Lore Correction: ${range.metadata.reason}`;
                    } else if (range.type === 'fraying') {
                        className = "bg-amber-500/30 text-amber-200 rounded px-1 border-b border-amber-400 cursor-help transition-colors hover:bg-amber-500/40";
                        tooltip = `Lore Fraying: ${range.metadata.conflict}\nSuggestion: ${range.metadata.suggestion}`;
                    } else {
                        className = "bg-blue-500/20 text-blue-200 rounded px-1 border-b border-blue-400 cursor-help transition-colors hover:bg-blue-500/30";
                        tooltip = `Restrained: ${range.metadata.justification}`;
                    }

                    segments.push(
                        <span 
                            key={`${key}-l-${rIdx}`} 
                            className={className}
                            title={tooltip}
                        >
                            {polished.substring(rangeStart, rangeEnd)}
                        </span>
                    );
                    currentPos = rangeEnd;
                });
                
                if (currentPos < end) {
                    segments.push(
                        <span key={`${key}-s-end`} className="bg-emerald-500/20 text-emerald-300 rounded px-1">
                            {polished.substring(currentPos, end)}
                        </span>
                    );
                }
                rightPane.push(<span key={key}>{segments}</span>);
            } else {
                rightPane.push(<span key={key} className="bg-emerald-500/20 text-emerald-300 rounded px-1">{part.value}</span>);
            }
            polishedIndex += part.value.length;
        } else if (part.removed) {
            leftPane.push(<span key={key} className="bg-error/20 text-error rounded px-1">{part.value}</span>);
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
                        className = "bg-red-500/30 text-red-200 rounded px-1 border-b border-red-400 cursor-help transition-colors hover:bg-red-500/40";
                        tooltip = `Lore Correction: ${range.metadata.reason}`;
                    } else if (range.type === 'fraying') {
                        className = "bg-amber-500/30 text-amber-200 rounded px-1 border-b border-amber-400 cursor-help transition-colors hover:bg-amber-500/40";
                        tooltip = `Lore Fraying: ${range.metadata.conflict}\nSuggestion: ${range.metadata.suggestion}`;
                    } else {
                        className = "bg-blue-500/20 text-blue-200 rounded px-1 border-b border-blue-400 cursor-help transition-colors hover:bg-blue-500/30";
                        tooltip = `Preserved: ${range.metadata.justification}`;
                    }

                    segments.push(
                        <span 
                            key={`${key}-r-${rIdx}`} 
                            className={className}
                            title={tooltip}
                        >
                            {polished.substring(rangeStart, rangeEnd)}
                        </span>
                    );
                    currentPos = rangeEnd;
                });
                
                if (currentPos < end) {
                    segments.push(<span key={`${key}-n-end`}>{polished.substring(currentPos, end)}</span>);
                }
                leftPane.push(<span key={`${key}-left`}>{part.value}</span>);
                rightPane.push(<span key={key}>{segments}</span>);
            } else {
                leftPane.push(<span key={key}>{part.value}</span>);
                rightPane.push(<span key={key}>{part.value}</span>);
            }
            polishedIndex += part.value.length;
        }
    });

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
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'polished' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant/60'}`}
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
                                        className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-full sm:w-auto text-center"
                                    >
                                        Accept These Changes
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});
