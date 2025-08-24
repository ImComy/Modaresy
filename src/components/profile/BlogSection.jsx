import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/api/apiService';
import {
  Image as ImageIcon,
  FileText,
  Send,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Share2,
  Edit3,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Heart from '@/components/ui/heart';

const getDisplayName = (user) => {
  if (!user) return null;
  return (
    user.name ||
    user.fullName ||
    user.displayName ||
    user.username ||
    (user.email && user.email.split('@')[0]) ||
    null
  );
};
const getAvatarSrc = (user) => {
  if (!user) return null;
  return user.img || user.avatar || user.profileImage || user.picture || null;
};
const getInitials = (name) => {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const InvisibleFileInput = ({ label, Icon, accept }) => {
  const inputId = `file-${label.replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`;
  return (
    <>
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 px-2 py-1 text-sm rounded cursor-pointer hover:bg-[hsl(var(--input))]"
        style={{ color: 'hsl(var(--muted-foreground))' }}
        title={label}
      >
        <Icon size={16} />
        <span className="text-xs">{label}</span>
      </label>
      <input id={inputId} type="file" accept={accept} className="hidden" onChange={() => { /* UI-only */ }} />
    </>
  );
};

const CommentsList = ({ post, onComment, me, refreshParent }) => {
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleStartEdit = (c) => {
    setEditing(c._id);
    setEditText(c.text || '');
    setDeleting(null);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      setBusy(true);
      await apiFetch(`/blogs/${post._id}/comment/${commentId}`, { method: 'PUT', body: JSON.stringify({ text: editText }) });
      setEditing(null);
      setEditText('');
      refreshParent && refreshParent();
      window.dispatchEvent(new CustomEvent('refetchPosts'));
    } catch (err) {
      console.error('edit comment error', err);
    } finally {
      setBusy(false);
    }
  };

  const handleRequestDelete = (commentId) => {
    setDeleting(commentId === deleting ? null : commentId);
    setEditing(null);
  };

  const handleConfirmDelete = async (commentId) => {
    try {
      setBusy(true);
      await apiFetch(`/blogs/${post._id}/comment/${commentId}`, { method: 'DELETE' });
      refreshParent && refreshParent();
      window.dispatchEvent(new CustomEvent('refetchPosts'));
      setDeleting(null);
    } catch (err) {
      console.error('delete comment error', err);
      refreshParent && refreshParent();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
      <div className="space-y-2 max-h-60 overflow-auto pr-2">
        {(post.comments || []).map((c) => {
          const rawUser = c.user;
          const user = typeof rawUser === 'object' ? rawUser : null;
          const displayName = getDisplayName(user) || (typeof rawUser === 'string' ? rawUser : 'Anonymous');
          const avatarSrc = getAvatarSrc(user);
          const isMine = me && user && String(user._id) === String(me);

          return (
            <div key={c._id} className="flex items-start gap-3 text-sm">
              <div>
                <Avatar>
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} alt={displayName} />
                  ) : (
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-sm">{displayName}</div>
                  <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {new Date(c.createdAt).toLocaleString?.() ?? ''}
                  </div>
                </div>

                <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {editing === c._id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 rounded px-3 py-1 text-sm"
                        style={{
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--input))',
                          color: 'hsl(var(--card-foreground))',
                        }}
                        disabled={busy}
                      />
                      <button
                        onClick={() => handleSaveEdit(c._id)}
                        className="px-3 py-1 rounded-md flex items-center gap-2"
                        style={{
                          background: busy ? 'hsl(var(--muted))' : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
                          color: 'hsl(var(--primary-foreground))',
                          border: 'none',
                        }}
                        disabled={busy}
                        title="Save edit"
                      >
                        <Send size={14} />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 rounded-md"
                        style={{
                          border: '1px solid hsl(var(--border))',
                          background: 'transparent',
                          color: 'hsl(var(--muted-foreground))',
                        }}
                        disabled={busy}
                        title="Cancel edit"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>{c.text}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {isMine && editing !== c._id && deleting !== c._id && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(c)}
                      className="p-1 rounded hover:bg-[hsl(var(--input))]"
                      title="Edit comment"
                      style={{ color: 'hsl(var(--primary))' }}
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestDelete(c._id)}
                      className="p-1 rounded hover:bg-[hsl(var(--input))]"
                      title="Delete comment"
                      style={{ color: 'hsl(var(--destructive))' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}

                {deleting === c._id && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Confirm?</div>
                    <button
                      onClick={() => handleConfirmDelete(c._id)}
                      className="px-2 py-1 rounded-md"
                      style={{
                        background: 'hsl(var(--destructive))',
                        color: 'hsl(var(--destructive-foreground) || 0 0% 100%)',
                        border: 'none',
                      }}
                      disabled={busy}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleting(null)}
                      className="px-2 py-1 rounded-md"
                      style={{
                        border: '1px solid hsl(var(--border))',
                        background: 'transparent',
                        color: 'hsl(var(--muted-foreground))',
                      }}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-full px-3 py-2 text-sm"
          placeholder="Write a comment..."
          aria-label="Write a comment"
          style={{
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--input))',
            color: 'hsl(var(--card-foreground))',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!text.trim()) return;
              onComment(post._id, text, () => setText(''));
            }
          }}
        />
        <button
          onClick={() => {
            if (!text.trim()) return;
            onComment(post._id, text, () => setText(''));
          }}
          className="px-3 py-2 rounded-full flex items-center gap-2"
          style={{
            background: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
          }}
          aria-label="Send comment"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

const BlogSection = ({ tutorId, isOwner }) => {
  const { authState } = useAuth();
  const me = authState?.userId;

  const LIMIT = 12; 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); 
  const [hasMore, setHasMore] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const fetchPosts = useCallback(
    async (p = 1) => {
      try {
        setLoading(true);
        const res = await apiFetch(`/blogs/teacher/${tutorId}?page=${p}&limit=${LIMIT}`);
        const fetched = res.posts || res.tutors || [];
        if (p === 1) {
          setPosts(fetched || []);
        } else {
          setPosts((prev) => [...prev, ...(fetched || [])]);
        }
        // if backend returned fewer than LIMIT, we've reached the end
        if (!fetched || fetched.length < LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        console.error('Failed to load posts', err);
        if (p === 1) setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [tutorId]
  );

  // initial load & reset when tutorId changes
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    if (tutorId) {
      fetchPosts(1);
    }
    // cleanup observer on tutor change
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [tutorId, fetchPosts]);

  // fetch when page increments (except initial which is handled above)
  useEffect(() => {
    if (page === 1) return;
    fetchPosts(page);
  }, [page, fetchPosts]);

  // IntersectionObserver to load more when sentinel appears
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [loading, hasMore, posts.length]);

  const handleCreate = async (e) => {
    e?.preventDefault?.();
    if (!title.trim() && !content.trim()) return;
    try {
      setSubmitting(true);
      const tempId = `temp-${Date.now()}`;
      const tempPost = {
        _id: tempId,
        title,
        content,
        createdAt: new Date().toISOString(),
        author: {
          name: authState?.userData?.name || authState?.userData?.fullName || 'Me',
          _id: me,
          img: getAvatarSrc(authState?.userData),
        },
        likes: [],
        comments: [],
        attachments: [],
        isTemp: true,
      };
      // insert at top
      setPosts((p) => [tempPost, ...p]);
      setTitle('');
      setContent('');

      const res = await apiFetch('/blogs', {
        method: 'POST',
        body: JSON.stringify({ title: tempPost.title, content: tempPost.content }),
      });

      const created = res?.post || res?.blog || res?.data || null;
      if (created && created._id) {
        setPosts((prev) => prev.map((pp) => (pp._id === tempId ? created : pp)));
      } else {
        // fallback: refetch first page to ensure consistency
        fetchPosts(1);
      }
    } catch (err) {
      console.error('create post error', err);
      setPosts((p) => p.filter((x) => !String(x._id).startsWith('temp-')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      setPosts((p) => p.filter((x) => x._id !== postId));
      await apiFetch(`/blogs/${postId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('delete error', err);
      // re-sync if something went wrong
      fetchPosts(1);
    }
  };

  const handleLike = async (postId) => {
    try {
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const likes = Array.isArray(p.likes) ? [...p.likes] : [];
          const meStr = me?.toString();
          const has = likes.map((l) => String(l)).includes(meStr);
          const newLikes = has ? likes.filter((l) => String(l) !== meStr) : [...likes, me];
          return { ...p, likes: newLikes };
        })
      );

      const current = posts.find((x) => x._id === postId);
      const wasLiked = current && Array.isArray(current.likes) && current.likes.map((l) => String(l)).includes(String(me));
      if (wasLiked) {
        await apiFetch(`/blogs/${postId}/unlike`, { method: 'POST' });
      } else {
        await apiFetch(`/blogs/${postId}/like`, { method: 'POST' });
      }
    } catch (err) {
      console.error('like error', err);
      // re-sync in case of error
      fetchPosts(1);
    }
  };

  const handleComment = async (postId, text, resetCb) => {
    if (!text || !text.trim()) return;
    try {
      const tempC = {
        _id: `temp-c-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
        user: { _id: me, name: authState?.userData?.name || authState?.userData?.fullName || 'Me', img: getAvatarSrc(authState?.userData) },
      };

      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: [...(p.comments || []), tempC] } : p)));

      const res = await apiFetch(`/blogs/${postId}/comment`, { method: 'POST', body: JSON.stringify({ text }) });
      const created = res?.comment || res?.data || null;
      if (created && created._id) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, comments: (p.comments || []).map((c) => (String(c._id).startsWith('temp-c-') ? created : c)) } : p
          )
        );
      } else {
        fetchPosts(1);
      }
      resetCb && resetCb();
    } catch (err) {
      console.error('comment error', err);
      fetchPosts(1);
    }
  };

  return (
    <div className="space-y-5">
      {/* Composer */}
      {isOwner && (
        <div
          className="w-full rounded-2xl shadow-sm transition-shadow"
          style={{
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            padding: 14,
            boxShadow: '0 6px 18px rgba(2,6,23,0.04)',
          }}
        >
          <div className="flex gap-3">
            <div className="w-12">
              <Avatar>
                {getAvatarSrc(authState?.userData) ? (
                  <AvatarImage src={getAvatarSrc(authState?.userData)} alt={getDisplayName(authState?.userData) || 'Me'} />
                ) : (
                  <AvatarFallback>{getInitials(getDisplayName(authState?.userData) || 'M')}</AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="flex-1">
              {/* Title input with label + helper */}
              <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Title (optional)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a short title (optional)"
                aria-label="Post title"
                className="w-full rounded-md px-3 py-2 mb-2"
                style={{
                  background: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--card-foreground))',
                  boxShadow: title ? '0 4px 18px rgba(2,6,23,0.04)' : 'none',
                }}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (!submitting) handleCreate(e);
                  }
                }}
              />
              <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 8 }}>
                Keep titles short — they help students scan your updates quickly.
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an update, resource, or tip for your students..."
                rows={3}
                className="w-full resize-none rounded-md px-3 py-2 focus:outline-none"
                style={{
                  background: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--card-foreground))',
                }}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (!submitting) handleCreate(e);
                  }
                }}
              />

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InvisibleFileInput label="Photo" Icon={ImageIcon} accept="image/*" />
                  <InvisibleFileInput label="Document" Icon={FileText} accept=".pdf,.doc,.docx,.txt" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('');
                      setContent('');
                    }}
                    className="px-3 py-1 rounded-md"
                    style={{
                      border: '1px solid hsl(var(--border))',
                      background: 'transparent',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={submitting || (!title.trim() && !content.trim())}
                    className="px-4 py-1 rounded-md font-medium flex items-center gap-2 transition-transform active:scale-95"
                    style={{
                      background: submitting ? 'hsl(var(--muted))' : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
                      color: 'hsl(var(--primary-foreground))',
                      border: 'none',
                      boxShadow: submitting ? 'none' : '0 10px 30px rgba(2,6,23,0.08)',
                    }}
                    aria-disabled={submitting}
                  >
                    {submitting ? 'Posting...' : 'Post'}
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <div
            className="text-center py-10 rounded"
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div
            className="text-center py-10 rounded"
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            No posts yet.
          </div>
        ) : (
          posts.map((post) => {
            const author = post.author || post.user || null;
            const authorName = getDisplayName(author) || getDisplayName(post.teacher) || 'Tutor';
            const authorAvatar = getAvatarSrc(author) || getAvatarSrc(post.teacher) || null;
            const likedByMe = (post.likes || []).map((l) => String(l)).includes(String(me));
            return (
              <article
                key={post._id}
                className="rounded-2xl p-4 transition-shadow hover:shadow-lg"
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--card-foreground))',
                  boxShadow: '0 6px 20px rgba(2,6,23,0.04)',
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3 items-start">
                    <div>
                      <Avatar>
                        {authorAvatar ? <AvatarImage src={authorAvatar} alt={authorName} /> : <AvatarFallback>{getInitials(authorName)}</AvatarFallback>}
                      </Avatar>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{post.title || authorName}</div>
                        <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          • {new Date(post.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-2 text-sm" style={{ color: 'hsl(var(--card-foreground))' }}>
                        {post.content}
                      </div>

                      {post.attachments && post.attachments.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {post.attachments.map((a, idx) => (
                            <div
                              key={idx}
                              className="rounded overflow-hidden border"
                              style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--input))' }}
                            >
                              <div className="w-full h-28 flex items-center justify-center text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                Attachment preview
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDelete(post._id)}
                        title="Delete"
                        aria-label="Delete post"
                        style={{
                          color: 'hsl(var(--destructive))',
                          background: 'transparent',
                          border: 'none',
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="p-1 rounded"
                      title="More"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'hsl(var(--muted-foreground))',
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                {/* action row */}
                <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: 'hsl(var(--border))' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Heart
                        isLiked={(post.likes || []).map(l => String(l)).includes(String(me))}
                        onToggle={() => handleLike(post._id)}
                        size={18}
                      />
                      <button className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {(post.likes || []).length ? ` ${(post.likes || []).length}` : ''}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1 rounded-md text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      <MessageSquare size={16} />
                      <span>{(post.comments || []).length} comments</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm px-3 py-1 rounded-md"
                      onClick={() => { /* UI-only share action */ }}
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                      title="Share"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>

                <CommentsList post={post} onComment={handleComment} me={me} refreshParent={() => fetchPosts(1)} />
              </article>
            );
          })
        )}
      </div>

      {/* sentinel for infinite scroll (observed by IntersectionObserver) */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* small loading indicator while fetching more */}
      {loading && posts.length > 0 && (
        <div className="text-center py-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Loading more...
        </div>
      )}
      {/* end message when no more posts */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
          You've reached the end.
        </div>
      )}
    </div>
  );
};

export default BlogSection;
