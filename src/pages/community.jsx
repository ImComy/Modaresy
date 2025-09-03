import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_POSTS } from "@/data/mockCommunity";
import { RawButton } from "@/components/ui/RawButton";
import { PostCard } from "@/components/community/PostCard";
import { AddPost } from "@/components/community/AddPost";
import { FiltersSidebar } from "@/components/community/FiltersSidebar";

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
  const [activeFilter, setActiveFilter] = useState("recent");
  const [attachments, setAttachments] = useState([]);

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

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
    setAttachments([]);
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

  // commentId can be comment or reply id; liked is boolean; isReply flag and parentId optional
  function onToggleCommentLike(postId, commentId, liked, isReply = false, parentId = null) {
    setPosts((p) =>
      p.map((post) => {
        if (post.id !== postId) return post;
        const commentsList = (post.commentsList || []).map((c) => {
          if (!isReply && c.id === commentId) {
            return { ...c, likes: liked ? ( (c.likes || 0) + 1 ) : Math.max(0, (c.likes || 0) - 1), isLiked: !!liked };
          }
          if (isReply && c.id === parentId) {
            return {
              ...c,
              replies: (c.replies || []).map((r) => r.id === commentId ? { ...r, likes: liked ? ((r.likes || 0) + 1) : Math.max(0, (r.likes || 0) - 1), isLiked: !!liked } : r)
            };
          }
          return c;
        });
        return { ...post, commentsList };
      })
    );
  }

  function onAddReply(postId, parentCommentId, text, files = []) {
    setPosts((p) =>
      p.map((post) => {
        if (post.id !== postId) return post;
        const newReply = {
          id: `r_${Date.now()}`,
          author: {
            name: "You",
            role: "student",
            avatarColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
          },
          content: text,
          createdAt: new Date().toISOString(),
          likes: 0,
          attachments: files.map((f, i) => ({ url: typeof f === 'string' ? f : URL.createObjectURL(f), name: f.name || `file-${i}`, mime: f.type || 'application/octet-stream' }))
        };

        const commentsList = (post.commentsList || []).map((c) => {
          if (c.id === parentCommentId) {
            return { ...c, replies: [...(c.replies || []), newReply] };
          }
          return c;
        });

        return { ...post, commentsList, comments: (post.comments || 0) + 1 };
      })
    );
  }

  function applyTemplate(kind) {
    if (kind === "ask") setNewPostText("Q: Could someone explain... (add context)");
    if (kind === "resource") setNewPostText("Resource: I found this PDF/notes about...");
    if (kind === "announce") setNewPostText("Announcement: Free session on ... Date/time");
    setComposerTemplate(kind);
  }

  function addFilterTag(tag) {
    if (!tag) return;
    setSelectedTags((s) => (s.includes(tag) ? s : [...s, tag]));
  }

  return (
    <div className="min-h-screen overflow-hidden text-foreground">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 order-1 lg:order-1">
          <FiltersSidebar 
            query={query} 
            setQuery={setQuery} 
            authorRole={authorRole} 
            setAuthorRole={setAuthorRole} 
            selectedTags={selectedTags} 
            toggleTag={toggleTag} 
            educationCombo={educationCombo} 
            setEducationCombo={setEducationCombo} 
            addFilterTag={addFilterTag} 
            subject={subject} 
            setSubject={setSubject} 
            grade={grade} 
            setGrade={setGrade} 
            setSelectedTags={setSelectedTags} 
          />
        </aside>

        <main className="lg:col-span-3 order-2 lg:order-2">
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
            </div>
          </motion.div>

          <AddPost 
            newPostText={newPostText} 
            setNewPostText={setNewPostText} 
            educationCombo={educationCombo} 
            setEducationCombo={setEducationCombo} 
            subject={subject} 
            setSubject={setSubject} 
            grade={grade} 
            setGrade={setGrade} 
            composerTemplate={composerTemplate} 
            applyTemplate={applyTemplate} 
            createPost={createPost} 
            attachments={attachments}
            setAttachments={setAttachments}
            removeAttachment={removeAttachment}
          />

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
                <PostCard 
                  key={p.id} 
                  post={p} 
                  onToggleLike={onToggleLike} 
                  onAddComment={onAddComment} 
                  onToggleSave={onToggleSave} 
                  onToggleCommentLike={onToggleCommentLike} 
                  onAddReply={onAddReply} 
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}