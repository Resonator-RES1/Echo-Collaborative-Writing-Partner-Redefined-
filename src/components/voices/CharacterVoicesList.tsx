import React from 'react';
import { User, Trash2, Plus, Sparkles, UserRound, UserCircle, Square, Circle, Hexagon } from 'lucide-react';
import { VoiceProfile } from '../../types';
import { GenderIcon } from '../GenderIcon';

interface CharacterVoicesListProps {
  voiceProfiles: VoiceProfile[];
  onEdit: (profile: VoiceProfile) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
}

export function CharacterVoicesList({
  voiceProfiles,
  onEdit,
  onAddNew,
  onDelete
}: CharacterVoicesListProps) {
  return (
    <div className="lg:col-span-12 space-y-8">
      <div className="flex items-center gap-4">
        <h3 className="font-headline text-3xl flex items-center gap-3">
          Character Voices
          <User className="text-primary w-7 h-7" />
        </h3>
        <span className="font-label text-xs font-normal text-on-surface-variant py-1 px-3 bg-surface-container rounded-full uppercase tracking-tighter">
          {String(voiceProfiles.length).padStart(2, '0')} Profiles
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {voiceProfiles.map(profile => (
          <div 
            key={profile.id} 
            onClick={() => onEdit(profile)}
            className={`glass-slab p-6 rounded-2xl border transition-all duration-500 group cursor-pointer ${profile.isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-outline-variant/10 hover:border-primary/30'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${profile.isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {profile.gender === 'male' ? <Square className="w-5 h-5" /> : 
                 profile.gender === 'female' ? <Circle className="w-5 h-5" /> : 
                 <Hexagon className="w-5 h-5" />}
              </div>
              <div className="flex items-center gap-2">
                {profile.isActive && (
                  <span className="font-label text-[9px] uppercase tracking-widest text-primary bg-primary/10 py-1 px-2 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2 h-2" />
                    Active
                  </span>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
                  className="text-on-surface-variant/30 hover:text-error transition-colors"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h4 className="font-headline text-xl mb-1 group-hover:text-primary transition-colors">{profile.name}</h4>
            <div className="flex items-center gap-2 mb-4">
              <GenderIcon gender={profile.gender} className="w-3 h-3 text-on-surface-variant/70" />
              <span className="text-xs text-on-surface-variant/70 uppercase tracking-wider">{profile.archetype}</span>
            </div>
            
            <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
              {profile.soulPattern || "No soul pattern defined."}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {profile.signatureTraits.slice(0, 2).map((trait, idx) => (
                <span key={idx} className="px-2 py-1 bg-surface-container rounded-md text-[10px] text-on-surface-variant uppercase tracking-wider">
                  {trait}
                </span>
              ))}
              {profile.signatureTraits.length > 2 && (
                <span className="px-2 py-1 bg-surface-container rounded-md text-[10px] text-on-surface-variant uppercase tracking-wider">
                  +{profile.signatureTraits.length - 2}
                </span>
              )}
            </div>
          </div>
        ))}

        <div 
          onClick={onAddNew}
          className="group border border-dashed border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/40 transition-all duration-500 cursor-pointer bg-surface-container/10"
        >
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus className="text-on-surface-variant group-hover:text-primary transition-colors w-6 h-6" />
          </div>
          <p className="font-label text-sm text-on-surface-variant group-hover:text-primary transition-colors">Create Profile</p>
        </div>
      </div>
    </div>
  );
}
