export const OPEN_DISCOUNT_MODAL_EVENT = "discount-modal:open";

/** Open the global promotion popup from anywhere (e.g. footer "Up to 25% off"). */
export function openDiscountModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_DISCOUNT_MODAL_EVENT));
}
