import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, Youtube, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const videoSections = [
  { value: 'introduction', labelKey: 'videoSectionIntroduction' },
  { value: 'sample_lesson', labelKey: 'videoSectionSampleLesson' },
  { value: 'topic_explanation', labelKey: 'videoSectionTopicExplanation' },
  { value: 'problem_solving', labelKey: 'videoSectionProblemSolving' },
  { value: 'other', labelKey: 'videoSectionOther' },
];

const TutorVideoManager = ({ introVideoUrl, otherVideos = [] }) => {
  const { t } = useTranslation();
  const [selectedVideo, setSelectedVideo] = useState(null);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const hostname = urlObj.hostname;
      let videoId = null;

      if (hostname === 'youtu.be') {
        videoId = urlObj.pathname.substring(1);
      } else if (hostname.includes('youtube.com')) {
        if (urlObj.pathname.startsWith('/watch')) {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.startsWith('/embed/')) {
          videoId = urlObj.pathname.split('/embed/')[1];
        }
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
      return null;
    }
  };

  const mainVideoEmbedUrl = getEmbedUrl(selectedVideo?.url || introVideoUrl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('videosTitle')}</CardTitle>
          <CardDescription>{t('videosDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">{t('introVideo')}</h4>
            {mainVideoEmbedUrl ? (
              <motion.div
                key={mainVideoEmbedUrl}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="aspect-video rounded-lg overflow-hidden border shadow-inner"
              >
                <iframe
                  src={mainVideoEmbedUrl}
                  title={selectedVideo?.title || t('introVideo')}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </motion.div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('noIntroVideo')}</p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">{t('additionalVideos')}</h4>
            {otherVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherVideos.map((video) => {
                  const embedUrl = getEmbedUrl(video.url);
                  const sectionLabel = videoSections.find(s => s.value === video.section)?.labelKey;
                  return (
                    <motion.div
                      key={video.id || video.url}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative group border rounded-lg p-3 space-y-2 bg-card shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold truncate text-card-foreground">
                          {video.title || t('untitledVideo')}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {video.section && sectionLabel && (
                            <Badge variant="outline">
                              <Tag size={12} className="mr-1 rtl:ml-1" />
                              {t(sectionLabel)}
                            </Badge>
                          )}
                          {video.grade && (
                            <Badge variant="secondary" className="text-xs">
                              {t(video.grade)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {embedUrl ? (
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="block aspect-video rounded overflow-hidden relative bg-muted group/play w-full"
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Youtube size={48} className="text-red-600 opacity-70 group-hover/play:opacity-50 transition-opacity" />
                          </div>
                          <div className="absolute inset-0 bg-black/20 group-hover/play:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover/play:opacity-100">
                            <Play size={36} className="text-white drop-shadow-lg" />
                          </div>
                          <img
                            src={`https://img.youtube.com/vi/${embedUrl.split('/').pop()}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ) : (
                        <div className="aspect-video rounded bg-muted flex items-center justify-center border border-dashed">
                          <p className="text-xs text-destructive px-2 text-center">{t('invalidVideoUrl')}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">{t('noAdditionalVideos')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TutorVideoManager;