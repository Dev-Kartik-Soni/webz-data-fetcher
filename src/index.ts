import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { WebzService } from "./services/WebzService";
import { WebzQueryBuilder } from "./services/WebzQueryBuilder";
import { logger } from "./utils/logger";

async function main() {
	try {
		await AppDataSource.initialize();
		logger.info("Database connection established");

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

		logger.info("Data fetching completed");
	} catch (error) {
		logger.error("Application error:", error);
		process.exit(1);
	}
}

main();
