import {Router} from 'express'
import { firebaseAuth } from '../middlewares/authMiddleware.js'
import {paymentUser, getAllPayments} from "../controllers/paymentController.js"


const router = Router()

router.route("/").post(firebaseAuth, paymentUser)
router.route("/").get(firebaseAuth, getAllPayments)


export default router