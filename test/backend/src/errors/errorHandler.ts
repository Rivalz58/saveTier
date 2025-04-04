import { FastifyReply } from "fastify";
import { AppError } from "./AppError.js";
import { ZodError } from "zod";
import { ValidationError as SequelizeValidationError } from "sequelize";

export async function handleError(error: unknown, rep: FastifyReply) {
    console.error(error);

    // Handle custom AppErrors
    if (error instanceof AppError) {
        return rep.status(error.statusCode).send({
            status: error.status,
            message: error.message,
        });
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return rep.status(400).send({
            status: "error",
            message: error.issues[0]?.message || "Validation error",
        });
    }

    // Handle Sequelize validation errors
    if (error instanceof SequelizeValidationError) {
        return rep.status(400).send({
            status: "error",
            message: error.errors[0]?.message || "Validation error",
        });
    }

    // Handle unknown errors
    return rep.status(500).send({
        status: "error",
        message: "Internal server error",
    });
}
