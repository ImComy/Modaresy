import React, { useState, useRef, useEffect } from "react";

export default function BannerUploadWithCrop({ formData, setFormData }) {
  const [rawImage, setRawImage] = useState(null);
  const [cropperVisible, setCropperVisible] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Crop area params - using rectangle instead of circle
  const [cropParams, setCropParams] = useState({ 
    x: 0, 
    y: 0, 
    width: 100, 
    height: 40,
    aspectRatio: 3 / 1 // Standard banner aspect ratio
  });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // Cleanup Object URLs
  useEffect(() => {
    return () => {
      if (rawImage) URL.revokeObjectURL(rawImage);
      if (formData.banner) URL.revokeObjectURL(URL.createObjectURL(formData.banner));
    };
  }, [rawImage, formData.banner]);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (rawImage) URL.revokeObjectURL(rawImage);
    const url = URL.createObjectURL(file);
    setRawImage(url);
    setCropperVisible(true);
  }

  // Calculate mouse position relative to image
  function getMousePosOnImage(e) {
    if (!imgRef.current || !containerRef.current) return null;
    
    const img = imgRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate image position within container (centered)
    const imgLeft = containerRect.left + (containerRect.width - img.width) / 2;
    const imgTop = containerRect.top + (containerRect.height - img.height) / 2;
    
    return {
      x: e.clientX - imgLeft,
      y: e.clientY - imgTop,
    };
  }

  // Check if mouse is inside crop rectangle
  function isInsideCropRect(pos) {
    if (!pos) return false;
    return (
      pos.x >= cropParams.x &&
      pos.x <= cropParams.x + cropParams.width &&
      pos.y >= cropParams.y &&
      pos.y <= cropParams.y + cropParams.height
    );
  }

  // Drag handlers
  function onMouseDown(e) {
    const pos = getMousePosOnImage(e);
    if (!isInsideCropRect(pos)) return;
    
    setDragging(true);
    setDragStart(pos);
  }

  function onMouseUp() {
    setDragging(false);
  }

  function onMouseMove(e) {
    if (!dragging) return;
    const pos = getMousePosOnImage(e);
    if (!pos) return;

    const dx = pos.x - (dragStart?.x || 0);
    const dy = pos.y - (dragStart?.y || 0);

    setCropParams((prev) => {
      const img = imgRef.current;
      if (!img) return prev;

      let newX = prev.x + dx;
      let newY = prev.y + dy;

      // Clamp inside image bounds
      newX = Math.max(0, Math.min(img.width - prev.width, newX));
      newY = Math.max(0, Math.min(img.height - prev.height, newY));

      return { ...prev, x: newX, y: newY };
    });

    setDragStart(pos);
  }

  // Draw crop overlay on canvas
  useEffect(() => {
    if (!cropperVisible || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    // Match canvas size to displayed image size
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Dark overlay outside rectangle
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop rectangle area
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropParams.x, cropParams.y, cropParams.width, cropParams.height);
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // White border around crop rectangle
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropParams.x, cropParams.y, cropParams.width, cropParams.height);
  }, [cropParams, cropperVisible]);

  // Confirm crop and generate cropped file
  function onConfirmCrop() {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scaling between natural image and displayed image size
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const sx = cropParams.x * scaleX;
    const sy = cropParams.y * scaleY;
    const sWidth = cropParams.width * scaleX;
    const sHeight = cropParams.height * scaleY;

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = cropParams.width;
    outputCanvas.height = cropParams.height;
    const ctx = outputCanvas.getContext("2d");

    ctx.drawImage(
      img,
      sx, sy, sWidth, sHeight,
      0, 0, cropParams.width, cropParams.height
    );

    outputCanvas.toBlob((blob) => {
      if (!blob) return;
      
      const croppedFile = new File([blob], "banner-cropped.png", {
        type: "image/png",
        lastModified: Date.now(),
      });

      setFormData((prev) => ({
        ...prev,
        banner: croppedFile,
      }));

      setCropperVisible(false);
      if (rawImage) URL.revokeObjectURL(rawImage);
      setRawImage(null);
    }, "image/png");
  }

  // Initialize crop area when image loads
  function initCropArea() {
    if (!imgRef.current || !canvasRef.current) return;

    // Set canvas size same as displayed image size
    canvasRef.current.width = imgRef.current.width;
    canvasRef.current.height = imgRef.current.height;

    // Initialize crop area with banner aspect ratio
    const imgWidth = imgRef.current.width;
    const imgHeight = imgRef.current.height;
    
    // Calculate width and height maintaining aspect ratio
    let width, height;
    if (imgWidth / imgHeight > cropParams.aspectRatio) {
      // Image is wider than desired aspect ratio
      height = Math.min(200, imgHeight);
      width = height * cropParams.aspectRatio;
    } else {
      // Image is taller than desired aspect ratio
      width = Math.min(600, imgWidth);
      height = width / cropParams.aspectRatio;
    }

    setCropParams(prev => ({
      ...prev,
      width,
      height,
      x: (imgWidth - width) / 2,
      y: (imgHeight - height) / 2
    }));
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
        <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors duration-200">
          Upload Banner
          <input
            type="file"
            accept="image/*"
            id="banner"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onFileChange}
          />
        </label>
        {formData.banner && (
          <span className="text-sm text-muted-foreground truncate max-w-[14rem]">
            {formData.banner.name}
          </span>
        )}
      </div>

      {/* Cropper Overlay */}
      {cropperVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative bg-background rounded-lg p-4 w-full max-w-4xl">
            <p className="mb-2 text-center font-semibold text-foreground">
              Crop your banner (Recommended ratio: 3:1)
            </p>
            <div
              ref={containerRef}
              className="relative select-none flex justify-center items-center max-h-[70vh]"
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseUp}
              style={{ cursor: dragging ? "grabbing" : "grab" }}
            >
              <img
                ref={imgRef}
                src={rawImage}
                alt="To crop"
                className="max-w-full max-h-[60vh] rounded select-none"
                draggable={false}
                onLoad={initCropArea}
              />
              <canvas
                ref={canvasRef}
                className="absolute pointer-events-none rounded"
                style={{ 
                  userSelect: "none",
                  left: `calc(50% - ${imgRef.current?.width ? imgRef.current.width/2 : 0}px)`,
                  top: `calc(50% - ${imgRef.current?.height ? imgRef.current.height/2 : 0}px)`
                }}
              />
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => {
                  setCropperVisible(false);
                  if (rawImage) URL.revokeObjectURL(rawImage);
                  setRawImage(null);
                }}
                className="bg-muted px-4 py-2 rounded hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmCrop}
                className="bg-primary px-4 py-2 rounded text-primary-foreground hover:bg-primary/90"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}