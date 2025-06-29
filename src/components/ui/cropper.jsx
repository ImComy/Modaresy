import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function BannerCropOverlay({ rawImage, onCancel, onCrop, shape = 'banner' }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(rawImage, croppedAreaPixels, 'rect');
      const file = new File([croppedBlob], `cropped-${shape}.png`, { type: 'image/png' });
      onCrop(file);
    } catch (err) {
      console.error(err);
    }
  };

  const aspectRatio = shape === 'profile' ? 1 : 3 / 1;

  const overlay = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70">
      <div className="relative bg-background rounded-xl shadow-xl p-6 w-full max-w-5xl space-y-6">
        <h2 className="text-center text-lg font-semibold text-foreground">
          {shape === 'profile' ? t('cropProfilePicture') : t('cropBanner')}
        </h2>

        <div className="relative w-full h-[60vh] overflow-hidden rounded-lg border border-muted bg-black">
          <Cropper
            image={rawImage}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-primary"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCrop}>
            {t('cropSave')}
          </Button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}
