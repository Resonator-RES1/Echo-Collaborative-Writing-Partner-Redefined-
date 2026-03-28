import React, { useState } from 'react';
import { Activity, CheckCircle2, BarChart3, Copy, Sparkles, Check } from 'lucide-react';
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
            <div className="flex flex-col flex-1 min-h-0 items-center justify-center text-center p-8 animate-in fade-in duration-700">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-on-surface-variant/20" />
                </div>
                <h3 className="font-headline text-xl font-light mb-1">No Report Available</h3>
                <p className="text-on-surface-variant max-w-xs mx-auto text-xs leading-relaxed">
                    Refine your draft or select a version from the Archive to view a detailed refinement report.
                </p>
            </div>
        );
    }

    if (version.text.startsWith('Error:')) {
        return (
            <div className="flex flex-col flex-1 min-h-0 items-center justify-center text-center p-8 animate-in fade-in duration-700">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-error" />
                </div>
                <h3 className="font-headline text-xl font-bold text-error mb-1">Refinement Failed</h3>
                <p className="text-on-surface-variant max-w-xs mx-auto text-sm leading-relaxed">
                    Check API Quota or network connection. The model was unable to complete the refinement process.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in duration-500 pb-0">
            
            {/* Executive Document Header */}
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-sm overflow-hidden mb-4 mt-4 mx-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-headline text-base font-bold text-on-surface tracking-tight">
                                {version.title || 'Refinement Report'}
                            </h3>
                            <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-widest font-bold">
                                Master Audit Log • Echo v2.5
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
                        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded border text-[10px] font-bold uppercase tracking-wider transition-all ${
                            copied 
                            ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30' 
                            : 'bg-surface-container-highest/30 text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-highest'
                        }`}
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy Report'}</span>
                    </button>
                </div>
            </div>

            {/* Linear Audit Stack */}
            <div className="flex flex-col gap-4 px-4 pb-24">
                {/* 1. Echo's Verdict */}
                <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 border-l-4 border-primary p-4 shadow-sm">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Echo's Verdict</h4>
                    <div className="flex items-start gap-3">
                        <div className="text-primary mt-0.5 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-on-surface text-sm leading-relaxed italic">
                                {version.summary || "Refinement complete. Review the audit stack below for full transparency."}
                            </p>
                        </div>
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
                    <span>Accept Refined Version</span>
                </button>
            </div>
        </div>
    );
};

export const ReportPanel = React.memo(ReportPanelComponent);
