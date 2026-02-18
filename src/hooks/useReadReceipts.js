import { useEffect, useRef, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import { getAuthToken } from '../services/AuthServices';

export const useReadReceipts = (stompClient, roomId, currentUser, messages, chatBoxRef) => {
  const processedMessagesRef = useRef(new Set());
  const visibleMessagesRef = useRef(new Set());

  // Mark message as delivered when received
  const markAsDelivered = useCallback((messageId) => {
    if (!stompClient || !roomId || !currentUser) return;
    
    stompClient.send(`/app/delivered/${roomId}`, {}, JSON.stringify({
      messageId: messageId
    }));
  }, [stompClient, roomId, currentUser]);

  // Mark message as read when visible
  const markAsRead = useCallback((messageId) => {
    if (!stompClient || !roomId || !currentUser) return;
    
    stompClient.send(`/app/read/${roomId}`, {}, JSON.stringify({
      messageId: messageId
    }));
  }, [stompClient, roomId, currentUser]);

  // Handle incoming read receipts
  useEffect(() => {
    if (!stompClient || !roomId) return;

    const subscription = stompClient.subscribe(`/topic/room/${roomId}/receipts`, (receipt) => {
      const data = JSON.parse(receipt.body);
      console.log('Read receipt received:', data);
      
      // You can update UI here if needed
      // For now, we'll just log it
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [stompClient, roomId]);

  // Auto-mark messages as delivered when they appear
  useEffect(() => {
    messages.forEach(message => {
      // Don't mark own messages
      if (message.sender === currentUser) return;
      
      const messageId = message.id;
      if (!processedMessagesRef.current.has(messageId)) {
        processedMessagesRef.current.add(messageId);
        markAsDelivered(messageId);
      }
    });
  }, [messages, currentUser, markAsDelivered]);

  // Intersection Observer for marking messages as read
  useEffect(() => {
    if (!chatBoxRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            const sender = entry.target.dataset.sender;
            
            // Don't mark own messages as read
            if (sender === currentUser) return;
            
            if (messageId && !visibleMessagesRef.current.has(messageId)) {
              visibleMessagesRef.current.add(messageId);
              markAsRead(messageId);
            }
          }
        });
      },
      {
        threshold: 0.5, // Mark as read when 50% visible
        rootMargin: '0px'
      }
    );

    // Observe all message elements
    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [messages, currentUser, markAsRead, chatBoxRef]);

  // Get status icon for a message
  const getStatusIcon = (message) => {
    if (message.sender !== currentUser) return null;
    
    switch (message.status) {
      case 'SENT':
        return '✓';
      case 'DELIVERED':
        return '✓✓';
      case 'READ':
        return '✓✓✓';
      default:
        return '✓';
    }
  };

  // Get status color
  const getStatusColor = (message) => {
    if (message.sender !== currentUser) return '';
    
    switch (message.status) {
      case 'READ':
        return 'text-blue-400';
      case 'DELIVERED':
        return 'text-green-400';
      case 'SENT':
        return 'text-white/50';
      default:
        return 'text-white/50';
    }
  };

  return {
    getStatusIcon,
    getStatusColor,
    markAsDelivered,
    markAsRead
  };
};