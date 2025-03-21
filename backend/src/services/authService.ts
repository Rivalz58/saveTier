import {
    InputAuth,
    InputAuthPassword,
    InputRegistration,
} from "../schemas/authSchemas.js";
import {
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
} from "../errors/AppError.js";
import { verifyToken, createToken } from "../config/auth.js";
import { hashPassword, verifyPassword } from "../config/hash.js";
import MRevocation from "../models/revocationModel.js";
import { UserService } from "./userService.js";
import { RoleService } from "./roleService.js";
import { Status } from "../schemas/userSchemas.js";
import MGetRole from "../models/getRoleModel.js";
import { Op } from "sequelize";
import MRole from "../models/roleModel.js";

const userService = new UserService();
const roleService = new RoleService();

export class AuthService {
    async auth(data: InputAuth) {
        const user = await userService.getHashPasswordByNametag(data.nametag);

        const checkPassword = await verifyPassword(
            user.password,
            data.password,
        );
        if (!checkPassword) {
            throw new AuthenticationError("Invalid nametag or password");
        }

        user.last_connexion = new Date();
        user.save();

        const roles = await roleService.findAllUserRolesId(user.id);
        const rolesName: string[] = [];
        for (const role of roles) {
            rolesName.push(role.libelle);
        }
        const token = await createToken(user.id, rolesName);

        return token;
    }

    async create(data: InputRegistration) {
        const status = Status.active;
        const last_connexion = new Date();

        return userService.create({
            ...data,
            status: status,
            last_connexion: last_connexion,
        });
    }

    async addUserRole(id: number) {
        const userRole = await MRole.findOne({
            where: { libelle: "User" },
        });
        if (!userRole) {
            throw new NotFoundError(`Role with Libelle User not found`);
        }

        await MGetRole.create({
            id_user: id,
            id_role: userRole.id,
        });

        return userRole;
    }

    async updatePassword(id: number, data: InputAuthPassword) {
        const user = await userService.getHashPasswordById(id);

        const oldPassword = data.old_password;
        const checkPassword = await verifyPassword(user.password, oldPassword);
        if (!checkPassword) {
            throw new AuthenticationError("Invalid old password");
        }

        if (!data.password) {
            throw new AuthenticationError("Invalid password");
        }
        data.password = await hashPassword(data.password);

        return user.update({ ...data, last_connexion: new Date() });
    }

    async revocation(token: string) {
        const payload = await verifyToken(token);
        if (!payload) {
            throw new AuthorizationError("Invalid token payload");
        }

        await MRevocation.create({
            id_user: payload.id,
            date: new Date(),
        });
    }
}

const time = 7 * 24 * 60 * 60 * 1000;

const deleteRevokedTokens = async () => {
    const DaysAgo = new Date();
    DaysAgo.setDate(DaysAgo.getDate() - 7);

    await MRevocation.destroy({
        where: {
            date: {
                [Op.lt]: DaysAgo,
            },
        },
    });

    console.log("Delete revocation");
};

setInterval(deleteRevokedTokens, time);
