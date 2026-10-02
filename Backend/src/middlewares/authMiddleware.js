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
        const decodedTokenInfo = await getAuth().verifyIdToken(token, true);
        req.user = decodedTokenInfo;
        next();
    } catch (error) {
        if (error.code === "auth/id-token-revoked") {
            throw new ApiError(401, "Session expired. Your token has been revoked. Please sign in again.");
        }
        if (error.code === "auth/user-disabled") {
            throw new ApiError(403, "Your account has been disabled. Please contact support.");
        }
        throw new ApiError(401, "Authentication failed. Invalid or expired token.");
    }
})