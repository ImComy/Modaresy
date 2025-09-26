import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/api/apiService';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '@/api/apiService';
import Loader from '@/components/ui/loader';
import CreatePost from '@/components/blogs/CreatePost';
import PostItem from '@/components/blogs/PostItem';
import { getAvatarSrc, getDisplayName } from '@/components/blogs/utils';

const BlogSection = ({ tutorId, isOwner }) => {
  const { t } = useTranslation();
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
  const [selectedFiles, setSelectedFiles] = useState([]);

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

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    if (tutorId) {
      fetchPosts(1);
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [tutorId, fetchPosts]);

  useEffect(() => {
    if (page === 1) return;
    fetchPosts(page);
  }, [page, fetchPosts]);

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
      { root: null, rootMargin: '300px', threshold: 0.1 }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [loading, hasMore, posts.length]);

  const handleRemoveImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async (e) => {
    e?.preventDefault?.();
    if (!title.trim() && !content.trim() && selectedFiles.length === 0) return;
    try {
      setSubmitting(true);
      const tempId = `temp-${Date.now()}`;
      const tempPost = {
        _id: tempId,
        title,
        content,
        createdAt: new Date().toISOString(),
        author: {
          name: authState?.userData?.name || authState?.userData?.fullName || t('me', 'Me'),
          _id: me,
          img: getAvatarSrc(authState?.userData),
        },
        likes: [],
        comments: [],
        images: selectedFiles.map(file => ({
          isTemp: true,
          url: URL.createObjectURL(file),
          originalname: file.name
        })),
        isTemp: true,
      };
      setPosts((p) => [tempPost, ...p]);
      setTitle('');
      setContent('');

      let uploadedImages = [];
      try {
        for (const f of selectedFiles) {
          const fd = new FormData();
          fd.append('profile_picture', f);
          const uploadRes = await fetch(`${API_BASE}/storage/uploadImage`, {
            method: 'POST',
            body: fd,
            credentials: 'include',
            headers: {
              Authorization: authState?.token ? `Bearer ${authState.token}` : undefined,
            },
          });
          if (!uploadRes.ok) {
            console.error('image upload failed', await uploadRes.text());
            continue;
          }
          const uploaded = await uploadRes.json();
          uploadedImages.push(uploaded);
        }
      } catch (err) {
        console.error('upload images error', err);
      }

      const res = await apiFetch('/blogs', {
        method: 'POST',
        body: JSON.stringify({
          title: tempPost.title,
          content: tempPost.content,
          images: uploadedImages
        }),
      });

      const created = res?.post || res?.blog || res?.data || null;
      if (created && created._id) {
        tempPost.images.forEach(img => {
          if (img.isTemp && img.url.startsWith('blob:')) {
            URL.revokeObjectURL(img.url);
          }
        });

        setPosts((prev) => prev.map((pp) => (pp._id === tempId ? created : pp)));
      } else {
        fetchPosts(1);
      }
      setSelectedFiles([]);
    } catch (err) {
      console.error('create post error', err);
      setPosts((p) => p.filter((x) => !String(x._id).startsWith('temp-')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm(t('deletePostConfirm', 'Delete this post?'))) return;
    try {
      setPosts((p) => p.filter((x) => x._id !== postId));
      await apiFetch(`/blogs/${postId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('delete error', err);
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
        user: { _id: me, name: authState?.userData?.name || authState?.userData?.fullName || t('me', 'Me'), img: getAvatarSrc(authState?.userData) },
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
      {isOwner && (
        <CreatePost
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          submitting={submitting}
          handleCreate={handleCreate}
          handleRemoveImage={handleRemoveImage}
          authState={authState}
        />
      )}

      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center items-center gap-4 text-center py-10 rounded" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
            <Loader showLoadingText={false} size={40} /> {t('loadingPosts', 'Loading posts...')}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 rounded" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
            {t('noPostsYet', 'No posts yet.')}
          </div>
        ) : (
          posts.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              handleDelete={handleDelete}
              handleLike={handleLike}
              handleComment={handleComment}
              isOwner={isOwner}
              me={me}
              authState={authState}
              refreshParent={() => fetchPosts(1)}
            />
          ))
        )}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />

      {loading && posts.length > 0 && (
        <div className="text-center py-6" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('loadingMore', 'Loading more...')}</div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('endReached', "You've reached the end.")}</div>
      )}
    </div>
  );
};

export default BlogSection;