import type { CSSProperties } from "react";
import {
	Activity,
	AlertTriangle,
	BadgeCheck,
	CalendarClock,
	Check,
	CircleDashed,
	Code2,
	Database,
	GitBranch,
	GitPullRequest,
	Layers3,
	MessageSquare,
	Palette,
	Rocket,
	Search,
	Shuffle,
	SlidersHorizontal,
	Sparkles,
	UsersRound,
} from "lucide-react";
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN_OUT = Easing.bezier(0.45, 0, 0.55, 1);
const OPENING_SCENE_FRAMES = 180;
const PROBLEM_SCENE_START_FRAME = 165;
const PROBLEM_SCENE_FRAMES = 195;
const MATCHING_SCENE_START_FRAME = 330;
const MATCHING_SCENE_FRAMES = 300;
const WORKSPACE_SCENE_START_FRAME = 600;
const WORKSPACE_SCENE_FRAMES = 330;
const REPORT_SCENE_START_FRAME = 900;
const REPORT_SCENE_FRAMES = 360;
const CLOSING_SCENE_START_FRAME = 1230;
const CLOSING_SCENE_FRAMES = 300;
const FINALE_SCENE_START_FRAME = 1500;
const FINALE_SCENE_FRAMES = 270;

const candidateRows = [
	{ name: "Frontend", stack: "React", color: "bg-blue-500" },
	{ name: "Backend", stack: "Spring", color: "bg-emerald-500" },
	{ name: "Product", stack: "PM", color: "bg-amber-400" },
] as const;

const lifecycleStages = ["forming", "active", "shipping", "done"] as const;

const heatmapCells = [
	{ id: "cell-01", level: 0 },
	{ id: "cell-02", level: 1 },
	{ id: "cell-03", level: 2 },
	{ id: "cell-04", level: 3 },
	{ id: "cell-05", level: 2 },
	{ id: "cell-06", level: 0 },
	{ id: "cell-07", level: 1 },
	{ id: "cell-08", level: 2 },
	{ id: "cell-09", level: 3 },
	{ id: "cell-10", level: 4 },
	{ id: "cell-11", level: 2 },
	{ id: "cell-12", level: 1 },
	{ id: "cell-13", level: 0 },
	{ id: "cell-14", level: 2 },
	{ id: "cell-15", level: 3 },
	{ id: "cell-16", level: 4 },
	{ id: "cell-17", level: 3 },
	{ id: "cell-18", level: 2 },
	{ id: "cell-19", level: 1 },
	{ id: "cell-20", level: 0 },
	{ id: "cell-21", level: 2 },
	{ id: "cell-22", level: 4 },
	{ id: "cell-23", level: 4 },
	{ id: "cell-24", level: 3 },
	{ id: "cell-25", level: 2 },
	{ id: "cell-26", level: 1 },
	{ id: "cell-27", level: 0 },
	{ id: "cell-28", level: 2 },
	{ id: "cell-29", level: 3 },
	{ id: "cell-30", level: 4 },
	{ id: "cell-31", level: 2 },
	{ id: "cell-32", level: 1 },
	{ id: "cell-33", level: 3 },
	{ id: "cell-34", level: 4 },
	{ id: "cell-35", level: 2 },
] as const;

const issueNodes = [
	{
		id: "recruit",
		kind: "users",
		title: "팀원 모집",
		meta: "D+7 모집 중",
		x: 18,
		y: 154,
		color: "blue",
		delay: 0.1,
		rotation: -4,
	},
	{
		id: "role",
		kind: "search",
		title: "역할 조율",
		meta: "FE? BE? PM?",
		x: 400,
		y: 76,
		color: "amber",
		delay: 0.22,
		rotation: 3,
	},
	{
		id: "chat",
		kind: "message",
		title: "대화 기록",
		meta: "DM · 오픈채팅 · 댓글",
		x: 205,
		y: 300,
		color: "emerald",
		delay: 0.36,
		rotation: -2,
	},
	{
		id: "schedule",
		kind: "calendar",
		title: "마감 일정",
		meta: "다음 액션 미정",
		x: 592,
		y: 242,
		color: "rose",
		delay: 0.5,
		rotation: 4,
	},
	{
		id: "github",
		kind: "git",
		title: "개발 기록",
		meta: "PR · 이슈 · 리뷰 단절",
		x: 86,
		y: 506,
		color: "indigo",
		delay: 0.64,
		rotation: 2,
	},
] as const;

const problemConvergencePaths = [
	{
		id: "from-recruit",
		d: "M144 216 C272 304 392 370 520 432",
		stroke: "rgba(245,158,11,0.4)",
	},
	{
		id: "from-role",
		d: "M548 144 C580 246 574 332 548 430",
		stroke: "rgba(239,68,68,0.34)",
	},
	{
		id: "from-chat",
		d: "M344 366 C414 390 482 414 536 438",
		stroke: "rgba(16,185,129,0.34)",
	},
	{
		id: "from-schedule",
		d: "M724 306 C676 358 620 398 566 438",
		stroke: "rgba(245,158,11,0.38)",
	},
	{
		id: "from-github",
		d: "M238 566 C350 526 452 478 536 448",
		stroke: "rgba(99,102,241,0.34)",
	},
] as const;

const painPoints = [
	{
		id: "matching",
		label: "팀 찾기",
		title: "좋은 팀원을 만나기 전까지 시간이 새요",
		detail: "모집글, 자기소개, 역할 기대치가 흩어져 있어요.",
		color: "#3b82f6",
	},
	{
		id: "operation",
		label: "팀 운영",
		title: "시작해도 진행 상태가 금방 흐려져요",
		detail: "마감, 역할, 체크리스트가 같은 기준으로 보이지 않아요.",
		color: "#10b981",
	},
	{
		id: "shipping",
		label: "완주",
		title: "협업 루틴이 없으면 출시 전 동력이 꺼져요",
		detail: "GitHub 기록과 다음 액션이 연결되지 않으면 멈추기 쉬워요.",
		color: "#f59e0b",
	},
] as const;

const matchingProfiles = [
	{
		id: "profile-fe",
		name: "Frontend",
		stack: "React · UI",
		icon: "code",
		color: "#3b82f6",
		x: 98,
		y: 118,
		targetX: 94,
		targetY: 166,
		delay: 0.1,
		score: 94,
	},
	{
		id: "profile-be",
		name: "Backend",
		stack: "Spring · API",
		icon: "database",
		color: "#10b981",
		x: 612,
		y: 124,
		targetX: 594,
		targetY: 166,
		delay: 0.26,
		score: 91,
	},
	{
		id: "profile-pm",
		name: "Product",
		stack: "PM · 기획",
		icon: "layers",
		color: "#f59e0b",
		x: 126,
		y: 456,
		targetX: 102,
		targetY: 486,
		delay: 0.42,
		score: 88,
	},
	{
		id: "profile-design",
		name: "Design",
		stack: "UX · System",
		icon: "palette",
		color: "#6366f1",
		x: 580,
		y: 448,
		targetX: 584,
		targetY: 486,
		delay: 0.58,
		score: 86,
	},
] as const;

const matchingSignals = [
	{ id: "goal", label: "목표", value: "MVP 출시", color: "#3b82f6" },
	{ id: "pace", label: "속도", value: "주 2회", color: "#10b981" },
	{ id: "role", label: "역할", value: "FE · BE · PM", color: "#f59e0b" },
] as const;

const workspaceTasks = [
	{
		id: "scope",
		title: "이번 주 개발 범위 합의",
		meta: "PM · FE · BE",
		color: "#3b82f6",
		column: "forming",
		delay: 0.12,
	},
	{
		id: "contract",
		title: "API 계약 정리",
		meta: "Backend",
		color: "#10b981",
		column: "active",
		delay: 0.28,
	},
	{
		id: "release",
		title: "배포 체크리스트",
		meta: "Team",
		color: "#f59e0b",
		column: "shipping",
		delay: 0.44,
	},
] as const;

const workspaceChecklist = [
	"역할과 목표 정리",
	"이번 주 개발 범위 합의",
	"데모 배포 체크",
] as const;

const reportMetrics = [
	{ id: "pr", label: "PR merged", value: 84, color: "#3b82f6" },
	{ id: "task", label: "Tasks done", value: 72, color: "#10b981" },
	{ id: "pace", label: "Shipping pace", value: 61, color: "#f59e0b" },
] as const;

const reportRows = [
	{
		id: "row-pr",
		title: "로그인 플로우 PR merged",
		meta: "GitHub · 12분 전",
		color: "#3b82f6",
	},
	{
		id: "row-task",
		title: "배포 체크리스트 3개 완료",
		meta: "Checklist · 오늘",
		color: "#10b981",
	},
	{
		id: "row-risk",
		title: "API 응답 지연 이슈 감지",
		meta: "AI signal · 확인 필요",
		color: "#f59e0b",
	},
] as const;

const closingFlow = [
	{
		id: "matching",
		label: "팀 찾기",
		title: "랜덤 매칭",
		detail: "역할·목표·속도 신호 정렬",
		color: "#10b981",
		fromX: -260,
		fromY: -110,
		x: 34,
		y: 206,
	},
	{
		id: "workspace",
		label: "팀 운영",
		title: "워크스페이스",
		detail: "상태와 체크리스트를 한 화면에",
		color: "#3b82f6",
		fromX: -80,
		fromY: -240,
		x: 286,
		y: 92,
	},
	{
		id: "report",
		label: "진척 확인",
		title: "진척 리포트",
		detail: "GitHub·태스크 신호를 다음 액션으로",
		color: "#6366f1",
		fromX: 110,
		fromY: 260,
		x: 538,
		y: 206,
	},
	{
		id: "shipping",
		label: "완주",
		title: "출시 루틴",
		detail: "멈추기 전에 완주 리듬 유지",
		color: "#f59e0b",
		fromX: 300,
		fromY: -140,
		x: 748,
		y: 92,
	},
] as const;

export function TeamPoPrVideo() {
	return (
		<AbsoluteFill className="overflow-hidden bg-[#f7fbff] font-body text-slate-950">
			<Sequence durationInFrames={OPENING_SCENE_FRAMES}>
				<OpeningScene />
			</Sequence>
			<Sequence
				durationInFrames={PROBLEM_SCENE_FRAMES}
				from={PROBLEM_SCENE_START_FRAME}
			>
				<ProblemScene />
			</Sequence>
			<Sequence
				durationInFrames={MATCHING_SCENE_FRAMES}
				from={MATCHING_SCENE_START_FRAME}
			>
				<MatchingScene />
			</Sequence>
			<Sequence
				durationInFrames={WORKSPACE_SCENE_FRAMES}
				from={WORKSPACE_SCENE_START_FRAME}
			>
				<WorkspaceDemoScene />
			</Sequence>
			<Sequence
				durationInFrames={REPORT_SCENE_FRAMES}
				from={REPORT_SCENE_START_FRAME}
			>
				<ReportDemoScene />
			</Sequence>
			<Sequence
				durationInFrames={CLOSING_SCENE_FRAMES}
				from={CLOSING_SCENE_START_FRAME}
			>
				<ClosingDemoScene />
			</Sequence>
			<Sequence
				durationInFrames={FINALE_SCENE_FRAMES}
				from={FINALE_SCENE_START_FRAME}
			>
				<FinaleLogoScene />
			</Sequence>
			<TeamGroupWatermark />
		</AbsoluteFill>
	);
}

function TeamGroupWatermark() {
	return (
		<div
			aria-hidden="true"
			className="absolute right-[54px] top-[42px] z-[90] text-[18px] font-extrabold tracking-normal text-slate-500/55"
		>
			5조 githug
		</div>
	);
}

function OpeningScene() {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const camera = motionProgress(
		frame,
		seconds(4.7, fps),
		seconds(1.1, fps),
		EASE_IN_OUT,
	);
	const cameraX = interpolate(camera, [0, 1], [0, -68]);
	const cameraScale = interpolate(camera, [0, 1], [1, 1.025]);

	return (
		<AbsoluteFill className="overflow-hidden bg-[#f7fbff] font-body text-slate-950">
			<AnimatedBackground frame={frame} fps={fps} />
			<div
				className="absolute inset-0"
				style={{
					transform: `translate3d(${cameraX}px, 0, 0) scale(${cameraScale})`,
				}}
			>
				<LogoReveal frame={frame} fps={fps} />
				<ProductUiCluster frame={frame} fps={fps} />
				<SceneCaption frame={frame} fps={fps} />
			</div>
			<TransitionHint frame={frame} fps={fps} />
		</AbsoluteFill>
	);
}

function AnimatedBackground({ frame, fps }: { frame: number; fps: number }) {
	const gridOpacity = motionProgress(
		frame,
		seconds(0.1, fps),
		seconds(1.3, fps),
	);
	const lineProgress = motionProgress(
		frame,
		seconds(0.5, fps),
		seconds(4.4, fps),
	);

	return (
		<>
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, #f8fbff 0%, #eef7ff 44%, #fffaf0 100%)",
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					opacity: gridOpacity * 0.8,
					backgroundImage:
						"linear-gradient(to right, rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.08) 1px, transparent 1px)",
					backgroundSize: "54px 54px",
					maskImage:
						"linear-gradient(to bottom, transparent 0%, black 16%, black 78%, transparent 100%)",
				}}
			/>
			<div className="absolute inset-0 overflow-hidden">
				{[
					{ top: 122, width: 620, color: "rgba(59,130,246,0.22)", delay: 0 },
					{ top: 238, width: 420, color: "rgba(16,185,129,0.2)", delay: 34 },
					{ top: 742, width: 760, color: "rgba(99,102,241,0.18)", delay: 62 },
					{ top: 880, width: 520, color: "rgba(245,158,11,0.2)", delay: 96 },
				].map((line) => {
					const travel =
						((frame + line.delay) % seconds(5.2, fps)) / seconds(5.2, fps);
					const x = interpolate(travel, [0, 1], [-700, 2150]);
					const opacity = Math.sin(travel * Math.PI) * lineProgress;

					return (
						<div
							className="absolute h-px rounded-full"
							key={`${line.top}-${line.width}`}
							style={{
								top: line.top,
								left: 0,
								width: line.width,
								opacity,
								background: `linear-gradient(90deg, transparent, ${line.color}, transparent)`,
								transform: `translate3d(${x}px, 0, 0)`,
							}}
						/>
					);
				})}
			</div>
		</>
	);
}

