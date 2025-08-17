import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MapPin, BookOpen, MessageSquare, Heart, Award, Building, GraduationCap, Star, Plus, Trash, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import BannerCropOverlay from '../../ui/cropper';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import { getConstants } from '@/api/constantsFetch';
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
import { Label } from '../../ui/label';
import AddSubjectCard from './SubjectSection';

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

const TutorProfileHeaderEdit = ({ 
  tutor, 
  onChange,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  isSubjectMutating
}) => {
  const { t } = useTranslation();
  const [constants, setConstants] = useState(null);
  const [formData, setFormData] = useState(initializeFormData(tutor));
  const [cropOverlay, setCropOverlay] = useState({ open: false, image: null, shape: 'banner' });
  const [socialEditOpen, setSocialEditOpen] = useState(false);
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' });

  // Initialize form data with safe defaults
  function initializeFormData(tutorData) {
    return {
      name: tutorData?.name || '',
      img: tutorData?.img || '',
      bannerimg: tutorData?.bannerimg || '',
      about_me: tutorData?.about_me || '',
      governate: tutorData?.governate || '',
      district: tutorData?.district || '',
      address: tutorData?.address || '',
      experience_years: tutorData?.experience_years || 0,
      social_media: tutorData?.social_media || {},
      subject_profiles: tutorData?.subject_profiles || [],
      rating: tutorData?.rating || 0,
      subjects: tutorData?.subjects || [],
    };
  }

  useEffect(() => {
    if (tutor) {
      setFormData(initializeFormData(tutor));
    }
  }, [tutor]);

  useEffect(() => {
    const loadConstants = async () => {
      try {
        const data = await getConstants();
        setConstants(data);
      } catch (error) {
        console.error('Failed to load constants:', error);
      }
    };
    loadConstants();
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      onChange?.(field, value);
      return newData;
    });
  };

  const handleSocialChange = (platform, url) => {
    setFormData(prev => {
      const updatedSocials = { ...prev.social_media, [platform]: url };
      onChange?.('social_media', updatedSocials);
      return { ...prev, social_media: updatedSocials };
    });
  };

  const addSocial = () => {
    if (newSocial.platform && newSocial.url) {
      handleSocialChange(newSocial.platform, newSocial.url);
      setNewSocial({ platform: '', url: '' });
    }
  };

  const removeSocial = (platform) => {
    setFormData(prev => {
      // Create a NEW object without the deleted platform
      const { [platform]: _, ...updatedSocials } = prev.social_media;
      
      onChange?.('social_media', updatedSocials);
      return { ...prev, social_media: updatedSocials };
    });
  };

  const handleFileSelect = (e, shape) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCropOverlay({ open: true, image: imageUrl, shape });
    }
  };

  const handleCrop = (croppedFile) => {
    const field = cropOverlay.shape === 'profile' ? 'img' : 'bannerimg';
    handleFieldChange(field, croppedFile);
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
        {/* Banner Image */}
        <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
          <label className="absolute top-4 right-4 z-20 bg-primary/90 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary transition-colors shadow-md hover:shadow-lg">
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
              formData.bannerimg instanceof File
                ? URL.createObjectURL(formData.bannerimg)
                : formData.bannerimg || 'https://placehold.co/600x200?text=Tutor+Banner'
            }
            alt={formData.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x200?text=Tutor+Banner';
              e.currentTarget.onerror = null;
            }}
          />
        </div>

        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Left Column - Profile Picture and Basic Info */}
          <ProfileSection 
            formData={formData}
            handleFieldChange={handleFieldChange}
            handleFileSelect={handleFileSelect}
            setSocialEditOpen={setSocialEditOpen}
            socialMedia={formData.social_media}
            constants={constants}
            t={t}
          />

          {/* Right Column - Detailed Information */}
          <DetailsSection
            formData={formData}
            handleFieldChange={handleFieldChange}
            onAddSubject={onAddSubject}
            onUpdateSubject={onUpdateSubject}
            onDeleteSubject={onDeleteSubject}
            constants={constants}
            t={t}
            isSubjectMutating={isSubjectMutating}
          />
        </CardContent>
      </Card>

      {/* Social Media Edit Modal */}
      <SocialMediaModal
        open={socialEditOpen}
        onClose={() => setSocialEditOpen(false)}
        socialMedia={formData.social_media}
        newSocial={newSocial}
        setNewSocial={setNewSocial}
        handleSocialChange={handleSocialChange}
        removeSocial={removeSocial}
        addSocial={addSocial}
        onChange={handleFieldChange}
        t={t}
      />
    </>
  );
};

