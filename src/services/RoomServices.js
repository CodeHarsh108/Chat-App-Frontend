import { httpClient } from "../config/AxiosHelper";

export const createRoomApi = async (roomId) => {
  try {
    const response = await httpClient.post(`/api/v1/rooms`, { roomId });
    return response.data;
  } catch (error) {
    console.error('Create room error:', error.response?.data || error.message);
    throw error;
  }
};

export const joinChatApi = async (roomId) => {
  try {
    const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('Join room error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMessagesApi = async (roomId, size = 50, page = 0) => {
  try {
    const response = await httpClient.get(
      `/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
};

export const checkRoomExistsApi = async (roomId) => {
  try {
    const response = await httpClient.get(`/api/v1/rooms/${roomId}/exists`);
    return response.data;
  } catch (error) {
    console.error('Check room exists error:', error);
    return false;
  }
};