import { cn } from "@/lib/utils";

export function NeonTitle({
  text,
  className,
  size = "lg",
}: {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-4xl sm:text-5xl",
    md: "text-6xl sm:text-7xl md:text-8xl",
    lg: "text-[clamp(3.2rem,16vw,11rem)]",
  };
  return (
    <div className={cn("inline-flex flex-col items-stretch", className)}>
      <span className="neon-bar" />
      <span className={cn("neon-text animate-neon px-2 text-center uppercase leading-[0.9]", sizes[size])}>{text}</span>
      <span className="neon-bar" />
    </div>
  );
}

export function NeonWordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "neon-text-solid inline-block select-none uppercase leading-[0.85] tracking-tight",
        compact ? "text-lg" : "text-xl sm:text-2xl",
        className,
      )}
    >
      Founders
      <br />
      Arena
    </span>
  );
}
