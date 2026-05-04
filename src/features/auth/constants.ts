export const previewAuth = {
	authNumber: "123456",
	email: "preview@teampo.dev",
	password: "teampo123!",
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
