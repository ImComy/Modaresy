import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Image as ImageIcon, Paperclip, X, File } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import InvisibleFileInput from './InvisibleFileInput';
import FilePreview from './ImagePreview.jsx'; // Renamed from ImagePreview
import { getDisplayName, getAvatarSrc, getInitials } from './utils';

const CreatePost = ({
  title,
  setTitle,
  content,
  setContent,
  selectedFiles,
  setSelectedFiles,
  submitting,
  handleCreate,
  handleRemoveImage,
  authState,
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!submitting && canPost) handleCreate(e);
    }
  };

  const handleClear = () => {
    setTitle('');
    setContent('');
    setSelectedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileSelect = (ev) => {
    const files = Array.from(ev.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const canPost = title.trim() || content.trim() || selectedFiles.length > 0;

  return (
    <div 
      className="w-full rounded-xl shadow-sm transition-all duration-200 p-4 sm:p-6 hover:shadow-md"
      style={{ 
        background: 'hsl(var(--card))', 
        border: '1px solid hsl(var(--border))',
      }}
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Avatar - Hidden on mobile if space is tight, or make it smaller */}
        <div className="flex-shrink-0 hidden sm:block">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            {getAvatarSrc(authState?.userData) ? (
              <AvatarImage 
                src={getAvatarSrc(authState?.userData)} 
                alt={getDisplayName(authState?.userData) || t('me', 'Me')} 
              />
            ) : (
              <AvatarFallback className="text-xs sm:text-sm">
                {getInitials(getDisplayName(authState?.userData) || t('me', 'Me'))}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="flex-1 space-y-3 sm:space-y-4 min-w-0"> {/* min-w-0 prevents flex overflow */}
          {/* Title Field */}
          <div className="transition-all duration-200">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('postTitlePlaceholder', 'Add a title...')}
              aria-label={t('postTitleAria', 'Post title')}
              className="w-full text-base sm:text-lg font-medium px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:outline-none transition-all duration-200"
              style={{
                background: 'hsl(var(--input))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--card-foreground))',
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Content Field */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('postContentPlaceholder', 'Share an update, resource, or tip for your students...')}
              rows={3}
              className="w-full resize-none rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none transition-all duration-200 text-sm sm:text-base"
              style={{
                background: 'hsl(var(--input))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--card-foreground))',
              }}
              onKeyDown={handleKeyDown}
            />
            
            {/* Character count */}
            {content.length > 0 && (
              <div 
                className="absolute bottom-2 right-2 text-xs opacity-50"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {content.length}/500
              </div>
            )}
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="transition-all duration-200">
              <FilePreview files={selectedFiles} onRemove={handleRemoveImage} />
            </div>
          )}

          {/* Action Bar - Stack on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <div className="flex items-center gap-1 justify-center sm:justify-start">
              {/* Image Upload Button */}
              <InvisibleFileInput
                ref={fileInputRef}
                label={t('photo', 'Photo')}
                Icon={ImageIcon}
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="p-2 rounded-lg hover:bg-opacity-10 transition-colors text-xs sm:text-sm"
                style={{ 
                  background: selectedFiles.length > 0 ? 'hsl(var(--primary))' : 'transparent',
                  color: selectedFiles.length > 0 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))'
                }}
              />
              
              {/* General Attachments Button */}
              <InvisibleFileInput
                ref={fileInputRef}
                label={t('attachment', 'Attachment')}
                Icon={Paperclip}
                accept="*"
                multiple
                onChange={handleFileSelect}
                className="p-2 rounded-lg hover:bg-opacity-10 transition-colors text-xs sm:text-sm"
                style={{
                  color: 'hsl(var(--muted-foreground))',
                }}
              />
              
              {/* Clear button - only show when there's content */}
              {(title || content || selectedFiles.length > 0) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
                  style={{
                    color: 'hsl(var(--muted-foreground))',
                  }}
                  title={t('clear', 'Clear all')}
                >
                  <X size={16} className="sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 justify-center sm:justify-end">
              {/* Cancel button - only show when there's content */}
              {(title || content || selectedFiles.length > 0) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 text-xs sm:text-sm"
                  style={{
                    border: '1px solid hsl(var(--border))',
                    background: 'transparent',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                >
                  {t('cancel', 'Cancel')}
                </button>
              )}

              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting || !canPost}
                className="px-4 sm:px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-95 hover:shadow-lg text-xs sm:text-sm"
                style={{
                  background: submitting 
                    ? 'hsl(var(--muted))' 
                    : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
                  color: 'hsl(var(--primary-foreground))',
                  border: 'none',
                  boxShadow: submitting ? 'none' : '0 2px 8px rgba(2,6,23,0.1)',
                }}
                aria-disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('posting', 'Posting...')}
                  </>
                ) : (
                  <>
                    {t('post', 'Post')}
                    <Send size={14} className="sm:w-4 sm:h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;