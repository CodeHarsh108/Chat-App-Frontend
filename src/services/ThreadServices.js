import { httpClient } from "../config/AxiosHelper";

export const replyToMessageApi = async (parentMessageId, roomId, content) => {
  try {
    const response = await httpClient.post('/api/v1/threads/reply', {
      parentMessageId,
      roomId,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Reply error:', error);
    throw error;
  }
};

export const getThreadRepliesApi = async (parentMessageId, page = 0, size = 50) => {
  try {
    const response = await httpClient.get(
      `/api/v1/messages/${parentMessageId}/replies?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error('Get thread replies error:', error);
    throw error;
  }
};

export const getThreadInfoApi = async (messageId) => {
  try {
    const response = await httpClient.get(`/api/v1/messages/${messageId}/thread`);
    return response.data;
  } catch (error) {
    console.error('Get thread info error:', error);
    throw error;
  }
};

export const deleteReplyApi = async (replyId) => {
  try {
    const response = await httpClient.delete(`/api/v1/messages/${replyId}`);
    return response.data;
  } catch (error) {
    console.error('Delete reply error:', error);
    throw error;
  }
};