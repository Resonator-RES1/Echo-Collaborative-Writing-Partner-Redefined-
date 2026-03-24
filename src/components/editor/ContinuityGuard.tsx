import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Zap, Search, Undo2, Check } from 'lucide-react';
import { LoreEntry, VoiceProfile } from '../../types';
import { scanForContext, detectPotentialInconsistencies, ContinuityIssue } from '../../utils/contextScanner';

interface ContinuityGuardProps {
    draft: string;
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    onActivateLore: (id: string) => void;
    onActivateVoice: (id: string) => void;
    onFix: (original: string, replacement: string) => void;
    showToast: (message: string) => void;
    onIssuesUpdate?: (count: number) => void;
}

export const ContinuityGuard: React.FC<ContinuityGuardProps> = ({
    draft,
    loreEntries,
    voiceProfiles,
    onActivateLore,
    onActivateVoice,
    onFix,
    showToast,
    onIssuesUpdate
}) => {
    const [resolvedFixes, setResolvedFixes] = useState<{ id: string, original: string, replacement: string }[]>([]);

    // 1. Detect Mentions
    const detectedLoreIds = useMemo(() => scanForContext(draft, loreEntries), [draft, loreEntries]);
    const detectedVoiceIds = useMemo(() => scanForContext(draft, voiceProfiles), [draft, voiceProfiles]);

    const detectedLore = useMemo(() => 
        loreEntries.filter(e => detectedLoreIds.includes(e.id)), 
        [loreEntries, detectedLoreIds]
    );
    
    const detectedVoices = useMemo(() => 
        voiceProfiles.filter(v => detectedVoiceIds.includes(v.id)), 
        [voiceProfiles, detectedVoiceIds]
    );

    // 2. Local Heuristic Warnings
    const localWarnings = useMemo(() => {
        const activeLore = loreEntries.filter(e => e.isActive);
        const activeVoices = voiceProfiles.filter(v => v.isActive);
        return detectPotentialInconsistencies(draft, activeLore, activeVoices);
    }, [draft, loreEntries, voiceProfiles]);

    // Filter out warnings that have been resolved
    const activeWarnings = useMemo(() => {
        return localWarnings.filter(w => !resolvedFixes.some(r => r.id === w.id));
    }, [localWarnings, resolvedFixes]);

    // 3. Inactive Mentions (Blind Spots)
    const inactiveMentions = useMemo(() => {
        const lore = detectedLore.filter(e => !e.isActive);
        const voices = detectedVoices.filter(v => !v.isActive);
        return { lore, voices };
    }, [detectedLore, detectedVoices]);

    const totalIssues = activeWarnings.length + inactiveMentions.lore.length + inactiveMentions.voices.length;

    useEffect(() => {
        onIssuesUpdate?.(totalIssues);
    }, [totalIssues, onIssuesUpdate]);

    useEffect(() => {
        setResolvedFixes(prev => prev.filter(fix => {
            const warningStillExists = localWarnings.some(w => w.id === fix.id);
            return !warningStillExists;
        }));
    }, [localWarnings]);

    const handleApplyFix = (issue: ContinuityIssue) => {
        if (!issue.actionable) return;
        onFix(issue.actionable.original, issue.actionable.replacement);
        setResolvedFixes(prev => [...prev, { id: issue.id, original: issue.actionable!.original, replacement: issue.actionable!.replacement }]);
        showToast(`Replaced "${issue.actionable.original}" with "${issue.actionable.replacement}"`);
    };

    const handleRevertFix = (resolvedId: string) => {
        const fix = resolvedFixes.find(r => r.id === resolvedId);
        if (!fix) return;
        // Swap replacement and original to revert
        onFix(fix.replacement, fix.original);
        setResolvedFixes(prev => prev.filter(r => r.id !== resolvedId));
        showToast(`Reverted "${fix.replacement}" back to "${fix.original}"`);
    };

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden flex flex-col shadow-sm mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="p-4 border-b border-outline-variant/10 bg-surface-container-highest/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${totalIssues > 0 ? 'text-amber-500' : 'text-primary'}`} />
                    <div className="flex flex-col">
                        <h3 className="font-label text-[10px] uppercase tracking-[0.2em] font-black text-on-surface/80">Continuity Guard</h3>
                        <p className="text-[8px] text-on-surface-variant/60 uppercase tracking-wider">Scanning: Lore, Voices, Pronouns, Aliases</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {(inactiveMentions.lore.length > 0 || inactiveMentions.voices.length > 0) && (
                        <button 
                            onClick={() => {
                                inactiveMentions.lore.forEach(l => onActivateLore(l.id));
                                inactiveMentions.voices.forEach(v => onActivateVoice(v.id));
                                showToast(`Activated ${inactiveMentions.lore.length + inactiveMentions.voices.length} profiles`);
                            }}
                            className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-tighter hover:bg-primary/20 transition-all"
                        >
                            Sync All
                        </button>
                    )}
                    {totalIssues > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-tighter">
                            {totalIssues} Alerts
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-6 max-h-[300px] overflow-y-auto scrollbar-thin">
                {/* 1. Blind Spots (Inactive Mentions) */}
                {(inactiveMentions.lore.length > 0 || inactiveMentions.voices.length > 0) && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-on-surface/50">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Blind Spots Detected</span>
                        </div>
                        <div className="space-y-2">
                            {inactiveMentions.lore.map(entry => (
                                <button 
                                    key={entry.id}
                                    onClick={() => { onActivateLore(entry.id); showToast(`Activated ${entry.title}`); }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-all group"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-bold text-on-surface">{entry.title}</span>
                                        <span className="text-[8px] text-amber-500/70 uppercase font-black">Lore Mentioned but Inactive</span>
                                    </div>
                                    <Zap className="w-3 h-3 text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                            {inactiveMentions.voices.map(voice => (
                                <button 
                                    key={voice.id}
                                    onClick={() => { onActivateVoice(voice.id); showToast(`Activated ${voice.name}`); }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-all group"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-bold text-on-surface">{voice.name}</span>
                                        <span className="text-[8px] text-amber-500/70 uppercase font-black">Voice Mentioned but Inactive</span>
                                    </div>
                                    <Zap className="w-3 h-3 text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Heuristic Warnings */}
                {activeWarnings.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-on-surface/50">
                            <Search className="w-3 h-3 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Continuity Scan</span>
                        </div>
                        <div className="space-y-2">
                            {activeWarnings.map((warning) => (
                                <div key={warning.id} className="p-3 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10 flex flex-col gap-2">
                                    <div className="flex gap-3">
                                        <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-on-surface-variant leading-relaxed">{warning.message}</p>
                                    </div>
                                    {warning.actionable && (
                                        <div className="flex justify-end mt-1">
                                            <button 
                                                onClick={() => handleApplyFix(warning)}
                                                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                                            >
                                                <Check className="w-3 h-3" />
                                                Fix: Replace "{warning.actionable.original}" with "{warning.actionable.replacement}"
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Resolved Fixes (Revertible) */}
                {resolvedFixes.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-on-surface/50">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Resolved Issues</span>
                        </div>
                        <div className="space-y-2">
                            {resolvedFixes.map((fix) => (
                                <div key={`resolved-${fix.id}`} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-on-surface">Replaced "{fix.original}" with "{fix.replacement}"</span>
                                    </div>
                                    <button 
                                        onClick={() => handleRevertFix(fix.id)}
                                        className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
                                        title="Revert this change"
                                    >
                                        <Undo2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Empty State */}
                {totalIssues === 0 && resolvedFixes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-on-surface">Lore is Synchronized</p>
                            <p className="text-[10px] text-on-surface-variant/60 max-w-[180px]">No blind spots or obvious contradictions found in the current draft.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
