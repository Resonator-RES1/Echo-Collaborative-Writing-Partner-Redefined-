import React from 'react';
import { Loader2, X, Copy } from 'lucide-react';

interface SuggestionsPopoverProps {
    suggestions: string[];
    isLoading: boolean;
    originalText: string;
    onSelect: (suggestion: string) => void;
    onClose: () => void;
}

export const SuggestionsPopover: React.FC<SuggestionsPopoverProps> = React.memo(({ suggestions, isLoading, originalText, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8">
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-[0.75rem] shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden ghost-border">
                <header className="p-4 md:p-6 flex justify-between items-center border-b border-outline-variant/20 bg-surface-container-highest/30">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <Loader2 className={`w-5 h-5 text-primary ${isLoading ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-headline tracking-tight text-on-surface">Refine Phrasing</h2>
                            <p className="text-xs font-label text-primary uppercase tracking-wider">AI-Powered Alternatives</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-primary transition-colors"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </header>

                <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                    {/* Original Text Section */}
                    <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-outline-variant/20 flex flex-col bg-surface-container-low/50">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Original Selection</h3>
                            <span className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-wider">{originalText.split(/\s+/).length} words</span>
                        </div>
                        <div className="flex-grow bg-surface-container-highest/30 rounded-[0.75rem] border border-outline-variant/10 p-6 overflow-y-auto font-headline leading-relaxed text-on-surface/80 text-lg shadow-inner">
                            {originalText}
                        </div>
                    </div>

                    {/* Suggestions Section */}
                    <div className="w-full lg:w-1/2 p-6 flex flex-col bg-surface-container-highest/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Suggestions</h3>
                            {isLoading && <span className="text-[10px] font-label text-primary uppercase tracking-wider animate-pulse">Generating...</span>}
                        </div>
                        
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p className="text-xs font-label text-on-surface-variant/60 uppercase tracking-wider animate-pulse">Crafting the perfect phrasing...</p>
                                </div>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((suggestion, index) => (
                                    <div 
                                        key={index}
                                        className="group relative bg-surface-container-highest/30 hover:bg-surface-container-highest/60 border border-outline-variant/20 hover:border-primary/50 rounded-[0.75rem] transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-label bg-primary/10 text-primary px-2 py-1 rounded-full uppercase tracking-wider">Option {index + 1}</span>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(suggestion);
                                                            // We don't have a toast here easily, but we can assume it works
                                                        }}
                                                        className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors"
                                                        title="Copy to clipboard"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => onSelect(suggestion)}
                                                        className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-on-primary-fixed text-[10px] font-label uppercase tracking-wider font-bold rounded-full shadow-md transition-all"
                                                    >
                                                        Apply This
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-on-surface/90 font-headline leading-relaxed text-lg">
                                                {suggestion}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onSelect(suggestion)}
                                            className="w-full py-3 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-label uppercase tracking-wider font-bold border-t border-outline-variant/10 transition-colors"
                                        >
                                            Click to Replace Original
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant/60 font-headline italic">
                                    No suggestions generated. Try a different selection.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <footer className="p-4 bg-surface-container-highest/20 border-t border-outline-variant/20 text-center">
                    <p className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-wider">
                        Select a suggestion to replace the text in your editor. Your original formatting will be preserved where possible.
                    </p>
                </footer>
            </div>
        </div>
    );
});
