import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NewProjectModal } from './NewProjectModal';
import { Sparkles, ArrowRight, BookOpen, Wand2, Mic2, BarChart3, ChevronRight, X, Download, Upload, ChevronDown, Info, Fingerprint, Layout, Play, Zap, Plus } from 'lucide-react';
import { Screen, Scene, WritingGoal, GuideCategory, GuideItem, FocusArea } from '../types';
import { GUIDE_SECTIONS } from '../constants';
import { useProject } from '../contexts/ProjectContext';
import { copyFullGuideToClipboard } from '../utils/guideUtils';
import { refineDraft } from '../services/gemini/refine';
import * as Icons from 'lucide-react';

import { GuideDeepDive } from './GuideDeepDive';

interface WelcomeScreenProps {
  onEnterWorkspace: () => void;
  onViewManuscript: () => void;
  wordCount: number;
  goal: WritingGoal;
  scenes: Scene[];
  onJumpToScene: (id: string) => void;
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
                  <span className="text-[9px] font-black uppercase tracking-tighter text-primary/50">Echo Audited</span>
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

const MiniMirrorReport = ({ result }: { result: any }) => {
  if (!result || result.text?.startsWith('Error:')) return null;
  
  const aura = result.expressionProfile?.[0]?.vibe || 'Neutral';
  const fidelity = result.audit?.voiceFidelityScore || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Mirror Report</span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-bold text-primary">Aura: {aura}</span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-bold text-primary">Fidelity: {fidelity}/10</span>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant italic leading-relaxed">
        {result.summary || "Audit complete. Voice integrity preserved."}
      </p>
    </motion.div>
  );
};

