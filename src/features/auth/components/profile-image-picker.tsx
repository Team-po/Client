import { useRef } from "react";
import { Camera } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileImagePickerProps {
	alt: string;
	className?: string;
	fallback: string;
	inputId: string;
	invalid?: boolean;
	onBlur?: () => void;
	onFileChange: (file: File | null) => void;
	previewUrl: string | null;
	size?: "md" | "lg";
}

export function ProfileImagePicker({
	alt,
	className,
	fallback,
	inputId,
	invalid = false,
	onBlur,
	onFileChange,
	previewUrl,
	size = "md",
}: ProfileImagePickerProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<div className={cn("relative shrink-0", className)}>
			<input
				accept="image/jpeg,image/png,image/gif,image/webp"
				aria-invalid={invalid}
				className="sr-only"
				id={inputId}
				onBlur={onBlur}
				onChange={(event) => {
					onFileChange(event.target.files?.[0] ?? null);
				}}
				ref={inputRef}
				type="file"
			/>
			<button
				aria-label="프로필 이미지 변경"
				className="group relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				onClick={() => inputRef.current?.click()}
				type="button"
			>
				<Avatar
					className={cn(
						"border border-border/70 shadow-soft transition-transform duration-200 group-hover:scale-[1.02]",
						size === "lg" ? "size-24" : "size-16",
						invalid && "border-destructive/60",
					)}
				>
					<AvatarImage alt={alt} src={previewUrl ?? undefined} />
					<AvatarFallback>{fallback}</AvatarFallback>
				</Avatar>
				<span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-brand-ink/65 text-[11px] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
					<Camera className="size-4" />
					수정
				</span>
			</button>
		</div>
	);
}
