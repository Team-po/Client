import { lazy, Suspense, useEffect } from "react";
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from "react-router-dom";

const LandingPage = lazy(() =>
	import("@/pages/landing-page").then(({ LandingPage }) => ({
		default: LandingPage,
	})),
);
const LoginPage = lazy(() =>
	import("@/pages/login-page").then(({ LoginPage }) => ({
		default: LoginPage,
	})),
);
const SignupPage = lazy(() =>
	import("@/pages/signup-page").then(({ SignupPage }) => ({
		default: SignupPage,
	})),
);
const PasswordResetPage = lazy(() =>
	import("@/pages/password-reset-page").then(({ PasswordResetPage }) => ({
		default: PasswordResetPage,
	})),
);
const EmailVerificationPage = lazy(() =>
	import("@/pages/email-verification-page").then(
		({ EmailVerificationPage }) => ({
			default: EmailVerificationPage,
		}),
	),
);
const GithubOAuthCallbackPage = lazy(() =>
	import("@/pages/github-oauth-callback-page").then(
		({ GithubOAuthCallbackPage }) => ({
			default: GithubOAuthCallbackPage,
		}),
	),
);
const ProfilePage = lazy(() =>
	import("@/pages/profile-page").then(({ ProfilePage }) => ({
		default: ProfilePage,
	})),
);
const MatchPage = lazy(() =>
	import("@/pages/match-page").then(({ MatchPage }) => ({
		default: MatchPage,
	})),
);
const TeamSpacePage = lazy(() =>
	import("@/pages/team-space-page").then(({ TeamSpacePage }) => ({
		default: TeamSpacePage,
	})),
);
const TeamPoPresentationPage = lazy(() =>
	import("@/pages/team-po-presentation-page").then(
		({ TeamPoPresentationPage }) => ({
			default: TeamPoPresentationPage,
		}),
	),
);
const TeamPoPresentationSecondPage = lazy(() =>
	import("@/pages/team-po-presentation-second-page").then(
		({ TeamPoPresentationSecondPage }) => ({
			default: TeamPoPresentationSecondPage,
		}),
	),
);
const TeamPoPresentationThirdPage = lazy(() =>
	import("@/pages/team-po-presentation-third-page").then(
		({ TeamPoPresentationThirdPage }) => ({
			default: TeamPoPresentationThirdPage,
		}),
	),
);
const TeamPoPresentationFourthPage = lazy(() =>
	import("@/pages/team-po-presentation-fourth-page").then(
		({ TeamPoPresentationFourthPage }) => ({
			default: TeamPoPresentationFourthPage,
		}),
	),
);
const TeamPoPresentationFifthPage = lazy(() =>
	import("@/pages/team-po-presentation-fifth-page").then(
		({ TeamPoPresentationFifthPage }) => ({
			default: TeamPoPresentationFifthPage,
		}),
	),
);
const TeamPoPresentationSixthPage = lazy(() =>
	import("@/pages/team-po-presentation-sixth-page").then(
		({ TeamPoPresentationSixthPage }) => ({
			default: TeamPoPresentationSixthPage,
		}),
	),
);
const TeamPoPresentationSeventhPage = lazy(() =>
	import("@/pages/team-po-presentation-seventh-page").then(
		({ TeamPoPresentationSeventhPage }) => ({
			default: TeamPoPresentationSeventhPage,
		}),
	),
);
const TeamPoPresentationEighthPage = lazy(() =>
	import("@/pages/team-po-presentation-eighth-page").then(
		({ TeamPoPresentationEighthPage }) => ({
			default: TeamPoPresentationEighthPage,
		}),
	),
);
const TeamPoPresentationNinthPage = lazy(() =>
	import("@/pages/team-po-presentation-ninth-page").then(
		({ TeamPoPresentationNinthPage }) => ({
			default: TeamPoPresentationNinthPage,
		}),
	),
);
const TeamPoPresentationTenthPage = lazy(() =>
	import("@/pages/team-po-presentation-tenth-page").then(
		({ TeamPoPresentationTenthPage }) => ({
			default: TeamPoPresentationTenthPage,
		}),
	),
);
const TeamPoPresentationEleventhPage = lazy(() =>
	import("@/pages/team-po-presentation-eleventh-page").then(
		({ TeamPoPresentationEleventhPage }) => ({
			default: TeamPoPresentationEleventhPage,
		}),
	),
);
const TeamPoPresentationTwelfthPage = lazy(() =>
	import("@/pages/team-po-presentation-twelfth-page").then(
		({ TeamPoPresentationTwelfthPage }) => ({
			default: TeamPoPresentationTwelfthPage,
		}),
	),
);
const TeamPoPresentationThirteenthPage = lazy(() =>
	import("@/pages/team-po-presentation-thirteenth-page").then(
		({ TeamPoPresentationThirteenthPage }) => ({
			default: TeamPoPresentationThirteenthPage,
		}),
	),
);
const TeamPoPresentationFourteenthPage = lazy(() =>
	import("@/pages/team-po-presentation-fourteenth-page").then(
		({ TeamPoPresentationFourteenthPage }) => ({
			default: TeamPoPresentationFourteenthPage,
		}),
	),
);

export function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Suspense fallback={<RouteFallback />}>
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/deck/team-po" element={<TeamPoPresentationPage />} />
					<Route
						path="/deck/team-po-2"
						element={<TeamPoPresentationSecondPage />}
					/>
					<Route
						path="/deck/team-po-3"
						element={<TeamPoPresentationThirdPage />}
					/>
					<Route
						path="/deck/team-po-4"
						element={<TeamPoPresentationFourthPage />}
					/>
					<Route
						path="/deck/team-po-5"
						element={<TeamPoPresentationFifthPage />}
					/>
					<Route
						path="/deck/team-po-6"
						element={<TeamPoPresentationSixthPage />}
					/>
					<Route
						path="/deck/team-po-7"
						element={<TeamPoPresentationSeventhPage />}
					/>
					<Route
						path="/deck/team-po-8"
						element={<TeamPoPresentationEighthPage />}
					/>
					<Route
						path="/deck/team-po-9"
						element={<TeamPoPresentationNinthPage />}
					/>
					<Route
						path="/deck/team-po-10"
						element={<TeamPoPresentationTenthPage />}
					/>
					<Route
						path="/deck/team-po-11"
						element={<TeamPoPresentationEleventhPage />}
					/>
					<Route
						path="/deck/team-po-12"
						element={<TeamPoPresentationTwelfthPage />}
					/>
					<Route
						path="/deck/team-po-13"
						element={<TeamPoPresentationThirteenthPage />}
					/>
					<Route
						path="/deck/team-po-14"
						element={<TeamPoPresentationFourteenthPage />}
					/>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
					<Route path="/password-reset" element={<PasswordResetPage />} />
					<Route path="/verify-email" element={<EmailVerificationPage />} />
					<Route
						path="/oauth/github/callback"
						element={<GithubOAuthCallbackPage />}
					/>
					<Route path="/me" element={<ProfilePage />} />
					<Route path="/match" element={<MatchPage />} />
					<Route path="/team" element={<TeamSpacePage />} />
					<Route path="*" element={<Navigate replace to="/" />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

function RouteFallback() {
	return (
		<div className="grid min-h-screen place-items-center bg-background px-4 text-sm font-medium text-muted-foreground">
			화면을 불러오고 있어요.
		</div>
	);
}

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		if (pathname) {
			window.scrollTo({ left: 0, top: 0 });
		}
	}, [pathname]);

	return null;
}
