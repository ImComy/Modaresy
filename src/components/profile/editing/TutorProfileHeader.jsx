import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { getImageUrl, getAvatarSrc, getBannerUrl } from '@/api/imageService';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MapPin, BookOpen, MessageSquare, Heart, Award, Building, GraduationCap, Star, Plus, Trash, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import BannerCropOverlay from '../../ui/cropper';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import { getConstants } from '@/api/constantsFetch';
import { API_BASE } from '@/api/apiService';
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
import { Label } from '../../ui/label'
import AddSubjectCard from './SubjectSection';

const TutorProfileHeaderEdit = ({
  tutor,
  onChange,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  isSubjectMutating,
  pendingFilesRef
}) => {
  const { t } = useTranslation();
  const [constants, setConstants] = useState(null);
  const [formData, setFormData] = useState(initializeFormData(tutor));
  const [cropOverlay, setCropOverlay] = useState({ open: false, image: null, shape: 'banner' });
  const lastObjectUrl = useRef(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const bannerObjectUrlRef = useRef(null);
  const [socialEditOpen, setSocialEditOpen] = useState(false);
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' });

  function initializeFormData(tutorData) {
    return {
      name: tutorData?.name || '',
      img: getImageUrl(tutorData?.profile_picture?.url) || tutorData?.img || '',
      bannerimg: getImageUrl(tutorData?.banner?.url) || tutorData?.bannerimg || tutorData?.banner || '',
      previewPfpUrl: '',
      previewBannerUrl: '',
      pendingPfpFile: null,
      pendingBannerFile: null,
      pendingPfpDelete: false,
      pendingBannerDelete: false,
      about_me: tutorData?.about_me || '',
      governate: tutorData?.governate || '',
      district: tutorData?.district || '',
      address: tutorData?.address || '',
      experience_years: tutorData?.experience_years || 0,
      social_media: tutorData?.social_media || {},
      subject_profiles: tutorData?.subject_profiles || [],
      rating: tutorData?.rating || 0,
      subjects: tutorData?.subjects || [],
      experience_years: tutorData?.experience_years || 0,
    };
  }

  useEffect(() => {
    if (tutor) {
      setFormData((prev) => {
        const base = initializeFormData(tutor);
        if (!prev) return base;
        return {
          ...base,
          previewPfpUrl: prev.previewPfpUrl || base.previewPfpUrl,
          previewBannerUrl: prev.previewBannerUrl || base.previewBannerUrl,
          pendingPfpFile: prev.pendingPfpFile || base.pendingPfpFile,
          pendingBannerFile: prev.pendingBannerFile || base.pendingBannerFile,
          pendingPfpDelete: prev.pendingPfpDelete || base.pendingPfpDelete,
          pendingBannerDelete: prev.pendingBannerDelete || base.pendingBannerDelete,
        };
      });
    }
  }, [tutor]);

  useEffect(() => {
    const loadConstants = async () => {
      try {
        const data = await getConstants();
        setConstants(data);
      } catch (error) {
      }
    };
    loadConstants();
  }, []);

  useEffect(() => {
    return () => {
      // cleanup shared lastObjectUrl (used by avatar/crop flow)
      if (lastObjectUrl.current) {
        try { URL.revokeObjectURL(lastObjectUrl.current); } catch {}
        lastObjectUrl.current = null;
      }
      // cleanup banner-specific object url
      if (bannerObjectUrlRef.current) {
        try { URL.revokeObjectURL(bannerObjectUrlRef.current); } catch {}
        bannerObjectUrlRef.current = null;
      }
    };
  }, []);

  // Manage banner preview URL outside of render to avoid creating blob URLs during render
  useEffect(() => {
    // priority: explicit previewBannerUrl -> string bannerimg url -> File bannerimg -> default
    if (typeof formData.previewBannerUrl === 'string' && formData.previewBannerUrl) {
      // explicit preview (already a URL/string)
      if (bannerObjectUrlRef.current) {
        try { URL.revokeObjectURL(bannerObjectUrlRef.current); } catch {}
        bannerObjectUrlRef.current = null;
      }
      setBannerPreview(formData.previewBannerUrl);
      return;
    }

    // if bannerimg is string (already a URL)
    if (typeof formData.bannerimg === 'string' && formData.bannerimg) {
      if (bannerObjectUrlRef.current) {
        try { URL.revokeObjectURL(bannerObjectUrlRef.current); } catch {}
        bannerObjectUrlRef.current = null;
      }
      setBannerPreview(formData.bannerimg);
      return;
    }

    // if bannerimg is a File, create an object URL once and keep it in ref
    if (formData.bannerimg instanceof File) {
      try {
        // if we already created one for this file, keep it
        if (!bannerObjectUrlRef.current) {
          bannerObjectUrlRef.current = URL.createObjectURL(formData.bannerimg);
        }
        setBannerPreview(bannerObjectUrlRef.current);
        return;
      } catch (err) {
        setBannerPreview('/banner.png');
        return;
      }
    }

    // fallback
    setBannerPreview('/banner.png');
  }, [formData.previewBannerUrl, formData.bannerimg]);

  const handleFieldChange = useCallback((field, value, options = { propagate: true }) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (options.propagate) {
      try {
        onChange?.(field, value);
      } catch (err) {
      }
    }
  }, [onChange]);

  const handleSocialChange = useCallback((platform, url) => {
    setFormData(prev => {
      const updatedSocials = { ...(prev?.social_media || {}), [platform]: url };
      // propagate to parent
      try { onChange?.('social_media', updatedSocials); } catch (e) {}
      return { ...prev, social_media: updatedSocials };
    });
  }, [onChange]);

  const removeSocial = useCallback((platform) => {
    setFormData(prev => {
      const current = prev?.social_media || {};
      const { [platform]: _, ...updated } = current;
      try { onChange?.('social_media', updated); } catch (e) {}
      return { ...prev, social_media: updated };
    });
  }, [onChange]);

  const addSocial = useCallback(() => {
    if (!newSocial.platform || !newSocial.url) return;
    setFormData(prev => {
      const updatedSocials = { ...(prev?.social_media || {}), [newSocial.platform]: newSocial.url };
      try { onChange?.('social_media', updatedSocials); } catch (e) {}
      return { ...prev, social_media: updatedSocials };
    });
    setNewSocial({ platform: '', url: '' });
  }, [newSocial, onChange]);

  const handleFileSelect = useCallback((e, shape) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (lastObjectUrl.current) {
        try { URL.revokeObjectURL(lastObjectUrl.current); } catch {}
      }
      lastObjectUrl.current = imageUrl;
      setCropOverlay({ open: true, image: imageUrl, shape });
    }
  }, []);

  const uploadFile = async (file, shape) => {
    try {
      if (!tutor?._id) throw new Error('Missing tutor id');
      const tutorId = tutor._id;
      const endpoint = `${API_BASE}/storage/tutor/${tutorId}/${shape === 'profile' ? 'pfp' : 'banner'}`;
      const body = new FormData();
      if (shape === 'profile') body.append('profile_picture', file);
      else body.append('banner', file);
      const token = localStorage.getItem('token');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Upload failed');
      }
      const parsed = await res.json();
      const returned = parsed.profile_picture || parsed.banner;
      let url = returned?.url || returned?.path || '';
      if (url && url.startsWith('/')) url = `${API_BASE}${url}`;
      if (shape === 'profile') {
        handleFieldChange('img', url);
      } else {
        handleFieldChange('bannerimg', url);
      }
      if (lastObjectUrl.current) {
        try { URL.revokeObjectURL(lastObjectUrl.current); } catch {}
        lastObjectUrl.current = null;
      }
      return returned;
    } catch (err) {
      return null;
    }
  };

  const handleCrop = useCallback(async (croppedFile) => {
    const shape = cropOverlay.shape === 'profile' ? 'profile' : 'banner';
    const previewUrl = URL.createObjectURL(croppedFile);
    if (lastObjectUrl.current) {
      try { URL.revokeObjectURL(lastObjectUrl.current); } catch {}
    }
    lastObjectUrl.current = previewUrl;
    if (shape === 'profile') {
      handleFieldChange('previewPfpUrl', previewUrl);
      handleFieldChange('pendingPfpFile', croppedFile);
      handleFieldChange('pendingPfpDelete', false);
    } else {
      handleFieldChange('previewBannerUrl', previewUrl);
      handleFieldChange('pendingBannerFile', croppedFile);
      handleFieldChange('pendingBannerDelete', false);
    }
    setCropOverlay({ open: false, image: null, shape: 'banner' });
  }, [cropOverlay.shape, handleFieldChange]);

  const handleCancelCrop = useCallback(() => {
    if (lastObjectUrl.current) {
      try { URL.revokeObjectURL(lastObjectUrl.current); } catch {}
      lastObjectUrl.current = null;
    }
    setCropOverlay({ open: false, image: null, shape: 'banner' });
  }, []);

  useEffect(() => {
    if (!pendingFilesRef) return;
    pendingFilesRef.current = {
      pendingPfpFile: formData.pendingPfpFile,
      pendingBannerFile: formData.pendingBannerFile,
      pendingPfpDelete: formData.pendingPfpDelete,
      pendingBannerDelete: formData.pendingBannerDelete,
    };
  }, [formData.pendingPfpFile, formData.pendingBannerFile, formData.pendingPfpDelete, formData.pendingBannerDelete, pendingFilesRef]);

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
          <label className="absolute top-4 right-4 z-20 bg-primary/90 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
            {t('changeBanner')}
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'banner')}
            />
          </label>

          <button
            type="button"
            className="absolute top-4 left-4 z-20 bg-white/80 text-destructive px-2 py-1 rounded-lg shadow"
            onClick={async () => {
              if (!tutor?._id) return;
              if (lastObjectUrl.current) {
                try { URL.revokeObjectURL(lastObjectUrl.current); } catch {}
                lastObjectUrl.current = null;
              }
              handleFieldChange('bannerimg', '', { propagate: false });
              handleFieldChange('previewBannerUrl', '', { propagate: false });
              handleFieldChange('pendingBannerFile', null, { propagate: false });
              handleFieldChange('pendingBannerDelete', true, { propagate: false });
            }}
            aria-label="delete banner"
          >
            {t('delete')}
          </button>

          <img
            src={bannerPreview}
            alt={formData.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/banner.png';
              e.currentTarget.onerror = null;
            }}
          />
        </div>

        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <ProfileSection
            tutor={tutor}
            formData={formData}
            handleFieldChange={handleFieldChange}
            handleFileSelect={handleFileSelect}
            setSocialEditOpen={setSocialEditOpen}
            socialMedia={formData.social_media}
            constants={constants}
            t={t}
            lastObjectUrl={lastObjectUrl}
          />

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

