import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { RefinedVersion } from '../../types';

interface ReportRestraintLogProps {
    restraintLog: RefinedVersion['restraintLog'];
}

export const ReportRestraintLog: React.FC<ReportRestraintLogProps> = ({ restraintLog }) => {
    if (!restraintLog || restraintLog.length === 0) return null;

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-sky/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-accent-sky" />
                </div>
                <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">Respect & Fidelity</h3>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Restraint Log (Deliberate Preservations)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {restraintLog.map((log, idx) => (
                    <div key={idx} className="group p-4 bg-surface-container-highest/20 rounded-xl border border-outline-variant/5 hover:border-accent-sky/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent-sky/70">{log.category}</span>
                            <div className="w-2 h-2 rounded-full bg-accent-sky/30 group-hover:bg-accent-sky transition-colors"></div>
                        </div>
                        <h4 className="font-headline text-sm font-bold mb-2 text-on-surface/90">"{log.target}"</h4>
                        <div className="flex gap-2 bg-surface-container-highest/30 p-2 rounded-lg border border-outline-variant/5">
                            <Info className="w-3.5 h-3.5 text-accent-sky/40 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-on-surface-variant/80 leading-relaxed italic">{log.justification}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
