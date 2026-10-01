import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Payment} from "../models/Payment.model.js"
import { createCashfreeOrder, fetchCashfreeOrder, fetchCashfreeOrderPayments, verifyCashfreeWebhookSignature } from "../services/cashfreeService.js"


export const paymentUser = asyncHandler(async (req, res, next) =>{
    const {personName, title, notes, category,  consumerId, provider,mobileNumber, rechargeType, amount, validityDays, dueDate, frequency, status, paidDate, reminderSent} = req.body

    if(!personName || !title || !category || !provider || !amount || !dueDate || !frequency){
        throw new ApiError(400, "Fields are required!")
    }

    const firebaseUid = req.user.uid

    const createdPayment = await Payment.create({
        firebaseUid,
        personName,
        title,
        notes,
        category,
        consumerId,
        provider,
        mobileNumber,
        rechargeType,
        amount,
        validityDays,
        dueDate,
        frequency,
        status,
        paidDate,
        reminderSent
    })

    return res.status(201)
    .json(
        new ApiResponse(201, "Payment Created Successfully", createdPayment)
    )
})


export const getAllPayments = asyncHandler(async (req, res, next) =>{
    const firebaseUid = req.user.uid
    if(!firebaseUid){
        throw new ApiError(401, "User id Not found!")
    }

    const userData = await Payment.find({firebaseUid: firebaseUid})

    return res.status(200)
    .json(
        new ApiResponse(200, "UserData Fetched Successfully!", userData)
    )
})


export const getPaymentId = asyncHandler(async (req, res, next) =>{
    const id = req.params.id
    const firebaseUid = req.user.uid

    const documentId = await Payment.findOne({_id: id, firebaseUid: firebaseUid})
    if(!documentId){
        throw new ApiError(404, "Payment Not Found!")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, "Payment Found...", documentId)
    )
})


export const updatePayment = asyncHandler(async (req, res, next) =>{
    const id = req.params.id
    const firebaseUid = req.user.uid

    const update = await Payment.findOneAndUpdate({_id: id, firebaseUid: firebaseUid}, req.body, {new: true})
    if(!update){
        throw new ApiError(404, "Can't Update... Please, try again later!")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, "Update Successful", update)
    )

})


export const deletePayment = asyncHandler(async (req, res, next) =>{
    const id = req.params.id
    const firebaseUid = req.user.uid

    const deleteDetails = await Payment.findOneAndDelete({_id: id, firebaseUid: firebaseUid})
    if(!deleteDetails){
        throw new ApiError(404, "Not Found!!!")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, "Deleted Successfully", deleteDetails)
    )

})

export const deleteUserAccount = asyncHandler(async (req, res, next) => {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
        throw new ApiError(401, "User ID not found in token!");
    }

    // Step 1: Delete all MongoDB payment records belonging to this Firebase UID
    const dbDeleteResult = await Payment.deleteMany({ firebaseUid: firebaseUid });

    // Step 2: Delete corresponding user from Firebase Authentication via Admin SDK
    let firebaseDeleted = false;
    let firebaseError = null;
    try {
        const { getAuth } = await import("firebase-admin/auth");
        await getAuth().deleteUser(firebaseUid);
        firebaseDeleted = true;
    } catch (err) {
        console.error(`Failed to delete Firebase Auth user ${firebaseUid}:`, err.message);
        firebaseError = err.message;
    }

    if (!firebaseDeleted) {
        return res.status(207).json(
            new ApiResponse(
                207,
                "All payment records deleted from vault database, but Firebase user identity requires administrative cleanup.",
                {
                    deletedPaymentsCount: dbDeleteResult.deletedCount,
                    firebaseDeleted: false,
                    error: firebaseError
                }
            )
        );
    }

    return res.status(200).json(
        new ApiResponse(200, "Account and all associated payment data deleted successfully!", {
            deletedPaymentsCount: dbDeleteResult.deletedCount,
            firebaseDeleted: true
        })
    );
})

