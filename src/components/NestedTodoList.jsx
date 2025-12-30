import React, { useState } from 'react';
import CharacterList from './CharacterList.jsx';


function NestedTodoList({
  openAccordion,
  setOpenAccordion,
  chapters,
  setChapters,
  chapterName,
  setChapterName,
  chapterContext,
  setChapterContext,
  characterList,
  setCharacterList,
  selectedCharacters,
  setSelectedCharacters,
  synopsis,
  setSynopsis,
  instructions,
  setInstructions,
  onAddChapter,
  onSendBeatToAI
}) {

  // Handler to remove a chapter
  const handleRemoveChapter = (chapterIdx) => {
    setChapters(chapters => chapters.filter((_, idx) => idx !== chapterIdx));
  };

  // Handler to edit a chapter
  const handleEditChapter = (chapterIdx, newName, newContext) => {
    setChapters(chapters =>
      chapters.map((ch, idx) =>
        idx === chapterIdx ? { ...ch, name: newName, context: newContext } : ch
      )
    );
  };

  // Handler to remove a beat from a chapter
  const handleRemoveBeat = (chapterIdx, beatIdx) => {
    setChapters(chapters =>
      chapters.map((ch, idx) =>
        idx === chapterIdx
          ? { ...ch, beats: ch.beats.filter((_, i) => i !== beatIdx) }
          : ch
      )
    );
  };

  // Handler to edit a beat in a chapter
  const handleEditBeat = (chapterIdx, beatIdx, newBeatText) => {
    setChapters(chapters =>
      chapters.map((ch, idx) =>
        idx === chapterIdx
          ? {
              ...ch,
              beats: ch.beats.map((b, i) => (i === beatIdx ? newBeatText : b))
            }
          : ch
      )
    );
  };

  // Handler to add a beat to a chapter
  const handleAddBeat = (chapterIdx, beatText) => {
    if (!beatText.trim()) return;
    setChapters(chapters =>
      chapters.map((ch, idx) =>
        idx === chapterIdx
          ? { ...ch, beats: [...ch.beats, beatText] }
          : ch
      )
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5' }}>
      <aside style={{ minWidth: 280, maxWidth: 350, height: '100vh', background: '#f8f9fa', borderRight: '1px solid #e0e0e0', boxSizing: 'border-box', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Story Context Accordion */}
        <div style={{ borderBottom: '1px solid #e0e0e0', background: '#eef2ff' }}>
          <button style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setOpenAccordion(openAccordion === 0 ? -1 : 0)}>
            Story Context
          </button>
          {openAccordion === 0 && (
            <div className="overall-context" style={{ padding: '1.2rem 1rem 1rem 1rem' }}>
              <textarea
                style={{ width: '100%', minHeight: '60px', marginBottom: '0.7rem', borderRadius: 4, border: '1px solid #ccc', padding: '0.5rem', fontSize: '0.98rem' }}
                placeholder="Synopsis (overall summary)"
                value={synopsis}
                onChange={e => setSynopsis(e.target.value)}
              />
              <textarea
                style={{ width: '100%', minHeight: '40px', borderRadius: 4, border: '1px solid #ccc', padding: '0.5rem', fontSize: '0.98rem' }}
                placeholder="Instructions (plot style, execution notes, etc.)"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
            </div>
          )}
        </div>
        {/* Character List Accordion */}
        <div style={{ borderBottom: '1px solid #e0e0e0', background: '#f3f4f6' }}>
          <button style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setOpenAccordion(openAccordion === 1 ? -1 : 1)}>
            Characters
          </button>
          {openAccordion === 1 && (
            <CharacterList characterList={characterList} setCharacterList={setCharacterList} />
          )}
        </div>
        {/* Chapters & Scene Beats Accordion */}
        <div style={{ background: '#f8f9fa' }}>
          <button style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#333', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setOpenAccordion(openAccordion === 2 ? -1 : 2)}>
            Novel Chapters & Scene Beats
          </button>
          {openAccordion === 2 && (
            <div className="nested-todo-list" style={{ flex: 1 }}>
              <div className="add-chapter">
                <input
                  type="text"
                  placeholder="Chapter name"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Chapter context"
                  value={chapterContext}
                  onChange={(e) => setChapterContext(e.target.value)}
                />
                {/* Character selection for chapter */}
                <div style={{ margin: '0.5rem 0' }}>
                  <label style={{ fontSize: '0.97rem', fontWeight: 500 }}>Assign Characters:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: 2 }}>
                    {characterList.length === 0 ? (
                      <span style={{ color: '#888', fontSize: '0.95rem' }}>No characters created yet</span>
                    ) : (
                      characterList.map((char, idx) => (
                        <label key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: '0.95rem', background: selectedCharacters.includes(char.name) ? '#e0e7ff' : '#f3f4f6', borderRadius: 4, padding: '2px 7px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={selectedCharacters.includes(char.name)}
                            onChange={() => {
                              setSelectedCharacters(selectedCharacters =>
                                selectedCharacters.includes(char.name)
                                  ? selectedCharacters.filter(n => n !== char.name)
                                  : [...selectedCharacters, char.name]
                              );
                            }}
                            style={{ marginRight: 4 }}
                          />
                          {char.name}
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <button onClick={onAddChapter}>Add Chapter</button>
              </div>
              <div className="chapter-list">
                {chapters.map((chapter, idx) => (
                  <ChapterItem
                    key={idx}
                    chapter={chapter}
                    chapterIdx={idx}
                    onAddBeat={handleAddBeat}
                    onRemoveChapter={handleRemoveChapter}
                    onEditChapter={handleEditChapter}
                    onRemoveBeat={handleRemoveBeat}
                    onEditBeat={handleEditBeat}
                    onSendBeatToAI={onSendBeatToAI}
                    storyContext={{ synopsis, instructions, characterList }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function ChapterItem({ chapter, chapterIdx, onAddBeat, onRemoveChapter, onEditChapter, onRemoveBeat, onEditBeat, onSendBeatToAI, storyContext }) {
  const [beatText, setBeatText] = useState('');
  const [editingChapter, setEditingChapter] = useState(false);
  const [editChapterName, setEditChapterName] = useState(chapter.name);
  const [editChapterContext, setEditChapterContext] = useState(chapter.context);
  const [editingBeatIdx, setEditingBeatIdx] = useState(null);
  const [editBeatText, setEditBeatText] = useState('');

  return (
    <div className="chapter-item">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {editingChapter ? (
          <>
            <input
              type="text"
              value={editChapterName}
              onChange={e => setEditChapterName(e.target.value)}
              style={{ fontWeight: 'bold', fontSize: '1.1rem', marginRight: 4 }}
            />
            <input
              type="text"
              value={editChapterContext}
              onChange={e => setEditChapterContext(e.target.value)}
              style={{ fontSize: '0.97rem', marginRight: 4 }}
            />
            <button onClick={() => { onEditChapter(chapterIdx, editChapterName, editChapterContext); setEditingChapter(false); }} style={{ padding: '2px 8px', fontSize: '0.85rem', marginRight: 2 }}>Save</button>
            <button onClick={() => setEditingChapter(false)} style={{ padding: '2px 8px', fontSize: '0.85rem' }}>Cancel</button>
          </>
        ) : (
          <>
            <h3 style={{ margin: 0, flex: 1 }}>{chapter.name}</h3>
            <p style={{ margin: 0, flex: 2 }}>{chapter.context}</p>
            <button onClick={() => setEditingChapter(true)} title="Edit chapter" style={{ padding: '2px 6px', fontSize: '0.8rem', marginLeft: 2, background: '#e0e7ff', border: 'none', borderRadius: 3, color: '#3730a3', cursor: 'pointer' }}>✎</button>
            <button onClick={() => onRemoveChapter(chapterIdx)} title="Remove chapter" style={{ padding: '2px 6px', fontSize: '0.8rem', marginLeft: 2, background: '#fee2e2', border: 'none', borderRadius: 3, color: '#b91c1c', cursor: 'pointer' }}>✕</button>
          </>
        )}
      </div>
      {/* Show assigned characters for this chapter */}
      {chapter.characters && chapter.characters.length > 0 && (
        <div style={{ fontSize: '0.93rem', color: '#555', margin: '2px 0 4px 0' }}>
          <span style={{ fontWeight: 500 }}>Characters:</span> {chapter.characters.join(', ')}
        </div>
      )}
      <ul style={{ paddingLeft: 18 }}>
        {chapter.beats.map((beat, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: 2 }}>
            {editingBeatIdx === i ? (
              <>
                <input
                  type="text"
                  value={editBeatText}
                  onChange={e => setEditBeatText(e.target.value)}
                  style={{ fontSize: '0.95rem', marginRight: 2 }}
                />
                <button onClick={() => { onEditBeat(chapterIdx, i, editBeatText); setEditingBeatIdx(null); }} style={{ padding: '1px 7px', fontSize: '0.8rem', marginRight: 1 }}>Save</button>
                <button onClick={() => setEditingBeatIdx(null)} style={{ padding: '1px 7px', fontSize: '0.8rem' }}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1 }}>{beat}</span>
                <button onClick={() => { setEditingBeatIdx(i); setEditBeatText(beat); }} title="Edit beat" style={{ padding: '1px 6px', fontSize: '0.75rem', background: '#e0e7ff', border: 'none', borderRadius: 3, color: '#3730a3', cursor: 'pointer' }}>✎</button>
                <button onClick={() => onRemoveBeat(chapterIdx, i)} title="Remove beat" style={{ padding: '1px 6px', fontSize: '0.75rem', background: '#fee2e2', border: 'none', borderRadius: 3, color: '#b91c1c', cursor: 'pointer' }}>✕</button>
                <button
                  onClick={() => onSendBeatToAI({
                    beat,
                    chapterTitle: chapter.name,
                    chapterContext: chapter.context,
                    characters: chapter.characters,
                    storyContext
                  })}
                  style={{ padding: '1px 8px', fontSize: '0.8rem', background: '#dbeafe', border: 'none', borderRadius: 3, color: '#2563eb', cursor: 'pointer' }}
                  title="Send this beat to AI"
                >
                  ➤ Send to AI
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Add scene beat / writing prompt"
        value={beatText}
        onChange={(e) => setBeatText(e.target.value)}
      />
      <button
        onClick={() => {
          onAddBeat(chapterIdx, beatText);
          setBeatText('');
        }}
      >
        Add Beat
      </button>
    </div>
  );
}

export default NestedTodoList;
