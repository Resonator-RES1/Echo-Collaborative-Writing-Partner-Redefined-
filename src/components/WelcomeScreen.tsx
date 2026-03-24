import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, BookOpen, Wand2, Mic2, BarChart3, ChevronRight, X, Download, Upload, ChevronDown, Info, Copy } from 'lucide-react';
import { Screen, GuideCategory, GuideItem } from '../types';
import { GUIDE_SECTIONS } from '../constants';
import { useProject } from '../contexts/ProjectContext';
import { copyFullGuideToClipboard } from '../utils/guideUtils';
import * as Icons from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const CollapsibleCategory = ({ category }: { category: GuideCategory }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-surface-container-highest/20 rounded-xl border border-outline-variant/10 hover:bg-surface-container-highest/40 transition-all group"
      >
        <span className="font-label text-xs uppercase tracking-widest text-primary font-black">{category.title}</span>
        <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden space-y-4 pl-2"
          >
            {category.items.map((item, idx) => (
              <GuideItemCard key={idx} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GuideItemCard = ({ item }: { item: GuideItem }) => {
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="p-6 rounded-2xl bg-surface-container-highest/10 border border-outline-variant/10 space-y-4 hover:border-primary/20 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
        <div className="space-y-1">
          <h5 className="font-bold text-on-surface text-sm">{item.title}</h5>
          <p className="text-sm text-on-surface-variant leading-relaxed">{item.description}</p>
        </div>
      </div>

      {item.example && (
        <div className="space-y-2">
          <button 
            onClick={() => setShowExample(!showExample)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            <Info className="w-3 h-3" />
            {showExample ? 'Hide Example' : 'See Before & After'}
          </button>
          
          <AnimatePresence>
            {showExample && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3 bg-surface-container-low/50 rounded-xl p-4 border border-outline-variant/5"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-on-surface-variant/50">Original Draft</span>
                  <p className="text-xs italic text-on-surface-variant/70 leading-relaxed">"{item.example.before}"</p>
                </div>
                <div className="h-px bg-outline-variant/10" />
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-primary/50">Echo Refined</span>
                  <p className="text-xs font-medium text-on-surface leading-relaxed">"{item.example.after}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

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
    <div className="h-full w-full relative overflow-y-auto scrollbar-none">
      <div className="min-h-full w-full flex flex-col items-center justify-center relative py-8 md:py-12 px-4">
        {/* Background Textures */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/10 blur-[80px] md:blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-64 h-48 md:h-64 bg-secondary/10 blur-[60px] md:blur-[100px] rounded-full animate-pulse delay-700"></div>
        </div>

        <AnimatePresence mode="wait">
        {!showGuide ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-8 md:space-y-12 max-w-4xl w-full relative z-10"
          >
            <div className="space-y-4 md:space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-[10px] uppercase tracking-[0.3em] mb-2 md:mb-4"
              >
                <Sparkles className="w-3 h-3" />
                <span>The Voice-Preserving Refiner</span>
              </motion.div>
              
              <h1 className="font-headline text-6xl sm:text-7xl md:text-9xl font-light tracking-tighter leading-none">
                Echo<span className="text-primary">.</span>
              </h1>
              
              <p className="font-headline text-lg sm:text-2xl md:text-3xl text-on-surface-variant/80 font-light italic max-w-2xl mx-auto leading-relaxed px-4">
                "Reveal the author—clearly, faithfully, and without distortion."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 md:pt-8">
              <button
                onClick={onStart}
                className="w-full sm:w-auto group relative px-8 md:px-12 py-4 md:py-5 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative flex items-center justify-center gap-3">
                  Enter Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => setShowGuide(true)}
                className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-full bg-surface-container-highest text-on-surface font-label text-xs uppercase tracking-[0.2em] border border-outline-variant/10 hover:bg-surface-container-high transition-all hover:scale-105 active:scale-95"
              >
                Explore the Guide
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-4">
              <button
                onClick={exportProject}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant font-label text-[9px] md:text-[10px] uppercase tracking-widest border border-outline-variant/10 hover:bg-surface-container-high transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant font-label text-[9px] md:text-[10px] uppercase tracking-widest border border-outline-variant/10 hover:bg-surface-container-high transition-all disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {isImporting ? 'Importing...' : 'Import'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".echo,.json"
                className="hidden"
              />
            </div>

            <div className="pt-8 md:pt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 opacity-40">
              <div className="flex flex-col items-center gap-2">
                <Wand2 className="w-5 h-5" />
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest">Refinement</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest">Lore Codex</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mic2 className="w-5 h-5" />
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest">Voice Lock</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest">Analysis</span>
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
            className="w-full max-w-6xl h-[90vh] md:h-[85vh] relative z-10 flex flex-col"
          >
            <div className="glass-panel bg-surface-container-low rounded-none md:rounded-[2rem] border-0 md:border border-outline-variant/20 shadow-2xl flex flex-col md:flex-row h-full overflow-hidden">
              {/* Sidebar */}
              <div className="w-full md:w-80 flex-shrink-0 bg-surface-container-high/50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-outline-variant/10 flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between mb-6 md:mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="font-label text-xs uppercase tracking-[0.3em] text-primary font-black">Echo Guide</h2>
                  </div>
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-none">
                  {GUIDE_SECTIONS.map((section) => {
                    const IconComponent = (Icons as any)[section.icon] || Sparkles;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex-shrink-0 md:w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all group ${
                          activeSection === section.id 
                            ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                            : 'hover:bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${activeSection === section.id ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span className="font-label text-[9px] md:text-[11px] uppercase tracking-widest whitespace-nowrap font-black">{section.title}</span>
                        {activeSection === section.id && <ChevronRight className="hidden md:block w-4 h-4 ml-auto" />}
                      </button>
                    );
                  })}
                </nav>

                <div className="flex flex-col gap-3 mt-auto pt-8 md:pt-12">
                  <button
                    onClick={() => {
                      copyFullGuideToClipboard();
                    }}
                    className="w-full py-3 rounded-xl bg-surface-container-highest text-on-surface-variant border border-outline-variant/10 font-label text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all font-black flex items-center justify-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Full Guide
                  </button>
                  <button
                    onClick={onStart}
                    className="w-full py-4 rounded-xl bg-primary/10 text-primary border border-primary/20 font-label text-[10px] uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all font-black"
                  >
                    Start Writing
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-grow p-6 md:p-12 lg:p-16 relative overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8 md:space-y-12 relative z-10"
                  >
                    <div className="space-y-4 md:space-y-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                        {React.createElement((Icons as any)[activeGuideData.icon] || Sparkles, { className: "w-6 h-6 md:w-8 md:h-8 text-primary" })}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-headline text-3xl md:text-5xl font-light tracking-tight">{activeGuideData.title}</h3>
                        <div className="h-1 w-20 bg-primary/30 rounded-full" />
                      </div>
                      <p className="font-body text-base md:text-lg text-on-surface-variant leading-relaxed max-w-2xl italic">
                        {activeGuideData.description}
                      </p>
                    </div>

                    <div className="space-y-8 md:space-y-12">
                      {/* Features List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {activeGuideData.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-4 p-5 md:p-6 rounded-2xl bg-surface-container-highest/30 border border-outline-variant/10 hover:border-primary/20 transition-all group"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{feature}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Categorized Content (Focus Areas etc) */}
                      {activeGuideData.categories && (
                        <div className="space-y-8 pt-8 border-t border-outline-variant/10">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h4 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface/50 font-black">Detailed Breakdown</h4>
                          </div>
                          <div className="grid grid-cols-1 gap-6">
                            {activeGuideData.categories.map((category, idx) => (
                              <CollapsibleCategory key={idx} category={category} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Decorative background for content */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 opacity-[0.02] pointer-events-none hidden lg:block">
                   {React.createElement((Icons as any)[activeGuideData.icon] || Sparkles, { className: "w-96 h-96" })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
