import MRole from "../models/roleModel.js";
import MGetRole from "../models/getRoleModel.js";
import { InputRole, PartialRole } from "../schemas/roleSchemas.js";
import { NotFoundError } from "../errors/AppError.js";
import MUser from "../models/userModel.js";

export class RoleService {
    async findAll() {
        const roles = await MRole.findAll({
            include: [
                {
                    model: MUser,
                    as: "users",
                    through: { attributes: [] },
                    attributes: { exclude: ["password"] },
                },
            ],
        });
        if (!roles.length) {
            throw new NotFoundError("No roles found");
        }
        return roles;
    }

    async findAllUserRolesId(userId: number) {
        const userExists = await MUser.findByPk(userId);
        if (!userExists) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        const rolesId = await MGetRole.findAll({
            where: { id_user: userId },
            attributes: ["id_role"],
        });
        if (!rolesId.length) {
            throw new NotFoundError(
                `No roles found for user with ID ${userId}`,
            );
        }

        const roles: MRole[] = [];
        for (const roleId of rolesId) {
            const result = await this.findById(roleId.dataValues.id_role);
            roles.push(result);
        }

        return roles;
    }

    async findAllUserRolesNametag(userNametag: string) {
        const userExists = await MUser.findOne({
            where: { nametag: userNametag },
            attributes: { exclude: ["password"] },
        });
        if (!userExists) {
            throw new NotFoundError(
                `User with Nametag ${userNametag} not found`,
            );
        }

        const rolesId = await MGetRole.findAll({
            where: { id_user: userExists.id },
            attributes: ["id_role"],
        });
        if (!rolesId.length) {
            throw new NotFoundError(
                `No roles found for user with Nametag ${userNametag}`,
            );
        }

        const roles: MRole[] = [];
        for (const roleId of rolesId) {
            const result = await this.findById(roleId.dataValues.id_role);
            roles.push(result);
        }

        return roles;
    }

    async findById(id: number) {
        const role = await MRole.findByPk(id, {
            include: [
                {
                    model: MUser,
                    as: "users",
                    through: { attributes: [] },
                    attributes: { exclude: ["password"] },
                },
            ],
        });
        if (!role) {
            throw new NotFoundError(`Role with ID ${id} not found`);
        }
        return role;
    }

    async findByLibelle(libelle: string) {
        const role = await MRole.findOne({
            where: { libelle: libelle },
            include: [
                {
                    model: MUser,
                    as: "users",
                    through: { attributes: [] },
                    attributes: { exclude: ["password"] },
                },
            ],
        });
        if (!role) {
            throw new NotFoundError(`Role with Libelle ${libelle} not found`);
        }
        return role;
    }

    async create(data: InputRole) {
        return MRole.create(data);
    }

    async assignRoleToUserId(userId: number, role: string) {
        const isNumber = /^\d+$/.test(role);

        const result = isNumber
            ? await this.findById(Number(role))
            : await this.findByLibelle(role);

        const userExists = await MUser.findByPk(userId);
        if (!userExists) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        return await MGetRole.create({
            id_user: userId,
            id_role: result.id,
        });
    }

    async assignRoleToUserNametag(userNametag: string, role: string) {
        const isNumber = /^\d+$/.test(role);

        const result = isNumber
            ? await this.findById(Number(role))
            : await this.findByLibelle(role);

        const userExists = await MUser.findOne({
            where: { nametag: userNametag },
            attributes: { exclude: ["password"] },
        });
        if (!userExists) {
            throw new NotFoundError(
                `User with Nametag ${userNametag} not found`,
            );
        }

        return await MGetRole.create({
            id_user: userExists.id,
            id_role: result.id,
        });
    }

    async updateById(id: number, data: PartialRole) {
        const role = await MRole.findByPk(id);
        if (!role) {
            throw new NotFoundError(`Role with ID ${id} not found`);
        }

        return role.update(data);
    }

    async updateByLibelle(libelle: string, data: PartialRole) {
        const role = await this.findByLibelle(libelle);
        if (!role) {
            throw new NotFoundError(`Role with Libelle ${libelle} not found`);
        }

        return role.update(data);
    }

    async deleteById(id: number) {
        const role = await MRole.findByPk(id);
        if (!role) {
            throw new NotFoundError(`Role with ID ${id} not found`);
        }

        return role.destroy();
    }

    async deleteByLibelle(libelle: string) {
        const role = await this.findByLibelle(libelle);
        if (!role) {
            throw new NotFoundError(`Role with Libelle ${libelle} not found`);
        }

        return role.destroy();
    }

    async deleteUserRoleId(userId: number, role: string) {
        const isNumber = /^\d+$/.test(role);

        const result = isNumber
            ? await this.findById(Number(role))
            : await this.findByLibelle(role);

        const userExists = await MUser.findByPk(userId);
        if (!userExists) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        const userRole = await MGetRole.findOne({
            where: { id_role: result.id, id_user: userId },
        });
        if (!userRole) {
            throw new NotFoundError(
                `No association found between user ID ${userId} and role ${role}`,
            );
        }

        return await userRole.destroy();
    }

    async deleteUserRoleNametag(userNametag: string, role: string) {
        const isNumber = /^\d+$/.test(role);

        const result = isNumber
            ? await this.findById(Number(role))
            : await this.findByLibelle(role);

        const userExists = await MUser.findOne({
            where: { nametag: userNametag },
            attributes: { exclude: ["password"] },
        });
        if (!userExists) {
            throw new NotFoundError(
                `User with Nametag ${userNametag} not found`,
            );
        }

        const userRole = await MGetRole.findOne({
            where: {
                id_role: result.id,
                id_user: userExists.id,
            },
        });
        if (!userRole) {
            throw new NotFoundError(
                `No association found between user Nametag ${userNametag} and role ${role}`,
            );
        }

        return await userRole.destroy();
    }
}
