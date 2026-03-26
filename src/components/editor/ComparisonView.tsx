import React from 'react';
import { X, Activity, Sparkles } from 'lucide-react';
import { SideBySideDiff } from './SideBySideDiff';

import { RefineDraftResult } from '../../services/gemini/refine';

interface ComparisonViewProps {
    isOpen: boolean;
    original: string;
    polished: string;
    report?: RefineDraftResult;
    onClose: () => void;
    onRevertLore: () => void;
    onAccept: () => void;
    onSeeReport: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = React.memo(({ 
    isOpen, original, polished, report, onClose, onRevertLore, onAccept, onSeeReport
}) => {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-surface-container-highest/90 backdrop-blur-md flex items-center justify-center z-[100] p-0 sm:p-4 md:p-8 animate-in fade-in duration-300">
            <div className={`bg-surface-container-low border border-outline-variant/20 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${isMobile ? 'w-full h-full rounded-0' : 'w-full max-w-5xl max-h-[90vh] rounded-[1.5rem]'}`}>
                <header className="px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center border-b border-outline-variant/20 bg-surface-container-highest/30 sticky top-0 z-30 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-[0.75rem]">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-headline text-lg sm:text-xl text-on-surface font-semibold tracking-tight">Changes Review</h2>
                            <p className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest">Visual Diff Analysis</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-[0.75rem] text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all">
                        <X className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </button>
                </header>
                
                <div className="px-4 sm:px-8 py-3 bg-surface-container-highest/50 border-b border-outline-variant/10 flex flex-wrap items-center gap-4 sticky top-[68px] sm:top-[84px] z-20 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-on-surface-variant/60">
                        <span className="w-2 h-2 bg-emerald-500/40 border border-emerald-400/50 rounded-sm"></span> 
                        Style
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-on-surface-variant/60">
                        <span className="w-2 h-2 bg-blue-500/40 border border-blue-400/50 rounded-sm"></span> 
                        Preserved
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-on-surface-variant/60">
                        <span className="w-2 h-2 bg-red-500/40 border border-red-400/50 rounded-sm"></span> 
                        Lore
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-on-surface-variant/60">
                        <span className="w-2 h-2 bg-amber-500/40 border border-amber-400/50 rounded-sm"></span> 
                        Fraying
                    </div>
                </div>

                <main className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-grow custom-scrollbar bg-surface-container-low">
                    <SideBySideDiff 
                        original={original} 
                        polished={polished} 
                        report={report}
                        onSeeReport={onSeeReport}
                        onAcceptChanges={onAccept}
                    />
                </main>

                <footer className="px-4 sm:px-6 py-4 border-t border-outline-variant/20 bg-surface-container-highest/30 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 z-30 backdrop-blur-md">
                    <button 
                        onClick={onRevertLore}
                        className="w-full sm:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 rounded-[0.5rem] transition-colors"
                    >
                        Revert Lore Corrections
                    </button>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/20 rounded-full"
                        >
                            Close
                        </button>
                        <button 
                            onClick={onAccept}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-primary text-on-primary-fixed rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                        >
                            Accept Changes
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
});
