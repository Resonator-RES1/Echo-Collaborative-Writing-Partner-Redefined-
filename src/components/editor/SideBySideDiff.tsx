import React, { useMemo } from 'react';
import { diffWordsWithSpace } from 'diff';

// --- Component ---
export const SideBySideDiff: React.FC<{ 
    original: string; 
    polished: string;
    onSeeReport?: () => void;
    onAcceptChanges?: () => void;
}> = React.memo(({ original, polished, onSeeReport, onAcceptChanges }) => {
    const diffResult = useMemo(() => {
        return diffWordsWithSpace(original, polished);
    }, [original, polished]);

    const leftPane: React.ReactNode[] = [];
    const rightPane: React.ReactNode[] = [];

    diffResult.forEach((part, index) => {
        const key = `diff-${index}`;
        if (part.added) {
            rightPane.push(<span key={key} className="bg-emerald-500/20 text-emerald-300 rounded px-1">{part.value}</span>);
        } else if (part.removed) {
            leftPane.push(<span key={key} className="bg-error/20 text-error rounded px-1">{part.value}</span>);
        } else {
            leftPane.push(<span key={key}>{part.value}</span>);
            rightPane.push(<span key={key}>{part.value}</span>);
        }
    });

    return (
        <div className="flex flex-col w-full bg-surface-container-low border border-outline-variant/20 rounded-[0.75rem] overflow-hidden max-h-[50vh]">
            <div className="flex w-full border-b border-outline-variant/20 bg-surface-container-low sticky top-0 z-10">
                <div className="w-1/2 p-4 border-r border-outline-variant/20">
                    <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant m-0">Original Draft</h4>
                </div>
                <div className="w-1/2 p-4">
                    <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant m-0">Polished Version</h4>
                </div>
            </div>
            <div className="flex w-full overflow-y-auto custom-scrollbar flex-1">
                <div className="w-1/2 p-6 whitespace-pre-wrap font-headline text-sm leading-relaxed border-r border-outline-variant/20 text-on-surface/80">
                    <p>{leftPane}</p>
                </div>
                <div className="w-1/2 p-6 whitespace-pre-wrap font-headline text-sm leading-relaxed text-on-surface/80 flex flex-col justify-between">
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
            </div>
        </div>
    );
});
