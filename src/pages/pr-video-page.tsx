import { ArrowLeft, Film, MonitorPlay } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PrVideoPlayer } from "@/features/pr-video/components/pr-video-player";
import {
	TEAM_PO_PR_VIDEO,
	openingSceneTimeline,
} from "@/features/pr-video/constants";

export function PrVideoPage() {
	return (
		<main className="min-h-screen bg-slate-950 px-5 py-6 text-white sm:px-8 lg:px-10">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
				<header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
					<div>
						<Button
							asChild
							className="mb-6 text-slate-300 hover:bg-white/10 hover:text-white"
							size="sm"
							variant="ghost"
						>
							<Link to="/">
								<ArrowLeft />
								홈으로
							</Link>
						</Button>
						<div className="flex items-center gap-3 text-blue-300">
							<Film size={18} />
							<span className="text-sm font-bold uppercase tracking-normal">
								Team-po PR Video
							</span>
						</div>
						<h1 className="mt-3 text-3xl font-black leading-tight tracking-normal text-white md:text-5xl">
							PR 영상 미리보기
						</h1>
					</div>
					<div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200">
						<MonitorPlay size={18} className="text-emerald-300" />
						{TEAM_PO_PR_VIDEO.width}x{TEAM_PO_PR_VIDEO.height} ·{" "}
						{TEAM_PO_PR_VIDEO.durationInFrames / TEAM_PO_PR_VIDEO.fps}s ·{" "}
						{TEAM_PO_PR_VIDEO.fps}fps
					</div>
				</header>

				<PrVideoPlayer />

				<section className="grid gap-3 md:grid-cols-5">
					{openingSceneTimeline.map((item) => (
						<div
							className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
							key={item.time}
						>
							<p className="text-sm font-black text-blue-300">{item.time}</p>
							<p className="mt-2 text-sm font-semibold leading-relaxed text-slate-200">
								{item.label}
							</p>
						</div>
					))}
				</section>
			</div>
		</main>
	);
}