const ProfileSection = ({ tutor, formData, handleFieldChange, handleFileSelect, setSocialEditOpen, socialMedia, constants, t, lastObjectUrl }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center text-center"
  >
    <div className="flex flex-col items-center gap-4 text-center -mt-20 md:mt-0 z-10">
      <AvatarUpload
        tutor={tutor}
        formData={formData}
        handleFileSelect={handleFileSelect}
        handleFieldChange={handleFieldChange}
        t={t}
        lastObjectUrl={lastObjectUrl}
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

const AvatarUpload = ({ tutor, formData, handleFileSelect, handleFieldChange, t, lastObjectUrl }) => {
  const [localPreview, setLocalPreview] = useState('');
  const pfpPreviewRef = useRef(null);

  useEffect(() => {
    if (formData.previewPfpUrl) {
      setLocalPreview(formData.previewPfpUrl);
      return;
    }

    if (formData.pendingPfpFile instanceof File) {
      try {
        // revoke previous pfp preview if any
        if (pfpPreviewRef.current) {
          try { URL.revokeObjectURL(pfpPreviewRef.current); } catch {}
          pfpPreviewRef.current = null;
        }
        pfpPreviewRef.current = URL.createObjectURL(formData.pendingPfpFile);
        setLocalPreview(pfpPreviewRef.current);
      } catch (err) {
        setLocalPreview('');
      }
      return;
    }

    if (typeof formData.img === 'string' && formData.img) {
      setLocalPreview(formData.img);
    } else {
      setLocalPreview('');
    }
    return () => {
      if (pfpPreviewRef.current) {
        try { URL.revokeObjectURL(pfpPreviewRef.current); } catch {}
        pfpPreviewRef.current = null;
      }
    };
  }, [formData.previewPfpUrl, formData.pendingPfpFile, formData.img, lastObjectUrl]);

  return (
    <div className="relative w-40 h-40 border-2 border-primary rounded-md shadow-lg">
      <label className="absolute -bottom-3 -right-3 z-20 bg-primary/90 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-primary transition-colors shadow-md hover:shadow-lg text-xs">
        {t('changeAvatar')}
        <Input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'profile')}
        />
      </label>

      <button
        type="button"
        className="absolute -bottom-3 -left-3 z-20 bg-white text-destructive px-2 py-1 rounded-lg shadow text-xs"
        onClick={async () => {
          if (!tutor?._id) return;
          if (lastObjectUrl?.current) {
            try { URL.revokeObjectURL(lastObjectUrl.current); } catch {}
            lastObjectUrl.current = null;
          }
          if (pfpPreviewRef.current) {
            try { URL.revokeObjectURL(pfpPreviewRef.current); } catch {}
            pfpPreviewRef.current = null;
          }
          handleFieldChange('img', '', { propagate: false });
          handleFieldChange('previewPfpUrl', '', { propagate: false });
          handleFieldChange('pendingPfpFile', null, { propagate: false });
          handleFieldChange('pendingPfpDelete', true, { propagate: false });
        }}
        aria-label="delete avatar"
      >
        {t('delete')}
      </button>

      <Avatar className="w-full h-full rounded-sm">
        <AvatarImage
          src={localPreview || ''}
          alt={formData.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
          }}
        />
        <AvatarFallback className="text-3xl rounded-sm">
          {formData.name?.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
  </div>);
};