function LogoReveal({ frame, fps }: { frame: number; fps: number }) {
	const prompt = motionProgress(frame, seconds(0.1, fps), seconds(0.75, fps));
	const blockOne = motionProgress(
		frame,
		seconds(0.45, fps),
		seconds(0.42, fps),
	);
	const blockTwo = motionProgress(
		frame,
		seconds(0.58, fps),
		seconds(0.42, fps),
	);
	const blockThree = motionProgress(
		frame,
		seconds(0.72, fps),
		seconds(0.42, fps),
	);
	const teamWord = motionProgress(
		frame,
		seconds(1.02, fps),
		seconds(0.58, fps),
	);
	const poWord = motionProgress(frame, seconds(1.78, fps), seconds(0.5, fps));
	const settle = motionProgress(
		frame,
		seconds(2.45, fps),
		seconds(1.1, fps),
		EASE_IN_OUT,
	);

	const logoStyle: CSSProperties = {
		opacity: interpolate(frame, [0, seconds(0.35, fps)], [0, 1], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		}),
		transform: `translate3d(${interpolate(settle, [0, 1], [0, -24])}px, ${interpolate(
			settle,
			[0, 1],
			[0, -8],
		)}px, 0)`,
	};

	return (
		<div
			className="absolute left-[136px] top-[246px] h-[358px] w-[860px]"
			style={logoStyle}
		>
			<div className="absolute left-0 top-0 h-[258px] w-[830px]">
				<svg
					aria-hidden="true"
					className="absolute left-0 top-[24px] h-[190px] w-[190px] overflow-visible"
					viewBox="0 0 140 140"
				>
					<path
						d="M32 38 L72 70 L32 102"
						fill="none"
						stroke="#1e293b"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="20"
						style={{
							strokeDasharray: 130,
							strokeDashoffset: 130 * (1 - prompt),
						}}
					/>
				</svg>
				<LogoBlock progress={blockOne} x={154} y={150} color="#10b981" />
				<LogoBlock progress={blockTwo} x={202} y={102} color="#3b82f6" />
				<LogoBlock progress={blockThree} x={250} y={54} color="#6366f1" />
				<div className="absolute left-[316px] top-[54px] flex h-[156px] w-[900px] origin-left text-[146px] font-black leading-none tracking-normal">
					<span
						className="inline-block text-slate-800"
						style={{
							clipPath: `inset(0 ${100 - teamWord * 100}% 0 0)`,
							transform: `skewX(-15deg) translate3d(${interpolate(teamWord, [0, 1], [-32, 0])}px, 0, 0)`,
						}}
					>
						Team
					</span>
					<span
						className="inline-block text-blue-500"
						style={{
							filter: `blur(${interpolate(poWord, [0, 1], [8, 0])}px)`,
							opacity: poWord,
							transform: `skewX(-15deg) translate3d(${interpolate(poWord, [0, 1], [44, 0])}px, 0, 0) scale(${interpolate(
								poWord,
								[0, 1],
								[0.94, 1],
							)})`,
						}}
					>
						-po
					</span>
				</div>
			</div>
		</div>
	);
}

function LogoBlock({
	progress,
	x,
	y,
	color,
}: {
	progress: number;
	x: number;
	y: number;
	color: string;
}) {
	return (
		<div
			className="absolute h-10 w-10 rounded-lg shadow-lg shadow-slate-900/10"
			style={{
				backgroundColor: color,
				left: x,
				top: y,
				opacity: progress,
				transform: `translate3d(0, ${interpolate(progress, [0, 1], [42, 0])}px, 0) scale(${interpolate(
					progress,
					[0, 1],
					[0.68, 1],
				)}) rotate(${interpolate(progress, [0, 1], [-12, 0])}deg)`,
			}}
		/>
	);
}

function ProductUiCluster({ frame, fps }: { frame: number; fps: number }) {
	const cluster = motionProgress(frame, seconds(1.65, fps), seconds(0.9, fps));
	const drift = Math.sin(frame / 30) * 7;

	return (
		<div
			className="absolute right-[126px] top-[96px] h-[900px] w-[790px]"
			style={{
				opacity: cluster,
				transform: `translate3d(${interpolate(cluster, [0, 1], [104, 0])}px, ${drift}px, 0) scale(${interpolate(
					cluster,
					[0, 1],
					[0.96, 1],
				)})`,
			}}
		>
			<FlowConnectors frame={frame} fps={fps} />
			<MatchingCard frame={frame} fps={fps} />
			<WorkspaceCard frame={frame} fps={fps} />
			<ProgressCard frame={frame} fps={fps} />
		</div>
	);
}

function FlowConnectors({ frame, fps }: { frame: number; fps: number }) {
	const draw = motionProgress(frame, seconds(2.35, fps), seconds(1.6, fps));
	const dashOffset = 1120 * (1 - draw);

	return (
		<svg
			aria-hidden="true"
			className="absolute inset-0 h-full w-full overflow-visible"
			viewBox="0 0 790 836"
		>
			<path
				d="M430 142 C530 156 628 212 656 308 C687 414 585 474 520 548"
				fill="none"
				stroke="rgba(59,130,246,0.26)"
				strokeDasharray="1120"
				strokeWidth="3"
				style={{ strokeDashoffset: dashOffset }}
			/>
			<path
				d="M224 498 C300 586 414 615 538 594"
				fill="none"
				stroke="rgba(16,185,129,0.28)"
				strokeDasharray="720"
				strokeWidth="3"
				style={{ strokeDashoffset: 720 * (1 - draw) }}
			/>
		</svg>
	);
}

function MatchingCard({ frame, fps }: { frame: number; fps: number }) {
	const style = cardStyle(frame, fps, 1.85, 0, 32);
	const pulse = motionProgress(
		frame,
		seconds(2.55, fps),
		seconds(2.5, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="absolute right-[48px] top-0 h-[316px] w-[478px] rounded-lg border border-blue-100 bg-white/92 p-6 shadow-[0_24px_80px_rgba(30,64,175,0.16)] backdrop-blur"
			style={style}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/25">
						<UsersRound size={24} strokeWidth={2.4} />
					</div>
					<div>
						<p className="text-[15px] font-bold text-slate-950">랜덤 팀 매칭</p>
						<p className="mt-1 text-[11px] font-semibold text-slate-400">
							profile signal synced
						</p>
					</div>
				</div>
				<span className="rounded-md bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600">
					98%
				</span>
			</div>
			<div className="mt-6 grid grid-cols-[1fr_160px] gap-5">
				<div className="space-y-2.5">
					{candidateRows.map((row, index) => {
						const rowProgress = motionProgress(
							frame,
							seconds(2.35 + index * 0.18, fps),
							seconds(0.55, fps),
						);

						return (
							<div
								className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5"
								key={row.name}
								style={{
									opacity: rowProgress,
									transform: `translate3d(${interpolate(rowProgress, [0, 1], [-24, 0])}px, 0, 0)`,
								}}
							>
								<span className={`h-8 w-8 rounded-lg ${row.color}`} />
								<div className="min-w-0">
									<p className="text-[12px] font-bold text-slate-800">
										{row.name}
									</p>
									<p className="text-[10px] font-semibold text-slate-400">
										{row.stack}
									</p>
								</div>
							</div>
						);
					})}
				</div>
				<OrbitNetwork pulse={pulse} />
			</div>
		</div>
	);
}

function OrbitNetwork({ pulse }: { pulse: number }) {
	return (
		<div className="relative h-[160px] overflow-hidden rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
			<svg
				aria-hidden="true"
				className="absolute inset-0 h-full w-full"
				viewBox="0 0 160 166"
			>
				<path
					d="M80 32 C126 42 136 112 82 132 C30 112 34 48 80 32Z"
					fill="none"
					stroke="rgba(59,130,246,0.36)"
					strokeDasharray="10 10"
					strokeWidth="2"
					style={{
						strokeDashoffset: interpolate(pulse, [0, 1], [42, -42]),
					}}
				/>
				<path
					d="M38 112 L80 32 L126 104 L82 132 Z"
					fill="none"
					stroke="rgba(16,185,129,0.32)"
					strokeWidth="2"
				/>
			</svg>
			<OrbitNode label="FE" left={62} top={17} progress={pulse} />
			<OrbitNode label="BE" left={112} top={88} progress={pulse * 0.9} />
			<OrbitNode label="PM" left={22} top={96} progress={pulse * 0.82} />
			<div className="absolute left-[64px] top-[78px] grid h-9 w-9 place-items-center rounded-lg border border-blue-100 bg-white text-[11px] font-black text-blue-600 shadow-sm">
				+
			</div>
		</div>
	);
}

function OrbitNode({
	label,
	left,
	top,
	progress,
}: {
	label: string;
	left: number;
	top: number;
	progress: number;
}) {
	return (
		<div
			className="absolute grid h-11 w-11 place-items-center rounded-lg border border-white/20 bg-white/95 text-[11px] font-black text-slate-800 shadow-lg"
			style={{
				left,
				top,
				transform: `scale(${interpolate(progress, [0, 1], [0.9, 1.08])})`,
			}}
		>
			{label}
		</div>
	);
}

function WorkspaceCard({ frame, fps }: { frame: number; fps: number }) {
	const style = cardStyle(frame, fps, 2.25, 1.6, 42);

	return (
		<div
			className="absolute left-0 top-[316px] h-[360px] w-[518px] rounded-lg border border-emerald-100 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,118,110,0.14)] backdrop-blur"
			style={style}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
						<Rocket size={23} strokeWidth={2.4} />
					</div>
					<div>
						<p className="text-[15px] font-bold text-slate-950">
							팀 워크스페이스
						</p>
						<p className="mt-1 text-[11px] font-semibold text-slate-400">
							lifecycle · checklist
						</p>
					</div>
				</div>
				<div className="flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
					<Activity size={13} />
					active
				</div>
			</div>
			<LifecycleRail frame={frame} fps={fps} />
			<div className="mt-5 grid gap-2">
				<ChecklistItem
					frame={frame}
					fps={fps}
					index={0}
					label="역할과 목표 정리"
				/>
				<ChecklistItem
					frame={frame}
					fps={fps}
					index={1}
					label="이번 주 개발 범위 합의"
				/>
				<ChecklistItem
					frame={frame}
					fps={fps}
					index={2}
					label="배포 체크리스트"
				/>
			</div>
		</div>
	);
}

function LifecycleRail({ frame, fps }: { frame: number; fps: number }) {
	const progress = motionProgress(
		frame,
		seconds(2.65, fps),
		seconds(2.1, fps),
		EASE_IN_OUT,
	);

	return (
		<div className="mt-6">
			<div className="relative h-2 rounded-full bg-slate-100">
				<div
					className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500"
					style={{ width: `${interpolate(progress, [0, 1], [12, 78])}%` }}
				/>
				{lifecycleStages.map((stage, index) => {
					const active = motionProgress(
						frame,
						seconds(2.65 + index * 0.42, fps),
						seconds(0.38, fps),
					);

					return (
						<div
							className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-lg border-4 border-white bg-slate-200 shadow-md"
							key={stage}
							style={{
								left: `${index * 29}%`,
								backgroundColor: active > 0.65 ? "#3b82f6" : "#e2e8f0",
								transform: `translate3d(-50%, -50%, 0) scale(${interpolate(active, [0, 1], [0.78, 1.08])})`,
							}}
						/>
					);
				})}
			</div>
			<div className="mt-3 flex justify-between text-[10px] font-bold uppercase text-slate-400">
				{lifecycleStages.map((stage) => (
					<span key={stage}>{stage}</span>
				))}
			</div>
		</div>
	);
}

function ChecklistItem({
	frame,
	fps,
	index,
	label,
}: {
	frame: number;
	fps: number;
	index: number;
	label: string;
}) {
	const done = motionProgress(
		frame,
		seconds(3.2 + index * 0.32, fps),
		seconds(0.35, fps),
	);

	return (
		<div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/90 px-4 py-2.5">
			<div className="flex items-center gap-3">
				<div
					className="grid h-6 w-6 place-items-center rounded-md border border-emerald-200 bg-white text-emerald-600"
					style={{
						backgroundColor: done > 0.65 ? "#ecfdf5" : "#ffffff",
					}}
				>
					<Check size={15} strokeWidth={3} style={{ opacity: done }} />
				</div>
				<p className="text-[12px] font-bold text-slate-700">{label}</p>
			</div>
			<span className="text-[10px] font-bold text-slate-400">
				D-{4 - index}
			</span>
		</div>
	);
}

function ProgressCard({ frame, fps }: { frame: number; fps: number }) {
	const style = cardStyle(frame, fps, 2.68, 2.7, 46);
	const barProgress = motionProgress(
		frame,
		seconds(3.05, fps),
		seconds(1.6, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="absolute bottom-[10px] right-0 h-[320px] w-[488px] rounded-lg border border-indigo-100 bg-white/92 p-6 shadow-[0_24px_80px_rgba(67,56,202,0.14)] backdrop-blur"
			style={style}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
						<GitBranch size={23} strokeWidth={2.4} />
					</div>
					<div>
						<p className="text-[15px] font-bold text-slate-950">진척 리포트</p>
						<p className="mt-1 text-[11px] font-semibold text-slate-400">
							GitHub + AI signal
						</p>
					</div>
				</div>
				<div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-600">
					<Sparkles size={17} />
				</div>
			</div>
			<div className="mt-5 grid grid-cols-[1fr_132px] gap-5">
				<div className="space-y-3.5">
					<MetricBar
						label="PR merged"
						progress={barProgress}
						target={84}
						color="#3b82f6"
					/>
					<MetricBar
						label="Tasks done"
						progress={barProgress}
						target={68}
						color="#10b981"
					/>
					<MetricBar
						label="AI tips"
						progress={barProgress}
						target={52}
						color="#f59e0b"
					/>
				</div>
				<Heatmap frame={frame} fps={fps} />
			</div>
			<div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] font-bold text-blue-700">
				이번 주 병목은 배포 체크리스트에 집중
			</div>
		</div>
	);
}

function MetricBar({
	label,
	progress,
	target,
	color,
}: {
	label: string;
	progress: number;
	target: number;
	color: string;
}) {
	return (
		<div>
			<div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
				<span>{label}</span>
				<span>{Math.round(target * progress)}%</span>
			</div>
			<div className="h-3 rounded-full bg-slate-100">
				<div
					className="h-3 rounded-full"
					style={{
						backgroundColor: color,
						width: `${target * progress}%`,
					}}
				/>
			</div>
		</div>
	);
}

function Heatmap({ frame, fps }: { frame: number; fps: number }) {
	return (
		<div className="grid grid-cols-5 gap-2 rounded-lg bg-slate-50 p-3">
			{heatmapCells.map((cell, index) => {
				const reveal = motionProgress(
					frame,
					seconds(3.15 + index * 0.025, fps),
					seconds(0.28, fps),
				);
				const pulse = (Math.sin(frame / 11 + index) + 1) / 2;
				const alpha = interpolate(cell.level, [0, 4], [0.12, 0.88]) * reveal;

				return (
					<div
						className="h-4 w-4 rounded-[4px]"
						key={cell.id}
						style={{
							backgroundColor: `rgba(16, 185, 129, ${alpha + pulse * 0.05})`,
							transform: `scale(${interpolate(reveal, [0, 1], [0.65, 1])})`,
						}}
					/>
				);
			})}
		</div>
	);
}

function SceneCaption({ frame, fps }: { frame: number; fps: number }) {
	const caption = motionProgress(frame, seconds(2.05, fps), seconds(0.85, fps));
	const chips = motionProgress(frame, seconds(2.55, fps), seconds(0.9, fps));
	const highlight = motionProgress(
		frame,
		seconds(2.65, fps),
		seconds(0.9, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="absolute left-[156px] top-[584px] w-[820px]"
			style={{
				opacity: caption,
				transform: `translate3d(0, ${interpolate(caption, [0, 1], [32, 0])}px, 0)`,
			}}
		>
			<div className="relative">
				<div
					className="absolute -left-5 top-1 h-[118px] w-1.5 rounded-full bg-blue-500"
					style={{
						transform: `scaleY(${highlight})`,
						transformOrigin: "top",
					}}
				/>
				<p className="text-[46px] font-black leading-[1.05] tracking-normal text-slate-900">
					팀 찾기부터{" "}
					<span className="relative inline-block text-blue-500">
						완주까지
						<span
							className="absolute -bottom-1 left-0 h-2 rounded-full bg-blue-200/80"
							style={{
								width: `${highlight * 100}%`,
							}}
						/>
					</span>
				</p>
				<p className="mt-3 text-[31px] font-extrabold leading-tight tracking-normal text-slate-700">
					사이드 프로젝트를{" "}
					<span className="text-slate-950">계속 움직이게.</span>
				</p>
			</div>
			<div className="mt-7 flex gap-3">
				{["랜덤 매칭", "라이프사이클", "진척 리포트"].map((label, index) => {
					const item = Math.max(0, Math.min(1, chips - index * 0.16));

					return (
						<span
							className="rounded-lg border border-blue-100 bg-white/80 px-5 py-3 text-[15px] font-extrabold text-slate-700 shadow-sm"
							key={label}
							style={{
								opacity: item,
								transform: `translate3d(${interpolate(item, [0, 1], [-18, 0])}px, 0, 0)`,
							}}
						>
							{label}
						</span>
					);
				})}
			</div>
		</div>
	);
}

function TransitionHint({ frame, fps }: { frame: number; fps: number }) {
	const wipe = motionProgress(
		frame,
		seconds(5.15, fps),
		seconds(0.72, fps),
		EASE_IN_OUT,
	);

	return (
		<div className="pointer-events-none absolute inset-0">
			<div
				className="absolute inset-y-[-8%] right-[-18%] w-[38%]"
				style={{
					background:
						"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.88) 38%, rgba(219,234,254,0.7) 62%, transparent 100%)",
					filter: "blur(10px)",
					opacity: interpolate(wipe, [0, 0.45, 1], [0, 0.78, 0.22]),
					transform: `translate3d(${interpolate(wipe, [0, 1], [620, -240])}px, 0, 0) skewX(-10deg)`,
					transformOrigin: "right center",
				}}
			/>
			<div
				className="absolute inset-y-[-8%] right-[-10%] w-10"
				style={{
					background:
						"linear-gradient(90deg, transparent, rgba(59,130,246,0.32), rgba(16,185,129,0.18), transparent)",
					opacity: interpolate(wipe, [0, 0.35, 1], [0, 0.95, 0]),
					transform: `translate3d(${interpolate(wipe, [0, 1], [680, -260])}px, 0, 0) skewX(-10deg)`,
				}}
			/>
		</div>
	);
}

function ProblemScene() {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const reveal = motionProgress(frame, 0, seconds(0.9, fps), EASE_IN_OUT);
	const revealEdgeTop = interpolate(reveal, [0, 1], [108, -12]);
	const revealEdgeBottom = interpolate(reveal, [0, 1], [100, -20]);
	const content = motionProgress(frame, seconds(0.45, fps), seconds(0.95, fps));
	const bridge = motionProgress(frame, seconds(4.45, fps), seconds(0.75, fps));
	const settle = motionProgress(
		frame,
		seconds(2.8, fps),
		seconds(1.7, fps),
		EASE_IN_OUT,
	);

	return (
		<AbsoluteFill
			className="overflow-hidden bg-[#f8fbff] text-slate-950"
			style={{
				clipPath: `polygon(${revealEdgeTop}% 0, 100% 0, 100% 100%, ${revealEdgeBottom}% 100%)`,
			}}
		>
			<ProblemBackground frame={frame} fps={fps} />
			<ProblemWarningField frame={frame} fps={fps} />
			<div
				className="absolute left-[128px] top-[128px] w-[790px]"
				style={{
					opacity: content,
					transform: `translate3d(${interpolate(content, [0, 1], [64, 0])}px, 0, 0)`,
				}}
			>
				<div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-amber-200 bg-white/84 px-5 py-3 text-[16px] font-black tracking-normal text-slate-500 shadow-sm">
					<CircleDashed size={20} className="text-amber-500" />
					문제 제기 · Before Team-po
				</div>
				<h2 className="text-[84px] font-black leading-[0.96] tracking-normal text-slate-950">
					사이드 프로젝트는
					<br />
					시작보다
					<br />
					<span className="text-blue-500">완주가 어렵습니다</span>
				</h2>
				<p className="mt-9 max-w-[750px] text-[29px] font-bold leading-[1.42] tracking-normal text-slate-600">
					팀원 찾기, 역할 조율, 진행 공유가 이어지지 않으면 프로젝트의 흐름이
					끊깁니다.
				</p>
				<div
					className="mt-8 inline-flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-5 py-3 text-[18px] font-black text-blue-600 shadow-sm"
					style={{
						opacity: bridge,
						transform: `translate3d(${interpolate(bridge, [0, 1], [24, 0])}px, 0, 0)`,
					}}
				>
					<span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
					Team-po는 이 신호를 하나의 흐름으로 연결합니다
				</div>
			</div>

			<ScatteredIssueBoard frame={frame} fps={fps} settle={settle} />
			<PainPointRail frame={frame} fps={fps} />
			<ProblemRevealEdge reveal={reveal} />
		</AbsoluteFill>
	);
}

function ProblemBackground({ frame, fps }: { frame: number; fps: number }) {
	const grid = motionProgress(frame, seconds(0.1, fps), seconds(1.3, fps));
	const sweep = ((frame % seconds(4.8, fps)) / seconds(4.8, fps)) * 1;
	const sweepX = interpolate(sweep, [0, 1], [-520, 2200]);

	return (
		<>
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, #fbfdff 0%, #eff7ff 44%, #fffaf1 76%, #f2fff9 100%)",
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					opacity: grid * 0.7,
					backgroundImage:
						"linear-gradient(to right, rgba(30,64,175,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,64,175,0.07) 1px, transparent 1px)",
					backgroundSize: "62px 62px",
				}}
			/>
			<div
				className="absolute top-[214px] h-px w-[680px] rounded-full"
				style={{
					background:
						"linear-gradient(90deg, transparent, rgba(59,130,246,0.3), rgba(16,185,129,0.22), transparent)",
					transform: `translate3d(${sweepX}px, 0, 0)`,
				}}
			/>
			<div
				className="absolute left-[72px] top-[74px] h-[900px] w-[900px] rounded-full border border-blue-200/50"
				style={{
					opacity: interpolate(grid, [0, 1], [0, 0.42]),
					transform: `scale(${interpolate(grid, [0, 1], [0.92, 1])})`,
				}}
			/>
		</>
	);
}

