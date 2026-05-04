import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	login,
	sendSignupEmail,
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
	updateCurrentUser,
} from "@/lib/api/users";
import type {
	CreateUserRequest,
	LoginRequest,
	SendSignupEmailRequest,
	ValidateSignupAuthNumberRequest,
} from "@/lib/types/auth";
import type {
	DeleteCurrentUserRequest,
	EditPasswordRequest,
	UpdateCurrentUserRequest,
	UserProfile,
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

export function useDeleteCurrentUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: DeleteCurrentUserRequest) =>
			deleteCurrentUser(payload),
		onSuccess: () => {
			clearAuthSession();
			queryClient.removeQueries({
				queryKey: authQueryKeys.currentUser,
			});
		},
	});
}
