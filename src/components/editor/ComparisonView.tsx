import React from 'react';
import { X, Activity, Sparkles } from 'lucide-react';
import { SideBySideDiff } from './SideBySideDiff';

interface ComparisonViewProps {
    isOpen: boolean;
    original: string;
    polished: string;
    onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = React.memo(({ 
    isOpen, original, polished, onClose 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-surface-container-highest/90 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8">
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-[1.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                <header className="px-6 py-5 flex justify-between items-center border-b border-outline-variant/20 bg-surface-container-highest/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-[0.75rem]">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-headline text-xl text-on-surface font-semibold">Changes Review</h2>
                            <p className="text-xs text-on-surface-variant/70">Reviewing refinements vs. original intent</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-[0.75rem] text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all">
                        <X className="w-6 h-6"/>
                    </button>
                </header>
                
                <main className="p-6 md:p-8 overflow-y-auto flex-grow custom-scrollbar bg-surface-container-low">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-headline text-xl text-on-surface flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Side-by-Side Comparison
                                </h3>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Original</span>
                                    <span className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Polished</span>
                                </div>
                            </div>
                            <SideBySideDiff original={original} polished={polished} />
                        </div>
                    </div>
                </main>

                <footer className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-highest/30 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
});
