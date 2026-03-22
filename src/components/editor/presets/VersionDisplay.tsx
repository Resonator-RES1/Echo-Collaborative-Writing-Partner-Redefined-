import React, { useState, useEffect } from 'react';
import { 
    Loader2, Copy, Pencil, Eye, Maximize2, Minimize2, X, 
    ChevronLeft, ChevronRight, CheckCircle, FileText, Activity,
    AlertTriangle, Zap, ShieldCheck, Target, BarChart3
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { marked } from 'marked';
import { RefinedVersion } from '../../../types';

interface VersionDisplayProps {
    mode: string;
    isRefining: boolean;
    reviewOutput: RefinedVersion | null;
    setReviewOutput: (output: any) => void;
    currentVersion: RefinedVersion;
    currentVersionIndex: number;
    versionHistory: RefinedVersion[];
    setCurrentVersionIndex: (index: number) => void;
    onUpdateVersion: (index: number, content: string) => void;
    onAcceptVersion: (version: string) => void;
    onShowComparison: () => void;
    setShowConflicts: (show: boolean) => void;
    onClearVersionHistory: () => void;
    showToast: (message: string) => void;
}

const ProgressBar: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-on-surface/60">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out`} 
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

const MetricBar: React.FC<{ label: string, value: number }> = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-on-surface/60">
            <span>{label}</span>
            <span>{value}/10</span>
        </div>
        <div className="flex gap-0.5">
            {[...Array(10)].map((_, i) => (
                <div 
                    key={i} 
                    className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${i < value ? 'bg-primary' : 'bg-surface-container-highest'}`}
                />
            ))}
        </div>
    </div>
);

export const VersionDisplay: React.FC<VersionDisplayProps> = React.memo(({
    mode, isRefining, reviewOutput, setReviewOutput, currentVersion, 
    currentVersionIndex, versionHistory, setCurrentVersionIndex, 
    onUpdateVersion, onAcceptVersion, onShowComparison, setShowConflicts, onClearVersionHistory, showToast
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

    const textToShow = currentVersion?.text;

    return (
        <div className={containerClasses}>
            <div className="p-3 border-b border-outline-variant/20 flex justify-between items-center flex-shrink-0 bg-surface-container-highest/30 rounded-t-[0.75rem]">
                <h3 className="font-headline text-lg text-primary font-semibold tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Echo Archive
                </h3>
                <div className="flex items-center gap-1.5">
                    {textToShow && !isRefining && (
                        <>
                            <button onClick={handleCopy} title="Copy to Clipboard" className="flex items-center gap-1.5 p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                <Copy className="w-4 h-4" />
                                <span className="text-xs font-label uppercase">Copy</span>
                            </button>
                            <button onClick={() => setIsEditing(!isEditing)} title={isEditing ? "Preview Changes" : "Edit Text"} className="flex items-center gap-1.5 p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                {isEditing ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                <span className="text-xs font-label uppercase">{isEditing ? 'Preview' : 'Edit'}</span>
                            </button>
                            <button onClick={onShowComparison} title="View Side-by-Side Diff" className="flex items-center gap-1.5 p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-label uppercase">Compare</span>
                            </button>
                            {currentVersion.conflicts && currentVersion.conflicts.length > 0 && (
                                <button onClick={() => setShowConflicts(true)} title="View Lore Conflicts" className="flex items-center gap-1.5 p-1.5 text-amber-500 hover:text-amber-600 rounded-[0.5rem] hover:bg-amber-500/10 transition-colors">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-label uppercase">Conflicts</span>
                                </button>
                            )}
                            <button onClick={onClearVersionHistory} title="Clear Archive" className="flex items-center gap-1.5 p-1.5 text-error hover:text-error/80 rounded-[0.5rem] hover:bg-error/10 transition-colors">
                                <X className="w-4 h-4" />
                                <span className="text-xs font-label uppercase">Clear</span>
                            </button>
                            <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Shrink Panel" : "Expand Panel"} className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            {isExpanded && <button onClick={() => setIsExpanded(false)} title="Close" className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors"><X className="w-4 h-4" /></button>}
                        </>
                    )}
                    {versionHistory.length > 0 && (
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
                ) : isEditing ? (
                    <textarea
                        value={textToShow || ''}
                        onChange={(e) => onUpdateVersion(currentVersionIndex, e.target.value)}
                        className="w-full h-full bg-surface-container-highest/30 border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 p-3 rounded-[0.5rem] transition-all focus:outline-none resize-none leading-relaxed whitespace-pre-wrap"
                        autoFocus
                    />
                ) : textToShow ? (
                    <div className="space-y-6">
                        <div className="relative">
                            <div className="prose prose-invert max-w-none whitespace-pre-wrap break-words text-on-surface p-6 bg-surface-container-highest/20 rounded-xl border border-outline-variant/20 prose-headings:text-primary prose-headings:font-bold">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{textToShow}</ReactMarkdown>
                            </div>
                            
                            {currentVersion.conflicts && currentVersion.conflicts.length > 0 && (
                                <div className="absolute -left-2 top-0 flex flex-col gap-2">
                                    {/* Conflict icons removed */}
                                </div>
                            )}
                        </div>
                        
                        {(currentVersion.summary || currentVersion.metrics || currentVersion.audit) && (
                            <div className="bg-surface-container-highest/20 rounded-xl border border-outline-variant/20 p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-headline text-lg text-primary font-semibold tracking-tight">Refinement Report</h4>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                        <Zap className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Audit Active</span>
                                    </div>
                                </div>

                                {/* Audit Scores */}
                                {currentVersion.audit && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-surface-container-highest/30 rounded-xl border border-outline-variant/10">
                                        <ProgressBar label="Lore Compliance" value={currentVersion.audit.loreCompliance} color="bg-emerald-500" />
                                        <ProgressBar label="Voice Adherence" value={currentVersion.audit.voiceAdherence} color="bg-blue-500" />
                                        <ProgressBar label="Focus Improvement" value={currentVersion.audit.focusAreaImprovement} color="bg-amber-500" />
                                    </div>
                                )}

                                {/* Vibe Radar / Metrics */}
                                {currentVersion.metrics && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-on-surface/60">
                                            <BarChart3 className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Vibe Radar (Prose Analytics)</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <MetricBar label="Sensory Vividness" value={currentVersion.metrics.sensory_vividness} />
                                            <MetricBar label="Pacing Rhythm" value={currentVersion.metrics.pacing_rhythm} />
                                            <MetricBar label="Dialogue Authenticity" value={currentVersion.metrics.dialogue_authenticity} />
                                            <MetricBar label="Voice Consistency" value={currentVersion.metrics.voice_consistency} />
                                        </div>
                                    </div>
                                )}

                                {currentVersion.summary && (
                                    <div className="pt-4 border-t border-outline-variant/10">
                                        <h5 className="font-label text-xs uppercase tracking-wider text-on-surface/60 mb-2 flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3" />
                                            Editor's Summary
                                        </h5>
                                        <p className="text-sm text-on-surface/80 leading-relaxed">{currentVersion.summary}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-on-surface-variant/70 italic text-center mt-8">Refined versions of your draft will appear here.</p>
                )}
            </div>
            {textToShow && (
                <div className="p-3 border-t border-outline-variant/20 flex items-center justify-center bg-surface-container-highest/10 rounded-b-[0.75rem]">
                    <button onClick={() => { onAcceptVersion(textToShow); showToast("Version restored to main editor."); }} className="flex items-center gap-2 text-xs font-label uppercase tracking-wider px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary-fixed rounded-full font-bold shadow-sm transition-all"><CheckCircle className="w-4 h-4" /> Accept Version</button>
                </div>
            )}
        </div>
    );
});
