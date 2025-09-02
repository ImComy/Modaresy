import React, { useState, useEffect, useRef } from "react";
import { X, Download, FileText, Image, File, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RawButton } from "@/components/ui/RawButton";
import { createPortal } from 'react-dom';

export function PostAttachments({ attachments }) {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const modalRef = useRef(null);

  if (!attachments || attachments.length === 0) return null;

  const MAX_VISIBLE = 3;
  const visibleAttachments = attachments.slice(0, MAX_VISIBLE);
  const remainingCount = attachments.length - MAX_VISIBLE;

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image size={20} />;
    if (type.startsWith('video/')) return <Video size={20} />;
    if (type === 'application/pdf') return <FileText size={20} />;
    return <File size={20} />;
  };

  const openAttachment = (attachment) => {
    setSelectedAttachment(attachment);
    setShowFullScreen(true);
  };

  const closeFullScreen = () => {
    setShowFullScreen(false);
    setSelectedAttachment(null);
  };

  // Handle click outside of modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeFullScreen();
      }
    };

    if (showFullScreen) {
      document.addEventListener('mousedown', handleClickOutside);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const onKey = (e) => {
        if (e.key === 'Escape') closeFullScreen();
      };

      document.addEventListener('keydown', onKey);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prevOverflow || '';
      };
    }
  }, [showFullScreen]);

  // Determine grid layout based on number of attachments
  const getGridClass = () => {
    if (attachments.length === 1) return "grid-cols-1";
    if (attachments.length === 2) return "grid-cols-2";
    if (attachments.length === 3) return "grid-cols-2";
    return "grid-cols-2 sm:grid-cols-2";
  };

  // Determine aspect ratio based on number of attachments
  const getAspectClass = (index) => {
    if (attachments.length === 1) return "aspect-video";
    if (attachments.length === 2) return "aspect-square";
    if (attachments.length === 3 && index === 0) return "aspect-video row-span-2";
    return "aspect-square";
  };

  return (
    <>
      <div className={`mt-4 grid ${getGridClass()} gap-2`}>
        {visibleAttachments.map((attachment, index) => (
          <motion.div
            key={attachment.id || index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-lg overflow-hidden group cursor-pointer ${getAspectClass(index)}`}
            onClick={() => openAttachment(attachment)}
          >
            {attachment.type.startsWith('image/') ? (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center flex-col p-2">
                {getFileIcon(attachment.type)}
                <p className="text-xs mt-2 text-center truncate w-full">
                  {attachment.name}
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          </motion.div>
        ))}
        
        {remainingCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: MAX_VISIBLE * 0.1 }}
            className="aspect-square rounded-lg bg-muted flex items-center justify-center flex-col p-2 hover:bg-muted/80 transition-colors"
            onClick={() => setShowFullScreen(true)}
          >
            <span className="text-2xl font-bold">+{remainingCount}</span>
            <span className="text-xs mt-1">View all</span>
          </motion.button>
        )}
      </div>

      {typeof document !== 'undefined' && showFullScreen && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          >
            <div 
              ref={modalRef}
              className="w-full max-w-4xl max-h-[90vh] bg-background rounded-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 flex justify-between items-center bg-muted/50 border-b">
                <h3 className="font-semibold">Attachments</h3>
                <RawButton
                  className="text-foreground hover:bg-muted p-2 rounded-full"
                  onClick={closeFullScreen}
                >
                  <X size={24} />
                </RawButton>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {selectedAttachment ? (
                  <div className="flex items-center justify-center min-h-full">
                    {selectedAttachment.type.startsWith('image/') ? (
                      <img
                        src={selectedAttachment.url}
                        alt={selectedAttachment.name}
                        className="max-w-full max-h-[70vh] object-contain"
                      />
                    ) : (
                      <div className="bg-background rounded-lg p-6 text-center max-w-md mx-auto">
                        <div className="text-primary mb-4 mx-auto">
                          {getFileIcon(selectedAttachment.type)}
                        </div>
                        <h3 className="font-semibold mb-2">{selectedAttachment.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {selectedAttachment.type}
                        </p>
                        <a
                          href={selectedAttachment.url}
                          download
                          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                        >
                          <Download size={16} />
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {attachments.map((attachment, index) => (
                      <div
                        key={attachment.id || index}
                        className="bg-muted rounded-lg overflow-hidden cursor-pointer aspect-square"
                        onClick={() => openAttachment(attachment)}
                      >
                        {attachment.type.startsWith('image/') ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="p-4 flex items-center justify-center flex-col h-full">
                            {getFileIcon(attachment.type)}
                            <p className="text-sm mt-2 text-center truncate w-full">
                              {attachment.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}