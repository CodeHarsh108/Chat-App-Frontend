import { httpClient } from "../config/AxiosHelper";

export const uploadFileApi = async (file, roomId, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('roomId', roomId);

  try {
    const response = await httpClient.post('/api/v1/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
    
    console.log('Upload response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('File upload error:', error.response?.data || error.message);
    throw error;
  }
};

export const sendAttachmentMessageApi = async (attachmentId, roomId, content = '') => {
  try {
    const response = await httpClient.post('/api/v1/attachments/send', {
      attachmentId,
      roomId,
      content: content || '' // Ensure we send empty string if no content
    });
    console.log('Attachment message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Send attachment message error:', error);
    throw error;
  }
};


export const getFileUrl = (fileUrl) => {
  if (!fileUrl) return null;
  if (fileUrl.startsWith('http')) return fileUrl;
  // Make sure to use the full URL
  const fullUrl = `http://localhost:8080${fileUrl}`;
  console.log('Generated file URL:', fullUrl);
  return fullUrl;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};