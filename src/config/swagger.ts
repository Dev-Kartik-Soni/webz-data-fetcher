import swaggerJsdoc from "swagger-jsdoc";

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Webz Data Fetcher API",
			version: "1.0.0",
			description: "API documentation for the Webz Data Fetcher service",
			contact: {
				name: "API Support",
				email: "support@example.com",
			},
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Development server",
			},
		],
		components: {
			schemas: {
				WebzQuery: {
					type: "object",
					properties: {
						query: {
							type: "string",
							description: "Search query string",
							example:
								'Google topic:"financial and economic news" sentiment:negative',
						},
						size: {
							type: "number",
							description: "Number of results to return",
							example: 10,
						},
						sort: {
							type: "string",
							description: "Sort field",
							example: "relevancy",
						},
						sortDirection: {
							type: "string",
							enum: ["asc", "desc"],
							description: "Sort direction",
							example: "desc",
						},
						highlight: {
							type: "boolean",
							description: "Enable highlighting in results",
							example: true,
						},
					},
				},
				Post: {
					type: "object",
					properties: {
						id: {
							type: "string",
							description: "Unique identifier of the post",
						},
						title: {
							type: "string",
							description: "Title of the post",
						},
						content: {
							type: "string",
							description: "Content of the post",
						},
						sentiment: {
							type: "string",
							description: "Sentiment analysis result",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "Creation timestamp",
						},
					},
				},
				Error: {
					type: "object",
					properties: {
						code: {
							type: "string",
						},
						message: {
							type: "string",
						},
					},
				},
			},
		},
	},
	apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Path to the API routes
};

export const specs = swaggerJsdoc(options);
