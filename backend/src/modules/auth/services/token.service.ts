import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { Environment } from "../../../config/env/environment.js";
import { AppError } from "../../../shared/errors/AppError.js";

export interface ITokenPayload {
  sub: string;
  email: string;
}

export const signToken = (payload: ITokenPayload): string => {
  const expiresIn = Environment.jwt.expiresIn as Exclude<
    SignOptions["expiresIn"],
    undefined
  >;

  return jwt.sign(payload, Environment.jwt.secret, { expiresIn });
};

export const verifyToken = (token: string): ITokenPayload => {
  try {
    const decoded = jwt.verify(token, Environment.jwt.secret);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof decoded.sub === "string" &&
      typeof decoded.email === "string"
    ) {
      return { sub: decoded.sub, email: decoded.email };
    }

    throw new AppError(401, "Token inválido.");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Token inválido o expirado.");
  }
};
