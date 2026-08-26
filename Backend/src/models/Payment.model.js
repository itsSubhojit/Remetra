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
        provider:{
            type:String,
            required:true
        },
        amount:{
            type:Number,
            required:true
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
            type:Date
        },
        reminderSent:{
            type:Boolean,
            default:false
        }
    }, 
    {timestamps: true})

export const Payment = mongoose.model("Payment", paymentSchema);