export const initiatePayment = asyncHandler(async(req, res, next) =>{
        const id = req.params.id
        const firebaseUid = req.user.uid

        const payment = await Payment.findOne({_id: id, firebaseUid: firebaseUid})
        if(!payment){
            throw new ApiError(404, "Payment not found!")
        }

        if(payment.status === "Paid"){
            throw new ApiError(400, "Payment already completed for this bill.")
        }

        const { getAuth } = await import("firebase-admin/auth");
        const firebaseUser = await getAuth().getUser(payment.firebaseUid);

        // Cashfree requires a valid 10-digit customer phone number
        const rawPhone = payment.mobileNumber || firebaseUser.phoneNumber || "9999999999";
        const digits = String(rawPhone).replace(/\D/g, "");
        const customerPhone = digits.length >= 10 ? digits.slice(-10) : "9999999999";

        const customerDetails = {
            customer_id: firebaseUser.uid,
            customer_email: firebaseUser.email,
            customer_phone: customerPhone
        }

        // Cashfree requires order_id to be unique across all attempts (max 50 chars)
        const orderId = `order_${payment._id.toString()}_${Date.now()}`;
        const orderAmount = payment.amount
        const orderCurrency = "INR"

        const cashfreeOrder = await createCashfreeOrder(
           orderId,
           orderAmount,
           orderCurrency,
           customerDetails
        )

        // Persist Cashfree order ID mapping against Remetra Payment record
        payment.cashfreeOrderId = cashfreeOrder.order_id;
        if (!payment.cashfreeOrders) {
            payment.cashfreeOrders = [];
        }
        if (!payment.cashfreeOrders.includes(cashfreeOrder.order_id)) {
            payment.cashfreeOrders.push(cashfreeOrder.order_id);
        }
        await payment.save();

        return res.status(200)
        .json(
            new ApiResponse(200, "Order Created Successfully", cashfreeOrder)
        )
})

export const verifyPayment = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const firebaseUid = req.user.uid;

    const payment = await Payment.findOne({ _id: id, firebaseUid });
    if (!payment) {
        throw new ApiError(404, "Payment not found!");
    }

    // Idempotency: If already paid, safely return confirmation
    if (payment.status === "Paid") {
        return res.status(200).json(
            new ApiResponse(200, "Payment is already marked as paid", {
                payment,
                status: "Paid",
                verified: true,
                alreadyPaid: true
            })
        );
    }

    if (!payment.cashfreeOrderId) {
        throw new ApiError(400, "No Cashfree order associated with this payment. Please click Pay Now to initiate checkout.");
    }

    // Fetch order state and payment attempts from Cashfree API
    const [cfOrder, cfPayments] = await Promise.all([
        fetchCashfreeOrder(payment.cashfreeOrderId),
        fetchCashfreeOrderPayments(payment.cashfreeOrderId).catch(() => [])
    ]);

    // Validation 1: Verify currency and payment amount
    if (cfOrder.order_currency !== "INR") {
        throw new ApiError(400, `Unexpected order currency: ${cfOrder.order_currency}`);
    }
    if (Number(cfOrder.order_amount) !== Number(payment.amount)) {
        throw new ApiError(400, "Payment amount mismatch between gateway order and vault record.");
    }

    // Validation 2: Check if Cashfree indicates successful payment
    const hasSuccessfulPayment = Array.isArray(cfPayments) && cfPayments.some(p => p.payment_status === "SUCCESS");
    const isOrderPaid = cfOrder.order_status === "PAID" || hasSuccessfulPayment;

    if (isOrderPaid) {
        payment.status = "Paid";
        payment.paidDate = new Date();
        await payment.save();

        return res.status(200).json(
            new ApiResponse(200, "Payment verified successfully and marked as Paid!", {
                payment,
                status: "Paid",
                verified: true
            })
        );
    }

    // Check if there is an in-flight pending payment
    const hasPendingPayment = Array.isArray(cfPayments) && cfPayments.some(p => p.payment_status === "PENDING");
    if (hasPendingPayment) {
        return res.status(200).json(
            new ApiResponse(200, "Payment is currently processing with your banking provider.", {
                payment,
                status: "Pending",
                verified: false
            })
        );
    }

    return res.status(200).json(
        new ApiResponse(200, `Payment status on gateway: ${cfOrder.order_status}`, {
            payment,
            status: cfOrder.order_status,
            verified: false
        })
    );
});

