import { z } from "zod";

export const ohgoQuerySchema = z.object({
	region: z.string().optional(),
	radius: z.string().optional(),
	"map-bounds-sw": z.string().optional(),
	"map-bounds-ne": z.string().optional(),
	"page-size": z.coerce.number().optional(),
	page: z.coerce.number().optional(),
	"page-all": z.enum(["true", "false"]).optional(),
	"include-future": z.enum(["true", "false"]).optional(),
	"future-only": z.enum(["true", "false"]).optional(),
});
