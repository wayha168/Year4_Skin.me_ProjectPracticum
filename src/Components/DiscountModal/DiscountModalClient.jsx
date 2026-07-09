"use client";

import dynamic from "next/dynamic";

// Client-only: prevents SSR HTML for the promo modal (avoids hydration mismatches)
const DiscountModal = dynamic(() => import("./Modal"), {
  ssr: false,
  loading: () => null,
});

export default function DiscountModalClient() {
  return <DiscountModal />;
}
