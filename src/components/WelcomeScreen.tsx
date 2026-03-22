import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, BookOpen, Wand2, Mic2, BarChart3, ChevronRight, X, Download, Upload } from 'lucide-react';
import { Screen } from '../types';
import { GUIDE_SECTIONS } from '../constants';
import { useProject } from '../contexts/ProjectContext';
import * as Icons from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [activeSection, setActiveSection] = useState(GUIDE_SECTIONS[0].id);
  const { exportProject, importProject, isImporting } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeGuideData = GUIDE_SECTIONS.find(s => s.id === activeSection) || GUIDE_SECTIONS[0];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importProject(file);
        window.location.reload();
      } catch (error: any) {
        console.error('Import failed:', error);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden py-20">
      {/* Background Textures */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full animate-pulse delay-700"></div>
      </div>

      <AnimatePresence mode="wait">
        {!showGuide ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-12 max-w-4xl px-6 relative z-10"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-[10px] uppercase tracking-[0.3em] mb-4"
              >
                <Sparkles className="w-3 h-3" />
                <span>The Voice-Preserving Refiner</span>
              </motion.div>
              
              <h1 className="font-headline text-7xl md:text-9xl font-light tracking-tighter leading-none">
                Echo<span className="text-primary">.</span>
              </h1>
              
              <p className="font-headline text-2xl md:text-3xl text-on-surface-variant/80 font-light italic max-w-2xl mx-auto leading-relaxed">
                "Reveal the author—clearly, faithfully, and without distortion."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <button
                onClick={onStart}
                className="group relative px-12 py-5 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative flex items-center gap-3">
                  Enter Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => setShowGuide(true)}
                className="px-12 py-5 rounded-full bg-surface-container-highest text-on-surface font-label text-xs uppercase tracking-[0.2em] border border-outline-variant/10 hover:bg-surface-container-high transition-all hover:scale-105 active:scale-95"
              >
                Explore the Guide
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={exportProject}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant font-label text-[10px] uppercase tracking-widest border border-outline-variant/10 hover:bg-surface-container-high transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export Project
              </button>
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant font-label text-[10px] uppercase tracking-widest border border-outline-variant/10 hover:bg-surface-container-high transition-all disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {isImporting ? 'Importing...' : 'Import Project'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".echo,.json"
                className="hidden"
              />
            </div>

            <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40">
              <div className="flex flex-col items-center gap-2">
                <Wand2 className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-widest">Refinement</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-widest">Lore Codex</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mic2 className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-widest">Voice Lock</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-widest">Analysis</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="guide"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-6xl px-6 relative z-10"
          >
            <div className="glass-panel bg-surface-container-low rounded-[2rem] border border-outline-variant/20 overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
              {/* Sidebar */}
              <div className="w-full md:w-80 bg-surface-container-high/50 p-8 border-r border-outline-variant/10 flex flex-col">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="font-label text-xs uppercase tracking-[0.3em] text-primary">Echo Guide</h2>
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-2 flex-grow">
                  {GUIDE_SECTIONS.map((section) => {
                    const IconComponent = (Icons as any)[section.icon] || Sparkles;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all group ${
                          activeSection === section.id 
                            ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                            : 'hover:bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 ${activeSection === section.id ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span className="font-label text-[11px] uppercase tracking-widest">{section.title}</span>
                        {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-12">
                  <button
                    onClick={onStart}
                    className="w-full py-4 rounded-xl bg-primary/10 text-primary border border-primary/20 font-label text-[10px] uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
                  >
                    Start Writing
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-grow p-12 md:p-20 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-12 relative z-10"
                  >
                    <div className="space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        {React.createElement((Icons as any)[activeGuideData.icon] || Sparkles, { className: "w-8 h-8 text-primary" })}
                      </div>
                      <h3 className="font-headline text-5xl font-light tracking-tight">{activeGuideData.title}</h3>
                      <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-2xl">
                        {activeGuideData.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activeGuideData.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-4 p-6 rounded-2xl bg-surface-container-highest/30 border border-outline-variant/10"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <p className="text-sm text-on-surface-variant leading-relaxed">{feature}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Decorative background for content */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 opacity-[0.03] pointer-events-none">
                   {React.createElement((Icons as any)[activeGuideData.icon] || Sparkles, { className: "w-96 h-96" })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
