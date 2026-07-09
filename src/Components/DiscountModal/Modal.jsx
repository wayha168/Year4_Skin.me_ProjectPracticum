"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import axiosAuth from "../../app/lib/api/axiosConfig";
import { OPEN_DISCOUNT_MODAL_EVENT } from "./openDiscountModal";

const DEFAULT_IMAGE = "/assets/ModalDiscountImage/torriden.jpg";
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL ?? "";
const SEEN_KEY = "discountModalLastSeenAt";
const AUTO_SHOW_COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 hours

function shouldAutoShowPromo() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return true;

    // Migrate old forever-hide flag into a 3-hour cooldown timestamp
    if (raw === "true") {
      markPromoSeen();
      return false;
    }

    const lastSeenAt = Number(raw);
    if (!Number.isFinite(lastSeenAt) || lastSeenAt <= 0) return true;

    return Date.now() - lastSeenAt >= AUTO_SHOW_COOLDOWN_MS;
  } catch {
    return true;
  }
}

function markPromoSeen() {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    // ignore storage errors
  }
}

function extractPercent(obj) {
  const val =
    obj?.discountPercentage ??
    obj?.discount_percentage ??
    obj?.discountPercent ??
    obj?.discount_percent ??
    obj?.percent ??
    obj?.value;
  if (typeof val === "number") return val;
  if (typeof val === "string" && val.trim() !== "") return Number(val);
  return null;
}

function resolveImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string" || rawUrl.trim() === "") return null;
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
  if (CDN_BASE_URL) return `${CDN_BASE_URL.replace(/\/$/, "")}/${rawUrl.replace(/^\//, "")}`;
  return rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
}

function getPromoImage(obj) {
  if (!obj || typeof obj !== "object") return null;

  const directFields = [
    obj.image,
    obj.imageUrl,
    obj.image_url,
    obj.bannerImage,
    obj.banner_image,
    obj.thumbnail,
    obj.thumbnailUrl,
    obj.thumbnail_url,
    obj.photo,
    obj.photoUrl,
    obj.productImage,
    obj.product_image,
    obj.promotionImage,
    obj.promotion_image,
  ];

  for (const field of directFields) {
    if (typeof field === "string" && field.trim() !== "") return resolveImageUrl(field);
  }

  const imageKey = obj.ImageKey ?? obj.imageKey ?? obj.image_key;
  if (typeof imageKey === "string" && imageKey.trim() !== "") return resolveImageUrl(imageKey);

  const imgObj = typeof obj.image === "object" ? obj.image : obj.imageObj ?? obj.media;
  if (imgObj && typeof imgObj === "object") {
    const nested = imgObj.downloadUrl ?? imgObj.url ?? imgObj.src;
    if (typeof nested === "string" && nested.trim() !== "") return resolveImageUrl(nested);
  }

  const imagesArr = obj.images ?? obj.mediaList ?? obj.photos ?? obj.gallery;
  if (Array.isArray(imagesArr) && imagesArr.length > 0) {
    const first = imagesArr[0];
    if (typeof first === "string") return resolveImageUrl(first);
    const nested = first?.downloadUrl ?? first?.url ?? first?.src ?? first?.imageUrl;
    if (typeof nested === "string" && nested.trim() !== "") return resolveImageUrl(nested);
  }

  if (obj.product) {
    const productImg = getPromoImage(obj.product);
    if (productImg) return productImg;
  }

  return null;
}

function getPromoDates(promo) {
  const startRaw = promo?.startDate ?? promo?.start_date ?? promo?.validFrom ?? null;
  const endRaw = promo?.endDate ?? promo?.end_date ?? promo?.validTo ?? promo?.deadline ?? null;
  const start = startRaw ? new Date(startRaw) : null;
  const end = endRaw ? new Date(endRaw) : null;
  return {
    start: start && !Number.isNaN(start.getTime()) ? start : null,
    end: end && !Number.isNaN(end.getTime()) ? end : null,
  };
}

function isExplicitlyInactive(promo) {
  const explicit =
    promo?.active ??
    promo?.isActive ??
    promo?.is_active ??
    promo?.status ??
    promo?.promotionStatus;

  if (typeof explicit === "boolean") return !explicit;
  if (typeof explicit === "string") {
    const s = explicit.toLowerCase();
    return ["inactive", "expired", "ended", "disabled", "false"].includes(s);
  }
  return false;
}

