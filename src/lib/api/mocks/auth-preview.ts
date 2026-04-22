import type { UserProfile } from "@/lib/types/user";

export const previewAuthSeed = {
	email: "preview@teampo.dev",
	nickname: "queue_runner",
	password: "teampo123!",
	profileImage: "https://i.pravatar.cc/240?img=12",
};

export function createPreviewUser(
	overrides: Partial<UserProfile> = {},
): UserProfile {
	return {
		description: "빠르게 실험하고, 팀원과 맥락을 맞추는 일을 좋아합니다.",
		email: previewAuthSeed.email,
		level: 3,
		nickname: previewAuthSeed.nickname,
		profileImage: previewAuthSeed.profileImage,
		temperature: 50,
		...overrides,
	};
}
