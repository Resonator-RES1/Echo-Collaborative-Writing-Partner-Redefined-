import React, { useState } from 'react';
import { UserPlus, X, Sparkles, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { generateCharacterProfile, CharacterCreatorData } from '../../services/geminiService';
import { CharacterProfile, Gender } from '../../src/types';

interface CharacterCreatorModalProps {
    onClose: () => void;
    showToast: (message: string) => void;
}

const getInitialCharacterProfiles = (): CharacterProfile[] => {
    try {
        const savedProfiles = localStorage.getItem('echo-character-profiles');
        return savedProfiles ? JSON.parse(savedProfiles) : [];
    } catch(e) { 
        console.error("Failed to parse character profiles from localStorage", e);
        return [];
    }
};

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = React.memo(({ onClose, showToast }) => {
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
    const [generatedProfile, setGeneratedProfile] = useState<Omit<CharacterProfile, 'id'> | null>(null);

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
        const newProfile: CharacterProfile = {
            ...generatedProfile,
            backstory: generatedProfile.backstory || '',
            motivations: generatedProfile.motivations || '',
            relationships: generatedProfile.relationships || '',
            id: Date.now().toString() + Math.random().toString(),
            isActive: true,
        };
        const existingProfiles = getInitialCharacterProfiles();
        const updatedProfiles = [...existingProfiles, newProfile];
        localStorage.setItem('echo-character-profiles', JSON.stringify(updatedProfiles));
        window.dispatchEvent(new Event('echo-character-profiles-updated'));
        showToast("Character profile created!");
        onClose();
    };
    
    const isFormValid = formData.name.trim() !== '' && formData.coreConcept.trim() !== '';

    const renderForm = () => (
        <div className="space-y-4">
            <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-300 mb-2">Core Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" placeholder="Character Name*" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"/>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500">
                        <option value="unspecified">Unspecified Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                    </select>
                </div>
                <textarea name="coreConcept" placeholder="Core Concept*: e.g., 'A cynical detective who discovers magic is real.'" value={formData.coreConcept} onChange={handleInputChange} rows={2} className="mt-4 w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"/>
            </div>
             <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-300 mb-2">Details & History</h3>
                <div className="space-y-3">
                     <textarea name="backstoryNotes" placeholder="Backstory Notes: Where are they from? What key events shaped them?" value={formData.backstoryNotes} onChange={handleInputChange} rows={3} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"/>
                     <textarea name="motivationNotes" placeholder="Motivation Notes: What do they want? What are they afraid of?" value={formData.motivationNotes} onChange={handleInputChange} rows={2} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"/>
                     <textarea name="relationshipNotes" placeholder="Relationship Notes: Who are their allies, enemies, or family?" value={formData.relationshipNotes} onChange={handleInputChange} rows={2} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"/>
                     <textarea name="voiceNotes" placeholder="Voice & Personality Notes: How do they speak? Are they witty, formal, quiet?" value={formData.voiceNotes} onChange={handleInputChange} rows={2} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"/>
                </div>
            </div>
        </div>
    );
    
    const renderReview = () => {
       if (!generatedProfile) return null;
       return (
            <div className="space-y-3">
                {Object.entries(generatedProfile).map(([key, value]) => (
                    <div key={key}>
                        <label className="capitalize text-sm font-semibold text-purple-300">{key}</label>
                        <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700 rounded-md whitespace-pre-wrap text-gray-300">{String(value)}</div>
                    </div>
                ))}
            </div>
       );
    };
    
    const renderError = () => (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0"/>
            <div>
                <p className="font-bold">Generation Failed</p>
                <p className="text-sm">{errorMessage}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                 <header className="p-4 flex justify-between items-center border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><UserPlus /> Character Creator</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"><X className="w-6 h-6"/></button>
                </header>
                <main className="p-6 overflow-y-auto flex-grow relative">
                    {isLoading && <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center z-10"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>}
                    {view === 'form' && renderForm()}
                    {view === 'review' && renderReview()}
                    {view === 'error' && renderError()}
                </main>
                 <footer className="p-4 border-t border-gray-700 flex justify-end items-center gap-3">
                    {view === 'form' && (
                        <>
                            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 rounded-md">Cancel</button>
                            <button onClick={handleGenerate} disabled={!isFormValid || isLoading} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:bg-purple-900 disabled:text-gray-400">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                                <span>Generate with Echo</span>
                            </button>
                        </>
                    )}
                    {view === 'review' && (
                        <>
                            <button onClick={() => setView('form')} className="px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 rounded-md">Back to Form</button>
                            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                                <CheckCircle className="w-5 h-5"/>
                                <span>Save Profile</span>
                            </button>
                        </>
                    )}
                    {view === 'error' && (
                        <>
                             <button onClick={() => setView('form')} className="px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 rounded-md">Back to Form</button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
});
