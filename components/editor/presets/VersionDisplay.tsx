import React, { useState } from 'react';
import { 
    Loader2, Copy, BookOpen, Pencil, Eye, Maximize2, Minimize2, X, 
    ChevronLeft, ChevronRight, CheckCircle 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { marked } from 'marked';
import { RefinedVersion, RefineMode } from '../../../src/types';

interface VersionDisplayProps {
    mode: RefineMode;
    isRefining: boolean;
    reviewOutput: RefinedVersion | null;
    setReviewOutput: (output: RefinedVersion | ((prev: RefinedVersion | null) => RefinedVersion | null)) => void;
    currentVersion: RefinedVersion;
    currentVersionIndex: number;
    versionHistory: RefinedVersion[];
    setCurrentVersionIndex: (index: number) => void;
    onUpdateVersion: (index: number, content: string) => void;
    onShowComparison: () => void;
    onAcceptVersion: (version: string) => void;
    showToast: (message: string) => void;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = React.memo(({
    mode, isRefining, reviewOutput, setReviewOutput, currentVersion, 
    currentVersionIndex, versionHistory, setCurrentVersionIndex, 
    onUpdateVersion, onShowComparison, onAcceptVersion, showToast
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleCopy = async () => {
        const textToCopy = (mode === 'review' || mode === 'reaction') ? reviewOutput?.text : currentVersion?.text;
        if (!textToCopy) return;

        try {
            // Convert markdown to HTML for rich text copying
            const htmlContent = await marked.parse(textToCopy);
            
            // Create a blob for HTML and plain text
            const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
            const textBlob = new Blob([textToCopy], { type: 'text/plain' });

            // Use ClipboardItem to copy both formats
            const data = [new ClipboardItem({
                'text/html': htmlBlob,
                'text/plain': textBlob
            })];

            await navigator.clipboard.write(data);
            showToast("Copied with formatting!");
        } catch (err) {
            console.error('Failed to copy rich text: ', err);
            // Fallback to plain text copy if rich text fails
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast("Copied as plain text.");
            }).catch(fallbackErr => {
                console.error('Fallback copy failed: ', fallbackErr);
                showToast("Failed to copy text.");
            });
        }
    };

    const containerClasses = `
        bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col flex-grow
        ${isExpanded
            ? 'fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-gray-800/95 backdrop-blur-sm shadow-2xl min-h-0'
            : 'min-h-[300px]'}
        transition-all duration-300 ease-in-out
    `;

    const textToShow = (mode === 'review' || mode === 'reaction') ? reviewOutput?.text : currentVersion?.text;

    return (
        <div className={containerClasses}>
            <div className="p-3 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-semibold text-purple-300">
                    {mode === 'review' ? 'Review Output' : mode === 'reaction' ? 'Reaction Output' : 'Version History'}
                </h3>
                <div className="flex items-center gap-2">
                    {textToShow && !isRefining && (
                        <>
                            <button onClick={handleCopy} title="Copy to Clipboard" className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-700">
                                <Copy className="w-4 h-4" />
                            </button>
                            {mode === 'collaborative' && (
                                <button onClick={onShowComparison} title="Compare with Original" className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-700">
                                    <BookOpen className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => setIsEditing(!isEditing)} title={isEditing ? "Preview Changes" : "Edit Text"} className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-700">
                                {isEditing ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Shrink Panel" : "Expand Panel"} className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-700">
                                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            {isExpanded && <button onClick={() => setIsExpanded(false)} title="Close" className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-700"><X className="w-4 h-4" /></button>}
                        </>
                    )}
                    {versionHistory.length > 0 && mode === 'collaborative' && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentVersionIndex(Math.max(0, currentVersionIndex - 1))} disabled={currentVersionIndex <= 0} className="p-1 rounded-md hover:bg-gray-700 disabled:opacity-50"><ChevronLeft className="w-4 h-4"/></button>
                            <span className="text-sm font-mono">{currentVersionIndex + 1} / {versionHistory.length}</span>
                            <button onClick={() => setCurrentVersionIndex(Math.min(versionHistory.length - 1, currentVersionIndex + 1))} disabled={currentVersionIndex >= versionHistory.length - 1} className="p-1 rounded-md hover:bg-gray-700 disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
                {isRefining ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="w-6 h-6 animate-spin"/></div>
                ) : isEditing ? (
                    <textarea
                        value={textToShow || ''}
                        onChange={(e) => {
                            if (mode === 'review' || mode === 'reaction') {
                                setReviewOutput(prev => prev ? { ...prev, text: e.target.value } : { 
                                    id: Date.now().toString(),
                                    text: e.target.value, 
                                    report: '',
                                    timestamp: new Date().toISOString(),
                                    mode: mode
                                });
                            } else {
                                onUpdateVersion(currentVersionIndex, e.target.value);
                            }
                        }}
                        className="w-full h-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-gray-300 placeholder-gray-500 focus:outline-none resize-none leading-relaxed whitespace-pre-wrap"
                        autoFocus
                    />
                ) : textToShow ? (
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap break-words">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{textToShow}</ReactMarkdown>
                    </div>
                ) : (
                    <p className="text-gray-500">Refined versions of your draft will appear here.</p>
                )}
            </div>
            {textToShow && mode === 'collaborative' && (
                <div className="p-2 border-t border-gray-700 flex items-center justify-center">
                    <button onClick={() => { onAcceptVersion(textToShow); showToast("Version restored to main editor."); }} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md"><CheckCircle className="w-4 h-4" /> Accept Version</button>
                </div>
            )}
        </div>
    );
});
