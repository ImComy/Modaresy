import React, { useState, useEffect, useRef } from "react";
import BannerCropOverlay from "./ui/cropper";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function PfpUploadWithCrop({
  formData,
  setFormData,
  defaultPfpUrl = null,
}) {
  const { t } = useTranslation();
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (rawImage) URL.revokeObjectURL(rawImage);
    const url = URL.createObjectURL(file);
    setRawImage(url);
    setFileName(file.name);
    setCropperVisible(true);
  };

  const handleCrop = (croppedFile) => {
    setFormData((prev) => ({
      ...prev,
      pfp: croppedFile,
    }));
    if (rawImage) URL.revokeObjectURL(rawImage);
    setRawImage(null);
    setCropperVisible(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    if (rawImage) URL.revokeObjectURL(rawImage);
    setRawImage(null);
    setCropperVisible(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderPreview = () => {
    if (formData.pfp instanceof File) {
      return (
        <img
          src={URL.createObjectURL(formData.pfp)}
          alt={t("profilePreview")}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      );
    } else if (defaultPfpUrl) {
      return (
        <img
          src={defaultPfpUrl}
          alt={t("defaultProfile")}
          className="w-full h-full object-cover opacity-60"
        />
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          {t("noImage")}
        </div>
      );
    }
  };

  return (
    <div>
      <label
        htmlFor="pfp"
        className="block text-base font-medium text-foreground mb-2"
      >
        {t("profilePicture")}
      </label>

      <div className="flex items-center gap-5 mt-2">
        <div className="w-20 h-20 rounded-md overflow-hidden border border-border bg-muted shadow-sm">
          {renderPreview()}
        </div>

        <div className="flex flex-col gap-1">
          <Button className="relative max-w-24">
            {t("upload")}
            <input
              type="file"
              accept="image/*"
              id="pfp"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>
          {(rawImage || formData.pfp) && (
            <span className="text-sm text-muted-foreground truncate max-w-[14rem]">
              {fileName || formData.pfp?.name || ""}
            </span>
          )}
        </div>
      </div>

      {cropperVisible && (
        <BannerCropOverlay
          rawImage={rawImage}
          onCrop={handleCrop}
          onCancel={handleCancel}
          shape="profile"
        />
      )}
    </div>
  );
}
