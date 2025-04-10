import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from "typeorm";

interface PostMetadata {
	author: string;
	language: string;
	site: string;
	siteFull: string;
	highlightText?: string;
	highlightTitle?: string;
	sentiment: string;
	categories: string[];
	entities: {
		persons: Array<{ name: string; sentiment: string }>;
		organizations: Array<{ name: string; sentiment: string }>;
		locations: Array<{ name: string; sentiment: string }>;
	};
}

@Entity("posts")
export class Post {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	externalId!: string;

	@Column()
	title!: string;

	@Column("text")
	text!: string;

	@Column()
	url!: string;

	@Column({ name: "published_at", type: "timestamp with time zone" })
	publishedAt!: Date;

	@Column("jsonb")
	metadata!: PostMetadata;

	@CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
	createdAt!: Date;
}
