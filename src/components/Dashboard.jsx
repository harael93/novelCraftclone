import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import NestedTodoList from './NestedTodoList.jsx';
import ProseMirrorBookEditor from './ProseMirrorBookEditor.jsx';
import AIChatDropdown from './AIChatDropdown.jsx';
import { useRef, useState } from 'react';

function Dashboard() {
    // Centralized state
    const [openAccordion, setOpenAccordion] = useState(0);
    const [chapters, setChapters] = useState([]);
    const [chapterName, setChapterName] = useState('');
    const [chapterContext, setChapterContext] = useState('');
    const [characterList, setCharacterList] = useState(() => {
        try {
            const stored = localStorage.getItem('characterList');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    const [synopsis, setSynopsis] = useState('');
    const [instructions, setInstructions] = useState('');
    const [editor, setEditor] = useState(null);

    // Save/load book state
    const saveProgress = () => {
        const data = {
            chapters,
            characterList,
            synopsis,
            instructions
        };
        localStorage.setItem('novelBookData', JSON.stringify(data));
    };
    const loadProgress = () => {
        const data = localStorage.getItem('novelBookData');
        if (data) {
            const parsed = JSON.parse(data);
            setChapters(parsed.chapters || []);
            setCharacterList(parsed.characterList || []);
            setSynopsis(parsed.synopsis || '');
            setInstructions(parsed.instructions || '');
        }
    };

    // Handlers for NestedTodoList
    const handleAddChapter = () => {
        if (!chapterName.trim()) return;
        setChapters([
            ...chapters,
            {
                name: chapterName,
                context: chapterContext,
                beats: [],
                characters: selectedCharacters,
            },
        ]);
        setChapterName('');
        setChapterContext('');
        setSelectedCharacters([]);
    };
    const handleRemoveChapter = (chapterIdx) => {
        setChapters(chapters => chapters.filter((_, idx) => idx !== chapterIdx));
    };
    const handleEditChapter = (chapterIdx, newName, newContext) => {
        setChapters(chapters => chapters.map((ch, idx) => idx === chapterIdx ? { ...ch, name: newName, context: newContext } : ch));
    };
    const handleRemoveBeat = (chapterIdx, beatIdx) => {
        setChapters(chapters => chapters.map((ch, idx) => idx === chapterIdx ? { ...ch, beats: ch.beats.filter((_, i) => i !== beatIdx) } : ch));
    };
    const handleEditBeat = (chapterIdx, beatIdx, newText) => {
        setChapters(chapters => chapters.map((ch, idx) => idx === chapterIdx ? { ...ch, beats: ch.beats.map((b, i) => i === beatIdx ? newText : b) } : ch));
    };
    const handleAddBeat = (chapterIdx, beatText) => {
        if (!beatText.trim()) return;
        setChapters((prev) =>
            prev.map((ch, idx) =>
                idx === chapterIdx
                    ? { ...ch, beats: [...ch.beats, beatText] }
                    : ch
            )
        );
    };


    // Handler to insert text into the editor
    const handleInsertAIResponse = (text) => {
        if (editor) {
            editor.chain().focus().insertContent(text).run();
        }
    };

    // Handler to send a beat to the AI with all context
    const [pendingAIPrompt, setPendingAIPrompt] = useState(null);
    const handleSendBeatToAI = ({ beat }) => {
        setPendingAIPrompt({ type: 'beat', text: beat });
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={saveProgress} style={{marginRight: 8}}>💾 Save Progress</button>
                    <button onClick={loadProgress}>📂 Load Progress</button>
                    <AIChatDropdown
                        buttonStyle={{
                            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onInsertAIResponse={handleInsertAIResponse}
                        chapters={chapters}
                        characterList={characterList}
                        synopsis={synopsis}
                        instructions={instructions}
                        pendingAIPrompt={pendingAIPrompt}
                        setPendingAIPrompt={setPendingAIPrompt}
                    />
                        <button
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 6,
                                background: '#e0e7ff',
                                color: '#3730a3',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginLeft: 8
                            }}
                            title="Send highlighted text to AI"
                            onClick={() => {
                                if (editor) {
                                    const selection = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, '\n');
                                    if (selection.trim()) {
                                        setPendingAIPrompt({ type: 'highlight', text: selection });
                                    }
                                }
                            }}
                        >
                            📨 Send Highlighted Text to AI
                        </button>
                </div>
            </header>
            <div className="dashboard-layout">
                <aside className="dashboard-aside">
                    <NestedTodoList
                        openAccordion={openAccordion}
                        setOpenAccordion={setOpenAccordion}
                        chapters={chapters}
                        setChapters={setChapters}
                        chapterName={chapterName}
                        setChapterName={setChapterName}
                        chapterContext={chapterContext}
                        setChapterContext={setChapterContext}
                        characterList={characterList}
                        setCharacterList={setCharacterList}
                        selectedCharacters={selectedCharacters}
                        setSelectedCharacters={setSelectedCharacters}
                        synopsis={synopsis}
                        setSynopsis={setSynopsis}
                        instructions={instructions}
                        setInstructions={setInstructions}
                        onAddChapter={handleAddChapter}
                        onRemoveChapter={handleRemoveChapter}
                        onEditChapter={handleEditChapter}
                        onRemoveBeat={handleRemoveBeat}
                        onEditBeat={handleEditBeat}
                        onAddBeat={handleAddBeat}
                        onSendBeatToAI={handleSendBeatToAI}
                    />
                </aside>
                <main className="dashboard-main">
                    <ProseMirrorBookEditor
                        onEditorReady={setEditor}
                        onSendSelectionToAI={({ selection }) => {
                            setPendingAIPrompt({ type: 'highlight', text: selection });
                        }}
                    />
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
