import React, { useState, useEffect } from 'react';
import { 
    Loader2, Copy, Pencil, Eye, Maximize2, Minimize2, X, 
    ChevronLeft, ChevronRight, CheckCircle, FileText 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { marked } from 'marked';
import { RefinedVersion, RefineMode } from '../../../types';

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
    onAcceptVersion: (version: string) => void;
    showToast: (message: string) => void;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = React.memo(({
    mode, isRefining, reviewOutput, setReviewOutput, currentVersion, 
    currentVersionIndex, versionHistory, setCurrentVersionIndex, 
    onUpdateVersion, onAcceptVersion, showToast
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (mode !== 'collaborative') {
            setIsEditing(false);
        }
    }, [mode]);

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
        bg-surface-container-low rounded-[0.75rem] border border-outline-variant/20 flex flex-col flex-grow shadow-sm
        ${(mode === 'review' || mode === 'reaction') ? 'bg-blue-50/10 border-blue-200/30' : ''}
        ${isExpanded
            ? 'fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-surface-container-highest/95 backdrop-blur-md shadow-2xl min-h-0'
            : 'min-h-[300px]'}
        transition-all duration-300 ease-in-out
    `;

    const textToShow = (mode === 'review' || mode === 'reaction') ? reviewOutput?.text : currentVersion?.text;

    return (
        <div className={containerClasses}>
            <div className="p-3 border-b border-outline-variant/20 flex justify-between items-center flex-shrink-0 bg-surface-container-highest/30 rounded-t-[0.75rem]">
                <h3 className="font-headline text-lg text-primary font-semibold tracking-tight flex items-center gap-2">
                    {(mode === 'review' || mode === 'reaction') && <FileText className="w-5 h-5" />}
                    {mode === 'review' ? 'Review Output' : mode === 'reaction' ? 'Reaction Output' : 'Version History'}
                </h3>
                <div className="flex items-center gap-1.5">
                    {textToShow && !isRefining && (
                        <>
                            <button onClick={handleCopy} title="Copy to Clipboard" className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                <Copy className="w-4 h-4" />
                            </button>
                            {mode === 'collaborative' && (
                                <button onClick={() => setIsEditing(!isEditing)} title={isEditing ? "Preview Changes" : "Edit Text"} className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                    {isEditing ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                </button>
                            )}
                            <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Shrink Panel" : "Expand Panel"} className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            {isExpanded && <button onClick={() => setIsExpanded(false)} title="Close" className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors"><X className="w-4 h-4" /></button>}
                        </>
                    )}
                    {versionHistory.length > 0 && mode === 'collaborative' && (
                        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-outline-variant/20">
                            <button onClick={() => setCurrentVersionIndex(Math.max(0, currentVersionIndex - 1))} disabled={currentVersionIndex <= 0} className="p-1 rounded-[0.5rem] hover:bg-surface-container-highest disabled:opacity-50 text-on-surface-variant hover:text-on-surface transition-colors"><ChevronLeft className="w-4 h-4"/></button>
                            <span className="text-xs font-mono text-on-surface-variant font-medium">{currentVersionIndex + 1} / {versionHistory.length}</span>
                            <button onClick={() => setCurrentVersionIndex(Math.min(versionHistory.length - 1, currentVersionIndex + 1))} disabled={currentVersionIndex >= versionHistory.length - 1} className="p-1 rounded-[0.5rem] hover:bg-surface-container-highest disabled:opacity-50 text-on-surface-variant hover:text-on-surface transition-colors"><ChevronRight className="w-4 h-4"/></button>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
                {isRefining ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary"/></div>
                ) : (isEditing && mode === 'collaborative') ? (
                    <textarea
                        value={textToShow || ''}
                        onChange={(e) => {
                            if (mode !== 'collaborative') {
                                setReviewOutput(prev => {
                                    if (prev) return { ...prev, text: e.target.value };
                                    return {
                                        id: Date.now().toString(),
                                        text: e.target.value,
                                        report: '',
                                        timestamp: new Date().toISOString(),
                                        mode: mode,
                                        title: 'Refined Version'
                                    };
                                });
                            } else {
                                onUpdateVersion(currentVersionIndex, e.target.value);
                            }
                        }}
                        className="w-full h-full bg-surface-container-highest/30 border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 p-3 rounded-[0.5rem] transition-all focus:outline-none resize-none leading-relaxed whitespace-pre-wrap"
                        autoFocus
                    />
                ) : textToShow ? (
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap break-words text-on-surface p-6 bg-surface-container-highest/20 rounded-xl border border-outline-variant/20 prose-headings:text-primary prose-headings:font-bold">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{textToShow}</ReactMarkdown>
                    </div>
                ) : (
                    <p className="text-on-surface-variant/70 italic text-center mt-8">Refined versions of your draft will appear here.</p>
                )}
            </div>
            {textToShow && mode === 'collaborative' && (
                <div className="p-3 border-t border-outline-variant/20 flex items-center justify-center bg-surface-container-highest/10 rounded-b-[0.75rem]">
                    <button onClick={() => { onAcceptVersion(textToShow); showToast("Version restored to main editor."); }} className="flex items-center gap-2 text-xs font-label uppercase tracking-wider px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary-fixed rounded-full font-bold shadow-sm transition-all"><CheckCircle className="w-4 h-4" /> Accept Version</button>
                </div>
            )}
        </div>
    );
});
