import React, { useRef, useEffect, useState } from "react";
import { Button } from '@/components/ui/button';

export default function BannerCropOverlay({
  rawImage,
  onCancel,
  onCrop,
  shape = "rect",
}) {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [cropParams, setCropParams] = useState({ x: 0, y: 0, width: 100, height: 40 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [zoom, setZoom] = useState(1);
  
  function getMousePosOnImage(e) {
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    // Adjust for zoom
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    return { x, y };
  }

function handleCrop() {
  const img = imgRef.current;
  if (!img) return;

  // Adjust cropParams for zoom
  const cropX = cropParams.x / zoom;
  const cropY = cropParams.y / zoom;
  const cropW = cropParams.width / zoom;
  const cropH = cropParams.height / zoom;

  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;

  const sx = cropX * scaleX;
  const sy = cropY * scaleY;
  const sWidth = cropW * scaleX;
  const sHeight = cropH * scaleY;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = cropParams.width;
  outputCanvas.height = cropParams.height;
  const ctx = outputCanvas.getContext("2d");

  if (shape === "circle") {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      cropParams.width / 2,
      cropParams.height / 2,
      Math.min(cropParams.width, cropParams.height) / 2,
      0,
      2 * Math.PI
    );
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(
    img,
    sx, sy, sWidth, sHeight,
    0, 0, cropParams.width, cropParams.height
  );

  if (shape === "circle") ctx.restore();

  outputCanvas.toBlob((blob) => {
    if (!blob) return;
    const croppedFile = new File([blob], `cropped-${shape}.png`, {
      type: "image/png",
      lastModified: Date.now(),
    });
    onCrop(croppedFile);
  }, "image/png");
}
  function initCropArea() {
    const img = imgRef.current;
    if (!img) return;
    const imgWidth = img.width;
    const imgHeight = img.height;
    let width, height;
    if (shape === "circle") {
      const size = Math.min(imgWidth, imgHeight, imgWidth * 0.8, imgHeight * 0.8);
      width = height = size;
    } else {
      const aspectRatio = 3 / 1;
      if (imgWidth / imgHeight > aspectRatio) {
        height = Math.min(200, imgHeight);
        width = height * aspectRatio;
      } else {
        width = Math.min(600, imgWidth);
        height = width / aspectRatio;
      }
    }
    setCropParams({
      x: (imgWidth - width) / 2,
      y: (imgHeight - height) / 2,
      width,
      height,
    });
  }

  function isInsideCropRect(pos) {
    if (!pos) return false;
    if (shape === "circle") {
      const cx = cropParams.x + cropParams.width / 2;
      const cy = cropParams.y + cropParams.height / 2;
      const r = cropParams.width / 2;
      return (
        Math.pow(pos.x - cx, 2) + Math.pow(pos.y - cy, 2) <= r * r
      );
    }
    return (
      pos.x >= cropParams.x &&
      pos.x <= cropParams.x + cropParams.width &&
      pos.y >= cropParams.y &&
      pos.y <= cropParams.y + cropParams.height
    );
  }

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
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    const img = imgRef.current;
    if (!img) return;

    setCropParams((prev) => {
      let newX = prev.x + dx;
      let newY = prev.y + dy;
      newX = Math.max(0, Math.min(img.width - prev.width, newX));
      newY = Math.max(0, Math.min(img.height - prev.height, newY));
      return { ...prev, x: newX, y: newY };
    });

    setDragStart(pos);
  } 

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !cropParams) return;

      canvas.width = img.width;
      canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(
        cropParams.x + cropParams.width / 2,
        cropParams.y + cropParams.height / 2,
        Math.min(cropParams.width, cropParams.height) / 2,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.clip();
      ctx.clearRect(cropParams.x, cropParams.y, cropParams.width, cropParams.height);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(
        cropParams.x + cropParams.width / 2,
        cropParams.y + cropParams.height / 2,
        Math.min(cropParams.width, cropParams.height) / 2,
        0,
        2 * Math.PI
      );
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.clearRect(cropParams.x, cropParams.y, cropParams.width, cropParams.height);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropParams.x, cropParams.y, cropParams.width, cropParams.height);
    }
  }, [cropParams, zoom, rawImage, shape]);

  let transformOrigin = "center center";
  const img = imgRef.current;
  if (img && cropParams) {
    const originX = ((cropParams.x + cropParams.width / 2) / img.width) * 100;
    const originY = ((cropParams.y + cropParams.height / 2) / img.height) * 100;
    transformOrigin = `${originX}% ${originY}%`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-70">
      <div className="relative bg-background rounded-lg p-4 w-full max-w-4xl">
        <p className="mb-2 text-center font-semibold text-foreground">
          Crop your {shape === "circle" ? "profile picture" : "banner"}
        </p>
        <div className="mt-4">
          <input
            id="zoomRange"
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-sm mt-1">Zoom: {zoom.toFixed(1)}x</span>
        </div>

        <div
          ref={containerRef}
          className="relative select-none flex justify-center items-center max-h-[70vh]"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseUp}
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          {/* Your untouched image + canvas block */}
          <div className="max-w-full max-h-[60vh] rounded relative select-none flex justify-center items-center overflow-hidden" >
          <img
            ref={imgRef}
            src={rawImage}
            alt="To crop"
            className="max-w-full max-h-[60vh] rounded select-none"
            draggable={false}
            onLoad={initCropArea}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: transformOrigin,
            }}
          />
            <canvas
              ref={canvasRef}
              className="absolute pointer-events-none rounded"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="bg-muted px-4 py-2 rounded hover:bg-muted/80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="bg-primary px-4 py-2 rounded text-primary-foreground hover:bg-primary/90"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
}
