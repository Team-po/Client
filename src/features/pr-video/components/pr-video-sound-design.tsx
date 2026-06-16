import {
	mouseClick,
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
		id: "opening-prompt-stroke",
		frame: atScene("opening", 0.12),
		durationInFrames: 24,
		src: whoosh,
		volume: 0.045,
		playbackRate: 1.08,
	},
	{
		id: "opening-logo-block-one",
		frame: atScene("opening", 0.45),
		durationInFrames: 11,
		src: uiSwitch,
		volume: 0.05,
		playbackRate: 0.88,
	},
	{
		id: "opening-logo-block-two",
		frame: atScene("opening", 0.58),
		durationInFrames: 11,
		src: uiSwitch,
		volume: 0.048,
		playbackRate: 0.96,
	},
	{
		id: "opening-logo-block-three",
		frame: atScene("opening", 0.72),
		durationInFrames: 11,
		src: uiSwitch,
		volume: 0.046,
		playbackRate: 1.04,
	},
	{
		id: "opening-team-word-swipe",
		frame: atScene("opening", 1.02),
		durationInFrames: 20,
		src: whip,
		volume: 0.068,
		playbackRate: 0.96,
	},
	{
		id: "opening-ui-cluster-arrives",
		frame: atScene("opening", 1.65),
		durationInFrames: 28,
		src: whoosh,
		volume: 0.058,
		playbackRate: 0.98,
	},
	{
		id: "opening-po-resolve",
		frame: atScene("opening", 1.78),
		durationInFrames: 18,
		src: shutterModern,
		volume: 0.064,
		playbackRate: 0.78,
	},
	{
		id: "opening-flow-connectors-draw",
		frame: atScene("opening", 2.35),
		durationInFrames: 40,
		src: whoosh,
		volume: 0.05,
		playbackRate: 0.9,
	},
	{
		id: "opening-camera-drift",
		frame: atScene("opening", 4.7),
		durationInFrames: 34,
		src: whoosh,
		volume: 0.042,
		playbackRate: 0.74,
	},
	{
		id: "problem-reveal-wipe",
		frame: atScene("problem", 0),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.08,
		playbackRate: 0.86,
	},
	{
		id: "problem-board-lands",
		frame: atScene("problem", 0.62),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.064,
		playbackRate: 0.84,
	},
	{
		id: "problem-issue-node-cluster-one",
		frame: atScene("problem", 1),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.045,
		playbackRate: 0.82,
	},
	{
		id: "problem-warning-field",
		frame: atScene("problem", 1.25),
		durationInFrames: 22,
		src: uiSwitch,
		volume: 0.062,
		playbackRate: 0.7,
	},
	{
		id: "problem-issue-node-cluster-two",
		frame: atScene("problem", 1.38),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.041,
		playbackRate: 0.92,
	},
	{
		id: "problem-pressure-build",
		frame: atScene("problem", 1.82),
		durationInFrames: 36,
		src: whoosh,
		volume: 0.045,
		playbackRate: 0.78,
	},
	{
		id: "problem-signal-converges",
		frame: atScene("problem", 2.18),
		durationInFrames: 28,
		src: whoosh,
		volume: 0.066,
		playbackRate: 0.92,
	},
	{
		id: "problem-signal-bars",
		frame: atScene("problem", 2.32),
		durationInFrames: 20,
		src: mouseClick,
		volume: 0.038,
		playbackRate: 0.76,
	},
	{
		id: "problem-bottleneck-lock",
		frame: atScene("problem", 2.62),
		durationInFrames: 24,
		src: shutterModern,
		volume: 0.078,
		playbackRate: 0.72,
	},
	{
		id: "problem-pain-point-rail",
		frame: atScene("problem", 2.9),
		durationInFrames: 22,
		src: uiSwitch,
		volume: 0.048,
		playbackRate: 0.78,
	},
	{
		id: "problem-bridge-copy",
		frame: atScene("problem", 4.45),
		durationInFrames: 24,
		src: whoosh,
		volume: 0.044,
		playbackRate: 1,
	},
	{
		id: "matching-reveal-wipe",
		frame: atScene("matching", 0),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.082,
		playbackRate: 0.94,
	},
	{
		id: "matching-window-lands",
		frame: atScene("matching", 0.7),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.06,
		playbackRate: 0.8,
	},
	{
		id: "matching-request-field-role",
		frame: atScene("matching", 1.05),
		durationInFrames: 12,
		src: uiSwitch,
		volume: 0.042,
		playbackRate: 0.9,
	},
	{
		id: "matching-request-field-scope",
		frame: atScene("matching", 1.21),
		durationInFrames: 12,
		src: uiSwitch,
		volume: 0.038,
		playbackRate: 0.98,
	},
	{
		id: "matching-headline-underline",
		frame: atScene("matching", 1.35),
		durationInFrames: 24,
		src: whoosh,
		volume: 0.034,
		playbackRate: 1.08,
	},
	{
		id: "matching-request-button",
		frame: atScene("matching", 1.86),
		durationInFrames: 14,
		src: mouseClick,
		volume: 0.076,
		playbackRate: 0.72,
	},
	{
		id: "matching-session-scan",
		frame: atScene("matching", 2.25),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.056,
		playbackRate: 1.08,
	},
	{
		id: "matching-profile-selected-one",
		frame: atScene("matching", 2.45),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.052,
		playbackRate: 0.84,
	},
	{
		id: "matching-profile-selected-two",
		frame: atScene("matching", 2.63),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.054,
		playbackRate: 0.92,
	},
	{
		id: "matching-team-panel",
		frame: atScene("matching", 3.2),
		durationInFrames: 24,
		src: shutterModern,
		volume: 0.068,
		playbackRate: 0.72,
	},
	{
		id: "matching-role-slots-settle",
		frame: atScene("matching", 3.45),
		durationInFrames: 22,
		src: uiSwitch,
		volume: 0.046,
		playbackRate: 0.78,
	},
	{
		id: "matching-team-panel-spark",
		frame: atScene("matching", 3.55),
		durationInFrames: 18,
		src: uiSwitch,
		volume: 0.046,
		playbackRate: 0.68,
	},
	{
		id: "workspace-reveal-wipe",
		frame: atScene("workspace", 0),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.076,
		playbackRate: 0.9,
	},
	{
		id: "workspace-window-lands",
		frame: atScene("workspace", 0.62),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.06,
		playbackRate: 0.78,
	},
	{
		id: "workspace-headline-underline",
		frame: atScene("workspace", 1.25),
		durationInFrames: 24,
		src: whoosh,
		volume: 0.034,
		playbackRate: 1.04,
	},
	{
		id: "workspace-stage-forming",
		frame: atScene("workspace", 1.6),
		durationInFrames: 12,
		src: uiSwitch,
		volume: 0.044,
		playbackRate: 0.82,
	},
	{
		id: "workspace-stage-progress",
		frame: atScene("workspace", 2),
		durationInFrames: 56,
		src: whoosh,
		volume: 0.046,
		playbackRate: 0.86,
	},
	{
		id: "workspace-checklist-first",
		frame: atScene("workspace", 2.02),
		durationInFrames: 12,
		src: mouseClick,
		volume: 0.046,
		playbackRate: 0.7,
	},
	{
		id: "workspace-active-stage",
		frame: atScene("workspace", 2.18),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.056,
		playbackRate: 0.78,
	},
	{
		id: "workspace-contract-lift",
		frame: atScene("workspace", 2.55),
		durationInFrames: 26,
		src: whoosh,
		volume: 0.052,
		playbackRate: 1.08,
	},
	{
		id: "workspace-drawer-appears",
		frame: atScene("workspace", 3.35),
		durationInFrames: 22,
		src: shutterModern,
		volume: 0.064,
		playbackRate: 0.72,
	},
	{
		id: "workspace-active-confirmed",
		frame: atScene("workspace", 3.62),
		durationInFrames: 16,
		src: uiSwitch,
		volume: 0.062,
		playbackRate: 0.68,
	},
	{
		id: "report-reveal-wipe",
		frame: atScene("report", 0),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.076,
		playbackRate: 0.9,
	},
	{
		id: "report-window-lands",
		frame: atScene("report", 0.62),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.058,
		playbackRate: 0.78,
	},
	{
		id: "report-headline-underline",
		frame: atScene("report", 1.22),
		durationInFrames: 24,
		src: whoosh,
		volume: 0.034,
		playbackRate: 1.04,
	},
	{
		id: "report-activity-rows",
		frame: atScene("report", 1.55),
		durationInFrames: 18,
		src: uiSwitch,
		volume: 0.044,
		playbackRate: 0.78,
	},
	{
		id: "report-metrics-count-up",
		frame: atScene("report", 1.7),
		durationInFrames: 22,
		src: uiSwitch,
		volume: 0.052,
		playbackRate: 0.72,
	},
	{
		id: "report-chart-line-draw",
		frame: atScene("report", 1.8),
		durationInFrames: 42,
		src: whoosh,
		volume: 0.056,
		playbackRate: 0.88,
	},
	{
		id: "report-chart-dot-resolve",
		frame: atScene("report", 2.72),
		durationInFrames: 14,
		src: uiSwitch,
		volume: 0.058,
		playbackRate: 0.8,
	},
	{
		id: "report-insight-panel",
		frame: atScene("report", 3.15),
		durationInFrames: 24,
		src: shutterModern,
		volume: 0.064,
		playbackRate: 0.74,
	},
	{
		id: "report-next-action-confirmed",
		frame: atScene("report", 3.62),
		durationInFrames: 16,
		src: uiSwitch,
		volume: 0.06,
		playbackRate: 0.7,
	},
	{
		id: "closing-reveal-wipe",
		frame: atScene("closing", 0),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.072,
		playbackRate: 0.84,
	},
	{
		id: "closing-brand-arrives",
		frame: atScene("closing", 0.22),
		durationInFrames: 16,
		src: uiSwitch,
		volume: 0.038,
		playbackRate: 0.76,
	},
	{
		id: "closing-token-matching",
		frame: atScene("closing", 0.52),
		durationInFrames: 12,
		src: uiSwitch,
		volume: 0.042,
		playbackRate: 0.68,
	},
	{
		id: "closing-token-workspace",
		frame: atScene("closing", 0.74),
		durationInFrames: 12,
		src: uiSwitch,
		volume: 0.04,
		playbackRate: 0.76,
	},
	{
		id: "closing-ribbon-path-draw",
		frame: atScene("closing", 0.9),
		durationInFrames: 58,
		src: whoosh,
		volume: 0.054,
		playbackRate: 0.66,
	},
	{
		id: "closing-token-report",
		frame: atScene("closing", 0.96),
		durationInFrames: 12,
		src: uiSwitch,
		volume: 0.04,
		playbackRate: 0.82,
	},
	{
		id: "closing-token-shipping",
		frame: atScene("closing", 1.18),
		durationInFrames: 12,
		src: uiSwitch,
		volume: 0.042,
		playbackRate: 0.88,
	},
	{
		id: "closing-headline-line-one",
		frame: atScene("closing", 1.62),
		durationInFrames: 16,
		src: shutterModern,
		volume: 0.046,
		playbackRate: 0.66,
	},
	{
		id: "closing-headline-line-two",
		frame: atScene("closing", 1.95),
		durationInFrames: 16,
		src: shutterModern,
		volume: 0.05,
		playbackRate: 0.7,
	},
	{
		id: "closing-headline-line-three",
		frame: atScene("closing", 2.32),
		durationInFrames: 18,
		src: shutterModern,
		volume: 0.054,
		playbackRate: 0.64,
	},
	{
		id: "closing-token-locks",
		frame: atScene("closing", 2.55),
		durationInFrames: 22,
		src: uiSwitch,
		volume: 0.04,
		playbackRate: 0.62,
	},
	{
		id: "closing-headline-shine",
		frame: atScene("closing", 3.18),
		durationInFrames: 28,
		src: whip,
		volume: 0.038,
		playbackRate: 0.72,
	},
	{
		id: "closing-copy-lock",
		frame: atScene("closing", 3.36),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.042,
		playbackRate: 0.62,
	},
	{
		id: "closing-underline-draw",
		frame: atScene("closing", 3.58),
		durationInFrames: 28,
		src: whoosh,
		volume: 0.034,
		playbackRate: 0.9,
	},
	{
		id: "closing-comet-pass",
		frame: atScene("closing", 4.72),
		durationInFrames: 50,
		src: whoosh,
		volume: 0.058,
		playbackRate: 0.82,
	},
	{
		id: "closing-feature-ignition",
		frame: atScene("closing", 5.3),
		durationInFrames: 20,
		src: uiSwitch,
		volume: 0.042,
		playbackRate: 0.64,
	},
	{
		id: "finale-reveal",
		frame: atScene("finale", 0),
		durationInFrames: 30,
		src: whoosh,
		volume: 0.082,
		playbackRate: 0.88,
	},
	{
		id: "finale-prompt-stroke",
		frame: atScene("finale", 0.22),
		durationInFrames: 22,
		src: whoosh,
		volume: 0.04,
		playbackRate: 1.02,
	},
	{
		id: "finale-logo-block-one",
		frame: atScene("finale", 0.46),
		durationInFrames: 11,
		src: uiSwitch,
		volume: 0.048,
		playbackRate: 0.76,
	},
	{
		id: "finale-logo-block-two",
		frame: atScene("finale", 0.6),
		durationInFrames: 11,
		src: uiSwitch,
		volume: 0.046,
		playbackRate: 0.84,
	},
	{
		id: "finale-logo-block-three",
		frame: atScene("finale", 0.74),
		durationInFrames: 11,
		src: uiSwitch,
		volume: 0.044,
		playbackRate: 0.92,
	},
	{
		id: "finale-team-word",
		frame: atScene("finale", 0.9),
		durationInFrames: 22,
		src: whip,
		volume: 0.06,
		playbackRate: 0.86,
	},
	{
		id: "finale-po-resolve",
		frame: atScene("finale", 1.36),
		durationInFrames: 20,
		src: shutterModern,
		volume: 0.06,
		playbackRate: 0.66,
	},
	{
		id: "finale-message-settle",
		frame: atScene("finale", 1.86),
		durationInFrames: 24,
		src: shutterModern,
		volume: 0.052,
		playbackRate: 0.68,
	},
	{
		id: "finale-message-underline",
		frame: atScene("finale", 2.2),
		durationInFrames: 34,
		src: whoosh,
		volume: 0.046,
		playbackRate: 0.88,
	},
	{
		id: "finale-bottom-pulse",
		frame: atScene("finale", 4.2),
		durationInFrames: 20,
		src: uiSwitch,
		volume: 0.058,
		playbackRate: 0.62,
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
