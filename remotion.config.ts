import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";

Config.overrideWebpackConfig((config) => {
	const tailwindConfig = enableTailwind(config);

	return {
		...tailwindConfig,
		resolve: {
			...tailwindConfig.resolve,
			alias: {
				...(tailwindConfig.resolve?.alias ?? {}),
				"@": path.resolve(process.cwd(), "src"),
			},
		},
	};
});
