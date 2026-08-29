import {Router} from 'express'
import { firebaseAuth } from '../middlewares/authMiddleware.js'
import {paymentUser} from "../controllers/paymentController.js"


const router = Router()

router.route("/").post(firebaseAuth, paymentUser)


export default router