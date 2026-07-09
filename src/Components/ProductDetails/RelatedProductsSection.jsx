"use client";

import React from "react";
import Link from "next/link";
import ProductCard from "../ProductCard/ProductCard";

const RelatedProductsSection = ({
  brandName,
  products,
  discountedPrices,
  favoriteIds,
  onAddToCart,
  onToggleFavorite,
}) => {
  if (!products?.length) return null;

  return (
    <section className="max-w-6xl mx-auto mt-16 pt-14 border-t border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Recommended with</h2>
        {brandName && (
          <Link
            href={`/products?search=${encodeURIComponent(brandName)}`}
            className="text-sm font-medium text-[#eb61a2] hover:underline"
          >
            View All Products
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            compact
            discountedPrice={discountedPrices[p.id]}
            isFavorited={favoriteIds.has(Number(p.id))}
            onAddToCart={(id) => onAddToCart(id, 1)}
            onFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedProductsSection;
