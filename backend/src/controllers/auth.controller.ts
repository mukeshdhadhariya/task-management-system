import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { ApiError } from "../utils/apierror";
import { prisma } from "../config/prisma";

export const register= async(req:Request,res:Response)=>{
    const {name,email,password}=req.body

    const existingUser=await prisma.user.findUnique({
        where:{
            email
        }
    })

    if(existingUser){
        throw new ApiError(409,"User alredy exist")
    }
    const hashedpassword=await bcrypt.hash(password,10);
    const user=await prisma.user.create({
        data:{
            email,
            password:hashedpassword,
        }
    })

    return res.status(201).json({
        success:true,
        data:{
            id:user.id,
            email:user.email
        }
    })
}

export const login=async(req:Request,res:Response)=>{
    const {email,password}=req.body
    const user=await prisma.user.findUnique({
        where:{
            email
        }
    })

    if(!user){
        throw new ApiError(401,"user not exist")
    }

    const isPasswordCorrect=await bcrypt.compare(password,user.password);

    if(!isPasswordCorrect){
        throw new ApiError(401,"invalid email or password")
    }

    const token=jwt.sign(
        {
            id:user.id,
            role:user.role
        },
        process.env.JWT_SECRET!,
        {
            expiresIn:"7d"
        }
    );

    res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        sameSite:"lax",
        maxAge:  7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
        success:true,
        message:"login successfully",
        user:{
            id:user.id,
            email:user.email,
            role:user.role
        }
    })
}