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
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden">
                <header className="p-4 md:p-6 flex justify-between items-center border-b border-gray-700 bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Loader2 className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Refine Phrasing</h2>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">AI-Powered Alternatives</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6"/>
                    </button>
                </header>

                <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                    {/* Original Text Section */}
                    <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-gray-700 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Original Selection</h3>
                            <span className="text-xs text-gray-500">{originalText.split(/\s+/).length} words</span>
                        </div>
                        <div className="flex-grow bg-gray-900/50 rounded-xl border border-gray-700 p-6 overflow-y-auto font-serif leading-relaxed text-gray-300 text-lg shadow-inner">
                            {originalText}
                        </div>
                    </div>

                    {/* Suggestions Section */}
                    <div className="w-full lg:w-1/2 p-6 flex flex-col bg-gray-800/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Suggestions</h3>
                            {isLoading && <span className="text-xs text-purple-400 animate-pulse">Generating...</span>}
                        </div>
                        
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                                    <p className="text-gray-400 animate-pulse">Crafting the perfect phrasing...</p>
                                </div>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((suggestion, index) => (
                                    <div 
                                        key={index}
                                        className="group relative bg-gray-700/30 hover:bg-gray-700/60 border border-gray-600 hover:border-purple-500/50 rounded-xl transition-all duration-200 overflow-hidden"
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-bold bg-gray-600 text-gray-300 px-2 py-0.5 rounded uppercase tracking-tighter">Option {index + 1}</span>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(suggestion);
                                                            // We don't have a toast here easily, but we can assume it works
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                                                        title="Copy to clipboard"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => onSelect(suggestion)}
                                                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-md shadow-lg"
                                                    >
                                                        Apply This
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-200 font-serif leading-relaxed text-lg">
                                                {suggestion}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onSelect(suggestion)}
                                            className="w-full py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-xs font-semibold border-t border-gray-600/50 transition-colors"
                                        >
                                            Click to Replace Original
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 italic">
                                    No suggestions generated. Try a different selection.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <footer className="p-4 bg-gray-900/30 border-t border-gray-700 text-center">
                    <p className="text-xs text-gray-500">
                        Select a suggestion to replace the text in your editor. Your original formatting will be preserved where possible.
                    </p>
                </footer>
            </div>
        </div>
    );
});
