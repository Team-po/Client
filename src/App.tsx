import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { EmailVerificationPage } from "@/pages/email-verification-page";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { ProfilePage } from "@/pages/profile-page";
import { TeamPoPresentationFourthPage } from "@/pages/team-po-presentation-fourth-page";
import { SignupPage } from "@/pages/signup-page";
import { TeamPoPresentationPage } from "@/pages/team-po-presentation-page";
import { TeamPoPresentationSecondPage } from "@/pages/team-po-presentation-second-page";
import { TeamPoPresentationThirdPage } from "@/pages/team-po-presentation-third-page";
import { TeamPoPresentationFifthPage } from "@/pages/team-po-presentation-fifth-page";
import { TeamPoPresentationSixthPage } from "@/pages/team-po-presentation-sixth-page";

export function App() {
	return (
		<BrowserRouter>
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
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/verify-email" element={<EmailVerificationPage />} />
				<Route path="/me" element={<ProfilePage />} />
				<Route path="*" element={<Navigate replace to="/" />} />
			</Routes>
		</BrowserRouter>
	);
}
