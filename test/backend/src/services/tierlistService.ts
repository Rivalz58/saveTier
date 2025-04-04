import { NotFoundError } from "../errors/AppError.js";
import MAlbum from "../models/albumModel.js";
import MImage from "../models/imageModel.js";
import MTierlistLineImage from "../models/tierlistLineImageModel.js";
import MTierlistLine from "../models/tierlistLineModel.js";
import MTierlist from "../models/tierlistModel.js";
import MUser from "../models/userModel.js";
import { InputTierlist, PartialTierlist } from "../schemas/tierlistSchemas.js";

export class TierlistService {
    async findAll() {
        const tierlists = await MTierlist.findAll({
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password", "email"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password", "email"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MTierlistLine,
                    as: "tierlistLine",
                    include: [
                        {
                            model: MTierlistLineImage,
                            as: "tierlistLineImage",
                            include: [
                                {
                                    model: MImage,
                                    as: "image",
                                    attributes: { exclude: ["id_album"] },
                                },
                            ],
                            attributes: {
                                exclude: ["id_tierlist_line", "id_image"],
                            },
                        },
                    ],
                    attributes: { exclude: ["id_tierlist"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });
        if (!tierlists.length) {
            throw new NotFoundError("No tierlists found");
        }
        return tierlists;
    }

    async findAllToAlbumId(albumId: number) {
        const albumExists = await MAlbum.findByPk(albumId);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${albumId} not found`);
        }

        const tierlists = await MTierlist.findAll({
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password", "email"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password", "email"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MTierlistLine,
                    as: "tierlistLine",
                    include: [
                        {
                            model: MTierlistLineImage,
                            as: "tierlistLineImage",
                            include: [
                                {
                                    model: MImage,
                                    as: "image",
                                    attributes: { exclude: ["id_album"] },
                                },
                            ],
                            attributes: {
                                exclude: ["id_tierlist_line", "id_image"],
                            },
                        },
                    ],
                    attributes: { exclude: ["id_tierlist"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });

        if (!tierlists.length) {
            throw new NotFoundError(
                `No tierlists found for album with ID ${albumId}`,
            );
        }

        return tierlists;
    }

    async findAllToUserId(userId: number) {
        const userExists = await MUser.findByPk(userId);
        if (!userExists) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        const tierlists = await MTierlist.findAll({
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password", "email"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password", "email"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MTierlistLine,
                    as: "tierlistLine",
                    include: [
                        {
                            model: MTierlistLineImage,
                            as: "tierlistLineImage",
                            include: [
                                {
                                    model: MImage,
                                    as: "image",
                                    attributes: { exclude: ["id_album"] },
                                },
                            ],
                            attributes: {
                                exclude: ["id_tierlist_line", "id_image"],
                            },
                        },
                    ],
                    attributes: { exclude: ["id_tierlist"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });

        if (!tierlists.length) {
            throw new NotFoundError(
                `No tierlists found for album with ID ${userId}`,
            );
        }

        return tierlists;
    }

    async findAllToUserNametag(userNametag: string) {
        const userExists = await MUser.findOne({
            where: { nametag: userNametag },
            attributes: { exclude: ["password", "email"] },
        });
        if (!userExists) {
            throw new NotFoundError(
                `User with Nametag ${userNametag} not found`,
            );
        }

        const tierlists = await MTierlist.findAll({
            where: { id_user: userExists.id },
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password", "email"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password", "email"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MTierlistLine,
                    as: "tierlistLine",
                    include: [
                        {
                            model: MTierlistLineImage,
                            as: "tierlistLineImage",
                            include: [
                                {
                                    model: MImage,
                                    as: "image",
                                    attributes: { exclude: ["id_album"] },
                                },
                            ],
                            attributes: {
                                exclude: ["id_tierlist_line", "id_image"],
                            },
                        },
                    ],
                    attributes: { exclude: ["id_tierlist"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });

        if (!tierlists.length) {
            throw new NotFoundError(
                `No tierlists found for album with Nametag ${userNametag}`,
            );
        }

        return tierlists;
    }

    async findById(id: number) {
        const tierlist = await MTierlist.findByPk(id, {
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password", "email"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password", "email"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MTierlistLine,
                    as: "tierlistLine",
                    include: [
                        {
                            model: MTierlistLineImage,
                            as: "tierlistLineImage",
                            include: [
                                {
                                    model: MImage,
                                    as: "image",
                                    attributes: { exclude: ["id_album"] },
                                },
                            ],
                            attributes: {
                                exclude: ["id_tierlist_line", "id_image"],
                            },
                        },
                    ],
                    attributes: { exclude: ["id_tierlist"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });
        if (!tierlist) {
            throw new NotFoundError(`Tierlist with ID ${id} not found`);
        }
        return tierlist;
    }

    async create(data: InputTierlist, userId: number) {
        const albumExists = await MAlbum.findByPk(data.id_album);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${data.id_album} not found`);
        }

        return MTierlist.create({ ...data, id_user: userId });
    }

    async updateById(id: number, data: PartialTierlist) {
        const tierlist = await MTierlist.findByPk(id);
        if (!tierlist) {
            throw new NotFoundError(`Tierlist with ID ${id} not found`);
        }

        return tierlist.update(data);
    }

    async deleteById(id: number) {
        const tierlist = await MTierlist.findByPk(id);
        if (!tierlist) {
            throw new NotFoundError(`Tierlist with ID ${id} not found`);
        }

        return tierlist.destroy();
    }
}
