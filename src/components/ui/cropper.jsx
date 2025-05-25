import React, { useState, useRef, useEffect } from "react";

export default function PfpUploadWithCrop({ formData, setFormData }) {
  const [rawImage, setRawImage] = useState(null);
  const [cropperVisible, setCropperVisible] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null); // New ref for the container

  // Crop area params relative to canvas/image displayed size
  const [cropParams, setCropParams] = useState({ x: 0, y: 0, size: 100 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // Cleanup Object URLs
  useEffect(() => {
    return () => {
      if (rawImage) {
        URL.revokeObjectURL(rawImage);
      }
      if (formData.pfp) {
        URL.revokeObjectURL(URL.createObjectURL(formData.pfp));
      }
    };
  }, [rawImage, formData.pfp]);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cleanup previous image if exists
    if (rawImage) URL.revokeObjectURL(rawImage);

    const url = URL.createObjectURL(file);
    setRawImage(url);
    setCropperVisible(true);
  }

  // Calculate mouse position relative to image (not just canvas)
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

  // Check if point is inside crop circle
  function isInsideCropCircle(pos) {
    if (!pos) return false;
    const centerX = cropParams.x + cropParams.size / 2;
    const centerY = cropParams.y + cropParams.size / 2;
    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    return dx * dx + dy * dy <= (cropParams.size / 2) ** 2;
  }

  // Drag handlers
  function onMouseDown(e) {
    const pos = getMousePosOnImage(e);
    if (!isInsideCropCircle(pos)) return;
    
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
      newX = Math.max(0, Math.min(img.width - prev.size, newX));
      newY = Math.max(0, Math.min(img.height - prev.size, newY));

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

    // Dark overlay outside circle
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop circle area
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      cropParams.x + cropParams.size / 2,
      cropParams.y + cropParams.size / 2,
      cropParams.size / 2,
      0,
      Math.PI * 2
    );
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // White border around crop circle
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.arc(
      cropParams.x + cropParams.size / 2,
      cropParams.y + cropParams.size / 2,
      cropParams.size / 2,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }, [cropParams, cropperVisible]);

  // Confirm crop, generate cropped file and update formData
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
    const sSize = cropParams.size * Math.min(scaleX, scaleY);

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = cropParams.size;
    outputCanvas.height = cropParams.size;
    const ctx = outputCanvas.getContext("2d");

    // Clip to circle
    ctx.beginPath();
    ctx.arc(
      cropParams.size / 2,
      cropParams.size / 2,
      cropParams.size / 2,
      0,
      Math.PI * 2
    );
    ctx.clip();

    ctx.drawImage(
      img,
      sx, sy, sSize, sSize,
      0, 0, cropParams.size, cropParams.size
    );

    outputCanvas.toBlob((blob) => {
      if (!blob) return;
      
      const croppedFile = new File([blob], "pfp-cropped.png", {
        type: "image/png",
        lastModified: Date.now(),
      });

      setFormData((prev) => ({
        ...prev,
        pfp: croppedFile,
      }));

      setCropperVisible(false);
      if (rawImage) URL.revokeObjectURL(rawImage);
      setRawImage(null);
    }, "image/png");
  }

  return (
    <div>
      <label htmlFor="pfp" className="text-base font-medium text-foreground">
        Profile Picture
      </label>
      <div className="flex items-center gap-5 mt-3">
        <div className="w-20 h-20 rounded-full overflow-hidden border border-border bg-muted shadow-sm">
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
        <div className="flex flex-col gap-1">
          <label className="max-w-20 relative cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors duration-200">
            Upload
            <input
              type="file"
              accept="image/*"
              id="pfp"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={onFileChange}
            />
          </label>
          {formData.pfp && (
            <span className="text-sm text-muted-foreground truncate max-w-[12rem]">
              {formData.pfp.name}
            </span>
          )}
        </div>
      </div>

      {/* Cropper Overlay */}
{cropperVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative bg-background rounded-lg p-4 max-w-md w-full">
            <p className="mb-2 text-center font-semibold text-foreground">
              Crop your profile picture
            </p>
            <div
              ref={containerRef} // Added container ref
              className="relative select-none flex justify-center items-center"
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
                className="max-w-full max-h-[300px] rounded select-none"
                draggable={false}
                onLoad={() => {
                  if (!imgRef.current || !canvasRef.current) return;

                  // Set canvas size same as displayed image size
                  canvasRef.current.width = imgRef.current.width;
                  canvasRef.current.height = imgRef.current.height;

                  // Initialize crop area: centered square, max 200px or smaller if image is small
                  const size = Math.min(200, imgRef.current.width, imgRef.current.height);

                  setCropParams({
                    x: (imgRef.current.width - size) / 2,
                    y: (imgRef.current.height - size) / 2,
                    size,
                  });
                }}
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