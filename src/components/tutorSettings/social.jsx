import React from 'react';
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
} from 'lucide-react';

const getYouTubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const SocialsSection = ({
  socialLinks = {},
  youtubeVideos = [],
  setSocialLinks,
  onVideoChange,
  onAddVideo,
  onRemoveVideo,
}) => {
  return (
    <Card className="shadow-lg border border-border rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Share2 className="w-6 h-6 text-primary" /> Social Media & Videos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Social Media Profile Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'youtube', label: 'YouTube Profile', Icon: Youtube },
            { name: 'twitter', label: 'Twitter', Icon: Twitter },
            { name: 'facebook', label: 'Facebook', Icon: Facebook },
            { name: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
            { name: 'instagram', label: 'Instagram', Icon: Instagram },
          ].map(({ name, label, Icon }) => (
            <div key={name} className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="w-5 h-5 text-primary" /> {label}
              </Label>
              <Input
                placeholder={`https://${name}.com/yourprofile`}
                value={socialLinks[name] || ''}
                onChange={(e) =>
                  setSocialLinks((prev) => ({
                    ...prev,
                    [name]: e.target.value,
                  }))
                }
                className="bg-input border border-border focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 rounded-md"
              />
            </div>
          ))}
        </div>

        {/* YouTube Video Links */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Youtube className="w-6 h-6 text-primary" /> YouTube Videos (Max 3)
          </Label>
          <div className="space-y-6">
            {youtubeVideos.map((video, index) => {
              const videoId = getYouTubeVideoId(video.url);
              return (
                <div
                  key={index}
                  className="space-y-4 p-4 bg-muted rounded-lg border border-border"
                >
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Video Title (Optional)
                      </Label>
                      <Input
                        placeholder={`Video ${index + 1}`}
                        value={video.title}
                        onChange={(e) =>
                          onVideoChange(index, 'title', e.target.value)
                        }
                        className="bg-input border border-border focus:ring-2 focus:ring-ring focus:border-ring rounded-md"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Video URL
                      </Label>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={video.url}
                        onChange={(e) =>
                          onVideoChange(index, 'url', e.target.value)
                        }
                        className="bg-input border border-border focus:ring-2 focus:ring-ring focus:border-ring rounded-md"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveVideo(index)}
                      className="mt-6 hover:bg-destructive/10 transition-colors duration-200"
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </div>
                  {videoId && (
                    <div className="mt-4">
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={video.title || `Video ${index + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {youtubeVideos.length < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddVideo}
              className="mt-4 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              <Plus className="w-5 h-5" /> Add Video
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialsSection;
