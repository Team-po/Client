import { Composition } from "remotion";

import { TEAM_PO_PR_VIDEO } from "@/features/pr-video/constants";
import { TeamPoPrVideo } from "@/features/pr-video/components/team-po-pr-video";

export function RemotionRoot() {
	return (
		<Composition
			component={TeamPoPrVideo}
			durationInFrames={TEAM_PO_PR_VIDEO.durationInFrames}
			fps={TEAM_PO_PR_VIDEO.fps}
			height={TEAM_PO_PR_VIDEO.height}
			id={TEAM_PO_PR_VIDEO.id}
			width={TEAM_PO_PR_VIDEO.width}
		/>
	);
}
