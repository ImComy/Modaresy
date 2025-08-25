import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Check,
  ImageIcon,
  Menu,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';

/*
 * Available shapes:
 * - 'banner': Rectangular shape with 3:1 aspect ratio
 * - 'profile': Square shape (changed from round to square)
 * - 'circle': Circular shape with 1:1 aspect ratio
 */
export default function BannerCropOverlay({ rawImage, onCancel, onCrop, shape = 'banner' }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setShowPreview(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, [rawImage, shape]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') handleCrop();
    };
    window.addEventListener('keyup', onKey);
    return () => window.removeEventListener('keyup', onKey);
  }, [croppedAreaPixels]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const aspectRatio = shape === 'banner' ? 3 / 1 : 1;
  const cropShape = shape === 'circle' ? 'round' : 'rect';

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const croppedBlob = await getCroppedImg(rawImage, croppedAreaPixels, cropShape, rotation);
      const file = new File([croppedBlob], `cropped-${shape}.png`, { type: 'image/png' });
      onCrop(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getShapeTitle = () => {
    switch(shape) {
      case 'banner': return t('cropBanner');
      case 'profile': return t('cropProfilePicture');
      case 'circle': return t('cropCircleImage');
      default: return t('cropImage');
    }
  };

  const getShapePreviewText = () => {
    switch(shape) {
      case 'banner': return t('bannerPreview');
      case 'profile': return t('profilePreview');
      case 'circle': return t('circlePreview');
      default: return t('imagePreview');
    }
  };

  const previewElement = useMemo(() => {
    if (!rawImage) return null;
    return (
      <div className="flex items-center gap-2">
        <div className="w-12 h-8 md:w-16 md:h-10 overflow-hidden rounded-md border" 
             style={{ background: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))' }}>
          <img src={rawImage} alt="preview" className="w-full h-full object-cover" />
        </div>
        <div className="text-xs leading-tight">
          <div className="font-medium text-[--card-foreground]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {getShapePreviewText()}
          </div>
        </div>
      </div>
    );
  }, [rawImage, shape, t]);

  const overlay = (
    <div className="fixed inset-0 z-[1000] flex items-start md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="relative w-full h-full md:h-auto md:w-full max-w-4xl md:rounded-2xl md:shadow-2xl bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border md:p-6"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        {/* On mobile: header with small controls + expand button */}
        <div className="flex items-center justify-between p-3 md:p-0 md:mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}>
              <ImageIcon size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{getShapeTitle()}</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('cropInstruction', { defaultValue: 'Drag to reposition. Use zoom and rotate to adjust.' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">{previewElement}</div>

            {/* controls toggle for mobile */}
            <button
              onClick={() => setControlsOpen((s) => !s)}
              className="p-2 rounded-lg md:hidden"
              aria-expanded={controlsOpen}
              aria-label="toggle controls"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <Menu size={18} />
            </button>

            <button aria-label="close" onClick={onCancel} className="p-2 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Crop area */}
        <div className="w-full md:grid md:grid-cols-[1fr,300px] md:gap-4">
          <div className="relative w-full h-[46vh] md:h-[56vh] rounded-none md:rounded-lg overflow-hidden border-t md:border-0" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--muted))' }}>
            <Cropper
              image={rawImage}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              cropShape={cropShape}
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />

            <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)' }}></div>
          </div>

          {/* Controls: on md+ always visible; on mobile collapsible bottom sheet */}
          <div className={`bg-[hsl(var(--popover))] md:rounded-lg md:border p-3 md:p-4 md:border-l`}
               style={{ borderColor: 'hsl(var(--border))' }}>
            {/* Desktop/Tablet panel (visible on md+) */}
            <div className="hidden md:flex md:flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium" style={{ color: 'hsl(var(--popover-foreground))' }}>{t('adjustments')}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview((s) => !s)}
                  className="flex items-center gap-1 px-3 py-1 h-7 text-xs"
                >
                  {showPreview ? (
                    <>
                      <EyeOff size={14} />
                      {t('hidePreview')}
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      {t('showPreview')}
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('zoom')}</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))} aria-label="zoom out" className="p-2 rounded-md">
                    <ZoomOut size={16} />
                  </button>
                  <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
                  <button onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))} aria-label="zoom in" className="p-2 rounded-md">
                    <ZoomIn size={16} />
                  </button>
                </div>

                <label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('rotate')}</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setRotation((r) => (r - 90) % 360)} className="p-2 rounded-md">
                    <RotateCw size={16} />
                  </button>
                  <input type="range" min={0} max={360} step={1} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full" />
                  <div className="w-10 text-right text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{rotation}°</div>
                </div>

                {showPreview && (
                  <div className="mt-2 p-2 rounded-md border" style={{ borderColor: 'hsl(var(--border))' }}>
                    <div className="w-full h-32 rounded-md overflow-hidden flex items-center justify-center bg-[hsl(var(--muted))]">
                      <img src={rawImage} alt="preview-large" className="object-contain w-full h-full" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={onCancel}>{t('cancel')}</Button>
                <Button className="flex-1" onClick={handleCrop} disabled={isSaving}>{isSaving ? t('saving') : (<><Check size={14} className="mr-2" /> {t('cropSave')}</>)}</Button>
              </div>
            </div>

            {/* Mobile: collapsible controls (simple and touch friendly) */}
            <div className={`md:hidden ${controlsOpen ? 'block' : 'hidden'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium" style={{ color: 'hsl(var(--popover-foreground))' }}>{t('adjustments')}</div>
                <button onClick={() => setControlsOpen(false)} className="p-1 rounded-md">
                  <ChevronUp size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium">{t('zoom')}</div>
                    <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{zoom.toFixed(2)}x</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))} className="p-3 rounded-lg">
                      <ZoomOut size={18} />
                    </button>
                    <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1" />
                    <button onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))} className="p-3 rounded-lg">
                      <ZoomIn size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium">{t('rotate')}</div>
                    <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{rotation}°</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setRotation((r) => (r - 90) % 360)} className="p-3 rounded-lg">
                      <RotateCw size={18} />
                    </button>
                    <input type="range" min={0} max={360} step={1} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="flex-1" />
                    <div style={{ width: 44 }} />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview((s) => !s)}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff size={16} />
                        {t('hidePreview')}
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        {t('showPreview')}
                      </>
                    )}
                  </Button>
                </div>

                {showPreview && (
                  <div className="mt-2 p-2 rounded-md border" style={{ borderColor: 'hsl(var(--border))' }}>
                    <div className="w-full h-40 rounded-md overflow-hidden flex items-center justify-center bg-[hsl(var(--muted))]">
                      <img src={rawImage} alt="preview-large" className="object-contain w-full h-full" />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" className="flex-1 py-3" onClick={onCancel}>{t('cancel')}</Button>
                  <Button className="flex-1 py-3" onClick={handleCrop} disabled={isSaving}>{isSaving ? t('saving') : t('save')}</Button>
                </div>
              </div>
            </div>

            {/* Mobile hint when controls closed */}
            <div className={`md:hidden ${controlsOpen ? 'hidden' : 'flex items-center justify-between'}`}>
              <button onClick={() => setControlsOpen(true)} className="w-full flex items-center gap-2 py-3 justify-center rounded-lg border" style={{ borderColor: 'hsl(var(--border))' }}>
                <Menu size={16} /> <span className="text-sm">{t('adjust')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky bottom actions for mobile (fast access) */}
        <div className="md:hidden fixed left-0 right-0 bottom-0 p-3 bg-[hsl(var(--card))] border-t" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1 py-3" onClick={onCancel}>{t('cancel')}</Button>
            <Button className="flex-1 py-3" onClick={handleCrop} disabled={isSaving}>{isSaving ? t('saving') : t('cropSave')}</Button>
          </div>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}