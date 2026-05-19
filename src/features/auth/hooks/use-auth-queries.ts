import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	exchangeGithubOAuthCode,
	login,
	sendSignupEmail,
	startGithubAccountLink,
	unlinkGithubAccount,
	validateSignupAuthNumber,
} from "@/lib/api/auth";
import {
	clearAuthSession,
	getAuthSession,
	setAuthSession,
} from "@/lib/api/auth-session";
import {
	checkEmailDuplicate,
	createUser,
	deleteCurrentUser,
	editPassword,
	getCurrentUser,
	sendDeleteUserEmail,
	updateCurrentUser,
	validateDeleteUserEmail,
} from "@/lib/api/users";
import type {
	CreateUserRequest,
	GithubOAuthTokenRequest,
	LoginRequest,
	SendSignupEmailRequest,
	ValidateSignupAuthNumberRequest,
} from "@/lib/types/auth";
import type {
	EditPasswordRequest,
	UpdateCurrentUserRequest,
	UserProfile,
	ValidateDeleteUserEmailRequest,
} from "@/lib/types/user";

const authQueryKeys = {
	currentUser: ["users", "me"] as const,
};

export function useCurrentUserQuery() {
	return useQuery({
		enabled: Boolean(getAuthSession()),
		queryFn: () => getCurrentUser(),
		queryKey: authQueryKeys.currentUser,
	});
}

export function useLoginMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: LoginRequest) => login(payload),
		onSuccess: (response) => {
			setAuthSession(response);
			queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
		},
	});
}

export function useGithubOAuthTokenMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: GithubOAuthTokenRequest) =>
			exchangeGithubOAuthCode(payload),
		onSuccess: (response) => {
			setAuthSession(response);
			queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
		},
	});
}

export function useStartGithubAccountLinkMutation() {
	return useMutation({
		mutationFn: () => startGithubAccountLink(),
	});
}

export function useUnlinkGithubAccountMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => unlinkGithubAccount(),
		onSuccess: () => {
			queryClient.setQueryData<UserProfile | undefined>(
				authQueryKeys.currentUser,
				(current) =>
					current
						? {
								...current,
								githubUsername: null,
								isGithubLinked: false,
							}
						: current,
			);
			queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
		},
	});
}

export function useSignupMutation() {
	return useMutation({
		mutationFn: (payload: CreateUserRequest) => createUser(payload),
	});
}

export function useCheckEmailDuplicateMutation() {
	return useMutation({
		mutationFn: (email: string) => checkEmailDuplicate(email),
	});
}

export function useSendSignupEmailMutation() {
	return useMutation({
		mutationFn: (payload: SendSignupEmailRequest) => sendSignupEmail(payload),
	});
}

export function useValidateSignupAuthNumberMutation() {
	return useMutation({
		mutationFn: (payload: ValidateSignupAuthNumberRequest) =>
			validateSignupAuthNumber(payload),
	});
}

export function useUpdateCurrentUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateCurrentUserRequest) =>
			updateCurrentUser(payload),
		onSuccess: (_, payload) => {
			queryClient.setQueryData<UserProfile | undefined>(
				authQueryKeys.currentUser,
				(current) =>
					current
						? {
								...current,
								description: payload.description.trim() || null,
								level: payload.level,
								nickname: payload.nickname.trim(),
							}
						: current,
			);
			queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
		},
	});
}

export function useEditPasswordMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: EditPasswordRequest) => editPassword(payload),
		onSuccess: () => {
			clearAuthSession();
			queryClient.removeQueries({
				queryKey: authQueryKeys.currentUser,
			});
		},
	});
}

export function useSendDeleteUserEmailMutation() {
	return useMutation({
		mutationFn: () => sendDeleteUserEmail(),
	});
}

export function useValidateDeleteUserEmailMutation() {
	return useMutation({
		mutationFn: (payload: ValidateDeleteUserEmailRequest) =>
			validateDeleteUserEmail(payload),
	});
}

export function useDeleteCurrentUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deleteCurrentUser(),
		onSuccess: () => {
			clearAuthSession();
			queryClient.removeQueries({
				queryKey: authQueryKeys.currentUser,
			});
		},
	});
}
