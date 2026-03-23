import React from 'react';
import { ProjectManager } from './ProjectManager';
import { Settings, Shield, Database, Info, LogOut } from 'lucide-react';

interface SettingsScreenProps {
  showToast: (message: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ showToast }) => {
  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-6 md:p-12 space-y-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-3xl text-on-surface">Settings</h1>
            <p className="text-on-surface-variant">Manage your project and application preferences</p>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-xl text-on-surface">Project Management</h2>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 shadow-sm">
            <p className="text-sm text-on-surface-variant mb-6">
              Export your entire project including lore, voices, and manuscript scenes to a single file for backup or sharing.
            </p>
            <ProjectManager showToast={showToast} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-xl text-on-surface">Privacy & Security</h2>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-on-surface">Local Storage Only</h3>
                <p className="text-sm text-on-surface-variant">Your data is stored locally in your browser's IndexedDB.</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-label uppercase tracking-widest">Active</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-on-surface">AI Processing</h3>
                <p className="text-sm text-on-surface-variant">Drafts are sent to Google Gemini for refinement. No data is used for training.</p>
              </div>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-label uppercase tracking-widest">Standard</div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-xl text-on-surface">About Echo</h2>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Version</span>
                <span className="text-on-surface font-mono">1.0.42-beta</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Build Date</span>
                <span className="text-on-surface font-mono">March 2026</span>
              </div>
              <div className="pt-4 border-t border-outline-variant/5">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Echo is a collaborative writing partner designed to help authors maintain consistency, enhance sensory depth, and refine their narrative voice through advanced AI analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-12 flex justify-center">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors font-label text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Reset Application
          </button>
        </div>
      </div>
    </div>
  );
};
