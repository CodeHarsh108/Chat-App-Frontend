import { httpClient } from "../config/AxiosHelper";

export const addReactionApi = async (messageId, roomId, emoji) => {
  try {
    const response = await httpClient.post('/api/v1/reactions/add', {
      messageId,
      roomId,
      emoji
    });
    return response.data;
  } catch (error) {
    console.error('Add reaction error:', error);
    throw error;
  }
};

export const removeReactionApi = async (messageId, roomId, emoji) => {
  try {
    const response = await httpClient.post('/api/v1/reactions/remove', {
      messageId,
      roomId,
      emoji
    });
    return response.data;
  } catch (error) {
    console.error('Remove reaction error:', error);
    throw error;
  }
};

export const getMessageReactionsApi = async (messageId) => {
  try {
    const response = await httpClient.get(`/api/v1/messages/${messageId}/reactions`);
    return response.data;
  } catch (error) {
    console.error('Get reactions error:', error);
    throw error;
  }
};

export const getUserReactionApi = async (messageId) => {
  try {
    const response = await httpClient.get(`/api/v1/messages/${messageId}/reactions/user`);
    return response.data;
  } catch (error) {
    console.error('Get user reaction error:', error);
    return { reaction: null };
  }
};