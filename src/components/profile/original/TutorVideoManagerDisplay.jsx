import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Play, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// Utilities
const getVideoId = (url) => {
  if (!url) return null;
  try {
    const safeUrl = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(safeUrl);
    const host = parsed.hostname.replace('www.', '');
    if (host === 'youtu.be') return parsed.pathname.slice(1);
    if (host.includes('youtube.com')) {
      return parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();
    }
  } catch (e) {
    const maybeId = url.match(/[a-zA-Z0-9_-]{11}/);
    return maybeId ? maybeId[0] : null;
  }
  return null;
};

const getEmbedUrl = (url) => {
  const id = getVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

const PlaylistThumb = ({ video, active, onClick, index, label }) => {
  const id = getVideoId(video?.url);
  const title = video?.title || label;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <button
      aria-pressed={active}
      aria-label={t('tutorVideos.selectVideo', 'Select video {{index}}: {{title}}', {
        index: index + 1,
        title,
      })}
      onClick={onClick}
      className={`group flex-shrink-0 w-[220px] md:w-[240px] lg:w-[260px] rounded-lg border-2 p-2 flex flex-col gap-2 transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-1
        ${active ? 'border-primary shadow-md bg-primary/5' : 'border-gray-300 hover:shadow-lg'}`}
    >
      <div className="relative overflow-hidden rounded-md aspect-video border">
        {id ? (
          <img
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt={title}
            loading="lazy"
            className={`w-full h-full object-cover transform transition-transform ${active ? 'scale-105' : 'group-hover:scale-105'}`}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-destructive">
            {t('tutorVideos.invalidUrl', 'Invalid URL')}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <Play size={26} className="text-white" />
        </div>

        {index === 0 && (
          <Badge
            variant="default"
            className="absolute top-2 left-2 bg-primary text-white text-xs shadow-md flex items-center"
          >
            <Tag size={12} className={isRTL ? 'ml-1' : 'mr-1'} /> {t('tutorVideos.intro', 'Introduction Video')}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            {active && <Play size={14} className="text-primary flex-shrink-0" />}
            <p
              className={`text-sm font-semibold truncate ${
                active ? 'text-primary' : 'text-card-foreground'
              } ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {title}
            </p>
          </div>
        </div>
        <div className={`text-xs ${active ? 'text-primary' : 'text-muted-foreground'}`}>
          {video.duration || ''}
        </div>
      </div>
    </button>
  );
};

export default function TutorVideoManagerDisplay({ videos = [], className = '' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    if (videos.length === 0) {
      setSelectedIndex(0);
    } else if (selectedIndex >= videos.length) {
      setSelectedIndex(0);
    }
  }, [videos, selectedIndex]);

  const selected = videos[selectedIndex] || null;
  const embedUrl = useMemo(() => (selected ? getEmbedUrl(selected.url) : null), [selected]);

  useEffect(() => {
    if (containerRef.current && videos.length > 0) {
      const el = containerRef.current.querySelectorAll('button')[selectedIndex];
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedIndex, videos]);

  useEffect(() => {
    const handler = (e) => {
      if (!videos.length) return;
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev + 1) % videos.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev - 1 + videos.length) % videos.length);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [videos]);

  const isSingleVideo = videos.length <= 1;

  return (
    <motion.div
      dir={i18n.dir()}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`w-full ${className}`}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <CardTitle className="text-base md:text-lg">{t('tutorVideos.title', 'Tutor Videos')}</CardTitle>
              <CardDescription className="text-sm md:text-base">
                {t('tutorVideos.description', 'Manage and preview your tutor recordings.')}
              </CardDescription>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Youtube size={20} />
              <span>{t('tutorVideos.videosCount', 'Videos: {{count}}', { count: videos.length })}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {videos.length === 0 ? (
            <div className={`py-12 flex flex-col items-center justify-center gap-4 text-center text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
              <Youtube size={48} className="text-primary" />
              <h4 className="text-lg font-semibold">{t('tutorVideos.noVideosTitle', 'No videos yet')}</h4>
              <p className="max-w-sm text-sm">{t('tutorVideos.noVideosDesc', 'There are no tutor videos attached. Add some YouTube links to get started.')}</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/3 lg:w-3/4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={`text-sm md:text-base font-medium truncate ${isRTL ? 'text-right' : 'text-left'}`}>
                      {selected?.title || t('tutorVideos.untitled', 'Untitled video')}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {selected?.section && (
                        <Badge variant="outline" className="text-xs">{selected.section}</Badge>
                      )}
                      <span>{selected?.uploadedAt || ''}</span>
                    </div>
                  </div>

                  <div className="w-full rounded-lg overflow-hidden border shadow-inner">
                    {embedUrl ? (
                      <motion.div
                        key={selected?.url}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.24 }}
                        className="aspect-video bg-black"
                      >
                        <iframe
                          src={embedUrl}
                          title={selected?.title || t('tutorVideos.tutorVideoTitle', 'Tutor video')}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </motion.div>
                    ) : (
                      <div className="aspect-video flex items-center justify-center text-sm text-destructive bg-muted">
                        {t('tutorVideos.invalidUrl', 'Invalid URL')}
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/30`}>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSingleVideo}
                      className="flex items-center gap-2 rounded-full px-4 py-2 font-medium border-primary/20 text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setSelectedIndex((prev) => (prev - 1 + videos.length) % videos.length)}
                    >
                      {isRTL ? (
                        <>
                          {t('tutorVideos.prev', 'Prev')}
                          <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <ChevronLeft className="h-4 w-4" />
                          {t('tutorVideos.prev', 'Prev')}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSingleVideo}
                      className="flex items-center gap-2 rounded-full px-4 py-2 font-medium border-primary/20 text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setSelectedIndex((prev) => (prev + 1) % videos.length)}
                    >
                      {isRTL ? (
                        <>
                          {t('tutorVideos.next', 'Next')}
                          <ChevronLeft className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          {t('tutorVideos.next', 'Next')}
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {selected && (
                      <div className="ml-auto px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {t('tutorVideos.playing', 'Playing')} {selectedIndex + 1}/{videos.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <aside className="w-full md:w-1/3 lg:w-1/4">
                <h4 className={`text-sm font-medium mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t('tutorVideos.playlist', 'Playlist')}</h4>

                <div
                  ref={containerRef}
                  className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[58vh] pb-2 md:pb-0"
                >
                  {videos.map((v, i) => (
                    <PlaylistThumb
                      key={i}
                      video={v}
                      index={i}
                      active={i === selectedIndex}
                      onClick={() => setSelectedIndex(i)}
                      label={t('tutorVideos.videoLabel', 'Video {{index}}', { index: i + 1 })}
                    />
                  ))}
                </div>
              </aside>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
