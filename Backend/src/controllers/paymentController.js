import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Payment} from "../models/Payment.model.js"


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