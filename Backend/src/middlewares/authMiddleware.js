import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {getAuth} from "firebase-admin/auth";


export const firebaseAuth = asyncHandler(async(req, res, next) =>{
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        throw new ApiError(401, "Unauthorized - No token provided")
    }

    const token = authHeader.split(" ")[1]
    
    try {
        const decodedTokenInfo = await getAuth().verifyIdToken(token)
        req.user = decodedTokenInfo
        next()
    } catch (error) {
        throw new ApiError(401, "Fail To Verify User!")
    }
})