// Extracted sub-components
const ProfileSection = ({ formData, handleFieldChange, handleFileSelect, setSocialEditOpen, socialMedia, constants, t }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center text-center"
  >
    <div className="flex flex-col items-center gap-4 text-center -mt-20 md:mt-0 z-10">
      <AvatarUpload 
        formData={formData}
        handleFileSelect={handleFileSelect}
        t={t}
      />
      
      <div className="space-y-1 w-full">
        <Input
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder={t('yourName')}
          className="text-2xl font-bold text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        />
        
        <LocationSelect 
          governate={formData.governate}
          district={formData.district}
          onGovernateChange={(value) => {
            handleFieldChange('governate', value);
            handleFieldChange('district', '');
          }}
          onDistrictChange={(value) => handleFieldChange('district', value)}
          constants={constants}
          t={t}
        />
      </div>

      <SocialButtons 
        setSocialEditOpen={setSocialEditOpen}
        socialMedia={socialMedia}
        t={t}
      />
    </div>
  </motion.div>
);

const AvatarUpload = ({ formData, handleFileSelect, t }) => (
  <div className="relative w-[170px] h-40 border-2 border-primary rounded-md shadow-lg">
    <label className="absolute -bottom-3 -right-3 z-20 bg-primary/90 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-primary transition-colors shadow-md hover:shadow-lg text-xs">
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
        src={formData.img}
        alt={formData.name}
        onError={(e) => {
          e.currentTarget.onerror = null;
        }}
      />
      <AvatarFallback className="text-3xl rounded-sm">
        {formData.name?.split(' ').map(n => n[0]).join('')}
      </AvatarFallback>
    </Avatar>
  </div>
);

const LocationSelect = ({
  governate,
  district,
  onGovernateChange,
  onDistrictChange,
  constants,
  t,
}) => {
  // Memoize mapped options to prevent unnecessary recalculations
  const governateOptions = useMemo(() => (
    constants?.Governates?.map((gov) => ({
      value: gov,
      label: gov,
    })) || []
  ), [constants?.Governates]);

  const districtOptions = useMemo(() => (
    governate && constants?.Districts?.[governate]
      ? constants.Districts[governate].map((dist) => ({
          value: dist,
          label: dist,
        }))
      : []
  ), [governate, constants?.Districts]);

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      {/* Governate Select */}
      <div className="space-y-1">
        <Label htmlFor="governate-select" className="text-xs font-medium text-gray-600">
          {t('governate')}
        </Label>
        <Select
          value={governate || ''}
          onValueChange={onGovernateChange}
        >
          <SelectTrigger 
            id="governate-select"
            className="h-10 border border-primary rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <SelectValue placeholder={t('selectGovernate')} />
          </SelectTrigger>
          <SearchableSelectContent
            searchPlaceholder={t('searchGovernate')}
            items={governateOptions}
            noResultsText={t('noGovernatesFound')}
          />
        </Select>
      </div>

      {/* District Select - Only shown when governate is selected */}
      {governate && (
        <div className="space-y-1">
          <Label htmlFor="district-select" className="text-xs font-medium text-gray-600">
            {t('district')}
          </Label>
          <Select
            value={district || ''}
            onValueChange={onDistrictChange}
            disabled={!governate}
          >
            <SelectTrigger 
              id="district-select"
              className="h-10 border border-primary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <SelectValue 
                placeholder={governate ? t('selectDistrict') : t('selectGovernateFirst')} 
              />
            </SelectTrigger>
            <SearchableSelectContent
              searchPlaceholder={t('searchDistrict')}
              items={districtOptions}
              noResultsText={t('noDistrictsFound')}
            />
          </Select>
        </div>
      )}
    </div>
  );
};

