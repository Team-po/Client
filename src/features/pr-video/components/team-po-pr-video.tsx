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
		</AbsoluteFill>
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
		<div className="relative h-[160px] rounded-lg bg-slate-950">
			<svg
				aria-hidden="true"
				className="absolute inset-0 h-full w-full"
				viewBox="0 0 160 166"
			>
				<path
					d="M80 32 C126 42 136 112 82 132 C30 112 34 48 80 32Z"
					fill="none"
					stroke="rgba(96,165,250,0.38)"
					strokeDasharray="10 10"
					strokeWidth="2"
					style={{
						strokeDashoffset: interpolate(pulse, [0, 1], [42, -42]),
					}}
				/>
				<path
					d="M38 112 L80 32 L126 104 L82 132 Z"
					fill="none"
					stroke="rgba(16,185,129,0.4)"
					strokeWidth="2"
				/>
			</svg>
			<OrbitNode label="FE" left={62} top={17} progress={pulse} />
			<OrbitNode label="BE" left={112} top={88} progress={pulse * 0.9} />
			<OrbitNode label="PM" left={22} top={96} progress={pulse * 0.82} />
			<div className="absolute left-[64px] top-[78px] grid h-9 w-9 place-items-center rounded-lg bg-white text-[11px] font-black text-slate-950">
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
					label="릴리즈 체크리스트 생성"
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
			<div className="mt-4 rounded-lg bg-slate-950 px-4 py-3 text-[12px] font-bold text-white">
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
			<div
				className="absolute left-[128px] top-[128px] w-[790px]"
				style={{
					opacity: content,
					transform: `translate3d(${interpolate(content, [0, 1], [64, 0])}px, 0, 0)`,
				}}
			>
				<div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white/80 px-5 py-3 text-[16px] font-black uppercase tracking-normal text-slate-500 shadow-sm">
					<CircleDashed size={20} className="text-amber-500" />
					Before Team-po
				</div>
				<h2 className="text-[84px] font-black leading-[0.96] tracking-normal text-slate-950">
					사이드 프로젝트,
					<br />
					<span className="text-blue-500">시작 전부터 흩어져요</span>
				</h2>
				<p className="mt-9 max-w-[750px] text-[29px] font-bold leading-[1.42] tracking-normal text-slate-600">
					팀원 찾기, 역할 조율, 진행 공유가 서로 다른 곳에 흩어지면 좋은
					아이디어도 완주까지 가기 어렵습니다.
				</p>
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
			</svg>
			{issueNodes.map((node) => (
				<IssueNode frame={frame} fps={fps} key={node.id} node={node} />
			))}
			<div
				className="absolute left-[392px] top-[372px] w-[288px] rounded-lg border border-slate-200 bg-white/92 p-6 shadow-[0_20px_58px_rgba(15,23,42,0.12)]"
				style={{
					opacity: motionProgress(frame, seconds(2.1, fps), seconds(0.8, fps)),
					transform: `translate3d(0, ${Math.sin(frame / 24) * 5}px, 0)`,
				}}
			>
				<div className="mb-4 flex items-center gap-2 text-[16px] font-black text-slate-900">
					<AlertTriangle size={19} className="text-amber-500" />
					진행 신호가 분산됨
				</div>
				<div className="space-y-3">
					<SignalBar color="#3b82f6" delay={2.25} frame={frame} fps={fps} />
					<SignalBar color="#10b981" delay={2.42} frame={frame} fps={fps} />
					<SignalBar color="#f59e0b" delay={2.59} frame={frame} fps={fps} />
				</div>
			</div>
		</div>
	);
}

