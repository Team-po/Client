export interface LoginRequest {
	email: string;
	password: string;
}

export interface SendSignupEmailRequest {
	email: string;
}

export interface ValidateSignupAuthNumberRequest {
	authNumber: number;
	email: string;
}

export interface SessionPayload {
	accessToken: string;
	expiresAt: string;
	refreshToken: string;
}

export type LoginResponse = SessionPayload;

export interface CreateUserRequest {
	email: string;
	level: number;
	nickname: string;
	password: string;
	passwordConfirm: string;
	profileImage: File | null;
}

export interface SignUpRequest {
	email: string;
	level: number;
	nickname: string;
	password: string;
	profileImageKey?: string;
}

export interface ProfileImageUploadUrlRequest {
	contentType: string;
}

export interface ProfileImageUploadUrlResponse {
	contentType: string;
	expiresAt: string;
	formFields: Record<string, string>;
	maxFileSizeBytes: number;
	objectKey: string;
	uploadUrl: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
	expiresAt: string;
}
