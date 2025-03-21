import Fastify from "fastify";
import cors from "@fastify/cors";
import sequelize from "./config/database.js";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from "fastify-type-provider-zod";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { userRoutes } from "./routes/userRoutes.js";
import { albumRoutes } from "./routes/albumRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { categoryRoutes } from "./routes/categoryRoutes.js";
import { imageRoutes } from "./routes/imageRoutes.js";
import { rankingRoutes } from "./routes/rankingRoutes.js";
import { rankingImageRoutes } from "./routes/rankingImageRoutes.js";
import { tierlistLineImageRoutes } from "./routes/tierlistLineImageRoutes.js";
import { tierlistRoutes } from "./routes/tierlistRoutes.js";
import { roleRoutes } from "./routes/roleRoutes.js";
import { tierlistLineRoutes } from "./routes/tierlistLineRoutes.js";
import { tournamentOponentRoutes } from "./routes/tournamentOponentRoutes.js";
import { tournamentImageRoutes } from "./routes/tournamentImageRoutes.js";
import { tournamentRoutes } from "./routes/tournamentRoutes.js";
import { seedDatabase } from "./services/seedDatabaseService.js";

// Create a Fastify server instance with Zod type provider
const web_server = Fastify({
    logger: true,
}).withTypeProvider<ZodTypeProvider>();

// Set custom validator and serializer compilers using Zod
web_server.setValidatorCompiler(validatorCompiler);
web_server.setSerializerCompiler(serializerCompiler);

// Determine if the environment is development
const isDevelopment = process.env.NODE_ENV === "development";

// Enable CORS with environment-specific settings
web_server.register(cors, {
    origin: isDevelopment ? "*" : "https://tierhub.online",
    methods: isDevelopment ? ["*"] : ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
});

// Custom error handler for the Fastify server
web_server.setErrorHandler(async function (error, _, reply) {
    if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const valerror = fromError(error);
        reply.status(400).send({
            status: 400,
            message: valerror.toString(),
        });
    } else {
        // Handle generic errors
        reply.status(error.statusCode || 500).send({
            status: error.statusCode || 500,
            message: error.message || "Internal Server Error",
        });
    }
});

const start_web_server = async () => {
    try {
        await sequelize.authenticate();

        // Connect to the database and sync database models
        if (isDevelopment) {
            await sequelize.sync({ force: true });
            await seedDatabase(sequelize);
            console.log("Connected to the test database...");
        } else {
            await sequelize.sync();
            console.log("Connected to the database...");
        }

        // Register all route modules with the API prefix
        web_server.register(albumRoutes, { prefix: "/api" });
        web_server.register(authRoutes, { prefix: "/api" });
        web_server.register(categoryRoutes, { prefix: "/api" });
        web_server.register(imageRoutes, { prefix: "/api" });
        web_server.register(rankingRoutes, { prefix: "/api" });
        web_server.register(rankingImageRoutes, { prefix: "/api" });
        web_server.register(roleRoutes, { prefix: "/api" });
        web_server.register(tierlistRoutes, { prefix: "/api" });
        web_server.register(tierlistLineImageRoutes, { prefix: "/api" });
        web_server.register(tierlistLineRoutes, { prefix: "/api" });
        web_server.register(tournamentRoutes, { prefix: "/api" });
        web_server.register(tournamentOponentRoutes, { prefix: "/api" });
        web_server.register(tournamentImageRoutes, { prefix: "/api" });
        web_server.register(userRoutes, { prefix: "/api" });

        // Define server port and host
        const node_env = process.env.NODE_ENV || "development";
        const port = parseInt(process.env.BE_PORT || "3008");
        const host = process.env.BE_HOST || "127.0.0.1";

        // Start the server
        await web_server.listen({ port: port, host: host });
        console.log(`Server is running in ${node_env} mode on port ${port}`);
    } catch (error) {
        // Log and exit on error
        web_server.log.error(error);
        process.exit(1);
    }
};

start_web_server();
