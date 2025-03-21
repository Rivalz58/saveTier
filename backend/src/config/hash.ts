import argon2 from "argon2";

export async function hashPassword(password: string) {
    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 19,
        timeCost: 2,
        parallelism: 1,
        hashLength: 32,
    });

    return hash;
}

export async function verifyPassword(hash: string, password: string) {
    const checkpassword = await argon2.verify(hash, password);

    return checkpassword;
}
