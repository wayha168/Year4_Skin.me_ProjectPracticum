"use client";

import React from "react";
import { getHowToUse, getProductTypeLabel, getSkinTypeLabel } from "./productHelpers";

const Section = ({ title, children }) => (
  <section>
    <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
    <p className="text-gray-600 leading-relaxed max-w-2xl whitespace-pre-line">{children}</p>
  </section>
);

const ProductInfoSections = ({ product }) => {
  const description = product?.description?.trim() || "";
  const howToUse = getHowToUse(product);
  const skinType = getSkinTypeLabel(product);
  const productType = getProductTypeLabel(product);
  const hasAny = Boolean(description || howToUse || skinType || productType);

  return (
    <div className="space-y-10">
      {description && <Section title="Product details">{description}</Section>}
      {howToUse && <Section title="How to use">{howToUse}</Section>}
      {skinType && <Section title="Skin type">{skinType}</Section>}
      {productType && <Section title="Product type">{productType}</Section>}
      {!hasAny && (
        <Section title="Product details">No additional details available.</Section>
      )}
    </div>
  );
};

export default ProductInfoSections;
