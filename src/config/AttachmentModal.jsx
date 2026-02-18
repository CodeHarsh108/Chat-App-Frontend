import React, { useState, useRef, useEffect } from 'react';
import { MdClose, MdAttachFile, MdImage, MdVideoLibrary, MdAudiotrack, MdDescription, MdInsertDriveFile } from 'react-icons/md';
import { uploadFileApi, formatFileSize } from '../services/AttachmentServices';

const AttachmentModal = ({ isOpen, onClose, onAttachmentSelect, roomId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal closes
      setSelectedFile(null);
      setPreview(null);
      setUploading(false);
      setUploadProgress(0);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
    }
  }, [isOpen]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setPreview(videoUrl);
    } else if (file.type.startsWith('audio/')) {
      // For audio, we don't need preview
      setPreview(null);
    } else {
      // For documents, set icon based on type
      setPreview(null);
    }
  };

 const handleUpload = async () => {
  if (!selectedFile) return;

  setUploading(true);
  setUploadProgress(0);
  setError(null);

  try {
    const response = await uploadFileApi(
      selectedFile, 
      roomId, 
      (progress) => setUploadProgress(progress)
    );

    onAttachmentSelect(response); // This contains attachmentId, fileName, fileUrl, etc.
    
    // Reset modal
    setSelectedFile(null);
    setPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Don't close here - let parent handle closing
    
  } catch (error) {
    setError(error.response?.data?.error || 'Upload failed. Please try again.');
  } finally {
    setUploading(false);
  }
};

  const handleCancel = () => {
    // Reset state and close
    setSelectedFile(null);
    setPreview(null);
    setUploading(false);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const getFileIcon = () => {
    if (!selectedFile) return <MdAttachFile size={40} className="text-white/50" />;
    
    if (selectedFile.type.startsWith('image/')) {
      return <MdImage size={40} className="text-blue-400" />;
    } else if (selectedFile.type.startsWith('video/')) {
      return <MdVideoLibrary size={40} className="text-purple-400" />;
    } else if (selectedFile.type.startsWith('audio/')) {
      return <MdAudiotrack size={40} className="text-green-400" />;
    } else if (selectedFile.type === 'application/pdf') {
      return <MdDescription size={40} className="text-red-400" />;
    } else {
      return <MdInsertDriveFile size={40} className="text-yellow-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md p-6 relative border border-white/10">
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-white/50 hover:text-white/90"
        >
          <MdClose size={24} />
        </button>

        <h2 className="text-xl font-semibold text-white/90 mb-4">Upload Attachment</h2>

        {/* File input */}
        <div
          onClick={() => !uploading && fileInputRef.current.click()}
          className={`border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-[#FF9FFC]/50 transition-all duration-200 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            disabled={uploading}
          />
          
          {preview && selectedFile?.type.startsWith('image/') ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
          ) : preview && selectedFile?.type.startsWith('video/') ? (
            <video src={preview} controls className="max-h-48 mx-auto rounded-lg" />
          ) : (
            <div className="flex flex-col items-center gap-3">
              {getFileIcon()}
              <p className="text-white/70">
                {selectedFile ? selectedFile.name : 'Click to select a file'}
              </p>
              {selectedFile && (
                <p className="text-white/50 text-sm">
                  {formatFileSize(selectedFile.size)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-white/70 text-sm mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white/90 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachmentModal;