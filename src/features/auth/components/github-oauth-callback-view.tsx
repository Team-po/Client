import { useCallback, useEffect, useRef, useState } from "react";
import {
	ArrowRight,
	CircleCheck,
	Github,
	LoaderCircle,
	RefreshCcw,
	ShieldAlert,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useGithubOAuthTokenMutation } from "@/features/auth/hooks/use-auth-queries";
import { getApiErrorMessage } from "@/lib/api/client";

const levelOptions = [1, 2, 3, 4, 5] as const;

export function GithubOAuthCallbackView() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const code = searchParams.get("code")?.trim() ?? "";
	const onboardingRequired = searchParams.get("onboardingRequired") === "true";
	const githubLinkedParam = searchParams.get("githubLinked");
	const githubLinkResult =
		githubLinkedParam === null
			? null
			: {
					errorCode: searchParams.get("error"),
					linked: githubLinkedParam === "true",
				};
	const [level, setLevel] = useState(3);
	const [touchedLevel, setTouchedLevel] = useState(false);
	const {
		error: exchangeError,
		isPending: isExchangePending,
		mutateAsync: exchangeGithubOAuthCode,
	} = useGithubOAuthTokenMutation();
	const hasStartedExchangeRef = useRef(false);
	const isCallbackInvalid = !code && !githubLinkResult;
	const levelError =
		Number.isInteger(level) && level >= 1 && level <= 5
			? undefined
			: "레벨은 1부터 5까지 선택할 수 있어요.";

	const exchangeGithubCode = useCallback(
		async (selectedLevel?: number) => {
			await exchangeGithubOAuthCode({
				code,
				...(selectedLevel ? { level: selectedLevel } : {}),
			});
			navigate("/me", { replace: true });
		},
		[code, exchangeGithubOAuthCode, navigate],
	);

	useEffect(() => {
		if (
			isCallbackInvalid ||
			githubLinkResult ||
			onboardingRequired ||
			hasStartedExchangeRef.current
		) {
			return;
		}

		hasStartedExchangeRef.current = true;

		void exchangeGithubCode().catch(() => {
			hasStartedExchangeRef.current = false;
		});
	}, [
		exchangeGithubCode,
		githubLinkResult,
		isCallbackInvalid,
		onboardingRequired,
	]);

	async function handleOnboardingSubmit(
		event: React.FormEvent<HTMLFormElement>,
	) {
		event.preventDefault();
		setTouchedLevel(true);

		if (levelError) {
			return;
		}

		await exchangeGithubCode(level);
	}

	return (
		<AuthShell
			badge="GitHub Login"
			description={
				githubLinkResult
					? githubLinkResult.linked
						? "GitHub 계정을 연결했어요."
						: "GitHub 계정을 연결하지 못했어요."
					: onboardingRequired
						? "매칭에 쓸 개발 레벨만 선택해 주세요."
						: "GitHub 인증 결과를 확인하고 있어요."
			}
			title={
				githubLinkResult
					? githubLinkResult.linked
						? "GitHub 연결 완료"
						: "GitHub 연결 실패"
					: onboardingRequired
						? "거의 다 왔어요"
						: "GitHub 로그인 중"
			}
		>
			{githubLinkResult ? (
				<div className="flex flex-col gap-5">
					<div className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/35 p-4">
						{githubLinkResult.linked ? (
							<CircleCheck
								className="size-5 text-emerald-600"
								aria-hidden="true"
							/>
						) : (
							<ShieldAlert
								className="size-5 text-rose-600"
								aria-hidden="true"
							/>
						)}
						<p className="text-sm text-muted-foreground">
							{githubLinkResult.linked
								? "내 정보에서 연결된 계정을 확인할 수 있어요."
								: getGithubLinkErrorMessage(githubLinkResult.errorCode)}
						</p>
					</div>
					<Button asChild size="lg">
						<Link to="/me">
							<ArrowRight data-icon="inline-start" />내 정보로 이동
						</Link>
					</Button>
				</div>
			) : isCallbackInvalid ? (
				<div className="flex flex-col gap-5">
					<FieldError>
						GitHub 인증 정보가 없어요. 로그인 화면에서 다시 시작해 주세요.
					</FieldError>
					<Button asChild size="lg">
						<Link to="/login">
							<ArrowRight data-icon="inline-start" />
							로그인으로 이동
						</Link>
					</Button>
				</div>
			) : onboardingRequired ? (
				<form
					className="flex flex-col gap-6"
					onSubmit={(event) => void handleOnboardingSubmit(event)}
				>
					<FieldGroup>
						<Field data-invalid={Boolean(touchedLevel && levelError)}>
							<FieldLabel>개발 레벨</FieldLabel>
							<div className="grid grid-cols-5 gap-2">
								{levelOptions.map((option) => (
									<Button
										aria-pressed={level === option}
										key={option}
										onClick={() => {
											setTouchedLevel(true);
											setLevel(option);
										}}
										type="button"
										variant={level === option ? "default" : "outline"}
									>
										Lv.{option}
									</Button>
								))}
							</div>
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>배우는 중</span>
								<span>익숙하게 구현</span>
							</div>
							{touchedLevel && levelError ? (
								<FieldError>{levelError}</FieldError>
							) : (
								<FieldDescription>
									GitHub 닉네임과 이메일로 계정을 만들어요.
								</FieldDescription>
							)}
						</Field>
					</FieldGroup>

					{exchangeError ? (
						<FieldError>{getApiErrorMessage(exchangeError)}</FieldError>
					) : null}

					<Button
						disabled={isExchangePending || Boolean(levelError)}
						size="lg"
						type="submit"
					>
						{isExchangePending ? (
							<LoaderCircle className="animate-spin" data-icon="inline-start" />
						) : (
							<Github data-icon="inline-start" />
						)}
						GitHub 계정으로 시작하기
					</Button>
				</form>
			) : (
				<div className="flex flex-col gap-5">
					<div className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/35 p-4">
						{isExchangePending ? (
							<LoaderCircle
								className="size-5 animate-spin text-primary"
								aria-hidden="true"
							/>
						) : (
							<Github className="size-5 text-primary" aria-hidden="true" />
						)}
						<p className="text-sm text-muted-foreground">
							인증 정보를 확인하고 있어요.
						</p>
					</div>

					{exchangeError ? (
						<FieldError>{getApiErrorMessage(exchangeError)}</FieldError>
					) : null}

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							disabled={isExchangePending}
							onClick={() => void exchangeGithubCode()}
							type="button"
							variant="outline"
						>
							{isExchangePending ? (
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
							) : (
								<RefreshCcw data-icon="inline-start" />
							)}
							다시 시도
						</Button>
						<Button asChild variant="link">
							<Link to="/login">로그인으로 돌아가기</Link>
						</Button>
					</div>
				</div>
			)}
		</AuthShell>
	);
}

function getGithubLinkErrorMessage(errorCode: string | null) {
	switch (errorCode) {
		case "GITHUB_ACCOUNT_ALREADY_LINKED":
			return "이미 GitHub 계정이 연결되어 있어요.";
		case "GITHUB_ACCOUNT_LINKED_TO_ANOTHER_USER":
			return "다른 사용자가 연결한 GitHub 계정이에요.";
		case "INVALID_GITHUB_OAUTH_LINK_STATE":
			return "GitHub 연결 요청이 만료되었거나 올바르지 않아요.";
		default:
			return "GitHub 연결 결과를 확인할 수 없어요.";
	}
}
