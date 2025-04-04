import { jwtVerify, SignJWT } from "jose";
import { TextEncoder } from "util";

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "supersecretkey",
);
const expiration = process.env.JWT_EXPIRATON || "7d";
const algorithm = process.env.JWT_ALGORITHM || "HS256";

export async function createToken(id: number, roles: string[]) {
    return new SignJWT({ id: id, roles: roles })
        .setProtectedHeader({ alg: algorithm })
        .setIssuedAt()
        .setExpirationTime(expiration)
        .sign(secret);
}

export async function createTokenForResetPassword(id: number) {
    return new SignJWT({ id: id })
        .setProtectedHeader({ alg: algorithm })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);
}

export async function verifyToken(token: string) {
    const { payload } = await jwtVerify(token, secret);

    return payload;
}
