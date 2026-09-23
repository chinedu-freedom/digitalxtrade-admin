'use client';

import { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Palette,
  Highlighter,
  Eraser,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Type,
  ChevronDown
} from 'lucide-react';

const TEXT_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Crimson', hex: '#dc2626' },
  { name: 'Orange', hex: '#fe780b' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#5b5bf5' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Dark Slate', hex: '#0f172a' },
  { name: 'Gray', hex: '#64748b' },
  { name: 'White', hex: '#ffffff' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', hex: '#fef08a' },
  { name: 'Green', hex: '#bbf7d0' },
  { name: 'Blue', hex: '#bfdbfe' },
  { name: 'Pink', hex: '#fecdd3' },
  { name: 'Purple', hex: '#e9d5ff' },
  { name: 'Orange', hex: '#ffedd5' },
  { name: 'Dark Slate', hex: '#334155' },
];

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write content here...',
  minHeight = '200px',
  className = '',
}) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [activeStates, setActiveStates] = useState({});

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  const execCmd = (command, val = null) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    restoreSelection();

    try {
      document.execCommand('styleWithCSS', false, false);
    } catch (e) {
      // Ignore
    }

    if (command === 'foreColor') {
      document.execCommand('foreColor', false, val);
    } else if (command === 'hiliteColor' || command === 'backColor') {
      try {
        document.execCommand('backColor', false, val);
      } catch (e) {
        // Fallback
      }
      try {
        document.execCommand('hiliteColor', false, val);
      } catch (e) {
        // Fallback
      }
    } else {
      document.execCommand(command, false, val);
    }

    handleInput();
    saveSelection();
    checkActiveStates();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('outdent', false, null);
      } else {
        document.execCommand('indent', false, null);
      }
      handleInput();
      checkActiveStates();
    }
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const checkActiveStates = () => {
    saveSelection();
    try {
      setActiveStates({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch (e) {
      // Ignore selection errors
    }
  };

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm font-sans ${className}`}>
      {/* Rich Text Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1 text-slate-600 select-none">
        {/* Undo / Redo */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('undo')}
          title="Undo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('redo')}
          title="Redo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1"></div>

        {/* Text Style: Bold, Italic, Underline, Strikethrough */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('bold')}
          title="Bold"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.bold ? 'bg-indigo-100 text-[#5b5bf5] font-bold' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('italic')}
          title="Italic"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.italic ? 'bg-indigo-100 text-[#5b5bf5]' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('underline')}
          title="Underline"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.underline ? 'bg-indigo-100 text-[#5b5bf5]' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('strikeThrough')}
          title="Strikethrough"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.strike ? 'bg-indigo-100 text-[#5b5bf5]' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1"></div>

        {/* Headings */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('formatBlock', '<h1>')}
          title="Heading 1"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('formatBlock', '<h2>')}
          title="Heading 2"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('formatBlock', '<h3>')}
          title="Heading 3"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('formatBlock', '<p>')}
          title="Paragraph / Normal Text"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
        >
          <Type className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1"></div>

        {/* Text Alignment */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('justifyLeft')}
          title="Align Left"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.justifyLeft ? 'bg-indigo-100 text-[#5b5bf5]' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('justifyCenter')}
          title="Align Center"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.justifyCenter ? 'bg-indigo-100 text-[#5b5bf5]' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('justifyRight')}
          title="Align Right"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.justifyRight ? 'bg-indigo-100 text-[#5b5bf5]' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('justifyFull')}
          title="Justify"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.justifyFull ? 'bg-indigo-100 text-[#5b5bf5]' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('insertUnorderedList')}
          title="Bullet List"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.insertUnorderedList ? 'bg-indigo-100 text-[#5b5bf5]' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('insertOrderedList')}
          title="Numbered List"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeStates.insertOrderedList ? 'bg-indigo-100 text-[#5b5bf5]' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1"></div>

        {/* Text Color Picker Dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => {
              setShowTextColorPicker(!showTextColorPicker);
              setShowBgColorPicker(false);
            }}
            title="Text Color"
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold text-slate-500">Color</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showTextColorPicker && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg p-2.5 shadow-xl z-30 w-52 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Text Color</div>
              <div className="grid grid-cols-7 gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      execCmd('foreColor', c.hex);
                      setShowTextColorPicker(false);
                    }}
                    className="w-5 h-5 rounded border border-slate-200 hover:scale-125 transition-transform shadow-xs cursor-pointer"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-500">Custom Hex Color:</span>
                <input
                  type="color"
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    execCmd('foreColor', e.target.value);
                    setShowTextColorPicker(false);
                  }}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Highlight / Background Color Picker */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => {
              setShowBgColorPicker(!showBgColorPicker);
              setShowTextColorPicker(false);
            }}
            title="Background Highlight"
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold text-slate-500">Highlight</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBgColorPicker && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg p-2.5 shadow-xl z-30 w-52 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Highlight Color</div>
              <div className="grid grid-cols-4 gap-1.5">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      execCmd('hiliteColor', c.hex);
                      setShowBgColorPicker(false);
                    }}
                    className="w-full h-7 rounded border border-slate-200 hover:scale-105 transition-transform text-[10px] font-bold text-slate-800 flex items-center justify-center shadow-xs cursor-pointer"
                    style={{ backgroundColor: c.hex }}
                  >
                    Aa
                  </button>
                ))}
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  execCmd('hiliteColor', 'transparent');
                  setShowBgColorPicker(false);
                }}
                className="w-full text-center text-[10px] font-semibold text-red-500 hover:underline pt-1 cursor-pointer"
              >
                Clear Highlight
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-300 mx-1"></div>

        {/* Clear Formatting */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd('removeFormat')}
          title="Clear Formatting"
          className="p-1.5 hover:bg-slate-200 rounded text-red-500 transition-colors cursor-pointer"
        >
          <Eraser className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable Content Container */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={checkActiveStates}
        onMouseUp={checkActiveStates}
        onKeyDown={handleKeyDown}
        onFocus={saveSelection}
        onBlur={saveSelection}
        style={{ minHeight }}
        placeholder={placeholder}
        className="p-4 outline-none text-xs text-slate-800 leading-relaxed font-sans focus:ring-0 overflow-y-auto [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_li]:leading-relaxed"
      />
    </div>
  );
}
