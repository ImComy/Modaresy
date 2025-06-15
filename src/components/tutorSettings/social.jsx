import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Youtube, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils'; // optional classNames utility

const SocialsSection = () => {
  const [socialLinks, setSocialLinks] = useState({
    youtube: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    instagram: '',
  });

  const [youtubeVideos, setYoutubeVideos] = useState(['']);

  const updateSocial = (platform, value) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const updateYoutubeVideo = (index, value) => {
    const updated = [...youtubeVideos];
    updated[index] = value;
    setYoutubeVideos(updated);
  };

  const addYoutubeVideo = () => {
    if (youtubeVideos.length < 3) {
      setYoutubeVideos([...youtubeVideos, '']);
    }
  };

  const removeYoutubeVideo = (index) => {
    const updated = youtubeVideos.filter((_, i) => i !== index);
    setYoutubeVideos(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Social Media Profile Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2">
              <Youtube className="w-4 h-4" /> YouTube Profile
            </Label>
            <Input
              placeholder="https://youtube.com/@yourchannel"
              value={socialLinks.youtube}
              onChange={(e) => updateSocial('youtube', e.target.value)}
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Twitter className="w-4 h-4" /> Twitter
            </Label>
            <Input
              placeholder="https://twitter.com/yourhandle"
              value={socialLinks.twitter}
              onChange={(e) => updateSocial('twitter', e.target.value)}
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Facebook className="w-4 h-4" /> Facebook
            </Label>
            <Input
              placeholder="https://facebook.com/yourpage"
              value={socialLinks.facebook}
              onChange={(e) => updateSocial('facebook', e.target.value)}
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </Label>
            <Input
              placeholder="https://linkedin.com/in/yourprofile"
              value={socialLinks.linkedin}
              onChange={(e) => updateSocial('linkedin', e.target.value)}
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram
            </Label>
            <Input
              placeholder="https://instagram.com/yourprofile"
              value={socialLinks.instagram}
              onChange={(e) => updateSocial('instagram', e.target.value)}
            />
          </div>
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
                  onChange={(e) => updateYoutubeVideo(index, e.target.value)}
                />
                {youtubeVideos.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeYoutubeVideo(index)}
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
              onClick={addYoutubeVideo}
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