function isWithinDeadline(promo, now = new Date()) {
  const { start, end } = getPromoDates(promo);
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

function formatPromoDate(date) {
  if (!date) return "";
  // Fixed locale avoids SSR/client locale mismatches
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDeadlineLabel(promo, now = new Date()) {
  const { start, end } = getPromoDates(promo);

  if (start && now < start) {
    return {
      status: "upcoming",
      label: `Starts ${formatPromoDate(start)}`,
      tone: "upcoming",
    };
  }

  if (end) {
    const msLeft = end.getTime() - now.getTime();
    if (msLeft <= 0) {
      return { status: "expired", label: "Ended", tone: "expired" };
    }
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    if (daysLeft <= 1) {
      return { status: "active", label: "Ends today", tone: "urgent" };
    }
    if (daysLeft <= 3) {
      return { status: "active", label: `${daysLeft} days left`, tone: "urgent" };
    }
    return {
      status: "active",
      label: `Until ${formatPromoDate(end)}`,
      tone: "active",
    };
  }

  return { status: "active", label: "Active now", tone: "active" };
}

function normalizePromotions(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.promotions)) return payload.promotions;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.discount || payload?.promotion) return [payload.discount ?? payload.promotion];
  if (payload && typeof payload === "object") return [payload];
  return [];
}

function enrichPromotions(list, now = new Date()) {
  return list.map((p) => ({
    ...p,
    __image: getPromoImage(p) || DEFAULT_IMAGE,
    __deadline: getDeadlineLabel(p, now),
    __percent: extractPercent(p),
  }));
}

function getPromoTitle(p) {
  return p?.title ?? p?.heading ?? p?.name ?? p?.offerTitle ?? "Special offer";
}

function getPromoDescription(p) {
  const text = p?.description ?? p?.detail ?? p?.details ?? p?.summaryLine ?? "";
  return typeof text === "string" ? text.trim() : "";
}

