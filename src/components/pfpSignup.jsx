import React, { useState, useEffect, useRef } from "react";
import BannerCropOverlay from "./ui/cropper";
import { Button } from '@/components/ui/button';

export default function PfpUploadWithCrop({ formData, setFormData }) {
  const [rawImage, setRawImage] = useState(null);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null); // <-- Add this line

  // Cleanup Object URLs
  useEffect(() => {
    return () => {
      if (rawImage) URL.revokeObjectURL(rawImage);
      if (formData.pfp) URL.revokeObjectURL(URL.createObjectURL(formData.pfp));
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
      pfp: croppedFile,
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
      <label htmlFor="pfp" className="text-base font-medium text-foreground">
        Profile Picture
      </label>
      <div className="flex items-center gap-5 mt-3 ">
        <div className="w-20 h-20 rounded-md overflow-hidden border border-border bg-muted shadow-sm">
          {formData.pfp ? (
            <img
              src={URL.createObjectURL(formData.pfp)}
              alt="Profile Preview"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
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
              ref={fileInputRef} // <-- Add this line
            />
          </Button>
          {(rawImage || formData.pfp) && (
            <span className="text-sm text-muted-foreground truncate max-w-[14rem]">
              {fileName || (formData.pfp && formData.pfp.name)}
            </span>
          )}
        </div>
      </div>

      {/* Cropper Overlay */}
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