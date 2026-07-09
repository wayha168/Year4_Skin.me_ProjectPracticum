"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import axiosAuth from "../../../app/lib/api/axiosConfig";
import Navbar from "../../../Components/Navbar/Navbar";
import Footer from "../../../Components/Footer/Footer";

import { FaCartPlus, FaHeart } from "react-icons/fa";
import Loading from "../../../Components/Loading/Loading";
import useUserActions from "../../../Components/Hooks/userUserActions";
import useAuthContext from "../../../app/lib/Authentication/AuthContext";
import { getProductImageUrl } from "../../../app/lib/productImage";
import ProductPrice from "../../../Components/ProductPrice/ProductPrice";

const PRODUCTS_PER_PAGE = 12;

const getBrand = (product) => {
  if (typeof product?.brand === "string") return product.brand;
  return (
    product?.brand?.name ??
    product?.brandName ??
    product?.brand_name ??
    product?.brand?.brandName ??
    product?.brand?.brand_name ??
    ""
  );
};

const getCategoryName = (product) => {
  if (typeof product?.category === "string") return product.category;
  return (
    product?.category?.name ??
    product?.categoryName ??
    product?.category_name ??
    ""
  );
};

const getCategoryId = (product) =>
  product?.category?.id ?? product?.categoryId ?? product?.category_id ?? null;

const getResponseItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/** Normalize popular/recommendation payloads into product objects + rank map. */
const normalizeRecommendedProducts = (payload) => {
  const items = getResponseItems(payload);
  const products = [];
  const rankById = new Map();

  items.forEach((item, index) => {
    const product =
      item?.product && typeof item.product === "object"
        ? item.product
        : item?.productId || item?.id
          ? item
          : null;
    if (!product) return;

    const id = Number(product.id ?? item.productId ?? item.product_id);
    if (!Number.isFinite(id)) return;

    const normalized = { ...product, id };
    if (!rankById.has(id)) {
      rankById.set(id, index);
      products.push(normalized);
    }
  });

  return { products, rankById };
};

