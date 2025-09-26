import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, MessageSquare, Share2, MoreVertical, Heart, Clock, Calendar, MapPin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CommentsList from './CommentsList'; 
import { getDisplayName, getAvatarSrc, getInitials, getImageUrl } from './utils'; 
import { useToast } from '@/components/ui/use-toast';

const MediaGrid = ({ files }) => {
  if (!files || files.length === 0) return null;

  const getGridClass = (count) => {
    switch (count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2';
      case 4: return 'grid-cols-2';
      default: return 'grid-cols-2 sm:grid-cols-3';
    }
  };

  const getAspectClass = (index, total) => {
    if (total === 3 && index === 0) return 'row-span-2';
    if (total === 1) return 'aspect-video';
    return 'aspect-square';
  };

  return (
    <div className={`grid ${getGridClass(files.length)} gap-2 auto-rows-fr`}>
      {files.map((file, index) => (
        <div
          key={index}
          className={`relative group rounded-lg overflow-hidden ${getAspectClass(index, files.length)}`}
        >
          <img
            src={file.url}
            alt={file.name || `Media ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );
};

const PostItem = ({
  post,
  handleDelete,
  handleLike,
  handleComment,
  isOwner,
  me,
  authState,
  refreshParent,
}) => {
  const { t } = useTranslation();
  const [isLiked, setIsLiked] = useState((post.likes || []).map((l) => String(l)).includes(String(me)));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);

  const author = post.author || post.user || null;
  const authorName = getDisplayName(author) || getDisplayName(post.teacher) || t('tutor', 'Tutor');
  const authorAvatar = getAvatarSrc(author) || getAvatarSrc(post.teacher) || null;

  const handleLikeClick = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    try {
      await handleLike(post._id);
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return t('justNow', 'Just now');
    if (diffInHours < 24) return t('hoursAgo', { hours: diffInHours, defaultValue: `${diffInHours}h ago` });
    if (diffInDays < 7) return t('daysAgo', { days: diffInDays, defaultValue: `${diffInDays}d ago` });
    return date.toLocaleDateString();
  };

  const getTimeIcon = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    return diffInHours < 24 ? Clock : Calendar;
  };

  const TimeIcon = getTimeIcon(post.createdAt);
  const { toast } = useToast();

  // Custom button component
  const ActionButton = ({ onClick, icon: Icon, label, isActive = false }) => (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center space-x-2 rounded-xl px-3 py-2 
        transition-all duration-200 flex-1 max-w-[120px] group
        ${isActive 
          ? 'text-red-500' 
          : 'text-muted-foreground hover:text-foreground'
        }
      `}
    >
      <div className={`relative transition-transform duration-200 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
        <Icon 
          size={18} 
          fill={isActive ? "currentColor" : "none"} 
        />
      </div>
      <span className={`text-xs font-medium transition-colors duration-200 ${isActive ? 'text-red-500' : ''}`}>
        {label}
      </span>
    </button>
  );

  const handleShare = async () => {
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
      console.error('copy failed', err);
      toast({ title: t('copyFailed', 'Copy failed'), description: t('copyFailedDesc', 'Could not copy link'), variant: 'destructive' });
    }
  };

  return (
    <Card className="w-full mx-auto border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-card/95">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-primary/10 shadow-lg rounded-lg">
                {authorAvatar ? (
                  <AvatarImage src={authorAvatar} alt={authorName} className="object-cover rounded-md" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-foreground font-semibold rounded-md border">
                    {getInitials(authorName)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Author Name as Main Title */}
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg truncate text-foreground">
                  {authorName}
                </h3>
                {isOwner && (
                  <Badge variant="secondary" className="text-xs px-2 py-0 bg-primary/10 text-primary">
                    {t('you', 'You')}
                  </Badge>
                )}
              </div>
              
              {/* Time and Location */}
              <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                <div className="flex items-center space-x-1">
                  <TimeIcon size={12} />
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
                {post.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{post.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-accent/50">
                <MoreVertical size={16} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem 
                  onClick={handleShare}
                className="flex items-center space-x-2 cursor-pointer text-sm"
              >
                <Share2 size={14} />
                <span>{t('share', 'Share')}</span>
              </DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(post._id)}
                  className="flex items-center space-x-2 text-destructive cursor-pointer text-sm"
                >
                  <Trash2 size={14} />
                  <span>{t('delete', 'Delete')}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Optional Post Title - Less Prominent */}
        {post.title && post.title !== authorName && (
          <div className="mb-3">
            <h4 className="font-semibold text-base text-foreground/90 border-l-2 border-primary pl-3 py-1">
              {post.title}
            </h4>
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Media Grid */}
        {post.images && post.images.length > 0 && (
          <div className="mt-4 rounded-xl overflow-hidden">
            <MediaGrid 
              files={post.images.map(img => ({
                url: img.isTemp ? img.url : getImageUrl(img.url || img.path || img),
                type: 'image',
                name: img.originalname || img.filename
              }))}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-3 pt-4">
        {/* Stats Row */}
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground px-1">
          <div className="flex items-center space-x-4">
            {likeCount > 0 && (
              <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1 rounded-full">
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart size={10} fill="white" className="text-white" />
                </div>
                <span className="font-medium">{likeCount}</span>
              </div>
            )}
            {(post.comments || []).length > 0 && (
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 bg-muted/30 px-3 py-1 rounded-full transition-colors duration-200 hover:bg-muted/50"
              >
                <MessageSquare size={14} />
                <span className="font-medium">{(post.comments || []).length}</span>
              </button>
            )}
          </div>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between w-full gap-1 border-t border-border/20 pt-3">
          <ActionButton
            onClick={handleLikeClick}
            icon={Heart}
            label={t('like', 'Like')}
            isActive={isLiked}
          />
          
          <ActionButton
            onClick={() => setShowComments(!showComments)}
            icon={MessageSquare}
            label={t('comment', 'Comment')}
          />
          
          <ActionButton
            onClick={handleShare}
            icon={Share2}
            label={t('share', 'Share')}
          />
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full animate-in fade-in duration-300 mt-2">
            <CommentsList 
              post={post} 
              onComment={handleComment} 
              me={me} 
              myUser={authState?.userData} 
              refreshParent={refreshParent} 
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostItem;