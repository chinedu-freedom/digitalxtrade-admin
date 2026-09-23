'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

const SelectContext = createContext(null);

const extractTextFromReactNode = (node) => {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromReactNode).join('');
  if (React.isValidElement(node)) {
    if (node.props && node.props.children) {
      return extractTextFromReactNode(node.props.children);
    }
  }
  return '';
};

const findLabelInChildren = (node, targetValue) => {
  if (!node || targetValue === undefined || targetValue === null) return '';
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findLabelInChildren(child, targetValue);
      if (found) return found;
    }
    return '';
  }
  if (React.isValidElement(node)) {
    if (node.props && node.props.value !== undefined && String(node.props.value) === String(targetValue)) {
      if (node.props.children) {
        return extractTextFromReactNode(node.props.children);
      }
    }
    if (node.props && node.props.children) {
      return findLabelInChildren(node.props.children, targetValue);
    }
  }
  return '';
};

export function Select({ value, onValueChange, defaultValue, children }) {
  const [selectedValue, setSelectedValue] = useState(value !== undefined ? value : defaultValue || '');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const currentVal = value !== undefined ? value : selectedValue;
    const computedLabel = findLabelInChildren(children, currentVal);
    if (computedLabel) {
      setSelectedLabel(computedLabel);
    }
  }, [value, selectedValue, children]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue, labelText) => {
    setSelectedValue(newValue);
    if (labelText) setSelectedLabel(labelText);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ selectedValue, selectedLabel, setSelectedLabel, handleSelect, open, setOpen }}>
      <div ref={containerRef} className="relative inline-block w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = '', children }) {
  const { open, setOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`w-full flex items-center justify-between px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer select-none font-sans ${className}`}
    >
      {children}
      <ChevronDown className={`w-4 h-4 ml-2 text-slate-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder = 'Select...', className = '', children }) {
  const { selectedValue, selectedLabel } = useContext(SelectContext);
  return (
    <span className={`truncate text-slate-800 font-sans text-xs font-semibold ${className}`}>
      {children !== undefined ? children : (selectedLabel || selectedValue || <span className="text-slate-400 font-normal">{placeholder}</span>)}
    </span>
  );
}

export function SelectContent({ className = '', searchable = true, searchPlaceholder = 'Search...', children }) {
  const { open } = useContext(SelectContext);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [open]);

  if (!open) return null;

  const childrenArray = React.Children.toArray(children);
  const filteredChildren = childrenArray.filter((child) => {
    if (!searchQuery.trim()) return true;
    if (React.isValidElement(child)) {
      const text = child.props.children || child.props.value || '';
      return String(text).toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  return (
    <div className={`absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 font-sans text-slate-800 ${className}`}>
      {searchable && (
        <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg pl-8 pr-7 py-2 focus:outline-none focus:border-indigo-500 placeholder-slate-400 font-sans"
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="max-h-56 overflow-y-auto no-scrollbar py-1 divide-y divide-slate-100">
        {filteredChildren.length > 0 ? (
          filteredChildren
        ) : (
          <div className="px-4 py-3 text-xs text-slate-400 text-center font-sans">
            No matching items found
          </div>
        )}
      </div>
    </div>
  );
}

export function SelectItem({ value, children, className = '' }) {
  const { selectedValue, handleSelect, setSelectedLabel } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  const labelText = typeof children === 'string' ? children : String(children);

  useEffect(() => {
    if (isSelected && labelText) {
      setSelectedLabel(labelText);
    }
  }, [isSelected, labelText, setSelectedLabel]);

  return (
    <div
      onClick={() => handleSelect(value, labelText)}
      className={`px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between font-sans ${
        isSelected
          ? 'bg-[#5b5bf5] text-white font-bold'
          : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
      } ${className}`}
    >
      <span className="truncate">{children}</span>
      {isSelected && <Check className="w-4 h-4 text-white stroke-[3] shrink-0 ml-2" />}
    </div>
  );
}
