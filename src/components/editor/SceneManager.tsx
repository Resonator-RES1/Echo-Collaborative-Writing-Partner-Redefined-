import React, { useState } from 'react';
import { Scene, Chapter, RefinedVersion } from '../../types';
import { Plus, Trash2, Edit2, Check, X, Folder, FileText, GripVertical, ChevronRight, ChevronDown, Clock } from 'lucide-react';
import * as db from '../../services/dbService';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface SceneManagerProps {
  scenes: Scene[];
  chapters: Chapter[];
  currentSceneId: string | null;
  setCurrentSceneId: (id: string) => void;
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setDraft: (draft: string) => void;
  showToast: (message: string) => void;
  versionHistory: RefinedVersion[];
}

export const SceneManager: React.FC<SceneManagerProps> = ({
  scenes,
  chapters,
  currentSceneId,
  setCurrentSceneId,
  setScenes,
  setChapters,
  setDraft,
  showToast,
  versionHistory
}) => {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleAddChapter = async () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: `Chapter ${chapters.length + 1}`,
      order: chapters.length,
    };
    setChapters([...chapters, newChapter]);
    await db.putChapter(newChapter);
    showToast('New chapter added');
    
    // Auto-expand the new chapter
    const newExpanded = new Set(expandedChapters);
    newExpanded.add(newChapter.id);
    setExpandedChapters(newExpanded);
  };

  const handleAddScene = async (chapterId?: string) => {
    const newScene: Scene = {
      id: Date.now().toString(),
      chapterId: chapterId,
      title: `Scene ${scenes.length + 1}`,
      content: '',
      order: scenes.filter(s => s.chapterId === chapterId).length,
      lastModified: new Date().toISOString()
    };
    
    setScenes([...scenes, newScene]);
    setCurrentSceneId(newScene.id);
    setDraft('');
    await db.putScene(newScene);
    showToast('New scene added');
    
    if (chapterId) {
      const newExpanded = new Set(expandedChapters);
      newExpanded.add(chapterId);
      setExpandedChapters(newExpanded);
    }
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

  const handleDeleteChapter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const unassignedCount = scenes.filter(s => !s.chapterId).length;
    let orderOffset = 0;

    // Move scenes out of the chapter
    const updatedScenes = scenes.map(s => {
      if (s.chapterId === id) {
        const updatedScene = { ...s, chapterId: undefined, order: unassignedCount + orderOffset };
        orderOffset++;
        return updatedScene;
      }
      return s;
    });
    
    setScenes(updatedScenes);
    
    // Update DB for all moved scenes
    for (const scene of updatedScenes.filter(s => s.chapterId === undefined && scenes.find(os => os.id === s.id)?.chapterId === id)) {
        await db.putScene(scene);
    }

    const newChapters = chapters.filter(c => c.id !== id);
    setChapters(newChapters);
    await db.deleteChapter(id);
    showToast('Chapter deleted');
  };

  const handleSelectScene = (id: string) => {
    if (id === currentSceneId) return;
    const scene = scenes.find(s => s.id === id);
    if (scene) {
      setCurrentSceneId(id);
      setDraft(scene.content);
    }
  };

  const startEditingScene = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSceneId(scene.id);
    setEditingChapterId(null);
    setEditTitle(scene.title);
  };

  const startEditingChapter = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChapterId(chapter.id);
    setEditingSceneId(null);
    setEditTitle(chapter.title);
  };

  const saveEditScene = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim()) {
      cancelEdit();
      return;
    }
    
    const updatedScenes = scenes.map(s => 
      s.id === id ? { ...s, title: editTitle.trim(), lastModified: new Date().toISOString() } : s
    );
    setScenes(updatedScenes);
    setEditingSceneId(null);
    
    const updatedScene = updatedScenes.find(s => s.id === id);
    if (updatedScene) {
      await db.putScene(updatedScene);
    }
  };

  const saveEditChapter = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim()) {
      cancelEdit();
      return;
    }
    
    const updatedChapters = chapters.map(c => 
      c.id === id ? { ...c, title: editTitle.trim() } : c
    );
    setChapters(updatedChapters);
    setEditingChapterId(null);
    
    const updatedChapter = updatedChapters.find(c => c.id === id);
    if (updatedChapter) {
      await db.putChapter(updatedChapter);
    }
  };

  const cancelEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSceneId(null);
    setEditingChapterId(null);
    setEditTitle('');
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    if (type === 'chapter') {
      const newChapters = Array.from(chapters).sort((a, b) => a.order - b.order);
      const [reorderedItem] = newChapters.splice(source.index, 1);
      newChapters.splice(destination.index, 0, reorderedItem);

      const updatedChapters = newChapters.map((chapter, index) => ({
        ...chapter,
        order: index
      }));

      setChapters(updatedChapters);
      for (const chapter of updatedChapters) {
        await db.putChapter(chapter);
      }
      return;
    }

    if (type === 'scene') {
      const sourceChapterId = source.droppableId === 'unassigned' ? undefined : source.droppableId;
      const destChapterId = destination.droppableId === 'unassigned' ? undefined : destination.droppableId;

      const sourceScenes = scenes.filter(s => s.chapterId === sourceChapterId).sort((a, b) => a.order - b.order);
      const destScenes = sourceChapterId === destChapterId ? sourceScenes : scenes.filter(s => s.chapterId === destChapterId).sort((a, b) => a.order - b.order);

      const [movedScene] = sourceScenes.splice(source.index, 1);
      movedScene.chapterId = destChapterId;
      destScenes.splice(destination.index, 0, movedScene);

      // Update orders
      const updatedSourceScenes = sourceScenes.map((s, idx) => ({ ...s, order: idx }));
      const updatedDestScenes = destScenes.map((s, idx) => ({ ...s, order: idx }));

      // Merge back into main scenes array
      let newScenes = [...scenes];
      
      // Remove old scenes from these chapters
      newScenes = newScenes.filter(s => s.chapterId !== sourceChapterId && s.chapterId !== destChapterId);
      
      // Add updated scenes
      if (sourceChapterId === destChapterId) {
          newScenes = [...newScenes, ...updatedDestScenes];
      } else {
          newScenes = [...newScenes, ...updatedSourceScenes, ...updatedDestScenes];
      }

      setScenes(newScenes);
      
      // Save to DB
      if (sourceChapterId === destChapterId) {
          for (const scene of updatedDestScenes) {
              await db.putScene(scene);
          }
      } else {
          for (const scene of updatedSourceScenes) {
              await db.putScene(scene);
          }
          for (const scene of updatedDestScenes) {
              await db.putScene(scene);
          }
      }
    }
  };

  const getWordCount = (content: string) => {
    const text = content.trim();
    return text === '' ? 0 : text.split(/\s+/).length;
  };

  const hasAcceptedVersion = (sceneId: string) => {
    return versionHistory.some(v => v.sceneId === sceneId && v.isAccepted);
  };

  const renderScene = (scene: Scene, index: number) => (
    <Draggable key={scene.id} draggableId={scene.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={() => handleSelectScene(scene.id)}
          className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors mb-1 ${
            currentSceneId === scene.id 
              ? 'bg-primary/10 border border-primary/20 text-primary' 
              : 'hover:bg-surface-container-highest border border-transparent text-on-surface-variant hover:text-on-surface'
          } ${snapshot.isDragging ? 'shadow-lg bg-surface-container-highest z-50' : ''}`}
        >
          {editingSceneId === scene.id ? (
            <div className="flex items-center w-full gap-1" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEditScene(scene.id);
                  if (e.key === 'Escape') cancelEdit();
                }}
                className="flex-1 bg-surface border border-primary/50 rounded px-2 py-1 text-sm outline-none text-on-surface"
                autoFocus
              />
              <button onClick={(e) => saveEditScene(scene.id, e)} className="text-emerald-500 p-1 hover:bg-emerald-500/10 rounded">
                <Check size={14} />
              </button>
              <button onClick={cancelEdit} className="text-red-500 p-1 hover:bg-red-500/10 rounded">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <div {...provided.dragHandleProps} className="text-on-surface-variant/30 hover:text-on-surface-variant cursor-grab active:cursor-grabbing">
                  <GripVertical size={14} />
                </div>
                <FileText size={14} className="opacity-50 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate select-none font-medium">{scene.title}</span>
                  {(scene.storyDay !== undefined || scene.storyTime) && (
                    <div className="flex items-center gap-1 text-[10px] text-on-surface-variant/60">
                      <Clock size={10} />
                      <span>
                        {scene.storyDay !== undefined ? `Day ${scene.storyDay}` : ''}
                        {scene.storyDay !== undefined && scene.storyTime ? ' • ' : ''}
                        {scene.storyTime || ''}
                      </span>
                    </div>
                  )}
                </div>
                {(scene.hasEcho || hasAcceptedVersion(scene.id)) && (
                  <span title="Has accepted refinement" className="flex-shrink-0 flex items-center">
                    <Check size={12} className="text-emerald-500 ml-1" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono opacity-50">{getWordCount(scene.content)}w</span>
                <div className="flex items-center transition-opacity">
                  <button 
                    onClick={(e) => startEditingScene(scene, e)}
                    className="p-2 text-on-surface-variant/40 hover:text-primary active:text-primary rounded hover:bg-primary/10 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                    title="Rename Scene"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteScene(scene.id, e)}
                    className="p-2 text-on-surface-variant/40 hover:text-error active:text-error rounded hover:bg-error/10 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                    title="Delete Scene"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );

  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  const unassignedScenes = scenes.filter(s => !s.chapterId).sort((a, b) => a.order - b.order);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-highest/50">
        <h2 className="font-heading font-semibold text-xs tracking-widest text-on-surface-variant uppercase">Manuscript</h2>
        <div className="flex gap-1">
          <button 
            onClick={handleAddChapter}
            className="p-2 md:p-1 hover:bg-primary/10 rounded text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-xs font-medium min-w-[44px] min-h-[44px] justify-center md:min-w-0 md:min-h-0"
            title="Add Chapter"
          >
            <Folder size={16} />
            <span className="hidden sm:inline">Chapter</span>
          </button>
          <button 
            onClick={() => handleAddScene()}
            className="p-2 md:p-1 hover:bg-primary/10 rounded text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-xs font-medium min-w-[44px] min-h-[44px] justify-center md:min-w-0 md:min-h-0"
            title="Add Scene"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Scene</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="chapters-list" type="chapter">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {sortedChapters.map((chapter, index) => {
                  const chapterScenes = scenes.filter(s => s.chapterId === chapter.id).sort((a, b) => a.order - b.order);
                  const isExpanded = expandedChapters.has(chapter.id);
                  
                  return (
                    <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border border-outline-variant/20 rounded-lg overflow-hidden ${snapshot.isDragging ? 'shadow-xl bg-surface-container z-50' : 'bg-surface'}`}
                        >
                          <div 
                            className="flex items-center justify-between p-2 bg-surface-container-low hover:bg-surface-container-highest transition-colors group cursor-pointer"
                            onClick={() => toggleChapter(chapter.id)}
                          >
                            {editingChapterId === chapter.id ? (
                              <div className="flex items-center w-full gap-1" onClick={e => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={e => setEditTitle(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveEditChapter(chapter.id);
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  className="flex-1 bg-surface border border-primary/50 rounded px-2 py-1 text-sm outline-none text-on-surface font-semibold"
                                  autoFocus
                                />
                                <button onClick={(e) => saveEditChapter(chapter.id, e)} className="text-emerald-500 p-1 hover:bg-emerald-500/10 rounded">
                                  <Check size={14} />
                                </button>
                                <button onClick={cancelEdit} className="text-red-500 p-1 hover:bg-red-500/10 rounded">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 flex-1">
                                  <div {...provided.dragHandleProps} className="text-on-surface-variant/30 hover:text-on-surface-variant cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()}>
                                    <GripVertical size={14} />
                                  </div>
                                  {isExpanded ? <ChevronDown size={14} className="text-on-surface-variant" /> : <ChevronRight size={14} className="text-on-surface-variant" />}
                                  <Folder size={14} className="text-primary/70" />
                                  <span className="text-sm font-semibold text-on-surface">{chapter.title}</span>
                                  <span className="text-xs text-on-surface-variant/50 ml-2">({chapterScenes.length})</span>
                                </div>
                                <div className="flex items-center transition-opacity" onClick={e => e.stopPropagation()}>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleAddScene(chapter.id); }}
                                    className="p-2 text-on-surface-variant/40 hover:text-primary active:text-primary rounded hover:bg-primary/10 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                                    title="Add Scene to Chapter"
                                  >
                                    <Plus size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => startEditingChapter(chapter, e)}
                                    className="p-2 text-on-surface-variant/40 hover:text-primary active:text-primary rounded hover:bg-primary/10 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                                    title="Rename Chapter"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => handleDeleteChapter(chapter.id, e)}
                                    className="p-2 text-on-surface-variant/40 hover:text-error active:text-error rounded hover:bg-error/10 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                                    title="Delete Chapter"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {isExpanded && (
                            <Droppable droppableId={chapter.id} type="scene">
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef} 
                                  {...provided.droppableProps}
                                  className={`p-2 min-h-[40px] ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                                >
                                  {chapterScenes.map((scene, idx) => renderScene(scene, idx))}
                                  {provided.placeholder}
                                  {chapterScenes.length === 0 && !snapshot.isDraggingOver && (
                                    <div className="text-xs text-center text-on-surface-variant/50 py-2 italic border border-dashed border-outline-variant/30 rounded">
                                      Empty chapter. Drag scenes here or add a new one.
                                    </div>
                                  )}
                                </div>
                              )}
                            </Droppable>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="mt-6">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 px-2">Unassigned Scenes</h3>
            <Droppable droppableId="unassigned" type="scene">
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className={`min-h-[100px] p-1 rounded-lg ${snapshot.isDraggingOver ? 'bg-primary/5 border border-dashed border-primary/30' : 'border border-transparent'}`}
                >
                  {unassignedScenes.map((scene, index) => renderScene(scene, index))}
                  {provided.placeholder}
                  {unassignedScenes.length === 0 && !snapshot.isDraggingOver && (
                    <div className="text-xs text-center text-on-surface-variant/50 py-4 italic">
                      No unassigned scenes.
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};
