import React from 'react';

export function WorkspaceScreen() {
  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in duration-700">
      {/* Workspace Left: Refinement Controls */}
      <aside className="lg:w-72 space-y-8 flex-shrink-0">
        <div className="space-y-4">
          <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface/40 px-2">Refinement Mode</h3>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-primary font-medium bg-surface-container-low transition-all duration-500">
              <span className="material-symbols-outlined">auto_fix_high</span>
              <span className="font-headline text-lg font-light">Collaborative</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-on-surface/70 hover:bg-surface-container-low hover:text-primary transition-all duration-500">
              <span className="material-symbols-outlined">rate_review</span>
              <span className="font-headline text-lg font-light">Review</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-on-surface/70 hover:bg-surface-container-low hover:text-primary transition-all duration-500">
              <span className="material-symbols-outlined">psychology</span>
              <span className="font-headline text-lg font-light">Reaction</span>
            </button>
          </nav>
        </div>

        <div className="p-6 rounded-[0.75rem] bg-surface-container-low ghost-border space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-label text-[10px] uppercase tracking-widest text-primary/80">Stylistic DNA</span>
            <span className="material-symbols-outlined text-primary text-sm">analytics</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-label uppercase tracking-tighter">
                <span>Somatic Resonance</span>
                <span className="text-primary">88%</span>
              </div>
              <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full w-[88%] bg-primary shadow-[0_0_8px_rgba(208,192,255,0.5)]"></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-label uppercase tracking-tighter">
                <span>Gothic Syntax</span>
                <span className="text-primary">72%</span>
              </div>
              <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full w-[72%] bg-primary/60"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-surface-container-highest/30 rounded-full border border-primary/10">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface/60">Reveal Diff</span>
          <button className="w-10 h-5 bg-primary/20 rounded-full relative p-1 flex items-center justify-end">
            <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(208,192,255,0.8)]"></div>
          </button>
        </div>
      </aside>

      {/* Main Manuscript Canvas */}
      <section className="flex-grow">
        <div className="relative bg-surface-container-low/50 backdrop-blur-sm rounded-[0.75rem] p-8 lg:p-20 shadow-2xl min-h-[707px] ghost-border">
          
          {/* Floating Lore Enforcement Legend */}
          <div className="absolute -top-4 right-8 lg:right-12 px-6 py-2 bg-surface border border-primary/20 rounded-full flex items-center gap-3 z-10">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_heart</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Lore Enforcement Active</span>
          </div>

          {/* Manuscript Content */}
          <article className="max-w-2xl mx-auto space-y-12">
            <header className="text-center space-y-2 mb-20">
              <h2 className="font-headline text-4xl font-light tracking-tight italic text-primary/90">Chapter One: The Silence of Glass</h2>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto"></div>
            </header>

            <p className="font-headline text-2xl leading-relaxed text-on-surface/90 tracking-tight">
              The air within the chamber didn’t just grow cold; it curdled. Elara felt the weight of the monolith pressing against the back of her skull, a silent vibration that tasted of ozone and ancient parchment.
            </p>

            {/* Active Refinement Section */}
            <div className="relative group">
              <div className="absolute -inset-x-4 lg:-inset-x-8 -inset-y-6 bg-primary/5 rounded-[0.75rem] ghost-glow border border-primary/10 transition-all duration-700"></div>
              <p className="relative font-headline text-2xl leading-relaxed text-on-surface tracking-tight">
                She reached out. Her fingers brushed the <span className="relative inline-block px-2 group/lore">
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/lore:opacity-100 transition-opacity bg-primary text-on-primary-fixed font-label text-[9px] uppercase tracking-widest py-1 px-3 rounded-full whitespace-nowrap z-20">Immutable Identity</span>
                  <span className="border-b-2 border-primary/40 text-glow cursor-help">The Void-Gate</span>
                </span>. It was not stone, nor metal. It was a bruise in the fabric of the world, a heavy, jagged absence that hummed with a frequency her bones recognized as a long-forgotten language.
              </p>

              {/* AI Thought Bubble */}
              <div className="absolute right-0 lg:-right-64 top-full mt-4 lg:mt-0 lg:top-0 w-full lg:w-60 z-30 transform lg:translate-x-4 opacity-100">
                <div className="bg-surface-container-highest p-5 rounded-[0.75rem] border border-primary/20 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                    <span className="font-label text-[10px] uppercase tracking-widest text-primary">Crystallization Reasoning</span>
                  </div>
                  <p className="text-xs text-on-surface/80 leading-relaxed italic">
                    "Converted 'telling' to 'showing' for somatic resonance. Emphasizing the physical vibration over simple temperature drops to anchor the scene in sensory horror."
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-label uppercase px-3 py-1 rounded-full border border-primary/20 transition-all">Accept</button>
                    <button className="text-on-surface/40 hover:text-on-surface/80 text-[10px] font-label uppercase px-3 py-1 transition-all">Revert</button>
                  </div>
                </div>
              </div>
            </div>

            <p className="font-headline text-2xl leading-relaxed text-on-surface/90 tracking-tight mt-12 lg:mt-0">
              "Do not touch it," the Ghost-King whispered, his voice a dry rasping of autumn leaves against cold marble. He stood at the edge of the light, a silhouette carved from the very shadows he commanded.
            </p>
          </article>

          {/* Manuscript Footer Tools */}
          <div className="mt-24 pt-8 border-t border-outline-variant/10 flex justify-between items-center max-w-2xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface/40">Word Count</span>
                <span className="font-headline text-sm">4,281</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface/40">Read Time</span>
                <span className="font-headline text-sm">18m</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="p-3 rounded-full bg-surface-container-highest/50 hover:bg-primary/20 text-primary transition-all">
                <span className="material-symbols-outlined">share</span>
              </button>
              <button className="p-3 rounded-full bg-surface-container-highest/50 hover:bg-primary/20 text-primary transition-all">
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Secondary FAB for Collaborative Interaction */}
      <button className="fixed bottom-24 right-8 lg:bottom-12 lg:right-12 w-16 h-16 rounded-full lore-gradient shadow-[0_10px_30px_rgba(208,192,255,0.4)] flex items-center justify-center text-on-primary-fixed hover:scale-105 active:scale-95 transition-all duration-500 group z-[70]">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">auto_awesome</span>
      </button>
    </div>
  );
}
