import React, { useState, useRef, useEffect } from 'react';

function isVideoUrl(url) {
  if (!url) return false;
  const videoExts = /\.(mp4|webm|mov|avi)(\?|$)/i;
  return videoExts.test(url);
}

function isVideoFile(file) {
  if (!file) return false;
  return file.type?.startsWith('video/');
}

export default function CreatePostModal({ isOpen, onClose, onSubmit, editingPost = null, submitting = false }) {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaIsVideo, setMediaIsVideo] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingPost) {
        setContent(editingPost.content || '');
        setMediaPreview(editingPost.image_url || null);
        setMediaIsVideo(isVideoUrl(editingPost.image_url));
        setMediaFile(null);
        setRemoveImage(false);
      } else {
        setContent('');
        setMediaFile(null);
        setMediaPreview(null);
        setMediaIsVideo(false);
        setRemoveImage(false);
      }
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, editingPost]);

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('File must be under 50MB');
      return;
    }
    setMediaFile(file);
    setMediaIsVideo(isVideoFile(file));
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaIsVideo(false);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!content.trim() || submitting) return;
    const formData = new FormData();
    formData.append('content', content.trim());
    if (mediaFile) {
      formData.append('image', mediaFile);
    }
    if (editingPost && removeImage) {
      formData.append('removeImage', 'true');
    }
    onSubmit(formData, editingPost?.id);
  };

  const charCount = content.length;
  const charClass = charCount > 1900 ? 'danger' : charCount > 1600 ? 'warning' : '';

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingPost ? 'Edit Post' : 'Create Post'}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <textarea
            ref={textareaRef}
            className="modal-textarea"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 2000))}
            maxLength={2000}
          />
          <div className={`modal-char-count ${charClass}`}>
            {charCount}/2000
          </div>

          <div className="image-upload-area">
            {mediaPreview ? (
              <div className="image-preview-container">
                {mediaIsVideo ? (
                  <video src={mediaPreview} className="image-preview" controls muted style={{ maxHeight: 300 }} />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="image-preview" />
                )}
                <button className="image-remove-btn" onClick={handleRemoveMedia}>✕</button>
              </div>
            ) : (
              <button className="image-upload-btn" onClick={() => fileInputRef.current?.click()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Add Photo / Video
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo"
              style={{ display: 'none' }}
              onChange={handleMediaSelect}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-post"
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
          >
            {submitting ? 'Posting...' : editingPost ? 'Save Changes' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
