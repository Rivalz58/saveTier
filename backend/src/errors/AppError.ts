export class AppError extends Error {
    constructor(
        public statusCode: number,
        public status: string,
        message: string,
    ) {
        super(message);
        Error.captureStackTrace(this, AppError);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, "error", message);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(400, "error", message);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string) {
        super(401, "error", message);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string) {
        super(403, "error", message);
    }
}

export class SendingEmailError extends AppError {
    constructor(message: string) {
        super(400, "error", message);
    }
}
