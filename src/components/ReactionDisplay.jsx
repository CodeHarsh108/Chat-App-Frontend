import React from 'react';
import { MdAddReaction } from 'react-icons/md';

const ReactionsDisplay = ({ reactions = {}, counts = {}, userReaction, onReact, currentUser }) => {
  const reactionList = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (reactionList.length === 0) {
    return (
      <button
        onClick={() => onReact(null)}
        className="text-white/30 hover:text-white/50 transition-colors"
        title="Add reaction"
      >
        <MdAddReaction size={16} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {reactionList.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 transition-all ${
            userReaction === emoji
              ? 'bg-[#5227FF]/20 border border-[#5227FF]'
              : 'bg-white/5 hover:bg-white/10 border border-white/10'
          }`}
          title={`${reactions[emoji]?.length || 0} people reacted with ${emoji}`}
        >
          <span>{emoji}</span>
          <span className={`text-xs ${userReaction === emoji ? 'text-[#FF9FFC]' : 'text-white/50'}`}>
            {count}
          </span>
        </button>
      ))}
      
      <button
        onClick={() => onReact(null)}
        className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        title="Add reaction"
      >
        <MdAddReaction size={14} className="text-white/50" />
      </button>
    </div>
  );
};

export default ReactionsDisplay;