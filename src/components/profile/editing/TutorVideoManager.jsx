import React, { useState } from 'react';
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

const getVideoId = (url) => {
  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsedUrl.hostname;
    if (hostname === 'youtu.be') return parsedUrl.pathname.slice(1);
    if (hostname.includes('youtube.com')) {
      if (parsedUrl.pathname === '/watch') return parsedUrl.searchParams.get('v');
      if (parsedUrl.pathname.startsWith('/embed/')) return parsedUrl.pathname.split('/embed/')[1];
    }
  } catch {
    return null;
  }
  return null;
};

const getThumbnailUrl = (url) => {
  const id = getVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const TutorVideoManagerEdit = ({ introVideoUrl, otherVideos = [], onChange }) => {
  const { t } = useTranslation();
  const initialVideos = [
    ...(introVideoUrl
      ? [{ id: 'intro', title: t('videoManager.introVideo'), url: introVideoUrl }]
      : []),
    ...otherVideos,
  ];
  const [videos, setVideos] = useState(initialVideos);
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });

  const handleChangeAll = (newList) => {
    setVideos(newList);
    const [intro, ...rest] = newList;
    onChange?.({
      introVideoUrl: intro?.url || '',
      otherVideos: rest.map(({ id, title, url }) => ({ id, title, url })),
    });
  };

  const handleAddVideo = () => {
    if (!newVideo.url.trim()) return;
    const newList = [...videos, { ...newVideo, id: Date.now().toString() }];
    handleChangeAll(newList);
    setNewVideo({ title: '', url: '' });
  };

  const handleRemove = (id) => {
    const updated = videos.filter((v) => v.id !== id);
    handleChangeAll(updated);
  };

  const handleChange = (id, field, value) => {
    const updated = videos.map((v) => (v.id === id ? { ...v, [field]: value } : v));
    handleChangeAll(updated);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('videoManager.videosTitle')}</CardTitle>
          <CardDescription>{t('videoManager.videosDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((video, index) => {
                const thumbnail = getThumbnailUrl(video.url);
                const isIntro = index === 0;
                return (
                  <div
                    key={video.id}
                    className="rounded-xl border border-primary/30 shadow-sm p-4 flex flex-col gap-3 bg-background"
                  >
                    <div className="aspect-video rounded overflow-hidden border">
                      {thumbnail ? (
                        <img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-destructive">
                          {t('videoManager.invalidVideoUrl')}
                        </div>
                      )}
                    </div>
                    <Input
                      value={video.title}
                      placeholder={t('videoManager.videoTitle')}
                      onChange={(e) => handleChange(video.id, 'title', e.target.value)}
                      className="border-primary/30"
                    />
                    <Input
                      value={video.url}
                      placeholder={t('videoManager.videoUrl')}
                      onChange={(e) => handleChange(video.id, 'url', e.target.value)}
                      className="border-primary/30"
                    />
                    {!isIntro && (
                      <Button
                        variant="ghost"
                        className="self-end text-red-500 hover:text-red-700"
                        onClick={() => handleRemove(video.id)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        {t('delete')}
                      </Button>
                    )}
                    {isIntro && (
                      <p className="text-xs text-muted-foreground">{t('videoManager.introVideoLabel')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add New Video */}
          <div className="pt-6 border-t border-border space-y-4">
            <h4 className="font-semibold">{t('videoManager.addNewVideo')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                value={newVideo.title}
                onChange={(e) => setNewVideo((v) => ({ ...v, title: e.target.value }))}
                placeholder={t('videoManager.videoTitle')}
                className="border-primary/30"
              />
              <Input
                value={newVideo.url}
                onChange={(e) => setNewVideo((v) => ({ ...v, url: e.target.value }))}
                placeholder={t('videoManager.videoUrl')}
                className="border-primary/30"
              />
            </div>
            <Button onClick={handleAddVideo} className="mt-2 w-fit bg-primary hover:bg-primary/90">
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
