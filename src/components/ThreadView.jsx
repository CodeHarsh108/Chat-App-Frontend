import React, { useEffect, useRef, useState } from 'react';
import { MdClose, MdReply } from 'react-icons/md';
import { getThreadRepliesApi } from '../services/ThreadServices';
import { timeAgo } from '../config/AxiosHelper';
import useChatContext from '../context/ChatContext';

const ThreadView = ({ parentMessage, roomId, onClose, currentUser }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyInput, setReplyInput] = useState('');
  const threadRef = useRef(null);
  const { stompClient } = useChatContext();

  useEffect(() => {
    loadReplies();
  }, [parentMessage?.id]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [replies]);

  const loadReplies = async () => {
    try {
      setLoading(true);
      const data = await getThreadRepliesApi(parentMessage.id);
      setReplies(data);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = () => {
    if (!replyInput.trim() || !stompClient) return;

    stompClient.send(`/app/reply/${roomId}`, {}, JSON.stringify({
      parentMessageId: parentMessage.id,
      content: replyInput
    }));

    setReplyInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col border border-white/10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-white/90 font-semibold flex items-center gap-2">
            <MdReply className="text-[#FF9FFC]" />
            Thread
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <MdClose size={20} className="text-white/50" />
          </button>
        </div>

        {/* Parent Message */}
        <div className="p-4 bg-white/5 border-b border-white/10">
          <div className="text-sm text-white/50 mb-1">{parentMessage.sender}</div>
          <div className="text-white/90">{parentMessage.content}</div>
          <div className="text-xs text-white/30 mt-2">
            {timeAgo(parentMessage.timestamp)}
          </div>
        </div>

        {/* Replies */}
        <div ref={threadRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-white/30">Loading replies...</div>
          ) : replies.length === 0 ? (
            <div className="text-center text-white/30">No replies yet</div>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="pl-4 border-l-2 border-white/10">
                <div className="text-sm text-white/50 mb-1">{reply.sender}</div>
                <div className="text-white/90">{reply.content}</div>
                <div className="text-xs text-white/30 mt-1">
                  {timeAgo(reply.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendReply()}
              placeholder="Write a reply..."
              className="flex-1 bg-white/5 px-4 py-2 rounded-lg text-white/90 placeholder-white/30 focus:outline-none border border-white/10 focus:border-[#FF9FFC] transition-colors"
            />
            <button
              onClick={sendReply}
              disabled={!replyInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadView;