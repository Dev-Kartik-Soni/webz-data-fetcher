import { DataSource } from "typeorm";
import { config } from "./config/config";
import { Post } from "./models/Post";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: config.database.host,
	port: config.database.port,
	username: config.database.username,
	password: config.database.password,
	database: config.database.database,
	entities: [Post],
	synchronize: true,
});
