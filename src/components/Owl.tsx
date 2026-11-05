import owlImg from "@/assets/owl-keeper.png";
import { cn } from "@/lib/utils";

/** The Keykeeper Owl — Alohomora!'s mascot. Static illustration with a
 *  gentle CSS bob/sway; animation respects prefers-reduced-motion. */
export function Owl({
  size = 96,
  className,
  animate = true,
  alt = "The Keykeeper Owl, Alohomora!'s mascot",
}: {
  size?: number;
  className?: string;
  animate?: boolean;
  alt?: string;
}) {
  return (
    <img
      src={owlImg}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={cn("shrink-0 select-none", animate && "animate-bob", className)}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
