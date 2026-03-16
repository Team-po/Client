import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { EmailVerificationPage } from "@/pages/email-verification-page";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { ProfilePage } from "@/pages/profile-page";
import { SignupPage } from "@/pages/signup-page";
import { TeamPoPresentationPage } from "@/pages/team-po-presentation-page";

export function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/deck/team-po" element={<TeamPoPresentationPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/verify-email" element={<EmailVerificationPage />} />
				<Route path="/me" element={<ProfilePage />} />
				<Route path="*" element={<Navigate replace to="/" />} />
			</Routes>
		</BrowserRouter>
	);
}
