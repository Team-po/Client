import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { AuthShell } from "@/features/auth/components/auth-shell";

export function EmailVerificationView() {
	return (
		<AuthShell
			badge="Verified"
			description="이제 로그인하고 매칭에 사용할 프로필을 확인할 수 있습니다."
			title="계정 준비가 끝났습니다"
		>
			<div className="rounded-lg border border-emerald-500/25 bg-emerald-50 p-5">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-crisp">
						<CheckCircle2 className="size-5" />
					</div>
					<div>
						<p className="font-semibold text-emerald-800">
							이메일 인증이 완료되었습니다
						</p>
						<p className="mt-1 text-sm leading-6 text-emerald-800/75">
							로그인 후 프로필을 정리하면 매칭 카드가 더 명확해집니다.
						</p>
					</div>
				</div>
			</div>

			<div className="mt-5 rounded-lg border border-border/70 bg-brand-warm p-5">
				<div className="flex items-start gap-3">
					<ShieldCheck className="mt-0.5 size-5 text-primary" />
					<p className="text-sm leading-6 text-muted-foreground">
						프로필 이미지, 닉네임, 레벨은 팀 후보가 나를 빠르게 이해하는 데
						사용됩니다.
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
