"use client";

import React, { useEffect, useCallback, useMemo, useRef, useState, Suspense } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import axiosAuth from "./lib/api/axiosConfig.js";
import Navbar from "../Components/Navbar/Navbar.jsx";
import useUserActions from "../Components/Hooks/userUserActions.js";
import useAuthContext from "./lib/Authentication/AuthContext.jsx";
import LoginFirst from "../Components/LoginFirst/LoginFirst.js";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { getProductImageUrl } from "./lib/productImage.js";
import { formatPrice } from "./lib/formatPrice.js";
import ProductCard from "../Components/ProductCard/ProductCard.jsx";

const Footer = dynamic(() => import("../Components/Footer/Footer.jsx"), { ssr: false });

const HOME_PRODUCT_LIMIT = 10;
const FEEDBACK_LIMIT = 7;

const FALLBACK_REVIEWERS = [
  { image: "/assets/ImagesInRecommendation/boss_image.png", name: "Boss Glow", role: "Influencer" },
  {
    image: "/assets/ImagesInRecommendation/none_sence_image.png",
    name: "None Sense",
    role: "Skincare Expert",
  },
  { image: "/assets/ImagesInRecommendation/ohio_image.png", name: "Ohio Fresh", role: "Beauty Blogger" },
  { image: "/assets/ImagesInRecommendation/obey_iamge.png", name: "Obey Clean", role: "Dermatologist" },
  {
    image: "/assets/ImagesInRecommendation/bro_jirim_image.png",
    name: "Bro Jirim",
    role: "Content Creator",
  },
  {
    image: "/assets/ImagesInRecommendation/phol_sophea_image.png",
    name: "Phol Sophea",
    role: "Makeup Artist",
  },
  { image: "/assets/ImagesInRecommendation/profile_image.png", name: "Profile Pro", role: "Influencer" },
];

