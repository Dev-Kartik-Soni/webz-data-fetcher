import "reflect-metadata";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { AppDataSource } from "./data-source";
import { logger } from "./utils/logger";
import { specs } from "./config/swagger";
import apiRoutes from "./routes/api";
import { WebzService } from "./services/WebzService";
import { WebzQueryBuilder } from "./services/WebzQueryBuilder";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use("/api", apiRoutes);

async function fetchInitialData() {
	const webzService = new WebzService(AppDataSource);
	const queryBuilder = new WebzQueryBuilder()
		.setQuery('Google topic:"financial and economic news" sentiment:negative')
		.setSize(10)
		.setSort("relevancy")
		.setSortDirection("desc")
		.setHighlight(true);

	await webzService.fetchAndStorePosts(queryBuilder, (retrieved, total) => {
		logger.info(`Progress: ${retrieved}/${total} posts retrieved`);
	});

	logger.info("Initial data fetching completed");
}

async function main() {
	try {
		await AppDataSource.initialize();
		logger.info("Database connection established");

		// Start the automatic data fetch
		fetchInitialData().catch((error) => {
			logger.error("Error in initial data fetch:", error);
		});

		app.listen(PORT, () => {
			logger.info(`Server is running on port ${PORT}`);
			logger.info(
				`API documentation available at http://localhost:${PORT}/api-docs`,
			);
		});
	} catch (error) {
		logger.error("Application error:", error);
		process.exit(1);
	}
}

main();
