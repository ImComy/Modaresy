// ...existing code...
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Paperclip, Send, Trash2, X, Edit3, MoreHorizontal, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { RawButton } from "@/components/ui/RawButton";
import { timeAgo, initialsFrom } from "./helpers";
import Heart from '@/components/ui/heart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// CommentsSection (with attachments & proper reply UI)
export function CommentsSection({ post, onAddComment, onToggleCommentLike, onAddReply, onEditComment, onDeleteComment, onEditReply, onDeleteReply, currentUser = null  }) {
  const [commentText, setCommentText] = useState("");
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [localLikes, setLocalLikes] = useState({}); // Track local like states for immediate UI feedback

  const [openReplyFor, setOpenReplyFor] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [replyAttachments, setReplyAttachments] = useState({});

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editTexts, setEditTexts] = useState({});
  const [editAttachments, setEditAttachments] = useState({});

  const commentFileRef = useRef(null);
  const replyFileRefs = useRef({});
  const editFileRefs = useRef({});

  // local copy of comments to show optimistic replies immediately
  const [localComments, setLocalComments] = useState(post.commentsList || []);

  // Sync local comments when server-driven post changes
  useEffect(() => {
    setLocalComments(post.commentsList || []);
  }, [post.commentsList]);

  // Initialize local likes state from post data
  useEffect(() => {
    const initialLikes = {};
    
    // Process comments
    (post.commentsList || []).forEach(comment => {
      initialLikes[`comment-${comment.id}`] = {
        isLiked: comment.isLiked || false,
        count: comment.likes || 0
      };
      
      // Process replies
      (comment.replies || []).forEach(reply => {
        initialLikes[`reply-${reply.id}`] = {
          isLiked: reply.isLiked || false,
          count: reply.likes || 0
        };
      });
    });
    
    setLocalLikes(initialLikes);
  }, [post]);

  // Create objectURL previews for local files
  const makePreviews = (files) => {
    return files.map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name, type: f.type }));
  };

  useEffect(() => {
    // cleanup object URLs on unmount
    return () => {
      commentAttachments.forEach((f) => URL.revokeObjectURL(f.preview?.url || ""));
      Object.values(replyAttachments).flat().forEach((f) => URL.revokeObjectURL(f.preview?.url || ""));
      Object.values(editAttachments).flat().forEach((f) => URL.revokeObjectURL(f.preview?.url || ""));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommentFiles = (files) => {
    const list = Array.from(files).slice(0, 5);
    const withPreview = makePreviews(list).map((p) => ({ file: p.file, preview: p }));
    setCommentAttachments((s) => [...s, ...withPreview]);
  };

  const handleReplyFiles = (commentId, files) => {
    const list = Array.from(files).slice(0, 5);
    const withPreview = makePreviews(list).map((p) => ({ file: p.file, preview: p }));
    setReplyAttachments((r) => ({ ...r, [commentId]: [...(r[commentId] || []), ...withPreview] }));
  };

  const handleEditFiles = (commentId, files, isReply = false, replyId = null) => {
    const list = Array.from(files).slice(0, 5);
    const withPreview = makePreviews(list).map((p) => ({ file: p.file, preview: p }));
    
    if (isReply && replyId) {
      setEditAttachments((e) => ({ 
        ...e, 
        [`reply-${replyId}`]: [...((e[`reply-${replyId}`] || [])), ...withPreview] 
      }));
    } else {
      setEditAttachments((e) => ({ 
        ...e, 
        [commentId]: [...(e[commentId] || []), ...withPreview] 
      }));
    }
  };

  const removeCommentAttachment = (index) => {
    setCommentAttachments((s) => {
      const toRemove = s[index];
      if (toRemove?.preview?.url) URL.revokeObjectURL(toRemove.preview.url);
      return s.filter((_, i) => i !== index);
    });
  };

  const removeReplyAttachment = (commentId, index) => {
    setReplyAttachments((r) => {
      const arr = (r[commentId] || []).slice();
      const toRemove = arr[index];
      if (toRemove?.preview?.url) URL.revokeObjectURL(toRemove.preview.url);
      arr.splice(index, 1);
      return { ...r, [commentId]: arr };
    });
  };

  const removeEditAttachment = (commentId, index, isReply = false, replyId = null) => {
    setEditAttachments((e) => {
      const key = isReply && replyId ? `reply-${replyId}` : commentId;
      const arr = (e[key] || []).slice();
      const toRemove = arr[index];
      if (toRemove?.preview?.url) URL.revokeObjectURL(toRemove.preview.url);
      arr.splice(index, 1);
      return { ...e, [key]: arr };
    });
  };

  const handleCommentLike = (commentId, isReply = false, parentCommentId = null) => {
    const key = isReply ? `reply-${commentId}` : `comment-${commentId}`;
    const currentLikeState = localLikes[key] || { isLiked: false, count: 0 };
    
    // Optimistic UI update (toggle)
    setLocalLikes(prev => ({
      ...prev,
      [key]: {
        isLiked: !currentLikeState.isLiked,
        count: currentLikeState.count + (currentLikeState.isLiked ? -1 : 1)
      }
    }));
    
  // Inform parent to perform real toggle (pass new liked state)
  const newLiked = !currentLikeState.isLiked;
  onToggleCommentLike(post.id, commentId, newLiked, isReply, parentCommentId);
  };

  const handleReplyToggle = (commentId) => {
    setOpenReplyFor((prev) => (prev === commentId ? null : commentId));
  };

  const handleReplyChange = (commentId, text) => {
    setReplyTexts((r) => ({ ...r, [commentId]: text }));
  };

  const submitReply = (commentId) => {
    const text = (replyTexts[commentId] || "").trim();
    if (!text && (!(replyAttachments[commentId] || []).length)) return;

    const files = (replyAttachments[commentId] || []).map((p) => p.file);

    // Call parent handler (server)
    try {
      onAddReply(post.id, commentId, text, files);
    } catch (err) {
      // don't block optimistic UI if parent throws synchronously
      console.warn("onAddReply threw:", err);
    }

    // optimistic local reply so UI shows immediately
    const newReply = {
      id: `temp-${Date.now()}`,
      content: text,
      author: currentUser || { id: 'me', name: 'You' },
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      attachments: (replyAttachments[commentId] || []).map(p => ({
        url: p.preview.url,
        name: p.preview.name,
        mime: p.preview.type
      }))
    };

    setLocalComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return { ...c, replies: [...(c.replies || []), newReply] };
      }
      return c;
    }));

    // clear
    setReplyTexts((r) => ({ ...r, [commentId]: "" }));
    setReplyAttachments((r) => ({ ...r, [commentId]: [] }));
    setOpenReplyFor(null);
  };

  const submitComment = () => {
    const text = (commentText || "").trim();
    if (!text && commentAttachments.length === 0) return;

    const files = commentAttachments.map((p) => p.file);
    onAddComment(post.id, text, files);

    // clear
    commentAttachments.forEach((p) => p.preview && URL.revokeObjectURL(p.preview.url));
    setCommentAttachments([]);
    setCommentText("");
  };

  const startEdit = (comment, isReply = false, parentCommentId = null) => {
    if (isReply) {
      setEditingReplyId(comment.id);
      setEditTexts((e) => ({ ...e, [`reply-${comment.id}`]: comment.content }));
      
      // Initialize edit attachments with existing attachments
      if (comment.attachments && comment.attachments.length > 0) {
        const existingAttachments = comment.attachments.map(a => ({
          file: null, // We don't have the File object, just mark as existing
          preview: { url: a.url, name: a.name, type: a.mime },
          isExisting: true
        }));
        
        setEditAttachments((e) => ({ 
          ...e, 
          [`reply-${comment.id}`]: existingAttachments 
        }));
      }
    } else {
      setEditingCommentId(comment.id);
      setEditTexts((e) => ({ ...e, [comment.id]: comment.content }));
      
      // Initialize edit attachments with existing attachments
      if (comment.attachments && comment.attachments.length > 0) {
        const existingAttachments = comment.attachments.map(a => ({
          file: null, // We don't have the File object, just mark as existing
          preview: { url: a.url, name: a.name, type: a.mime },
          isExisting: true
        }));
        
        setEditAttachments((e) => ({ 
          ...e, 
          [comment.id]: existingAttachments 
        }));
      }
    }
  };

  const cancelEdit = (commentId, isReply = false) => {
    if (isReply) {
      setEditingReplyId(null);
      
      // Clean up any new attachment previews
      const editKey = `reply-${commentId}`;
      if (editAttachments[editKey]) {
        editAttachments[editKey].forEach(att => {
          if (!att.isExisting && att.preview?.url) {
            URL.revokeObjectURL(att.preview.url);
          }
        });
      }
      
      setEditAttachments((e) => {
        const newE = { ...e };
        delete newE[editKey];
        return newE;
      });
    } else {
      setEditingCommentId(null);
      
      // Clean up any new attachment previews
      if (editAttachments[commentId]) {
        editAttachments[commentId].forEach(att => {
          if (!att.isExisting && att.preview?.url) {
            URL.revokeObjectURL(att.preview.url);
          }
        });
      }
      
      setEditAttachments((e) => {
        const newE = { ...e };
        delete newE[commentId];
        return newE;
      });
    }
  };

  const submitEdit = (commentId, isReply = false, parentCommentId = null) => {
    const textKey = isReply ? `reply-${commentId}` : commentId;
    const text = (editTexts[textKey] || "").trim();
    const attachmentKey = isReply ? `reply-${commentId}` : commentId;
    const attachments = (editAttachments[attachmentKey] || []);
    
    if (!text && attachments.length === 0) return;

    // Separate new files from existing attachments
    const newFiles = attachments
      .filter(att => !att.isExisting && att.file)
      .map(att => att.file);
    
    const existingAttachments = attachments
      .filter(att => att.isExisting)
      .map(att => ({ 
        url: att.preview.url, 
        name: att.preview.name, 
        mime: att.preview.type 
      }));

    if (isReply) {
      onEditReply(post.id, parentCommentId, commentId, text, newFiles, existingAttachments);
    } else {
      onEditComment(post.id, commentId, text, newFiles, existingAttachments);
    }

    // Clean up and reset state
    cancelEdit(commentId, isReply);
  };

  const handleDelete = (commentId, isReply = false, parentCommentId = null) => {
    if (isReply) {
      onDeleteReply(post.id, parentCommentId, commentId);
    } else {
      onDeleteComment(post.id, commentId);
    }
  };

  // helper renderer for attachments (both saved ones from server and local previews)
  const AttachmentList = ({ attachments = [], localPreviews = [], onRemove, editable = false }) => {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {attachments.map((a, idx) => (
          <a 
            key={`srv-${idx}`} 
            href={a.url} 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs border px-2 py-1 rounded flex items-center gap-2 bg-background/50"
          >
            <Paperclip size={12} />
            <span className="truncate max-w-[120px]">{a.name}</span>
            {editable && onRemove && (
              <button 
                className="p-0.5 rounded-full hover:bg-muted" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(idx);
                }}
              >
                <X size={10} />
              </button>
            )}
          </a>
        ))}
        {localPreviews.map((p, idx) => (
          <div 
            key={`loc-${idx}`} 
            className="text-xs border px-2 py-1 rounded flex items-center gap-2 bg-background/50"
          >
            <Paperclip size={12} />
            <span className="truncate max-w-[120px]">{p.preview.name}</span>
            {editable && onRemove && (
              <button 
                className="p-0.5 rounded-full hover:bg-muted" 
                onClick={() => onRemove(idx)}
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  const EditComposer = ({ id, content, attachments = [], isReply = false, parentId = null, onSubmit, onCancel }) => {
    const textKey = isReply ? `reply-${id}` : id;
    const attachmentKey = isReply ? `reply-${id}` : id;
    const currentAttachments = editAttachments[attachmentKey] || [];
    
    return (
      <div className="mt-2 space-y-2">
        <Textarea 
          rows={3}
          value={editTexts[textKey] || content}
          onChange={(evt) => setEditTexts(prev => ({ ...prev, [textKey]: evt.target.value }))}
          className="w-full text-sm"
          autoFocus
        />
        
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center cursor-pointer p-1 rounded hover:bg-muted" title="Attach files">
            <input 
              ref={(el) => { 
                if (isReply) {
                  editFileRefs.current[`reply-${id}`] = el;
                } else {
                  editFileRefs.current[id] = el;
                }
              }} 
              type="file" 
              multiple 
              className="hidden" 
              onChange={(e) => handleEditFiles(id, e.target.files, isReply, parentId)} 
            />
            <Paperclip size={14} />
          </label>
          
          <div className="flex-1" />
          
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded-md border border-muted-foreground/30 hover:bg-muted"
          >
            Cancel
          </button>
          
          <button
            onClick={onSubmit}
            disabled={!editTexts[textKey]?.trim() && currentAttachments.length === 0}
            className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
        
        {currentAttachments.length > 0 && (
          <AttachmentList 
            attachments={currentAttachments.filter(a => a.isExisting).map(a => a.preview)}
            localPreviews={currentAttachments.filter(a => !a.isExisting)}
            onRemove={(index) => removeEditAttachment(id, index, isReply, parentId)}
            editable
          />
        )}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-border">
      <h4 className="font-medium text-foreground/90 mb-3 flex items-center gap-2">
        <MessageSquare size={16} />
        Comments ({localComments?.length || 0})
      </h4>

      <div className="space-y-4">
        {(localComments || []).map((c) => {
          const commentLikeKey = `comment-${c.id}`;
          const commentLikeData = localLikes[commentLikeKey] || { isLiked: c.isLiked || false, count: c.likes || 0 };
          
          return (
            <motion.div key={c.id} className="flex gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex-shrink-0">
                <Avatar className={`h-8 w-8 ${c.author.avatarColor || 'bg-muted'} text-white`}>
                  <AvatarFallback className="bg-transparent">{initialsFrom(c.author.name)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 bg-muted/30 p-3 rounded-2xl rounded-tl-none">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{c.author.name}</div>
                  <div className={`text-xs rounded-full px-2 py-0.5 ${c.author.role === "tutor" ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"}`}>
                    {c.author.role}
                  </div>
                  <div className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</div>
                  
                  {currentUser && c.author.id === currentUser.id && (
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-full hover:bg-muted/50">
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => startEdit(c)}>
                            <Edit3 size={14} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {editingCommentId === c.id ? (
                  <EditComposer 
                    id={c.id}
                    content={c.content}
                    attachments={c.attachments}
                    onSubmit={() => submitEdit(c.id)}
                    onCancel={() => cancelEdit(c.id)}
                  />
                ) : (
                  <>
                    <div className="mt-1 text-sm whitespace-pre-wrap">{c.content}</div>

                    {/* attachments saved on server (if any) */}
                    {(c.attachments && c.attachments.length) ? (
                      <AttachmentList attachments={c.attachments} />
                    ) : null}

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <button 
                        onClick={() => handleCommentLike(c.id)} 
                        aria-pressed={commentLikeData.isLiked}
                        className="flex items-center gap-1 pr-2 hover:text-foreground/80"
                      >
                        <Heart 
                          isLiked={commentLikeData.isLiked} 
                          size={16} 
                          ariaLabel="Like comment"
                        />
                        <span className="min-w-[1rem] text-center">{commentLikeData.count}</span>
                      </button>
                      <button 
                        className="px-2 py-1 hover:text-foreground/80" 
                        onClick={() => handleReplyToggle(c.id)}
                      >
                        Reply
                      </button>
                    </div>
                  </>
                )}

                {/* Replies (render server replies if present) */}
                {(c.replies || []).length > 0 && (
                  <div className="mt-3 space-y-2 pl-4 border-l border-muted/50">
                    {(c.replies || []).map((r) => {
                      const replyLikeKey = `reply-${r.id}`;
                      const replyLikeData = localLikes[replyLikeKey] || { isLiked: r.isLiked || false, count: r.likes || 0 };
                      
                      return (
                        <div key={r.id} className="flex gap-2">
                          <div className="flex-shrink-0">
                            <Avatar className="h-6 w-6 text-white bg-muted/70">
                              <AvatarFallback className="text-xs">{initialsFrom(r.author.name)}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="bg-muted/20 p-2 rounded-xl flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-semibold">{r.author.name}</div>
                              <div className="text-muted-foreground text-[11px]">· {timeAgo(r.createdAt)}</div>
                              
                              {currentUser && r.author.id === currentUser.id && (
                                <div className="ml-auto">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="p-0.5 rounded-full hover:bg-muted/50">
                                        <MoreHorizontal size={12} />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem onClick={() => startEdit(r, true, c.id)}>
                                        <Edit3 size={14} className="mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleDelete(r.id, true, c.id)}
                                      >
                                        <Trash2 size={14} className="mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>
                            
                            {editingReplyId === r.id ? (
                              <EditComposer 
                                id={r.id}
                                content={r.content}
                                attachments={r.attachments}
                                isReply={true}
                                parentId={c.id}
                                onSubmit={() => submitEdit(r.id, true, c.id)}
                                onCancel={() => cancelEdit(r.id, true)}
                              />
                            ) : (
                              <>
                                <div className="text-sm mt-1 whitespace-pre-wrap">{r.content}</div>
                                {(r.attachments && r.attachments.length) && <AttachmentList attachments={r.attachments} />}
                                
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <button 
                                    onClick={() => handleCommentLike(r.id, true, c.id)} 
                                    aria-pressed={replyLikeData.isLiked}
                                    className="flex items-center gap-1 hover:text-foreground/80"
                                  >
                                    <Heart 
                                      isLiked={replyLikeData.isLiked} 
                                      size={14} 
                                      ariaLabel="Like reply"
                                    />
                                    <span className="min-w-[1rem] text-center">{replyLikeData.count}</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply composer (inline) */}
                {openReplyFor === c.id && (
                  <div className="mt-3 flex gap-2 items-start">
                    <Avatar className="h-7 w-7 text-white bg-primary/80">
                      <AvatarFallback className="text-xs">YOU</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="relative">
                        <Textarea rows={1} value={replyTexts[c.id] || ""} onChange={(e) => handleReplyChange(c.id, e.target.value)} placeholder={`Reply to ${c.author.name}...`} className="pr-10 resize-none min-h-[40px] text-sm" />

                        <div className="absolute right-2 bottom-2 flex items-center gap-1 text-muted-foreground">
                          <label className="inline-flex items-center cursor-pointer p-1 rounded hover:bg-muted" title="Attach files">
                            <input ref={(el) => { replyFileRefs.current[c.id] = el; }} type="file" multiple className="hidden" onChange={(e) => handleReplyFiles(c.id, e.target.files)} />
                            <Paperclip size={14} />
                          </label>
                        </div>
                      </div>

                      {/* show local previews for this reply */}
                      {(replyAttachments[c.id] || []).length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          {(replyAttachments[c.id] || []).map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 border rounded px-2 py-1 text-xs bg-background/50">
                              <span className="truncate max-w-[120px]">{p.preview.name}</span>
                              <button className="p-1 hover:bg-muted rounded-full" onClick={() => removeReplyAttachment(c.id, idx)} title="Remove attachment"><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <RawButton size="sm" className="rounded-full h-10 w-10 p-0 flex-shrink-0" onClick={() => submitReply(c.id)} disabled={!((replyTexts[c.id] || "").trim() || (replyAttachments[c.id] || []).length)}>
                        <Send size={16} />
                      </RawButton>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* new comment composer */}
      <div className="mt-4 flex gap-2 items-start">
        <Avatar className="h-8 w-8 text-white bg-primary/80">
          <AvatarFallback className="text-xs">YOU</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="relative">
            <Textarea rows={1} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="pr-10 resize-none min-h-[40px] text-sm" />

            <div className="absolute right-2 bottom-2 flex items-center gap-1 text-muted-foreground">
              <label className="inline-flex items-center cursor-pointer p-1 rounded hover:bg-muted" title="Attach files">
                <input ref={commentFileRef} type="file" multiple className="hidden" onChange={(e) => handleCommentFiles(e.target.files)} />
                <Paperclip size={14} />
              </label>
            </div>
          </div>

          {/* local previews for comment */}
          {commentAttachments.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              {commentAttachments.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 border rounded px-2 py-1 text-xs bg-background/50">
                  <span className="truncate max-w-[120px]">{p.preview.name}</span>
                  <button className="p-1 hover:bg-muted rounded-full" onClick={() => removeCommentAttachment(idx)} title="Remove attachment"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <RawButton size="sm" className="rounded-full h-10 w-10 p-0 flex-shrink-0" onClick={submitComment} disabled={!commentText.trim() && commentAttachments.length === 0}>
          <Send size={16} />
        </RawButton>
      </div>
    </motion.div>
  );
}

export default CommentsSection;
// ...existing code...