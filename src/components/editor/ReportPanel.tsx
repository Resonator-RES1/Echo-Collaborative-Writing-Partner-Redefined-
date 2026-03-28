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
        /* FIXED: Using pr-2 pb-12 from the working snapshot to kill the white space gap */
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in duration-500 pr-2 pb-12">
            
            {/* STATIC HEADER: Echo's Verdict - Now a permanent header as intended */}
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-sm relative overflow-hidden mb-6 sm:mb-8 mt-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 p-6 sm:p-8 relative z-10">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner shrink-0">
                            <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-headline text-lg sm:text-2xl font-bold text-on-surface tracking-tight break-words">{version.title || 'Refinement Report'}</h3>
                            <p className="text-[9px] sm:text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black">Echo Analysis & Insights</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            const reportText = formatReportForCopy(version);
                            navigator.clipboard.writeText(reportText);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group border border-outline-variant/10 ${
                            copied 
                            ? 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30' 
                            : 'bg-surface-container-highest/50 text-on-surface-variant hover:bg-primary hover:text-on-primary'
                        }`}
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 group-hover:scale-110 transition-transform" />}
                        <span>{copied ? 'Copied!' : 'Copy Report'}</span>
                    </button>
                </div>
                
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 relative z-10">
                    <div className="h-px w-full bg-outline-variant/10 mb-6 sm:mb-8"></div>
                    <div className="relative p-6 sm:p-8 bg-surface-container-high rounded-2xl border border-outline-variant/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-on-surface font-headline text-lg sm:text-xl font-bold mb-2">
                                    Echo's Verdict
                                </h4>
                                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed italic">
                                    {version.summary || "Refinement complete. Review the metrics below."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RADAR: Re-restored directly under the verdict */}
            <ReportVoiceResonance voiceAudits={version.voiceAudits} />

            {/* SECTIONS: Keeping the grid and surgical mode gates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 mt-6">
                <div className="lg:col-span-2">
                    <ReportLoreCorrections loreCorrections={version.loreCorrections} onRevertSpecificLore={onRevertSpecificLore} />
                </div>
                {!version.isSurgical && (
                    <div className="lg:col-span-2">
                        <ReportLoreFraying loreFraying={version.loreFraying} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="lg:col-span-2">
                    <ReportAnalysis version={version} />
                </div>
                {!version.isSurgical && (
                    <>
                        <div className="lg:col-span-2">
                            <ReportRestraintLog restraintLog={version.restraintLog} />
                        </div>
                        <ReportContext activeContext={version.activeContext} />
                        <ReportMetrics metrics={version.metrics} />
                        <div className="lg:col-span-2">
                            <ReportAudit audit={version.audit} />
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8 mb-8 flex justify-center">
                <button 
                    onClick={() => onAccept(version)}
                    className="flex items-center justify-center gap-3 sm:gap-4 px-6 py-4 sm:px-12 sm:py-6 bg-primary text-on-primary-fixed font-label uppercase tracking-[0.15em] sm:tracking-[0.25em] text-xs sm:text-base font-black rounded-[2rem] hover:bg-primary/90 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1.5 active:translate-y-0 active:scale-95 group relative overflow-hidden border-b-4 border-primary/30 w-full sm:w-auto"
                >
                    <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7" />
                    <span>Accept Refined Version</span>
                </button>
            </div>
        </div>
    );
};

export const ReportPanel = React.memo(ReportPanelComponent);
