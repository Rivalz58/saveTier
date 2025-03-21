import MUser from "../models/userModel.js";
import { InputUser, PartialUser } from "../schemas/userSchemas.js";
import { NotFoundError } from "../errors/AppError.js";
import { hashPassword } from "../config/hash.js";
import MRole from "../models/roleModel.js";
import MAlbum from "../models/albumModel.js";
import MTierlist from "../models/tierlistModel.js";
import MTournament from "../models/tournamentModel.js";
import MRanking from "../models/rankingModel.js";

export class UserService {
    async findAll() {
        const users = await MUser.findAll({
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: MRole,
                    as: "roles",
                    through: { attributes: [] },
                },
                {
                    model: MAlbum,
                    as: "albums",
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MTierlist,
                    as: "tierlists",
                    attributes: { exclude: ["id_user", "id_album"] },
                },
                {
                    model: MTournament,
                    as: "tournaments",
                    attributes: { exclude: ["id_user", "id_album"] },
                },
                {
                    model: MRanking,
                    as: "rankings",
                    attributes: { exclude: ["id_user", "id_album"] },
                },
            ],
        });

        if (!users.length) {
            throw new NotFoundError("No users found");
        }
        return users;
    }

    async findById(id: number) {
        const user = await MUser.findByPk(id, {
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: MRole,
                    as: "roles",
                    through: { attributes: [] },
                },
                {
                    model: MAlbum,
                    as: "albums",
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MTierlist,
                    as: "tierlists",
                    attributes: { exclude: ["id_user", "id_album"] },
                },
                {
                    model: MTournament,
                    as: "tournaments",
                    attributes: { exclude: ["id_user", "id_album"] },
                },
                {
                    model: MRanking,
                    as: "rankings",
                    attributes: { exclude: ["id_user", "id_album"] },
                },
            ],
        });
        if (!user) {
            throw new NotFoundError(`User with ID ${id} not found`);
        }
        return user;
    }

    async findByNametag(nametag: string) {
        const user = await MUser.findOne({
            where: { nametag: nametag },
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: MRole,
                    as: "roles",
                    through: { attributes: [] },
                },
                {
                    model: MAlbum,
                    as: "albums",
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MTierlist,
                    as: "tierlists",
                    attributes: { exclude: ["id_user", "id_album"] },
                },
                {
                    model: MTournament,
                    as: "tournaments",
                    attributes: { exclude: ["id_user", "id_album"] },
                },
                {
                    model: MRanking,
                    as: "rankings",
                    attributes: { exclude: ["id_user", "id_album"] },
                },
            ],
        });
        if (!user) {
            throw new NotFoundError(`User with Nametag ${nametag} not found`);
        }
        return user;
    }

    async getHashPasswordById(id: number) {
        const user = await MUser.findByPk(id, {
            attributes: ["id", "password", "last_connexion"],
        });
        if (!user) {
            throw new NotFoundError(`User with ID ${id} not found`);
        }

        return user;
    }

    async getHashPasswordByNametag(nametag: string) {
        const user = await MUser.findOne({
            where: { nametag: nametag },
            attributes: ["id", "password", "last_connexion"],
        });
        if (!user) {
            throw new NotFoundError(`User with Nametag ${nametag} not found`);
        }

        return user;
    }

    async create(data: InputUser) {
        const passwordHash = await hashPassword(data.password);
        return MUser.create({
            ...data,
            password: passwordHash,
            last_connexion: new Date(),
        });
    }

    async updateById(id: number, data: PartialUser) {
        const user = await MUser.findByPk(id);
        if (!user) {
            throw new NotFoundError(`User with ID ${id} not found`);
        }

        if (data.password) {
            data.password = await hashPassword(data.password);
        }

        data.last_connexion = new Date();

        return user.update({ ...data, last_connexion: new Date() });
    }

    async updateByNametag(nametag: string, data: PartialUser) {
        const user = await MUser.findOne({ where: { nametag: nametag } });
        if (!user) {
            throw new NotFoundError(`User with Nametag ${nametag} not found`);
        }

        if (data.password) {
            data.password = await hashPassword(data.password);
        }

        return user.update({ ...data, last_connexion: new Date() });
    }

    async deleteById(id: number) {
        const user = await MUser.findByPk(id);
        if (!user) {
            throw new NotFoundError(`User with ID ${id} not found`);
        }

        return user.destroy();
    }

    async deleteByNametag(nametag: string) {
        const user = await MUser.findOne({ where: { nametag: nametag } });
        if (!user) {
            throw new NotFoundError(`User with Nametag ${nametag} not found`);
        }

        return user.destroy();
    }
}
