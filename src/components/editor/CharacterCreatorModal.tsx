import React, { useState } from 'react';
import { UserPlus, X, Sparkles, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { generateCharacterProfile, CharacterCreatorData } from '../../services/geminiService';
import { CharacterProfile, Gender, VoiceProfile } from '../../types';

interface CharacterCreatorModalProps {
    onClose: () => void;
    showToast: (message: string) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
}

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = React.memo(({ onClose, showToast, onAddVoiceProfile }) => {
    const [view, setView] = useState<'form' | 'review' | 'error'>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState<CharacterCreatorData>({
        name: '',
        gender: 'unspecified',
        coreConcept: '',
        backstoryNotes: '',
        motivationNotes: '',
        relationshipNotes: '',
        voiceNotes: '',
    });
    const [generatedProfile, setGeneratedProfile] = useState<Omit<VoiceProfile, 'id' | 'lastModified' | 'isActive'> | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const result = await generateCharacterProfile(formData);
            setGeneratedProfile(result);
            setView('review');
        } catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
            setView('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!generatedProfile) return;
        const profileId = Date.now().toString() + Math.random().toString();
        
        // Create Voice Profile for the Voices Panel
        const voiceProfile: VoiceProfile = {
            id: profileId,
            name: generatedProfile.name,
            gender: generatedProfile.gender as any,
            archetype: generatedProfile.archetype || '',
            soulPattern: generatedProfile.soulPattern || '',
            cognitivePatterns: generatedProfile.cognitivePatterns || '',
            speechPatterns: generatedProfile.speechPatterns || '',
            emotionalExpression: generatedProfile.emotionalExpression || '',
            behavioralAnchors: generatedProfile.behavioralAnchors || '',
            conversationalRole: generatedProfile.conversationalRole || '',
            signatureTraits: generatedProfile.signatureTraits || [],
            idioms: generatedProfile.idioms || [],
            exampleLines: generatedProfile.exampleLines || [],
            physicalTells: generatedProfile.physicalTells || '',
            internalMonologueStyle: generatedProfile.internalMonologueStyle || '',
            conflictStyle: generatedProfile.conflictStyle || '',
            lastModified: new Date().toISOString(),
            isActive: true
        };
        
        onAddVoiceProfile(voiceProfile);
        showToast("Character voice profile created and added to library!");
        onClose();
    };
    
    const isFormValid = formData.name.trim() !== '' && formData.coreConcept.trim() !== '';

    const renderForm = () => (
        <div className="space-y-6">
            <div className="p-6 bg-surface-container-highest/30 border border-outline-variant/10 rounded-[0.75rem]">
                <h3 className="text-xs font-label text-primary uppercase tracking-wider mb-4">Core Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" placeholder="Character Name*" value={formData.name} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/20 rounded-[0.75rem] p-3 text-on-surface font-headline focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/40"/>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/20 rounded-[0.75rem] p-3 text-on-surface font-headline focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none">
                        <option value="unspecified">Unspecified Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                    </select>
                </div>
                <textarea name="coreConcept" placeholder="Core Concept*: e.g., 'A cynical detective who discovers magic is real.'" value={formData.coreConcept} onChange={handleInputChange} rows={2} className="mt-4 w-full bg-surface-container border border-outline-variant/20 rounded-[0.75rem] p-3 text-on-surface font-headline focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/40 resize-none"/>
            </div>
             <div className="p-6 bg-surface-container-highest/30 border border-outline-variant/10 rounded-[0.75rem]">
                <h3 className="text-xs font-label text-primary uppercase tracking-wider mb-4">Details & History</h3>
                <div className="space-y-4">
                     <textarea name="backstoryNotes" placeholder="Backstory Notes: Where are they from? What key events shaped them?" value={formData.backstoryNotes} onChange={handleInputChange} rows={3} className="w-full bg-surface-container border border-outline-variant/20 rounded-[0.75rem] p-3 text-on-surface font-headline focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/40 resize-none"/>
                     <textarea name="motivationNotes" placeholder="Motivation Notes: What do they want? What are they afraid of?" value={formData.motivationNotes} onChange={handleInputChange} rows={2} className="w-full bg-surface-container border border-outline-variant/20 rounded-[0.75rem] p-3 text-on-surface font-headline focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/40 resize-none"/>
                     <textarea name="relationshipNotes" placeholder="Relationship Notes: Who are their allies, enemies, or family?" value={formData.relationshipNotes} onChange={handleInputChange} rows={2} className="w-full bg-surface-container border border-outline-variant/20 rounded-[0.75rem] p-3 text-on-surface font-headline focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/40 resize-none"/>
                     <textarea name="voiceNotes" placeholder="Voice & Personality Notes: How do they speak? Are they witty, formal, quiet?" value={formData.voiceNotes} onChange={handleInputChange} rows={2} className="w-full bg-surface-container border border-outline-variant/20 rounded-[0.75rem] p-3 text-on-surface font-headline focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/40 resize-none"/>
                </div>
            </div>
        </div>
    );
    
    const renderReview = () => {
       if (!generatedProfile) return null;
       return (
            <div className="space-y-4">
                <div className="p-4 bg-surface-container-highest/20 border border-outline-variant/10 rounded-[0.75rem]">
                    <label className="text-xs font-label text-primary uppercase tracking-wider">Name</label>
                    <div className="mt-2 text-on-surface/90 font-headline leading-relaxed">{generatedProfile.name}</div>
                </div>
                <div className="p-4 bg-surface-container-highest/20 border border-outline-variant/10 rounded-[0.75rem]">
                    <label className="text-xs font-label text-primary uppercase tracking-wider">Gender</label>
                    <div className="mt-2 text-on-surface/90 font-headline leading-relaxed">{generatedProfile.gender}</div>
                </div>
                <div className="p-4 bg-surface-container-highest/20 border border-outline-variant/10 rounded-[0.75rem]">
                    <label className="text-xs font-label text-primary uppercase tracking-wider">Archetype</label>
                    <div className="mt-2 text-on-surface/90 font-headline leading-relaxed">{generatedProfile.archetype}</div>
                </div>
                <div className="p-4 bg-surface-container-highest/20 border border-outline-variant/10 rounded-[0.75rem]">
                    <label className="text-xs font-label text-primary uppercase tracking-wider">Soul Pattern</label>
                    <div className="mt-2 text-on-surface/90 font-headline leading-relaxed">{generatedProfile.soulPattern}</div>
                </div>
                <div className="p-4 bg-surface-container-highest/20 border border-outline-variant/10 rounded-[0.75rem]">
                    <label className="text-xs font-label text-primary uppercase tracking-wider">Signature Traits</label>
                    <div className="mt-2 text-on-surface/90 font-headline leading-relaxed">
                        {Array.isArray(generatedProfile.signatureTraits) ? generatedProfile.signatureTraits.join(', ') : String(generatedProfile.signatureTraits)}
                    </div>
                </div>
                {/* Add more fields as needed for a comprehensive review */}
            </div>
       );
    };
    
    const renderError = () => (
        <div className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-[0.75rem] flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 flex-shrink-0"/>
            <div>
                <p className="font-label text-xs uppercase tracking-wider font-bold mb-1">Generation Failed</p>
                <p className="font-headline text-sm">{errorMessage}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-md flex items-center justify-center z-40 p-4">
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-[0.75rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col ghost-border">
                 <header className="p-6 flex justify-between items-center border-b border-outline-variant/20 bg-surface-container-highest/30">
                    <h2 className="text-xl font-headline tracking-tight text-on-surface flex items-center gap-3"><UserPlus className="w-5 h-5 text-primary" /> Character Creator</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-primary transition-colors"><X className="w-5 h-5"/></button>
                </header>
                <main className="p-6 overflow-y-auto flex-grow relative custom-scrollbar">
                    {isLoading && <div className="absolute inset-0 bg-surface-container-low/80 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
                    {view === 'form' && renderForm()}
                    {view === 'review' && renderReview()}
                    {view === 'error' && renderError()}
                </main>
                 <footer className="p-6 border-t border-outline-variant/20 flex justify-end items-center gap-4 bg-surface-container-highest/20">
                    {view === 'form' && (
                        <>
                            <button onClick={onClose} className="px-5 py-2.5 text-xs font-label uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-full transition-all">Cancel</button>
                            <button onClick={handleGenerate} disabled={!isFormValid || isLoading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary-fixed font-label uppercase tracking-wider text-xs font-bold rounded-full hover:bg-primary/90 disabled:bg-surface-container-highest disabled:text-on-surface-variant/40 transition-all shadow-md">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                                <span>Generate with Echo</span>
                            </button>
                        </>
                    )}
                    {view === 'review' && (
                        <>
                            <button onClick={() => setView('form')} className="px-5 py-2.5 text-xs font-label uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-full transition-all">Back to Form</button>
                            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-label uppercase tracking-wider text-xs font-bold rounded-full hover:bg-emerald-500 transition-all shadow-md">
                                <CheckCircle className="w-4 h-4"/>
                                <span>Save Profile</span>
                            </button>
                        </>
                    )}
                    {view === 'error' && (
                        <>
                             <button onClick={() => setView('form')} className="px-5 py-2.5 text-xs font-label uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-full transition-all">Back to Form</button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
});
