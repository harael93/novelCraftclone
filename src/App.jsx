import { useState } from 'react';

import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NestedTodoList from './components/NestedTodoList.jsx';
import ProseMirrorBookEditor from './components/ProseMirrorBookEditor.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {
  const [count, setCount] = useState(0);
  return (
    <Router>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/dashboard">Go to Dashboard</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <h1>Welcome to NovelCraft</h1>
              <Link
                to="/dashboard"
                style={{ display: 'inline-block', marginTop: '2rem', background: '#2563eb', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.2rem', textDecoration: 'none', fontWeight: '500' }}
                // ...existing code...
              >
                Go to Dashboard
              </Link>
            </div>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/todo" element={<NestedTodoList />} />
        <Route path="/editor" element={<ProseMirrorBookEditor />} />
      </Routes>
    </Router>
  );
}
export default App;