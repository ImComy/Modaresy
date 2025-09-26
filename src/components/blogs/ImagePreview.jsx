import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, File, Image, Play } from 'lucide-react';
import { getImageUrl } from './utils';

const MediaPreview = ({ files, onRemove }) => {
  const { t } = useTranslation();
  if (!files || files.length === 0) return null;

  const getFileType = (file) => {
    if (typeof file === 'object') {
      if (file.type?.startsWith('image/')) return 'image';
      if (file.type?.startsWith('video/')) return 'video';
      return 'file';
    }
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    
    if (imageExtensions.some(ext => file.toLowerCase().includes(ext))) return 'image';
    if (videoExtensions.some(ext => file.toLowerCase().includes(ext))) return 'video';
    return 'file';
  };

  const getFileName = (file) => {
    if (typeof file === 'object') return file.name;
    return file.split('/').pop() || 'File';
  };

  const getGridLayout = (count) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2'; // 2 columns, one image spans 2 rows
      case 4:
        return 'grid-cols-2';
      default:
        return 'grid-cols-2 sm:grid-cols-3';
    }
  };

  const getItemSpan = (index, total) => {
    if (total === 3 && index === 0) return 'row-span-2'; // First image takes 2 rows
    return '';
  };

  const renderMediaPreview = (file, index, total) => {
    const fileType = getFileType(file);
    const isImage = fileType === 'image';
    const isVideo = fileType === 'video';
    const spanClass = getItemSpan(index, total);

    return (
      <div
        key={index}
        className={`relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-300 transition-all duration-200 min-w-0 bg-muted ${spanClass}`}
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        {isImage || isVideo ? (
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
            <img
              src={typeof file === 'object' ? URL.createObjectURL(file) : getImageUrl(file)}
              alt={t('previewAlt', { index, defaultValue: `Preview ${index + 1}` })}
              className="w-full h-full object-cover"
            />
            {isVideo && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 rounded-full p-3">
                  <Play size={24} fill="currentColor" className="text-gray-800 ml-1" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <File size={40} className="text-gray-400 mb-2" />
            <span className="text-sm text-center font-medium text-gray-600 dark:text-gray-300 truncate w-full px-2">
              {getFileName(file)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'File'}
            </span>
          </div>
        )}
        
        {/* Remove button */}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 shadow-lg"
            style={{ color: 'white' }}
            aria-label={t('removeFile', 'Remove file')}
          >
            <X size={16} />
          </button>
        )}

        {/* File type badge */}
        <div className="absolute top-2 left-2 flex items-center space-x-1">
          {isVideo && (
            <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Play size={12} className="mr-1" />
              Video
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderSingleFile = (file, index) => {
    const fileType = getFileType(file);
    const isImage = fileType === 'image';
    const isVideo = fileType === 'video';

    return (
      <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all duration-300">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          {isImage || isVideo ? (
            <div className="max-h-96 overflow-hidden">
              <img
                src={typeof file === 'object' ? URL.createObjectURL(file) : getImageUrl(file)}
                alt={t('previewAlt', { index, defaultValue: `Preview ${index + 1}` })}
                className="w-full h-auto max-h-96 object-contain"
              />
              {isVideo && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white rounded-full p-4 shadow-2xl">
                    <Play size={32} fill="currentColor" className="text-gray-800 ml-1" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center">
              <File size={64} className="text-gray-400 mb-4" />
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
                {getFileName(file)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Document'}
              </span>
            </div>
          )}
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-4 right-4 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 shadow-xl"
            style={{ color: 'white' }}
            aria-label={t('removeFile', 'Remove file')}
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  };

  if (files.length === 1) {
    return <div className="mt-4">{renderSingleFile(files[0], 0)}</div>;
  }

  return (
    <div className={`mt-4 grid ${getGridLayout(files.length)} gap-3`}>
      {files.map((file, index) => renderMediaPreview(file, index, files.length))}
    </div>
  );
};

export default MediaPreview;