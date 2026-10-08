import Link from "next/link";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <defs>
        <linearGradient id="rl-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.55 0.21 262)" />
          <stop offset="1" stopColor="oklch(0.74 0.14 215)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#rl-g)" />
      {/* Matraz de laboratorio estilizado */}
      <path
        d="M13 8h6M14 8v6.2L9.6 21.8A2.2 2.2 0 0 0 11.5 25h9a2.2 2.2 0 0 0 1.9-3.2L18 14.2V8"
        fill="none"
        stroke="white"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11.4 20.5h9.2" stroke="white" strokeWidth="1.9" strokeLinecap="round" opacity=".55" />
      <circle cx="15" cy="17.6" r="1" fill="white" />
    </svg>
  );
}

export function Logo({ className, href = "/", tag }: { className?: string; href?: string; tag?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="font-display text-[1.05rem] font-semibold tracking-tight">
        Recruitment<span className="text-gradient">Lab</span>
      </span>
      {tag && (
        <span className="rounded-md bg-gradient-to-r from-brand to-brand-2 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
          {tag}
        </span>
      )}
    </Link>
  );
}

export function CompanyLogo({
  name,
  hue,
  size = "md",
  className,
}: {
  name: string;
  hue: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "size-7 text-[10px] rounded-lg", md: "size-10 text-xs rounded-xl", lg: "size-14 text-base rounded-2xl" };
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center font-display font-semibold text-white", sizes[size], className)}
      style={{
        background: `linear-gradient(135deg, oklch(0.62 0.17 ${hue}), oklch(0.48 0.17 ${hue + 25}))`,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

export function PersonAvatar({ name, className }: { name: string; className?: string }) {
  // Color estable a partir del nombre
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <div
      className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold", className)}
      style={{ background: `oklch(0.94 0.04 ${hue})`, color: `oklch(0.4 0.12 ${hue})` }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

export function MetaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M6.9 5C4.2 5 2 8.6 2 12.6c0 2.6 1.2 4.4 3.3 4.4 1.7 0 2.9-1.2 4.8-4.6l1.2-2.1.3-.5.3.5 1.1 1.9c2.1 3.6 3.4 4.8 5.6 4.8 2.4 0 3.4-2 3.4-4.4C22 8.5 19.8 5 17 5c-1.6 0-2.9 1-4.5 3.2L12 9l-.5-.8C9.9 5.9 8.6 5 6.9 5Zm.2 2.1c1 0 1.9.7 3.3 2.9l-1.3 2c-1.6 2.6-2.4 3-3.2 3-.9 0-1.6-.9-1.6-2.5 0-2.9 1.3-5.4 2.8-5.4Zm9.8 0c1.6 0 2.9 2.6 2.9 5.5 0 1.4-.4 2.4-1.4 2.4-.9 0-1.6-.7-3.3-3.4l-1.2-2.2C15 8 15.8 7.1 16.9 7.1Z"
      />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z"
      />
    </svg>
  );
}

export function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M6.9 8.8H3.6V20h3.3V8.8ZM5.3 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.4 13.6c0-3-1.6-5-4.3-5-1.4 0-2.4.8-2.8 1.5V8.8h-3.2V20h3.3v-5.6c0-1.5.3-2.9 2.1-2.9 1.8 0 1.8 1.7 1.8 3V20h3.3l-.2-6.4Z"
      />
    </svg>
  );
}