function ProblemWarningField({ frame, fps }: { frame: number; fps: number }) {
	const warning = motionProgress(
		frame,
		seconds(1.25, fps),
		seconds(1.55, fps),
		EASE_IN_OUT,
	);
	const sweep = ((frame % seconds(2.7, fps)) / seconds(2.7, fps)) * 1;
	const scanX = interpolate(sweep, [0, 1], [-380, 1220]);
	const tremor = Math.sin(frame / 5) * 3;

	return (
		<>
			<div
				className="absolute right-[34px] top-[58px] h-[760px] w-[990px] overflow-hidden rounded-lg border border-amber-200/45"
				style={{
					opacity: warning * 0.72,
					backgroundImage:
						"linear-gradient(135deg, rgba(245,158,11,0.13) 0 1px, transparent 1px 20px)",
					backgroundPosition: `${frame * -1.4}px ${frame * 0.55}px`,
					boxShadow: `inset 0 0 ${interpolate(warning, [0, 1], [0, 52])}px rgba(245,158,11,0.12)`,
					transform: `translate3d(${tremor * warning}px, 0, 0)`,
				}}
			/>
			<div
				className="absolute right-[82px] top-[116px] h-[3px] w-[860px] rounded-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
				style={{
					opacity:
						warning * interpolate(sweep, [0, 0.2, 0.74, 1], [0, 0.9, 0.6, 0]),
					transform: `translate3d(${scanX}px, ${interpolate(sweep, [0, 1], [0, 540])}px, 0) rotate(-9deg)`,
				}}
			/>
			<svg
				aria-hidden="true"
				className="absolute right-[44px] top-[72px] h-[722px] w-[960px] overflow-visible"
				viewBox="0 0 960 722"
			>
				<path
					d="M154 172 L268 242 L222 304 L402 392 L356 454 L596 548"
					fill="none"
					stroke="rgba(239,68,68,0.26)"
					strokeDasharray="18 18"
					strokeWidth="4"
					style={{
						opacity: warning,
						strokeDashoffset: -frame * 1.7,
					}}
				/>
				<path
					d="M624 116 L548 220 L628 304 L544 406 L682 560"
					fill="none"
					stroke="rgba(245,158,11,0.28)"
					strokeDasharray="12 20"
					strokeWidth="3"
					style={{
						opacity: warning,
						strokeDashoffset: frame * 1.35,
					}}
				/>
			</svg>
		</>
	);
}

