import React, { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, BookOpen, Zap, Paperclip, Image, File, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RawButton } from "@/components/ui/RawButton";
import { EDUCATION_COMBOS, SUBJECTS, GRADES } from "@/data/mockCommunity";
import { debounce } from "lodash";

// Create a separate component for attachment items to optimize rendering
const AttachmentItem = ({ file, index, removeAttachment }) => {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group border rounded-md p-2 flex flex-col items-center bg-muted/50 shadow-sm"
    >
      <button
        type="button"
        onClick={() => removeAttachment(index)}
        className="absolute -top-2 -right-2 bg-background rounded-full p-0.5 shadow-sm z-10 hover:bg-red-50 transition-colors"
      >
        <XCircle size={16} className="text-muted-foreground hover:text-destructive" />
      </button>
      
      {file.type.startsWith('image/') ? (
        <div className="w-16 h-16 overflow-hidden rounded-md flex items-center justify-center bg-muted">
          <img 
            src={previewUrl} 
            alt={file.name} 
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="w-16 h-16 flex flex-col items-center justify-center bg-muted rounded-md">
          <File size={24} className="mb-1 text-primary" />
        </div>
      )}
      
      <span className="text-xs mt-1 truncate max-w-[80px] text-center">
        {file.name}
      </span>
    </motion.div>
  );
};

// Memoize the main component to prevent unnecessary re-renders
export const AddPost = React.memo(({ 
  newPostText, 
  setNewPostText, 
  educationCombo, 
  setEducationCombo, 
  subject, 
  setSubject, 
  grade, 
  setGrade, 
  composerTemplate, 
  applyTemplate, 
  createPost,
  attachments,
  setAttachments,
  removeAttachment 
}) => {
  const fileInputRef = useRef(null);
  const [localText, setLocalText] = useState(newPostText);
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounce the text update to improve performance
  const debouncedSetNewPostText = useCallback(
    debounce((text) => {
      setNewPostText(text);
    }, 150),
    [setNewPostText]
  );

  const handleTextChange = (e) => {
    const text = e.target.value;
    setLocalText(text);
    debouncedSetNewPostText(text);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isDocument = file.type.startsWith('application/') || 
                         file.type === 'text/plain' || 
                         file.type === 'application/pdf';
      return isImage || isDocument;
    });
    
    setAttachments([...attachments, ...validFiles]);
    e.target.value = null;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Prevent the component from closing when selecting dropdown options
  const handleSelectChange = (setter) => (value) => {
    setter(value);
  };

  const handleDropdownTrigger = (e) => {
    e.stopPropagation();
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCreatePost = (role) => {
    createPost(role);
    setIsExpanded(false);
    setLocalText("");
  };

  const isFormValid = useMemo(() => {
    return newPostText.trim().length > 0;
  }, [newPostText]);

  return (
    <Card className="p-5 mb-6 rounded-xl border bg-card backdrop-blur-sm shadow-sm transition-all duration-300 composer-container border-border">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Avatar className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm">
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <Textarea 
            rows={isExpanded ? 4 : 2} 
            value={localText}
            onChange={handleTextChange}
            onFocus={handleFocus}
            placeholder="Start a discussion, ask for help, or share a resource..." 
            className="min-h-[80px] resize-none border-border focus:border-primary transition-colors" 
          />

          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Attachments Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Attachments</span>
                  <RawButton
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={triggerFileInput}
                    className="rounded-full text-xs gap-1"
                  >
                    <Paperclip size={14} /> Add Files
                  </RawButton>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
                
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2 pr-2">
                    {attachments.map((file, index) => (
                      <AttachmentItem 
                        key={`${file.name}-${index}`}
                        file={file}
                        index={index}
                        removeAttachment={removeAttachment}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select 
                  value={educationCombo} 
                  onValueChange={handleSelectChange(setEducationCombo)}
                >
                  <SelectTrigger 
                    className="w-full" 
                    onClick={handleDropdownTrigger}
                  >
                    <SelectValue placeholder="Education System" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_COMBOS.map((combo) => (
                      <SelectItem key={combo} value={combo}>
                        {combo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={subject} 
                  onValueChange={handleSelectChange(setSubject)}
                >
                  <SelectTrigger 
                    className="w-full" 
                    onClick={handleDropdownTrigger}
                  >
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subj) => (
                      <SelectItem key={subj} value={subj}>
                        {subj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={grade} 
                  onValueChange={handleSelectChange(setGrade)}
                >
                  <SelectTrigger 
                    className="w-full" 
                    onClick={handleDropdownTrigger}
                  >
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grd) => (
                      <SelectItem key={grd} value={grd}>
                        {grd}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <RawButton 
                  type="button"
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleCreatePost('student')} 
                  className="rounded-full"
                  disabled={!isFormValid}
                >
                  Post as Student
                </RawButton>
                <RawButton 
                  type="button"
                  size="sm" 
                  onClick={() => handleCreatePost('tutor')} 
                  className="rounded-full bg-gradient-to-r from-primary to-primary/80"
                  disabled={!isFormValid}
                >
                  Post as Tutor
                </RawButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
});