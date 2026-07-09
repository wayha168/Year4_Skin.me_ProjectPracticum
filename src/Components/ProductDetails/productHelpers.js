/** Shared helpers for product details UI */

export function getBrandName(product) {
  if (!product?.brand) return "";
  if (typeof product.brand === "string") return product.brand;
  return product.brand?.name ?? "";
}

export function getInitials(name) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function formatFieldValue(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object") return value?.name ?? "";
  return String(value).trim();
}

export function getSkinTypeLabel(product) {
  return formatFieldValue(product?.skinType ?? product?.skin_type);
}

export function getHowToUse(product) {
  const value = product?.howToUse ?? product?.how_to_use;
  return value == null ? "" : String(value).trim();
}

export function getProductTypeLabel(product) {
  const pt =
    product?.productType ??
    product?.product_type ??
    product?.category?.name ??
    (product?.category && typeof product.category === "object" ? product.category.name : null);
  return formatFieldValue(pt);
}

export function getMaxStock(product) {
  if (!product) return 999;
  return Math.max(
    1,
    Number(product.inventory ?? product.stock ?? product.quantity ?? product.available ?? 999)
  );
}

export function getTeaser(description) {
  if (!description) return "Skincare product.";
  return description.split(".")[0]?.trim() || description;
}

export function normalizeFeedbackList(payload) {
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload)) return payload;
  return [];
}

export function normalizeListPayload(payload) {
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload)) return payload;
  return [];
}

/** Collect line items from common backend order shapes. */
export function getOrderLineItems(order) {
  if (!order || typeof order !== "object") return [];
  const candidates = [
    order.orderItems,
    order.order_items,
    order.items,
    order.products,
    order.orderProductList,
    order.orderProducts,
    order.cartItems,
    order.lineItems,
  ];
  for (const list of candidates) {
    if (Array.isArray(list) && list.length) return list;
  }

  // Some payloads nest items under data / order
  if (order.data && typeof order.data === "object") {
    return getOrderLineItems(order.data);
  }
  if (order.order && typeof order.order === "object") {
    return getOrderLineItems(order.order);
  }
  return [];
}

export function getLineItemProductId(item) {
  if (item == null) return null;
  if (typeof item === "number" || typeof item === "string") {
    const n = Number(item);
    return Number.isFinite(n) ? n : null;
  }
  const raw =
    item.productId ??
    item.product_id ??
    item.product?.id ??
    item.product?.productId ??
    item.id;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function getOrderId(order) {
  const raw = order?.orderId ?? order?.order_id ?? order?.id;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function orderContainsProduct(order, productId) {
  const pid = Number(productId);
  if (!Number.isFinite(pid) || !order) return false;

  const direct =
    order.productId ??
    order.product_id ??
    order.product?.id ??
    null;
  if (Number(direct) === pid) return true;

  return getOrderLineItems(order).some((item) => getLineItemProductId(item) === pid);
}

/**
 * Find the newest order that contains productId.
 * Returns { canReview, orderId } for feedback submission.
 */
export function findPurchaseForProduct(orders, productId) {
  const pid = Number(productId);
  if (!Number.isFinite(pid) || !Array.isArray(orders)) {
    return { canReview: false, orderId: null };
  }

  const matches = [];
  for (const order of orders) {
    if (!orderContainsProduct(order, pid)) continue;
    const orderId = getOrderId(order);
    const created = Date.parse(order.createdAt ?? order.created_at ?? order.orderDate ?? "") || 0;
    matches.push({ orderId, created });
  }

  if (!matches.length) return { canReview: false, orderId: null };
  matches.sort((a, b) => b.created - a.created);
  return { canReview: true, orderId: matches[0].orderId };
}

export function parseDiscountedPrice(data) {
  if (typeof data === "number") return data;
  if (data && typeof data === "object") {
    const value = data.discountedPrice ?? data.price ?? data.finalPrice ?? data.discounted_price ?? null;
    return value != null ? Number(value) : null;
  }
  return null;
}

export function parseDiscountPercentage(promo) {
  if (!promo || typeof promo !== "object") return null;
  const raw =
    promo.discountPercentage ??
    promo.discount_percentage ??
    promo.discountPercent ??
    promo.discount_percent ??
    null;
  return typeof raw === "number" && raw > 0 ? Math.round(raw) : null;
}