function timeAgo(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

function extractPromoPercent(promo) {
  const raw =
    promo?.discountPercentage ??
    promo?.discount_percentage ??
    promo?.discountPercent ??
    promo?.discount_percent ??
    null;
  return typeof raw === "number" && raw > 0 ? Math.round(raw) : null;
}

function useScrollAnimation() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

function useDragScroll(ref) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = useCallback(
    (e) => {
      if (!ref.current) return;
      isDragging.current = true;
      startX.current = e.pageX - ref.current.offsetLeft;
      scrollLeft.current = ref.current.scrollLeft;
      ref.current.style.cursor = "grabbing";
    },
    [ref],
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current || !isDragging.current) return;
    isDragging.current = false;
    ref.current.style.cursor = "grab";
  }, [ref]);

  const handleMouseUp = useCallback(() => {
    if (!ref.current || !isDragging.current) return;
    isDragging.current = false;
    ref.current.style.cursor = "grab";
  }, [ref]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!ref.current || !isDragging.current) return;
      e.preventDefault();
      const container = ref.current;
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      const maxScroll = container.scrollWidth - container.clientWidth;
      container.scrollLeft = Math.max(0, Math.min(scrollLeft.current - walk, maxScroll));
    },
    [ref],
  );

  return {
    onMouseDown: handleMouseDown,
    onMouseLeave: handleMouseLeave,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
  };
}

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();
  const { addToCart, addToFavorite, removeFavorite } = useUserActions();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsFeedback, setProductsFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discountedPrices, setDiscountedPrices] = useState({});
  const [discountPercentages, setDiscountPercentages] = useState({});
  const [promoModal, setPromoModal] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);

  const loginFirst = useMemo(() => new LoginFirst(user, router.push), [user, router.push]);

  const testimonialsRef = useRef(null);
  const leftGradientRef = useRef(null);
  const rightGradientRef = useRef(null);
  const dragScrollHandlers = useDragScroll(testimonialsRef);
  const [overviewRef, overviewVisible] = useScrollAnimation();
  const [productRef, productVisible] = useScrollAnimation();
  const [recommendRef, recommendVisible] = useScrollAnimation();
  const [aboutRef, aboutVisible] = useScrollAnimation();

  const scrollToProducts = useCallback(() => {
    const section = document.getElementById("product");
    if (!section) return;
    const navbarHeight = document.querySelector("nav")?.offsetHeight || 80;
    const y = section.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (searchParams.get("scroll") === "product") scrollToProducts();
  }, [searchParams, scrollToProducts]);

  // Parallel homepage data fetch (products + categories + feedback)
  useEffect(() => {
    let cancelled = false;

    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, feedbackRes] = await Promise.all([
          axiosAuth.get("/products/all"),
          axiosAuth.get("/categories/all-categories"),
          axiosAuth.get("/feedback/product/all-feedback"),
        ]);

        if (cancelled) return;

        setProducts(productsRes?.data?.data || []);
        setCategories(categoriesRes?.data?.data || []);

        const feedbackData = feedbackRes?.data?.data;
        const feedbackItems = Array.isArray(feedbackData?.content)
          ? feedbackData.content
          : Array.isArray(feedbackData)
            ? feedbackData
            : [];
        setProductsFeedback(feedbackItems);
      } catch (err) {
        console.error("Error loading homepage data:", err);
        if (!cancelled) {
          setProducts([]);
          setCategories([]);
          setProductsFeedback([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      cancelled = true;
    };
  }, []);

  // One bulk promotions call instead of 2 requests per product
  useEffect(() => {
    const homeProducts = products.slice(0, HOME_PRODUCT_LIMIT);
    if (!homeProducts.length) {
      setDiscountedPrices({});
      setDiscountPercentages({});
      return;
    }

    let cancelled = false;

    const fetchDiscounts = async () => {
      const priceMap = {};
      const pctMap = {};
      const productById = new Map(homeProducts.map((p) => [Number(p.id), p]));

      try {
        const res = await axiosAuth.get("/promotions/active/type/PRODUCT_DISCOUNT");
        const activePromos = res?.data?.data || [];

        activePromos.forEach((promo) => {
          const pid = Number(promo.productId ?? promo.product?.id);
          if (!pid || !productById.has(pid)) return;

          const pct = extractPromoPercent(promo);
          if (!pct) return;

          const product = productById.get(pid);
          const price = Number(product?.price || 0);
          pctMap[pid] = pct;
          if (price > 0) priceMap[pid] = Number((price * (1 - pct / 100)).toFixed(2));
        });
      } catch (err) {
        console.warn("[Home] Could not load active promotions", err);
      }

      if (!cancelled) {
        setDiscountedPrices(priceMap);
        setDiscountPercentages(pctMap);
      }
    };

    fetchDiscounts();
    return () => {
      cancelled = true;
    };
  }, [products]);

  useEffect(() => {
    if (!user?.id) {
      setFavoriteIds(new Set());
      return;
    }

    let cancelled = false;

    const fetchUserFavorites = async () => {
      try {
        const res = await axiosAuth.get(`/favorites/user/${user.id}`, { withCredentials: true });
        if (cancelled) return;
        const favs = res.data?.data || [];
        setFavoriteIds(
          new Set(
            favs
              .map((f) => f.product?.id ?? f.productId ?? f.id)
              .filter(Boolean)
              .map(Number),
          ),
        );
      } catch {
        if (!cancelled) setFavoriteIds(new Set());
      }
    };

    fetchUserFavorites();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const container = testimonialsRef.current;
    const leftGradient = leftGradientRef.current;
    const rightGradient = rightGradientRef.current;
    if (!container || !leftGradient || !rightGradient) return;

    const updateGradients = () => {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const isAtLeft = scrollLeft <= 0;
      const isAtRight = scrollLeft >= maxScroll - 5;

      leftGradient.style.opacity = isAtLeft ? "0" : "1";
      rightGradient.style.opacity = isAtRight ? "0" : "1";
      setCanScrollLeft(!isAtLeft);
      setCanScrollRight(!isAtRight);
    };

    container.addEventListener("scroll", updateGradients, { passive: true });
    const raf = requestAnimationFrame(updateGradients);

    return () => {
      container.removeEventListener("scroll", updateGradients);
      cancelAnimationFrame(raf);
    };
  }, [productsFeedback.length]);

  const handleFavoriteClick = useCallback(
    async (productId) => {
      if (!user) {
        const message = loginFirst.messages.loginRequiredFavorite;
        router.push(`/login?redirect=${encodeURIComponent("/")}&message=${encodeURIComponent(message)}`);
        return;
      }

      const pid = Number(productId);
      const isFavorited = favoriteIds.has(pid);

      try {
        if (isFavorited) {
          await removeFavorite(pid);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(pid);
            return next;
          });
        } else {
          await addToFavorite(pid);
          setFavoriteIds((prev) => new Set(prev).add(pid));
        }
      } catch {
        // handled in hook
      }
    },
    [user, loginFirst, router, addToFavorite, removeFavorite, favoriteIds],
  );

  const handleAddToCartClick = useCallback(
    async (productId) => {
      if (!user) {
        const message = loginFirst.messages.loginRequiredCart;
        router.push(`/login?redirect=${encodeURIComponent("/")}&message=${encodeURIComponent(message)}`);
        return;
      }
      await addToCart(productId, 1);
    },
    [user, loginFirst, router, addToCart],
  );

  const openPromotionModal = useCallback(async (product) => {
    setPromoLoading(true);
    setPromoModal({ product, promotion: null });
    try {
      const res = await axiosAuth.get(`/promotions/product/${product.id}`);
      setPromoModal({ product, promotion: res?.data?.data || null });
    } catch {
      setPromoModal({ product, promotion: null });
    } finally {
      setPromoLoading(false);
    }
  }, []);

  const scrollTestimonials = useCallback((direction) => {
    const container = testimonialsRef.current;
    const cards = container?.querySelectorAll(".testimonial-card");
    if (!container || !cards?.length) return;

    const gap = 24;
    const scrollAmount = cards[0].offsetWidth + gap;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const next =
      direction === "left"
        ? Math.max(0, container.scrollLeft - scrollAmount)
        : Math.min(maxScroll, container.scrollLeft + scrollAmount);

    container.scrollTo({ left: next, behavior: "smooth" });
  }, []);

  const homeProducts = useMemo(() => products.slice(0, HOME_PRODUCT_LIMIT), [products]);
  const overviewProducts = useMemo(() => products.slice(0, 3), [products]);
  const aboutProducts = useMemo(() => products.slice(0, 4), [products]);
  const productById = useMemo(() => new Map(products.map((p) => [p?.id, p])), [products]);

  const recommendationFeedback = useMemo(
    () => productsFeedback.filter((f) => f?.visibleOnFrontend !== false).slice(0, FEEDBACK_LIMIT),
    [productsFeedback],
  );

  const averagePrice = useMemo(() => {
    if (!products.length) return 0;
    return products.reduce((sum, p) => sum + Number(p?.price || 0), 0) / products.length;
  }, [products]);

  const stats = useMemo(
    () => [
      { number: `${products.length}+`, label: "Products Available" },
      { number: `${categories.length}`, label: "Categories" },
      { number: formatPrice(averagePrice), label: "Average Price" },
    ],
    [products.length, categories.length, averagePrice],
  );

  const sectionClass = (visible) =>
    `transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`;

  return (
    <div className="overflow-x-hidden bg-[#F7F7F7]">
      <Navbar alwaysVisible={true} />

      {/* HERO — pt-20 clears fixed header (h-20) so content stays aligned */}
      <section className="relative flex flex-col md:flex-row items-center justify-center w-full min-h-[100svh] bg-[#EE90B9] px-4 sm:px-8 md:px-16 pt-28 pb-16 md:pt-24 md:pb-10 gap-8 md:gap-10">
        <div className="flex flex-col justify-center w-full md:w-1/2 text-center md:text-left z-[2]">
          <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] font-bold text-[#2F2F2F] leading-tight">
            WELCOME TO SKIN.ME
          </h1>
          <p className="tracking-tight text-xl sm:text-2xl md:text-[2.75rem] font-semibold text-white mt-2 mb-3">
            Most Essential Skin Care Product
          </p>
          <p className="text-sm sm:text-base md:text-xl text-[#4c4c4c]/opacity-80 mb-6">
            Give you the best skincare | product is our mission.
          </p>
          <div>
            <button
              type="button"
              onClick={scrollToProducts}
              className="text-white text-lg sm:text-xl md:text-[1.75rem] font-semibold px-8 sm:px-12 py-2.5 sm:py-3.5 bg-[#2F2F2F] rounded-lg border-none cursor-pointer transition-colors duration-200 hover:bg-black"
            >
              Shop Now
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-[20rem] md:max-w-none md:w-1/2 h-[22rem] md:h-[min(42rem,calc(100svh-8rem))] flex items-center justify-center">
          <Image
            sizes="(max-width: 768px) 20rem, 50vw"
            priority
            src="/assets/Banner/FeatureBanner.jpg"
            alt="Skin.me featured product"
            width={500}
            height={650}
            quality={75}
            className="max-w-full max-h-full object-contain rounded-2xl"
            fetchPriority="high"
            unoptimized
          />
        </div>
      </section>

      {/* OVERVIEW */}
      <section ref={overviewRef} className={`py-16 md:py-24 px-4 sm:px-8 ${sectionClass(overviewVisible)}`}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          <div className="w-full lg:w-[42%] text-center lg:text-left">
            <h2 className="text-[#eb61a1] text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              LET&apos;S HAVE A LOOK
            </h2>
            <p className="text-black text-base sm:text-lg md:text-xl font-medium mb-8 opacity-80">
              A quick look at our products — spend a few minutes to see how they look.
            </p>
            <div className="flex justify-center lg:justify-start gap-4">
              {overviewProducts.slice(0, 2).map((product) => (
                <Image
                  key={product.id}
                  src={getProductImageUrl(product)}
                  alt={product?.name || "Product overview"}
                  width={220}
                  height={220}
                  className="w-[9rem] h-[9rem] sm:w-[11rem] sm:h-[11rem] rounded-xl object-cover"
                  loading="lazy"
                  unoptimized
                />
              ))}
            </div>
          </div>
          {overviewProducts[2] && (
            <div className="w-full lg:w-[58%] max-w-xl">
              <Image
                src={getProductImageUrl(overviewProducts[2])}
                alt={overviewProducts[2]?.name || "Product overview"}
                width={560}
                height={480}
                className="w-full aspect-[7/6] object-cover rounded-xl"
                loading="lazy"
                unoptimized
              />
            </div>
          )}
        </div>
      </section>

      {/* CATEGORY MARQUEE */}
      <div className="bg-[#0A3D3F] py-10 sm:py-14 overflow-hidden">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((setIndex) => (
            <div key={setIndex} className="flex whitespace-nowrap items-center">
              {categories.map((category) => {
                const label = String(category?.name || "").toUpperCase();
                const categoryQuery = category?.id
                  ? `categoryId=${encodeURIComponent(category.id)}`
                  : `category=${encodeURIComponent(category?.name || "")}`;
                return (
                  <button
                    key={`${setIndex}-${category.id ?? category.name}`}
                    type="button"
                    onClick={() => router.push(`/products?${categoryQuery}`)}
                    className="mx-8 sm:mx-12 text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[0.08em] text-white/90 not-italic cursor-pointer bg-transparent border-none p-0 transition-colors hover:text-white"
                    title={`View ${label} products`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <section
        ref={productRef}
        id="product"
        className={`py-16 md:py-20 px-4 sm:px-8 text-center ${sectionClass(productVisible)}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10 gap-4">
            <h2 className="text-2xl sm:text-3xl md:text-5xl text-[#eb61a2] font-bold uppercase">
              Our Products
            </h2>
            <button
              type="button"
              className="bg-[#eb61a2] text-white border-none px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-lg cursor-pointer transition-colors hover:bg-[#c8538a] shrink-0"
              onClick={() => router.push("/products")}
            >
              View All
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 text-lg mt-16">Loading products...</p>
          ) : homeProducts.length === 0 ? (
            <p className="text-center text-gray-500 text-lg mt-16">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {homeProducts.map((p, index) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  discountedPrice={discountedPrices[p?.id]}
                  discountPercentage={discountPercentages[p?.id]}
                  isFavorited={favoriteIds.has(Number(p.id))}
                  onAddToCart={handleAddToCartClick}
                  onFavorite={handleFavoriteClick}
                  onDiscountClick={openPromotionModal}
                  priority={index < 4}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEEDBACK */}
      <section
        ref={recommendRef}
        className={`pt-8 pb-16 md:pb-20 px-4 sm:px-8 ${sectionClass(recommendVisible)}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#3C3C3C] mb-4">
              GLOBAL FEEDBACKS
            </h2>
            <p className="text-[#000] text-base sm:text-lg md:text-xl text-left leading-relaxed max-w-4xl mx-auto opacity-80">
              Discover customer-loved skincare essentials for healthy, glowing skin — curated for every skin
              type and daily routine.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => scrollTestimonials("left")}
              disabled={!canScrollLeft}
              aria-label="Previous feedback"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#eb61a2] hover:bg-[#eb61a2] hover:text-white transition-all -ml-2 sm:-ml-4 ${!canScrollLeft ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <FaChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => scrollTestimonials("right")}
              disabled={!canScrollRight}
              aria-label="Next feedback"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#eb61a2] hover:bg-[#eb61a2] hover:text-white transition-all -mr-2 sm:-mr-4 ${!canScrollRight ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <FaChevronRight size={18} />
            </button>

            <div
              ref={leftGradientRef}
              className="absolute left-0 top-0 bottom-4 w-10 bg-gradient-to-r from-[#F7F7F7] to-transparent z-[5] pointer-events-none transition-opacity duration-300"
            />
            <div
              ref={rightGradientRef}
              className="absolute right-0 top-0 bottom-4 w-10 bg-gradient-to-l from-[#F7F7F7] to-transparent z-[5] pointer-events-none transition-opacity duration-300"
            />

            <div
              ref={testimonialsRef}
              id="testimonials-container"
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide cursor-grab select-none"
              {...dragScrollHandlers}
            >
              {recommendationFeedback.map((feedback, idx) => {
                const stars = Math.max(1, Math.min(5, Number(feedback?.rating) || 5));
                const text = feedback?.comment?.trim() || "Recommended skincare product";
                const recItem = FALLBACK_REVIEWERS[idx] || {};
                const product = productById.get(feedback?.productId);
                const reviewerImage = feedback?.imageUrl || recItem.image || getProductImageUrl(product);
                const feedbackKey = feedback.id ?? `feedback-${idx}`;
                const isExpanded = expandedFeedbackId === feedbackKey;

                return (
                  <div
                    key={feedbackKey}
                    className="testimonial-card bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ffd6ec] flex flex-col gap-4 w-[260px] sm:w-[320px] md:w-[350px] flex-shrink-0"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={reviewerImage}
                        alt={feedback?.userDisplayName || "Customer"}
                        width={48}
                        height={48}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                        loading="lazy"
                        unoptimized
                      />
                      <div>
                        <p className="font-bold text-[#3C3C3C] text-sm">
                          {feedback?.userDisplayName || recItem.name || "Customer"}
                        </p>
                        <p className="text-[#aaa] text-xs">{recItem.role || "Verified Customer"}</p>
                      </div>
                    </div>

                    <div className="bg-[#EDEDED] rounded-xl p-4 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={`text-2xl sm:text-3xl ${i <= stars ? "text-yellow-400" : "text-transparent [-webkit-text-stroke:1.5px_#facc15]"}`}
                            >
                              &#9733;
                            </span>
                          ))}
                        </div>
                        <p className="text-[#3C3C3C] text-sm font-medium mb-1">
                          On {feedback?.productName || product?.name || "Product"}
                        </p>
                        <p
                          className={`text-[#555] text-sm leading-relaxed overflow-hidden transition-[max-height] duration-500 ease-in-out ${!isExpanded ? "line-clamp-3" : ""}`}
                          style={{ maxHeight: isExpanded ? "500px" : "4.5em" }}
                        >
                          {text}
                        </p>
                        {text.length > 80 && (
                          <button
                            type="button"
                            onClick={() => setExpandedFeedbackId(isExpanded ? null : feedbackKey)}
                            className="flex items-center gap-1 text-xs font-semibold text-[#eb61a2] mt-1 hover:underline"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                            <FaChevronDown
                              className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </div>
                      <div className="flex justify-end pt-3">
                        <p className="text-xs text-[#999]">{timeAgo(feedback?.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4 text-center">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl py-4 sm:py-6 px-2 sm:px-4 border border-[#ffd6ec] shadow-sm"
              >
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-1">{stat.number}</p>
                <p className="text-xs sm:text-sm text-[#888] font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        ref={aboutRef}
        id="aboutus"
        className={`pt-8 pb-16 md:pb-20 px-4 sm:px-8 ${sectionClass(aboutVisible)}`}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6 text-center">ABOUT US</h2>
          <div className="text-black text-base sm:text-lg md:text-xl text-left leading-relaxed max-w-4xl mx-auto">
            <p className="mb-3">
              <span className="font-bold">SKIN.ME</span> is more than skincare — it&apos;s a daily ritual of
              self-respect and renewal.
            </p>
            <p className="mb-3">
              We create minimalist, effective formulas designed for real skin and real lives. Inspired by
              nature and backed by science, our products are gentle yet powerful.
            </p>
            <p className="mb-2 font-bold">Our Promise:</p>
            <ul className="list-disc list-inside mb-3 space-y-1">
              <li>Clean and safe ingredients</li>
              <li>Honest and transparent beauty</li>
              <li>Simple, effective skincare</li>
            </ul>
            <p>
              Every product reflects our commitment to quality and care. Join us in redefining skincare with
              confidence and simplicity.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-10 max-w-5xl mx-auto">
            {aboutProducts.map((product) => (
              <Image
                key={product.id}
                src={getProductImageUrl(product)}
                alt={product?.name || "Product"}
                width={280}
                height={280}
                className="w-full aspect-square rounded-xl object-cover"
                loading="lazy"
                unoptimized
              />
            ))}
          </div>
        </div>
      </section>

      {/* PROMOTION MODAL */}
      {promoModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPromoModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#eb61a2] text-white px-6 py-4 flex items-center justify-between">
              <div className="font-bold text-lg">Special Promotion</div>
              <button
                type="button"
                onClick={() => setPromoModal(null)}
                className="text-white/90 hover:text-white text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {promoLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-[#eb61a2] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : promoModal.promotion ? (
                <>
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100">
                      <Image
                        src={getProductImageUrl(promoModal.product)}
                        alt={promoModal.product?.name || "Product"}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xl text-gray-900 leading-tight">
                        {promoModal.product?.name}
                      </div>
                      <div className="text-[#eb61a2] font-extrabold text-4xl mt-1">
                        {extractPromoPercent(promoModal.promotion) ?? "?"}% OFF
                      </div>
                    </div>
                  </div>

                  {promoModal.promotion.description && (
                    <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                      {promoModal.promotion.description}
                    </p>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    {(promoModal.promotion.startDate || promoModal.promotion.start_date) && (
                      <>
                        Valid from{" "}
                        <span className="font-medium text-gray-700">
                          {new Date(
                            promoModal.promotion.startDate || promoModal.promotion.start_date,
                          ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    {(promoModal.promotion.endDate || promoModal.promotion.end_date) && (
                      <>
                        {" "}
                        until{" "}
                        <span className="font-medium text-gray-700">
                          {new Date(
                            promoModal.promotion.endDate || promoModal.promotion.end_date,
                          ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-lg font-semibold text-[#eb61a2]">Limited-time offer</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Special discount is currently active on this product.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                type="button"
                onClick={() => setPromoModal(null)}
                className="flex-1 py-3 rounded-2xl border text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const pid = promoModal.product?.id;
                  setPromoModal(null);
                  router.push(`/product_details?productId=${pid}`);
                }}
                className="flex-1 py-3 rounded-2xl bg-[#eb61a2] text-white font-semibold hover:bg-[#c8538a] active:scale-[0.985] transition"
              >
                View Product
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <HomePage />
    </Suspense>
  );
}
