CREATE TABLE "api_cache_state" (
	"endpoint" varchar(100) PRIMARY KEY NOT NULL,
	"etag" varchar(100) NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "road_events" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"location" text,
	"description" text,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"raw_payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "payload_idx" ON "road_events" USING gin ("raw_payload");