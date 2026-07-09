"use client";

import React from "react";
import Image from "next/image";
import { getProductImageUrlFromItem } from "../../app/lib/productImage";
import useImageZoom from "./useImageZoom";

const DefaultImage = "/assets/third_image.png";

const ProductImageGallery = ({ product, selectedImageIndex, onSelectImage }) => {
  const { galleryRef, zoom, zoomScale, lensSize, handleZoomMove, handleZoomEnd } =
    useImageZoom(selectedImageIndex);

  const mainImageSrc = product?.images?.[selectedImageIndex]
    ? getProductImageUrlFromItem(product.images[selectedImageIndex], DefaultImage)
    : product?.images?.[0]
      ? getProductImageUrlFromItem(product.images[0], DefaultImage)
      : DefaultImage;

  const imageAlt =
    product.images?.[selectedImageIndex]?.fileName ||
    product.images?.[0]?.fileName ||
    product.name;

  return (
    <div className="space-y-4">
      <div
        ref={galleryRef}
        className="relative aspect-square w-full max-w-lg mx-auto rounded-2xl cursor-zoom-in bg-white overflow-hidden select-none touch-none"
        onMouseEnter={(e) => handleZoomMove(e.clientX, e.clientY)}
        onMouseMove={(e) => handleZoomMove(e.clientX, e.clientY)}
        onMouseLeave={handleZoomEnd}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) handleZoomMove(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          if (t) handleZoomMove(t.clientX, t.clientY);
        }}
        onTouchEnd={handleZoomEnd}
        onTouchCancel={handleZoomEnd}
      >
        <div
          className="absolute inset-0 rounded-2xl bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${mainImageSrc})`,
            backgroundSize: "cover",
          }}
          role="img"
          aria-label={imageAlt}
        />
        {zoom.show && (
          <div
            className="absolute pointer-events-none rounded-full border-2 border-white shadow-xl overflow-hidden z-10 will-change-transform"
            style={{
              width: lensSize,
              height: lensSize,
              left: zoom.lensX - lensSize / 2,
              top: zoom.lensY - lensSize / 2,
              backgroundImage: `url(${mainImageSrc})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${zoomScale * 100}%`,
              backgroundPosition: `${zoom.x}% ${zoom.y}%`,
            }}
          />
        )}
      </div>

      {product?.images?.length > 1 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {product.images.map((img, idx) => (
            <button
              key={img.imageId ?? idx}
              type="button"
              onClick={() => onSelectImage(idx)}
              className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#eb61a2] focus:ring-offset-2 ${
                selectedImageIndex === idx
                  ? "border-[#eb61a2]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={getProductImageUrlFromItem(img, DefaultImage)}
                alt={img.fileName || `${product.name} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
