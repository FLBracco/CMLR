import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

type Class<T> = new () => T;

export const validateDto = <T extends object>(dtoClass: Class<T>) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const instance = plainToInstance(dtoClass, req.body, {
      enableImplicitConversion: false,
    });

    const errors = await validate(instance);

    if (errors.length > 0) {
      const details = errors.map((error) => ({
        property: error.property,
        messages: Object.values(error.constraints ?? {}),
      }));

      next(AppError.badRequest("Datos inválidos.", details));
      return;
    }

    req.body = instance;
    next();
  };
};
