export const ENV = {
   DATABASE_URL = process.env.DATABASE_URL as string,
   OHGO_API_KEY = process.env.OHGO_API_KEY as string,
}

if (!ENV.DATABASE_URL || !ENV.OHGO_API_KEY) {
   console.error("CRITICAL: Missing enviornment variables.");
   process.exit(1);
}
