import { load } from "@cashfreepayments/cashfree-js";

/**
 * Singleton Cashfree Web SDK loader for Remetra Sandbox Checkout
 *
 * SECURITY NOTICE:
 * - Cashfree Secret Key is NEVER exposed or referenced here.
 * - This SDK operates solely with a temporary, server-generated payment_session_id.
 * - Sandbox environment is explicitly targeted for testing.
 */
let cashfreePromise = null;

export const getCashfreeInstance = async () => {
  if (!cashfreePromise) {
    cashfreePromise = load({
      mode: "sandbox", // Remetra Cashfree Sandbox checkout mode
    });
  }
  return await cashfreePromise;
};

/**
 * Triggers Cashfree Checkout using payment_session_id obtained from Remetra backend
 * @param {string} paymentSessionId - Session ID returned by POST /api/payments/:id/pay
 * @param {string} redirectTarget - "_modal" for in-page popup modal or "_self" for redirect
 * @returns {Promise<any>} Result returned by Cashfree checkout
 */
export const openCashfreeCheckout = async (paymentSessionId, redirectTarget = "_modal") => {
  if (!paymentSessionId) {
    throw new Error("Cannot open checkout: payment_session_id is missing.");
  }

  const cashfree = await getCashfreeInstance();
  if (!cashfree) {
    throw new Error("Failed to initialize Cashfree Checkout SDK. Please refresh the page.");
  }

  const checkoutOptions = {
    paymentSessionId,
    redirectTarget,
  };

  return await cashfree.checkout(checkoutOptions);
};