const SocialButtons = ({ setSocialEditOpen, socialMedia, t }) => (
  <div className="max-w-full space-y-2 w-full">
    <Button className="w-full h-10 flex items-center justify-center gap-2 whitespace-nowrap bg-primary hover:bg-primary/90 transition-colors">
      <MessageSquare size={18} />
      {t('contactTutor')}
    </Button>

    <Button
      type="button"
      variant="outline"
      className="w-full h-10 flex items-center justify-center gap-2 whitespace-nowrap text-primary border-primary"
      onClick={() => setSocialEditOpen(true)}
    >
      {t('editSocials')}
    </Button>

    <div className="flex flex-wrap justify-center gap-3 pt-2">
      {Object.entries(socialMedia || {}).map(([key, url]) => {
        if (!url) return null;
        const Icon = socialIcons[key];
        return Icon ? (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon size={20} />
          </a>
        ) : null;
      })}
    </div>
  </div>
);

const DetailsSection = ({ 
  formData, 
  handleFieldChange, 
  onAddSubject, 
  onUpdateSubject, 
  onDeleteSubject, 
  constants, 
  t 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className="md:col-span-2 space-y-4 flex flex-col items-center text-center md:items-start md:text-left"
  >
    <div className="flex flex-col md:flex-row w-full gap-6 justify-between">
      <ExperienceLocationSection 
        formData={formData}
        handleFieldChange={handleFieldChange}
        t={t}
      />
      
      <AddSubjectCard
        formData={formData}
        onAddSubject={onAddSubject}
        onUpdateSubject={onUpdateSubject}
        onDeleteSubject={onDeleteSubject}
        constants={constants}
        t={t}
      />
    </div>

    <AboutMeSection 
      aboutMe={formData.about_me}
      onChange={(value) => handleFieldChange('about_me', value)}
      t={t}
    />
  </motion.div>
);

const ExperienceLocationSection = ({ formData, handleFieldChange, t }) => {
  // Calculate highest experience among current subjects
  const highestSubjectExperience = formData.subjects?.reduce((max, subject) => {
    return Math.max(max, subject.years_experience || 0);
  }, 0) || 0;

  return (
    <div className="space-y-4 w-full md:w-1/2">      
      {/* Subject Experience Section */}
      <div className="bg-muted/30 p-3 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{t('highestSubjectExperience')}</h3>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min="0"
            max="50"
            value={highestSubjectExperience}
            readOnly
            className="w-20 bg-background"
          />
          <span className="text-sm text-muted-foreground">
            {t('years')} ({t('fromSubjects')})
          </span>
        </div>
      </div>
      
      {/* Address Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{t('address')}</h3>
        </div>
        <Textarea
          value={formData.address || ''}
          onChange={(e) => handleFieldChange('address', e.target.value)}
          placeholder={t('enterYourAddress')}
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
};

const AboutMeSection = ({ aboutMe, onChange, t }) => (
  <div className="w-full flex flex-col">
    <Separator className="my-4" />
    <h2 className="text-xl font-semibold mb-2 text-primary rtl:text-right">{t('aboutMe')}</h2>
    <Textarea
      value={aboutMe || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('writeSomethingAboutYou')}
      className="min-h-[120px] bg-muted/50 p-4 rounded-md border border-primary/30 focus:border-primary"
    />
  </div>
);

const SocialMediaModal = ({ open, onClose, socialMedia, newSocial, setNewSocial, handleSocialChange, removeSocial, addSocial, t }) => (
  open && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t('editSocials')}</h2>
          <Button variant="ghost" onClick={onClose} type="button">
            <X size={20} />
          </Button>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(socialMedia || {}).map(([platform, url]) => (
            <div key={platform} className="flex items-center gap-2">
              <div className="w-8 flex items-center justify-center">
                {socialIcons[platform] && React.createElement(socialIcons[platform], { size: 16 })}
              </div>
              <Input
                value={url}
                onChange={(e) => handleSocialChange(platform, e.target.value)}
                placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                className="border-primary/30 focus:border-primary transition-colors"
              />
              <Button
                type="button"
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
            <Button type="button" onClick={addSocial} size="sm">
              <Plus size={16} />
            </Button>
          </div>
        </div>
        <Button
          type="button"
          className="w-full mt-4 bg-primary hover:bg-primary/90 transition-colors"
          onClick={onClose}
        >
          {t('done')}
        </Button>
      </div>
    </div>
  )
);

TutorProfileHeaderEdit.defaultProps = {
  tutor: {},
  onChange: () => {},
};

export default TutorProfileHeaderEdit;