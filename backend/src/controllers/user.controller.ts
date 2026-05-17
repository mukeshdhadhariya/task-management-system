import { Request,Response } from "express";
import {prisma} from "../config/prisma"
import { ApiError } from "../utils/apierror";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";

export const getUsers=asyncHandler(async(req:Request,res:Response)=>{
    const page=Number(req.query.page) || 1
    const limit=Number(req.query.limit) || 10

    const skip=(page-1)*limit
    const users=await prisma.user.findMany({
        skip,
        take:limit,
        select:{
            id:true,
            email:true,
            role:true,
            createdAt:true
        }
    })

    const total=await prisma.user.count();

    res.status(200).json({
        success: true,
        data: users,
        meta: {
            page,
            limit,
            total,
        },
    })
})

export const createuser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role = "USER" } = req.body as {
      email?: string;
      password?: string;
      role?: "ADMIN" | "USER";
    };

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "user created",
      data: user,
    });
});

export const getUserbyID=asyncHandler(async(req:Request,res:Response)=>{
    const { id } = req.params as { id: string };

    const user = await prisma.user.findUnique({ 
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
})

export const updateuser=asyncHandler(async(req:Request,res:Response)=>{
    const { id } = req.params as { id: string };

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        email: req.body.email,
        role: req.body.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
    return res.status(200).json({
      success: true,
      message: "user updated",
      data: updatedUser,
    });
})


export const deleteuser=asyncHandler(async(req:Request,res:Response)=>{
    const { id } = req.params as { id: string };

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new ApiError(404, "user not found");
    }
    await prisma.user.delete({
      where: {
        id,
      },
    });
    return res.status(200).json({
      success: true,
      message: "user deleted",
    });
})