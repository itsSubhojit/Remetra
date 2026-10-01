import dotenv from "dotenv";
dotenv.config();
import { Cashfree } from "cashfree-pg";


const cashfree = new Cashfree(
    Cashfree.SANDBOX, 
    process.env.CASHFREE_APP_ID, 
    process.env.CASHFREE_SECRET_KEY);

export const createCashfreeOrder = async (orderId, orderAmount, orderCurrency, customerDetails) => {
    const returnUrl = process.env.CLIENT_URL
        ? `${process.env.CLIENT_URL}/payments?order_id={order_id}`
        : "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}";

    const orderMeta = {
        return_url: returnUrl
    };

    if (process.env.CASHFREE_WEBHOOK_URL) {
        orderMeta.notify_url = process.env.CASHFREE_WEBHOOK_URL;
    }

    const request = {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: orderCurrency,
        customer_details: customerDetails,
        order_meta: orderMeta
    };

    try {
        const response = await cashfree.PGCreateOrder(request);
        return response.data;
    } catch (error) {
        console.error("Cashfree order creation failed:", error.response?.data || error.message || error);
        throw error;
    }
};

/**
 * Fetches order details directly from Cashfree Payment Gateway
 * @param {string} orderId - Cashfree order ID
 * @returns {Promise<any>} Order entity data
 */
export const fetchCashfreeOrder = async (orderId) => {
    try {
        const response = await cashfree.PGFetchOrder(orderId);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch Cashfree order ${orderId}:`, error.response?.data || error.message || error);
        throw error;
    }
};

/**
 * Fetches list of payment attempts for an order from Cashfree
 * @param {string} orderId - Cashfree order ID
 * @returns {Promise<Array>} Array of payment attempt entities
 */
export const fetchCashfreeOrderPayments = async (orderId) => {
    try {
        const response = await cashfree.PGOrderFetchPayments(orderId);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch Cashfree payments for order ${orderId}:`, error.response?.data || error.message || error);
        throw error;
    }
};

/**
 * Verifies webhook signature using Cashfree SDK and returns parsed event
 * @param {string} signature - Value from x-webhook-signature header
 * @param {string} rawBody - Untransformed string of the raw HTTP request body
 * @param {string} timestamp - Value from x-webhook-timestamp header
 * @returns {any} Verified webhook event
 */
export const verifyCashfreeWebhookSignature = (signature, rawBody, timestamp) => {
    return cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
};