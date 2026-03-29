import React from 'react';
import { AlertCircle, Scissors, ChevronRight } from 'lucide-react';
import { ContinuityIssue } from '../../utils/contextScanner';

interface LocalAuditSuiteProps {
  continuityIssues: ContinuityIssue[];
  onIssueClick: (issue: ContinuityIssue) => void;
  onRevisionClick: (snippet: any) => void;
  revisionSnippets: any[];
}

export const LocalAuditSuite: React.FC<LocalAuditSuiteProps> = ({
  continuityIssues,
  onIssueClick,
  onRevisionClick,
  revisionSnippets
}) => {
  return (
    <aside className="w-72 flex-shrink-0 bg-surface-container-lowest border-l border-outline-variant/10 flex flex-col overflow-hidden">
      {/* Top: Continuity Guard (Fraying Axioms) */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-outline-variant/10">
        <div className="p-3 border-b border-outline-variant/10 bg-surface-container-low/50 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Fraying Axioms</h3>
          <span className="px-1.5 py-0.5 rounded-full bg-error/10 text-error text-[10px] font-bold">
            {continuityIssues.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {continuityIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20 py-8">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No issues detected</p>
            </div>
          ) : (
            continuityIssues.map((issue, idx) => (
              <button
                key={idx}
                onClick={() => onIssueClick(issue)}
                className="w-full text-left p-2 rounded-lg hover:bg-surface-container-highest transition-colors group border border-transparent hover:border-outline-variant/20"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-error mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-on-surface truncate">{issue.message}</p>
                    <p className="text-[10px] text-on-surface-variant line-clamp-1 italic">"{issue.actionable?.original || ''}"</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/20 group-hover:text-on-surface-variant transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom: Scissors (Revision) */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 border-b border-outline-variant/10 bg-surface-container-low/50 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Scissors (Revision)</h3>
          <Scissors className="w-3.5 h-3.5 text-on-surface-variant/40" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {revisionSnippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20 py-8">
              <Scissors className="w-8 h-8 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No snippets</p>
            </div>
          ) : (
            revisionSnippets.map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => onRevisionClick(snippet)}
                className="w-full text-left p-2 rounded-lg hover:bg-surface-container-highest transition-colors group border border-transparent hover:border-outline-variant/20"
              >
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-on-surface truncate">Revision {idx + 1}</p>
                    <p className="text-[10px] text-on-surface-variant line-clamp-2 italic">
                      {snippet.summary || snippet.text?.substring(0, 50) + '...'}
                    </p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/20 group-hover:text-on-surface-variant transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
