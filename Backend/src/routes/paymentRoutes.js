import { Router } from 'express'
import { firebaseAuth } from '../middlewares/authMiddleware.js'
import { 
    paymentUser, 
    getAllPayments, 
    getPaymentId, 
    updatePayment, 
    deletePayment, 
    deleteUserAccount, 
    initiatePayment,
    verifyPayment,
    handleCashfreeWebhook
} from "../controllers/paymentController.js"


const router = Router()

// Cashfree Webhook listener (Public - authenticated via Cashfree Signature)
router.route("/webhook").post(handleCashfreeWebhook)

router.route("/account").delete(firebaseAuth, deleteUserAccount)
router.route("/user/account").delete(firebaseAuth, deleteUserAccount)
router.route("/").post(firebaseAuth, paymentUser)
router.route("/").get(firebaseAuth, getAllPayments)
router.route("/:id").get(firebaseAuth, getPaymentId)
router.route("/:id").put(firebaseAuth, updatePayment)
router.route("/:id").delete(firebaseAuth, deletePayment)
router.route("/:id/pay").post(firebaseAuth, initiatePayment)
router.route("/:id/verify-payment").get(firebaseAuth, verifyPayment)
router.route("/:id/verify-payment").post(firebaseAuth, verifyPayment)


export default router