const Playground = () => {
  const [input, setInput] = useState('The forest was nice.');
  const [result, setResult] = useState<any>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [preset, setPreset] = useState<FocusArea>('tone');

  const presetStyles: Record<string, any> = {
    tone: {
      name: 'Dark & Atmospheric',
      narrativeStyle: 'Gothic, heavy with atmosphere and shadow.',
      proseStructure: 'Dense, layered descriptions.',
      pacingAndRhythm: 'Slow, deliberate, building dread.',
      vocabularyAndDiction: 'Visceral, archaic, evocative.',
      thematicAnchors: 'Shadows, decay, the unknown.'
    },
    rhythm: {
      name: 'Lyrical & Flowing',
      narrativeStyle: 'Poetic, musical, and fluid.',
      proseStructure: 'Long, cascading sentences with varied cadence.',
      pacingAndRhythm: 'Melodic and rhythmic, like a song.',
      vocabularyAndDiction: 'Soft, resonant, sensory.',
      thematicAnchors: 'Nature, memory, light.'
    },
    voiceIntegrity: {
      name: 'Clipped & Military',
      narrativeStyle: 'Staccato, efficient, and direct.',
      proseStructure: 'Short, punchy sentences. No fluff.',
      pacingAndRhythm: 'Fast, urgent, mechanical.',
      vocabularyAndDiction: 'Technical, sharp, utilitarian.',
      thematicAnchors: 'Duty, precision, steel.'
    },
    sensory: {
      name: 'Vivid & Sensory',
      narrativeStyle: 'Rich, immersive, and highly descriptive.',
      proseStructure: 'Fluid, focusing on sensory details.',
      pacingAndRhythm: 'Steady, allowing the reader to soak in the environment.',
      vocabularyAndDiction: 'Precise, evocative, and sensory-rich.',
      thematicAnchors: 'Texture, scent, sound, and light.'
    }
  };

  const presets: { id: FocusArea; label: string; icon: any }[] = [
    { id: 'tone', label: 'Dark & Atmospheric', icon: Sparkles },
    { id: 'rhythm', label: 'Lyrical & Flowing', icon: Mic2 },
    { id: 'voiceIntegrity', label: 'Clipped & Military', icon: Fingerprint },
    { id: 'sensory', label: 'Vivid & Sensory', icon: Zap },
  ];

  const handleRefine = async () => {
    if (!input.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const res = await refineDraft({
        draft: input,
        focusAreas: [preset],
        authorVoices: [{ 
          ...presetStyles[preset], 
          id: 'playground-preset', 
          isActive: true, 
          lastModified: new Date().toISOString() 
        }],
        customInstruction: `In this playground mode, you are encouraged to demonstrate the ${presetStyles[preset].name} style vividly. While maintaining the core intent, feel free to lean into the requested stylistic DNA to show the user how the engine transforms prose.`,
        generationConfig: { model: 'gemini-3-flash-preview', temperature: 0.7 },
      });
      
      // Clean up any potential markdown headers if they leaked through
      if (res && res.text) {
        res.text = res.text.replace(/^# .*\n+/, '').trim();
      }
      
      setResult(res);
    } catch (e) {
      console.error(e);
      setResult({ text: 'Error: Failed to connect to engine.' });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
            <Play className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-headline text-3xl font-light">The Playground</h3>
            <p className="text-sm text-on-surface-variant">Test the engine in real-time. Low pressure, high fidelity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Input Draft</label>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste a single sentence here..."
                  className="w-full h-48 p-6 rounded-[2rem] bg-surface-container-highest/20 border border-outline-variant/20 focus:border-primary/50 outline-none transition-all resize-none font-body text-sm leading-relaxed"
                />
                <div className="absolute bottom-6 right-6 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/20 pointer-events-none">
                  Raw Prose
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Engine Presets</label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                      preset === p.id 
                        ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                        : 'bg-surface-container-highest/50 text-on-surface-variant border-outline-variant/10 hover:bg-surface-container-high'
                    }`}
                  >
                    <p.icon className="w-3 h-3" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRefine}
              disabled={isRefining || !input.trim()}
              className="w-full py-5 rounded-2xl bg-primary text-on-primary font-label text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              {isRefining ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" />
                  Refining...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Test Audit
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Echo Output</label>
              <div className="relative h-48 p-6 rounded-[2rem] bg-surface-container-low border border-outline-variant/10 flex flex-col shadow-inner">
                <div className="flex-grow overflow-y-auto scrollbar-none">
                  {result ? (
                    <motion.p 
                      key={result.text}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-sm leading-relaxed font-medium ${result.text?.startsWith('Error:') ? 'text-error' : 'text-on-surface italic'}`}
                    >
                      {result.text?.startsWith('Error:') ? result.text : (result.text ? `"${result.text}"` : '')}
                    </motion.p>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/30 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center">
                        <Sparkles className="w-6 h-6 opacity-20" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Audit</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-6 right-6 text-[9px] font-black uppercase tracking-widest text-primary/20 pointer-events-none">
                  Polished Result
                </div>
              </div>
            </div>

            <AnimatePresence>
              {result && !result.text?.startsWith('Error:') && (
                <MiniMirrorReport result={result} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export function WelcomeScreen({ onEnterWorkspace, onViewManuscript, wordCount, goal, scenes, onJumpToScene }: WelcomeScreenProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeTab, setActiveTab] = useState<'handbook' | 'codex' | 'playground'>('handbook');
  const [activeSection, setActiveSection] = useState(GUIDE_SECTIONS[0].id);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [visitedSections, setVisitedSections] = useState<Set<string>>(new Set([GUIDE_SECTIONS[0].id]));
  
  const { exportProject, importProject, isImporting } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeGuideData = GUIDE_SECTIONS.find(s => s.id === activeSection) || GUIDE_SECTIONS[0];

  const progress = (visitedSections.size / GUIDE_SECTIONS.length) * 100;
  const writingProgress = Math.min(100, Math.round((wordCount / goal.targetWords) * 100));

  // Find the most recently modified scene
  const latestScene = [...scenes].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0];

  const handleSectionSelect = (id: string) => {
    setActiveSection(id);
    setViewMode('detail');
    setVisitedSections(prev => new Set([...prev, id]));
  };

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
      <div className="min-h-full w-full flex flex-col items-center justify-start relative pt-20 pb-8 md:pt-24 md:pb-12 px-4">
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
              <h1 className="font-headline text-6xl sm:text-7xl md:text-9xl font-light tracking-tighter leading-none">
                Echo<span className="text-primary">.</span>
              </h1>
              
              <p className="font-headline text-lg sm:text-2xl md:text-3xl text-on-surface-variant/80 font-light italic max-w-2xl mx-auto leading-relaxed px-4">
                "Reveal the author—clearly, faithfully, and without distortion."
              </p>
            </div>

            {/* Continue Writing Section */}
            {latestScene && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-md mx-auto p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">Current Progress</p>
                    <h3 className="font-headline text-xl font-bold text-on-surface">{wordCount.toLocaleString()} <span className="text-sm font-normal text-on-surface-variant">/ {goal.targetWords.toLocaleString()} words</span></h3>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center relative">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-primary/10"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={125.6}
                        strokeDashoffset={125.6 * (1 - writingProgress / 100)}
                        className="text-primary"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-primary">{writingProgress}%</span>
                  </div>
                </div>

                <button
                  onClick={() => onJumpToScene(latestScene.id)}
                  className="w-full group flex items-center justify-between p-4 rounded-2xl bg-primary text-on-primary-fixed hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Continue Writing</span>
                    <span className="font-headline text-sm font-bold">Jump Back into "{latestScene.title}"</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 md:pt-8">
              <button
                onClick={() => scenes.length > 0 ? onViewManuscript() : setShowNewProject(true)}
                className="w-full sm:w-auto group relative px-8 md:px-12 py-4 md:py-5 rounded-full bg-primary text-on-primary-fixed font-label text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative flex items-center justify-center gap-3">
                  {scenes.length > 0 ? 'Enter Manuscript' : 'Create New Project'} {scenes.length === 0 && <Plus className="w-4 h-4" />}
                </span>
              </button>

              <button
                onClick={() => setShowGuide(true)}
                className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-full bg-surface-container-highest text-on-surface font-label text-xs uppercase tracking-[0.2em] border border-outline-variant/10 hover:bg-surface-container-high transition-all hover:scale-105 active:scale-95"
              >
                Explore the Guide
              </button>
            </div>

            <NewProjectModal 
              isOpen={showNewProject} 
              onClose={() => setShowNewProject(false)} 
              onCreate={(name, desc, goal) => {
                setShowNewProject(false);
                // Logic to create new project would go here
                onEnterWorkspace();
              }}
            />

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
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest">Audit</span>
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
            <div className="glass-panel rounded-none md:rounded-[2rem] border-0 md:border border-outline-variant/20 shadow-2xl flex flex-col h-full overflow-hidden">
              {/* Top Navigation & Progress */}
              <div className="flex-shrink-0 bg-surface-container-high/50 border-b border-outline-variant/10">
                <div className="h-1 bg-surface-container-highest w-full">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <div className="px-6 md:px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="font-label text-xs uppercase tracking-[0.3em] text-primary font-black">Discovery Hub</h2>
                    </div>

                    <div className="h-4 w-px bg-outline-variant/20 hidden md:block" />

                    <nav className="flex gap-1 bg-surface-container-highest/50 p-1 rounded-lg">
                      <button
                        onClick={() => setActiveTab('handbook')}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeTab === 'handbook' ? 'bg-surface-container-low text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Quick Start
                      </button>
                      <button
                        onClick={() => setActiveTab('codex')}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeTab === 'codex' ? 'bg-surface-container-low text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        The Codex
                      </button>
                      <button
                        onClick={() => setActiveTab('playground')}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeTab === 'playground' ? 'bg-surface-container-low text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        The Playground
                      </button>
                    </nav>
                  </div>

                  <button 
                    onClick={() => setShowGuide(false)}
                    className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className={`flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent ${activeTab === 'codex' ? 'p-0' : 'p-6 md:p-12'}`}>
                <AnimatePresence mode="wait">
                  {activeTab === 'handbook' ? (
                      <motion.div
                        key="handbook"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full"
                      >
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {GUIDE_SECTIONS.filter(s => !s.hideFromQuickGuide).map((section, idx) => {
                            const IconComponent = (Icons as any)[section.icon] || Sparkles;
                            const isVisited = visitedSections.has(section.id);
                            return (
                              <motion.button
                                key={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleSectionSelect(section.id)}
                                className="group relative p-8 rounded-[2rem] bg-surface-container-highest/20 border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-highest/40 transition-all text-left flex flex-col justify-between overflow-hidden min-h-[280px]"
                              >
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                  <IconComponent className="w-32 h-32" />
                                </div>
                                
                                <div className="space-y-4 relative z-10">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                    isVisited ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'
                                  }`}>
                                    <IconComponent className="w-6 h-6" />
                                  </div>
                                  <div className="space-y-1">
                                    <h3 className="font-headline text-2xl font-light group-hover:text-primary transition-colors">{section.title}</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed">{section.description}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-8 relative z-10">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                    Begin Mastery <ArrowRight className="w-3 h-3" />
                                  </span>
                                  {isVisited && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary/60 uppercase tracking-tighter">
                                      <Zap className="w-3 h-3" />
                                      Mastered
                                    </div>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col lg:flex-row gap-12 h-full">
                          {/* Left Side: Philosophy */}
                          <div className="w-full lg:w-1/2 space-y-8">
                            <button 
                              onClick={() => setViewMode('grid')}
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                            >
                              <ArrowRight className="w-3 h-3 rotate-180" />
                              Back to Grid
                            </button>

                            <div className="space-y-6">
                              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                {React.createElement((Icons as any)[activeGuideData.icon] || Sparkles, { className: "w-8 h-8 text-primary" })}
                              </div>
                              <div className="space-y-2">
                                <h3 className="font-headline text-4xl md:text-5xl font-light tracking-tight">{activeGuideData.title}</h3>
                                <div className="h-1 w-20 bg-primary/30 rounded-full" />
                              </div>
                              <p className="font-body text-lg text-on-surface-variant leading-relaxed italic">
                                {activeGuideData.description}
                              </p>
                            </div>

                            <div className="space-y-4">
                              {activeGuideData.features.map((feature, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{feature}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right Side: Interactive Example */}
                          <div className="w-full lg:w-1/2 bg-surface-container-highest/20 rounded-[2.5rem] border border-outline-variant/10 p-8 flex flex-col shadow-inner">
                            <div className="flex items-center gap-3 mb-8">
                              <Layout className="w-4 h-4 text-primary" />
                              <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/50 font-black">Interactive Example</h4>
                            </div>

                            <div className="flex-grow space-y-8 overflow-y-auto pr-2 scrollbar-none">
                              {activeGuideData.categories?.map((category, cIdx) => (
                                <div key={cIdx} className="space-y-6">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-2">{category.title}</h5>
                                  <div className="space-y-8">
                                    {category.items.map((item, iIdx) => (
                                      <div key={iIdx} className="space-y-4">
                                        <div className="space-y-1">
                                          <h6 className="text-sm font-bold text-on-surface">{item.title}</h6>
                                          <p className="text-xs text-on-surface-variant leading-relaxed">{item.description}</p>
                                        </div>
                                        {item.example && (
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/5 space-y-2 shadow-sm">
                                              <span className="text-[9px] font-black uppercase tracking-tighter text-on-surface-variant/40">Draft Box</span>
                                              <p className="text-xs italic text-on-surface-variant/70 leading-relaxed">"{item.example.before}"</p>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2 shadow-sm">
                                              <span className="text-[9px] font-black uppercase tracking-tighter text-primary/40">Audited Box</span>
                                              <p className="text-xs font-medium text-on-surface leading-relaxed">"{item.example.after}"</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : activeTab === 'codex' ? (
                    <motion.div
                      key="codex"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="h-full"
                    >
                      <GuideDeepDive />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="playground"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="h-full"
                    >
                      <Playground />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
