import {
  NextFunction,
  Request,
  Response,
} from "express";

import {  ZodTypeAny } from "zod";

import { ApiError } from "../utils/apierror";

export const validateQuery =
  (schema:  ZodTypeAny) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(
        new ApiError(
          400,
          "Invalid query parameters",
          result.error.issues || []
        )
      );
    }

    req.query = result.data as any;

    next();
  };