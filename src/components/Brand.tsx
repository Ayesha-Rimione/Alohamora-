import logoImg from "@/assets/alohomora-logo.png";
import { cn } from "@/lib/utils";

/** The Alohomora! golden key seal + wordmark. */
export function LogoLockup({
  size = 40,
  showWordmark = true,
  className,
  wordmarkClassName,
}: {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src={logoImg}
        alt="Alohomora! golden key logo"
        width={size}
        height={size}
        loading="lazy"
        style={{ width: size, height: size }}
        className="shrink-0"
      />
      {showWordmark && (
        <span
          className={cn(
            "font-display font-semibold tracking-wide leading-none",
            wordmarkClassName ?? "text-xl",
          )}
        >
          Alohomora<span className="text-gold">!</span>
        </span>
      )}
    </span>
  );
}
