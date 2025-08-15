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
import { Youtube, Play, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getVideoId = (url) => {
  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsedUrl.hostname;
    if (hostname === 'youtu.be') return parsedUrl.pathname.slice(1);
    if (hostname.includes('youtube.com')) {
      return parsedUrl.searchParams.get('v') || 
             parsedUrl.pathname.split('/').pop();
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

const TutorVideoManagerDisplay = ({ videos = [] }) => {
  const { t } = useTranslation();
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Set initial selected video
  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    } else if (videos.length === 0) {
      setSelectedVideo(null);
    }
  }, [videos, selectedVideo]);

  const selectedEmbedUrl = selectedVideo ? getEmbedUrl(selectedVideo.url) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('tutorVideos.videosTitle')}</CardTitle>
          <CardDescription>{t('tutorVideos.videosDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Youtube size={40} className="mb-4 text-primary" />
              <h4 className="text-lg font-semibold">{t('tutorVideos.noVideosTitle')}</h4>
              <p className="text-sm mt-1 max-w-md">{t('tutorVideos.noVideosDescription')}</p>
            </div>
          ) : (
            <>
              {/* Main Video Player */}
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  {selectedVideo?.title || t('tutorVideos.untitledVideo')}
                </h4>
                {selectedEmbedUrl ? (
                  <motion.div
                    key={selectedVideo.url}
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
                  <p className="text-sm text-muted-foreground">{t('tutorVideos.invalidVideoUrl')}</p>
                )}
              </div>

              {/* Playlist */}
              {videos.length > 1 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">{t('tutorVideos.playlist')}</h4>
                  <div className="flex gap-4 py-3 -mx-1 px-1 overflow-x-auto flex-nowrap">
                    {videos.map((video, index) => {
                      const videoId = getVideoId(video.url);
                      const isActive = selectedVideo?.url === video.url;
                      const isIntro = index === 0;

                      return (
                        <motion.div
                          key={index}
                          onClick={() => setSelectedVideo(video)}
                          whileHover={{ scale: 1.02 }}
                          className={`
                            flex flex-col justify-between min-w-[260px] max-w-[260px] cursor-pointer 
                            rounded-lg p-3 space-y-2 transition-shadow border-2
                            ${isActive ? 'border-primary' : 'border-gray-300'}
                            ${!isActive && 'hover:shadow-md'}
                          `}
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold truncate text-card-foreground">
                              {video.title || t('tutorVideos.untitledVideo')}
                            </p>
                            {isIntro && (
                              <Badge variant="outline" className="text-xs">
                                <Tag size={12} className="mr-1 rtl:ml-1" />
                                {t('tutorVideos.videoSectionIntroduction')}
                              </Badge>
                            )}
                          </div>
                          <div className="relative aspect-video rounded overflow-hidden group border">
                            {videoId ? (
                              <img
                                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-destructive text-sm">
                                {t('tutorVideos.invalidVideoUrl')}
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

export default TutorVideoManagerDisplay;
