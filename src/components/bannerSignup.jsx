import React, { useState, useRef } from "react";
import BannerCropOverlay from "./ui/cropper";
import { Button } from '@/components/ui/button';

export default function BannerUploadWithCrop({ formData, setFormData }) {
  const [rawImage, setRawImage] = useState(null);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null); // <-- Add this line

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
      banner: croppedFile,
    }));
    setCropperVisible(false);
    if (rawImage) URL.revokeObjectURL(rawImage);
    setRawImage(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // <-- Reset input
  }

  function handleCancel() {
    setCropperVisible(false);
    if (rawImage) URL.revokeObjectURL(rawImage);
    setRawImage(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // <-- Reset input
  }

  return (
    <div>
      <label htmlFor="banner" className="text-base font-medium text-foreground">
        Banner Image
      </label>
      <div className="mt-3 rounded-lg overflow-hidden border border-border bg-muted h-40 shadow-sm">
        {formData.banner ? (
          <img
            src={URL.createObjectURL(formData.banner)}
            alt="Banner Preview"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            No banner uploaded
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <Button className="">
          Upload Banner
          <input
            type="file"
            accept="image/*"
            id="banner"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onFileChange}
            ref={fileInputRef} // <-- Add this line
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