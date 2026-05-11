import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Github, LoaderCircle, RefreshCcw } from "lucide-react";
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
	const [level, setLevel] = useState(3);
	const [touchedLevel, setTouchedLevel] = useState(false);
	const {
		error: exchangeError,
		isPending: isExchangePending,
		mutateAsync: exchangeGithubOAuthCode,
	} = useGithubOAuthTokenMutation();
	const hasStartedExchangeRef = useRef(false);
	const isCallbackInvalid = !code;
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
			onboardingRequired ||
			hasStartedExchangeRef.current
		) {
			return;
		}

		hasStartedExchangeRef.current = true;

		void exchangeGithubCode().catch(() => {
			hasStartedExchangeRef.current = false;
		});
	}, [exchangeGithubCode, isCallbackInvalid, onboardingRequired]);

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
				onboardingRequired
					? "GitHub 계정으로 팀 매칭에 합류하기 전에 현재 개발 레벨만 선택해 주세요."
					: "GitHub 인증 결과를 확인하고 Team-po 세션을 준비하고 있습니다."
			}
			title={onboardingRequired ? "거의 다 왔어요" : "GitHub 로그인 중"}
		>
			{isCallbackInvalid ? (
				<div className="flex flex-col gap-5">
					<FieldError>
						GitHub 인증 정보가 없습니다. 로그인 화면에서 다시 시작해 주세요.
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
									GitHub 닉네임과 이메일로 계정이 만들어집니다.
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
							인증 코드를 세션 토큰으로 교환하고 있습니다.
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
