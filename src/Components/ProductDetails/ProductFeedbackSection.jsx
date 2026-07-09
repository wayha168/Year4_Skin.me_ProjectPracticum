"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductFeedbackForm from "../ProductFeedbackForm/ProductFeedbackForm";
import { getInitials } from "./productHelpers";

function formatFeedbackDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const FeedbackCard = ({ feedback }) => {
  const rating = Number(feedback?.rating);
  const stars = Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.round(rating))) : 0;
  const comment = feedback?.comment?.trim() || "";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        {feedback.imageUrl ? (
          <Image
            src={feedback.imageUrl}
            alt="Reviewer"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {getInitials(feedback.userDisplayName)}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{feedback.userDisplayName || "Customer"}</p>
          <p className="text-xs text-gray-500">{formatFeedbackDate(feedback.createdAt)}</p>
        </div>
        <div className="ml-auto flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`text-xl ${i <= stars ? "text-yellow-400" : "text-gray-200"}`}>
              ★
            </span>
          ))}
        </div>
      </div>
      {comment && <p className="text-gray-600 leading-relaxed">{comment}</p>}
    </div>
  );
};

const PurchaseGateMessage = ({ isLoggedIn, checkingPurchase }) => {
  const [loginHref, setLoginHref] = useState("/login");

  useEffect(() => {
    setLoginHref(
      `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
    );
  }, []);

  if (checkingPurchase) {
    return (
      <div className="max-w-2xl bg-white border border-gray-100 rounded-2xl p-5 text-sm text-gray-500">
        Checking your orders…
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl bg-white border border-gray-100 rounded-2xl p-5 text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-1">Want to leave a review?</p>
        <p>
          Please{" "}
          <Link href={loginHref} className="text-[#eb61a2] font-medium hover:underline">
            log in
          </Link>{" "}
          after purchasing this product to share feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl bg-white border border-gray-100 rounded-2xl p-5 text-sm text-gray-600">
      <p className="font-medium text-gray-900 mb-1">Reviews are for verified purchases</p>
      <p>
        You can comment on this product after it appears in your orders.{" "}
        <Link href="/products" className="text-[#eb61a2] font-medium hover:underline">
          Continue shopping
        </Link>
      </p>
    </div>
  );
};

const ProductFeedbackSection = ({
  productId,
  orderId,
  feedbacks,
  onSubmitted,
  canReview = false,
  checkingPurchase = false,
  isLoggedIn = false,
}) => {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Feedback</h2>

      <div className="mb-6">
        {canReview ? (
          <ProductFeedbackForm
            productId={productId}
            orderId={orderId}
            requireOrder
            onSubmitted={onSubmitted}
          />
        ) : (
          <PurchaseGateMessage isLoggedIn={isLoggedIn} checkingPurchase={checkingPurchase} />
        )}
      </div>

      {feedbacks.length > 0 ? (
        <div className="space-y-4 max-w-2xl">
          {feedbacks.map((fb, idx) => (
            <FeedbackCard key={fb.id ?? idx} feedback={fb} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic max-w-2xl">
          No feedback yet for this product. Be the first to share your experience!
        </p>
      )}
    </section>
  );
};

export default ProductFeedbackSection;
