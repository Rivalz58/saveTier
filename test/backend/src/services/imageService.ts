import MImage from "../models/imageModel.js";
import { InputImage, PartialImage } from "../schemas/imageSchemas.js";
import { NotFoundError } from "../errors/AppError.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3Client.js";
import crypto from "crypto";
import MAlbum from "../models/albumModel.js";
import { MultipartFile } from "@fastify/multipart";
import path from "path";
import MUser from "../models/userModel.js";

export class ImageService {
    async findAll() {
        const images = await MImage.findAll({
            include: [
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
            ],
            attributes: { exclude: ["id_album"] },
        });
        if (!images.length) {
            throw new NotFoundError("No images found");
        }
        return images;
    }

    async findAllToAlbumId(id: number) {
        const albumExists = await MAlbum.findByPk(id);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${id} not found`);
        }

        const images = await MImage.findAll({
            where: { id_album: id },
            include: [
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
            ],
            attributes: { exclude: ["id_album"] },
        });

        if (!images.length) {
            throw new NotFoundError(`No images found for album with ID ${id}`);
        }
        return images;
    }

    async findById(id: number) {
        const image = await MImage.findByPk(id, {
            include: [
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
            ],
            attributes: { exclude: ["id_album"] },
        });
        if (!image) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }
        return image;
    }

    async create(data: InputImage, file: MultipartFile) {
        const albumExists = await MAlbum.findByPk(data.id_album);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${data.id_album} not found`);
        }

        const fileBuffer = await file.toBuffer();
        const fileExtension = path.extname(file.filename);
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const bucketName = process.env.S3_BUCKET_NAME;

        if (!bucketName) {
            throw new Error(
                "S3_BUCKET_NAME is not defined in environment variables",
            );
        }

        try {
            await s3.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                    Body: fileBuffer,
                    ContentType: file.mimetype,
                    ACL: "public-read",
                }),
            );
        } catch (error) {
            throw new Error(`Failed to upload file to S3: ${error}`);
        }

        const imageUrl = `https://${bucketName}.s3.${process.env.S3_REGION}.io.cloud.ovh.net/${fileName}`;

        return MImage.create({
            name: data.name,
            description: data.description,
            url: data.url,
            path_image: imageUrl,
            id_album: data.id_album,
        });
    }

    async updateById(id: number, data: PartialImage) {
        const image = await MImage.findByPk(id);
        if (!image) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }
        return image.update(data);
    }

    async deleteById(id: number) {
        const image = await MImage.findByPk(id);
        if (!image) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }

        const bucketName = process.env.S3_BUCKET_NAME;
        if (!bucketName) {
            throw new Error(
                "S3_BUCKET_NAME is not defined in environment variables",
            );
        }

        const fileName = image.path_image.split("/").pop();
        if (!fileName) {
            throw new Error("Invalid image path provided");
        }

        try {
            await s3.send(
                new DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                }),
            );
            console.log(`Image deleted from S3: ${fileName}`);
        } catch (error) {
            throw new Error(`Failed to delete image from S3: ${error}`);
        }

        await image.destroy();
        console.log(`Image record deleted from DB: ID ${id}`);
    }
}
