import React, { useState, useRef, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const EMOJIS = [
  '👍', '❤️', '😂', '😮', '😢', '😡',
  '🎉', '🔥', '✨', '⭐', '👏', '🙏',
  '🤔', '👀', '💯', '✅', '❌', '💔'
];

const ReactionPicker = ({ onSelect, onClose, position = 'top' }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className={`absolute z-50 bg-gray-800 rounded-xl p-3 shadow-2xl border border-white/10 ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      }`}
      style={{ minWidth: '240px' }}
    >
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-white/50 text-xs">Add Reaction</span>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/50 transition-colors"
        >
          <MdClose size={14} />
        </button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="w-9 h-9 hover:bg-white/10 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionPicker;