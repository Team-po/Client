import {
	type QueryClient,
	type QueryKey,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

import { matchQueryKeys } from "@/features/match/hooks/use-match-queries";
import { projectGroupQueryKeys } from "@/features/project-groups/hooks/use-project-group-queries";
import {
	exchangeGithubOAuthCode,
	login,
	requestPasswordReset,
	resetPassword,
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
	RequestPasswordResetRequest,
	ResetPasswordRequest,
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

function clearQueryData(queryClient: QueryClient, queryKey: QueryKey) {
	const filters = { queryKey };

	for (const query of queryClient.getQueryCache().findAll(filters)) {
		query.reset();
	}

	queryClient.removeQueries(filters);
}

export function clearAuthScopedQueryData(queryClient: QueryClient) {
	clearQueryData(queryClient, authQueryKeys.currentUser);
	clearQueryData(queryClient, matchQueryKeys.all);
	clearQueryData(queryClient, projectGroupQueryKeys.all);
}

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
			clearAuthScopedQueryData(queryClient);
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
			clearAuthScopedQueryData(queryClient);
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

export function useRequestPasswordResetMutation() {
	return useMutation({
		mutationFn: (payload: RequestPasswordResetRequest) =>
			requestPasswordReset(payload),
	});
}

export function useResetPasswordMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ResetPasswordRequest) => resetPassword(payload),
		onSuccess: () => {
			clearAuthSession();
			clearAuthScopedQueryData(queryClient);
		},
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
			clearAuthScopedQueryData(queryClient);
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
			clearAuthScopedQueryData(queryClient);
		},
	});
}
