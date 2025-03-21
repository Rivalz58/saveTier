import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "my-great-secret-key",
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

export async function verifyToken(token: string) {
    const { payload } = await jwtVerify(token, secret);

    return payload;
}
