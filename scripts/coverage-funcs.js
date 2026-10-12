import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coverageFile = path.resolve(__dirname, "../coverage/coverage-final.json");

if (!fs.existsSync(coverageFile)) {
	console.log("No coverage file found. Run tests with coverage first.");
	process.exit(1);
}

const cov = JSON.parse(fs.readFileSync(coverageFile, "utf-8"));

for (const [file, info] of Object.entries(cov)) {
	// Only inspect application source code
	if (!file.includes("/src/")) continue;

	const relPath = file.split("/src/")[1];
	console.log(`\n\x1b[1msrc/${relPath}\x1b[0m`);

	Object.entries(info.fnMap).forEach(([id, fn]) => {
		const calls = info.f[id];
		const isCovered = calls > 0;
		const symbol = isCovered ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
		const countColor = isCovered ? "\x1b[32m" : "\x1b[31m";

		console.log(
			`  ${symbol} ${fn.name || "(anonymous)"} [line ${fn.decl.start.line}]: ${countColor}${calls}x\x1b[0m`,
		);
	});
}
console.log();
