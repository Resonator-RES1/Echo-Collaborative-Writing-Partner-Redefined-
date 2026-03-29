import React, { useState } from 'react';
import { Activity, CheckCircle2, BarChart3, Copy, Sparkles, Check, FileText } from 'lucide-react';
import { RefinedVersion, LoreCorrection } from '../../types';
import { ReportContext } from '../report/ReportContext';
import { ReportAudit } from '../report/ReportAudit';
import { ReportRestraintLog } from '../report/ReportRestraintLog';
import { ReportAnalysis } from '../report/ReportAnalysis';
import { ReportMetrics } from '../report/ReportMetrics';
import { ReportLoreCorrections } from '../report/ReportLoreCorrections';
import { ReportLoreFraying } from '../report/ReportLoreFraying';
import { ReportVoiceResonance } from '../report/ReportVoiceResonance';
import { formatReportForCopy } from '../../utils/reportFormatter';
import { EmptyState } from '../ui/EmptyState';

interface ReportPanelProps {
    version: RefinedVersion | null;
    original: string;
    onAccept: (version: RefinedVersion) => void;
    onRevertLore: () => void;
    onRevertSpecificLore?: (correction: LoreCorrection) => void;
}

const ReportPanelComponent: React.FC<ReportPanelProps> = ({
    version,
    original,
    onAccept,
    onRevertLore,
    onRevertSpecificLore
}) => {
    const [copied, setCopied] = useState(false);

    if (!version) {
        return (
            <EmptyState 
                icon={BarChart3}
                title="No Audit Log Available"
                description="Audit your draft or select a version from The Ledger to view a detailed audit log."
            />
        );
    }

    if (version.text.startsWith('Error:')) {
        return (
            <EmptyState 
                icon={Activity}
                title="Audit Failed"
                description="Check API Quota or network connection. The model was unable to complete the auditing process."
            />
        );
    }

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in duration-500 pb-0">
            <div className="flex items-center justify-between mb-8 px-4 pt-4">
                <div className="space-y-1">
                    <h3 className="font-headline text-3xl font-bold">Audit Log</h3>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Evidentiary records and performance analysis.</p>
                </div>
            </div>
            
            {/* Linear Audit Stack */}
            <div className="flex flex-col gap-4 px-4 pb-24">
                {/* 1. Echo's Verdict */}
                <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 border-l-4 border-primary p-4 shadow-sm">
                    {/* Metadata Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-on-surface tracking-tight leading-tight">
                                    {version.title || 'Audit Log'}
                                </h4>
                                <p className="text-[10px] text-on-surface-variant/50 font-medium">
                                    {version.timestamp ? new Date(version.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Unknown Date'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                const reportText = formatReportForCopy(version);
                                navigator.clipboard.writeText(reportText);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all text-[10px] font-bold uppercase tracking-wider ${
                                copied 
                                ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30' 
                                : 'bg-transparent text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-highest'
                            }`}
                            title="Copy Audit Log"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>

                    {/* Verdict Content */}
                    <div className="pt-3 border-t border-outline-variant/10">
                        <p className="text-on-surface text-sm leading-relaxed italic">
                            {version.summary || "Audit complete. Review the audit stack below for full transparency."}
                        </p>
                    </div>
                </div>

                {/* 2. Mirror Editor Analysis */}
                <ReportAnalysis version={version} />

                {/* 3. Fidelity Audit */}
                {!version.isSurgical && (
                    <ReportAudit audit={version.audit} />
                )}

                {/* 4. Prose Metrics */}
                {!version.isSurgical && (
                    <ReportMetrics metrics={version.metrics} />
                )}

                {/* 5. Preservation Log */}
                {!version.isSurgical && (
                    <ReportRestraintLog restraintLog={version.restraintLog} />
                )}

                {/* 6. Voice Resonance Radar */}
                <ReportVoiceResonance voiceAudits={version.voiceAudits} />

                {/* 7. Lore Correction */}
                <ReportLoreCorrections 
                    loreCorrections={version.loreCorrections} 
                    onRevertSpecificLore={onRevertSpecificLore} 
                />

                {/* 8. Lore Fraying */}
                {!version.isSurgical && (
                    <ReportLoreFraying loreFraying={version.loreFraying} />
                )}

                {/* 9. Active Context */}
                {!version.isSurgical && (
                    <ReportContext activeContext={version.activeContext} />
                )}

                {/* Action Button */}
                <button 
                    onClick={() => onAccept(version)}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs rounded-md hover:bg-primary/90 transition-all shadow-sm active:scale-95 w-full mt-4"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Audited Version</span>
                </button>
            </div>
        </div>
    );
};

export const ReportPanel = React.memo(ReportPanelComponent);