const LocationSelect = ({ 
  governate,
  district,
  onGovernateChange,
  onDistrictChange,
  constants,
  t,
}) => {
  const governateMap = useMemo(() => t('constants.Governates', { returnObjects: true }), [t]);
  const governateOptions = useMemo(() => {
    if (governateMap && typeof governateMap === 'object') {
      return Object.keys(governateMap).map(key => ({ value: key, label: governateMap[key] || key }));
    }
    if (constants && Array.isArray(constants.Governates)) {
      return constants.Governates.map(gov => ({ value: gov, label: gov }));
    }
    return [];
  }, [governateMap, constants]);

  const districtMap = useMemo(() => t('constants.Districts', { returnObjects: true }), [t]);
  const districtOptions = useMemo(() => {
    // If server constants provide districts grouped by governate, prefer them and translate labels via districtMap if available
    if (constants && constants.Districts && governate && Array.isArray(constants.Districts[governate])) {
      return constants.Districts[governate].map(distKey => ({ value: distKey, label: (districtMap && districtMap[distKey]) || distKey }));
    }

    // If the translation file provides districts grouped by governate (array), use those (labels already translated)
    if (districtMap && typeof districtMap === 'object' && governate && Array.isArray(districtMap[governate])) {
      return districtMap[governate].map(distKey => ({ value: distKey, label: districtMap[distKey] || distKey }));
    }

    // If the translation file provides a flat mapping of districtKey -> label, expose all entries (best-effort)
    if (districtMap && typeof districtMap === 'object' && !Array.isArray(districtMap)) {
      return Object.keys(districtMap).map(k => ({ value: k, label: districtMap[k] || k }));
    }

    return [];
  }, [districtMap, constants, governate]);

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
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
  return (
    <div className="space-y-4 w-full md:w-1/2">
      <div className="bg-muted/30 p-3 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 mb-1">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{t('experience')}</h3>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min="0"
            max="50"
            value={formData.experience_years || 0}
            onChange={(e) => handleFieldChange('experience_years', parseInt(e.target.value) || 0)}
            className="w-20 bg-background"
          />
          <span className="text-sm text-muted-foreground">
            {t('years')}
          </span>
        </div>
      </div>

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
                    {t(`socialPlatforms.${platform}`, { defaultValue: platform.charAt(0).toUpperCase() + platform.slice(1) })}
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
