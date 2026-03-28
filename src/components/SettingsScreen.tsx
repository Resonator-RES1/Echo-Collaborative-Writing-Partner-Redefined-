import React, { useState, useEffect } from 'react';
import { ProjectManager } from './ProjectManager';
import { ThemeManager } from './ThemeManager';
import { Settings, Shield, Database, Info, LogOut, Key, Palette, X } from 'lucide-react';
import * as db from '../services/dbService';
import { motion } from 'motion/react';

interface SettingsScreenProps {
  showToast: (message: string) => void;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ showToast, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const loadApiKey = async () => {
      const savedKey = await db.getSetting('api_key');
      if (savedKey) setApiKey(savedKey);
    };
    loadApiKey();
  }, []);

  const handleApiKeyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    await db.putSetting('api_key', newKey);
    showToast('API Key updated successfully.');
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[50]"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90vw] md:max-w-4xl md:h-[85vh] bg-surface-container-lowest/95 backdrop-blur-xl shadow-2xl border border-outline-variant/20 rounded-[2.5rem] z-[60] flex flex-col overflow-hidden"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-surface-container-highest transition-colors z-20"
        >
          <X className="w-6 h-6 text-on-surface-variant" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
          <div className="max-w-3xl mx-auto space-y-12 pb-12">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Settings className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="font-headline text-4xl text-on-surface font-light tracking-tight">Settings</h1>
                <p className="text-on-surface-variant font-headline italic">Manage your project and application preferences</p>
              </div>
            </div>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <Key className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-xl text-on-surface">API Configuration</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={handleApiKeyChange}
                      placeholder="Enter your Gemini API key..."
                      className="w-full p-4 rounded-xl bg-surface-container-highest/20 border border-outline-variant/20 focus:border-primary/50 outline-none transition-all font-mono text-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30 pointer-events-none">
                      Project Specific
                    </div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/50 leading-relaxed">
                    Your API key is stored locally in your browser and never sent to our servers. It is used only for refinement requests.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <Palette className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-xl text-on-surface">Appearance</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 shadow-sm">
                <p className="text-sm text-on-surface-variant mb-6">
                  Choose the visual atmosphere that best suits your current writing session.
                </p>
                <ThemeManager />
              </div>
            </section>

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
                      Echo is a narrative intelligence suite designed to help authors maintain consistency, enhance sensory depth, and refine their narrative voice through advanced AI analysis.
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
      </motion.div>
    </>
  );
};
