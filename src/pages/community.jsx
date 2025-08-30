import React, { useMemo, useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Heart,
  MessageSquare,
  Share2,
  Tag as TagIcon,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  PlusCircle,
  Paperclip,
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  Zap,
  Filter,
  Send,
  Bookmark,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

/* -------------------------
   Mock data (unchanged)
   ------------------------- */
const MOCK_POSTS = [
  {
    id: "p1",
    author: {
      id: "t1",
      name: "Mr. Ahmed",
      role: "tutor",
      avatarColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
      specialty: "Mathematics & Calculus",
      verified: true,
    },
    content:
      "How do I explain integration by parts to Thanaweya Amma students? I tried the textbook approach but many students get stuck when choosing u and dv. Any simple heuristics or examples that have worked for you?",
    tags: ["Thanaweya Amma", "Grade 12", "Scientific", "Calculus"],
    createdAt: "2025-08-29T10:00:00Z",
    likes: 12,
    comments: 4,
    saved: 8,
    views: 124,
    commentsList: [
      {
        id: "c1",
        author: {
          name: "Eng. Kareem",
          role: "tutor",
          avatarColor: "bg-gradient-to-r from-green-500 to-teal-600",
        },
        content: "Use the LIATE rule (Logarithmic, Inverse trigonometric, Algebraic, Trigonometric, Exponential) and show 3 quick examples with different function types.",
        createdAt: "2025-08-29T11:00:00Z",
        likes: 3,
      },
      {
        id: "c2",
        author: {
          name: "Mona",
          role: "student",
          avatarColor: "bg-gradient-to-r from-pink-500 to-rose-600",
        },
        content: "Drawing diagrams of substitutions helped me visualize the process much better!",
        createdAt: "2025-08-29T11:30:00Z",
        likes: 1,
      },
    ],
  },
  {
    id: "p2",
    author: {
      id: "s1",
      name: "Mona",
      role: "student",
      avatarColor: "bg-gradient-to-r from-pink-500 to-rose-600",
      grade: "Grade 10",
    },
    content: "Can someone share a simple summary for chapter 3 (IGCSE Biology)? I'm lost on osmosis and active transport.",
    tags: ["IGCSE", "Grade 10", "Biology"],
    createdAt: "2025-08-29T12:30:00Z",
    likes: 5,
    comments: 2,
    saved: 3,
    views: 78,
    commentsList: [
      {
        id: "c3",
        author: {
          name: "Mrs. Salma",
          role: "tutor",
          avatarColor: "bg-gradient-to-r from-purple-500 to-violet-600",
        },
        content: "I'll upload a short sheet tonight with diagrams comparing both processes. Check the resources section in 2 hours!",
        createdAt: "2025-08-29T13:00:00Z",
        likes: 2,
      },
    ],
  },
  {
    id: "p3",
    author: {
      id: "t2",
      name: "Eng. Kareem",
      role: "tutor",
      avatarColor: "bg-gradient-to-r from-green-500 to-teal-600",
      specialty: "Engineering Mathematics",
      verified: true,
    },
    content: "I'll host a free problem-solving session on linear algebra tomorrow evening. We'll go over eigenvalues, eigenvectors, and common exam traps. Open to all grades preparing for university.",
    tags: ["University Prep", "Linear Algebra", "All Grades"],
    createdAt: "2025-08-28T16:45:00Z",
    likes: 20,
    comments: 8,
    saved: 15,
    views: 210,
    commentsList: [
      {
        id: "c4",
        author: {
          name: "Hossam",
          role: "student",
          avatarColor: "bg-gradient-to-r from-amber-500 to-orange-600",
        },
        content: "Count me in! What platform will you be using?",
        createdAt: "2025-08-28T17:00:00Z",
        likes: 1,
      },
      {
        id: "c5",
        author: {
          name: "Eng. Ali",
          role: "tutor",
          avatarColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
        },
        content: "Can you record it for those who can't make it?",
        createdAt: "2025-08-28T17:05:00Z",
        likes: 4,
      },
    ],
  },
];

// Dropdown options
const EDUCATION_COMBOS = [
  "Thanaweya Amma - Scientific - Arabic",
  "Thanaweya Amma - Literary - Arabic",
  "Technical Secondary - Industrial - Arabic",
  "Technical Secondary - Agricultural - Arabic",
  "Technical Secondary - Commercial - Arabic",
  "Al-Azhar Secondary - Religious - Arabic",
  "IGCSE - International - English",
  "American Diploma - International - English",
  "International Baccalaureate - International - English",
  "French System - International - French",
  "German System - International - German",
  "Other - General - Bilingual",
];

const SUBJECTS = [
  "Mathematics",
  "Biology",
  "Physics",
  "Chemistry",
  "Arabic",
  "English",
  "French",
  "History",
  "Geography",
  "Calculus",
  "Linear Algebra",
  "Other",
];

const GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "University",
  "Other",
];

