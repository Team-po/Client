import { useEffect } from "react";
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from "react-router-dom";

import { EmailVerificationPage } from "@/pages/email-verification-page";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { MatchPage } from "@/pages/match-page";
import { ProfilePage } from "@/pages/profile-page";
import { TeamPoPresentationEighthPage } from "@/pages/team-po-presentation-eighth-page";
import { TeamPoPresentationFourthPage } from "@/pages/team-po-presentation-fourth-page";
import { TeamPoPresentationNinthPage } from "@/pages/team-po-presentation-ninth-page";
import { SignupPage } from "@/pages/signup-page";
import { TeamPoPresentationPage } from "@/pages/team-po-presentation-page";
import { TeamPoPresentationSecondPage } from "@/pages/team-po-presentation-second-page";
import { TeamPoPresentationThirdPage } from "@/pages/team-po-presentation-third-page";
import { TeamPoPresentationFifthPage } from "@/pages/team-po-presentation-fifth-page";
import { TeamPoPresentationSeventhPage } from "@/pages/team-po-presentation-seventh-page";
import { TeamPoPresentationSixthPage } from "@/pages/team-po-presentation-sixth-page";
import { TeamSpacePage } from "@/pages/team-space-page";
import { TeamPoPresentationTenthPage } from "@/pages/team-po-presentation-tenth-page";

export function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
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
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/verify-email" element={<EmailVerificationPage />} />
				<Route path="/me" element={<ProfilePage />} />
				<Route path="/match" element={<MatchPage />} />
				<Route path="/team" element={<TeamSpacePage />} />
				<Route path="*" element={<Navigate replace to="/" />} />
			</Routes>
		</BrowserRouter>
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
