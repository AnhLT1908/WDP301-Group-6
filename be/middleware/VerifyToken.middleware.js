import asyncHandler from './asyncErrorCatch.js';
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
dotenv.config();
const { ACCESS_KEY } = process.env;

export const verifyToken = asyncHandler(async (req, res, next) => {
    const token = req?.headers?.authorization;
    if (token) {
        const accessToken = token.split(" ")[1];
        try {
            const user = jwt.verify(accessToken, ACCESS_KEY);
            req.user = user;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json("Token has expired");
            }
            return res.status(403).json("Token is not valid");
        }
    } else {
        return res.status(401).json("You are not authenticated");
    }
});

export const verifyTokenRenter = asyncHandler(async(req,res,next) => {
    await verifyToken(req,res, () => {
        if (req.user.accountType === "renter") {
            next();
            
        }else{
            return res.status(403).json("You are not an Renter");
        }
    })
})

export const verifyTokenManager = asyncHandler(async(req,res,next) => {
    await verifyToken(req,res, () => {
        if (req.user.accountType === "host" || req.user.accountType === "admin") {
            next();
            
        }else{
            return res.status(403).json("You are not an manager or admin");
        }
    })
})

export const verifyTokenHost = asyncHandler(async(req,res,next) => {
    await verifyToken(req,res, () => {
        if (req.user.accountType === "host") {
            next();
            
        }else{
            return res.status(403).json("You are not an host");
        }
    })
})

export const verifyTokenAdmin = asyncHandler(async(req,res,next) => {
    await verifyToken(req,res, () => {
        if (req.user.accountType === "admin") {
            next();
            
        }else{
            return res.status(403).json("You are not admin");
        }
    })
})
