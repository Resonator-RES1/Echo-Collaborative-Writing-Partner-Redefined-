import React, { useMemo } from 'react';
import { diffWordsWithSpace } from 'diff';

// --- Component ---
export const SideBySideDiff: React.FC<{ original: string; polished: string }> = React.memo(({ original, polished }) => {
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
        <div className="flex w-full bg-surface-container-low border border-outline-variant/20 rounded-[0.75rem] max-h-[50vh] overflow-y-auto custom-scrollbar">
            <div className="w-1/2 p-6 whitespace-pre-wrap font-headline text-sm leading-relaxed border-r border-outline-variant/20 text-on-surface/80">
                <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-4 sticky top-0 bg-surface-container-low pb-2 -mt-6 pt-6 z-10">Original Draft</h4>
                <p>{leftPane}</p>
            </div>
            <div className="w-1/2 p-6 whitespace-pre-wrap font-headline text-sm leading-relaxed text-on-surface/80">
                <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-4 sticky top-0 bg-surface-container-low pb-2 -mt-6 pt-6 z-10">Polished Version</h4>
                <p>{rightPane}</p>
            </div>
        </div>
    );
});
