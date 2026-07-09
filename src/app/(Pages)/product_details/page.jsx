"use client";

import React, { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

import axiosAuth from "../../lib/api/axiosConfig";
import useAuthContext from "../../lib/Authentication/AuthContext";
import LoginFirst from "../../../Components/LoginFirst/LoginFirst";
import Navbar from "../../../Components/Navbar/Navbar";
import Footer from "../../../Components/Footer/Footer";
import Loading from "../../../Components/Loading/Loading";
import useUserActions from "../../../Components/Hooks/useUserActions";
import {
  ProductImageGallery,
  ProductPurchasePanel,
  ProductInfoSections,
  ProductFeedbackSection,
  RelatedProductsSection,
  getBrandName,
  normalizeFeedbackList,
  normalizeListPayload,
  findPurchaseForProduct,
  getOrderId,
  getOrderLineItems,
  parseDiscountedPrice,
  parseDiscountPercentage,
} from "../../../Components/ProductDetails";

const ProductDetailsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");
  const orderIdParam = searchParams.get("orderId") || undefined;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [productFeedbacks, setProductFeedbacks] = useState([]);
  const [mainDiscountedPrice, setMainDiscountedPrice] = useState(null);
  const [relatedDiscountedPrices, setRelatedDiscountedPrices] = useState({});
  const [mainDiscountPercentage, setMainDiscountPercentage] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState(null);

  const { user } = useAuthContext();
  const { addToCart, addToFavorite, removeFavorite } = useUserActions();
  const loginFirst = useMemo(() => new LoginFirst(user, router.push), [user, router.push]);

  const fetchProductFeedbacks = useCallback(async (prodId) => {
    try {
      const res = await axiosAuth.get(`/feedback/product/${prodId}`, {
        params: { page: 0, size: 50 },
      });
      setProductFeedbacks(normalizeFeedbackList(res?.data?.data));
    } catch {
      try {
        const res = await axiosAuth.get("/feedback/product/all-feedback");
        const allFeedbacks = normalizeFeedbackList(res?.data?.data);
        setProductFeedbacks(
          allFeedbacks.filter((f) => f?.productId === Number(prodId) || f?.productId === prodId)
        );
      } catch {
        setProductFeedbacks([]);
      }
    }
  }, []);

  /** Load user orders and resolve whether this productId was purchased. */
  const resolvePurchaseEligibility = useCallback(async (prodId, preferredOrderId) => {
    if (!user?.id || !prodId) {
      setCanReview(false);
      setReviewOrderId(null);
      setCheckingPurchase(false);
      return;
    }

    setCheckingPurchase(true);
    try {
      let orders = [];
      try {
        const res = await axiosAuth.get("/orders/my-orders");
        orders = normalizeListPayload(res?.data?.data ?? res?.data);
      } catch {
        const res = await axiosAuth.get(`/orders/user/${user.id}`);
        orders = normalizeListPayload(res?.data?.data ?? res?.data);
      }

      // If list payload has no line items, hydrate a few recent orders
      const needsHydration = orders.some((o) => getOrderLineItems(o).length === 0);
      if (needsHydration) {
        const hydrated = await Promise.all(
          orders.slice(0, 15).map(async (order) => {
            if (getOrderLineItems(order).length > 0) return order;
            const oid = getOrderId(order);
            if (oid == null) return order;
            try {
              const detail = await axiosAuth.get(`/orders/${oid}`);
              return detail?.data?.data ?? detail?.data ?? order;
            } catch {
              return order;
            }
          })
        );
        orders = hydrated;
      }

      let purchase = findPurchaseForProduct(orders, prodId);

      // URL orderId wins if it belongs to the user and contains this product
      if (preferredOrderId) {
        const preferred = findPurchaseForProduct(
          orders.filter((o) => String(getOrderId(o)) === String(preferredOrderId)),
          prodId
        );
        if (preferred.canReview) purchase = preferred;
      }

      setCanReview(purchase.canReview);
      setReviewOrderId(purchase.orderId);
    } catch {
      setCanReview(false);
      setReviewOrderId(null);
    } finally {
      setCheckingPurchase(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setProductFeedbacks([]);
    setRelatedProducts([]);
    setMainDiscountedPrice(null);
    setRelatedDiscountedPrices({});
    setMainDiscountPercentage(null);
    setCanReview(false);
    setReviewOrderId(null);
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      setError("No product ID provided.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProductDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axiosAuth.get("/products/all");
        if (cancelled) return;

        const allProducts = response.data?.data || response.data || [];
        const productData = allProducts.find((p) => p.id === Number(productId));

        if (!productData) {
          setError("Product not found. Please check the product ID.");
          setProduct(null);
          return;
        }

        setProduct(productData);

        const brandId = productData?.brand?.id ?? null;
        const brandName = getBrandName(productData);
        const related = allProducts
          .filter((p) => {
            if (p.id === Number(productData.id)) return false;
            if (brandId != null && p?.brand?.id != null) return p.brand.id === brandId;
            const pName = getBrandName(p);
            return brandName && pName && String(pName).toLowerCase() === String(brandName).toLowerCase();
          })
          .slice(0, 5);

        setRelatedProducts(related);
        fetchProductFeedbacks(productData.id);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || "Could not load product details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProductDetails();
    return () => {
      cancelled = true;
    };
  }, [productId, fetchProductFeedbacks]);

  useEffect(() => {
    if (!product?.id) return;
    resolvePurchaseEligibility(product.id, orderIdParam);
  }, [product?.id, user?.id, orderIdParam, resolvePurchaseEligibility]);

  useEffect(() => {
    let cancelled = false;

    const fetchDiscounts = async () => {
      const ids = [];
      if (product?.id) ids.push(product.id);
      relatedProducts.forEach((p) => p?.id && ids.push(p.id));
      if (ids.length === 0) return;

      const results = await Promise.all(
        ids.map(async (pid) => {
          try {
            const res = await axiosAuth.get(`/promotions/product/${pid}/discounted-price`);
            return [pid, parseDiscountedPrice(res.data?.data)];
          } catch {
            return [pid, null];
          }
        })
      );

      if (cancelled) return;

      const relatedMap = {};
      results.forEach(([pid, val]) => {
        if (pid === product?.id) setMainDiscountedPrice(val);
        else relatedMap[pid] = val;
      });
      setRelatedDiscountedPrices(relatedMap);
    };

    const fetchMainDiscountPercentage = async () => {
      if (!product?.id) {
        setMainDiscountPercentage(null);
        return;
      }
      try {
        const res = await axiosAuth.get(`/promotions/product/${product.id}`);
        if (!cancelled) setMainDiscountPercentage(parseDiscountPercentage(res.data?.data));
      } catch {
        if (!cancelled) setMainDiscountPercentage(null);
      }
    };

    fetchDiscounts();
    fetchMainDiscountPercentage();

    return () => {
      cancelled = true;
    };
  }, [product, relatedProducts]);

  useEffect(() => {
    const fetchFavoritesForColor = async () => {
      if (!user?.id) {
        setFavoriteIds(new Set());
        return;
      }
      try {
        const res = await axiosAuth.get(`/favorites/user/${user.id}`);
        const favs = res.data?.data || [];
        setFavoriteIds(
          new Set(favs.map((f) => f.product?.id ?? f.productId).filter(Boolean).map(Number))
        );
      } catch {
        setFavoriteIds(new Set());
      }
    };
    fetchFavoritesForColor();
  }, [user]);

  const handleToggleFavorite = useCallback(
    async (id) => {
      if (!user) {
        const message = loginFirst.messages.loginRequiredFavorite;
        router.push(
          `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}&message=${encodeURIComponent(message)}`
        );
        return;
      }

      const pid = Number(id);
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
        // toast handled in hook
      }
    },
    [user, loginFirst, router, addToFavorite, removeFavorite, favoriteIds]
  );

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <p className="text-gray-600">Product ID: {productId}</p>
      </div>
    );
  }

  if (!product) {
    return <p className="text-center text-gray-500 text-lg mt-20">Product not found.</p>;
  }

  const brandName = getBrandName(product);

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/products" className="group inline-flex">
            <FaArrowLeft className="text-2xl text-gray-700 transition-transform duration-200 group-hover:text-[#eb61a2] group-hover:-translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <ProductImageGallery
            product={product}
            selectedImageIndex={selectedImageIndex}
            onSelectImage={setSelectedImageIndex}
          />
          <ProductPurchasePanel
            product={product}
            quantity={quantity}
            onQuantityChange={setQuantity}
            discountedPrice={mainDiscountedPrice}
            discountPercentage={mainDiscountPercentage}
            isFavorited={favoriteIds.has(Number(product.id))}
            onAddToCart={addToCart}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        <div className="mt-14 pt-10 border-t border-gray-100 space-y-10">
          <ProductInfoSections product={product} />
          <ProductFeedbackSection
            productId={product.id}
            orderId={reviewOrderId || orderIdParam}
            feedbacks={productFeedbacks}
            onSubmitted={() => fetchProductFeedbacks(product.id)}
            canReview={canReview}
            checkingPurchase={checkingPurchase}
            isLoggedIn={Boolean(user)}
          />
        </div>
      </div>

      <RelatedProductsSection
        brandName={brandName}
        products={relatedProducts}
        discountedPrices={relatedDiscountedPrices}
        favoriteIds={favoriteIds}
        onAddToCart={addToCart}
        onToggleFavorite={handleToggleFavorite}
      />
    </>
  );
};

const ProductDetailsPage = () => {
  return (
    <>
      <Navbar alwaysVisible />
      <main className="pt-[5rem] px-0 pb-16 bg-[#F7F7F7] font-[Poppins,sans-serif]">
        <div className="w-full mb-[1rem] -mt-[4.5rem]">
          <h1 className="mt-[12px] w-full h-[9rem] flex items-end justify-center text-4xl font-bold bg-[#F7F7F7] text-[#EB61A2] pb-[13px] max-[750px]:pr-4 max-[750px]:text-[1.8rem]">
            Product Detail
          </h1>
        </div>
        <div className="px-4 sm:px-6">
          <Suspense fallback={<Loading />}>
            <ProductDetailsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetailsPage;
