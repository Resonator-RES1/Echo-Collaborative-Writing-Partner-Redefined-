import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Layout, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ComplianceReport } from '../../types';

interface ResonanceStructuralAnalysisProps {
  report?: ComplianceReport;
}

export const ResonanceStructuralAnalysis: React.FC<ResonanceStructuralAnalysisProps> = ({ report }) => {
  const tensionData = report?.tensionGraph || [];
  const sceneScorecards = report?.sceneTimeline || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-headline text-2xl font-light tracking-tight">Resonance & Structural Compliance</h2>
          <p className="text-on-surface-variant text-sm font-label tracking-wide opacity-70 uppercase">Tension, Pacing & Narrative Clarity</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-primary font-bold">
            <Activity className="w-4 h-4" />
            <span>Mythic Resonance: {report?.metrics.mythicResonance || 0}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-secondary font-bold">
            <Layout className="w-4 h-4" />
            <span>Structural Compliance: {report?.metrics.structuralCompliance || 0}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase font-label text-on-surface-variant font-bold tracking-widest">Tension & Pacing Graph</h3>
              <div className="flex items-center gap-4 text-[10px] uppercase font-label tracking-widest text-on-surface-variant/60">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Tension</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span>Pacing</span>
                </div>
              </div>
            </div>
            
            <div className="h-[250px] w-full relative">
              {tensionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" aspect={16/9} minWidth={0} minHeight={0}>
                  <AreaChart data={tensionData}>
                    <defs>
                      <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4285F4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4285F4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPacing" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34A853" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#34A853" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis 
                      dataKey="scene" 
                      stroke="#ffffff40" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `S${val}`}
                    />
                    <YAxis 
                      stroke="#ffffff40" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E1E1E', 
                        border: '1px solid #ffffff20', 
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontFamily: 'Inter'
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tension" 
                      stroke="#4285F4" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTension)" 
                      animationDuration={1500}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pacing" 
                      stroke="#34A853" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPacing)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-on-surface-variant/40 text-xs">
                  No tension data available.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 space-y-4">
              <h3 className="text-[10px] uppercase font-label text-on-surface-variant font-bold tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                Structural Wins
              </h3>
              <div className="space-y-3">
                {Array.isArray(report?.audit) && report?.audit.filter(a => a.severity === 'low').slice(0, 2).map((a, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                    <p className="text-xs font-bold text-primary">{a.type}</p>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">{a.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 space-y-4">
              <h3 className="text-[10px] uppercase font-label text-on-surface-variant font-bold tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-secondary" />
                Pacing Alerts
              </h3>
              <div className="space-y-3">
                {Array.isArray(report?.audit) && report?.audit.filter(a => a.severity === 'medium').slice(0, 2).map((a, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-secondary/5 border border-secondary/10 space-y-1">
                    <p className="text-xs font-bold text-secondary">{a.type}</p>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">{a.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 space-y-4">
            <h3 className="text-[10px] uppercase font-label text-on-surface-variant font-bold tracking-widest">Scene Scorecards</h3>
            <div className="space-y-4">
              {sceneScorecards.map((s, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Scene {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-outline-variant/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${s.loreConsistencyScore}%` }} 
                        />
                      </div>
                      <span className="text-[9px] font-mono text-on-surface-variant/40">{s.loreConsistencyScore}%</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant/80 italic leading-relaxed">"{s.location || 'Unknown'}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
             <h3 className="text-[10px] uppercase font-label text-primary font-bold tracking-widest">AI Teaching Note</h3>
             <p className="text-xs text-on-surface-variant leading-relaxed italic">
               "Your tension peaks are well-placed, but the transition between Scene 2 and 3 feels abrupt. Consider adding a 'breather' paragraph to smooth the pacing."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