function ScatteredIssueBoard({
	frame,
	fps,
	settle,
}: {
	frame: number;
	fps: number;
	settle: number;
}) {
	const board = motionProgress(frame, seconds(0.62, fps), seconds(1.0, fps));
	const signalReveal = motionProgress(
		frame,
		seconds(2.18, fps),
		seconds(0.78, fps),
		EASE_OUT,
	);
	const signalFocus = motionProgress(
		frame,
		seconds(2.62, fps),
		seconds(0.86, fps),
		EASE_IN_OUT,
	);
	const signalScale =
		interpolate(signalReveal, [0, 1], [0.88, 1]) *
		interpolate(signalFocus, [0, 0.52, 1], [1, 1.045, 1.01]);
	const problemPressure = motionProgress(
		frame,
		seconds(1.82, fps),
		seconds(1.45, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="absolute right-[72px] top-[90px] h-[708px] w-[900px]"
			style={{
				opacity: board,
				transform: `translate3d(${interpolate(board, [0, 1], [96, 0])}px, ${interpolate(
					settle,
					[0, 1],
					[0, -22],
				)}px, 0)`,
			}}
		>
			<svg
				aria-hidden="true"
				className="absolute inset-0 h-full w-full overflow-visible"
				viewBox="0 0 900 708"
			>
				<path
					d="M106 232 C288 72 514 106 742 310"
					fill="none"
					stroke="rgba(59,130,246,0.22)"
					strokeDasharray="12 14"
					strokeWidth="3"
					style={{
						strokeDashoffset: -frame * 1.4,
					}}
				/>
				<path
					d="M196 520 C354 366 530 408 722 318"
					fill="none"
					stroke="rgba(245,158,11,0.24)"
					strokeDasharray="10 16"
					strokeWidth="3"
					style={{
						strokeDashoffset: frame * 1.1,
					}}
				/>
				{problemConvergencePaths.map((path, index) => (
					<path
						d={path.d}
						fill="none"
						key={path.id}
						stroke={path.stroke}
						strokeDasharray="8 13"
						strokeLinecap="round"
						strokeWidth="4"
						style={{
							opacity: signalFocus * 0.9,
							strokeDashoffset: interpolate(
								signalFocus,
								[0, 1],
								[160 - index * 16, -26],
							),
						}}
					/>
				))}
			</svg>
			{issueNodes.map((node) => (
				<IssueNode
					frame={frame}
					fps={fps}
					key={node.id}
					node={node}
					problemPressure={problemPressure}
				/>
			))}
			{[0, 1, 2].map((ring) => (
				<div
					className="absolute left-[298px] top-[332px] z-10 h-[220px] w-[504px] rounded-lg border border-amber-300/70"
					key={ring}
					style={{
						opacity:
							interpolate(signalFocus, [0, 0.42, 1], [0, 0.42, 0.08]) *
							(1 - ring * 0.2),
						transform: `scale(${1 + signalFocus * 0.08 + ring * 0.06})`,
					}}
				/>
			))}
			<div
				className="absolute left-[318px] top-[352px] z-20 w-[462px] rounded-lg border bg-white/94 p-7 shadow-[0_26px_78px_rgba(15,23,42,0.13)] backdrop-blur"
				style={{
					borderColor: `rgba(245, 158, 11, ${interpolate(signalFocus, [0, 1], [0.28, 0.72])})`,
					boxShadow: `0 28px 84px rgba(15,23,42,0.14), 0 0 ${interpolate(
						signalFocus,
						[0, 1],
						[0, 42],
					)}px rgba(245,158,11,0.28)`,
					opacity: signalReveal,
					transform: `translate3d(0, ${
						interpolate(signalReveal, [0, 1], [46, 0]) +
						Math.sin(frame / 24) * 4
					}px, 0) scale(${signalScale})`,
				}}
			>
				<div className="mb-4 flex items-center gap-3">
					<div className="grid h-12 w-12 place-items-center rounded-lg bg-amber-100 text-amber-600">
						<AlertTriangle size={25} strokeWidth={2.6} />
					</div>
					<div>
						<p className="text-[13px] font-black uppercase tracking-normal text-amber-500">
							핵심 병목
						</p>
						<p className="mt-0.5 text-[27px] font-black leading-none tracking-normal text-slate-950">
							진행 신호가 분산됨
						</p>
					</div>
				</div>
				<p className="mb-5 text-[15px] font-bold leading-relaxed text-slate-500">
					팀 찾기, 역할 조율, 진척 공유가 이어지지 않아 다음 액션이 흐려집니다.
				</p>
				<div className="space-y-3.5">
					<SignalBar color="#3b82f6" delay={2.32} frame={frame} fps={fps} />
					<SignalBar color="#10b981" delay={2.5} frame={frame} fps={fps} />
					<SignalBar color="#f59e0b" delay={2.68} frame={frame} fps={fps} />
				</div>
			</div>
		</div>
	);
}

function IssueNode({
	frame,
	fps,
	node,
	problemPressure,
}: {
	frame: number;
	fps: number;
	node: (typeof issueNodes)[number];
	problemPressure: number;
}) {
	const enter = motionProgress(
		frame,
		seconds(0.9 + node.delay, fps),
		seconds(0.72, fps),
	);
	const float = Math.sin(frame / 28 + node.x / 60) * 8;
	const alert = motionProgress(
		frame,
		seconds(2.7 + node.delay, fps),
		seconds(0.7, fps),
	);
	const jitter = interpolate(problemPressure, [0, 0.58, 1], [0, 7, 2.4]);
	const stressRotation =
		Math.sin(frame / 4.5 + node.x / 90) *
		interpolate(problemPressure, [0, 1], [0, 2.2]);

	return (
		<div
			className="absolute w-[300px] rounded-lg border border-slate-200 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur"
			style={{
				left: node.x,
				top: node.y,
				filter: `saturate(${interpolate(problemPressure, [0, 1], [1, 0.76])}) brightness(${interpolate(problemPressure, [0, 1], [1, 0.96])})`,
				opacity: enter * interpolate(problemPressure, [0, 1], [1, 0.82]),
				transform: `translate3d(${
					interpolate(enter, [0, 1], [76, 0]) +
					Math.sin(frame / 3.7 + node.x / 80) * jitter
				}px, ${
					float + Math.cos(frame / 4.1 + node.y / 80) * jitter * 0.56
				}px, 0) rotate(${node.rotation * enter + stressRotation}deg) scale(${interpolate(
					enter,
					[0, 1],
					[0.94, 1],
				)})`,
			}}
		>
			<div
				className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 shadow-sm"
				style={{
					opacity: alert * problemPressure,
					transform: `scale(${interpolate(alert, [0, 1], [0.74, 1.05])})`,
				}}
			>
				<AlertTriangle size={15} strokeWidth={2.8} />
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div
						className="grid h-12 w-12 place-items-center rounded-lg text-white shadow-lg"
						style={{
							backgroundColor: issueColor(node.color),
							boxShadow: `0 12px 28px ${issueColor(node.color)}26`,
						}}
					>
						<IssueIcon kind={node.kind} />
					</div>
					<div>
						<p className="text-[16px] font-black text-slate-900">
							{node.title}
						</p>
						<p className="mt-1.5 text-[12px] font-bold text-slate-400">
							{node.meta}
						</p>
					</div>
				</div>
				<div
					className="h-3 w-3 rounded-full"
					style={{
						backgroundColor: alert > 0.5 ? "#f59e0b" : "#dbeafe",
						boxShadow: alert > 0.5 ? "0 0 18px rgba(245,158,11,0.46)" : "none",
						transform: `scale(${interpolate(alert, [0, 1], [0.75, 1.15])})`,
					}}
				/>
			</div>
		</div>
	);
}

function IssueIcon({ kind }: { kind: (typeof issueNodes)[number]["kind"] }) {
	if (kind === "users") {
		return <UsersRound size={23} strokeWidth={2.5} />;
	}

	if (kind === "search") {
		return <Search size={23} strokeWidth={2.5} />;
	}

	if (kind === "message") {
		return <MessageSquare size={23} strokeWidth={2.5} />;
	}

	if (kind === "calendar") {
		return <CalendarClock size={23} strokeWidth={2.5} />;
	}

	return <GitPullRequest size={23} strokeWidth={2.5} />;
}

function SignalBar({
	color,
	delay,
	frame,
	fps,
}: {
	color: string;
	delay: number;
	frame: number;
	fps: number;
}) {
	const progress = motionProgress(
		frame,
		seconds(delay, fps),
		seconds(0.55, fps),
	);

	return (
		<div className="h-2.5 rounded-full bg-slate-100">
			<div
				className="h-2.5 rounded-full"
				style={{
					backgroundColor: color,
					width: `${interpolate(progress, [0, 1], [12, 64])}%`,
				}}
			/>
		</div>
	);
}

function PainPointRail({ frame, fps }: { frame: number; fps: number }) {
	return (
		<div className="absolute bottom-[70px] left-[128px] grid w-[1664px] grid-cols-3 gap-6">
			{painPoints.map((point, index) => {
				const enter = motionProgress(
					frame,
					seconds(2.9 + index * 0.18, fps),
					seconds(0.72, fps),
				);

				return (
					<div
						className="rounded-lg border border-white/80 bg-white/78 p-7 shadow-[0_18px_46px_rgba(15,23,42,0.1)] backdrop-blur"
						key={point.id}
						style={{
							opacity: enter,
							transform: `translate3d(0, ${interpolate(enter, [0, 1], [36, 0])}px, 0)`,
						}}
					>
						<div className="mb-5 flex items-center gap-3">
							<span
								className="h-3.5 w-3.5 rounded-full"
								style={{ backgroundColor: point.color }}
							/>
							<span className="text-[15px] font-black uppercase tracking-normal text-slate-400">
								{point.label}
							</span>
						</div>
						<p className="text-[25px] font-black leading-snug tracking-normal text-slate-950">
							{point.title}
						</p>
						<p className="mt-3 text-[16px] font-bold leading-relaxed text-slate-500">
							{point.detail}
						</p>
					</div>
				);
			})}
		</div>
	);
}

function ProblemRevealEdge({ reveal }: { reveal: number }) {
	return (
		<div
			className="absolute inset-y-[-8%] left-0 w-[220px]"
			style={{
				background:
					"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.92) 38%, rgba(96,165,250,0.26) 70%, transparent 100%)",
				filter: "blur(8px)",
				opacity: interpolate(reveal, [0, 0.35, 0.82, 1], [0, 0.9, 0.42, 0]),
				transform: `translate3d(${interpolate(reveal, [0, 1], [1700, -260])}px, 0, 0) skewX(-10deg)`,
				transformOrigin: "left center",
			}}
		/>
	);
}

function MatchingScene() {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const reveal = motionProgress(frame, 0, seconds(0.92, fps), EASE_IN_OUT);
	const revealEdgeTop = interpolate(reveal, [0, 1], [110, -16]);
	const revealEdgeBottom = interpolate(reveal, [0, 1], [100, -26]);
	const intro = motionProgress(frame, seconds(0.35, fps), seconds(0.85, fps));
	const board = motionProgress(frame, seconds(0.7, fps), seconds(1.05, fps));

	return (
		<AbsoluteFill
			className="overflow-hidden bg-[#f8fbff] text-slate-950"
			style={{
				clipPath: `polygon(${revealEdgeTop}% 0, 100% 0, 100% 100%, ${revealEdgeBottom}% 100%)`,
			}}
		>
			<MatchingBackground frame={frame} fps={fps} />
			<MatchingNarrativePanel frame={frame} fps={fps} progress={intro} />
			<MatchingOrbitBoard frame={frame} fps={fps} progress={board} />
			<MatchingRevealEdge reveal={reveal} />
		</AbsoluteFill>
	);
}

function MatchingBackground({ frame, fps }: { frame: number; fps: number }) {
	const grid = motionProgress(frame, seconds(0.12, fps), seconds(1.2, fps));
	const scan = (frame % seconds(4.4, fps)) / seconds(4.4, fps);

	return (
		<>
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, #f7fbff 0%, #ecfdf5 42%, #eff6ff 72%, #fff7ed 100%)",
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					opacity: grid * 0.72,
					backgroundImage:
						"linear-gradient(to right, rgba(16,185,129,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.08) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
				}}
			/>
			<div
				className="absolute inset-y-0 w-[360px]"
				style={{
					background:
						"linear-gradient(90deg, transparent, rgba(255,255,255,0.55), rgba(59,130,246,0.12), transparent)",
					opacity: grid * 0.7,
					transform: `translate3d(${interpolate(scan, [0, 1], [-420, 2140])}px, 0, 0) skewX(-10deg)`,
				}}
			/>
		</>
	);
}

