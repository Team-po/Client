import { Player } from "@remotion/player";

import { TEAM_PO_PR_VIDEO } from "@/features/pr-video/constants";
import { TeamPoPrVideo } from "@/features/pr-video/components/team-po-pr-video";

export function PrVideoPlayer() {
	return (
		<div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-[0_28px_90px_rgba(15,23,42,0.35)]">
			<Player
				autoPlay
				clickToPlay
				component={TeamPoPrVideo}
				compositionHeight={TEAM_PO_PR_VIDEO.height}
				compositionWidth={TEAM_PO_PR_VIDEO.width}
				controls
				durationInFrames={TEAM_PO_PR_VIDEO.durationInFrames}
				fps={TEAM_PO_PR_VIDEO.fps}
				loop
				style={{ width: "100%" }}
			/>
		</div>
	);
}
