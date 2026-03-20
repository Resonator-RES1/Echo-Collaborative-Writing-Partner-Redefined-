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
            rightPane.push(<span key={key} className="bg-green-900/60 text-green-100 rounded px-1">{part.value}</span>);
        } else if (part.removed) {
            leftPane.push(<span key={key} className="bg-red-900/60 text-red-100 rounded px-1">{part.value}</span>);
        } else {
            leftPane.push(<span key={key}>{part.value}</span>);
            rightPane.push(<span key={key}>{part.value}</span>);
        }
    });

    return (
        <div className="flex w-full bg-gray-900 border border-gray-700 rounded-lg max-h-[50vh] overflow-y-auto">
            <div className="w-1/2 p-4 whitespace-pre-wrap font-mono text-sm leading-relaxed border-r border-gray-700">
                <h4 className="text-lg font-bold text-gray-400 mb-2 sticky top-0 bg-gray-900 pb-2 -mt-4 pt-4">Original Draft</h4>
                <p>{leftPane}</p>
            </div>
            <div className="w-1/2 p-4 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                <h4 className="text-lg font-bold text-gray-400 mb-2 sticky top-0 bg-gray-900 pb-2 -mt-4 pt-4">Polished Version</h4>
                <p>{rightPane}</p>
            </div>
        </div>
    );
});
