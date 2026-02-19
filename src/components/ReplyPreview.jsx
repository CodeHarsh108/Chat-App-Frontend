import React from 'react';
import { MdClose, MdReply } from 'react-icons/md';
import { getFileUrl } from '../services/AttachmentServices';

const ReplyPreview = ({ parentMessage, onCancel }) => {
  if (!parentMessage) return null;

  const getPreviewContent = () => {
    if (parentMessage.hasAttachment) {
      if (parentMessage.attachmentType === 'image') {
        return (
          <div className="flex items-center gap-2">
            <img
              src={getFileUrl(parentMessage.attachmentUrl)}
              alt=""
              className="w-8 h-8 object-cover rounded"
            />
            <span className="text-white/50 text-sm truncate max-w-[150px]">
              {parentMessage.attachmentName}
            </span>
          </div>
        );
      }
      return (
        <span className="text-white/50 text-sm">
          📎 {parentMessage.attachmentName}
        </span>
      );
    }
    return (
      <span className="text-white/50 text-sm truncate max-w-[200px]">
        {parentMessage.content}
      </span>
    );
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-2 mb-2 flex items-center gap-2 border-l-4 border-[#FF9FFC]">
      <MdReply className="text-white/30" size={16} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#FF9FFC] font-medium">
            {parentMessage.sender}
          </span>
          <span className="text-white/30">replied to</span>
        </div>
        {getPreviewContent()}
      </div>
      <button
        onClick={onCancel}
        className="p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <MdClose size={16} className="text-white/50" />
      </button>
    </div>
  );
};

export default ReplyPreview;