export const handleCashfreeWebhook = asyncHandler(async (req, res, next) => {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];

    if (!signature || !timestamp) {
        console.warn("[Cashfree Webhook] Missing signature or timestamp headers.");
        return res.status(400).json({ error: "Missing Cashfree webhook verification headers." });
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);

    let webhookEvent;
    try {
        webhookEvent = verifyCashfreeWebhookSignature(signature, rawBody, timestamp);
    } catch (err) {
        console.error("[Cashfree Webhook] Signature verification failed:", err.message);
        return res.status(401).json({ error: "Invalid webhook signature." });
    }

    // Parse event payload
    const eventData = req.body || webhookEvent?.event || {};
    const eventType = eventData.type;

    console.log(`[Cashfree Webhook] Received verified event: ${eventType}`);

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
        const order = eventData?.data?.order;
        const paymentInfo = eventData?.data?.payment;
        const orderId = order?.order_id;
        const orderAmount = order?.order_amount;
        const orderCurrency = order?.order_currency;
        const paymentStatus = paymentInfo?.payment_status;

        if (!orderId) {
            console.warn("[Cashfree Webhook] Missing order_id in payload.");
            return res.status(200).json({ status: "ignored", reason: "missing_order_id" });
        }

        if (paymentStatus !== "SUCCESS") {
            console.log(`[Cashfree Webhook] Payment status is ${paymentStatus}, not SUCCESS. Acknowledging.`);
            return res.status(200).json({ status: "acknowledged", paymentStatus });
        }

        // Find Remetra payment matching either latest cashfreeOrderId or historical cashfreeOrders
        const payment = await Payment.findOne({
            $or: [{ cashfreeOrderId: orderId }, { cashfreeOrders: orderId }]
        });

        if (!payment) {
            console.warn(`[Cashfree Webhook] No Remetra payment found for order: ${orderId}`);
            // Acknowledge HTTP 200 so Cashfree does not repeatedly retry delivery
            return res.status(200).json({ status: "acknowledged", reason: "order_not_mapped" });
        }

        // Idempotency: If already Paid, do not alter paidDate or duplicate
        if (payment.status === "Paid") {
            console.log(`[Cashfree Webhook] Payment ${payment._id} is already settled. Idempotent acknowledgment.`);
            return res.status(200).json({ status: "success", message: "Payment already marked as Paid." });
        }

        // Validate amount & currency
        if (Number(orderAmount) !== Number(payment.amount) || orderCurrency !== "INR") {
            console.error(`[Cashfree Webhook] Validation mismatch for payment ${payment._id}. Amount: ${orderAmount} vs ${payment.amount}, Currency: ${orderCurrency}`);
            return res.status(200).json({ status: "rejected", reason: "amount_currency_mismatch" });
        }

        // Reconcile status to Paid
        payment.status = "Paid";
        payment.paidDate = paymentInfo?.payment_time ? new Date(paymentInfo.payment_time) : new Date();
        await payment.save();

        console.log(`[Cashfree Webhook] Payment ${payment._id} reconciled to Paid successfully via order ${orderId}.`);
        return res.status(200).json({ status: "success", message: "Payment marked as Paid." });
    }

    // Acknowledge other event types (e.g. PAYMENT_FAILED_WEBHOOK, USER_DROPPED_WEBHOOK)
    return res.status(200).json({ status: "acknowledged", type: eventType });
});
