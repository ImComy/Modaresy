import React, { useState, useRef } from "react";
import BannerCropOverlay from "./ui/cropper";
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function BannerUploadWithCrop({ formData, setFormData, defaultBannerUrl = null }) {
  const { t } = useTranslation();
  const [rawImage, setRawImage] = useState(null);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (rawImage) URL.revokeObjectURL(rawImage);
    const url = URL.createObjectURL(file);
    setRawImage(url);
    setFileName(file.name);
    setCropperVisible(true);
  }

  function handleCrop(croppedFile) {
    setFormData((prev) => ({
      ...prev,
      bannerimg: croppedFile,
    }));
    setCropperVisible(false);
    if (rawImage) URL.revokeObjectURL(rawImage);
    setRawImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleCancel() {
    setCropperVisible(false);
    if (rawImage) URL.revokeObjectURL(rawImage);
    setRawImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const renderBannerPreview = () => {
    if (formData.bannerimg instanceof File) {
      return (
        <img
          src={URL.createObjectURL(formData.bannerimg)}
          alt={t('bannerPreview')}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      );
    } else if (defaultBannerUrl) {
      return (
        <img
          src={defaultBannerUrl}
          alt={t('defaultBanner')}
          className="w-full h-full object-cover opacity-60"
        />
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
          {t('noBannerUploaded')}
        </div>
      );
    }
  };

  return (
    <div>
      <label htmlFor="banner" className="text-base font-medium text-foreground">
        {t('bannerImage')}
      </label>
      <div className="mt-3 rounded-lg overflow-hidden border border-border bg-muted h-40 shadow-sm">
        {renderBannerPreview()}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <Button className="relative">
          {t('uploadBanner')}
          <input
            type="file"
            accept="image/*"
            id="banner"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onFileChange}
            ref={fileInputRef}
          />
        </Button>
        {(rawImage || formData.banner) && (
          <span className="text-sm text-muted-foreground truncate max-w-[14rem]">
            {fileName || (formData.banner && formData.banner.name)}
          </span>
        )}
      </div>
      {cropperVisible && (
        <BannerCropOverlay
          rawImage={rawImage}
          onCancel={handleCancel}
          onCrop={handleCrop}
        />
      )}
    </div>
  );
}
