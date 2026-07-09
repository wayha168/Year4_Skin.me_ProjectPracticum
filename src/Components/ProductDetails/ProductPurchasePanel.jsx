"use client";

import React from "react";
import { FaCartPlus, FaHeart } from "react-icons/fa";
import ProductPrice from "../ProductPrice/ProductPrice";
import { getBrandName, getMaxStock, getSkinTypeLabel, getTeaser } from "./productHelpers";

const ProductPurchasePanel = ({
  product,
  quantity,
  onQuantityChange,
  discountedPrice,
  discountPercentage,
  isFavorited,
  onAddToCart,
  onToggleFavorite,
}) => {
  const brandName = getBrandName(product);
  const maxStock = getMaxStock(product);
  const skinType = getSkinTypeLabel(product);

  return (
    <div className="lg:pt-2">
      {brandName && (
        <p className="text-[1.3rem] font-medium text-gray-500 uppercase tracking-widest mb-2">
          {brandName}
        </p>
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-3">
        {product.name}
      </h1>
      <p className="text-lg text-gray-600 mb-6 leading-relaxed">{getTeaser(product.description)}</p>

      <div className="mb-7">
        {discountPercentage != null && (
          <p className="text-[#eb61a2] text-[2rem] font-semibold mb-0.5">{discountPercentage}% OFF</p>
        )}
        <p className="text-sm text-gray-500 mb-0.5">Price</p>
        <ProductPrice
          price={product.price}
          discountedPrice={discountedPrice}
          originalClassName="line-through text-gray-400 text-2xl"
          discountedClassName="text-2xl font-bold text-gray-900"
          priceClassName="text-2xl font-bold text-gray-900"
        />
        {skinType && (
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium text-gray-700">Skin type:</span> {skinType}
          </p>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-1">
          <span className="text-sm font-medium text-gray-700">Quantity</span>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity === 1}
              className={`w-11 h-11 flex items-center font-bold text-[1.3rem] justify-center transition-colors ${
                quantity === 1
                  ? "text-[#CACACA] cursor-not-allowed"
                  : "text-gray-600 hover:bg-[#B0D8D4]"
              }`}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(Math.min(maxStock, quantity + 1))}
              disabled={quantity >= maxStock}
              className={`w-11 h-11 flex items-center font-bold text-[1.3rem] justify-center transition-colors ${
                quantity >= maxStock
                  ? "text-[#CACACA] cursor-not-allowed"
                  : "text-gray-600 hover:bg-[#B0D8D4]"
              }`}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
        {maxStock < 999 && <p className="text-xs text-gray-500">Only {maxStock} left in stock</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onAddToCart(product.id, quantity)}
          className="flex-1 min-w-[200px] bg-[#eb61a2] text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#d13e82] active:scale-[0.98]"
        >
          <FaCartPlus className="text-lg" /> Add to Bag
        </button>
        <button
          type="button"
          onClick={() => onToggleFavorite(product.id)}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-[#F83E94] hover:text-[#F83E94] transition-colors"
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <FaHeart className={`text-lg ${isFavorited ? "text-[#F83E94]" : "text-[#2F2F2F]"}`} />
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-500">Free shipping on orders over a certain amount.</p>
    </div>
  );
};

export default ProductPurchasePanel;