function IssueNode({
	frame,
	fps,
	node,
}: {
	frame: number;
	fps: number;
	node: (typeof issueNodes)[number];
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

	return (
		<div
			className="absolute w-[300px] rounded-lg border border-slate-200 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur"
			style={{
				left: node.x,
				top: node.y,
				opacity: enter,
				transform: `translate3d(${interpolate(enter, [0, 1], [76, 0])}px, ${float}px, 0) rotate(${node.rotation * enter}deg) scale(${interpolate(
					enter,
					[0, 1],
					[0.94, 1],
				)})`,
			}}
		>
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
	const chips = motionProgress(frame, seconds(1.65, fps), seconds(0.9, fps));

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
				프로필 신호로
				<br />
				<span className="relative inline-block text-emerald-500">
					팀을 빠르게 묶어요
					<span
						className="absolute -bottom-2 left-0 h-2 rounded-full bg-emerald-200/80"
						style={{ width: `${underline * 100}%` }}
					/>
				</span>
			</h2>
			<p className="mt-8 text-[25px] font-bold leading-[1.44] tracking-normal text-slate-600">
				관심사, 역할, 가능한 속도를 한 화면에서 맞춰 보고
				<br />
				시작 가능한 조합만 선명하게 보여줍니다.
			</p>
			<div className="mt-8 grid w-[610px] grid-cols-3 gap-3">
				{matchingSignals.map((signal, index) => {
					const item = Math.max(0, Math.min(1, chips - index * 0.18));

					return (
						<div
							className="rounded-lg border border-white/80 bg-white/78 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur"
							key={signal.id}
							style={{
								opacity: item,
								transform: `translate3d(0, ${interpolate(item, [0, 1], [24, 0])}px, 0)`,
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
							<p className="text-[18px] font-black text-slate-900">
								{signal.value}
							</p>
						</div>
					);
				})}
			</div>
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
						className="rounded-lg bg-slate-950 px-6 py-3 text-[16px] font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)]"
						style={{
							transform: `scale(${interpolate(buttonClick, [0, 0.45, 1], [1, 0.96, 1.04])})`,
							boxShadow: `0 14px ${interpolate(buttonClick, [0, 1], [30, 48])}px rgba(15,23,42,0.24)`,
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
						<div className="mt-6 rounded-lg bg-slate-950 p-5 text-white">
							<p className="text-[13px] font-bold text-emerald-200">
								AI 추천 기준
							</p>
							<p className="mt-2 text-[18px] font-black leading-snug">
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
			<ProductCursor frame={frame} fps={fps} />
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

function ProductCursor({ frame, fps }: { frame: number; fps: number }) {
	const visible = motionProgress(frame, seconds(1.35, fps), seconds(0.35, fps));
	const click = motionProgress(frame, seconds(1.9, fps), seconds(0.35, fps));
	const selectClick = motionProgress(
		frame,
		seconds(2.65, fps),
		seconds(0.45, fps),
	);
	const x = interpolate(
		frame,
		[
			seconds(1.35, fps),
			seconds(1.9, fps),
			seconds(2.55, fps),
			seconds(3.25, fps),
			seconds(4.2, fps),
		],
		[860, 940, 612, 752, 790],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);
	const y = interpolate(
		frame,
		[
			seconds(1.35, fps),
			seconds(1.9, fps),
			seconds(2.55, fps),
			seconds(3.25, fps),
			seconds(4.2, fps),
		],
		[146, 94, 326, 508, 640],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);
	const ring = Math.max(click, selectClick);

	return (
		<div
			className="pointer-events-none absolute z-30"
			style={{
				left: x,
				top: y,
				opacity: visible,
				transform: "translate3d(0, 0, 0)",
			}}
		>
			<div
				className="absolute h-12 w-12 rounded-full border-2 border-emerald-400"
				style={{
					opacity: interpolate(ring, [0, 0.2, 1], [0, 0.9, 0]),
					transform: `translate3d(-19px, -19px, 0) scale(${interpolate(ring, [0, 1], [0.45, 1.35])})`,
				}}
			/>
			<div
				style={{
					borderBottom: "18px solid #0f172a",
					borderRight: "14px solid transparent",
					filter: "drop-shadow(0 12px 18px rgba(15,23,42,0.22))",
					height: 0,
					transform: "rotate(-28deg)",
					width: 0,
				}}
			/>
		</div>
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
			className="absolute bottom-6 left-6 right-6 rounded-lg border border-emerald-100 bg-slate-950 p-6 text-white shadow-[0_26px_80px_rgba(15,23,42,0.25)]"
			style={{
				opacity: progress,
				transform: `translate3d(0, ${interpolate(progress, [0, 1], [44, 0])}px, 0)`,
			}}
		>
			<div className="grid grid-cols-[1fr_210px] gap-6">
				<div>
					<div className="mb-4 flex items-center gap-3">
						<div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-400 text-slate-950">
							<BadgeCheck size={25} strokeWidth={2.6} />
						</div>
						<div>
							<p className="text-[24px] font-black leading-tight">
								MVP 런칭 스쿼드 추천
							</p>
							<p className="mt-1 text-[13px] font-bold text-slate-300">
								목표, 속도, 역할 균형이 맞는 조합입니다.
							</p>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-2">
						{["FE", "BE", "PM"].map((role, index) => (
							<div
								className="rounded-lg bg-white px-3 py-3 text-center text-[15px] font-black text-slate-950"
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
					className="rounded-lg bg-white/10 p-5"
					style={{
						boxShadow: `0 0 ${interpolate(spark, [0, 1], [0, 28])}px rgba(52,211,153,0.45)`,
					}}
				>
					<p className="text-[13px] font-bold text-emerald-200">match score</p>
					<p className="mt-2 text-[42px] font-black leading-none text-white">
						98%
					</p>
					<p className="mt-2 text-[12px] font-bold text-slate-300">
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
