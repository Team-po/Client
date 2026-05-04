export interface LoginFormValues {
	email: string;
	password: string;
}

export interface SignupFormValues {
	email: string;
	level: number;
	nickname: string;
	password: string;
	passwordConfirm: string;
	profileImage: File | null;
}

export interface VerifyEmailFormValues {
	authNumber: string;
	email: string;
}

export interface ProfileEditFormValues {
	description: string;
	level: number;
	nickname: string;
	profileImage: File | null;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;
const minimumNicknameLength = 2;
const maximumNicknameLength = 24;
const maximumProfileImageSize = 5 * 1024 * 1024;
const maximumDescriptionLength = 500;

export function validateLoginForm(
	values: LoginFormValues,
): FormErrors<LoginFormValues> {
	return {
		email: getEmailError(values.email),
		password: getPasswordError(values.password),
	};
}

export function validateSignupForm(
	values: SignupFormValues,
): FormErrors<SignupFormValues> {
	return {
		email: getEmailError(values.email),
		level: getLevelError(values.level),
		nickname: getNicknameError(values.nickname),
		password: getPasswordError(values.password),
		passwordConfirm: getPasswordConfirmError(
			values.password,
			values.passwordConfirm,
		),
		profileImage: getProfileImageError(values.profileImage),
	};
}

export function validateVerifyEmailForm(
	values: VerifyEmailFormValues,
): FormErrors<VerifyEmailFormValues> {
	return {
		authNumber: getAuthNumberError(values.authNumber),
		email: getEmailError(values.email),
	};
}

export function validateProfileEditForm(
	values: ProfileEditFormValues,
): FormErrors<ProfileEditFormValues> {
	return {
		description: getDescriptionError(values.description),
		level: getLevelError(values.level),
		nickname: getNicknameError(values.nickname),
		profileImage: getProfileImageError(values.profileImage),
	};
}

export function hasValidationErrors<T>(errors: FormErrors<T>) {
	return Object.values(errors).some(Boolean);
}

function getEmailError(value: string) {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return "이메일을 입력해 주세요.";
	}

	if (!emailPattern.test(trimmedValue)) {
		return "올바른 이메일 형식이 아니에요.";
	}

	return undefined;
}

function getPasswordError(value: string) {
	if (!value) {
		return "비밀번호를 입력해 주세요.";
	}

	if (value.length < minimumPasswordLength) {
		return "비밀번호는 8자 이상이어야 해요.";
	}

	return undefined;
}

function getPasswordConfirmError(password: string, passwordConfirm: string) {
	if (!passwordConfirm) {
		return "비밀번호 확인을 입력해 주세요.";
	}

	if (password !== passwordConfirm) {
		return "비밀번호가 일치하지 않아요.";
	}

	return undefined;
}

function getNicknameError(value: string) {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return "닉네임을 입력해 주세요.";
	}

	if (trimmedValue.length < minimumNicknameLength) {
		return "닉네임은 2자 이상이어야 해요.";
	}

	if (trimmedValue.length > maximumNicknameLength) {
		return "닉네임은 24자 이하여야 해요.";
	}

	return undefined;
}

function getProfileImageError(file: File | null) {
	if (!file) {
		return undefined;
	}

	if (!file.type.startsWith("image/")) {
		return "이미지 파일만 선택할 수 있어요.";
	}

	if (file.size > maximumProfileImageSize) {
		return "프로필 이미지는 5MB 이하만 업로드할 수 있어요.";
	}

	return undefined;
}

function getLevelError(value: number) {
	if (!Number.isInteger(value)) {
		return "레벨을 선택해 주세요.";
	}

	if (value < 1 || value > 5) {
		return "레벨은 1부터 5까지 선택할 수 있어요.";
	}

	return undefined;
}

function getDescriptionError(value: string) {
	if (value.length > maximumDescriptionLength) {
		return "소개는 500자 이하여야 해요.";
	}

	return undefined;
}

function getAuthNumberError(value: string) {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return "인증번호를 입력해 주세요.";
	}

	if (!/^\d{6}$/.test(trimmedValue)) {
		return "인증번호는 6자리 숫자여야 해요.";
	}

	return undefined;
}

export function getDeleteConfirmationError(value: string) {
	if (!value.trim()) {
		return "확인 문구를 입력해 주세요.";
	}

	if (value.trim() !== "회원 탈퇴") {
		return "`회원 탈퇴`를 정확히 입력해 주세요.";
	}

	return undefined;
}
