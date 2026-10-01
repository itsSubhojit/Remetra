import dotenv from "dotenv";
dotenv.config();
import { Cashfree } from "cashfree-pg";


const cashfree = new Cashfree(
    Cashfree.SANDBOX, 
    process.env.CASHFREE_APP_ID, 
    process.env.CASHFREE_SECRET_KEY);

export const createCashfreeOrder = async (orderId, orderAmount, orderCurrency, customerDetails) => {
    const request = {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: orderCurrency,
        customer_details: customerDetails,
        order_meta: {
            return_url: "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}"
        }
    };

    try {
        const response = await cashfree.PGCreateOrder(request);
        return response.data;
    } catch (error) {
        console.log("Cashfree order creation failed:", error);
        throw error;
    }
};