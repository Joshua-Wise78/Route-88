process.env.NODE_ENV = "test";

process.env.DATABASE_URL =
	"postgres://test_user:test_password@localhost:5432/route88_test";
process.env.API_KEY = "mock-ohgo-api-key";
process.env.OHGO_API_KEY = "mock-ohgo-api-key";
process.env.INTERNAL_API_KEY = "mock-internal-api-key";

process.env.DISCORD_INCIDENTS_WEBHOOK_URL =
	"https://discord.com/api/webhooks/mock/incidents";
process.env.DISCORD_SLOWDOWNS_WEBHOOK_URL =
	"https://discord.com/api/webhooks/mock/slowdowns";
process.env.DISCORD_CONSTRUCION_WEBHOOK_URL =
	"https://discord.com/api/webhooks/mock/construction";
process.env.DISCORD_DAILY_WEBHOOK_URL =
	"https://discord.com/api/webhooks/mock/daily";
