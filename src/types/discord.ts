export enum DiscordColors {
	RED = 16711680,
	ORANGE = 16753920,
	YELLOW = 16776960,
	BLUE = 255,
	GREEN = 65280,
}

export interface DiscordEmbedField {
	name: string;
	value: string;
	inline: boolean;
}

export interface DiscordEmbed {
	title: string;
	description: string;
	color: number;
	fields: DiscordEmbedField[];
	timestamp?: string;
}

export interface DiscordWebhookPayload {
	embeds: DiscordEmbed[];
	content?: string;
}
