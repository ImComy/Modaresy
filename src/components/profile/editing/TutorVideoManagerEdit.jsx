import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Youtube, Plus, Trash, ExternalLink, Play } from 'lucide-react';


// Utility: extract YouTube video id from common URL formats.
function getThumbnailId(url) {
  if (!url) return null;
  try {
    const safe = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(safe);
    const host = parsed.hostname.replace('www.', '');
    if (host === 'youtu.be') return parsed.pathname.slice(1);
    if (host.includes('youtube.com')) return parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();
  } catch {
    const m = url.match(/[a-zA-Z0-9_-]{11}/);
    return m ? m[0] : null;
  }
  return null;
}

export default function TutorVideoManagerEdit({ videos: initialVideos = [], onChange }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir && i18n.dir() === 'rtl';

  const [videos, setVideos] = useState(initialVideos);
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });

  useEffect(() => {
    setVideos(initialVideos || []);
  }, [initialVideos]);

  const sync = (next) => {
    setVideos(next);
    onChange?.(next);
  };

  const handleAdd = () => {
    if (!newVideo.url.trim()) return;
    const next = [...videos, { ...newVideo }];
    sync(next);
    setNewVideo({ title: '', url: '' });
  };

  const handleRemove = (idx) => {
    const next = videos.filter((_, i) => i !== idx);
    sync(next);
  };

  const handleChange = (idx, field, value) => {
    const next = videos.map((v, i) => (i === idx ? { ...v, [field]: value } : v));
    sync(next);
  };

  return (
    <div className="w-full" dir={i18n.dir()}>
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <CardTitle className="text-base sm:text-lg">{t('videoManager.videosTitle')}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">{t('videoManager.videosDesc')}</CardDescription>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Youtube size={20} />
              <span>{t('videoManager.count', { count: videos.length })}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-3 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {videos.map((v, idx) => {
              const thumbId = getThumbnailId(v.url);

              return (
                <div
                  key={v.url + idx}
                  className="relative rounded-2xl overflow-hidden shadow-sm border border-border bg-card hover:shadow-lg"
                >
                  <div className="relative w-full h-40 bg-muted flex items-center justify-center">
                    {thumbId ? (
                      <img
                        src={`https://img.youtube.com/vi/${thumbId}/hqdefault.jpg`}
                        alt={v.title || t('videoManager.untitled')}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`flex items-center justify-center w-full h-full text-xs text-destructive ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('videoManager.invalidVideoUrl')}
                      </div>
                    )}

                    {thumbId && (
                      <a
                        href={`https://youtu.be/${thumbId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-3 top-3 inline-flex items-center gap-1 text-xs underline text-white/90"
                        aria-label={t('videoManager.openOnYoutube')}
                        title={t('videoManager.openOnYoutube')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="p-3 flex flex-col gap-2 min-h-[110px]">
                    <div className="flex flex-col gap-2">
                      <Input
                        value={v.title || ''}
                        onChange={(e) => handleChange(idx, 'title', e.target.value)}
                        placeholder={t('videoManager.videoTitle')}
                        className="h-9 text-sm"
                        aria-label={t('videoManager.videoTitle')}
                      />
                      <div className="flex flex-nowrap">
                        <Input
                          value={v.url || ''}
                          onChange={(e) => handleChange(idx, 'url', e.target.value)}
                          placeholder={t('videoManager.videoUrl')}
                          className="h-9 text-sm"
                          aria-label={t('videoManager.videoUrl')}
                        />

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            className="inline-flex items-center gap-2 px-2 py-1 rounded text-destructive text-sm"
                            aria-label={t('videoManager.delete')}
                          >
                            <Trash className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('videoManager.delete')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 p-2 rounded-lg border border-dashed border-border">
            <Input
              value={newVideo.title}
              onChange={(e) => setNewVideo((s) => ({ ...s, title: e.target.value }))}
              placeholder={t('videoManager.videoTitle')}
              className="h-9 text-sm flex-1 md:flex-[2]"
              aria-label={t('videoManager.videoTitle')}
            />

            <Input
              value={newVideo.url}
              onChange={(e) => setNewVideo((s) => ({ ...s, url: e.target.value }))}
              placeholder={t('videoManager.videoUrl')}
              className="h-9 text-sm flex-1 md:flex-[1]"
              aria-label={t('videoManager.videoUrl')}
            />

            <Button
              onClick={handleAdd}
              disabled={!newVideo.url.trim()}
              className="inline-flex items-center gap-2 h-9 md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">{t('videoManager.addVideo')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
