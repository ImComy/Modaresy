import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';

const getThumbnailUrl = (url) => {
  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsedUrl.hostname;
    if (hostname === 'youtu.be') return parsedUrl.pathname.slice(1);
    if (hostname.includes('youtube.com')) {
      const videoId = parsedUrl.searchParams.get('v') || 
                     parsedUrl.pathname.split('/').pop();
      return videoId;
    }
  } catch {
    return null;
  }
  return null;
};

const TutorVideoManagerEdit = ({ videos: initialVideos = [], onChange }) => {
  const [videos, setVideos] = useState(initialVideos);
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });

  // Sync with parent when initialVideos changes
  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  const handleAddVideo = () => {
    if (!newVideo.url.trim()) return;
    const newList = [...videos, { ...newVideo }];
    setVideos(newList);
    onChange?.(newList);
    setNewVideo({ title: '', url: '' });
  };
  const { t } = useTranslation();

  const handleRemove = (index) => {
    const updated = videos.filter((_, i) => i !== index);
    setVideos(updated);
    onChange?.(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = videos.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    );
    setVideos(updated);
    onChange?.(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="overflow-hidden shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{t('videoManager.videosTitle')}</CardTitle>
          <CardDescription className="text-sm">{t('videoManager.videosDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          {videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {videos.map((video, index) => {
                const videoId = getThumbnailUrl(video.url);
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-primary/30 shadow-sm p-4 flex flex-col gap-3 bg-background"
                  >
                    <div className="aspect-video rounded overflow-hidden border">
                      {videoId ? (
                        <img 
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-destructive">
                          {t('videoManager.invalidVideoUrl')}
                        </div>
                      )}
                    </div>
                    <Input
                      value={video.title}
                      placeholder={t('videoManager.videoTitle')}
                      onChange={(e) => handleChange(index, 'title', e.target.value)}
                      className="border-primary/30 h-9 text-sm"
                    />
                    <Input
                      value={video.url}
                      placeholder={t('videoManager.videoUrl')}
                      onChange={(e) => handleChange(index, 'url', e.target.value)}
                      className="border-primary/30 h-9 text-sm"
                    />
                    <Button
                      variant="ghost"
                      className="self-end text-red-500 hover:text-red-700 h-9 w-9 sm:w-auto"
                      onClick={() => handleRemove(index)}
                    >
                      <Trash className="w-4 h-4 mr-2 sm:mr-2 rtl:ml-2 rtl:ml-2" />
                      <span className="hidden sm:inline">{t('delete')}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add New Video */}
          <div className="pt-6 border-t border-border space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">{t('videoManager.addNewVideo')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                value={newVideo.title}
                onChange={(e) => setNewVideo(v => ({ ...v, title: e.target.value }))}
                placeholder={t('videoManager.videoTitle')}
                className="border-primary/30 h-9 text-sm"
              />
              <Input
                value={newVideo.url}
                onChange={(e) => setNewVideo(v => ({ ...v, url: e.target.value }))}
                placeholder={t('videoManager.videoUrl')}
                className="border-primary/30 h-9 text-sm"
              />
            </div>
            <Button
              onClick={handleAddVideo}
              className="mt-2 w-full sm:w-fit bg-primary hover:bg-primary/90 h-9 text-sm"
              disabled={!newVideo.url.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('videoManager.addVideo')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TutorVideoManagerEdit;