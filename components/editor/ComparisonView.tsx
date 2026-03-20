import React, { useState, useEffect } from 'react';
import { Loader2, X, Activity, FileText, UserCheck, CheckCircle2, AlertCircle, BarChart3, Info, Sparkles, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ComparisonResponse, VoiceCheckResponse } from '../../src/types';
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
            <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
            <p className="text-gray-400 animate-pulse">Analyzing transformation...</p>
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
                    <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl flex items-center gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Word Count</p>
                            <p className={`text-xl font-bold ${metrics.wordCountChange > 0 ? 'text-green-400' : metrics.wordCountChange < 0 ? 'text-blue-400' : 'text-gray-300'}`}>
                                {metrics.wordCountChange > 0 ? '+' : ''}{metrics.wordCountChange} words
                            </p>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl flex items-center gap-4">
                        <div className="bg-purple-500/20 p-3 rounded-lg">
                            <Activity className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Readability</p>
                            <p className="text-xl font-bold text-white">{metrics.readabilityShift}</p>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl flex items-center gap-4">
                        <div className="bg-emerald-500/20 p-3 rounded-lg">
                            <Wand2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Tone Shift</p>
                            <p className="text-xl font-bold text-white">{metrics.toneShift}</p>
                        </div>
                    </div>
                </div>

                {/* Main Summary */}
                <div className="bg-gray-800/30 border border-gray-700 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-300 mb-4">
                        <FileText className="w-5 h-5" />
                        Transformation Summary
                    </h3>
                    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{comparisonData.summary}</ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    };

    const renderVoiceCheck = () => {
        if (isCheckingVoice || !voiceCheckData) return <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
            <p className="text-gray-400 animate-pulse">Evaluating stylistic fidelity...</p>
        </div>;

        if (typeof voiceCheckData === 'string') return <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">{voiceCheckData}</div>;

        const scoreColor = voiceCheckData.consistencyScore >= 80 ? 'text-emerald-400' : voiceCheckData.consistencyScore >= 60 ? 'text-amber-400' : 'text-red-400';

        return (
            <div className="space-y-8">
                {/* Score Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * voiceCheckData.consistencyScore) / 100} className={`${scoreColor} transition-all duration-1000 ease-out`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold ${scoreColor}`}>{voiceCheckData.consistencyScore}%</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Fidelity</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <UserCheck className="w-6 h-6 text-purple-400" />
                            Voice Consistency Analysis
                        </h3>
                        <p className="text-gray-300 leading-relaxed italic">"{voiceCheckData.verdict}"</p>
                    </div>
                </div>

                {/* Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-widest">
                            <CheckCircle2 className="w-4 h-4" />
                            Stylistic Strengths
                        </h4>
                        <div className="space-y-2">
                            {voiceCheckData.strengths.map((s, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-emerald-900/10 border border-emerald-900/30 rounded-lg text-sm text-gray-300">
                                    <span className="text-emerald-500 font-bold">•</span>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-widest">
                            <AlertCircle className="w-4 h-4" />
                            Stylistic Concerns
                        </h4>
                        <div className="space-y-2">
                            {voiceCheckData.concerns.map((c, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-amber-900/10 border border-amber-900/30 rounded-lg text-sm text-gray-300">
                                    <span className="text-amber-500 font-bold">•</span>
                                    {c}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed Analysis */}
                <div className="bg-gray-800/30 border border-gray-700 p-6 rounded-2xl">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">
                        <Info className="w-4 h-4" />
                        Deep Dive Analysis
                    </h4>
                    <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{voiceCheckData.analysis}</ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    };

    const renderChanges = () => {
        if (isComparing || !comparisonData) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-purple-400" /></div>;
        if (typeof comparisonData === 'string') return <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">{comparisonData}</div>;
        return (
            <div className="space-y-8">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-400" />
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
                    <h3 className="text-xl font-semibold text-white mb-4">Key Change Explanations</h3>
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {comparisonData.changes.map((change, index) => (
                            <div key={index} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">{change.location}</span>
                                    <span className="text-[10px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded uppercase">{change.reasoning.split(' ')[0]}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-gray-500">Original</p>
                                        <div className="p-3 bg-red-900/10 border border-red-900/20 rounded-lg text-red-300/80 italic line-through decoration-red-500/50">
                                            {change.original}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-gray-500">Polished</p>
                                        <div className="p-3 bg-green-900/10 border border-green-900/20 rounded-lg text-green-300 font-medium">
                                            {change.polished}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                    <span className="text-purple-400 font-bold mr-1">Rationale:</span>
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
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                <header className="px-6 py-5 flex justify-between items-center border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-600/20 p-2 rounded-xl">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Comparison Analysis</h2>
                            <p className="text-xs text-gray-500">Reviewing AI refinements vs. original intent</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
                        <X className="w-6 h-6"/>
                    </button>
                </header>
                
                <nav className="px-6 py-3 border-b border-gray-800 bg-gray-900/30">
                    <ul className="flex items-center gap-1">
                        {tabs.map(tab => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                                        activeTab === tab.id 
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <main className="p-6 md:p-8 overflow-y-auto flex-grow custom-scrollbar bg-gray-900/20">
                    {activeTab === 'summary' && renderSummary()}
                    {activeTab === 'changes' && renderChanges()}
                    {activeTab === 'voice' && renderVoiceCheck()}
                </main>

                <footer className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Close
                    </button>
                    <button 
                        onClick={() => {
                            onCompare();
                            onCheckVoice();
                        }}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded-xl border border-gray-700 transition-all"
                    >
                        Re-analyze
                    </button>
                </footer>
            </div>
        </div>
    );
});
