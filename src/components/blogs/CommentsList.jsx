import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Trash2, Edit3, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { apiFetch } from '@/api/apiService';
import { getDisplayName, getAvatarSrc, getInitials } from './utils';

const CommentsList = ({ post, onComment, me, refreshParent, myUser }) => {
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
      const res = await apiFetch(`/blogs/${post._id}/comment/${commentId}`, { method: 'DELETE' });
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

  // Determine if user is a teacher (you might need to adjust this logic based on your user object structure)
  const isUserTeacher = (user) => {
    // Check common teacher indicators - adjust based on your actual user structure
    return user?.role === 'teacher' || 
           user?.userType === 'teacher' || 
           user?.isTeacher === true ||
           user?.type === 'teacher';
  };

  const formatCommentTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    if (diffInMinutes < 1) return t('justNow', 'Just now');
    if (diffInMinutes < 60) return t('minutesAgo', { minutes: diffInMinutes, defaultValue: `${diffInMinutes}m ago` });
    if (diffInHours < 24) return t('hoursAgo', { hours: diffInHours, defaultValue: `${diffInHours}h ago` });
    return date.toLocaleDateString();
  };

  return (
    <div className=" pt-4 border-t border-border/30">
      <div className="space-y-4 overflow-auto pr-1 max-h-48 sm:max-h-64">
        {(post.comments || []).map((c) => {
          const rawUser = c.user;
          const user = typeof rawUser === 'object' ? rawUser : null;
          const isRawUserMe = typeof rawUser === 'string' && String(rawUser) === String(me);
          const resolvedUser = user || (isRawUserMe ? myUser : null);
          const displayName = getDisplayName(resolvedUser) || (typeof rawUser === 'string' ? rawUser : t('anonymous', 'Anonymous'));
          const avatarSrc = getAvatarSrc(resolvedUser);
          const isMine = me && ((user && String(user._id) === String(me)) || isRawUserMe);
          const isTeacher = isUserTeacher(resolvedUser);
          const avatarShape = isTeacher ? 'rounded-lg' : 'rounded-full';

          return (
            <div key={c._id} className="flex items-start gap-3 group">
              <div className="w-8 flex-shrink-0">
                <Avatar className={`w-8 h-8 border border-border/50 ${avatarShape}`}>
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} alt={displayName} className={avatarShape} />
                  ) : (
                    <AvatarFallback className={`text-xs font-medium ${avatarShape} ${isTeacher ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                      {getInitials(displayName)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium text-sm text-foreground">{displayName}</div>
                  {isTeacher && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {t('teacher', 'Teacher')}
                    </span>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formatCommentTime(c.createdAt)}
                  </div>
                </div>

                <div className="text-sm text-foreground/90">
                  {editing === c._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                        style={{
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--input))',
                          color: 'hsl(var(--card-foreground))',
                        }}
                        disabled={busy}
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(c._id)}
                          className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors disabled:opacity-50"
                          style={{
                            background: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                            border: 'none',
                          }}
                          disabled={busy || !editText.trim()}
                        >
                          <Send size={12} />
                          {t('save', 'Save')}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
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
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{c.text}</div>
                  )}
                </div>
              </div>

              {isMine && editing !== c._id && deleting !== c._id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(c)}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                    title={t('editComment', 'Edit comment')}
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRequestDelete(c._id)}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                    title={t('deleteComment', 'Delete comment')}
                    style={{ color: 'hsl(var(--destructive))' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {deleting === c._id && (
                <div className="flex items-center gap-2 bg-destructive/10 p-2 rounded-lg">
                  <div className="text-xs text-destructive font-medium">{t('confirm', 'Confirm?')}</div>
                  <button
                    onClick={() => handleConfirmDelete(c._id)}
                    className="px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    style={{
                      background: 'hsl(var(--destructive))',
                      color: 'hsl(var(--destructive-foreground))',
                      border: 'none',
                    }}
                    disabled={busy}
                  >
                    {t('delete', 'Delete')}
                  </button>
                  <button
                    onClick={() => setDeleting(null)}
                    className="px-2 py-1 rounded text-xs font-medium transition-colors"
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
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-full px-4 py-2 text-sm border border-border bg-input text-foreground"
          placeholder={t('writeCommentPlaceholder', 'Write a comment...')}
          aria-label={t('writeCommentAria', 'Write a comment')}
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
          disabled={!text.trim()}
          className="p-2 rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-50"
          aria-label={t('sendCommentAria', 'Send comment')}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default CommentsList;