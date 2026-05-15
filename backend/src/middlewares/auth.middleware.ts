import jwt, { JwtPayload } from "jsonwebtoken"
import { ApiError } from "../utils/apierror";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export const jwtverify=async(req:Request,res:Response,next:NextFunction)=>{

    const token = req?.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if(!token){
        throw new ApiError(401,"token is missing")
    }
    try {
            const decodedToken=jwt.verify(token,process.env.JWT_SECRET!) as JwtPayload;

            const user=await prisma.user.findUnique({
                where:{
                    id:decodedToken.id,
                }
            })

            if(!user){
                throw new ApiError(401,"User is not found")
            }
        
            (req as Request & { user: typeof user }).user = user

            next();
    } catch {
        return next(new ApiError(401, "Invalid token"));
    }
}