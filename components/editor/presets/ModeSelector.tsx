import React from 'react';
import { RefineMode, ReviewPerspective } from '../../../src/types';

interface ModeSelectorProps {
    mode: RefineMode;
    setMode: (mode: RefineMode) => void;
    reviewPerspective: ReviewPerspective;
    setReviewPerspective: (perspective: ReviewPerspective) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = React.memo(({ 
    mode, setMode, reviewPerspective, setReviewPerspective 
}) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mode</label>
                <div className="flex gap-2 bg-gray-700/50 p-1 rounded-lg">
                    <button 
                        onClick={() => setMode('collaborative')} 
                        className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-md transition-all ${mode === 'collaborative' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-600 hover:text-gray-200'}`}
                    >
                        Collaborative
                    </button>
                    <button 
                        onClick={() => setMode('review')} 
                        className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-md transition-all ${mode === 'review' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-600 hover:text-gray-200'}`}
                    >
                        Review
                    </button>
                    <button 
                        onClick={() => setMode('reaction')} 
                        className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-md transition-all ${mode === 'reaction' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-600 hover:text-gray-200'}`}
                    >
                        Reaction
                    </button>
                </div>
            </div>

            {mode === 'review' && (
                <div>
                    <label htmlFor="review-perspective" className="block text-sm font-medium text-gray-300 mb-2">Review Perspective</label>
                    <select 
                        id="review-perspective" 
                        value={reviewPerspective} 
                        onChange={(e) => setReviewPerspective(e.target.value as ReviewPerspective)} 
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    >
                        <option value="reader">Avid Reader</option>
                        <option value="editor">Meticulous Editor</option>
                        <option value="publisher">Publisher</option>
                    </select>
                </div>
            )}
        </div>
    );
});
