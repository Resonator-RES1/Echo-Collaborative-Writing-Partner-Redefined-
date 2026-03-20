import React, { useState, useEffect } from 'react';
import { Loader2, X, Activity, FileText, UserCheck, CheckCircle2, AlertCircle, BarChart3, Info, Sparkles, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ComparisonResponse, VoiceCheckResponse } from '../../types';
import { SideBySideDiff } from './SideBySideDiff';

interface ComparisonViewProps {
    original: string;
    polished: string;
    comparisonData: ComparisonResponse | string;
    voiceCheckData: VoiceCheckResponse | string;
    onClose: () => void;
    onCompare: () => void;
    onCheckVoice: () => void;
    isComparing: boolean;
    isCheckingVoice: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = React.memo(({ 
    original, polished, comparisonData, voiceCheckData, onClose, onCompare, onCheckVoice, isComparing, isCheckingVoice 
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'changes' | 'voice'>('summary');
    
    useEffect(() => {
        if (!comparisonData) onCompare();
        if (!voiceCheckData) onCheckVoice();
    }, [comparisonData, voiceCheckData, onCompare, onCheckVoice]);

    const renderSummary = () => {
        if (isComparing || !comparisonData) return <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-on-surface/60 animate-pulse">Analyzing transformation...</p>
        </div>;
        
        if (typeof comparisonData === 'string') return <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">{comparisonData}</div>;

        const metrics = comparisonData.metrics || {
            wordCountChange: polished.split(/\s+/).length - original.split(/\s+/).length,
            readabilityShift: 'Neutral',
            toneShift: 'Neutral'
        };

        return (
            <div className="space-y-8">
                {/* Metrics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface-container-highest/30 border border-outline-variant/20 p-4 rounded-[0.75rem] flex items-center gap-4 shadow-sm">
                        <div className="bg-blue-500/10 p-3 rounded-[0.5rem]">
                            <BarChart3 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium">Word Count</p>
                            <p className={`font-headline text-xl font-semibold ${metrics.wordCountChange > 0 ? 'text-green-400' : metrics.wordCountChange < 0 ? 'text-blue-400' : 'text-on-surface'}`}>
                                {metrics.wordCountChange > 0 ? '+' : ''}{metrics.wordCountChange} words
                            </p>
                        </div>
                    </div>
                    <div className="bg-surface-container-highest/30 border border-outline-variant/20 p-4 rounded-[0.75rem] flex items-center gap-4 shadow-sm">
                        <div className="bg-primary/10 p-3 rounded-[0.5rem]">
                            <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium">Readability</p>
                            <p className="font-headline text-xl text-on-surface font-semibold">{metrics.readabilityShift}</p>
                        </div>
                    </div>
                    <div className="bg-surface-container-highest/30 border border-outline-variant/20 p-4 rounded-[0.75rem] flex items-center gap-4 shadow-sm">
                        <div className="bg-emerald-500/10 p-3 rounded-[0.5rem]">
                            <Wand2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium">Tone Shift</p>
                            <p className="font-headline text-xl text-on-surface font-semibold">{metrics.toneShift}</p>
                        </div>
                    </div>
                </div>

                {/* Main Summary */}
                <div className="bg-surface-container-highest/30 border border-outline-variant/20 p-6 rounded-[1rem] relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <h3 className="flex items-center gap-2 font-headline text-lg text-primary mb-4 font-semibold">
                        <FileText className="w-5 h-5" />
                        Transformation Summary
                    </h3>
                    <div className="prose prose-invert max-w-none text-on-surface leading-relaxed whitespace-pre-wrap">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{comparisonData.summary}</ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    };

    const renderVoiceCheck = () => {
        if (isCheckingVoice || !voiceCheckData) return <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-on-surface/60 animate-pulse">Evaluating stylistic fidelity...</p>
        </div>;

        if (typeof voiceCheckData === 'string') return <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">{voiceCheckData}</div>;

        const scoreColor = voiceCheckData.consistencyScore >= 80 ? 'text-emerald-400' : voiceCheckData.consistencyScore >= 60 ? 'text-amber-400' : 'text-red-400';

        return (
            <div className="space-y-8">
                {/* Score Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 bg-surface-container-highest/30 p-6 rounded-[1rem] border border-outline-variant/20 shadow-sm">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-outline-variant/20" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * voiceCheckData.consistencyScore) / 100} className={`${scoreColor} transition-all duration-1000 ease-out`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold ${scoreColor}`}>{voiceCheckData.consistencyScore}%</span>
                            <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium">Fidelity</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-headline text-xl text-on-surface mb-2 flex items-center gap-2 font-semibold">
                            <UserCheck className="w-6 h-6 text-primary" />
                            Voice Consistency Analysis
                        </h3>
                        <p className="text-on-surface leading-relaxed italic">"{voiceCheckData.verdict}"</p>
                    </div>
                </div>

                {/* Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 font-label text-xs uppercase tracking-wider text-emerald-400 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Stylistic Strengths
                        </h4>
                        <div className="space-y-2">
                            {voiceCheckData.strengths.map((s, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-emerald-900/10 border border-emerald-900/30 rounded-[0.5rem] text-sm text-on-surface">
                                    <span className="text-emerald-500 font-bold">•</span>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 font-label text-xs uppercase tracking-wider text-amber-400 font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Stylistic Concerns
                        </h4>
                        <div className="space-y-2">
                            {voiceCheckData.concerns.map((c, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-amber-900/10 border border-amber-900/30 rounded-[0.5rem] text-sm text-on-surface">
                                    <span className="text-amber-500 font-bold">•</span>
                                    {c}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed Analysis */}
                <div className="bg-surface-container-highest/30 border border-outline-variant/20 p-6 rounded-[1rem] shadow-sm">
                    <h4 className="flex items-center gap-2 font-label text-xs uppercase tracking-wider text-primary mb-4 font-medium">
                        <Info className="w-4 h-4" />
                        Deep Dive Analysis
                    </h4>
                    <div className="prose prose-invert max-w-none text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{voiceCheckData.analysis}</ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    };

    const renderChanges = () => {
        if (isComparing || !comparisonData) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
        if (typeof comparisonData === 'string') return <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">{comparisonData}</div>;
        return (
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
                <div>
                    <h3 className="font-headline text-xl text-on-surface mb-4 font-semibold">Key Change Explanations</h3>
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {comparisonData.changes.map((change, index) => (
                            <div key={index} className="bg-surface-container-highest/30 p-4 rounded-[0.75rem] border border-outline-variant/20 hover:border-primary/50 transition-colors group shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-label text-xs uppercase tracking-wider text-primary font-medium">{change.location}</span>
                                    <span className="font-label text-xs text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-[0.25rem] uppercase tracking-wider font-medium">{change.reasoning.split(' ')[0]}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                    <div className="space-y-1">
                                        <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium">Original</p>
                                        <div className="p-3 bg-red-900/10 border border-red-900/20 rounded-[0.5rem] text-red-300/80 italic line-through decoration-red-500/50">
                                            {change.original}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium">Polished</p>
                                        <div className="p-3 bg-green-900/10 border border-green-900/20 rounded-[0.5rem] text-green-300 font-medium">
                                            {change.polished}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed group-hover:text-on-surface transition-colors">
                                    <span className="text-primary font-bold mr-1">Rationale:</span>
                                    {change.reasoning}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };
    
    const tabs = [
        { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
        { id: 'changes', label: 'Detailed Changes', icon: <Activity className="w-4 h-4" /> },
        { id: 'voice', label: 'Voice Check', icon: <UserCheck className="w-4 h-4" /> },
    ];
    
    return (
        <div className="fixed inset-0 bg-surface-container-highest/90 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8">
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-[1.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                <header className="px-6 py-5 flex justify-between items-center border-b border-outline-variant/20 bg-surface-container-highest/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-[0.75rem]">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-headline text-xl text-on-surface font-semibold">Comparison Analysis</h2>
                            <p className="text-xs text-on-surface-variant/70">Reviewing AI refinements vs. original intent</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-[0.75rem] text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all">
                        <X className="w-6 h-6"/>
                    </button>
                </header>
                
                <nav className="px-6 py-3 border-b border-outline-variant/20 bg-surface-container-highest/10">
                    <ul className="flex items-center gap-1">
                        {tabs.map(tab => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-[0.75rem] transition-all ${
                                        activeTab === tab.id 
                                            ? 'bg-primary text-on-primary-fixed shadow-md' 
                                            : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <main className="p-6 md:p-8 overflow-y-auto flex-grow custom-scrollbar bg-surface-container-low">
                    {activeTab === 'summary' && renderSummary()}
                    {activeTab === 'changes' && renderChanges()}
                    {activeTab === 'voice' && renderVoiceCheck()}
                </main>

                <footer className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-highest/30 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        Close
                    </button>
                    <button 
                        onClick={() => {
                            onCompare();
                            onCheckVoice();
                        }}
                        className="px-6 py-2 bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface text-sm font-bold rounded-[0.75rem] border border-outline-variant/20 transition-all shadow-sm"
                    >
                        Re-analyze
                    </button>
                </footer>
            </div>
        </div>
    );
});
