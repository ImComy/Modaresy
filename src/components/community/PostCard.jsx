import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ban, MessageSquare, Share2, Clock, Bookmark, MoreVertical, ChevronDown, ChevronUp, BookOpen, GraduationCap, X, Eye, Edit3, Trash2, Link, BellOff, Flag, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { timeAgo, initialsFrom } from "./helpers";
import { RawButton } from "@/components/ui/RawButton";
import { TagPill } from "@/components/ui/TagPill";
import { CommentsSection } from "./CommentsSection";
import Heart from "@/components/ui/heart";
import {PostAttachments} from './PostAttachments';

export function PostCard({ post, onToggleLike, onAddComment, onToggleSave, onToggleCommentLike, onAddReply, onEdit, onDelete, onCopyLink, onMuteUser, currentUserId }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  const truncated = post.content.length > 200 && !expanded;
  const contentToShow = truncated ? post.content.slice(0, 200).trim() + "..." : post.content;
  const isAuthor = currentUserId === post.author.id;
  const isTutor = post.author.role === "tutor";

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onToggleLike(post.id, !isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onToggleSave(post.id, !isSaved);
    setShowOptions(false);
  };

  const handleCopyLink = () => {
    onCopyLink(post.id);
    setShowOptions(false);
  };

  const handleEdit = () => {
    onEdit(post.id);
    setShowOptions(false);
  };

  const handleDelete = () => {
    onDelete(post.id);
    setShowOptions(false);
  };

  const handleMuteUser = () => {
    onMuteUser(post.author.id);
    setShowOptions(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-5 mb-6 relative overflow-visible hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-card/50 backdrop-blur-sm rounded-tl-none">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full blur-xl opacity-20 pointer-events-none" style={{ background: post.author.avatarColor }} />
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary/30 to-transparent rounded-full" />

        <div className="flex gap-4 relative z-10">
          <div className="flex-shrink-0">
            <Avatar className={`h-12 w-12 ${post.author.avatarColor} text-white ${isTutor ? 'rounded-lg' : 'rounded-full'}`}>
              <AvatarFallback className={`bg-transparent ${isTutor ? 'rounded-lg' : 'rounded-full'}`}>
                {initialsFrom(post.author.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-foreground/90">{post.author.name}</div>
                  <div className="text-xs text-muted-foreground/80 ml-2 flex items-center gap-1" title={new Date(post.createdAt).toLocaleString()}>
                    <Clock size={12} /> <span>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
                {post.author.specialty && <div className="text-xs text-muted-foreground/70 mt-1">{post.author.specialty}</div>}
                {post.author.grade && <div className="text-xs text-muted-foreground/70 mt-1">{post.author.grade}</div>}
              </div>

              <div className="relative" ref={optionsRef}>
                <RawButton variant="ghost" size="lg" className="h-10 w-10 rounded-full hover:bg-muted/50" onClick={() => setShowOptions(!showOptions)}>
                  <MoreVertical size={20} />
                </RawButton>

                <AnimatePresence>
                  {showOptions && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }} 
                      transition={{ duration: 0.15 }} 
                      className="fixed right-4 top-12 bg-background rounded-lg shadow-lg border p-2 z-50 w-56"
                      style={{ transformOrigin: 'top right' }}
                    >
                      {/* Author-only options */}
                      {isAuthor && (
                        <>
                          <button 
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-md flex items-center gap-2"
                            onClick={handleEdit}
                          >
                            <Edit3 size={16} /> Edit Post
                          </button>
                          <button 
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-md text-destructive flex items-center gap-2"
                            onClick={handleDelete}
                          >
                            <Trash2 size={16} /> Delete Post
                          </button>
                          <div className="h-px bg-border my-1"></div>
                        </>
                      )}
                      
                      {/* General options */}
                      <button 
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-md flex items-center gap-2" 
                        onClick={handleSave}
                      >
                        <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} /> {isSaved ? "Unsave" : "Save"}
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-md flex items-center gap-2"
                        onClick={handleCopyLink}
                      >
                        <Link size={16} /> Copy Link
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-md flex items-center gap-2"
                      >
                        <Copy size={16} /> Copy Text
                      </button>
                      
                      {/* User management options */}
                      {!isAuthor && (
                        <>
                          <div className="h-px bg-border my-1"></div>
                          <button 
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-md flex items-center gap-2"
                            onClick={handleMuteUser}
                          >
                            <BellOff size={16} /> Mute {post.author.name}
                          </button>
                          <button 
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-md flex items-center gap-2"
                          >
                            <Ban size={16} /> Block {post.author.name}
                          </button>
                        </>
                      )}
                      
                      <div className="h-px bg-border my-1"></div>
                      <button 
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-md text-destructive flex items-center gap-2"
                      >
                        <Flag size={16} /> Report Post
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-4 -ml-10">
              <p className={`text-foreground/90 leading-relaxed break-words ${truncated ? "max-h-[6.5rem] overflow-hidden relative" : ""}`}>{contentToShow}</p>

              {truncated && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.03)] to-transparent" />
                  <button className="text-sm text-primary inline-flex items-center gap-1 hover:underline font-medium" onClick={() => setExpanded(true)}>
                    Read more <ChevronDown size={14} />
                  </button>
                </div>
              )}

              {expanded && (
                <div className="mt-2 flex items-center gap-2">
                  <button className="text-sm text-muted-foreground inline-flex items-center gap-1" onClick={() => setExpanded(false)}>
                    Show less <ChevronUp size={14} />
                  </button>
                </div>
              )}

              <PostAttachments attachments={post.attachments} />
            </div>

            <div className="mt-4 flex flex-wrap -ml-10">
              {post.tags.map((t) => (
                <TagPill key={t} tag={t} />
              ))}
            </div>

            {/* Action buttons with integrated stats */}
            <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-4 -ml-10">
              <button 
                onClick={handleLike} 
                className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 transition-colors ${isLiked ? 'text-primary hover:bg-primary/10' : 'hover:bg-muted/50'}`}
              >
                <Heart isLiked={isLiked} size={18} />
                <span className="font-medium hidden xs:inline">Like</span>
                {post.likes > 0 && <span className="font-medium text-sm">{post.likes} <span className="hidden md:inline">Likes</span></span>}
              </button>
              
              <button 
                onClick={() => setShowComments((s) => !s)} 
                className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 transition-colors ${showComments ? 'text-primary hover:bg-primary/10' : 'hover:bg-muted/50'}`}
              >
                <MessageSquare size={18} />
                <span className="font-medium hidden xs:inline">Comment</span>
                {post.comments > 0 && <span className="font-medium text-sm">{post.comments} <span className="hidden md:inline">Comments</span></span>}
              </button>
              
              <button className="flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 transition-colors hover:bg-muted/50">
                <Share2 size={18} />
                <span className="font-medium hidden xs:inline">Share</span>
              </button>
              
              <button 
                onClick={handleSave} 
                className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 transition-colors ${isSaved ? 'text-amber-500 hover:bg-amber-500/10' : 'hover:bg-muted/50'}`}
              >
                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                <span className="font-medium hidden xs:inline">Save</span>
                {post.saved > 0 && <span className="font-medium text-sm">{post.saved} <span className="hidden md:inline">Saves</span></span>}
              </button>
            </div>

            {showComments && (
              <CommentsSection post={post} onAddComment={onAddComment} onToggleCommentLike={onToggleCommentLike} onAddReply={onAddReply} />
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}