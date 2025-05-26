import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';

export default function BannerCropOverlay({ rawImage, onCancel, onCrop, shape = 'banner' }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(rawImage, croppedAreaPixels, 'rect');
      const file = new File([croppedBlob], `cropped-${shape}.png`, { type: 'image/png' });
      onCrop(file);
    } catch (e) {
      console.error(e);
    }
  };

  // Determine aspect ratio:
  const aspectRatio = shape === 'profile' ? 1 : 3 / 1; // square for profile, wide rectangle for banner

  const overlay = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative bg-background rounded-lg p-4 w-full max-w-4xl">
        <p className="mb-2 text-center font-semibold text-foreground">
          Crop your {shape === 'profile' ? 'profile picture' : 'banner'}
        </p>

        <div className="relative w-full h-[60vh] bg-black">
          <Cropper
            image={rawImage}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape="rect"
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
          className="w-full mt-4"
        />

        <div className="mt-4 flex justify-between">
          <button onClick={onCancel} type="button" className="bg-muted px-4 py-2 rounded hover:bg-muted/80">
            Cancel
          </button>
          <button onClick={handleCrop} type="button" className="bg-primary px-4 py-2 rounded text-white hover:bg-primary/90">
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}