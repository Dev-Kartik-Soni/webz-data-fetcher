export class WebzQueryBuilder {
	private params: Record<string, string | number | boolean> = {};

	setQuery(query: string): WebzQueryBuilder {
		this.params.q = query;
		return this;
	}

	setSize(size: number): WebzQueryBuilder {
		this.params.size = size;
		return this;
	}

	setSort(sort: "crawled" | "published" | "relevancy"): WebzQueryBuilder {
		this.params.sort = sort;
		return this;
	}

	setSortDirection(direction: "asc" | "desc"): WebzQueryBuilder {
		this.params.order = direction;
		return this;
	}

	setTs(ts: number): WebzQueryBuilder {
		this.params.ts = ts;
		return this;
	}

	setHighlight(highlight: boolean): WebzQueryBuilder {
		this.params.highlight = highlight;
		return this;
	}

	build(): Record<string, string | number | boolean> {
		return { ...this.params };
	}
}
