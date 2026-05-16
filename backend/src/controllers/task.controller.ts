import { Request,Response } from "express";
import {prisma} from "../config/prisma"
import { ApiError } from "../utils/apierror";
import { asyncHandler } from "../utils/asyncHandler";

export const createTask=asyncHandler(async(req:Request,res:Response)=>{

    const task = await prisma.task.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        dueDate: new Date(req.body.dueDate),
        assignedToId: req.body.assignedToId,
      },
    });
    return res.status(200).json({
        success: true,
        message: "task created ",
        data: task,
    })
})

export const getalltasks=asyncHandler(async(req:Request,res:Response)=>{
  
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const sortBy=(req.query.sortBy as string) ||"createdAt"
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (req.user?.role !== "ADMIN") {
      where.assignedToId = req.user?.id;
    }
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]:sortOrder
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    const total = await prisma.task.count({ where });
    const totalPages=Math.ceil(total/limit)
    return res.status(200).json({
      success: true,
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages
      },
    });
})

export const getTaskById = asyncHandler(
  async (req: Request, res: Response) => {
    const task = await prisma.task.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
          },
        },
        attachments: true,
      },
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }
    const isOwner = task.assignedToId === req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new ApiError(
        403,
        "You cannot access task"
      );
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  }
);

export const updateTask = asyncHandler(
  async (req: Request, res: Response) => {
    const existingTask = await prisma.task.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingTask) {
      throw new ApiError(404, "Task not found");
    }

    const isOwner = existingTask.assignedToId === req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new ApiError(
        403,
        "You cannot update task"
      );
    }
    const updatedTask = await prisma.task.update({
      where: {
        id: req.params.id,
      },
      data: {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        dueDate: req.body.dueDate
          ? new Date(req.body.dueDate)
          : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  }
);

export const deleteTask = asyncHandler(
  async (req: Request, res: Response) => {
    const existingTask = await prisma.task.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingTask) {
      throw new ApiError(404, "Task not found");
    }

    const isOwner = existingTask.assignedToId === req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new ApiError(
        403,
        "You cannot delete this task"
      );
    }
    await prisma.task.delete({
      where: {
        id: req.params.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  }
);