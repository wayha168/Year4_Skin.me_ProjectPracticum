"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import axiosAuth from "../../app/lib/api/axiosConfig";
import useAuthContext from "../../app/lib/Authentication/AuthContext";

/**
 * Submit product feedback via POST /feedback
 * Query: productId, rating, comment?, orderId?
 * Body: multipart image?
 */
const ProductFeedbackForm = ({
  productId,
  orderId: orderIdProp,
  requireOrder = false,
  onSubmitted,
}) => {
  const { user } = useAuthContext();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [orderId, setOrderId] = useState(orderIdProp ? String(orderIdProp) : "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loginHref, setLoginHref] = useState("/login");
  const hasLinkedOrder = Boolean(orderIdProp);

  useEffect(() => {
    setOrderId(orderIdProp ? String(orderIdProp) : "");
  }, [orderIdProp]);

  useEffect(() => {
    setLoginHref(
      `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
    );
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const clearImage = () => {
    setImageFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      clearImage();
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      e.target.value = "";
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setImageFile(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to leave feedback");
      return;
    }
    if (!productId) {
      toast.error("Missing product");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }

    const trimmedOrderId = orderId.trim();
    if (requireOrder && !trimmedOrderId) {
      toast.error("Only purchased products can be reviewed");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (imageFile) formData.append("image", imageFile);

      const params = {
        productId: Number(productId),
        rating: Number(rating),
      };
      const trimmedComment = comment.trim();
      if (trimmedComment) params.comment = trimmedComment;
      if (trimmedOrderId) params.orderId = Number(trimmedOrderId);

      await axiosAuth.post("/feedback", formData, {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Thank you for your feedback!");
      setRating(0);
      setHoverRating(0);
      setComment("");
      setOrderId(orderIdProp ? String(orderIdProp) : "");
      clearImage();
      onSubmitted?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Could not submit feedback";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl bg-white border border-gray-100 rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-base font-semibold text-gray-900">Write a review</h3>

      {!user && (
        <p className="text-sm text-gray-500">
          Please{" "}
          <Link href={loginHref} className="text-[#eb61a2] font-medium hover:underline">
            log in
          </Link>{" "}
          to share your feedback.
        </p>
      )}

      {user && hasLinkedOrder && (
        <p className="text-sm text-[#eb61a2] font-medium">
          Verified purchase · Order #{orderIdProp}
        </p>
      )}

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Your rating</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = (hoverRating || rating) >= value;
            return (
              <button
                key={value}
                type="button"
                disabled={!user || submitting}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                className={`text-2xl leading-none transition-colors disabled:opacity-50 ${
                  active ? "text-yellow-400" : "text-gray-200"
                }`}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                aria-checked={rating === value}
                role="radio"
              >
                ★
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-1.5">
          Comment <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!user || submitting}
          rows={3}
          maxLength={1000}
          placeholder="Share your experience with this product…"
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#eb61a2]/40 focus:border-[#eb61a2] disabled:bg-gray-50 disabled:cursor-not-allowed resize-y"
        />
      </div>

      {!hasLinkedOrder && !requireOrder && (
        <div>
          <label htmlFor="feedback-order" className="block text-sm font-medium text-gray-700 mb-1.5">
            Order ID <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="feedback-order"
            type="number"
            inputMode="numeric"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            disabled={!user || submitting}
            placeholder="If you purchased this product"
            className="w-full max-w-xs rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#eb61a2]/40 focus:border-[#eb61a2] disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-gray-700 mb-1.5">
          Photo <span className="text-gray-400 font-normal">(optional)</span>
        </p>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Feedback preview"
              className="h-24 w-24 rounded-xl object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={clearImage}
              disabled={submitting}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center hover:bg-gray-700"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ) : (
          <label
            className={`inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 cursor-pointer hover:border-[#eb61a2] hover:text-[#eb61a2] transition-colors ${
              !user || submitting ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <span>Choose image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={!user || submitting}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={!user || submitting || !rating}
        className="bg-[#eb61a2] text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 hover:bg-[#d13e82] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {submitting ? "Submitting…" : "Submit feedback"}
      </button>
    </form>
  );
};

export default ProductFeedbackForm;
