import {
	mouseClick,
	pageTurn,
	shutterModern,
	uiSwitch,
	whip,
	whoosh,
} from "@remotion/sfx";
import { Html5Audio, interpolate, Sequence, staticFile } from "remotion";

import { TEAM_PO_PR_VIDEO } from "@/features/pr-video/constants";

type SoundCue = {
	id: string;
	frame: number;
	durationInFrames: number;
	src: string;
	volume: number;
	playbackRate?: number;
};

const at = (seconds: number) => Math.round(seconds * TEAM_PO_PR_VIDEO.fps);

const sceneStarts = {
	opening: 0,
	problem: 5.5,
	matching: 11,
	workspace: 20,
	report: 30,
	closing: 41,
	finale: 50,
} as const;

const atScene = (scene: keyof typeof sceneStarts, seconds: number) =>
	at(sceneStarts[scene] + seconds);

const soundCues: readonly SoundCue[] = [
	{
		id: "opening-prompt-draw",
		frame: atScene("opening", 0.22),
		durationInFrames: 24,
		src: whoosh,
		volume: 0.09,
		playbackRate: 1.18,
	},
	{
		id: "opening-logo-block-one",
		frame: atScene("opening", 0.46),
		durationInFrames: 12,
		src: mouseClick,
		volume: 0.08,
	},
	{
		id: "opening-logo-block-two",
		frame: atScene("opening", 0.6),
		durationInFrames: 12,
		src: mouseClick,
		volume: 0.075,
		playbackRate: 1.08,
	},
	{
		id: "opening-logo-block-three",
		frame: atScene("opening", 0.74),
		durationInFrames: 12,
		src: mouseClick,
		volume: 0.075,
		playbackRate: 1.16,
	},
	{
		id: "opening-team-word-swipe",
		frame: atScene("opening", 1.02),
		durationInFrames: 18,
		src: whip,
		volume: 0.1,
		playbackRate: 1.08,
	},
	{
		id: "opening-po-lock",
		frame: atScene("opening", 1.78),
		durationInFrames: 18,
		src: uiSwitch,
		volume: 0.14,
		playbackRate: 1.02,
	},
	{
		id: "opening-ui-cluster-card",
		frame: atScene("opening", 1.86),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.09,
		playbackRate: 0.95,
	},
	{
		id: "opening-flow-connectors",
		frame: atScene("opening", 2.35),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.07,
		playbackRate: 1.28,
	},
	{
		id: "opening-to-problem-wipe",
		frame: atScene("opening", 5.15),
		durationInFrames: 34,
		src: pageTurn,
		volume: 0.18,
		playbackRate: 0.96,
	},
	{
		id: "problem-board-lands",
		frame: atScene("problem", 0.62),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.08,
		playbackRate: 1.08,
	},
	{
		id: "problem-issue-node-one",
		frame: atScene("problem", 1.0),
		durationInFrames: 14,
		src: mouseClick,
		volume: 0.07,
		playbackRate: 0.92,
	},
	{
		id: "problem-issue-node-two",
		frame: atScene("problem", 1.18),
		durationInFrames: 14,
		src: mouseClick,
		volume: 0.065,
	},
	{
		id: "problem-warning-grid",
		frame: atScene("problem", 1.25),
		durationInFrames: 18,
		src: uiSwitch,
		volume: 0.11,
		playbackRate: 0.9,
	},
	{
		id: "problem-signal-converges",
		frame: atScene("problem", 2.18),
		durationInFrames: 24,
		src: whoosh,
		volume: 0.1,
		playbackRate: 1.2,
	},
	{
		id: "problem-bottleneck-lock",
		frame: atScene("problem", 2.62),
		durationInFrames: 22,
		src: shutterModern,
		volume: 0.11,
		playbackRate: 0.92,
	},
	{
		id: "problem-pain-points-rise",
		frame: atScene("problem", 2.9),
		durationInFrames: 18,
		src: uiSwitch,
		volume: 0.085,
		playbackRate: 1.08,
	},
	{
		id: "matching-scene-reveal",
		frame: atScene("matching", 0),
		durationInFrames: 34,
		src: pageTurn,
		volume: 0.16,
		playbackRate: 1.03,
	},
	{
		id: "matching-request-fields",
		frame: atScene("matching", 1.05),
		durationInFrames: 16,
		src: uiSwitch,
		volume: 0.08,
	},
	{
		id: "matching-request-button",
		frame: atScene("matching", 1.86),
		durationInFrames: 14,
		src: mouseClick,
		volume: 0.13,
	},
	{
		id: "matching-session-scan",
		frame: atScene("matching", 2.25),
		durationInFrames: 28,
		src: whoosh,
		volume: 0.075,
		playbackRate: 1.35,
	},
	{
		id: "matching-profile-selected-one",
		frame: atScene("matching", 2.45),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.08,
		playbackRate: 0.96,
	},
	{
		id: "matching-profile-selected-two",
		frame: atScene("matching", 2.63),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.08,
		playbackRate: 1.04,
	},
	{
		id: "matching-team-panel",
		frame: atScene("matching", 3.2),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.085,
		playbackRate: 0.92,
	},
	{
		id: "workspace-scene-reveal",
		frame: atScene("workspace", 0),
		durationInFrames: 34,
		src: pageTurn,
		volume: 0.15,
		playbackRate: 0.98,
	},
	{
		id: "workspace-window-lands",
		frame: atScene("workspace", 0.62),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.08,
		playbackRate: 1.04,
	},
	{
		id: "workspace-stage-forming",
		frame: atScene("workspace", 1.6),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.075,
	},
	{
		id: "workspace-checklist-one",
		frame: atScene("workspace", 2.0),
		durationInFrames: 14,
		src: mouseClick,
		volume: 0.08,
	},
	{
		id: "workspace-stage-active",
		frame: atScene("workspace", 2.18),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.09,
		playbackRate: 1.04,
	},
	{
		id: "workspace-checklist-two",
		frame: atScene("workspace", 2.36),
		durationInFrames: 14,
		src: mouseClick,
		volume: 0.075,
		playbackRate: 1.06,
	},
	{
		id: "workspace-contract-lift",
		frame: atScene("workspace", 2.55),
		durationInFrames: 24,
		src: whoosh,
		volume: 0.07,
		playbackRate: 1.42,
	},
	{
		id: "workspace-drawer-appears",
		frame: atScene("workspace", 3.35),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.075,
		playbackRate: 0.92,
	},
	{
		id: "workspace-active-confirmed",
		frame: atScene("workspace", 3.62),
		durationInFrames: 18,
		src: uiSwitch,
		volume: 0.09,
		playbackRate: 0.92,
	},
	{
		id: "report-scene-reveal",
		frame: atScene("report", 0),
		durationInFrames: 34,
		src: pageTurn,
		volume: 0.145,
		playbackRate: 1.02,
	},
	{
		id: "report-window-lands",
		frame: atScene("report", 0.62),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.08,
		playbackRate: 0.98,
	},
	{
		id: "report-activity-row",
		frame: atScene("report", 1.55),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.07,
	},
	{
		id: "report-metrics-fill",
		frame: atScene("report", 1.76),
		durationInFrames: 16,
		src: mouseClick,
		volume: 0.08,
		playbackRate: 1.06,
	},
	{
		id: "report-chart-line",
		frame: atScene("report", 1.8),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.07,
		playbackRate: 1.28,
	},
	{
		id: "report-chart-dot",
		frame: atScene("report", 2.72),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.085,
		playbackRate: 1.12,
	},
	{
		id: "report-insight-panel",
		frame: atScene("report", 3.15),
		durationInFrames: 22,
		src: shutterModern,
		volume: 0.085,
		playbackRate: 1.1,
	},
	{
		id: "report-next-action",
		frame: atScene("report", 3.62),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.085,
		playbackRate: 0.9,
	},
	{
		id: "closing-scene-reveal",
		frame: atScene("closing", 0),
		durationInFrames: 30,
		src: pageTurn,
		volume: 0.13,
		playbackRate: 0.92,
	},
	{
		id: "closing-feature-token-first-landing",
		frame: atScene("closing", 0.52),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.06,
		playbackRate: 0.86,
	},
	{
		id: "closing-feature-token-second-landing",
		frame: atScene("closing", 0.74),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.055,
		playbackRate: 0.92,
	},
	{
		id: "closing-ribbon-path-draw",
		frame: atScene("closing", 0.9),
		durationInFrames: 44,
		src: whoosh,
		volume: 0.075,
		playbackRate: 0.78,
	},
	{
		id: "closing-feature-token-third-landing",
		frame: atScene("closing", 0.96),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.06,
		playbackRate: 1,
	},
	{
		id: "closing-feature-token-fourth-landing",
		frame: atScene("closing", 1.18),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.06,
		playbackRate: 1.06,
	},
	{
		id: "closing-headline-line-one",
		frame: atScene("closing", 1.62),
		durationInFrames: 16,
		src: uiSwitch,
		volume: 0.075,
		playbackRate: 0.82,
	},
	{
		id: "closing-headline-line-two",
		frame: atScene("closing", 1.95),
		durationInFrames: 16,
		src: uiSwitch,
		volume: 0.08,
		playbackRate: 0.9,
	},
	{
		id: "closing-headline-line-three",
		frame: atScene("closing", 2.32),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.07,
		playbackRate: 0.82,
	},
	{
		id: "closing-headline-shine-sweep",
		frame: atScene("closing", 3.08),
		durationInFrames: 26,
		src: whip,
		volume: 0.07,
		playbackRate: 0.86,
	},
	{
		id: "closing-body-copy-settle",
		frame: atScene("closing", 3.36),
		durationInFrames: 22,
		src: shutterModern,
		volume: 0.065,
		playbackRate: 0.78,
	},
	{
		id: "closing-flow-comet-pass",
		frame: atScene("closing", 4.72),
		durationInFrames: 38,
		src: whoosh,
		volume: 0.08,
		playbackRate: 0.92,
	},
	{
		id: "closing-feature-pulse-resolve",
		frame: atScene("closing", 5.3),
		durationInFrames: 20,
		src: uiSwitch,
		volume: 0.06,
		playbackRate: 0.82,
	},
	{
		id: "finale-scene-impact",
		frame: atScene("finale", 0),
		durationInFrames: 30,
		src: whip,
		volume: 0.17,
		playbackRate: 0.95,
	},
	{
		id: "finale-block-one",
		frame: atScene("finale", 0.46),
		durationInFrames: 12,
		src: mouseClick,
		volume: 0.08,
		playbackRate: 0.94,
	},
	{
		id: "finale-block-two",
		frame: atScene("finale", 0.6),
		durationInFrames: 12,
		src: mouseClick,
		volume: 0.08,
		playbackRate: 1.04,
	},
	{
		id: "finale-block-three",
		frame: atScene("finale", 0.74),
		durationInFrames: 12,
		src: mouseClick,
		volume: 0.08,
		playbackRate: 1.14,
	},
	{
		id: "finale-team-word",
		frame: atScene("finale", 0.9),
		durationInFrames: 18,
		src: whip,
		volume: 0.105,
		playbackRate: 1.1,
	},
	{
		id: "finale-po-resolve",
		frame: atScene("finale", 1.36),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.095,
		playbackRate: 0.86,
	},
	{
		id: "finale-message-underline",
		frame: atScene("finale", 2.2),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.085,
		playbackRate: 1.22,
	},
	{
		id: "finale-bottom-pulse",
		frame: atScene("finale", 4.2),
		durationInFrames: 18,
		src: uiSwitch,
		volume: 0.09,
		playbackRate: 0.88,
	},
];

export function PrVideoSoundDesign() {
	return (
		<>
			<PrVideoBackgroundMusic />
			{soundCues.map((cue) => (
				<Sequence
					durationInFrames={cue.durationInFrames}
					from={cue.frame}
					key={cue.id}
				>
					<Html5Audio
						name={`sfx:${cue.id}`}
						playbackRate={cue.playbackRate}
						src={cue.src}
						trimAfter={cue.durationInFrames}
						volume={cue.volume}
					/>
				</Sequence>
			))}
		</>
	);
}

function PrVideoBackgroundMusic() {
	return (
		<Html5Audio
			name="bgm:team-po-light-loop"
			src={staticFile("audio/pr-video/team-po-light-loop.wav")}
			trimAfter={TEAM_PO_PR_VIDEO.durationInFrames}
			volume={(frame) =>
				interpolate(
					frame,
					[
						0,
						at(2.4),
						TEAM_PO_PR_VIDEO.durationInFrames - at(4.2),
						TEAM_PO_PR_VIDEO.durationInFrames,
					],
					[0, 0.1, 0.1, 0],
					{
						extrapolateLeft: "clamp",
						extrapolateRight: "clamp",
					},
				)
			}
		/>
	);
}
