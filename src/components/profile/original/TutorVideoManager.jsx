import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Youtube, Play, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { grades } from '@/data/formData';

const videoSections = [
  { value: 'introduction', labelKey: 'videoManager.videoSectionIntroduction' },
  { value: 'sample_lesson', labelKey: 'videoManager.videoSectionSampleLesson' },
  { value: 'topic_explanation', labelKey: 'videoManager.videoSectionTopicExplanation' },
  { value: 'problem_solving', labelKey: 'videoManager.videoSectionProblemSolving' },
  { value: 'other', labelKey: 'videoManager.videoSectionOther' },
];

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

const getEmbedUrl = (url) => {
  const id = getVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

const getThumbnailUrl = (url) => {
  const id = getVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const TutorVideoManager = ({ introVideoUrl, otherVideos = [] }) => {
  const { t } = useTranslation();

  const allVideos = useMemo(() => {
    const introVideo = introVideoUrl
      ? {
          id: 'intro',
          url: introVideoUrl,
          title: t('videoManager.introVideo'),
          section: 'introduction',
        }
      : null;
    return [introVideo, ...otherVideos].filter(Boolean);
  }, [introVideoUrl, otherVideos, t]);

  const [selectedVideo, setSelectedVideo] = useState(allVideos[0]);
  const selectedEmbedUrl = getEmbedUrl(selectedVideo?.url);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('videoManager.videosTitle')}</CardTitle>
          <CardDescription>{t('videoManager.videosDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {allVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Youtube size={40} className="mb-4 text-primary" />
              <h4 className="text-lg font-semibold">{t('videoManager.noVideosTitle')}</h4>
              <p className="text-sm mt-1 max-w-md">{t('videoManager.noVideosDescription')}</p>
            </div>
          ) : (
            <>
              {/* Main Video Player */}
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  {selectedVideo?.title || t('videoManager.untitledVideo')}
                </h4>
                {selectedEmbedUrl ? (
                  <motion.div
                    key={selectedVideo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="aspect-video rounded-lg overflow-hidden border shadow-inner"
                  >
                    <iframe
                      src={selectedEmbedUrl}
                      title="Selected Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </motion.div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('videoManager.invalidVideoUrl')}</p>
                )}
              </div>

              {/* Playlist */}
              {allVideos.length > 1 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">{t('videoManager.playlist')}</h4>
                  <div
                    className={`
                      flex gap-4 py-3 -mx-1 px-1
                      overflow-x-auto flex-nowrap
                      sm:max-w-[260px] md:max-w-[804px] // 3 videos * (260px + 8px gap) = 804px
                    `}
                  >
                    {allVideos.map((video) => {
                      const thumbnail = getThumbnailUrl(video.url);
                      const isActive = selectedVideo?.id === video.id;
                      const sectionLabel = videoSections.find((s) => s.value === video.section)?.labelKey;

                      return (
                        <motion.div
                          key={video.id}
                          onClick={() => setSelectedVideo(video)}
                          whileHover={{ scale: 1.02 }}
                          className={`
                            min-w-[260px] max-w-[260px] cursor-pointer border rounded-lg p-3 space-y-2 transition-shadow
                            ${isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'}
                          `}
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold truncate text-card-foreground">
                              {video.title || t('videoManager.untitledVideo')}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {video.section && sectionLabel && (
                                <Badge variant="outline" className="text-xs">
                                  <Tag size={12} className="mr-1 rtl:ml-1" />
                                  {t(sectionLabel)}
                                </Badge>
                              )}
                              {video.grade && (
                                <Badge variant="secondary" className="text-xs">
                                  {t(grades.find((g) => g.value === video.grade)?.labelKey || video.grade)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="relative aspect-video rounded overflow-hidden group border">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-destructive text-sm">
                                {t('videoManager.invalidVideoUrl')}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                              <Youtube className="text-white mr-1" size={20} />
                              <Play className="text-white" size={28} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TutorVideoManager;