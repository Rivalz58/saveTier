import dns from "dns";
import { BadRequestError } from "../errors/AppError.js";

export async function checkEmailDomain(email: string): Promise<boolean> {
    try {
        const domain = email.split("@")[1];
        if (!domain) throw new BadRequestError("Invalid email format");

        const mxRecords = await dns.promises.resolveMx(domain);
        return mxRecords.length > 0;
    } catch (error) {
        console.log(error);
        return false;
    }
}