/* -------------------------
   Tag palette (unchanged)
   ------------------------- */
const TAG_STYLE = {
  "Thanaweya Amma": { bg: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))", color: "hsl(var(--primary))", border: "hsl(var(--primary) / 0.3)" },
  IGCSE: { bg: "linear-gradient(135deg, hsl(var(--secondary) / 0.15), hsl(var(--secondary) / 0.05))", color: "hsl(var(--secondary-foreground))", border: "hsl(var(--secondary) / 0.3)" },
  Biology: { bg: "linear-gradient(135deg, hsl(var(--accent) / 0.15), hsl(var(--accent) / 0.05))", color: "hsl(var(--accent-foreground))", border: "hsl(var(--accent) / 0.3)" },
  "Linear Algebra": { bg: "linear-gradient(135deg, hsl(var(--accent) / 0.15), hsl(var(--accent) / 0.05))", color: "hsl(var(--accent-foreground))", border: "hsl(var(--accent) / 0.3)" },
  "University Prep": { bg: "linear-gradient(135deg, hsl(var(--success) / 0.15), hsl(var(--success) / 0.05))", color: "hsl(var(--success-foreground))", border: "hsl(var(--success) / 0.3)" },
  Calculus: { bg: "linear-gradient(135deg, hsl(var(--secondary) / 0.15), hsl(var(--secondary) / 0.05))", color: "hsl(var(--secondary-foreground))", border: "hsl(var(--secondary) / 0.3)" },
  "Grade 12": { bg: "linear-gradient(135deg, hsl(var(--violet) / 0.15), hsl(var(--violet) / 0.05))", color: "hsl(var(--violet-foreground))", border: "hsl(var(--violet) / 0.3)" },
  "Grade 11": { bg: "linear-gradient(135deg, hsl(var(--violet) / 0.15), hsl(var(--violet) / 0.05))", color: "hsl(var(--violet-foreground))", border: "hsl(var(--violet) / 0.3)" },
  "Grade 10": { bg: "linear-gradient(135deg, hsl(var(--violet) / 0.15), hsl(var(--violet) / 0.05))", color: "hsl(var(--violet-foreground))", border: "hsl(var(--violet) / 0.3)" },
  Physics: { bg: "linear-gradient(135deg, hsl(var(--blue) / 0.15), hsl(var(--blue) / 0.05))", color: "hsl(var(--blue-foreground))", border: "hsl(var(--blue) / 0.3)" },
  Chemistry: { bg: "linear-gradient(135deg, hsl(var(--orange) / 0.15), hsl(var(--orange) / 0.05))", color: "hsl(var(--orange-foreground))", border: "hsl(var(--orange) / 0.3)" },
  default: { bg: "linear-gradient(135deg, hsl(var(--muted) / 0.15), hsl(var(--muted) / 0.05))", color: "hsl(var(--muted-foreground))", border: "hsl(var(--border) / 0.3)" },
};

