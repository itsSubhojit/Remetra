import mongoose, {Schema} from "mongoose";

const paymentSchema = new Schema(
    {
        firebaseUid:{
            type:String,
            required:true
        },
        personName:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        notes:{
            type:String
        },
        category:{
            type:String,
            enum:["Recharge","Electricity","Subscription"],
            required:true
        },
        consumerId: {
            type: String,
            trim: true,
            default: null
        },
        provider:{
            type:String,
            required:true
        },
        mobileNumber: {
            type: String,
            trim: true,
            default: null
        },
        rechargeType: {
            type: String,
            enum: ["Prepaid", "Postpaid"],
            default: null
        },
        amount:{
            type:Number,
            required:true
        },
        validityDays: {
            type: Number,
            min: 1,
            default: null
        },
        dueDate:{
            type:Date,
            required:true
        },
        frequency:{
            type:String,
            enum:["Weekly","Monthly","Yearly"],
            required:true
        },
        status:{
            type:String,
            default:"Upcoming",
            enum:["Upcoming","Due","Overdue","Paid"]
        },
        paidDate:{
            type:Date,
            default: null
        },
        reminderSent:{
            type:Boolean,
            default:false
        },
        cashfreeOrderId: {
            type: String,
            default: null,
            index: true
        },
        cashfreeOrders: {
            type: [String],
            default: []
        }
    }, 
    {timestamps: true})

export const Payment = mongoose.model("Payment", paymentSchema);