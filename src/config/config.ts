import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["WEBZ_API_TOKEN"] as const;

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(
			`Missing required environment variable: ${envVar}. Please add it to your .env file.`,
		);
	}
}

export const config = {
	webz: {
		apiToken: process.env.WEBZ_API_TOKEN,
		baseUrl: "https://api.webz.io",
		apiEndpoint: "/newsApiLite",
		batchSize: 200,
		pageSize: 10,
	},
	database: {
		host: process.env.POSTGRES_HOST || "localhost",
		port: Number.parseInt(process.env.POSTGRES_PORT || "5432", 10),
		username: process.env.POSTGRES_USER || "webzuser",
		password: process.env.POSTGRES_PASSWORD || "webzpass",
		database: process.env.POSTGRES_DB || "webzdb",
	},
};
