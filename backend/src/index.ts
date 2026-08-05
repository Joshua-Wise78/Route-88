import { env } from "./config/env";
import { ohgoService } from "./services/ohgo";

console.log(env.DISCORD_WEBHOOK_URL);

const data = await ohgoService.getConstruction({
	route: "I-75",
	activeOnly: true,
});

console.log(data);
