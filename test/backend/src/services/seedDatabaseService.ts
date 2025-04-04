import { Sequelize } from "sequelize";
import { hashPassword } from "../config/hash.js";
import MUser from "../models/userModel.js";
import MRevocation from "../models/revocationModel.js";
import MRole from "../models/roleModel.js";
import MGetRole from "../models/getRoleModel.js";
import MAlbum from "../models/albumModel.js";
import MTierlist from "../models/tierlistModel.js";
import MTournament from "../models/tournamentModel.js";
import MRanking from "../models/rankingModel.js";
import MCategory from "../models/categoryModel.js";
import MPossessCategory from "../models/possessCategoryModel.js";
import MTierlistLine from "../models/tierlistLineModel.js";
import MTierlistLineImage from "../models/tierlistLineImageModel.js";
import MRankingImage from "../models/rankingImageModel.js";
import MTournamentImage from "../models/tournamentImageModel.js";
import MTournamentOponent from "../models/tournamentOponentModel.js";
import MImage from "../models/imageModel.js";

export async function seedDatabase(sequelize: Sequelize) {
    try {
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

        await MUser.destroy({ truncate: true });
        await MRevocation.destroy({ truncate: true });
        await MGetRole.destroy({ truncate: true });
        await MRole.destroy({ truncate: true });
        await MAlbum.destroy({ truncate: true });
        await MTierlist.destroy({ truncate: true });
        await MTournament.destroy({ truncate: true });
        await MRanking.destroy({ truncate: true });
        await MCategory.destroy({ truncate: true });
        await MPossessCategory.destroy({ truncate: true });
        await MTierlistLine.destroy({ truncate: true });
        await MTierlistLineImage.destroy({ truncate: true });
        await MRankingImage.destroy({ truncate: true });
        await MTournamentImage.destroy({ truncate: true });
        await MTournamentOponent.destroy({ truncate: true });
        await MImage.destroy({ truncate: true });

        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

        await MUser.bulkCreate([
            {
                username: "Victor",
                nametag: "victor",
                email: "victor@example.com",
                password: await hashPassword("Secure@123"),
                status: "active",
                last_connection: new Date(),
            },
            {
                username: "Rose",
                nametag: "rose",
                email: "rose@example.com",
                password: await hashPassword("Secure@123"),
                status: "active",
                last_connection: new Date(),
            },
            {
                username: "Flavien",
                nametag: "flavien",
                email: "flavien@example.com",
                password: await hashPassword("Secure@123"),
                status: "active",
                last_connection: new Date(),
            },
        ]);

        await MRole.bulkCreate([
            {
                libelle: "Admin",
            },
            {
                libelle: "User",
            },
            {
                libelle: "Modo",
            },
        ]);

        await MGetRole.bulkCreate([
            {
                id_user: 1,
                id_role: 1,
            },
            {
                id_user: 1,
                id_role: 2,
            },
            {
                id_user: 2,
                id_role: 1,
            },
            {
                id_user: 2,
                id_role: 2,
            },
            {
                id_user: 3,
                id_role: 1,
            },
            {
                id_user: 3,
                id_role: 2,
            },
        ]);

        await MCategory.bulkCreate([
            {
                name: "Anime",
            },
            {
                name: "Voiture",
            },
            {
                name: "Technologie",
            },
            {
                name: "Jeux Vidéo",
            },
            {
                name: "Musique",
            },
            {
                name: "Cinéma",
            },
            {
                name: "Sport",
            },
            {
                name: "Cuisine",
            },
            {
                name: "Voyage",
            },
            {
                name: "Science",
            },
        ]);

        await MAlbum.bulkCreate([
            {
                name: "Voiture BMW",
                status: "public",
                id_user: 3,
            },
            {
                name: "Code Geass",
                status: "private",
                id_user: 2,
            },
            {
                name: "Geometry Dash",
                status: "public",
                id_user: 1,
            },
        ]);

        await MPossessCategory.bulkCreate([
            {
                id_category: 1,
                id_album: 2,
            },
            {
                id_category: 3,
                id_album: 1,
            },
            {
                id_category: 2,
                id_album: 1,
            },
            {
                id_category: 4,
                id_album: 3,
            },
        ]);

        await MImage.bulkCreate([
            {
                name: "M5",
                path_image:
                    "https://images.caradisiac.com/logos/3/3/9/8/283398/S0-la-nouvelle-bmw-m5-pese-tres-lourd-y-compris-au-sens-propre-209588.jpg",
                description: "image de la BMW M5 couleur vert",
                url: "https://www.bmw.fr",
                id_album: 1,
            },
            {
                name: "Shirley Fenette",
                path_image:
                    "https://static.wikia.nocookie.net/codegeass/images/7/7a/Shirley_Final.jpg/revision/latest/scale-to-width-down/1920?cb=20111224032322",
                description: "Shirley l'ange",
                id_album: 2,
            },
            {
                name: "Lelouch vi Britannia",
                path_image:
                    "https://static.wikia.nocookie.net/codegeass/images/6/6a/LelouchviBritannia.jpg/revision/latest?cb=20120107132514",
                description: "Zero",
                id_album: 2,
            },
            {
                name: "Zodiac",
                path_image:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDMJfHQFVghDN8SLTS5e2hTfr5OJFxljU2cQ&s",
                id_album: 3,
            },
        ]);

        console.log("Database successfully initialized!");
    } catch (error) {
        console.error("Error during database initialization:", error);
    }
}
