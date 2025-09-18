import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStepData } from "@/context/StepContext";
import { Plus, X } from "lucide-react";
import BannerCropOverlay from "@/components/ui/cropper";

export default function StepUploadPfp({ onFile, onBannerFile }) {
  const { state, setState } = useStepData();
  const [hoverPfp, setHoverPfp] = useState(false);
  const [hoverBanner, setHoverBanner] = useState(false);
  const [preview, setPreview] = useState(state?.pfpPreview || null);
  const [bannerPreview, setBannerPreview] = useState(state?.bannerPreview || null);

  // cropping overlay state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState(null); // 'pfp' | 'banner'
  const [rawImageToCrop, setRawImageToCrop] = useState(null);

  // track created object URLs so we can revoke them on unmount
  const createdUrlsRef = useRef(new Set());

  useEffect(() => {
    setState((s) => ({ ...s, pfpPreview: preview, bannerPreview }));
  }, [preview, bannerPreview, setState]);

  // cleanup created object URLs on unmount
  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      createdUrlsRef.current.clear();
    };
  }, []);

  const markCreatedUrl = (url) => {
    if (!url) return;
    createdUrlsRef.current.add(url);
  };

  const revokeAndRemoveCreatedUrl = (url) => {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch {}
    createdUrlsRef.current.delete(url);
  };

  const openCropForFile = (file, target) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    markCreatedUrl(url);
    setRawImageToCrop(url);
    setCropTarget(target);
    setCropOpen(true);
  };

  const handlePfpFiles = (files) => {
    const f = files?.[0];
    if (!f) return;
    // open cropper for profile (square)
    openCropForFile(f, "pfp");
  };

  const handleBannerFiles = (files) => {
    const f = files?.[0];
    if (!f) return;
    // open cropper for banner (3:1)
    openCropForFile(f, "banner");
  };

  const handleCropCancel = () => {
    // close overlay and revoke the temporary raw image url
    if (rawImageToCrop) {
      revokeAndRemoveCreatedUrl(rawImageToCrop);
    }
    setRawImageToCrop(null);
    setCropTarget(null);
    setCropOpen(false);
  };

  const handleCropSave = (croppedFile) => {
    // croppedFile is a File produced by BannerCropOverlay
    if (!croppedFile) {
      handleCropCancel();
      return;
    }

    const croppedURL = URL.createObjectURL(croppedFile);
    markCreatedUrl(croppedURL);

    if (cropTarget === "pfp") {
      // remove previous preview url only if we created it
      if (preview && createdUrlsRef.current.has(preview)) {
        revokeAndRemoveCreatedUrl(preview);
      }
      setPreview(croppedURL);
      onFile?.(croppedFile);
    } else if (cropTarget === "banner") {
      if (bannerPreview && createdUrlsRef.current.has(bannerPreview)) {
        revokeAndRemoveCreatedUrl(bannerPreview);
      }
      setBannerPreview(croppedURL);
      onBannerFile?.(croppedFile);
    }

    // cleanup raw image and close overlay
    if (rawImageToCrop) revokeAndRemoveCreatedUrl(rawImageToCrop);
    setRawImageToCrop(null);
    setCropTarget(null);
    setCropOpen(false);
  };

  // removal handlers
  const removePfp = (e) => {
    e.stopPropagation();
    if (preview && createdUrlsRef.current.has(preview)) revokeAndRemoveCreatedUrl(preview);
    setPreview(null);
    onFile?.(null);
  };

  const removeBanner = (e) => {
    e.stopPropagation();
    if (bannerPreview && createdUrlsRef.current.has(bannerPreview)) revokeAndRemoveCreatedUrl(bannerPreview);
    setBannerPreview(null);
    onBannerFile?.(null);
  };

  return (
    <>
      <div className="flex flex-col items-center text-center gap-6 py-8 w-full h-full">
        <h3 className="text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>
          Upload profile photo and banner
        </h3>
        <p className="max-w-[64ch]" style={{ color: "hsl(var(--muted-foreground))" }}>
          A clear face photo and attractive banner increase trust — students are more likely to book you. You can crop or change this later.
        </p>

        <div className="relative mx-auto w-full mb-20">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setHoverBanner(true);
            }}
            onDragLeave={() => setHoverBanner(false)}
            onDrop={(e) => {
              e.preventDefault();
              setHoverBanner(false);
              handleBannerFiles(e.dataTransfer.files);
            }}
            className={cn(
              "relative w-full h-48 rounded-2xl flex items-center justify-center cursor-pointer select-none transition-shadow",
              hoverBanner ? "shadow-[0_20px_40px_rgba(0,0,0,0.12)]" : ""
            )}
            style={{
              border: `2px dashed hsl(var(--primary) / 0.9)`,
              background: `linear-gradient(180deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.88))`,
            }}
          >
            {bannerPreview ? (
              <>
                <img src={bannerPreview} alt="banner preview" className="w-full h-full object-cover rounded-2xl" />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBanner(e);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-semibold"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  }}
                >
                  <Plus className="w-10 h-10" />
                </div>
                <div style={{ color: "hsl(var(--muted-foreground))" }}>Drop or click to upload banner</div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              onChange={(e) => handleBannerFiles(e.target.files)}
              aria-label="Upload banner image"
            />
          </label>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setHoverPfp(true);
            }}
            onDragLeave={() => setHoverPfp(false)}
            onDrop={(e) => {
              e.preventDefault();
              setHoverPfp(false);
              handlePfpFiles(e.dataTransfer.files);
            }}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 -bottom-28 w-56 h-56 rounded-2xl flex items-center justify-center cursor-pointer select-none transition-shadow",
              hoverPfp ? "shadow-[0_20px_40px_rgba(0,0,0,0.12)]" : ""
            )}
            style={{
              border: `2px dashed hsl(var(--primary) / 0.9)`,
              background: `linear-gradient(180deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.88))`,
            }}
          >
            {preview ? (
              <>
                <img src={preview} alt="pfp preview" className="w-full h-full object-cover rounded-2xl" />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePfp(e);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-semibold"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  }}
                >
                  <Plus className="w-10 h-10" />
                </div>
                <div style={{ color: "hsl(var(--muted-foreground))" }}>Drop or click to upload photo</div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              onChange={(e) => handlePfpFiles(e.target.files)}
              aria-label="Upload profile photo"
            />
          </label>
        </div>
      </div>

      {cropOpen && rawImageToCrop && (
        <BannerCropOverlay
          rawImage={rawImageToCrop}
          onCancel={handleCropCancel}
          onCrop={handleCropSave}
          shape={cropTarget === "pfp" ? "profile" : "banner"}
        />
      )}
    </>
  );
}
