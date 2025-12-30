import React, { useState } from 'react';
import './CharacterList.css';

function CharacterList({ characterList, setCharacterList }) {
  const [name, setName] = useState('');
  const [data, setData] = useState('');

  const handleAddCharacter = () => {
    if (!name.trim()) return;
    setCharacterList([
      ...characterList,
      { name, data },
    ]);
    setName('');
    setData('');
  };

  const handleDeleteCharacter = (idx) => {
    setCharacterList(characterList.filter((_, i) => i !== idx));
  };

  return (
    <div className="character-list">
      <h2>Characters</h2>
      <div className="add-character">
        <input
          type="text"
          placeholder="Character name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Character data (traits, notes, etc.)"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
        <button onClick={handleAddCharacter}>Add Character</button>
      </div>
      <ul className="character-items">
        {characterList.map((char, idx) => (
          <li key={idx} className="character-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <strong>{char.name}</strong>
              <div className="character-data">{char.data}</div>
            </div>
            <button onClick={() => handleDeleteCharacter(idx)} style={{ color: '#b91c1c', background: '#fee2e2', border: 'none', borderRadius: 3, padding: '2px 8px', cursor: 'pointer', fontSize: '0.9em' }}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CharacterList;