const Products = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [discountedPrices, setDiscountedPrices] = useState({});
  const [discountPercentages, setDiscountPercentages] = useState({});
  const [promoModal, setPromoModal] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [popularProducts, setPopularProducts] = useState([]);
  const [recommendedRankById, setRecommendedRankById] = useState(() => new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);

  const urlFilters = useMemo(() => {
    const readList = (key) =>
      searchParams
        .get(key)
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) || [];

    const brands = readList("brand");
    const rating = readList("rating");
    const ageRange = readList("ageRange");
    const skinType = readList("skinType");
    const popular = readList("popular");
    const category = searchParams.get("category")?.trim() || "";
    const categoryId = searchParams.get("categoryId")?.trim() || "";
    return { brands, rating, ageRange, skinType, popular, category, categoryId };
  }, [searchParams]);

  useEffect(() => {
    setSearchTerm(searchFromUrl);
  }, [searchFromUrl]);

  // Reset pagination when filters / sort / search change
  useEffect(() => {
    setCurrentPage(1);
    setPageLoading(false);
  }, [sortBy, searchTerm, searchParams]);

  useEffect(() => {
    const updateSidebarPosition = () => {
      setSidebarCompact(window.scrollY > 72);
    };

    updateSidebarPosition();
    window.addEventListener("scroll", updateSidebarPosition, { passive: true });
    return () => window.removeEventListener("scroll", updateSidebarPosition);
  }, []);

  const { user } = useAuthContext();
  const { addToCart, addToFavorite, removeFavorite } = useUserActions();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axiosAuth.get("/products/all");
        setProducts(getResponseItems(res?.data?.data));
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        // Prefer dedicated popular products list; fall back to sales ranking.
        let payload = null;
        try {
          const res = await axiosAuth.get("/products/popular");
          payload = res?.data?.data ?? res?.data;
        } catch {
          const res = await axiosAuth.get("/popular/all");
          payload = res?.data?.data ?? res?.data;
        }

        const { products: recommended, rankById } = normalizeRecommendedProducts(payload);
        setPopularProducts(recommended);
        setRecommendedRankById(rankById);
      } catch (err) {
        console.error("Error fetching recommended products:", err);
        setPopularProducts([]);
        setRecommendedRankById(new Map());
      }
    };
    fetchRecommendedProducts();
  }, []);

  // Fetch discounted prices + discount percentages for badges
  useEffect(() => {
    const fetchDiscounts = async () => {
      if (!products.length) {
        setDiscountedPrices({});
        setDiscountPercentages({});
        return;
      }

      const productIds = [...new Set([
        ...products.map(p => p.id),
        ...popularProducts.map(p => p.id)
      ].filter(Boolean))];

      const promises = productIds.map(async (pid) => {
        let discounted = null;
        let pct = null;
        try {
          const [priceRes, promoRes] = await Promise.all([
            axiosAuth.get(`/promotions/product/${pid}/discounted-price`).catch(() => ({ data: null })),
            axiosAuth.get(`/promotions/product/${pid}`).catch(() => ({ data: null }))
          ]);

          // discounted price
          const data = priceRes?.data?.data;
          if (typeof data === "number") discounted = data;
          else if (data && typeof data === "object") {
            discounted = data.discountedPrice ?? data.price ?? data.finalPrice ?? data.discounted_price ?? null;
          }

          // promotion percentage for badge
          const promo = promoRes?.data?.data;
          if (promo && typeof promo === "object") {
            const raw = promo.discountPercentage ?? promo.discount_percentage ?? promo.discountPercent ?? promo.discount_percent ?? null;
            if (typeof raw === "number" && raw > 0) pct = Math.round(raw);
          }
        } catch {
          // ignore individual product errors
        }
        return [pid, { discountedPrice: discounted != null ? Number(discounted) : null, discountPercentage: pct }];
      });

      const results = await Promise.all(promises);
      const priceMap = {};
      const pctMap = {};
      results.forEach(([id, info]) => {
        if (info.discountedPrice != null) priceMap[id] = info.discountedPrice;
        if (info.discountPercentage != null) pctMap[id] = info.discountPercentage;
      });
      setDiscountedPrices(priceMap);
      setDiscountPercentages(pctMap);
    };

    fetchDiscounts();
  }, [products, popularProducts]);

  // Fetch user's favorites for dynamic heart color (exact same as homepage)
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (!user?.id) {
        setFavoriteIds(new Set());
        return;
      }
      try {
        const res = await axiosAuth.get(`/favorites/user/${user.id}`, { withCredentials: true });
        const favs = res.data?.data || [];
        const ids = new Set(
          favs
            .map((f) => f.product?.id ?? f.productId ?? f.id)
            .filter(Boolean)
            .map(Number)
        );
        setFavoriteIds(ids);
      } catch {
        setFavoriteIds(new Set());
      }
    };
    fetchUserFavorites();
  }, [user]);

  const handleAddToCart = async (productId) => {
    await addToCart(productId, 1);
  };

  const handleFavorite = useCallback(async (productId) => {
    if (!user) {
      // You can add login redirect here if needed, but keeping minimal for now
      await addToFavorite(productId);
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
      // errors handled inside the hook
    }
  }, [user, addToFavorite, removeFavorite, favoriteIds]);

  // Open promotion modal (same as homepage)
  const openPromotionModal = useCallback(async (product) => {
    setPromoLoading(true);
    try {
      const res = await axiosAuth.get(`/promotions/product/${product.id}`);
      const promotion = res?.data?.data || null;
      setPromoModal({ product, promotion });
    } catch {
      setPromoModal({ product, promotion: null });
    } finally {
      setPromoLoading(false);
    }
  }, []);

  const getGroupedAndFilteredProducts = () => {
    const { popular: popularFilter = [] } = urlFilters;
    const isPopularFilterActive = popularFilter.length > 0;
    const isRecommendedView = sortBy === "recommended" || isPopularFilterActive;

    const { brands, rating, ageRange, skinType, category, categoryId } = urlFilters;
    const hasCategoryFilter = Boolean(category || categoryId);
    const hasOtherFilters =
      brands.length > 0 || rating.length > 0 || ageRange.length > 0 || skinType.length > 0 || hasCategoryFilter;

    const getPriceRating = (() => {
      const prices = products.map((p) => Number(p?.price) || 0).sort((a, b) => a - b);
      if (prices.length === 0) return () => 3;
      const p40 = prices[Math.floor(prices.length * 0.4)];
      const p80 = prices[Math.floor(prices.length * 0.8)];
      return (price) => {
        if (price >= p80) return 5;
        if (price >= p40) return 4;
        return 3;
      };
    })();

    const ageRangeCycle = [
      "10 - 20 years",
      "20 - 30 years",
      "20 - 30 years",
      "20 - 30 years",
      "20 - 30 years",
      "30 - 40 years",
      "30 - 40 years",
      "30 - 40 years",
      "40 - 50 years",
      "40 - 50 years",
    ];

    const skinTypeCycle = ["Oily", "Dry", "Combination", "Sensitive", "Acne-prone"];

    const matchesCategory = (p) => {
      if (!hasCategoryFilter) return true;
      if (categoryId) {
        return String(getCategoryId(p) ?? "") === String(categoryId);
      }
      const productCategory = (getCategoryName(p) || "").trim().toLowerCase();
      return productCategory === category.trim().toLowerCase();
    };

    const matchesUrlFilters = (p) => {
      if (!hasOtherFilters) return true;
      if (hasCategoryFilter && !matchesCategory(p)) return false;

      const hasNonCategoryFilters =
        brands.length > 0 || rating.length > 0 || ageRange.length > 0 || skinType.length > 0;
      if (!hasNonCategoryFilters) return true;

      const stableIdx = (p?.id || 0) % ageRangeCycle.length;
      const productAgeRange = ageRangeCycle[stableIdx];
      const productSkinType = skinTypeCycle[stableIdx];
      const productRating = getPriceRating(Number(p?.price) || 0);
      const brandName = (getBrand(p) || "").trim().toLowerCase();

      const matchesBrand = brands.some((b) => b.trim().toLowerCase() === brandName);
      const matchesRating = rating.includes(String(productRating));
      const matchesAge = ageRange.includes(productAgeRange);
      const matchesSkin = skinType.includes(productSkinType);

      const activeMatches = [];
      if (brands.length > 0) activeMatches.push(matchesBrand);
      if (rating.length > 0) activeMatches.push(matchesRating);
      if (ageRange.length > 0) activeMatches.push(matchesAge);
      if (skinType.length > 0) activeMatches.push(matchesSkin);

      return activeMatches.some((m) => m);
    };

    const matchesSearch = (p) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.trim().toLowerCase();
      return p?.name?.toLowerCase().includes(term) || getBrand(p)?.toLowerCase().includes(term);
    };

    const sortByRecommendation = (list) =>
      [...list].sort((a, b) => {
        const aRank = recommendedRankById.has(Number(a?.id))
          ? recommendedRankById.get(Number(a.id))
          : Number.MAX_SAFE_INTEGER;
        const bRank = recommendedRankById.has(Number(b?.id))
          ? recommendedRankById.get(Number(b.id))
          : Number.MAX_SAFE_INTEGER;
        if (aRank !== bRank) return aRank - bRank;
        return (Number(b?.id) || 0) - (Number(a?.id) || 0);
      });

    let filtered;

    if (isRecommendedView) {
      // Show the full recommendation/popular list (no artificial cap).
      // Prefer API recommended products; enrich from catalog when needed.
      const recommendedById = new Map();
      popularProducts.forEach((p) => {
        if (p?.id != null) recommendedById.set(Number(p.id), p);
      });

      // If popular payload is sparse, fill from catalog using recommendation ranks.
      if (recommendedById.size === 0 && recommendedRankById.size > 0) {
        products.forEach((p) => {
          const id = Number(p?.id);
          if (recommendedRankById.has(id)) recommendedById.set(id, p);
        });
      }

      filtered = Array.from(recommendedById.values()).filter(matchesSearch);

      // If recommendation API is empty, fall back to full catalog (still labeled Recommended).
      if (filtered.length === 0) {
        filtered = products.filter((p) => matchesSearch(p));
      }

      // Keep recommendation order, then optionally union matching catalog filters.
      filtered = sortByRecommendation(filtered);

      if (hasOtherFilters) {
        const seen = new Set(filtered.map((p) => Number(p?.id)).filter(Boolean));
        const extras = sortByRecommendation(
          products.filter((p) => matchesUrlFilters(p) && matchesSearch(p) && !seen.has(Number(p?.id)))
        );
        filtered = [...filtered, ...extras];
      }
    } else {
      // Full catalog for All Products / other sorts
      filtered = products.filter((p) => matchesSearch(p) && matchesUrlFilters(p));
    }

    if (sortBy === "price-high") {
      filtered.sort((a, b) => (Number(b?.price) || 0) - (Number(a?.price) || 0));
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => (Number(a?.price) || 0) - (Number(b?.price) || 0));
    } else if (sortBy === "new") {
      filtered.sort((a, b) => (b?.id || 0) - (a?.id || 0));
    } else if (sortBy === "recommended" || isPopularFilterActive) {
      filtered = sortByRecommendation(filtered);
    }

    // Always return one combined list (single section + pagination)
    return filtered;
  };

  const filteredProducts = getGroupedAndFilteredProducts();
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = (safePage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = filteredProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);
  const showingFrom = totalItems === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + PRODUCTS_PER_PAGE, totalItems);
  const hasProducts = totalItems > 0;

  const sectionTitle = (() => {
    if (urlFilters.category) return String(urlFilters.category).toUpperCase();
    if (urlFilters.categoryId) {
      const match = products.find((p) => String(getCategoryId(p) ?? "") === String(urlFilters.categoryId));
      const name = getCategoryName(match);
      if (name) return name.toUpperCase();
      return "CATEGORY";
    }
    if (sortBy === "recommended") return "Recommended";
    if (sortBy === "new") return "What's New";
    if (sortBy === "price-high") return "Price High to Low";
    if (sortBy === "price-low") return "Price Low to High";
    if (urlFilters.popular?.length) return "Most Popular";
    return "All Products";
  })();

  const getPageNumbers = (current, pages) => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, "...", pages];
    if (current >= pages - 2) return [1, "...", pages - 3, pages - 2, pages - 1, pages];
    return [1, "...", current - 1, current, current + 1, "...", pages];
  };

  const goToPage = (page) => {
    const next = Math.min(Math.max(1, page), totalPages);
    if (next === safePage || pageLoading) return;

    setPageLoading(true);

    // Scroll up to products first so the new page is visible after loading
    const section = document.getElementById("products-grid-section");
    if (section) {
      const navbarOffset = 100;
      const top = section.getBoundingClientRect().top + window.scrollY - navbarOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Brief loading, then swap page content
    window.setTimeout(() => {
      setCurrentPage(next);
      setPageLoading(false);
    }, 350);
  };

  return (
    <>
      <Navbar alwaysVisible={true} />
      <main className="min-h-screen pt-[8rem] px-0 pb-16 bg-[#F7F7F7] font-[Poppins,sans-serif] overflow-x-hidden">
        {/* ===== Hero Section ===== */}
        <div className="w-full -mt-[4rem]">
          <h1 className="w-full h-[9rem] flex items-end justify-center max-[750px]:justify-end text-4xl font-bold  bg-[#F7F7F7] text-[#EB61A2] pb-[19px] max-[750px]:pr-4 max-[750px]:text-[1.8rem] border-b border-[#f0f0f0]">
            Our Products
          </h1>
        </div>

        {/* ===== Main Content with Fixed Left Sidebar ===== */}
        <div className="flex">
          {/* Fixed Left Sidebar */}
           <aside
             className={`fixed left-0 w-[220px] lg:w-[260px] bg-white/95 backdrop-blur border-r border-gray-200 transition-[top,height] duration-200 ease-out ${
               sidebarCompact ? "top-12 h-[calc(100vh-3rem)]" : "top-[8rem] h-[calc(100vh-8rem)]"
             }`}
           >
            <div className="flex h-full flex-col px-7">
              <div className="flex items-center justify-between py-6 border-b border-gray-200">
                <h3 className="text-[1.15rem] font-bold text-gray-900">Refine</h3>
                <button
                  type="button"
                  onClick={() => setSortBy("all")}
                  className="text-xs text-gray-500 underline underline-offset-2 hover:text-[#d13e82]"
                >
                  Clear all
                </button>
              </div>
              <div className="flex items-center justify-between py-5">
                <p className="text-sm font-bold text-gray-900">Sort By</p>
                <span className="text-lg leading-none text-gray-900">-</span>
              </div>
              <div className="flex-1 overflow-y-auto pb-4 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]">
                {[
                  { value: "all", label: "All Products" },
                  { value: "recommended", label: "Recommended" },
                  { value: "new", label: "What's New" },
                  { value: "price-high", label: "Price High to Low" },
                  { value: "price-low", label: "Price Low to High" },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`mb-3 flex cursor-pointer items-center gap-2.5 text-sm transition-colors ${
                      sortBy === option.value
                        ? "text-[#d13e82] font-semibold"
                        : "text-gray-700 hover:text-[#d13e82]"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 flex-shrink-0 border ${
                        sortBy === option.value ? "border-[#d13e82] bg-[#d13e82]" : "border-gray-300 bg-white"
                      }`}
                    />
                    <span className="leading-snug">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Area */}
           <div className="flex-1 ml-[220px] lg:ml-[260px] px-4 lg:px-8">
            {loading ? (
              <Loading />
            ) : !hasProducts ? (
              <p className="text-center text-gray-500 text-lg mt-20">No products found.</p>
            ) : (
              <div className="mx-auto max-w-[1120px] pt-10" id="products-grid-section">
                <section>
                  <div className="mb-9 flex flex-wrap items-center gap-4 text-gray-900">
                    <h2 className="text-lg font-bold">{sectionTitle}</h2>
                    <span className="text-sm text-gray-400">|</span>
                    <p className="text-sm">
                      <span className="font-bold">{totalItems}</span> items
                    </p>
                    <p className="text-xs text-gray-500 ml-auto">
                      Showing {showingFrom}–{showingTo} of {totalItems}
                    </p>
                  </div>

                  {pageLoading ? (
                    <div className="flex min-h-[28rem] items-center justify-center py-16">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-sky-200" />
                        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-pink-400 animate-spin" />
                      </div>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {pageProducts.map((p) => {
                      const brand = getBrand(p);
                      const desc = p?.description?.trim() || "No description";
                      return (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] z-[100]"
                        >
                          <div className="relative h-[200px] bg-gray-100">
                            <Image
                              src={getProductImageUrl(p)}
                              alt={p?.name || "Product"}
                              fill
                              className="object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                              sizes="(max-width: 600px) 50vw, 200px"
                              unoptimized
                              onClick={() => router.push(`/product_details?productId=${p.id}`)}
                            />

                            {discountPercentages[p?.id] != null && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPromotionModal(p);
                                }}
                                className="absolute top-2 left-2 bg-[#eb61a2] text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full shadow hover:bg-[#c8538a] active:scale-95 transition-all flex items-center gap-1 z-10"
                                title="View promotion details"
                              >
                                {discountPercentages[p.id]}%
                              </button>
                            )}

                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 hover:bg-red-50 transition-colors"
                              onClick={() => handleFavorite(p.id)}
                            >
                              <FaHeart
                                className={`text-sm ${favoriteIds.has(p.id) ? "text-[#F83E94]" : "text-[#2F2F2F]"}`}
                              />
                            </button>
                          </div>
                          <div className="flex flex-col flex-1 p-4 gap-1 min-w-0 text-center">
                            {brand && (
                              <span className="opacity-70 text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                                {brand}
                              </span>
                            )}
                            <h3 className="text-[1.15rem] font-bold text-gray-800 truncate" title={p?.name}>
                              {p?.name || "No Name"}
                            </h3>
                            <p className="text-xs text-gray-500 truncate opacity-80" title={desc}>
                              {desc}
                            </p>
                            <ProductPrice
                              price={p?.price}
                              discountedPrice={discountedPrices[p?.id]}
                              className="mt-1"
                              centered
                            />
                            <button
                              type="button"
                              className="mt-3 w-full bg-[#d13e82] text-white text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#c32c70] transition-colors"
                              onClick={() => handleAddToCart(p.id)}
                            >
                              <FaCartPlus className="text-base" /> Add to Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}

                  {totalPages > 1 && (
                    <nav
                      className="mt-10 flex flex-wrap items-center justify-center gap-2"
                      aria-label="Products pagination"
                    >
                      <button
                        type="button"
                        disabled={safePage <= 1 || pageLoading}
                        onClick={() => goToPage(safePage - 1)}
                        className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#eb61a2] hover:text-[#eb61a2] transition-colors"
                      >
                        Prev
                      </button>

                      <button
                        type="button"
                        disabled={safePage <= 1 || pageLoading}
                        onClick={() => goToPage(safePage - 1)}
                        className="min-w-[2.5rem] h-10 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#eb61a2] hover:text-[#eb61a2] transition-colors"
                        aria-label="Previous page"
                      >
                        &lt;
                      </button>

                      {getPageNumbers(safePage, totalPages).map((page, idx) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="min-w-[2rem] text-center text-sm text-gray-400 select-none"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={`page-${page}`}
                            type="button"
                            disabled={pageLoading}
                            aria-current={page === safePage ? "page" : undefined}
                            onClick={() => goToPage(page)}
                            className={`min-w-[2.5rem] h-10 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              page === safePage
                                ? "border-[#eb61a2] bg-[#eb61a2] text-white"
                                : "border-gray-200 bg-white text-gray-700 hover:border-[#eb61a2] hover:text-[#eb61a2]"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        disabled={safePage >= totalPages || pageLoading}
                        onClick={() => goToPage(safePage + 1)}
                        className="min-w-[2.5rem] h-10 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#eb61a2] hover:text-[#eb61a2] transition-colors"
                        aria-label="Next page"
                      >
                        &gt;
                      </button>

                      <button
                        type="button"
                        disabled={safePage >= totalPages || pageLoading}
                        onClick={() => goToPage(safePage + 1)}
                        className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#eb61a2] hover:text-[#eb61a2] transition-colors"
                      >
                        Next
                      </button>
                    </nav>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* PROMOTION MODAL - same as homepage */}
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
                onClick={() => setPromoModal(null)}
                className="text-white/90 hover:text-white text-2xl leading-none"
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
                        alt={promoModal.product?.name}
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
                        {typeof promoModal.promotion?.discountPercentage === 'number'
                          ? promoModal.promotion.discountPercentage
                          : '?'}% OFF
                      </div>
                    </div>
                  </div>

                  {promoModal.promotion.description && (
                    <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                      {promoModal.promotion.description}
                    </p>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    {promoModal.promotion.startDate || promoModal.promotion.start_date ? (
                      <>Valid from <span className="font-medium text-gray-700">{new Date(promoModal.promotion.startDate || promoModal.promotion.start_date).toLocaleDateString()}</span></>
                    ) : null}
                    {(promoModal.promotion.endDate || promoModal.promotion.end_date) && (
                      <> until <span className="font-medium text-gray-700">{new Date(promoModal.promotion.endDate || promoModal.promotion.end_date).toLocaleDateString()}</span></>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-lg font-semibold text-[#eb61a2]">Limited-time offer</p>
                  <p className="text-sm text-gray-500 mt-1">Special discount is currently active on this product.</p>
                </div>
              )}
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={() => setPromoModal(null)}
                className="flex-1 py-3 rounded-2xl border text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
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
    </>
  );
};

export default Products;
