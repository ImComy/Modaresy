import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { BookOpen, Award, Building, GraduationCap, MapPin, Plus, Trash, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import renderStars from '@/components/ui/renderStars';
import { locations } from '@/data/formData';
import BannerCropOverlay from '../../ui/cropper';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaTelegramPlane,
  FaWhatsapp,
  FaEnvelope,
  FaGlobe,
} from 'react-icons/fa';

const socialIcons = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  twitter: FaTwitter,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  telegram: FaTelegramPlane,
  whatsapp: FaWhatsapp,
  email: FaEnvelope,
  website: FaGlobe,
};

const TutorProfileHeaderEdit = ({ tutor, onChange }) => {
  const { t } = useTranslation();
  const [newDetailLoc, setNewDetailLoc] = useState('');
  const [socials, setSocials] = useState(tutor.socials || {});
  const [subjects, setSubjects] = useState(tutor.subjects || []);
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' });
  const [socialEditOpen, setSocialEditOpen] = useState(false);
  const [cropOverlay, setCropOverlay] = useState({ open: false, image: null, shape: 'banner' });

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  const allRatings = tutor.subjects?.map(s => s.rating).filter(r => typeof r === 'number' && isFinite(r));
  const averageRating = allRatings?.length ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : null;

  const updateDetailedLocation = (newList) => {
    handleFieldChange('detailedLocation', newList);
  };

  const addDetailedLocation = () => {
    const trimmed = newDetailLoc.trim();
    if (trimmed && !(tutor.detailedLocation || []).includes(trimmed)) {
      const updated = [...(tutor.detailedLocation || []), trimmed];
      updateDetailedLocation(updated);
      setNewDetailLoc('');
    }
  };

  const removeDetailedLocation = (index) => {
    const updated = [...(tutor.detailedLocation || [])];
    updated.splice(index, 1);
    updateDetailedLocation(updated);
  };

  const handleSocialChange = (platform, value) => {
    const updated = { ...socials, [platform]: value };
    setSocials(updated);
    handleFieldChange('socials', updated);
  };

  const addSocial = () => {
    if (newSocial.platform && newSocial.url) {
      handleSocialChange(newSocial.platform, newSocial.url);
      setNewSocial({ platform: '', url: '' });
    }
  };

  const removeSocial = (platform) => {
    const updated = { ...socials };
    delete updated[platform];
    setSocials(updated);
    handleFieldChange('socials', updated);
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: field === 'yearsExp' ? parseInt(value) || 0 : value };
    setSubjects(updated);
    handleFieldChange('subjects', updated);
  };

  const addSubject = () => {
    const newSubject = { subject: '', grade: '', type: '', yearsExp: 0 };
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    handleFieldChange('subjects', updated);
  };

  const removeSubject = (index) => {
    const updated = [...subjects];
    updated.splice(index, 1);
    setSubjects(updated);
    handleFieldChange('subjects', updated);
  };

  const handleFileSelect = (e, shape) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCropOverlay({ open: true, image: imageUrl, shape });
    }
  };

  const handleCrop = (croppedFile) => {
    handleFieldChange(cropOverlay.shape === 'profile' ? 'img' : 'bannerimg', croppedFile);
    setCropOverlay({ open: false, image: null, shape: 'banner' });
  };

  const handleCancelCrop = () => {
    setCropOverlay({ open: false, image: null, shape: 'banner' });
  };

  return (
    <>
      {cropOverlay.open && (
        <BannerCropOverlay
          rawImage={cropOverlay.image}
          onCancel={handleCancelCrop}
          onCrop={handleCrop}
          shape={cropOverlay.shape}
        />
      )}
      <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
        <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
          <label className="absolute top-2 right-2 z-20 bg-primary/90 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary transition-colors shadow-md hover:shadow-lg">
            {t('changeBanner')}
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'banner')}
            />
          </label>
          <img
            src={
              tutor.bannerimg instanceof File
                ? URL.createObjectURL(tutor.bannerimg)
                : tutor.bannerimg || 'https://placehold.co/600x200?text=Tutor'
            }
            alt={tutor.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x200?text=Tutor';
            }}
          />
        </div>

        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative w-40 h-40 border-2 border-primary rounded-md shadow-lg -mt-20 md:mt-0 z-10">
              <label className="absolute bottom-2 right-2 z-20 bg-primary/90 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-primary transition-colors shadow-md hover:shadow-lg text-xs">
                {t('changeAvatar')}
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'profile')}
                />
              </label>
              <Avatar className="w-full h-full rounded-sm">
                <AvatarImage
                  src={tutor.img instanceof File ? URL.createObjectURL(tutor.img) : tutor.img}
                  alt={tutor.name}
                />
                <AvatarFallback className="text-3xl rounded-sm">
                  {tutor.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>

            <Input
              className="mt-3 text-center font-bold text-lg w-full max-w-xs border-primary/30 focus:border-primary transition-colors"
              value={tutor.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder={t('yourName')}
            />

            <div className="text-sm text-muted-foreground mt-1 flex justify-center items-center gap-1">
              {averageRating ? (
                <>
                  {renderStars(averageRating)} <span>({averageRating.toFixed(1)})</span>
                </>
              ) : (
                t('noRating')
              )}
            </div>

            <Button
              variant="outline"
              className="mt-4 w-full max-w-xs flex items-center justify-center gap-2 whitespace-nowrap border-primary/30 hover:bg-primary/10 transition-colors"
              onClick={() => setSocialEditOpen(true)}
            >
              {t('editSocials')}
            </Button>
          </motion.div>

          {/* Social Media Overlay */}
          {socialEditOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{t('editSocials')}</h2>
                  <Button variant="ghost" onClick={() => setSocialEditOpen(false)}>
                    <X size={20} />
                  </Button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(socials).map(([platform, url]) => (
                    <div key={platform} className="flex items-center gap-2">
                      <Input
                        value={url}
                        onChange={(e) => handleSocialChange(platform, e.target.value)}
                        placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                        className="border-primary/30 focus:border-primary transition-colors"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocial(platform)}
                      >
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Select
                      value={newSocial.platform}
                      onValueChange={(value) => setNewSocial((prev) => ({ ...prev, platform: value }))}
                    >
                      <SelectTrigger className="border-primary/30 focus:border-primary transition-colors">
                        <SelectValue placeholder={t('selectPlatform')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(socialIcons).map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={newSocial.url}
                      onChange={(e) => setNewSocial((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder={t('enterUrl')}
                      className="border-primary/30 focus:border-primary transition-colors"
                    />
                    <Button onClick={addSocial} size="sm">
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full mt-4 bg-primary hover:bg-primary/90 transition-colors"
                  onClick={() => setSocialEditOpen(false)}
                >
                  {t('done')}
                </Button>
              </div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="md:col-span-2 space-y-4 flex flex-col items-center text-center md:items-start md:text-left"
          >
            <div className="flex flex-col md:flex-row w-full gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-5 text-base text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Award size={18} className="mt-0.5 text-primary shrink-0" />
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={Math.max(...(subjects?.map(s => s.yearsExp || 0) || [0]))}
                        onChange={(e) => {
                          const maxYears = parseInt(e.target.value) || 0;
                          setSubjects(subjects.map(s => ({ ...s, yearsExp: maxYears })));
                          handleFieldChange('subjects', subjects.map(s => ({ ...s, yearsExp: maxYears })));
                        }}
                        placeholder={t('yearsExp')}
                        className="w-full max-w-xs border-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 text-primary shrink-0" />
                    <div className="flex-1">
                      <Select
                        value={tutor.location || ''}
                        onValueChange={(val) => handleFieldChange('location', val)}
                      >
                        <SelectTrigger className="w-full max-w-xs border-primary/30 focus:border-primary transition-colors">
                          <SelectValue placeholder={t('selectLocation')} />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc.value} value={loc.value}>
                              {loc.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 flex-wrap">
                    <Building size={18} className="mt-0.5 text-primary shrink-0" />
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newDetailLoc}
                          onChange={(e) => setNewDetailLoc(e.target.value)}
                          placeholder={t('addArea')}
                          className="max-w-xs border-primary/30 focus:border-primary transition-colors"
                        />
                        <Button size="sm" onClick={addDetailedLocation}>
                          <Plus size={16} />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(tutor.detailedLocation || []).map((loc, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-muted text-sm text-muted-foreground rounded border border-border"
                          >
                            {loc}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDetailedLocation(index)}
                            >
                              <Trash size={12} className="text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "hidden md:block w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 z-30 max-h-[350px] overflow-y-auto flex-1 min-w-0 md:max-w-xs -mt-[200px] mr-14 "
                )}
              >
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={20} className="text-primary" />
                  <span className="text-lg font-semibold">{t('teachesSubjects')}:</span>
                </div>
                <div className="space-y-3">
                  {subjects.map((subject, index) => (
                    <div key={index} className="space-y-2 border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={subject.subject}
                          onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                          placeholder={t('subject')}
                          className="border-primary/30 focus:border-primary transition-colors"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSubject(index)}
                        >
                          <Trash size={12} className="text-destructive" />
                        </Button>
                      </div>
                      <Input
                        value={subject.grade}
                        onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)}
                        placeholder={t('grade')}
                        className="border-primary/30 focus:border-primary transition-colors"
                      />
                      <Input
                        value={subject.type}
                        onChange={(e) => handleSubjectChange(index, 'type', e.target.value)}
                        placeholder={t('type')}
                        className="border-primary/30 focus:border-primary transition-colors"
                      />
                      <Input
                        type="number"
                        value={subject.yearsExp}
                        onChange={(e) => handleSubjectChange(index, 'yearsExp', e.target.value)}
                        placeholder={t('yearsExp')}
                        className="border-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    onClick={addSubject}
                    className="bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={16} className="mr-2" />
                    {t('addSubject')}
                  </Button>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "block sm:w-80 sm:max-w-[90vw] sm:p-6",
                "bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 z-30 max-h-80 overflow-y-auto",
                "md:hidden w-full"
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} className="text-primary" />
                <span className="text-lg font-semibold">{t('teachesSubjects')}:</span>
              </div>
              <div className="space-y-3">
                {subjects.map((subject, index) => (
                  <div key={index} className="space-y-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={subject.subject}
                        onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                        placeholder={t('subject')}
                        className="border-primary/30 focus:border-primary transition-colors"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSubject(index)}
                      >
                        <Trash size={12} className="text-destructive" />
                      </Button>
                    </div>
                    <Input
                      value={subject.grade}
                      onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)}
                      placeholder={t('grade')}
                      className="border-primary/30 focus:border-primary transition-colors"
                    />
                    <Input
                      value={subject.type}
                      onChange={(e) => handleSubjectChange(index, 'type', e.target.value)}
                      placeholder={t('type')}
                      className="border-primary/30 focus:border-primary transition-colors"
                    />
                    <Input
                      type="number"
                      value={subject.yearsExp}
                      onChange={(e) => handleSubjectChange(index, 'yearsExp', e.target.value)}
                      placeholder={t('yearsExp')}
                      className="border-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                ))}
                <Button
                  size="sm"
                  onClick={addSubject}
                  className="bg-primary hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  {t('addSubject')}
                </Button>
              </div>
            </motion.div>

            <Separator className="my-4" />

            <div className="w-full">
              <h2 className="text-xl font-semibold text-primary mb-2">{t('aboutMe')}</h2>
              <Textarea
                value={tutor.GeneralBio || ''}
                onChange={(e) => handleFieldChange('GeneralBio', e.target.value)}
                className="w-full min-h-[120px] bg-muted/50 p-4 rounded-md border border-primary/30 focus:border-primary transition-colors"
                placeholder={t('writeSomethingAboutYou')}
              />
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </>
  );
};

export default TutorProfileHeaderEdit;