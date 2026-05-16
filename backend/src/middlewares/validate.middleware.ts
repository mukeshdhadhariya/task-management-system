import {
  NextFunction,
  Request,
  Response,
} from "express";

import { ZodTypeAny } from "zod";

import { ApiError } from "../utils/apierror";

export const validate =
  (schema: ZodTypeAny) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      schema.parse(req.body);

      next();
    } catch (error: any) {
      return next(
        new ApiError(
          400,
          "Validation failed",
          error.errors
        )
      );
    }
  };