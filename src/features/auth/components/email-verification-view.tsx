import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { AuthShell } from "@/features/auth/components/auth-shell";

export function EmailVerificationView() {
	return (
		<AuthShell
			badge="Verified"
			description="이제 로그인해서 프로필을 확인할 수 있어요."
			title="계정 준비가 끝났어요"
		>
			<div className="rounded-lg border border-emerald-500/25 bg-emerald-50 p-5">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-crisp">
						<CheckCircle2 className="size-5" />
					</div>
					<div>
						<p className="font-semibold text-emerald-800">
							이메일 인증을 마쳤어요
						</p>
						<p className="mt-1 text-sm leading-6 text-emerald-800/75">
							프로필을 채우면 팀원이 나를 더 쉽게 이해해요.
						</p>
					</div>
				</div>
			</div>

			<div className="mt-5 rounded-lg border border-border/70 bg-brand-warm p-5">
				<div className="flex items-start gap-3">
					<ShieldCheck className="mt-0.5 size-5 text-primary" />
					<p className="text-sm leading-6 text-muted-foreground">
						프로필 이미지, 닉네임, 레벨은 매칭 카드에 먼저 보여요.
					</p>
				</div>
			</div>

			<div className="mt-6 flex flex-col gap-3 sm:flex-row">
				<Button asChild>
					<Link to="/login">
						<ArrowRight data-icon="inline-start" />
						로그인으로 이동
					</Link>
				</Button>
				<Button asChild variant="outline">
					<Link to="/signup">회원가입으로 돌아가기</Link>
				</Button>
			</div>
		</AuthShell>
	);
}
