import  { AxiosInstance } from "axios";
import { WebzQueryBuilder } from "../services/WebzQueryBuilder";
import { WebzService } from "../services/WebzService";

jest.mock("axios");

describe("WebzService", () => {
	let webzService: WebzService;
	let mockDataSource: any;
	let mockRepository: any;
	let mockAxiosInstance: jest.Mocked<AxiosInstance>;

	beforeEach(() => {
		mockRepository = {
			save: jest.fn(),
		};

		mockDataSource = {
			getRepository: jest.fn().mockReturnValue(mockRepository),
		};

		mockAxiosInstance = {
			get: jest.fn(),
			post: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
			patch: jest.fn(),
			head: jest.fn(),
			options: jest.fn(),
			request: jest.fn(),
			getUri: jest.fn(),
			defaults: {},
			interceptors: {
				request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
				response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
			},
		} as unknown as jest.Mocked<AxiosInstance>;

		webzService = new WebzService(mockDataSource, mockAxiosInstance);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should fetch and store posts successfully", async () => {
		const mockPosts = [
			{
				title: "Test Post",
				text: "Test Content",
				url: "http://test.com",
				published: "2025-04-10T20:47:58+05:45",
				uuid: "123",
				thread: {
					uuid: "123",
					site: "test.com",
					site_full: "http://test.com",
					site_section: "news",
					site_categories: ["tech"],
					section_title: "News",
					title: "Test Post",
					title_full: "Test Post",
					published: "2025-04-10T20:47:58+05:45",
					country: "US",
					site_type: "news",
				},
				author: "Test Author",
				language: "english",
				sentiment: "neutral",
				categories: ["tech"],
				entities: {
					persons: [],
					organizations: [],
					locations: [],
				},
			},
		];

		const mockResponse = {
			data: {
				posts: mockPosts,
				totalResults: 1,
				moreResultsAvailable: 0,
				next: null,
				requestsLeft: 100,
			},
		};

		mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

		const queryBuilder = new WebzQueryBuilder().setQuery("test").setSize(100);

		const callback = jest.fn();

		await webzService.fetchAndStorePosts(queryBuilder, callback);

		expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
		expect(mockRepository.save).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(1, 1);
	});

	it("should handle API errors gracefully", async () => {
		const error = new Error("API Error");
		Object.assign(error, { isAxiosError: true });
		mockAxiosInstance.get.mockRejectedValueOnce(error);

		const queryBuilder = new WebzQueryBuilder().setQuery("test").setSize(100);

		await expect(webzService.fetchAndStorePosts(queryBuilder)).rejects.toThrow(
			"API Error",
		);
	});
});
