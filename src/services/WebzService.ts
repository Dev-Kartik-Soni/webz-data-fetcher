import axios, { type AxiosInstance } from "axios";
import type { DataSource, Repository } from "typeorm";
import { config } from "../config/config";
import { Post } from "../models/Post";
import { logger } from "../utils/logger";
import type { WebzQueryBuilder } from "./WebzQueryBuilder";
import type { WebzPost, WebzResponse } from "../types/webz";

/**
 * Service for fetching posts from Webz.io API and storing them in the database.
 * Handles pagination and respects API rate limits.
 */
export class WebzService {
	private repository: Repository<Post>;
	private apiToken: string;
	private axiosInstance: AxiosInstance;

	constructor(
		private dataSource: DataSource,
		axiosInstance?: AxiosInstance,
	) {
		this.repository = this.dataSource.getRepository(Post);
		const token = config.webz.apiToken;

		if (!token) {
			throw new Error("WEBZ_API_TOKEN is not set in environment variables");
		}

		this.apiToken = token;
		this.axiosInstance =
			axiosInstance ||
			axios.create({
				baseURL: config.webz.baseUrl,
				headers: {
					Accept: "application/json",
				},
			});
	}

	/**
	 * Fetches posts in batches and stores them in the database.
	 * Stops when either the batch size limit is reached or no more results are available.
	 */
	async fetchAndStorePosts(
		queryBuilder: WebzQueryBuilder,
		callback?: (retrieved: number, total: number) => void,
	): Promise<void> {
		try {
			let totalStored = 0;
			let nextUrl: string | undefined;
			let totalResults = 0;
			let currentBatch = 1;

			queryBuilder.setSize(config.webz.pageSize);

			do {
				let requestParams: Record<string, string | number | boolean>;

				if (nextUrl) {
					const url = new URL(nextUrl, config.webz.baseUrl);
					requestParams = Object.fromEntries(url.searchParams);
					requestParams.token = this.apiToken;
				} else {
					requestParams = {
						...queryBuilder.build(),
						token: this.apiToken,
					};
				}

				logger.info("Fetching posts with params:", {
					...requestParams,
					token: "REDACTED",
					batch: currentBatch,
				});

				const response = await this.axiosInstance.get<WebzResponse>(
					config.webz.apiEndpoint,
					{
						params: requestParams,
					},
				);

				if (!response.data || !Array.isArray(response.data.posts)) {
					logger.error("Invalid API response:", response.data);
					throw new Error(
						`Invalid API response: ${JSON.stringify(response.data, null, 2)}`,
					);
				}

				const {
					posts,
					moreResultsAvailable,
					next,
					totalResults: total,
				} = response.data;
				totalResults = total;

				logger.info(`Received ${posts.length} posts from API`);
				logger.info(`Requests left: ${response.data.requestsLeft}`);

				await this.storePosts(posts);
				totalStored += posts.length;
				nextUrl = next;
				currentBatch++;

				logger.info(`Stored ${totalStored} posts out of ${totalResults}`);

				if (callback) {
					callback(totalStored, totalResults);
				}

				// Stop if we've reached our batch size limit or no more results
				if (
					totalStored >= config.webz.batchSize ||
					!moreResultsAvailable ||
					!nextUrl
				) {
					logger.info(
						`Stopping after ${totalStored} posts (limit: ${config.webz.batchSize})`,
					);
					break;
				}

				// Add a small delay between requests to be nice to the API
				await new Promise((resolve) => setTimeout(resolve, 100));

				// biome-ignore lint/correctness/noConstantCondition: <explanation>
			} while (true);

			logger.info("Finished fetching and storing posts");
		} catch (error) {
			if (axios.isAxiosError(error)) {
				logger.error("API Error:", {
					status: error.response?.status,
					data: error.response?.data,
					message: error.message,
					url: error.config?.url,
					params: error.config?.params,
					headers: error.config?.headers,
				});
				throw new Error(`API Error: ${error.message}`);
			}
			logger.error("Error fetching or storing posts:", error);
			throw error;
		}
	}

	/**
	 * Transforms and stores posts in the database.
	 * Handles validation and error logging.
	 */
	private async storePosts(posts: WebzPost[]): Promise<void> {
		try {
			if (!Array.isArray(posts)) {
				throw new Error(`Expected posts to be an array, got: ${typeof posts}`);
			}

			logger.info(`Processing ${posts.length} posts for storage`);

			const entities = posts.map((post) => {
				const entity = new Post();
				entity.title = post.title || "No Title";
				entity.text = post.text || "";
				entity.url = post.url || "";
				entity.publishedAt = new Date(post.published);
				entity.externalId = post.uuid;
				entity.metadata = {
					author: post.author || "Unknown",
					language: post.language || "unknown",
					site: post.thread.site || "",
					siteFull: post.thread.site_full || "",
					highlightText: post.highlightText,
					highlightTitle: post.highlightTitle,
					sentiment: post.sentiment,
					categories: post.categories,
					entities: post.entities,
				};
				return entity;
			});

			await this.repository.save(entities);
			logger.info(`Successfully stored ${entities.length} posts`);
		} catch (error) {
			logger.error("Error storing posts:", error);
			throw error;
		}
	}

	/**
	 * Retrieves stored posts from the database with pagination
	 * @param page Page number (1-based)
	 * @param limit Number of items per page
	 * @returns A tuple containing [posts array, total count]
	 */
	async getPosts(page: number, limit: number): Promise<[Post[], number]> {
		const skip = (page - 1) * limit;

		const [posts, total] = await this.repository.findAndCount({
			skip,
			take: limit,
			order: {
				createdAt: "DESC",
			},
		});

		return [posts, total];
	}
}
