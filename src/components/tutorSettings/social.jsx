import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Youtube, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';

const SocialsSection = ({
  socialLinks = {},
  youtubeVideos = [],
  onSocialChange,
  onVideoChange,
  onAddVideo,
  onRemoveVideo,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Social Media Profile Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'youtube', label: 'YouTube Profile', Icon: Youtube },
            { name: 'twitter', label: 'Twitter', Icon: Twitter },
            { name: 'facebook', label: 'Facebook', Icon: Facebook },
            { name: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
            { name: 'instagram', label: 'Instagram', Icon: Instagram },
          ].map(({ name, label, Icon }) => (
            <div key={name}>
              <Label className="flex items-center gap-2">
                <Icon className="w-4 h-4" /> {label}
              </Label>
              <Input
                placeholder={`https://${name}.com/yourprofile`}
                value={socialLinks[name] || ''}
                onChange={(e) => onSocialChange(name, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* YouTube Video Links (max 3) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <Youtube className="w-4 h-4" /> YouTube Video Links (max 3)
          </Label>
          <div className="space-y-3">
            {youtubeVideos.map((link, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder={`Video Link ${index + 1}`}
                  value={link}
                  onChange={(e) => onVideoChange(index, e.target.value)}
                />
                {youtubeVideos.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveVideo(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {youtubeVideos.length < 3 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={onAddVideo}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Video
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialsSection;