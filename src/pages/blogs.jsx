// SinglePostPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/api/apiService';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  MessageSquare,
  Share2,
  Send,
  Edit3,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Heart from '@/components/ui/heart';
import Loader from '@/components/ui/loader';
import { getImageUrl } from '@/api/imageService';
import { Link } from 'react-router-dom';

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
  // Assuming resolveAvatar is not available, fallback to user.img or placeholder
  return user?.img || user?.profile_picture || user?.avatar || '';
};

const getInitials = (name) => {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const CommentsList = ({ post, onComment, me, myUser, refreshPost }) => {
  const { t } = useTranslation();
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
      refreshPost();
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
      setDeleting(null);
      refreshPost();
    } catch (err) {
      console.error('delete comment error', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
      <div className="space-y-2 overflow-auto pr-2 max-h-96">
        {(post.comments || []).map((c) => {
          const rawUser = c.user;
          const user = typeof rawUser === 'object' ? rawUser : null;
          const isRawUserMe = typeof rawUser === 'string' && String(rawUser) === String(me);
          const resolvedUser = user || (isRawUserMe ? myUser : null);
          const displayName = getDisplayName(resolvedUser) || (typeof rawUser === 'string' ? rawUser : t('anonymous', 'Anonymous'));
          const avatarSrc = getAvatarSrc(resolvedUser);
          const isMine = me && ((user && String(user._id) === String(me)) || isRawUserMe);

          return (
            <div key={c._id} className="flex items-start gap-3 text-sm">
              <div className="w-9 flex-shrink-0">
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
                  <div className="font-medium text-sm truncate">{displayName}</div>
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
                        title={t('saveEdit', 'Save edit')}
                      >
                        <Send size={14} />
                        {t('save', 'Save')}
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
                        title={t('cancel', 'Cancel')}
                      >
                        {t('cancel', 'Cancel')}
                      </button>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{c.text}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 ml-2">
                {isMine && editing !== c._id && deleting !== c._id && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(c)}
                      className="p-1 rounded hover:bg-[hsl(var(--input))]"
                      title={t('editComment', 'Edit comment')}
                      style={{ color: 'hsl(var(--primary))' }}
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestDelete(c._id)}
                      className="p-1 rounded hover:bg-[hsl(var(--input))]"
                      title={t('deleteComment', 'Delete comment')}
                      style={{ color: 'hsl(var(--destructive))' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}

                {deleting === c._id && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('confirm', 'Confirm?')}</div>
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
                      {t('delete', 'Delete')}
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
                      {t('cancel', 'Cancel')}
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
          placeholder={t('writeCommentPlaceholder', 'Write a comment...')}
          aria-label={t('writeCommentAria', 'Write a comment')}
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
          aria-label={t('sendCommentAria', 'Send comment')}
          title={t('sendCommentAria', 'Send comment')}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

const PostDisplay = ({ post, handleDelete, handleLike, handleComment, isOwner, me, myUser, refreshPost }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const author = post.author || post.user || post.teacher || null;
  const authorName = getDisplayName(author) || t('tutor', 'Tutor');
  const authorAvatar = getAvatarSrc(author) || null;
  const likedByMe = (post.likes || []).map((l) => String(l)).includes(String(me));

  return (
    <article
      className="rounded-2xl p-4 transition-shadow hover:shadow-lg max-w-2xl mx-auto"
      style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--card-foreground))', boxShadow: '0 6px 20px rgba(2,6,23,0.04)' }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div className="flex gap-3 items-start flex-1">
          <div className="w-10 flex-shrink-0">
            <Avatar>
              {authorAvatar ? <AvatarImage src={authorAvatar} alt={authorName} /> : <AvatarFallback>{getInitials(authorName)}</AvatarFallback>}
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold truncate">{post.title || authorName}</div>
              <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                • {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 text-sm break-words" style={{ color: 'hsl(var(--card-foreground))' }}>
              {post.content}
            </div>

            {post.images && post.images.length > 0 && (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {post.images.map((img, idx) => (
                  <div key={idx} className="rounded-md overflow-hidden border" style={{ borderColor: 'hsl(var(--border))' }}>
                    <img
                      src={getImageUrl(img.url || img.path || img)}
                      alt={img.originalname || img.filename || t('imageAlt', { idx, defaultValue: `image-${idx}` })}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 mt-2 sm:mt-0">
          {isOwner && (
            <button type="button" onClick={() => handleDelete(post._id)} title={t('delete', 'Delete')} aria-label={t('delete', 'Delete post')} className="p-2 rounded-md" style={{ color: 'hsl(var(--destructive))', background: 'transparent', border: 'none' }}>
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-3" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center justify-center text-sm gap-2">
            <button
              type="button"
              onClick={() => handleLike(post._id)}
              aria-pressed={likedByMe}
              title={t('like', 'Like')}
              className="rounded hover:bg-[hsl(var(--input))] mt-1"
              style={{ background: 'transparent', border: 'none', color: likedByMe ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
            >
              <Heart isLiked={likedByMe} size={18} ariaLabel={t('like', 'Like post')} />
            </button>
            <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {(post.likes || []).length ? ` ${(post.likes || []).length} ${t('likes', 'Likes')}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-md text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <MessageSquare size={18} />
            <span>{(post.comments || []).length} {t('comments', 'comments')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <button
            type="button"
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md"
            onClick={async () => {
              const url = `${window.location.origin}/blog/${post._id}`;
              try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(url);
                } else {
                  const ta = document.createElement('textarea');
                  ta.value = url;
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                }
                toast({ title: t('copied', 'Copied'), description: t('linkCopied', 'Link copied to clipboard') });
              } catch (err) {
                console.error('copy link failed', err);
                toast({ title: t('copyFailed', 'Copy failed'), description: t('copyFailedDesc', 'Could not copy link'), variant: 'destructive' });
              }
            }}
            style={{ color: 'hsl(var(--muted-foreground))' }}
            title={t('share', 'Share')}
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">{t('share', 'Share')}</span>
          </button>
        </div>
      </div>

      <CommentsList post={post} onComment={handleComment} me={me} myUser={myUser} refreshPost={refreshPost} />
    </article>
  );
};

const RecommendationItem = ({ post }) => {
  const { t } = useTranslation();
  const author = post.author || post.user || post.teacher || null;
  const authorName = getDisplayName(author) || t('tutor', 'Tutor');
  const authorAvatar = getAvatarSrc(author) || null;

  return (
    <Link to={`/blog/${post._id}`} className="block rounded-2xl p-4 transition-shadow hover:shadow-lg" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
      <div className="flex gap-3 items-start">
        <div className="w-8 flex-shrink-0">
          <Avatar>
            {authorAvatar ? <AvatarImage src={authorAvatar} alt={authorName} /> : <AvatarFallback>{getInitials(authorName)}</AvatarFallback>}
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm truncate">{post.title || authorName}</div>
          <div className="text-xs mt-1 line-clamp-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {post.content}
          </div>
        </div>
      </div>
    </Link>
  );
};

const Blog = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const me = authState?.userId;
  const myUser = authState?.userData;
  const params = useParams();
  const postId = params.postId || params.blogID || params.blogId || params.id;

  const [post, setPost] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/blogs/${postId}`);
      setPost(res.post || res.blog || res);
    } catch (err) {
      console.error('Failed to load post', err);
      setError(t('postNotFound', 'Post not found'));
    } finally {
      setLoading(false);
    }
  }, [postId, t]);

  const fetchRecommendations = useCallback(async (tutorId) => {
    if (!tutorId) return;
    try {
      const res = await apiFetch(`/blogs/teacher/${tutorId}?page=1&limit=3`);
      const fetched = (res.posts || res.tutors || []).filter(p => p._id !== postId);
      setRecommendations(fetched);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    if (post) {
      const tutorId = post.teacher?._id || post.author?._id || post.user?._id;
      fetchRecommendations(tutorId);
    }
  }, [post, fetchRecommendations]);

  const handleDelete = async (id) => {
    if (!confirm(t('deletePostConfirm', 'Delete this post?'))) return;
    try {
      await apiFetch(`/blogs/${id}`, { method: 'DELETE' });
      // Redirect or something, perhaps to tutor page
      window.location.href = '/'; // Assuming home or tutor page
    } catch (err) {
      console.error('delete error', err);
      fetchPost();
    }
  };

  const handleLike = async (id) => {
    try {
      const likedByMe = (post.likes || []).map(l => String(l)).includes(String(me));
      if (likedByMe) {
        await apiFetch(`/blogs/${id}/unlike`, { method: 'POST' });
      } else {
        await apiFetch(`/blogs/${id}/like`, { method: 'POST' });
      }
      fetchPost();
    } catch (err) {
      console.error('like error', err);
      fetchPost();
    }
  };

  const handleComment = async (id, text, resetCb) => {
    if (!text.trim()) return;
    try {
      await apiFetch(`/blogs/${id}/comment`, { method: 'POST', body: JSON.stringify({ text }) });
      resetCb && resetCb();
      fetchPost();
    } catch (err) {
      console.error('comment error', err);
      fetchPost();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={90} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-10" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {error || t('postNotFound', 'Post not found')}
      </div>
    );
  }

  const isOwner = me && String(me) === String(post.author?._id || post.user?._id || post.teacher?._id);

  return (
    <div className="min-h-screen py-8 px-4">
      <PostDisplay
        post={post}
        handleDelete={handleDelete}
        handleLike={handleLike}
        handleComment={handleComment}
        isOwner={isOwner}
        me={me}
        myUser={myUser}
        refreshPost={fetchPost}
      />

      {recommendations.length > 0 && (
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
            {t('moreFromTutor', 'More from this tutor')}
          </h2>
          <div className="space-y-4">
            {recommendations.map(rec => (
              <RecommendationItem key={rec._id} post={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;