function MatchingNarrativePanel({
	frame,
	fps,
	progress,
}: {
	frame: number;
	fps: number;
	progress: number;
}) {
	const underline = motionProgress(
		frame,
		seconds(1.35, fps),
		seconds(0.7, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="absolute left-[96px] top-[136px] w-[640px]"
			style={{
				opacity: progress,
				transform: `translate3d(${interpolate(progress, [0, 1], [54, 0])}px, 0, 0)`,
			}}
		>
			<div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-emerald-100 bg-white/82 px-5 py-3 text-[16px] font-black uppercase tracking-normal text-emerald-600 shadow-sm">
				<Shuffle size={21} />
				Solution 01
			</div>
			<h2 className="text-[70px] font-black leading-[0.98] tracking-normal text-slate-950">
				매칭으로
				<br />
				<span className="relative inline-block text-emerald-500">
					팀을 바로 시작해요
					<span
						className="absolute -bottom-2 left-0 h-2 rounded-full bg-emerald-200/80"
						style={{ width: `${underline * 100}%` }}
					/>
				</span>
			</h2>
			<p className="mt-8 text-[25px] font-bold leading-[1.44] tracking-normal text-slate-600">
				역할, 목표, 진행 속도를 한 화면에서 맞춰 보고
				<br />
				함께 시작할 팀을 빠르게 찾습니다.
			</p>
		</div>
	);
}

function MatchingOrbitBoard({
	frame,
	fps,
	progress,
}: {
	frame: number;
	fps: number;
	progress: number;
}) {
	const buttonClick = motionProgress(
		frame,
		seconds(1.85, fps),
		seconds(0.45, fps),
		EASE_IN_OUT,
	);
	const panel = motionProgress(frame, seconds(3.2, fps), seconds(0.9, fps));
	const scan = motionProgress(frame, seconds(2.25, fps), seconds(0.9, fps));

	return (
		<div
			className="absolute right-[42px] top-[64px] h-[900px] w-[1120px]"
			style={{
				opacity: progress,
				transform: `translate3d(${interpolate(progress, [0, 1], [112, 0])}px, ${Math.sin(frame / 38) * 4}px, 0)`,
			}}
		>
			<div className="absolute inset-0 overflow-hidden rounded-lg border border-emerald-100/80 bg-white shadow-[0_34px_100px_rgba(15,118,110,0.18)]">
				<div className="flex h-12 items-center gap-3 border-b border-slate-100 bg-slate-50 px-5">
					<span className="h-3 w-3 rounded-full bg-rose-300" />
					<span className="h-3 w-3 rounded-full bg-amber-300" />
					<span className="h-3 w-3 rounded-full bg-emerald-300" />
					<div className="ml-5 rounded-md bg-white px-4 py-1.5 text-[13px] font-bold text-slate-400">
						team-po.app/matching
					</div>
				</div>

				<div className="flex h-20 items-center justify-between border-b border-slate-100 px-7">
					<div className="flex items-center gap-4">
						<div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
							<Shuffle size={25} strokeWidth={2.6} />
						</div>
						<div>
							<p className="text-[24px] font-black text-slate-950">Team-po</p>
							<p className="mt-0.5 text-[13px] font-bold text-slate-400">
								Matching workspace
							</p>
						</div>
						<div className="ml-7 flex gap-2 text-[14px] font-black text-slate-400">
							<span className="rounded-md bg-emerald-50 px-4 py-2 text-emerald-600">
								팀 매칭
							</span>
							<span className="px-4 py-2">팀 스페이스</span>
							<span className="px-4 py-2">리포트</span>
						</div>
					</div>
					<button
						className="rounded-lg bg-emerald-500 px-6 py-3 text-[16px] font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.24)]"
						style={{
							transform: `scale(${interpolate(buttonClick, [0, 0.45, 1], [1, 0.96, 1.04])})`,
							boxShadow: `0 14px ${interpolate(buttonClick, [0, 1], [30, 48])}px rgba(16,185,129,0.26)`,
						}}
						type="button"
					>
						랜덤 매칭 시작
					</button>
				</div>

				<div className="grid h-[748px] grid-cols-[318px_1fr] gap-7 bg-[#f8fbff] p-7">
					<aside className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
						<div className="mb-6 flex items-center justify-between">
							<div>
								<p className="text-[19px] font-black text-slate-950">
									매칭 조건
								</p>
								<p className="mt-1 text-[12px] font-bold text-slate-400">
									입력한 프로필 기준
								</p>
							</div>
							<div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
								<SlidersHorizontal size={20} />
							</div>
						</div>
						<div className="space-y-4">
							{matchingSignals.map((signal, index) => {
								const item = motionProgress(
									frame,
									seconds(1.05 + index * 0.16, fps),
									seconds(0.45, fps),
								);

								return (
									<div
										className="rounded-lg border border-slate-100 bg-slate-50/80 p-4"
										key={signal.id}
										style={{
											opacity: item,
											transform: `translate3d(0, ${interpolate(item, [0, 1], [18, 0])}px, 0)`,
										}}
									>
										<div className="mb-2 flex items-center gap-2">
											<span
												className="h-2.5 w-2.5 rounded-full"
												style={{ backgroundColor: signal.color }}
											/>
											<p className="text-[13px] font-black text-slate-400">
												{signal.label}
											</p>
										</div>
										<p className="text-[20px] font-black text-slate-950">
											{signal.value}
										</p>
									</div>
								);
							})}
						</div>
						<div className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-5">
							<p className="text-[13px] font-bold text-emerald-600">
								AI 추천 기준
							</p>
							<p className="mt-2 text-[18px] font-black leading-snug text-slate-950">
								역할 균형과 진행 가능성을 함께 계산
							</p>
						</div>
					</aside>

					<section className="relative overflow-hidden rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
						<div className="mb-5 flex items-center justify-between">
							<div>
								<p className="text-[24px] font-black text-slate-950">
									추천 후보
								</p>
								<p className="mt-1 text-[13px] font-bold text-slate-400">
									이번 주 바로 시작 가능한 프로필
								</p>
							</div>
							<div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-500">
								<Search size={17} />
								React, Spring, PM
							</div>
						</div>

						<div
							className="pointer-events-none absolute left-0 right-0 top-[112px] h-px"
							style={{
								background:
									"linear-gradient(90deg, transparent, rgba(16,185,129,0.55), transparent)",
								opacity: scan,
								transform: `translate3d(0, ${interpolate(scan, [0, 1], [0, 470])}px, 0)`,
							}}
						/>

						<div className="grid grid-cols-2 gap-4">
							{matchingProfiles.map((profile, index) => (
								<MatchingDemoCard
									frame={frame}
									fps={fps}
									index={index}
									key={profile.id}
									profile={profile}
								/>
							))}
						</div>

						<RecommendedTeamPanel frame={frame} fps={fps} progress={panel} />
					</section>
				</div>
			</div>
			<MatchingTouchPulse frame={frame} fps={fps} />
		</div>
	);
}

function MatchingDemoCard({
	frame,
	fps,
	index,
	profile,
}: {
	frame: number;
	fps: number;
	index: number;
	profile: (typeof matchingProfiles)[number];
}) {
	const enter = motionProgress(
		frame,
		seconds(1.0 + profile.delay, fps),
		seconds(0.72, fps),
	);
	const selected = motionProgress(
		frame,
		seconds(2.45 + index * 0.18, fps),
		seconds(0.45, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="relative min-h-[176px] rounded-lg border bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
			style={{
				borderColor: selected > 0.55 ? profile.color : "#e2e8f0",
				backgroundColor: selected > 0.55 ? "#f8fffc" : "#ffffff",
				opacity: enter,
				transform: `translate3d(0, ${interpolate(enter, [0, 1], [30, 0])}px, 0) scale(${interpolate(selected, [0, 1], [1, 1.025])})`,
			}}
		>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<div
						className="grid h-14 w-14 place-items-center rounded-lg text-white shadow-lg"
						style={{
							backgroundColor: profile.color,
							boxShadow: `0 12px 28px ${profile.color}24`,
						}}
					>
						<MatchingProfileIcon icon={profile.icon} />
					</div>
					<div className="min-w-0">
						<p className="text-[19px] font-black text-slate-950">
							{profile.name}
						</p>
						<p className="mt-1 text-[13px] font-bold text-slate-400">
							{profile.stack}
						</p>
					</div>
				</div>
				<div
					className="grid h-8 w-8 place-items-center rounded-full border"
					style={{
						borderColor: selected > 0.55 ? profile.color : "#e2e8f0",
						backgroundColor: selected > 0.55 ? profile.color : "#ffffff",
					}}
				>
					<Check
						size={17}
						strokeWidth={3}
						style={{ color: "#ffffff", opacity: selected }}
					/>
				</div>
			</div>
			<div className="mt-5">
				<div className="mb-2 flex items-center justify-between">
					<p className="text-[13px] font-black text-slate-400">signal</p>
					<p
						className="text-[16px] font-black"
						style={{ color: profile.color }}
					>
						{Math.round(profile.score * enter)}%
					</p>
				</div>
				<div className="h-2.5 rounded-full bg-slate-100">
					<div
						className="h-2.5 rounded-full"
						style={{
							backgroundColor: profile.color,
							width: `${interpolate(enter, [0, 1], [12, profile.score])}%`,
						}}
					/>
				</div>
			</div>
		</div>
	);
}

function MatchingTouchPulse({ frame, fps }: { frame: number; fps: number }) {
	const startButton = motionProgress(
		frame,
		seconds(1.86, fps),
		seconds(0.42, fps),
	);
	const candidate = motionProgress(
		frame,
		seconds(2.62, fps),
		seconds(0.5, fps),
	);
	const teamPanel = motionProgress(
		frame,
		seconds(3.48, fps),
		seconds(0.55, fps),
	);

	return (
		<>
			<TouchPulse color="#10b981" progress={startButton} x={950} y={96} />
			<TouchPulse color="#3b82f6" progress={candidate} x={606} y={334} />
			<TouchPulse color="#10b981" progress={teamPanel} x={824} y={658} />
		</>
	);
}

function MatchingProfileIcon({
	icon,
}: {
	icon: (typeof matchingProfiles)[number]["icon"];
}) {
	if (icon === "code") {
		return <Code2 size={24} strokeWidth={2.5} />;
	}

	if (icon === "database") {
		return <Database size={24} strokeWidth={2.5} />;
	}

	if (icon === "layers") {
		return <Layers3 size={24} strokeWidth={2.5} />;
	}

	return <Palette size={24} strokeWidth={2.5} />;
}

function RecommendedTeamPanel({
	frame,
	fps,
	progress,
}: {
	frame: number;
	fps: number;
	progress: number;
}) {
	const spark = motionProgress(
		frame,
		seconds(3.55, fps),
		seconds(1.1, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="absolute bottom-6 left-6 right-6 rounded-lg border border-emerald-100 bg-white/96 p-6 text-slate-950 shadow-[0_26px_80px_rgba(15,118,110,0.16)] backdrop-blur"
			style={{
				opacity: progress,
				transform: `translate3d(0, ${interpolate(progress, [0, 1], [44, 0])}px, 0)`,
			}}
		>
			<div className="grid grid-cols-[1fr_210px] gap-6">
				<div>
					<div className="mb-4 flex items-center gap-3">
						<div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
							<BadgeCheck size={25} strokeWidth={2.6} />
						</div>
						<div>
							<p className="text-[24px] font-black leading-tight">
								MVP 런칭 스쿼드 추천
							</p>
							<p className="mt-1 text-[13px] font-bold text-slate-500">
								목표, 속도, 역할 균형이 맞는 조합입니다.
							</p>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-2">
						{["FE", "BE", "PM"].map((role, index) => (
							<div
								className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3 text-center text-[15px] font-black text-slate-950"
								key={role}
								style={{
									opacity: motionProgress(
										frame,
										seconds(3.45 + index * 0.14, fps),
										seconds(0.34, fps),
									),
								}}
							>
								{role}
							</div>
						))}
					</div>
				</div>
				<div
					className="rounded-lg border border-emerald-100 bg-emerald-50 p-5"
					style={{
						boxShadow: `0 0 ${interpolate(spark, [0, 1], [0, 28])}px rgba(52,211,153,0.45)`,
					}}
				>
					<p className="text-[13px] font-bold text-emerald-600">match score</p>
					<p className="mt-2 text-[42px] font-black leading-none text-emerald-600">
						98%
					</p>
					<p className="mt-2 text-[12px] font-bold text-slate-500">
						바로 팀 스페이스 생성 가능
					</p>
				</div>
			</div>
		</div>
	);
}

function MatchingRevealEdge({ reveal }: { reveal: number }) {
	return (
		<div
			className="absolute inset-y-[-8%] left-0 w-[240px]"
			style={{
				background:
					"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.92) 40%, rgba(16,185,129,0.24) 72%, transparent 100%)",
				filter: "blur(8px)",
				opacity: interpolate(reveal, [0, 0.35, 0.82, 1], [0, 0.88, 0.38, 0]),
				transform: `translate3d(${interpolate(reveal, [0, 1], [1700, -280])}px, 0, 0) skewX(-10deg)`,
				transformOrigin: "left center",
			}}
		/>
	);
}

function WorkspaceDemoScene() {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const reveal = motionProgress(frame, 0, seconds(0.9, fps), EASE_IN_OUT);
	const revealEdgeTop = interpolate(reveal, [0, 1], [112, -18]);
	const revealEdgeBottom = interpolate(reveal, [0, 1], [102, -26]);
	const intro = motionProgress(frame, seconds(0.32, fps), seconds(0.82, fps));
	const windowProgress = motionProgress(
		frame,
		seconds(0.62, fps),
		seconds(1.0, fps),
	);

	return (
		<AbsoluteFill
			className="overflow-hidden bg-[#fbfdff] text-slate-950"
			style={{
				clipPath: `polygon(${revealEdgeTop}% 0, 100% 0, 100% 100%, ${revealEdgeBottom}% 100%)`,
			}}
		>
			<WorkspaceDemoBackground frame={frame} fps={fps} />
			<WorkspaceNarrativePanel frame={frame} fps={fps} progress={intro} />
			<WorkspaceDemoWindow frame={frame} fps={fps} progress={windowProgress} />
			<MatchingRevealEdge reveal={reveal} />
		</AbsoluteFill>
	);
}

function WorkspaceDemoBackground({
	frame,
	fps,
}: {
	frame: number;
	fps: number;
}) {
	const grid = motionProgress(frame, seconds(0.1, fps), seconds(1.1, fps));
	const sweep = (frame % seconds(5, fps)) / seconds(5, fps);

	return (
		<>
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, #f8fbff 0%, #eef6ff 42%, #f0fdf4 76%, #fff7ed 100%)",
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					opacity: grid * 0.72,
					backgroundImage:
						"linear-gradient(to right, rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.07) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
				}}
			/>
			<div
				className="absolute top-[278px] h-px w-[760px] rounded-full"
				style={{
					background:
						"linear-gradient(90deg, transparent, rgba(59,130,246,0.32), rgba(16,185,129,0.22), transparent)",
					opacity: grid,
					transform: `translate3d(${interpolate(sweep, [0, 1], [-800, 2200])}px, 0, 0)`,
				}}
			/>
		</>
	);
}

function WorkspaceNarrativePanel({
	frame,
	fps,
	progress,
}: {
	frame: number;
	fps: number;
	progress: number;
}) {
	const underline = motionProgress(
		frame,
		seconds(1.25, fps),
		seconds(0.72, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="absolute left-[96px] top-[136px] w-[640px]"
			style={{
				opacity: progress,
				transform: `translate3d(${interpolate(progress, [0, 1], [54, 0])}px, 0, 0)`,
			}}
		>
			<div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-blue-100 bg-white/82 px-5 py-3 text-[16px] font-black uppercase tracking-normal text-blue-600 shadow-sm">
				<Rocket size={21} />
				Solution 02
			</div>
			<h2 className="text-[70px] font-black leading-[0.98] tracking-normal text-slate-950">
				팀이 생기면
				<br />
				<span className="relative inline-block text-blue-500">
					바로 운영 화면으로
					<span
						className="absolute -bottom-2 left-0 h-2 rounded-full bg-blue-200/80"
						style={{ width: `${underline * 100}%` }}
					/>
				</span>
			</h2>
			<p className="mt-8 text-[25px] font-bold leading-[1.44] tracking-normal text-slate-600">
				상태, 역할, 체크리스트가 한 페이지에서 움직여서
				<br />
				팀이 “지금 뭘 해야 하는지” 바로 보입니다.
			</p>
		</div>
	);
}

function WorkspaceDemoWindow({
	frame,
	fps,
	progress,
}: {
	frame: number;
	fps: number;
	progress: number;
}) {
	const stageProgress = motionProgress(
		frame,
		seconds(2.0, fps),
		seconds(2.5, fps),
		EASE_IN_OUT,
	);
	const drawer = motionProgress(frame, seconds(3.35, fps), seconds(0.82, fps));

	return (
		<div
			className="absolute right-[42px] top-[64px] h-[900px] w-[1120px]"
			style={{
				opacity: progress,
				transform: `translate3d(${interpolate(progress, [0, 1], [112, 0])}px, ${Math.sin(frame / 40) * 4}px, 0)`,
			}}
		>
			<div className="absolute inset-0 overflow-hidden rounded-lg border border-blue-100/80 bg-white shadow-[0_34px_100px_rgba(30,64,175,0.16)]">
				<div className="flex h-12 items-center gap-3 border-b border-slate-100 bg-slate-50 px-5">
					<span className="h-3 w-3 rounded-full bg-rose-300" />
					<span className="h-3 w-3 rounded-full bg-amber-300" />
					<span className="h-3 w-3 rounded-full bg-emerald-300" />
					<div className="ml-5 rounded-md bg-white px-4 py-1.5 text-[13px] font-bold text-slate-400">
						team-po.app/team-space
					</div>
				</div>

				<div className="grid h-[848px] grid-cols-[248px_1fr] bg-[#f8fbff]">
					<aside className="border-r border-slate-100 bg-white p-6">
						<div className="mb-7 flex items-center gap-3">
							<div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-500 text-white">
								<Rocket size={22} />
							</div>
							<div>
								<p className="text-[21px] font-black text-slate-950">Team-po</p>
								<p className="text-[12px] font-bold text-slate-400">
									Workspace
								</p>
							</div>
						</div>
						<div className="space-y-2 text-[15px] font-black">
							<div className="rounded-lg bg-blue-50 px-4 py-3 text-blue-600">
								프로젝트 홈
							</div>
							<div className="px-4 py-3 text-slate-400">역할 관리</div>
							<div className="px-4 py-3 text-slate-400">체크리스트</div>
							<div className="px-4 py-3 text-slate-400">회의 기록</div>
						</div>
						<div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-5">
							<p className="text-[13px] font-bold text-blue-600">이번 주</p>
							<p className="mt-2 text-[25px] font-black text-slate-950">
								Active
							</p>
							<p className="mt-2 text-[12px] font-bold text-slate-500">
								3개 태스크 진행 중
							</p>
						</div>
					</aside>

					<main className="relative p-7">
						<div className="mb-6 flex items-start justify-between">
							<div>
								<p className="text-[32px] font-black text-slate-950">
									MVP 런칭 스쿼드
								</p>
								<p className="mt-2 text-[15px] font-bold text-slate-500">
									랜덤 매칭으로 생성된 팀 스페이스
								</p>
							</div>
							<div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-5 py-3 text-[15px] font-black text-emerald-600">
								<Activity size={18} />
								live
							</div>
						</div>

						<WorkspaceStageRail
							frame={frame}
							fps={fps}
							progress={stageProgress}
						/>

						<div className="mt-7 grid grid-cols-[1.15fr_0.85fr] gap-5">
							<WorkspaceBoard frame={frame} fps={fps} />
							<WorkspaceChecklist frame={frame} fps={fps} />
						</div>

						<WorkspaceActionDrawer progress={drawer} />
						<WorkspaceTouchPulse frame={frame} fps={fps} />
					</main>
				</div>
			</div>
		</div>
	);
}

function WorkspaceStageRail({
	frame,
	fps,
	progress,
}: {
	frame: number;
	fps: number;
	progress: number;
}) {
	const progressWidth = interpolate(progress, [0, 1], [12, 96]);

	return (
		<div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
			<div className="relative h-3 rounded-full bg-slate-100">
				<div
					className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-400"
					style={{ width: `${progressWidth}%` }}
				/>
				{lifecycleStages.map((stage, index) => {
					const active = motionProgress(
						frame,
						seconds(1.6 + index * 0.42, fps),
						seconds(0.45, fps),
					);

					return (
						<div
							className="absolute top-1/2 grid h-9 w-9 place-items-center rounded-lg border-4 border-white bg-slate-200 shadow-md"
							key={stage}
							style={{
								left: `${index * 32}%`,
								backgroundColor: active > 0.55 ? "#3b82f6" : "#e2e8f0",
								color: active > 0.55 ? "#ffffff" : "#94a3b8",
								transform: `translate3d(-50%, -50%, 0) scale(${interpolate(active, [0, 1], [0.82, 1.08])})`,
							}}
						>
							<Check size={17} strokeWidth={3} />
						</div>
					);
				})}
			</div>
			<div className="mt-4 grid grid-cols-4 text-[13px] font-black uppercase text-slate-400">
				<span>forming</span>
				<span>active</span>
				<span>shipping</span>
				<span>done</span>
			</div>
		</div>
	);
}

function WorkspaceBoard({ frame, fps }: { frame: number; fps: number }) {
	const columns = ["forming", "active", "shipping"] as const;

	return (
		<div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<p className="text-[21px] font-black text-slate-950">작업 보드</p>
				<p className="rounded-md bg-blue-50 px-3 py-1.5 text-[12px] font-black text-blue-600">
					자동 동기화
				</p>
			</div>
			<div className="grid grid-cols-3 gap-3">
				{columns.map((column) => (
					<div
						className="min-h-[350px] rounded-lg bg-slate-50 p-3"
						key={column}
					>
						<p className="mb-3 text-[12px] font-black uppercase text-slate-400">
							{column}
						</p>
						<div className="space-y-3">
							{workspaceTasks
								.filter((task) => task.column === column)
								.map((task, index) => (
									<WorkspaceTaskCard
										frame={frame}
										fps={fps}
										index={index}
										key={task.id}
										task={task}
									/>
								))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function WorkspaceTaskCard({
	frame,
	fps,
	index,
	task,
}: {
	frame: number;
	fps: number;
	index: number;
	task: (typeof workspaceTasks)[number];
}) {
	const enter = motionProgress(
		frame,
		seconds(1.15 + task.delay, fps),
		seconds(0.58, fps),
	);
	const lift = motionProgress(frame, seconds(2.55, fps), seconds(0.65, fps));

	return (
		<div
			className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
			style={{
				opacity: enter,
				transform: `translate3d(0, ${interpolate(enter, [0, 1], [24, 0]) - (task.id === "contract" ? lift * 8 : 0)}px, 0)`,
				boxShadow:
					task.id === "contract" && lift > 0.2
						? "0 18px 38px rgba(16,185,129,0.16)"
						: "0 1px 2px rgba(15,23,42,0.04)",
			}}
		>
			<div className="mb-4 flex items-center justify-between">
				<span
					className="h-3 w-3 rounded-full"
					style={{ backgroundColor: task.color }}
				/>
				<span className="text-[11px] font-black text-slate-400">
					D-{4 - index}
				</span>
			</div>
			<p className="text-[15px] font-black leading-snug text-slate-950">
				{task.title}
			</p>
			<p className="mt-2 text-[12px] font-bold text-slate-400">{task.meta}</p>
		</div>
	);
}

function WorkspaceChecklist({ frame, fps }: { frame: number; fps: number }) {
	return (
		<div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<p className="text-[21px] font-black text-slate-950">체크리스트</p>
				<CalendarClock size={22} className="text-blue-500" />
			</div>
			<div className="space-y-3">
				{workspaceChecklist.map((item, index) => {
					const done = motionProgress(
						frame,
						seconds(2.0 + index * 0.36, fps),
						seconds(0.42, fps),
					);

					return (
						<div
							className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-4"
							key={item}
						>
							<div
								className="grid h-8 w-8 place-items-center rounded-lg border bg-white"
								style={{
									borderColor: done > 0.5 ? "#10b981" : "#dbeafe",
									backgroundColor: done > 0.5 ? "#ecfdf5" : "#ffffff",
								}}
							>
								<Check
									size={17}
									strokeWidth={3}
									style={{ color: "#10b981", opacity: done }}
								/>
							</div>
							<p className="text-[15px] font-black text-slate-800">{item}</p>
						</div>
					);
				})}
			</div>
			<div className="mt-5 rounded-lg bg-blue-50 p-4">
				<p className="text-[13px] font-black text-blue-600">다음 액션</p>
				<p className="mt-1 text-[17px] font-black text-slate-950">
					배포 체크리스트 만들기
				</p>
			</div>
		</div>
	);
}

function WorkspaceActionDrawer({ progress }: { progress: number }) {
	return (
		<div
			className="absolute bottom-7 right-7 w-[390px] rounded-lg border border-emerald-100 bg-white/96 p-5 text-slate-950 shadow-[0_24px_72px_rgba(15,118,110,0.16)] backdrop-blur"
			style={{
				opacity: progress,
				transform: `translate3d(${interpolate(progress, [0, 1], [46, 0])}px, 0, 0)`,
			}}
		>
			<div className="mb-3 flex items-center gap-3">
				<div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
					<Check size={21} strokeWidth={3} />
				</div>
				<div>
					<p className="text-[18px] font-black">active 단계로 전환</p>
					<p className="text-[12px] font-bold text-slate-500">
						팀원에게 다음 액션이 공유됩니다
					</p>
				</div>
			</div>
			<div className="h-2 rounded-full bg-emerald-100">
				<div className="h-2 w-[72%] rounded-full bg-emerald-500" />
			</div>
		</div>
	);
}

function WorkspaceTouchPulse({ frame, fps }: { frame: number; fps: number }) {
	const stageTap = motionProgress(
		frame,
		seconds(2.18, fps),
		seconds(0.46, fps),
	);
	const taskTap = motionProgress(frame, seconds(2.78, fps), seconds(0.48, fps));
	const drawerTap = motionProgress(
		frame,
		seconds(3.62, fps),
		seconds(0.5, fps),
	);

	return (
		<>
			<TouchPulse color="#3b82f6" progress={stageTap} x={414} y={178} />
			<TouchPulse color="#10b981" progress={taskTap} x={332} y={464} />
			<TouchPulse color="#10b981" progress={drawerTap} x={694} y={674} />
		</>
	);
}

function TouchPulse({
	color,
	progress,
	x,
	y,
}: {
	color: string;
	progress: number;
	x: number;
	y: number;
}) {
	return (
		<div
			className="pointer-events-none absolute z-30 rounded-full"
			style={{
				border: `3px solid ${color}`,
				height: 54,
				left: x,
				opacity: interpolate(progress, [0, 0.18, 1], [0, 0.9, 0]),
				top: y,
				transform: `translate3d(-50%, -50%, 0) scale(${interpolate(progress, [0, 1], [0.42, 1.65])})`,
				width: 54,
			}}
		>
			<div
				className="absolute left-1/2 top-1/2 h-4 w-4 rounded-full"
				style={{
					backgroundColor: color,
					opacity: interpolate(progress, [0, 0.22, 1], [0, 0.75, 0]),
					transform: "translate3d(-50%, -50%, 0)",
				}}
			/>
		</div>
	);
}

function ReportDemoScene() {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const reveal = motionProgress(frame, 0, seconds(0.92, fps), EASE_IN_OUT);
	const revealEdgeTop = interpolate(reveal, [0, 1], [112, -18]);
	const revealEdgeBottom = interpolate(reveal, [0, 1], [102, -28]);
	const intro = motionProgress(frame, seconds(0.32, fps), seconds(0.84, fps));
	const windowProgress = motionProgress(
		frame,
		seconds(0.62, fps),
		seconds(1.02, fps),
	);

	return (
		<AbsoluteFill
			className="overflow-hidden bg-[#fbfdff] text-slate-950"
			style={{
				clipPath: `polygon(${revealEdgeTop}% 0, 100% 0, 100% 100%, ${revealEdgeBottom}% 100%)`,
			}}
		>
			<ReportDemoBackground frame={frame} fps={fps} />
			<ReportNarrativePanel frame={frame} fps={fps} progress={intro} />
			<ReportDemoWindow frame={frame} fps={fps} progress={windowProgress} />
			<MatchingRevealEdge reveal={reveal} />
		</AbsoluteFill>
	);
}

function ReportDemoBackground({ frame, fps }: { frame: number; fps: number }) {
	const grid = motionProgress(frame, seconds(0.1, fps), seconds(1.1, fps));
	const sweep = (frame % seconds(4.8, fps)) / seconds(4.8, fps);

	return (
		<>
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, #f8fbff 0%, #eef2ff 42%, #f0fdf4 72%, #fff7ed 100%)",
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					opacity: grid * 0.72,
					backgroundImage:
						"linear-gradient(to right, rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.07) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
				}}
			/>
			<div
				className="absolute inset-y-0 w-[380px]"
				style={{
					background:
						"linear-gradient(90deg, transparent, rgba(255,255,255,0.58), rgba(99,102,241,0.12), transparent)",
					opacity: grid * 0.72,
					transform: `translate3d(${interpolate(sweep, [0, 1], [-460, 2220])}px, 0, 0) skewX(-10deg)`,
				}}
			/>
		</>
	);
}

function ReportNarrativePanel({
	frame,
	fps,
	progress,
}: {
	frame: number;
	fps: number;
	progress: number;
}) {
	const underline = motionProgress(
		frame,
		seconds(1.22, fps),
		seconds(0.72, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="absolute left-[96px] top-[136px] w-[640px]"
			style={{
				opacity: progress,
				transform: `translate3d(${interpolate(progress, [0, 1], [54, 0])}px, 0, 0)`,
			}}
		>
			<div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-indigo-100 bg-white/82 px-5 py-3 text-[16px] font-black uppercase tracking-normal text-indigo-600 shadow-sm">
				<GitBranch size={21} />
				Solution 03
			</div>
			<h2 className="text-[70px] font-black leading-[0.98] tracking-normal text-slate-950">
				진척은 자동으로
				<br />
				<span className="relative inline-block text-indigo-500">
					팀에게 돌아와요
					<span
						className="absolute -bottom-2 left-0 h-2 rounded-full bg-indigo-200/80"
						style={{ width: `${underline * 100}%` }}
					/>
				</span>
			</h2>
			<p className="mt-8 text-[25px] font-bold leading-[1.44] tracking-normal text-slate-600">
				GitHub, 체크리스트, 활동 신호를 묶어
				<br />
				다음 액션이 필요한 지점을 바로 보여줍니다.
			</p>
		</div>
	);
}

function ReportDemoWindow({
	frame,
	fps,
	progress,
}: {
	frame: number;
	fps: number;
	progress: number;
}) {
	const insight = motionProgress(frame, seconds(3.15, fps), seconds(0.9, fps));

	return (
		<div
			className="absolute right-[42px] top-[64px] h-[900px] w-[1120px]"
			style={{
				opacity: progress,
				transform: `translate3d(${interpolate(progress, [0, 1], [112, 0])}px, ${Math.sin(frame / 42) * 4}px, 0)`,
			}}
		>
			<div className="absolute inset-0 overflow-hidden rounded-lg border border-indigo-100/80 bg-white shadow-[0_34px_100px_rgba(67,56,202,0.16)]">
				<div className="flex h-12 items-center gap-3 border-b border-slate-100 bg-slate-50 px-5">
					<span className="h-3 w-3 rounded-full bg-rose-300" />
					<span className="h-3 w-3 rounded-full bg-amber-300" />
					<span className="h-3 w-3 rounded-full bg-emerald-300" />
					<div className="ml-5 rounded-md bg-white px-4 py-1.5 text-[13px] font-bold text-slate-400">
						team-po.app/report
					</div>
				</div>

				<div className="grid h-[848px] grid-cols-[248px_1fr] bg-[#f8fbff]">
					<aside className="border-r border-slate-100 bg-white p-6">
						<div className="mb-7 flex items-center gap-3">
							<div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-500 text-white">
								<GitBranch size={22} />
							</div>
							<div>
								<p className="text-[21px] font-black text-slate-950">Team-po</p>
								<p className="text-[12px] font-bold text-slate-400">Report</p>
							</div>
						</div>
						<div className="space-y-2 text-[15px] font-black">
							<div className="px-4 py-3 text-slate-400">프로젝트 홈</div>
							<div className="px-4 py-3 text-slate-400">체크리스트</div>
							<div className="rounded-lg bg-indigo-50 px-4 py-3 text-indigo-600">
								진척 리포트
							</div>
							<div className="px-4 py-3 text-slate-400">회고</div>
						</div>
						<div className="mt-8 rounded-lg border border-indigo-100 bg-indigo-50 p-5">
							<p className="text-[13px] font-bold text-indigo-600">이번 주</p>
							<p className="mt-2 text-[25px] font-black text-slate-950">
								Shipping
							</p>
							<p className="mt-2 text-[12px] font-bold text-slate-500">
								릴리즈까지 D-3
							</p>
						</div>
					</aside>

					<main className="relative p-7">
						<div className="mb-6 flex items-start justify-between">
							<div>
								<p className="text-[32px] font-black text-slate-950">
									진척 리포트
								</p>
								<p className="mt-2 text-[15px] font-bold text-slate-500">
									GitHub + 체크리스트 + 팀 활동 신호
								</p>
							</div>
							<div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-5 py-3 text-[15px] font-black text-indigo-600">
								<Sparkles size={18} />
								AI signal synced
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4">
							{reportMetrics.map((metric, index) => (
								<ReportMetricCard
									frame={frame}
									fps={fps}
									index={index}
									key={metric.id}
									metric={metric}
								/>
							))}
						</div>

						<div className="mt-5 grid grid-cols-[1.1fr_0.9fr] gap-5">
							<ReportTrendChart frame={frame} fps={fps} />
							<ReportActivityList frame={frame} fps={fps} />
						</div>

						<ReportInsightPanel progress={insight} />
						<ReportTouchPulse frame={frame} fps={fps} />
					</main>
				</div>
			</div>
		</div>
	);
}

function ReportMetricCard({
	frame,
	fps,
	index,
	metric,
}: {
	frame: number;
	fps: number;
	index: number;
	metric: (typeof reportMetrics)[number];
}) {
	const enter = motionProgress(
		frame,
		seconds(1.05 + index * 0.15, fps),
		seconds(0.55, fps),
	);
	const fill = motionProgress(
		frame,
		seconds(1.7 + index * 0.18, fps),
		seconds(1.1, fps),
		EASE_IN_OUT,
	);

	return (
		<div
			className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm"
			style={{
				opacity: enter,
				transform: `translate3d(0, ${interpolate(enter, [0, 1], [24, 0])}px, 0)`,
			}}
		>
			<div className="mb-4 flex items-center justify-between">
				<p className="text-[14px] font-black text-slate-400">{metric.label}</p>
				<Activity size={17} style={{ color: metric.color }} />
			</div>
			<p className="text-[38px] font-black leading-none text-slate-950">
				{Math.round(metric.value * fill)}%
			</p>
			<div className="mt-5 h-2.5 rounded-full bg-slate-100">
				<div
					className="h-2.5 rounded-full"
					style={{
						backgroundColor: metric.color,
						width: `${metric.value * fill}%`,
					}}
				/>
			</div>
		</div>
	);
}

function ReportTrendChart({ frame, fps }: { frame: number; fps: number }) {
	const draw = motionProgress(frame, seconds(1.8, fps), seconds(1.6, fps));
	const points = [
		{ x: 32, y: 210 },
		{ x: 112, y: 172 },
		{ x: 192, y: 184 },
		{ x: 272, y: 118 },
		{ x: 352, y: 96 },
		{ x: 432, y: 62 },
	];

	return (
		<div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<p className="text-[21px] font-black text-slate-950">완주 추세</p>
					<p className="mt-1 text-[12px] font-bold text-slate-400">
						최근 6일 활동 흐름
					</p>
				</div>
				<p className="rounded-md bg-emerald-50 px-3 py-1.5 text-[12px] font-black text-emerald-600">
					+18%
				</p>
			</div>
			<svg
				aria-hidden="true"
				className="h-[258px] w-full"
				viewBox="0 0 470 260"
			>
				{[50, 110, 170, 230].map((y) => (
					<line
						key={y}
						stroke="rgba(148,163,184,0.24)"
						strokeDasharray="6 8"
						x1="24"
						x2="448"
						y1={y}
						y2={y}
					/>
				))}
				<polyline
					fill="none"
					points={points.map((point) => `${point.x},${point.y}`).join(" ")}
					stroke="#6366f1"
					strokeDasharray="680"
					strokeWidth="6"
					style={{
						strokeDashoffset: 680 * (1 - draw),
					}}
				/>
				{points.map((point, index) => {
					const dot = motionProgress(
						frame,
						seconds(2.2 + index * 0.12, fps),
						seconds(0.3, fps),
					);

					return (
						<circle
							cx={point.x}
							cy={point.y}
							fill="#ffffff"
							key={`${point.x}-${point.y}`}
							r={8 * dot}
							stroke="#6366f1"
							strokeWidth="5"
						/>
					);
				})}
			</svg>
		</div>
	);
}

function ReportActivityList({ frame, fps }: { frame: number; fps: number }) {
	return (
		<div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<p className="text-[21px] font-black text-slate-950">활동 신호</p>
				<GitPullRequest size={22} className="text-indigo-500" />
			</div>
			<div className="space-y-3">
				{reportRows.map((row, index) => {
					const enter = motionProgress(
						frame,
						seconds(1.55 + index * 0.22, fps),
						seconds(0.52, fps),
					);

					return (
						<div
							className="rounded-lg border border-slate-100 bg-slate-50/80 p-4"
							key={row.id}
							style={{
								opacity: enter,
								transform: `translate3d(0, ${interpolate(enter, [0, 1], [20, 0])}px, 0)`,
							}}
						>
							<div className="mb-3 flex items-center gap-3">
								<span
									className="h-3 w-3 rounded-full"
									style={{ backgroundColor: row.color }}
								/>
								<p className="text-[12px] font-black text-slate-400">
									{row.meta}
								</p>
							</div>
							<p className="text-[16px] font-black leading-snug text-slate-950">
								{row.title}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ReportInsightPanel({ progress }: { progress: number }) {
	return (
		<div
			className="absolute bottom-7 left-7 right-7 rounded-lg border border-indigo-100 bg-white/96 p-6 text-slate-950 shadow-[0_24px_72px_rgba(67,56,202,0.16)] backdrop-blur"
			style={{
				opacity: progress,
				transform: `translate3d(0, ${interpolate(progress, [0, 1], [44, 0])}px, 0)`,
			}}
		>
			<div className="grid grid-cols-[1fr_210px] gap-6">
				<div className="flex items-center gap-4">
					<div className="grid h-12 w-12 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
						<Sparkles size={25} strokeWidth={2.6} />
					</div>
					<div>
						<p className="text-[23px] font-black">
							이번 주 병목은 API 응답 지연
						</p>
						<p className="mt-1 text-[13px] font-bold text-slate-500">
							배포 체크리스트 전에 API 이슈를 먼저 닫는 것을 추천합니다.
						</p>
					</div>
				</div>
				<div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
					<p className="text-[13px] font-bold text-indigo-600">next action</p>
					<p className="mt-2 text-[20px] font-black text-slate-950">
						BE 리뷰 요청
					</p>
				</div>
			</div>
		</div>
	);
}

function ReportTouchPulse({ frame, fps }: { frame: number; fps: number }) {
	const metricTap = motionProgress(
		frame,
		seconds(1.76, fps),
		seconds(0.48, fps),
	);
	const chartTap = motionProgress(
		frame,
		seconds(2.72, fps),
		seconds(0.52, fps),
	);
	const insightTap = motionProgress(
		frame,
		seconds(3.62, fps),
		seconds(0.52, fps),
	);

	return (
		<>
			<TouchPulse color="#6366f1" progress={metricTap} x={178} y={170} />
			<TouchPulse color="#10b981" progress={chartTap} x={392} y={420} />
			<TouchPulse color="#6366f1" progress={insightTap} x={620} y={710} />
		</>
	);
}

function ClosingDemoScene() {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const reveal = motionProgress(frame, 0, seconds(0.92, fps), EASE_IN_OUT);
	const revealEdgeTop = interpolate(reveal, [0, 1], [112, -18]);
	const revealEdgeBottom = interpolate(reveal, [0, 1], [102, -28]);

	return (
		<AbsoluteFill
			className="overflow-hidden bg-[#fbfdff] text-slate-950"
			style={{
				clipPath: `polygon(${revealEdgeTop}% 0, 100% 0, 100% 100%, ${revealEdgeBottom}% 100%)`,
			}}
		>
			<KineticRecapBackground frame={frame} fps={fps} reveal={reveal} />
			<KineticRecapBrand frame={frame} fps={fps} />
			<KineticRecapRibbon frame={frame} fps={fps} />
			<KineticFeatureStream frame={frame} fps={fps} />
			<KineticRecapHeadline frame={frame} fps={fps} />
			<MatchingRevealEdge reveal={reveal} />
		</AbsoluteFill>
	);
}

function KineticRecapBackground({
	frame,
	fps,
	reveal,
}: {
	frame: number;
	fps: number;
	reveal: number;
}) {
	const grid = motionProgress(frame, seconds(0.08, fps), seconds(1.1, fps));
	const sweep = (frame % seconds(3.2, fps)) / seconds(3.2, fps);
	const halo = motionProgress(frame, seconds(2.7, fps), seconds(1.5, fps));

	return (
		<>
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, #f8fbff 0%, #eef6ff 34%, #f0fdf4 68%, #fff7ed 100%)",
					opacity: reveal,
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					opacity: grid * 0.72,
					backgroundImage:
						"linear-gradient(to right, rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.07) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
				}}
			/>
			<div
				className="absolute left-[138px] top-[170px] h-[760px] w-[760px] rounded-full border border-blue-200/60"
				style={{
					opacity: halo * 0.42,
					transform: `scale(${interpolate(halo, [0, 1], [0.82, 1.08])})`,
				}}
			/>
			<div
				className="absolute right-[96px] top-[112px] h-[820px] w-[820px] rounded-full border border-emerald-200/60"
				style={{
					opacity: halo * 0.32,
					transform: `scale(${interpolate(halo, [0, 1], [0.74, 1.02])})`,
				}}
			/>
			<div
				className="absolute top-[184px] h-[3px] w-[940px]"
				style={{
					background:
						"linear-gradient(90deg, transparent, rgba(16,185,129,0.42), rgba(59,130,246,0.34), rgba(245,158,11,0.28), transparent)",
					opacity: grid,
					transform: `translate3d(${interpolate(sweep, [0, 1], [-980, 2360])}px, 0, 0) rotate(-8deg)`,
				}}
			/>
		</>
	);
}

function KineticRecapBrand({ frame, fps }: { frame: number; fps: number }) {
	const brand = motionProgress(frame, seconds(0.22, fps), seconds(0.68, fps));
	const po = motionProgress(frame, seconds(0.66, fps), seconds(0.42, fps));

	return (
		<div
			className="absolute left-[96px] top-[86px] z-20 flex items-center gap-4"
			style={{
				opacity: brand,
				transform: `translate3d(0, ${interpolate(brand, [0, 1], [-28, 0])}px, 0)`,
			}}
		>
			<svg
				aria-hidden="true"
				className="h-[58px] w-[58px] overflow-visible"
				viewBox="0 0 140 140"
			>
				<path
					d="M32 38 L72 70 L32 102"
					fill="none"
					stroke="#1e293b"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="18"
				/>
				<rect fill="#10b981" height="22" rx="6" width="22" x="82" y="88" />
				<rect fill="#3b82f6" height="22" rx="6" width="22" x="110" y="60" />
				<rect fill="#6366f1" height="22" rx="6" width="22" x="138" y="32" />
			</svg>
			<div className="text-[41px] font-black leading-none tracking-normal">
				<span className="text-slate-900">Team</span>
				<span
					className="inline-block text-blue-500"
					style={{
						opacity: po,
						transform: `translate3d(${interpolate(po, [0, 1], [16, 0])}px, 0, 0)`,
					}}
				>
					-po
				</span>
			</div>
		</div>
	);
}

function KineticRecapHeadline({ frame, fps }: { frame: number; fps: number }) {
	const label = motionProgress(frame, seconds(1.35, fps), seconds(0.45, fps));
	const lineOne = motionProgress(frame, seconds(1.62, fps), seconds(0.58, fps));
	const lineTwo = motionProgress(frame, seconds(1.95, fps), seconds(0.58, fps));
	const lineThree = motionProgress(
		frame,
		seconds(2.32, fps),
		seconds(0.58, fps),
	);
	const lock = motionProgress(
		frame,
		seconds(3.36, fps),
		seconds(0.82, fps),
		EASE_IN_OUT,
	);
	const underline = motionProgress(
		frame,
		seconds(3.58, fps),
		seconds(0.78, fps),
		EASE_IN_OUT,
	);
	const shine = motionProgress(
		frame,
		seconds(3.18, fps),
		seconds(0.86, fps),
		EASE_IN_OUT,
	);
	const shineStyle: CSSProperties = {
		backgroundClip: "text",
		backgroundImage:
			"linear-gradient(112deg, transparent 0%, transparent 44%, rgba(219,234,254,0.18) 48%, rgba(255,255,255,0.88) 50%, rgba(96,165,250,0.42) 52%, transparent 57%, transparent 100%)",
		backgroundPosition: `${interpolate(shine, [0, 1], [-172, 190])}% 50%`,
		backgroundRepeat: "no-repeat",
		backgroundSize: "340% 100%",
		color: "transparent",
		filter: `drop-shadow(0 0 ${interpolate(shine, [0, 0.52, 1], [0, 11, 0])}px rgba(96, 165, 250, 0.22))`,
		opacity: interpolate(shine, [0, 0.14, 0.78, 1], [0, 0.68, 0.5, 0]),
		WebkitBackgroundClip: "text",
		WebkitTextFillColor: "transparent",
	};

	return (
		<div className="absolute left-[138px] top-[212px] z-20 w-[1020px]">
			<div
				className="mb-6 inline-flex items-center gap-3 rounded-lg border border-blue-100 bg-white/76 px-5 py-3 text-[15px] font-black uppercase tracking-normal text-blue-500 shadow-sm backdrop-blur"
				style={{
					opacity: label,
					transform: `translate3d(0, ${interpolate(label, [0, 1], [18, 0])}px, 0)`,
				}}
			>
				<Sparkles size={17} strokeWidth={2.7} />
				Kinetic Service Recap
			</div>
			<div className="relative w-[1020px]">
				<h2 className="text-[104px] font-black leading-[0.98] tracking-normal text-slate-950">
					<span
						className="block"
						style={{
							opacity: lineOne,
							transform: `translate3d(${interpolate(lineOne, [0, 1], [-54, 0])}px, 0, 0)`,
						}}
					>
						팀 찾기부터
					</span>
					<span
						className="block text-blue-500"
						style={{
							opacity: lineTwo,
							transform: `translate3d(${interpolate(lineTwo, [0, 1], [72, 0])}px, 0, 0)`,
						}}
					>
						완주까지
					</span>
					<span
						className="relative block"
						style={{
							opacity: lineThree,
							transform: `translate3d(0, ${interpolate(lineThree, [0, 1], [42, 0])}px, 0)`,
						}}
					>
						한 흐름으로
						<span
							className="absolute -bottom-4 left-1 h-3 rounded-full bg-blue-200/80"
							style={{ width: `${underline * 420}px` }}
						/>
					</span>
				</h2>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 text-[104px] font-black leading-[0.98] tracking-normal"
					style={shineStyle}
				>
					<span className="block">팀 찾기부터</span>
					<span className="block">완주까지</span>
					<span className="block">한 흐름으로</span>
				</div>
			</div>
			<p
				className="mt-10 max-w-[720px] text-[28px] font-extrabold leading-[1.42] text-slate-600"
				style={{
					opacity: lock,
					transform: `translate3d(0, ${interpolate(lock, [0, 1], [22, 0])}px, 0)`,
				}}
			>
				매칭 후 바로 팀 스페이스에서 작업하고, 진척을 보며 완주까지 이어갑니다.
			</p>
		</div>
	);
}

function KineticRecapRibbon({ frame, fps }: { frame: number; fps: number }) {
	const flowPath =
		"M-120 824 C250 640 516 884 786 712 C1048 545 1212 690 1464 542 C1638 440 1776 428 2060 544";
	const draw = motionProgress(
		frame,
		seconds(0.9, fps),
		seconds(2.5, fps),
		EASE_IN_OUT,
	);
	const sweep = motionProgress(
		frame,
		seconds(3.08, fps),
		seconds(1.05, fps),
		EASE_IN_OUT,
	);
	const comet = motionProgress(
		frame,
		seconds(4.72, fps),
		seconds(2.1, fps),
		EASE_IN_OUT,
	);
	const cometOpacity = interpolate(comet, [0, 0.06, 0.9, 1], [0, 1, 0.88, 0]);
	const dash = (frame % seconds(2.1, fps)) / seconds(2.1, fps);

	return (
		<svg
			aria-hidden="true"
			className="absolute inset-0 z-10 h-full w-full overflow-visible"
			viewBox="0 0 1920 1080"
		>
			<defs>
				<linearGradient id="kinetic-flow-gradient" x1="0" x2="1" y1="0" y2="0">
					<stop offset="0%" stopColor="#10b981" />
					<stop offset="38%" stopColor="#3b82f6" />
					<stop offset="68%" stopColor="#6366f1" />
					<stop offset="100%" stopColor="#f59e0b" />
				</linearGradient>
				<linearGradient id="kinetic-comet-gradient" x1="0" x2="1" y1="0" y2="0">
					<stop offset="0%" stopColor="rgba(96,165,250,0)" />
					<stop offset="45%" stopColor="rgba(219,234,254,0.76)" />
					<stop offset="78%" stopColor="rgba(255,255,255,0.96)" />
					<stop offset="100%" stopColor="rgba(16,185,129,0.68)" />
				</linearGradient>
				<filter
					id="kinetic-comet-blur"
					x="-20%"
					y="-80%"
					width="140%"
					height="260%"
				>
					<feGaussianBlur stdDeviation="7" />
				</filter>
			</defs>
			<path
				d={flowPath}
				fill="none"
				pathLength={1}
				stroke="rgba(148,163,184,0.22)"
				strokeLinecap="round"
				strokeWidth="34"
			/>
			<path
				d={flowPath}
				fill="none"
				pathLength={1}
				stroke="url(#kinetic-flow-gradient)"
				strokeDasharray={1}
				strokeDashoffset={1 - draw}
				strokeLinecap="round"
				strokeWidth="21"
			/>
			<path
				d={flowPath}
				fill="none"
				stroke="rgba(255,255,255,0.82)"
				strokeDasharray="20 52"
				strokeDashoffset={interpolate(dash, [0, 1], [220, -220])}
				strokeLinecap="round"
				strokeWidth="7"
				style={{ opacity: draw * 0.86 }}
			/>
			<path
				d={flowPath}
				fill="none"
				stroke="rgba(255,255,255,0.82)"
				strokeDasharray="170 1900"
				strokeDashoffset={interpolate(sweep, [0, 1], [1180, -760])}
				strokeLinecap="round"
				strokeWidth="10"
				style={{
					opacity: interpolate(sweep, [0, 0.16, 0.82, 1], [0, 0.42, 0.3, 0]),
				}}
			/>
			<path
				d={flowPath}
				fill="none"
				pathLength={1}
				stroke="rgba(147,197,253,0.46)"
				strokeDasharray="0.18 1"
				strokeDashoffset={1 - comet}
				strokeLinecap="round"
				strokeWidth="34"
				style={{
					filter: "url(#kinetic-comet-blur)",
					opacity: cometOpacity * draw * 0.62,
				}}
			/>
			<path
				d={flowPath}
				fill="none"
				pathLength={1}
				stroke="url(#kinetic-comet-gradient)"
				strokeDasharray="0.12 1"
				strokeDashoffset={1 - comet}
				strokeLinecap="round"
				strokeWidth="15"
				style={{
					opacity: cometOpacity * draw,
				}}
			/>
		</svg>
	);
}

function KineticFeatureStream({ frame, fps }: { frame: number; fps: number }) {
	return (
		<>
			{closingFlow.map((item, index) => (
				<KineticFeatureToken
					frame={frame}
					fps={fps}
					index={index}
					item={item}
					key={item.id}
				/>
			))}
		</>
	);
}

function KineticFeatureToken({
	frame,
	fps,
	index,
	item,
}: {
	frame: number;
	fps: number;
	index: number;
	item: (typeof closingFlow)[number];
}) {
	const targets = [
		{ x: 190, y: 782, fromX: -420, fromY: 150, rotate: -18 },
		{ x: 612, y: 850, fromX: -160, fromY: 360, rotate: 12 },
		{ x: 1110, y: 736, fromX: 280, fromY: 320, rotate: -10 },
		{ x: 1510, y: 602, fromX: 460, fromY: -170, rotate: 16 },
	] as const;
	const target = targets[index] ?? targets[0];
	const enter = motionProgress(
		frame,
		seconds(0.52 + index * 0.22, fps),
		seconds(0.72, fps),
		EASE_OUT,
	);
	const lock = motionProgress(
		frame,
		seconds(2.55 + index * 0.18, fps),
		seconds(0.58, fps),
		EASE_IN_OUT,
	);
	const pulse = motionProgress(
		frame,
		seconds(3.48 + index * 0.08, fps),
		seconds(0.72, fps),
		EASE_IN_OUT,
	);
	const ignition = motionProgress(
		frame,
		seconds(4.82 + index * 0.48, fps),
		seconds(0.76, fps),
		EASE_OUT,
	);
	const ignitionGlow = interpolate(ignition, [0, 0.32, 1], [0, 1, 0]);
	const float =
		Math.sin(frame / 13 + index * 1.8) * interpolate(lock, [0, 1], [20, 4]);

	return (
		<div
			className="absolute z-30 flex items-center gap-4 rounded-full border bg-white/86 px-5 py-4 shadow-[0_20px_64px_rgba(15,23,42,0.14)] backdrop-blur"
			style={{
				borderColor: item.color,
				left: target.x,
				top: target.y,
				opacity: enter,
				boxShadow: `0 20px 64px rgba(15,23,42,0.14), 0 0 ${interpolate(ignitionGlow, [0, 1], [0, 42])}px ${item.color}55`,
				transform: `translate3d(${interpolate(enter, [0, 1], [target.fromX, 0])}px, ${
					interpolate(enter, [0, 1], [target.fromY, 0]) + float
				}px, 0) rotate(${interpolate(enter, [0, 1], [target.rotate, 0])}deg) scale(${
					interpolate(enter, [0, 1], [0.68, 1]) *
					interpolate(pulse, [0, 0.48, 1], [1, 1.08, 1]) *
					interpolate(ignition, [0, 0.32, 1], [1, 1.045, 1])
				})`,
			}}
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-[-9px] rounded-full border-2"
				style={{
					borderColor: item.color,
					opacity: ignitionGlow * 0.62,
					transform: `scale(${interpolate(ignition, [0, 1], [0.9, 1.22])})`,
				}}
			/>
			<div
				className="relative grid h-14 w-14 place-items-center rounded-full text-white"
				style={{
					backgroundColor: item.color,
					boxShadow: `0 12px 32px ${item.color}44, 0 0 ${interpolate(ignitionGlow, [0, 1], [0, 28])}px ${item.color}88`,
				}}
			>
				<span
					aria-hidden="true"
					className="absolute inset-[-7px] rounded-full border"
					style={{
						borderColor: item.color,
						opacity: ignitionGlow * 0.7,
						transform: `scale(${interpolate(ignition, [0, 1], [0.86, 1.34])})`,
					}}
				/>
				<KineticFeatureIcon id={item.id} />
			</div>
			<div>
				<p className="text-[13px] font-black uppercase text-slate-400">
					0{index + 1}
				</p>
				<p className="mt-0.5 text-[22px] font-black text-slate-950">
					{item.label}
				</p>
			</div>
		</div>
	);
}

function KineticFeatureIcon({
	id,
}: {
	id: (typeof closingFlow)[number]["id"];
}) {
	if (id === "matching") {
		return <UsersRound size={28} strokeWidth={2.6} />;
	}

	if (id === "workspace") {
		return <Rocket size={28} strokeWidth={2.6} />;
	}

	if (id === "report") {
		return <GitBranch size={28} strokeWidth={2.6} />;
	}

	return <BadgeCheck size={28} strokeWidth={2.6} />;
}

function FinaleLogoScene() {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const reveal = motionProgress(frame, 0, seconds(0.82, fps), EASE_IN_OUT);
	const prompt = motionProgress(frame, seconds(0.22, fps), seconds(0.6, fps));
	const blockOne = motionProgress(
		frame,
		seconds(0.46, fps),
		seconds(0.44, fps),
	);
	const blockTwo = motionProgress(frame, seconds(0.6, fps), seconds(0.44, fps));
	const blockThree = motionProgress(
		frame,
		seconds(0.74, fps),
		seconds(0.44, fps),
	);
	const team = motionProgress(frame, seconds(0.9, fps), seconds(0.62, fps));
	const po = motionProgress(frame, seconds(1.36, fps), seconds(0.5, fps));
	const message = motionProgress(frame, seconds(1.86, fps), seconds(0.8, fps));
	const underline = motionProgress(
		frame,
		seconds(2.2, fps),
		seconds(0.9, fps),
		EASE_IN_OUT,
	);
	const finalPulse = motionProgress(
		frame,
		seconds(4.2, fps),
		seconds(1.4, fps),
		EASE_IN_OUT,
	);

	return (
		<AbsoluteFill className="overflow-hidden bg-[#f8fbff] text-slate-950">
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, #f8fbff 0%, #eef6ff 46%, #ecfdf5 78%, #fff7ed 100%)",
					opacity: reveal,
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					opacity: reveal * 0.72,
					backgroundImage:
						"linear-gradient(to right, rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.07) 1px, transparent 1px)",
					backgroundSize: "58px 58px",
					maskImage:
						"radial-gradient(circle at 50% 48%, black 0%, black 56%, transparent 84%)",
				}}
			/>
			{[
				{ top: 150, delay: 0, color: "rgba(59,130,246,0.22)" },
				{ top: 826, delay: 42, color: "rgba(16,185,129,0.22)" },
				{ top: 936, delay: 88, color: "rgba(245,158,11,0.2)" },
			].map((line) => {
				const travel =
					((frame + line.delay) % seconds(5.6, fps)) / seconds(5.6, fps);

				return (
					<div
						className="absolute h-px w-[820px] rounded-full"
						key={`${line.top}-${line.delay}`}
						style={{
							background: `linear-gradient(90deg, transparent, ${line.color}, transparent)`,
							opacity: reveal * Math.sin(travel * Math.PI),
							top: line.top,
							transform: `translate3d(${interpolate(travel, [0, 1], [-920, 2280])}px, 0, 0)`,
						}}
					/>
				);
			})}

			<div
				className="absolute left-1/2 top-[132px] h-[300px] w-[980px]"
				style={{
					opacity: reveal,
					transform: `translate3d(-50%, ${interpolate(reveal, [0, 1], [42, 0])}px, 0)`,
				}}
			>
				<svg
					aria-hidden="true"
					className="absolute left-[70px] top-[18px] h-[190px] w-[190px] overflow-visible"
					viewBox="0 0 140 140"
				>
					<path
						d="M32 38 L72 70 L32 102"
						fill="none"
						stroke="#1e293b"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="20"
						style={{
							strokeDasharray: 130,
							strokeDashoffset: 130 * (1 - prompt),
						}}
					/>
				</svg>
				<LogoBlock progress={blockOne} x={224} y={162} color="#10b981" />
				<LogoBlock progress={blockTwo} x={272} y={114} color="#3b82f6" />
				<LogoBlock progress={blockThree} x={320} y={66} color="#6366f1" />
				<div className="absolute left-[398px] top-[72px] flex h-[156px] w-[760px] origin-left whitespace-nowrap text-[146px] font-black leading-none tracking-normal">
					<span
						className="inline-block text-slate-800"
						style={{
							clipPath: `inset(0 ${100 - team * 100}% 0 0)`,
							transform: `skewX(-15deg) translate3d(${interpolate(team, [0, 1], [-32, 0])}px, 0, 0)`,
						}}
					>
						Team
					</span>
					<span
						className="inline-block text-blue-500"
						style={{
							filter: `blur(${interpolate(po, [0, 1], [8, 0])}px)`,
							opacity: po,
							transform: `skewX(-15deg) translate3d(${interpolate(po, [0, 1], [44, 0])}px, 0, 0) scale(${interpolate(
								po,
								[0, 1],
								[0.94, 1],
							)})`,
						}}
					>
						-po
					</span>
				</div>
			</div>

			<div
				className="absolute left-1/2 top-[448px] w-[1320px] -translate-x-1/2 text-center"
				style={{
					opacity: message,
					transform: `translate3d(-50%, ${interpolate(message, [0, 1], [48, 0])}px, 0)`,
				}}
			>
				<p className="text-[86px] font-black leading-[1.04] tracking-normal text-slate-950">
					사이드 프로젝트를
					<br />
					<span className="relative inline-block text-blue-500">
						끝까지 움직이게
						<span
							className="absolute -bottom-3 left-0 h-3 rounded-full bg-blue-200/90"
							style={{ width: `${underline * 100}%` }}
						/>
					</span>
				</p>
				<p className="mt-9 text-[31px] font-extrabold leading-tight tracking-normal text-slate-600">
					팀 찾기부터 완주까지, Team-po
				</p>
			</div>

			<div
				className="absolute bottom-[96px] left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-lg border border-blue-100 bg-white/82 px-8 py-5 text-[22px] font-black text-slate-800 shadow-[0_22px_70px_rgba(30,64,175,0.14)] backdrop-blur"
				style={{
					opacity: interpolate(finalPulse, [0, 0.45, 1], [0, 1, 1]),
					transform: `translate3d(-50%, ${interpolate(finalPulse, [0, 1], [28, 0])}px, 0) scale(${interpolate(finalPulse, [0, 0.55, 1], [0.96, 1.03, 1])})`,
				}}
			>
				<Sparkles size={28} className="text-blue-500" />팀 프로젝트의 시작과
				완주를 한 곳에서
			</div>
		</AbsoluteFill>
	);
}

function issueColor(color: (typeof issueNodes)[number]["color"]) {
	if (color === "blue") {
		return "#3b82f6";
	}

	if (color === "emerald") {
		return "#10b981";
	}

	if (color === "amber") {
		return "#f59e0b";
	}

	if (color === "rose") {
		return "#f43f5e";
	}

	return "#6366f1";
}

function cardStyle(
	frame: number,
	fps: number,
	startSeconds: number,
	floatOffset: number,
	yOffset: number,
): CSSProperties {
	const enter = motionProgress(
		frame,
		seconds(startSeconds, fps),
		seconds(0.82, fps),
	);
	const y =
		interpolate(enter, [0, 1], [yOffset, 0]) +
		Math.sin(frame / 27 + floatOffset) * 5;

	return {
		opacity: enter,
		transform: `translate3d(${interpolate(enter, [0, 1], [72, 0])}px, ${y}px, 0) scale(${interpolate(
			enter,
			[0, 1],
			[0.94, 1],
		)})`,
	};
}

function seconds(value: number, fps: number) {
	return Math.round(value * fps);
}

function motionProgress(
	frame: number,
	start: number,
	duration: number,
	easing: (value: number) => number = EASE_OUT,
) {
	return interpolate(frame, [start, start + duration], [0, 1], {
		easing,
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
}
