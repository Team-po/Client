export interface UserProfile {
	description: string | null;
	email: string;
	level: number;
	nickname: string;
	profileImage: string | null;
	temperature: number;
}

export interface UpdateCurrentUserRequest {
	description: string;
	level: number;
	nickname: string;
	profileImage: File | null;
}

export interface EditPasswordRequest {
	afterPassword: string;
	currentPassword: string;
}

export interface DeleteCurrentUserRequest {
	password: string;
}
