import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Blockquote from '@tiptap/extension-blockquote';
import TextAlign from '@tiptap/extension-text-align';

function MenuBar({ editor }) {
  if (!editor) return null;
  const [showAlign, setShowAlign] = React.useState(false);

  React.useEffect(() => {
    if (!showAlign) return;
    const handleClickOutside = (e) => {
      const dropdown = document.querySelector('.align-dropdown-wrapper');
      if (dropdown && !dropdown.contains(e.target)) {
        setShowAlign(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAlign]);

  const handleAlignClick = () => setShowAlign((v) => !v);
  const handleAlignOption = (align) => {
    editor.chain().focus().setTextAlign(align).run();
    setShowAlign(false);
  };

  return (
    <div className="pm-toolbar-container">
      <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()}><b>B</b></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()}><i>I</i></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()}><u>U</u></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><span style={{fontWeight:'bold'}}>H1</span></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><span style={{fontWeight:'bold'}}>H2</span></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><span style={{fontWeight:'bold'}}>H3</span></button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
      <button onClick={() => editor.chain().focus().undo().run()}>↺ Undo</button>
      <button onClick={() => editor.chain().focus().redo().run()}>↻ Redo</button>
      <div
        className="align-dropdown-wrapper"
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <button onClick={handleAlignClick}>☰ Justify</button>
        {showAlign && (
          <div className="align-dropdown" style={{ position: 'absolute', top: '110%', left: 0, background: '#fff', border: '1px solid #d1d5db', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', zIndex: 100, minWidth: '120px', padding: '0.3rem' }}>
            <button style={{ width: '100%', textAlign: 'left' }} onClick={() => handleAlignOption('left')}>⯇ Left</button>
            <button style={{ width: '100%', textAlign: 'left' }} onClick={() => handleAlignOption('center')}>≡ Center</button>
            <button style={{ width: '100%', textAlign: 'left' }} onClick={() => handleAlignOption('right')}>⯈ Right</button>
          </div>
        )}
      </div>
    </div>
  );
}


function TiptapBookEditor({ editor: externalEditor, onEditorReady }) {
  const internalEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Blockquote,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '<p style="text-align:left;">Start writing your book...</p>',
  });
  const editor = externalEditor || internalEditor;

  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Custom Tab key handler to insert 5 spaces
  React.useEffect(() => {
    if (!editor) return;
    const handleTab = event => {
      if (event.key === 'Tab') {
        event.preventDefault();
        editor.chain().focus().insertContent('     ').run();
      }
    };
    const el = document.querySelector('.tiptap');
    if (el) {
      el.addEventListener('keydown', handleTab);
    }
    return () => {
      if (el) {
        el.removeEventListener('keydown', handleTab);
      }
    };
  }, [editor]);

  return (
    <div className="prosemirror-book-editor">
      <MenuBar editor={editor} />
      <div className="prosemirror-editor-area">
        <EditorContent editor={editor} className="tiptap" />
      </div>
    </div>
  );
}

export default TiptapBookEditor;
