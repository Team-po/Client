import { getAuthSession } from "@/lib/api/auth-session";
import { apiConfig } from "@/lib/api/config";

interface LandingActionLink {
	label: string;
	to: string;
}

interface LandingActionLinks {
	match: LandingActionLink;
	teamSpace: LandingActionLink;
}

export function getLandingActionLinks(): LandingActionLinks {
	const isSignedIn = Boolean(getAuthSession());

	return {
		match: {
			label: "매칭 시작하기",
			to: isSignedIn ? "/match" : "/login?redirect=/match",
		},
		teamSpace: getTeamSpaceLink(isSignedIn),
	};
}

function getTeamSpaceLink(isSignedIn: boolean): LandingActionLink {
	if (isSignedIn) {
		return {
			label: "팀 스페이스 보기",
			to: "/team",
		};
	}

	if (apiConfig.useMocks) {
		return {
			label: "샘플 팀 스페이스 보기",
			to: "/team",
		};
	}

	return {
		label: "로그인하고 팀 스페이스 보기",
		to: "/login?redirect=/team",
	};
}
