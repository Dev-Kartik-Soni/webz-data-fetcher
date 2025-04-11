import { Router } from "express";
import { WebzService } from "../services/WebzService";
import { WebzQueryBuilder } from "../services/WebzQueryBuilder";
import { logger } from "../utils/logger";
import { AppDataSource } from "../data-source";

const router = Router();

/**
 * @swagger
 * /api/fetch:
 *   post:
 *     summary: Fetch and store posts from Webz
 *     description: Fetches posts from Webz API based on the provided query parameters and stores them in the database
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebzQuery'
 *     responses:
 *       200:
 *         description: Posts fetched and stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalPosts:
 *                   type: number
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/fetch", async (req, res) => {
	try {
		const { query, size, sort, sortDirection, highlight } = req.body;

		const queryBuilder = new WebzQueryBuilder()
			.setQuery(query)
			.setSize(size || 10)
			.setSort(sort || "relevancy")
			.setSortDirection(sortDirection || "desc")
			.setHighlight(highlight !== undefined ? highlight : true);

		const webzService = new WebzService(AppDataSource);
		let totalPosts = 0;

		await webzService.fetchAndStorePosts(queryBuilder, (retrieved, total) => {
			totalPosts = total;
			logger.info(`Progress: ${retrieved}/${total} posts retrieved`);
		});

		res.json({
			message: "Posts fetched and stored successfully",
			totalPosts,
		});
	} catch (error) {
		logger.error("Error in fetch endpoint:", error);
		res.status(500).json({
			code: "INTERNAL_ERROR",
			message: "An error occurred while fetching posts",
		});
	}
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get stored posts
 *     description: Retrieve posts stored in the database with optional filtering
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pages:
 *                   type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/posts", async (req, res) => {
	try {
		const page = Number.parseInt(req.query.page as string) || 1;
		const limit = Math.min(
			Number.parseInt(req.query.limit as string) || 10,
			100,
		);

		const webzService = new WebzService(AppDataSource);
		const [posts, total] = await webzService.getPosts(page, limit);

		res.json({
			posts,
			total,
			page,
			pages: Math.ceil(total / limit),
		});
	} catch (error) {
		logger.error("Error in get posts endpoint:", error);
		res.status(500).json({
			code: "INTERNAL_ERROR",
			message: "An error occurred while retrieving posts",
		});
	}
});

export default router;
