import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Trash2,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Share2,
  Mail,
  Globe,
  MessageCircle,
  Send,
  Video,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import clsx from 'clsx';

const PLATFORMS = [
  { name: 'facebook', label: 'facebook', defaultLabel: 'Facebook', Icon: Facebook },
  { name: 'instagram', label: 'instagram', defaultLabel: 'Instagram', Icon: Instagram },
  { name: 'twitter', label: 'twitter', defaultLabel: 'Twitter', Icon: Twitter },
  { name: 'linkedin', label: 'linkedin', defaultLabel: 'LinkedIn', Icon: Linkedin },
  { name: 'youtube', label: 'youtube', defaultLabel: 'YouTube Profile', Icon: Youtube },
  { name: 'tiktok', label: 'tiktok', defaultLabel: 'TikTok', Icon: Video },
  { name: 'whatsapp', label: 'whatsapp', defaultLabel: 'WhatsApp', Icon: MessageCircle },
  { name: 'telegram', label: 'telegram', defaultLabel: 'Telegram', Icon: Send },
  { name: 'email', label: 'email', defaultLabel: 'Email', Icon: Mail },
  { name: 'website', label: 'website', defaultLabel: 'Website', Icon: Globe },
];

const getYouTubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const SocialsSection = ({
  socialLinks = {
    facebook: 'https://www.facebook.com/ahmed.hassan',
    instagram: 'https://www.instagram.com/ahmed.hassan',
    twitter: 'https://twitter.com/ahmed_hassan',
    linkedin: 'https://www.linkedin.com/in/ahmed-hassan',
    youtube: 'https://www.youtube.com/channel/ahmed.hassan',
    tiktok: 'https://www.tiktok.com',
    whatsapp: 'https://wa.me/01234567890',
    telegram: 'https://t.me/ahmed_hassan',
    email: 'info@modaresy.com',
    website: 'https://www.modaresy.com',
    github: '',
  },
  youtubeVideos = [],
  setSocialLinks,
  onVideoChange,
  onAddVideo,
  onRemoveVideo,
}) => {
  const { t } = useTranslation();
  const [newPlatform, setNewPlatform] = useState('');
  const [newLink, setNewLink] = useState('');

  const availablePlatforms = PLATFORMS.filter(
    (platform) => !Object.keys(socialLinks).includes(platform.name) || socialLinks[platform.name] === ''
  );

  const handleAddLink = () => {
    if (newPlatform && newLink.trim()) {
      setSocialLinks((prev) => ({
        ...prev,
        [newPlatform]: newLink.trim(),
      }));
      setNewPlatform('');
      setNewLink('');
    }
  };

  const handleRemoveLink = (platform) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: '',
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-2xl border border-border/20 bg-background/95 backdrop-blur-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-primary">
            <Share2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            {t('socialMediaAndVideos', 'Social Media & Videos')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Social Media Profile Links */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground">
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              {t('socialLinks', 'Social Links')}
            </Label>
            <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-auto scrollbar-hidden pb-2">
              <AnimatePresence>
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  const platformConfig = PLATFORMS.find((p) => p.name === platform);
                  if (!platformConfig) return null;
                  const { Icon, label, defaultLabel } = platformConfig;
                  return (
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: -90 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center gap-2 bg-muted/60 px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-border/30 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 min-w-[150px]"
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[100px] sm:max-w-[150px]">
                        {t(label, defaultLabel)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLink(platform)}
                        className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-destructive/20"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  {t('selectPlatform', 'Select Platform')}
                </Label>
                <Select value={newPlatform} onValueChange={setNewPlatform}>
                  <SelectTrigger className="bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary h-10 sm:h-11 text-xs sm:text-sm">
                    <SelectValue placeholder={t('selectPlatformPlaceholder', 'Select a platform')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((platform) => (
                      <SelectItem key={platform.name} value={platform.name} className="text-xs sm:text-sm">
                        {t(platform.label, platform.defaultLabel)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full">
                <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  {t('linkUrl', 'Link URL')}
                </Label>
                <Input
                  placeholder={t('linkUrlPlaceholder', 'Enter your link')}
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="bg-input border border-border/50 focus:ring-2 focus:ring-primary rounded-lg h-10 sm:h-11 text-xs sm:text-sm transition-all duration-300"
                />
              </div>
                <Button
                  variant="outline"
                  onClick={handleAddLink}
                  disabled={!newPlatform || !newLink.trim()}
                  className="h-10 sm:h-11 w-full sm:w-auto bg-gradient-to-r from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20 hover:text-primary-foreground transition-all duration-300 rounded-lg shadow-sm hover:shadow-md text-xs sm:text-sm px-4 sm:px-6"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  {t('addLink', 'Add Link')}
                </Button>
            </div>
          </div>

          {/* YouTube Video Links */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground">
              <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              {t('youtubeVideos', 'YouTube Videos (Max 3)')}
            </Label>
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence>
                {youtubeVideos.map((video, index) => {
                  const videoId = getYouTubeVideoId(video.url);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={clsx(
                        'relative space-y-4 p-4 sm:p-6 bg-muted/50 rounded-xl border border-border/50',
                        'transition-colors duration-300 ring-1 ring-transparent hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background',
                        index === 0 && 'ring-2 ring-primary/30 bg-primary/5'
                      )}
                    >
                      {index === 0 && (
                        <div className="absolute -top-3 left-3 bg-primary text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow-md">
                          {t('introductionVideo', 'Introduction Video')}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="flex-1 w-full space-y-2">
                          <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">
                            {t('videoTitle', 'Video Title')}
                          </Label>
                          <Input
                            required
                            placeholder={t('videoTitlePlaceholder', { index: index + 1 })}
                            value={video.title}
                            onChange={(e) => onVideoChange(index, 'title', e.target.value)}
                            className="bg-input border border-border/50 focus:ring-2 focus:ring-primary rounded-lg h-10 sm:h-11 text-xs sm:text-sm transition-all duration-300"
                          />
                        </div>
                        <div className="flex gap-3 items-end">
                          <div className=" w-full space-y-2">
                            <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">
                              {t('videoUrl', 'Video URL')}
                            </Label>
                            <Input
                              placeholder={t('videoUrlPlaceholder', 'https://www.youtube.com/watch?v=...')}
                              value={video.url}
                              onChange={(e) => onVideoChange(index, 'url', e.target.value)}
                              className="bg-input border border-border/50 focus:ring-2 focus:ring-primary rounded-lg h-10 sm:h-11 text-xs sm:text-sm transition-all duration-300"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveVideo(index)}
                            className="h-10 w-10 sm:h-11 sm:w-11 hover:bg-destructive/20 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {videoId && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <iframe
                            width="100%"
                            height="150"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={video.title || t('videoTitlePlaceholder', { index: index + 1 })}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg shadow-md"
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {youtubeVideos.length < 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddVideo}
                  className="mt-4 w-full sm:w-auto bg-gradient-to-r from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20 hover:text-primary-foreground transition-all duration-300 rounded-lg shadow-sm hover:shadow-md text-xs sm:text-sm px-4 sm:px-6 h-10 sm:h-11"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  {t('addVideo', 'Add Video')}
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SocialsSection;