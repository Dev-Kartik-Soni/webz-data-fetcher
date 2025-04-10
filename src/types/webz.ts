// Webz.io API response types
export interface WebzThread {
	uuid: string;
	url: string;
	site_full: string;
	site: string;
	site_section: string;
	site_categories: string[];
	section_title: string;
	title: string;
	title_full: string;
	published: string;
	country: string;
	site_type: string;
}

export interface WebzEntities {
	persons: Array<{ name: string; sentiment: string }>;
	organizations: Array<{ name: string; sentiment: string }>;
	locations: Array<{ name: string; sentiment: string }>;
}

export interface WebzPost {
	thread: WebzThread;
	uuid: string;
	url: string;
	title: string;
	text: string;
	published: string;
	author: string;
	language: string;
	sentiment: string;
	categories: string[];
	highlightText?: string;
	highlightTitle?: string;
	entities: WebzEntities;
}

export interface WebzResponse {
	posts: WebzPost[];
	totalResults: number;
	moreResultsAvailable: number;
	next: string;
	requestsLeft: number;
}
