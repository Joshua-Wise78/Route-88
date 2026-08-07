import {
	pgTable,
	varchar,
	timestamp,
	jsonb,
	text,
	doublePrecision,
} from "drizzle-orm/pg-core";

export const apiCacheState = pgTable("api_cache_state", {
	endpoint: varchar("endpoint", { length: 100 }).primaryKey(),
	etag: varchar("etag", { length: 100 }).notNull(),
	lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const roadEvents = pgTable("road_events", {
	id: varchar("id", { length: 100 }).primaryKey(),
	eventType: varchar("event_type", { length: 50 }).notNull(),
	location: text("location"),
	description: text("description"),
	latitude: doublePrecision("latitude"),
	longitude: doublePrecision("longitude"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),

	rawPayload: jsonb("raw_payload").notNull(),
});