/** Resolve product id from a promotion payload for Shop now → product details. */
function getPromoProductId(promo) {
  if (!promo || typeof promo !== "object") return null;
  const raw =
    promo.productId ??
    promo.product_id ??
    promo.product?.id ??
    promo.product?.productId ??
    promo.items?.[0]?.productId ??
    promo.items?.[0]?.product?.id ??
    promo.products?.[0]?.id ??
    promo.products?.[0]?.productId ??
    null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function DiscountModal() {
  const router = useRouter();
  // Avoid SSR/client HTML mismatch — render only after mount
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      let list = [];

      try {
        const res = await axiosAuth.get("/promotions/active");
        list = normalizePromotions(res?.data?.data ?? res?.data);
      } catch {
        list = [];
      }

      if (!list.length) {
        try {
          const res = await axiosAuth.get("/promotions/all");
          list = normalizePromotions(res?.data?.data ?? res?.data);
        } catch {
          list = [];
        }
      }

      const now = new Date();

      // Prefer currently valid promos; if none match dates, still show non-inactive ones
      let selected = list.filter((p) => !isExplicitlyInactive(p) && isWithinDeadline(p, now));
      if (!selected.length) {
        selected = list.filter((p) => !isExplicitlyInactive(p));
      }
      if (!selected.length) {
        selected = list;
      }

      setPromotions(enrichPromotions(selected, now));
      setIndex(0);
    } catch (error) {
      console.error("[DiscountModal] Failed to load promotions:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchPromotions();
  }, [mounted, fetchPromotions]);

  const openModal = useCallback(async () => {
    if (promotions.length === 0) {
      await fetchPromotions();
    }
    setOpen(true);
  }, [promotions.length, fetchPromotions]);

  useEffect(() => {
    if (!mounted) return undefined;

    const onOpenRequest = () => {
      openModal();
    };

    window.addEventListener(OPEN_DISCOUNT_MODAL_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_DISCOUNT_MODAL_EVENT, onOpenRequest);
  }, [mounted, openModal]);

  useEffect(() => {
    if (!mounted || loading) return;
    if (promotions.length === 0) return;

    // Auto-popup only on first visit, then again after 3 hours
    if (!shouldAutoShowPromo()) return undefined;

    const timer = setTimeout(() => {
      setOpen(true);
      markPromoSeen();
    }, 800);
    return () => clearTimeout(timer);
  }, [mounted, loading, promotions.length]);

  const closeModal = useCallback(() => {
    setOpen(false);
    markPromoSeen();
  }, []);

  const goTo = useCallback(
    (next) => {
      if (!promotions.length) return;
      setIndex(((next % promotions.length) + promotions.length) % promotions.length);
    },
    [promotions.length]
  );

  const current = promotions[index] || null;

  const toneClass = useMemo(() => {
    const tone = current?.__deadline?.tone;
    if (tone === "urgent") return "bg-amber-500 text-white";
    if (tone === "expired") return "bg-gray-400 text-white";
    if (tone === "upcoming") return "bg-sky-500 text-white";
    return "bg-emerald-500 text-white";
  }, [current]);

  useEffect(() => {
    if (!open) return undefined;

    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open, closeModal, goTo, index]);

  // Never render modal markup on the server
  if (!mounted || !open) return null;

  if (!current) {
    return (
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={closeModal}
        role="dialog"
        aria-modal="true"
        aria-label="Promotion"
      >
        <div
          className="relative w-full max-w-[420px] rounded-2xl bg-white p-8 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
            aria-label="Close promotion"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-lg font-semibold text-[#eb61a2]">
            {loading ? "Loading promotions..." : "No active promotions right now"}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {loading ? "Please wait a moment." : "Check back soon for special offers."}
          </p>
        </div>
      </div>
    );
  }

  const percent = current.__percent;
  const title = getPromoTitle(current);
  const description = getPromoDescription(current);
  const shortDescription =
    description.length > 110 ? `${description.slice(0, 110).trim()}…` : description;
  const productId = getPromoProductId(current);

  const handleShopNow = () => {
    closeModal();
    if (productId) {
      router.push(`/product_details?productId=${productId}`);
      return;
    }
    router.push("/products");
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={closeModal}
      style={{ touchAction: "none" }}
      role="dialog"
      aria-modal="true"
      aria-label="Promotion"
    >
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
          aria-label="Close promotion"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-[4/5] w-full bg-gray-100 sm:aspect-[3/4]">
          <img
            key={current.__image}
            src={current.__image}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src !== DEFAULT_IMAGE) e.currentTarget.src = DEFAULT_IMAGE;
            }}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Big discount badge — easy to see */}
          <div className="absolute left-3 top-3 right-14 z-10 flex flex-col items-start gap-2">
            {percent != null && percent > 0 && (
              <div className="rounded-2xl bg-[#eb61a2] px-4 py-2.5 shadow-[0_8px_24px_rgba(235,97,162,0.45)] ring-2 ring-white/80">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                  Save
                </p>
                <p className="text-4xl sm:text-5xl font-black leading-none text-white tabular-nums">
                  {Math.round(percent)}
                  <span className="text-2xl sm:text-3xl align-top">%</span>
                </p>
                <p className="mt-0.5 text-sm font-bold uppercase tracking-wide text-white">OFF</p>
              </div>
            )}
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold shadow ${toneClass}`}>
              {current.__deadline?.label || "Active"}
            </span>
          </div>

          {promotions.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow transition hover:bg-white"
                aria-label="Previous promotion"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow transition hover:bg-white"
                aria-label="Next promotion"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">
              Promotion
            </p>
            <h2 className="mt-1 text-base font-semibold leading-snug line-clamp-2">{title}</h2>
            {shortDescription && (
              <p className="mt-1 text-[11px] leading-relaxed text-white/80 line-clamp-2">
                {shortDescription}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleShopNow}
                className="rounded-full bg-[#eb61a2] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#d13e82]"
              >
                Shop now
              </button>

              {promotions.length > 1 && (
                <div className="flex items-center gap-1.5" aria-label="Promotion pagination">
                  {promotions.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Promotion ${i + 1}`}
                      aria-current={i === index}
                      className={[
                        "rounded-full transition-all",
                        i === index ? "h-1.5 w-4 bg-white" : "h-1.5 w-1.5 bg-white/45 hover:bg-white/70",
                      ].join(" ")}
                    />
                  ))}
                  <span className="ml-1 text-[10px] tabular-nums text-white/70">
                    {index + 1}/{promotions.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
