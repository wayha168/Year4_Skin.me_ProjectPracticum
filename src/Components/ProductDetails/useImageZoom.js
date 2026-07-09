"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ZOOM_SCALE = 2.5;
const LENS_SIZE = 200;

/**
 * Smooth product-image magnifier. Uses rAF so pointer moves stay consistent.
 */
export default function useImageZoom(resetKey) {
  const galleryRef = useRef(null);
  const zoomRafRef = useRef(null);
  const [zoom, setZoom] = useState({ show: false, x: 50, y: 50, lensX: 0, lensY: 0 });

  const handleZoomEnd = useCallback(() => {
    if (zoomRafRef.current) cancelAnimationFrame(zoomRafRef.current);
    setZoom((z) => ({ ...z, show: false }));
  }, []);

  const handleZoomMove = useCallback((clientX, clientY) => {
    if (!galleryRef.current) return;
    const rect = galleryRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setZoom((z) => (z.show ? { ...z, show: false } : z));
      return;
    }

    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));
    const half = LENS_SIZE / 2;
    const lensX = Math.max(half, Math.min(x, rect.width - half));
    const lensY = Math.max(half, Math.min(y, rect.height - half));

    if (zoomRafRef.current) cancelAnimationFrame(zoomRafRef.current);
    zoomRafRef.current = requestAnimationFrame(() => {
      setZoom({ show: true, x: percentX, y: percentY, lensX, lensY });
    });
  }, []);

  useEffect(() => {
    handleZoomEnd();
  }, [resetKey, handleZoomEnd]);

  useEffect(() => {
    return () => {
      if (zoomRafRef.current) cancelAnimationFrame(zoomRafRef.current);
    };
  }, []);

  return {
    galleryRef,
    zoom,
    zoomScale: ZOOM_SCALE,
    lensSize: LENS_SIZE,
    handleZoomMove,
    handleZoomEnd,
  };
}
