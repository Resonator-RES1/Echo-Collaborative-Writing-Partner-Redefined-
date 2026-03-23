import React, { useState } from 'react';
import { Scene } from '../../types';
import { Plus, Trash2, Edit2, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import * as db from '../../services/dbService';

interface SceneManagerProps {
  scenes: Scene[];
  currentSceneId: string | null;
  setCurrentSceneId: (id: string) => void;
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  setDraft: (draft: string) => void;
  showToast: (message: string) => void;
}

export const SceneManager: React.FC<SceneManagerProps> = ({
  scenes,
  currentSceneId,
  setCurrentSceneId,
  setScenes,
  setDraft,
  showToast
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAddScene = async () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      title: `Scene ${scenes.length + 1}`,
      content: '',
      order: scenes.length,
      lastModified: new Date().toISOString()
    };
    
    setScenes([...scenes, newScene]);
    setCurrentSceneId(newScene.id);
    setDraft('');
    await db.putScene(newScene);
    showToast('New scene added');
  };

  const handleDeleteScene = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (scenes.length <= 1) {
      showToast('Cannot delete the last scene');
      return;
    }
    
    const newScenes = scenes.filter(s => s.id !== id);
    setScenes(newScenes);
    await db.deleteScene(id);
    
    if (currentSceneId === id) {
      setCurrentSceneId(newScenes[0].id);
      setDraft(newScenes[0].content);
    }
    showToast('Scene deleted');
  };

  const handleSelectScene = (id: string) => {
    if (id === currentSceneId) return;
    const scene = scenes.find(s => s.id === id);
    if (scene) {
      setCurrentSceneId(id);
      setDraft(scene.content);
    }
  };

  const startEditing = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(scene.id);
    setEditTitle(scene.title);
  };

  const saveEdit = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim()) {
      cancelEdit();
      return;
    }
    
    const updatedScenes = scenes.map(s => 
      s.id === id ? { ...s, title: editTitle.trim(), lastModified: new Date().toISOString() } : s
    );
    setScenes(updatedScenes);
    setEditingId(null);
    
    const updatedScene = updatedScenes.find(s => s.id === id);
    if (updatedScene) {
      await db.putScene(updatedScene);
    }
  };

  const cancelEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const moveScene = async (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === scenes.length - 1) return;

    const sortedScenes = [...scenes].sort((a, b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap orders
    const tempOrder = sortedScenes[index].order;
    sortedScenes[index].order = sortedScenes[targetIndex].order;
    sortedScenes[targetIndex].order = tempOrder;

    setScenes(sortedScenes);
    await db.putScene(sortedScenes[index]);
    await db.putScene(sortedScenes[targetIndex]);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-highest/50">
        <h2 className="font-heading font-semibold text-xs tracking-widest text-on-surface-variant uppercase">Scenes</h2>
        <button 
          onClick={handleAddScene}
          className="p-1 hover:bg-primary/10 rounded text-on-surface-variant hover:text-primary transition-colors"
          title="Add Scene"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {scenes.sort((a, b) => a.order - b.order).map((scene, index) => (
          <div 
            key={scene.id}
            onClick={() => handleSelectScene(scene.id)}
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              currentSceneId === scene.id 
                ? 'bg-primary/10 border border-primary/20 text-primary' 
                : 'hover:bg-surface-container-highest border border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {editingId === scene.id ? (
              <div className="flex items-center w-full gap-1" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(scene.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="flex-1 bg-surface border border-primary/50 rounded px-2 py-1 text-sm outline-none text-on-surface"
                  autoFocus
                />
                <button onClick={(e) => saveEdit(scene.id, e)} className="text-emerald-500 p-1 hover:bg-emerald-500/10 rounded">
                  <Check size={14} />
                </button>
                <button onClick={cancelEdit} className="text-red-500 p-1 hover:bg-red-500/10 rounded">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <span className="text-sm truncate select-none font-medium">{scene.title}</span>
                </div>
                <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col mr-1">
                    <button 
                      onClick={(e) => moveScene(index, 'up', e)}
                      disabled={index === 0}
                      className="text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:hover:text-on-surface-variant"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button 
                      onClick={(e) => moveScene(index, 'down', e)}
                      disabled={index === scenes.length - 1}
                      className="text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:hover:text-on-surface-variant"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                  <button 
                    onClick={(e) => startEditing(scene, e)}
                    className="p-1.5 text-on-surface-variant hover:text-primary rounded hover:bg-primary/10"
                    title="Rename Scene"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteScene(scene.id, e)}
                    className="p-1.5 text-on-surface-variant hover:text-error rounded hover:bg-error/10"
                    title="Delete Scene"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
