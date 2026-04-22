import { ArrowRight, MailX } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { AuthShell } from "@/features/auth/components/auth-shell";

export function EmailVerificationView() {
	return (
		<AuthShell
			badge="Account"
			description="가입을 마쳤다면 로그인해서 프로필을 완성하고 매칭 요청을 시작할 수 있습니다."
			title="이제 팀 매칭을 시작할 수 있습니다"
		>
			<div className="rounded-xl border border-border/70 bg-secondary/35 p-5 text-sm leading-6 text-muted-foreground">
				<MailX className="mb-3 size-5 text-primary" />
				프로필을 채워두면 팀원이 내 역할과 경험치를 더 쉽게 파악할 수
				있습니다.
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
