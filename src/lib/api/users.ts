import { apiRequest } from "@/lib/api/client";
import type {
	CreateUserRequest,
	ProfileImageUploadUrlResponse,
	SignUpRequest,
} from "@/lib/types/auth";
import type {
	DeleteCurrentUserRequest,
	EditPasswordRequest,
	UpdateCurrentUserRequest,
	UserProfile,
} from "@/lib/types/user";

export async function createUser(payload: CreateUserRequest) {
	const profileImageKey = payload.profileImage
		? await uploadProfileImageForSignUp(payload.profileImage)
		: undefined;

	return apiRequest<void>("/users/sign-up", {
		json: {
			email: payload.email.trim(),
			level: payload.level,
			nickname: payload.nickname.trim(),
			password: payload.password,
			profileImageKey,
		} satisfies SignUpRequest,
		method: "POST",
		skipAuth: true,
	});
}

export function getCurrentUser() {
	return apiRequest<UserProfile>("/users/me");
}

export async function updateCurrentUser(payload: UpdateCurrentUserRequest) {
	const profileImageKey = payload.profileImage
		? await uploadProfileImageForProfile(payload.profileImage)
		: undefined;

	return apiRequest<void>("/users/me", {
		json: {
			description: payload.description.trim() || null,
			level: payload.level,
			nickname: payload.nickname.trim(),
			profileImageKey,
		},
		method: "PUT",
	});
}

export function editPassword(payload: EditPasswordRequest) {
	return apiRequest<void>("/users/me/password", {
		json: payload,
		method: "PUT",
	});
}

export function deleteCurrentUser(payload: DeleteCurrentUserRequest) {
	return apiRequest<void>("/users/me", {
		json: payload,
		method: "DELETE",
	});
}

export function checkEmailDuplicate(email: string) {
	const query = new URLSearchParams({ email: email.trim() });

	return apiRequest<void>(`/users/check-email?${query.toString()}`, {
		skipAuth: true,
	});
}

async function uploadProfileImageForSignUp(file: File) {
	const presignedPost = await createSignUpProfileImageUploadUrl(file.type);
	await uploadProfileImage(file, presignedPost);
	return presignedPost.objectKey;
}

async function uploadProfileImageForProfile(file: File) {
	const presignedPost = await createProfileImageUploadUrl(file.type);
	await uploadProfileImage(file, presignedPost);
	return presignedPost.objectKey;
}

function createSignUpProfileImageUploadUrl(contentType: string) {
	return apiRequest<ProfileImageUploadUrlResponse>(
		"/users/profile-image/upload-url",
		{
			json: { contentType },
			method: "POST",
			skipAuth: true,
		},
	);
}

function createProfileImageUploadUrl(contentType: string) {
	return apiRequest<ProfileImageUploadUrlResponse>(
		"/users/me/profile-image/upload-url",
		{
			json: { contentType },
			method: "POST",
		},
	);
}

async function uploadProfileImage(
	file: File,
	presignedPost: ProfileImageUploadUrlResponse,
) {
	const formData = new FormData();

	for (const [key, value] of Object.entries(presignedPost.formFields)) {
		formData.append(key, value);
	}

	formData.append("file", file);

	const response = await fetch(presignedPost.uploadUrl, {
		body: formData,
		method: "POST",
	});

	if (!response.ok) {
		throw new Error("프로필 이미지 업로드에 실패했습니다.");
	}
}
