import React, { useState, useEffect, useRef } from "react";
import BannerCropOverlay from "./ui/cropper";
import { Button } from '@/components/ui/button';

export default function PfpUploadWithCrop({ formData, setFormData, defaultPfpUrl = null }) {
  const [rawImage, setRawImage] = useState(null);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rawImage) URL.revokeObjectURL(rawImage);
      if (formData.pfp instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(formData.pfp));
      }
    };
  }, [rawImage, formData.pfp]);

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
      img: croppedFile,
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

  const renderImage = () => {
    if (formData.img instanceof File) {
      return (
        <img
          src={URL.createObjectURL(formData.img)}
          alt="Profile Preview"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      );
    } else if (defaultPfpUrl) {
      return (
        <img
          src={defaultPfpUrl}
          alt="Default Profile"
          className="w-full h-full object-cover opacity-60"
        />
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          No image
        </div>
      );
    }
  };

  return (
    <div>
      <label htmlFor="pfp" className="text-base font-medium text-foreground">
        Profile Picture
      </label>
      <div className="flex items-center gap-5 mt-3 ">
        <div className="w-20 h-20 rounded-md overflow-hidden border border-border bg-muted shadow-sm">
          {renderImage()}
        </div>
        <div className="flex flex-col gap-1 cursor-pointer">
          <Button className="cursor-pointer relative max-w-20">
            Upload
            <input
              type="file"
              accept="image/*"
              id="pfp"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={onFileChange}
              ref={fileInputRef}
            />
          </Button>
          {(rawImage || formData.pfp) && (
            <span className="text-sm text-muted-foreground truncate max-w-[14rem]">
              {fileName || (formData.pfp?.name || '')}
            </span>
          )}
        </div>
      </div>

      {cropperVisible && (
        <BannerCropOverlay
          rawImage={rawImage}
          onCancel={handleCancel}
          onCrop={handleCrop}
          shape="profile"
        />
      )}
    </div>
  );
}
