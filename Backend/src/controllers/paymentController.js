import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Payment} from "../models/Payment.model.js"


export const paymentUser = asyncHandler(async(req, res, next) =>{
    const {personName, title, notes, category, provider, amount, dueDate, frequency, status, paidDate, reminderSent} = req.body

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
        provider,
        amount,
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