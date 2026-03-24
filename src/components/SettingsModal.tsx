import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Key, Trash2, ShieldAlert, CheckCircle2, RefreshCw, Copy, BookOpen } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { copyFullGuideToClipboard } from '../utils/guideUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { resetProject } = useProject();

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasCustomKey(hasKey);
      }
    };
    if (isOpen) checkKey();
  }, [isOpen]);

  const handleConnectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasCustomKey(hasKey);
    }
  };

  const handleGlobalReset = async () => {
    await resetProject();
    setShowResetConfirm(false);
    onClose();
  };

  const handleCopyGuide = () => {
    copyFullGuideToClipboard();
    if (props.showToast) {
      props.showToast("Full guide copied to clipboard as Markdown.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-surface-container-low rounded-[2.5rem] border border-outline-variant/20 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-high/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-light tracking-tight">System Settings</h2>
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">Configure your refinement engine</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-full hover:bg-surface-container-highest transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* API Key Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/50 font-black">
                  <Key className="w-3.5 h-3.5" />
                  <span>Intelligence Quota</span>
                </div>
                
                <div className="p-6 rounded-3xl bg-surface-container-highest/30 border border-outline-variant/10 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-label text-xs uppercase tracking-widest font-black">Gemini Pro Key</h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Connect your own Google AI Studio API key to bypass shared limits and use your personal quota.
                      </p>
                    </div>
                    {hasCustomKey ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 text-[9px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-on-surface/5 text-on-surface-variant border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest">
                        Inactive
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleConnectKey}
                    className={`w-full py-4 rounded-2xl font-label text-[10px] uppercase tracking-[0.2em] font-black transition-all flex items-center justify-center gap-3 text-shadow-dark ${
                      hasCustomKey
                        ? 'bg-accent-emerald text-white shadow-lg shadow-accent-emerald/20 hover:scale-[1.02]'
                        : 'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02]'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    {hasCustomKey ? 'Manage Pro Key' : 'Connect Pro Key'}
                  </button>
                </div>
              </div>

              {/* Documentation Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.2em] text-primary/50 font-black">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Documentation</span>
                </div>
                
                <div className="p-6 rounded-3xl bg-surface-container-highest/30 border border-outline-variant/10 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-label text-xs uppercase tracking-widest font-black">Export Guide</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Copy the entire Echo Studio guide to your clipboard in Markdown format for offline reference.
                    </p>
                  </div>

                  <button
                    onClick={handleCopyGuide}
                    className="w-full py-4 rounded-2xl bg-surface-container-highest text-on-surface border border-outline-variant/10 font-label text-[10px] uppercase tracking-[0.2em] font-black hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-3"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Full Guide
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.2em] text-accent-rose/50 font-black">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Danger Zone</span>
                </div>

                <div className="p-6 rounded-3xl bg-accent-rose/5 border border-accent-rose/10 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-label text-xs uppercase tracking-widest font-black text-accent-rose">Global Reset</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Wipe all lore entries, voice profiles, and refinement history. This action is permanent.
                    </p>
                  </div>

                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full py-4 rounded-2xl bg-accent-rose/10 text-accent-rose border border-accent-rose/20 font-label text-[10px] uppercase tracking-[0.2em] font-black hover:bg-accent-rose hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <Trash2 className="w-4 h-4" />
                      Reset All Data
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="py-4 rounded-2xl bg-surface-container-highest text-on-surface font-label text-[10px] uppercase tracking-[0.2em] font-black hover:bg-surface-container-high transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGlobalReset}
                        className="py-4 rounded-2xl bg-accent-rose text-white font-label text-[10px] uppercase tracking-[0.2em] font-black shadow-lg shadow-accent-rose/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-shadow-dark"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-surface-container-high/30 border-t border-outline-variant/10 text-center">
              <p className="font-label text-[9px] uppercase tracking-[0.3em] text-on-surface/30">
                Echo Engine v2.5.0 • Voice-Preserving Refinement
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
