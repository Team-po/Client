import type { UserProfile } from "@/lib/types/user";

export const previewAuthSeed = {
	email: "preview@teampo.dev",
	nickname: "queue_runner",
	password: "teampo123!",
	profileImageUrl: "https://i.pravatar.cc/240?img=12",
	userId: "user_preview_001",
	verificationToken: "TEAMPO-2026",
};

export function createPreviewUser(
	overrides: Partial<UserProfile> = {},
): UserProfile {
	return {
		createdAt: "2026-03-08T09:00:00.000Z",
		email: previewAuthSeed.email,
		emailVerified: false,
		id: previewAuthSeed.userId,
		nickname: previewAuthSeed.nickname,
		profileImageUrl: previewAuthSeed.profileImageUrl,
		verifiedAt: null,
		...overrides,
	};
}
