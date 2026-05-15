import { Request,Response,NextFunction } from "express";
import { ApiError } from "../utils/apierror";
import { UserRole } from "../constants/roles";

export const validate=(...permitedRoles:UserRole[])=>{

    return (req:Request,res:Response,next:NextFunction)=>{

        if(!req.user){
            return next(new ApiError(401,"authentication required"))
        }

        const hasPermission=permitedRoles.includes(req.user.role as UserRole)

        if(!hasPermission){
            return next(new ApiError(403,"do not have permission for this"))
        }

        next();

    }
}