/* -------------------------
   Helpers
   ------------------------- */
function timeAgo(iso) {
  const dt = new Date(iso);
  const diff = Date.now() - dt.getTime();
  const sec = Math.floor(diff / 1000);
  const mins = Math.floor(sec / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (sec < 60) return `${sec}s ago`;
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return dt.toLocaleDateString();
}

function initialsFrom(name) {
  return (name || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* -------------------------
   RawButton — simple, from-scratch button component (replaces your Button)
   - accepts className, variant (solid|ghost|outline), size (sm|lg), onClick
   ------------------------- */
function RawButton({ children, className = "", variant = "ghost", size = "md", onClick, disabled, type = "button", title }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium transition-shadow rounded-md focus:outline-none";
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-4 py-2 text-base h-14 w-14" : "px-3 py-2 text-sm";
  const variantClass =
    variant === "solid"
      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm"
      : variant === "outline"
      ? "border border-border bg-transparent"
      : "bg-transparent";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}

/* Tag pill component */
function TagPill({ tag, onClick, selected, closable, onClose }) {
  const s = TAG_STYLE[tag] || TAG_STYLE.default;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 mr-2 mb-2 rounded-full inline-flex items-center gap-1 transition-all duration-200 hover:scale-105 cursor-pointer ${selected ? 'ring-2 ring-offset-2' : ''}`}
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <TagIcon size={12} />
      <span>{tag}</span>
      {closable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="ml-1 rounded-full hover:bg-black/10 p-0.5"
        >
          <X size={12} />
        </button>
      )}
    </motion.div>
  );
}

/* Floating action button (uses RawButton) */
function FloatingActionButton({ onClick }) {
  return (
    <motion.div className="fixed bottom-6 right-6 z-10 lg:hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <RawButton onClick={onClick} size="lg" className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-primary to-primary/80">
        <PlusCircle size={24} />
      </RawButton>
    </motion.div>
  );
}

/* -------------------------
   PostCard — with comment like + reply implemented, no `Button` usage
   ------------------------- */
function PostCard({ post, onToggleLike, onAddComment, onToggleSave, onToggleCommentLike, onAddReply }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [openReplyFor, setOpenReplyFor] = useState(null); // comment id we are replying to
  const [replyTexts, setReplyTexts] = useState({});
  const optionsRef = useRef(null);

  const truncated = post.content.length > 200 && !expanded;
  const contentToShow = truncated ? post.content.slice(0, 200).trim() + "..." : post.content;

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
  };

  const handleCommentLike = (commentId) => {
    onToggleCommentLike(post.id, commentId);
  };

  const handleReplyToggle = (commentId) => {
    setOpenReplyFor((prev) => (prev === commentId ? null : commentId));
  };

  const handleReplyChange = (commentId, text) => {
    setReplyTexts((r) => ({ ...r, [commentId]: text }));
  };

  const submitReply = (commentId) => {
    const text = (replyTexts[commentId] || "").trim();
    if (!text) return;
    onAddReply(post.id, commentId, text);
    setReplyTexts((r) => ({ ...r, [commentId]: "" }));
    setOpenReplyFor(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-5 mb-6 relative overflow-hidden hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-card/50 backdrop-blur-sm">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full blur-xl opacity-20 pointer-events-none" style={{ background: post.author.avatarColor }} />
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary/30 to-transparent" />

        <div className="flex gap-4 relative z-10">
          <div className="flex-shrink-0">
            <Avatar className={`h-12 w-12 ${post.author.avatarColor} text-white`}>
              <AvatarFallback className="bg-transparent">{initialsFrom(post.author.name)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-foreground/90">{post.author.name}</div>
                  <div className={`text-xs rounded-full px-2.5 py-1 font-medium ${post.author.role === "tutor" ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"}`}>
                    {post.author.role === "tutor" ? (
                      <span className="flex items-center gap-1">
                        <GraduationCap size={12} /> Tutor
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <BookOpen size={12} /> Student
                      </span>
                    )}
                  </div>
                  {post.author.verified && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs py-0.5 px-1.5">
                      Verified
                    </Badge>
                  )}
                  <div className="text-xs text-muted-foreground/80 ml-2 flex items-center gap-1" title={new Date(post.createdAt).toLocaleString()}>
                    <Clock size={12} /> <span>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
                {post.author.specialty && <div className="text-xs text-muted-foreground/70 mt-1">{post.author.specialty}</div>}
                {post.author.grade && <div className="text-xs text-muted-foreground/70 mt-1">{post.author.grade}</div>}
              </div>

              <div className="relative" ref={optionsRef}>
                <RawButton variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setShowOptions(!showOptions)}>
                  <MoreVertical size={16} />
                </RawButton>

                <AnimatePresence>
                  {showOptions && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-10 bg-background rounded-lg shadow-lg border p-2 z-20 w-40">
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md flex items-center gap-2" onClick={handleSave}>
                        <Bookmark size={14} /> {isSaved ? "Unsave" : "Save"}
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md flex items-center gap-2">
                        <Share2 size={14} /> Share
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md text-destructive flex items-center gap-2">
                        <X size={14} /> Report
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-4">
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
            </div>

            <div className="mt-4 flex flex-wrap">
              {post.tags.map((t) => (
                <TagPill key={t} tag={t} />
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div>{post.likes} likes</div>
              <div>{post.comments} comments</div>
              <div>{post.views} views</div>
              <div>{post.saved} saves</div>
            </div>

            <div className="mt-4 flex items-center gap-1 border-t border-border pt-4">
              <button onClick={handleLike} className={`flex-1 flex items-center gap-2 rounded-md py-2 ${isLiked ? 'text-primary' : ''}`}>
                {isLiked ? <Heart size={16} fill="currentColor" /> : <Heart size={16} />}
                <span>Like</span>
              </button>
              <button onClick={() => setShowComments((s) => !s)} className={`flex-1 flex items-center gap-2 rounded-md py-2 ${showComments ? 'text-primary' : ''}`}>
                <MessageSquare size={16} />
                <span>Comment</span>
              </button>
              <button className="flex-1 flex items-center gap-2 rounded-md py-2">
                <Share2 size={16} />
                <span>Share</span>
              </button>
              <button onClick={handleSave} className={`flex-1 flex items-center gap-2 rounded-md py-2 ${isSaved ? 'text-amber-500' : ''}`}>
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                <span>Save</span>
              </button>
            </div>

            {showComments && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-border">
                <h4 className="font-medium text-foreground/90 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Comments ({post.commentsList?.length || 0})
                </h4>
                <div className="space-y-4">
                  {(post.commentsList || []).map((c) => (
                    <motion.div key={c.id} className="flex gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex-shrink-0">
                        <Avatar className={`h-8 w-8 ${c.author.avatarColor} text-white`}>
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
                        </div>
                        <div className="mt-1 text-sm">{c.content}</div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <button onClick={() => handleCommentLike(c.id)} className="flex items-center gap-1">
                            <Heart size={12} /> {c.likes}
                          </button>
                          <button onClick={() => handleReplyToggle(c.id)}>Reply</button>
                        </div>

                        {openReplyFor === c.id && (
                          <div className="mt-3 flex gap-2 items-start">
                            <Avatar size={28} className="text-white bg-primary/80">
                              <AvatarFallback>YOU</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <div className="flex-1 relative">
                                <Textarea rows={1} value={replyTexts[c.id] || ""} onChange={(e) => handleReplyChange(c.id, e.target.value)} placeholder={`Reply to ${c.author.name}...`} className="pr-10 resize-none min-h-[40px]" />
                                <div className="absolute right-2 bottom-2 flex items-center gap-1 text-muted-foreground">
                                  <label className="inline-flex items-center cursor-pointer p-1 rounded hover:bg-muted">
                                    <Paperclip size={14} />
                                  </label>
                                </div>
                              </div>
                              <RawButton size="sm" className="rounded-full h-10 w-10 p-0 flex-shrink-0" onClick={() => submitReply(c.id)} disabled={!((replyTexts[c.id] || "").trim())}>
                                <Send size={16} />
                              </RawButton>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2 items-start">
                  <Avatar size={32} className="text-white bg-primary/80">
                    <AvatarFallback>YOU</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea rows={1} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a reply..." className="pr-10 resize-none min-h-[40px]" />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1 text-muted-foreground">
                        <label className="inline-flex items-center cursor-pointer p-1 rounded hover:bg-muted">
                          <Paperclip size={14} />
                        </label>
                      </div>
                    </div>
                    <RawButton size="sm" className="rounded-full h-10 w-10 p-0 flex-shrink-0" onClick={() => { if (commentText.trim()) { onAddComment(post.id, commentText); setCommentText(""); } }} disabled={!commentText.trim()}>
                      <Send size={16} />
                    </RawButton>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* -------------------------
   Main page
   ------------------------- */
export default function ModaresyCommunityPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [authorRole, setAuthorRole] = useState("all");
  const [newPostText, setNewPostText] = useState("");
  const [educationCombo, setEducationCombo] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [composerTemplate, setComposerTemplate] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [activeFilter, setActiveFilter] = useState("recent");
  const composerRef = useRef(null);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((p) => (authorRole === "all" ? true : p.author.role === authorRole))
      .filter((p) => (query ? (p.content + p.tags.join(" ")).toLowerCase().includes(query.toLowerCase()) : true))
      .filter((p) => (selectedTags.length ? selectedTags.every((t) => p.tags.includes(t)) : true))
      .sort((a, b) => {
        if (activeFilter === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
        if (activeFilter === "popular") return b.likes + b.comments - (a.likes + a.comments);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [posts, query, selectedTags, authorRole, activeFilter]);

  function toggleTag(tag) {
    setSelectedTags((s) => (s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]));
  }

  function createPost(role = "student") {
    if (!newPostText.trim()) return;

    const newPostTags = [];
    if (educationCombo) {
      newPostTags.push(...educationCombo.split(" - ").filter(Boolean));
    }
    if (subject) newPostTags.push(subject);
    if (grade) newPostTags.push(grade);

    const newPost = {
      id: `p_${Date.now()}`,
      author: {
        id: `u${Date.now()}`,
        name: role === "tutor" ? "New Tutor" : "You",
        role,
        avatarColor: role === "tutor" ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-gradient-to-r from-green-500 to-teal-600",
      },
      content: newPostText,
      tags: newPostTags,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      saved: 0,
      views: 0,
      commentsList: [],
    };
    setPosts((p) => [newPost, ...p]);
    setNewPostText("");
    setEducationCombo("");
    setSubject("");
    setGrade("");
    setComposerTemplate(null);
    setShowComposer(false);
  }

  function onToggleLike(postId, isLiked) {
    setPosts((p) => p.map((x) => (x.id === postId ? { ...x, likes: isLiked ? x.likes + 1 : Math.max(0, x.likes - 1) } : x)));
  }

  function onToggleSave(postId, isSaved) {
    setPosts((p) => p.map((x) => (x.id === postId ? { ...x, saved: isSaved ? x.saved + 1 : Math.max(0, x.saved - 1) } : x)));
  }

  function onAddComment(postId, text) {
    setPosts((p) =>
      p.map((x) =>
        x.id === postId
          ? {
              ...x,
              commentsList: [
                ...(x.commentsList || []),
                {
                  id: `c_${Date.now()}`,
                  author: {
                    name: "You",
                    role: "student",
                    avatarColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
                  },
                  content: text,
                  createdAt: new Date().toISOString(),
                  likes: 0,
                },
              ],
              comments: (x.comments || 0) + 1,
            }
          : x
      )
    );
  }

  function onToggleCommentLike(postId, commentId) {
    setPosts((p) =>
      p.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsList: (post.commentsList || []).map((c) => (c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c)),
            }
          : post
      )
    );
  }

  function onAddReply(postId, parentCommentId, text) {
    // simple reply model: prepend "@name" to content and add as a new comment
    setPosts((p) =>
      p.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsList: [
                ...(post.commentsList || []),
                {
                  id: `c_${Date.now()}`,
                  author: {
                    name: "You",
                    role: "student",
                    avatarColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
                  },
                  content: `Reply to ${parentCommentId}: ${text}`,
                  createdAt: new Date().toISOString(),
                  likes: 0,
                },
              ],
              comments: (post.comments || 0) + 1,
            }
          : post
      )
    );
  }

  /* Composer quick templates */
  function applyTemplate(kind) {
    if (kind === "ask") setNewPostText("Q: Could someone explain... (add context)");
    if (kind === "resource") setNewPostText("Resource: I found this PDF/notes about...");
    if (kind === "announce") setNewPostText("Announcement: Free session on ... Date/time");
    setComposerTemplate(kind);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (composerRef.current && !composerRef.current.contains(event.target)) {
        setShowComposer(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // add tag from filters selects
  function addFilterTag(tag) {
    if (!tag) return;
    setSelectedTags((s) => (s.includes(tag) ? s : [...s, tag]));
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-background to-muted/30 text-foreground">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 order-2 lg:order-1">
          <motion.div className="lg:sticky lg:top-20 space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={18} />
                <h3 className="font-semibold">Filters</h3>
              </div>

              <div className="flex items-center gap-2 mb-4 relative">
                <Search size={18} className="absolute left-3 text-muted-foreground/70 z-10" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts, tags, authors..." className="pl-10 pr-4 rounded-full" />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Author Type</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <RawButton size="sm" variant={authorRole === "all" ? "solid" : "outline"} onClick={() => setAuthorRole("all")} className="rounded-full text-xs">
                    All
                  </RawButton>
                  <RawButton size="sm" variant={authorRole === "tutor" ? "solid" : "outline"} onClick={() => setAuthorRole("tutor")} className="rounded-full text-xs">
                    Tutors
                  </RawButton>
                  <RawButton size="sm" variant={authorRole === "student" ? "solid" : "outline"} onClick={() => setAuthorRole("student")} className="rounded-full text-xs">
                    Students
                  </RawButton>
                </div>
              </div>

              <div className="mb-2">
                <h3 className="text-sm font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap max-h-60 overflow-y-auto p-1">
                  {selectedTags.map((t) => (
                    <TagPill key={t} tag={t} onClick={() => toggleTag(t)} selected={true} closable={true} onClose={() => toggleTag(t)} />
                  ))}
                </div>

                {/* Dropdowns under tags so the area isn't empty and to let users add filters quickly */}
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <Select value={educationCombo} onValueChange={(v) => { setEducationCombo(v); addFilterTag(v.split(' - ')[0]); }}>
                    <SelectTrigger className="w-full">
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

                  <Select value={subject} onValueChange={(v) => { setSubject(v); addFilterTag(v); }}>
                    <SelectTrigger className="w-full">
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

                  <Select value={grade} onValueChange={(v) => { setGrade(v); addFilterTag(v); }}>
                    <SelectTrigger className="w-full">
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
              </div>

              {selectedTags.length > 0 && (
                <RawButton variant="outline" size="sm" onClick={() => setSelectedTags([])} className="w-full mt-3 rounded-full">
                  Clear all filters
                </RawButton>
              )}
            </Card>

            <Card className="p-5 rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} />
                <h3 className="font-semibold">Community Stats</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-medium">243</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="font-medium">1.2K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tutors Online</span>
                  <span className="font-medium">24</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </aside>

        <main className="lg:col-span-3 order-1 lg:order-2">
          <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Community Feed</h2>
              <p className="text-muted-foreground mt-1">Ask, share, and connect — built for Egyptian students & tutors.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-muted/50 p-1 rounded-lg">
                <RawButton variant={activeFilter === "recent" ? "solid" : "ghost"} size="sm" onClick={() => setActiveFilter("recent")} className="rounded-md text-xs">
                  Recent
                </RawButton>
                <RawButton variant={activeFilter === "popular" ? "solid" : "ghost"} size="sm" onClick={() => setActiveFilter("popular")} className="rounded-md text-xs">
                  Popular
                </RawButton>
              </div>
              <RawButton onClick={() => setShowComposer(true)} className="rounded-full hidden sm:flex gap-2 bg-gradient-to-r from-primary to-primary/80">
                <PlusCircle size={16} /> New Post
              </RawButton>
            </div>
          </motion.div>

          <AnimatePresence>
            {showComposer && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                <Card ref={composerRef} className="p-5 mb-6 rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-md transition-all duration-300 composer-container">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Create Post</h3>
                    <RawButton variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setShowComposer(false)}>
                      <X size={16} />
                    </RawButton>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Avatar className="bg-gradient-to-r from-primary to-primary/80 text-white">
                        <AvatarFallback>YOU</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="mb-3">
                        <div className="flex gap-2 mb-2">
                          <RawButton size="sm" variant={composerTemplate === 'ask' ? "solid" : "outline"} onClick={() => applyTemplate('ask')} className="rounded-full text-xs gap-2">
                            <Sparkles size={14} /> Ask Question
                          </RawButton>
                          <RawButton size="sm" variant={composerTemplate === 'resource' ? "solid" : "outline"} onClick={() => applyTemplate('resource')} className="rounded-full text-xs gap-2">
                            <BookOpen size={14} /> Share Resource
                          </RawButton>
                          <RawButton size="sm" variant={composerTemplate === 'announce' ? "solid" : "outline"} onClick={() => applyTemplate('announce')} className="rounded-full text-xs gap-2">
                            <Zap size={14} /> Announcement
                          </RawButton>
                        </div>
                      </div>

                      <Textarea rows={4} value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder={composerTemplate ? "Edit template..." : "Start a discussion, ask for help, or share a resource..."} className="min-h-[120px] resize-none" />

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select value={educationCombo} onValueChange={setEducationCombo}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Education System - Sector - Language" />
                          </SelectTrigger>
                          <SelectContent>
                            {EDUCATION_COMBOS.map((combo) => (
                              <SelectItem key={combo} value={combo}>
                                {combo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger className="w-full">
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

                        <Select value={grade} onValueChange={setGrade}>
                          <SelectTrigger className="w-full">
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
                        <RawButton size="sm" variant="outline" onClick={() => createPost('student')} className="rounded-full">Post as Student</RawButton>
                        <RawButton size="sm" onClick={() => createPost('tutor')} className="rounded-full bg-gradient-to-r from-primary to-primary/80">Post as Tutor</RawButton>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            {filteredPosts.length === 0 ? (
              <Card className="p-8 text-center rounded-2xl border-0 bg-card/50 backdrop-blur-sm">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Search size={24} className="text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                <RawButton onClick={() => { setQuery(''); setSelectedTags([]); setAuthorRole('all'); }}>Clear all filters</RawButton>
              </Card>
            ) : (
              filteredPosts.map((p) => (
                <PostCard key={p.id} post={p} onToggleLike={onToggleLike} onAddComment={onAddComment} onToggleSave={onToggleSave} onToggleCommentLike={onToggleCommentLike} onAddReply={onAddReply} />
              ))
            )}
          </div>
        </main>
      </div>

      <FloatingActionButton onClick={() => setShowComposer(true)} />
    </div>
  );
}
