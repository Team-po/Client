export const previewAuth = {
	email: "preview@teampo.dev",
	password: "teampo123!",
	verificationToken: "TEAMPO-2026",
};

export function getProfileFallback(value: string) {
	const cleanedValue = value.trim();

	if (!cleanedValue) {
		return "MQ";
	}

	return cleanedValue
		.split(/[\s@._-]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}
