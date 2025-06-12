import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Youtube, Play, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { grades } from '@/data/formData';

const videoSections = [
  { value: 'introduction', labelKey: 'videoSectionIntroduction' },
  { value: 'sample_lesson', labelKey: 'videoSectionSampleLesson' },
  { value: 'topic_explanation', labelKey: 'videoSectionTopicExplanation' },
  { value: 'problem_solving', labelKey: 'videoSectionProblemSolving' },
  { value: 'other', labelKey: 'videoSectionOther' },
];

const getVideoId = (url) => {
  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsedUrl.hostname;
    if (hostname === 'youtu.be') return parsedUrl.pathname.slice(1);
    if (hostname.includes('youtube.com')) {
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v');
      } else if (parsedUrl.pathname.startsWith('/embed/')) {
        return parsedUrl.pathname.split('/embed/')[1];
      }
    }
  } catch {
    return null;
  }
  return null;
};

const getEmbedUrl = (url)=> {
  const id = getVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

const getThumbnailUrl = (url) => {
  const id = getVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const TutorVideoManager = ({ introVideoUrl, otherVideos = [] }) => {
  const { t } = useTranslation();
  const introEmbedUrl = getEmbedUrl(introVideoUrl);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('videosTitle')}</CardTitle>
          <CardDescription>{t('videosDesc')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Intro Video */}
          <div>
            <h4 className="font-medium text-foreground mb-2">{t('introVideo')}</h4>
            {introEmbedUrl ? (
              <div className="aspect-video rounded-lg overflow-hidden border shadow-inner">
                <iframe
                  src={introEmbedUrl}
                  title="Intro Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('noIntroVideo')}</p>
            )}
          </div>

          {/* Additional Videos */}
          <div>
            <h4 className="font-medium text-foreground mb-3">{t('additionalVideos')}</h4>
            {otherVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherVideos.map((video) => {
                  const thumbnail = getThumbnailUrl(video.url);
                  const sectionLabel = videoSections.find(s => s.value === video.section)?.labelKey;
                  return (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border rounded-lg p-3 space-y-2 bg-card shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold truncate text-card-foreground">
                          {video.title || t('untitledVideo')}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {video.section && sectionLabel && (
                            <Badge variant="outline">
                              <Tag size={12} className="mr-1 rtl:ml-1" />
                              {t(sectionLabel)}
                            </Badge>
                          )}
                          {video.grade && (
                            <Badge variant="secondary" className="text-xs">
                              {t(grades.find(g => g.value === video.grade)?.labelKey || video.grade)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block aspect-video rounded overflow-hidden group border"
                      >
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-destructive text-sm">
                            {t('invalidVideoUrl')}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                          <Youtube className="text-white mr-1" size={20} />
                          <Play className="text-white" size={28} />
                        </div>
                      </a>
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
