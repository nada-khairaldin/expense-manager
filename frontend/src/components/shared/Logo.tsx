import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /** Logo display variant:
   * 'icon': only the hand + coin + sprout emblem
   * 'full': emblem with Arabic & English text underneath
   * 'horizontal': emblem next to Arabic title & English subtitle
   */
  variant?: "icon" | "full" | "horizontal";
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function Logo({
  variant = "horizontal",
  size = "md",
  className,
  showText = true,
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 28, fullWidth: 100, fullHeight: 55, textTitle: "text-sm", textSub: "text-[9px]" },
    md: { icon: 36, fullWidth: 140, fullHeight: 75, textTitle: "text-lg", textSub: "text-[10px]" },
    lg: { icon: 48, fullWidth: 180, fullHeight: 95, textTitle: "text-2xl", textSub: "text-xs" },
  };

  const currentSize = sizeMap[size];

  if (variant === "full") {
    return (
      <div className={cn("inline-flex flex-col items-center", className)}>
        {/* Light theme logo */}
        <Image
          src="/images/logo.png"
          alt={`${siteConfig.name} - ${siteConfig.nameEn}`}
          width={currentSize.fullWidth}
          height={currentSize.fullHeight}
          className="dark:hidden object-contain"
          priority
        />
        {/* Dark theme logo */}
        <Image
          src="/images/logo-white.png"
          alt={`${siteConfig.name} - ${siteConfig.nameEn}`}
          width={currentSize.fullWidth}
          height={currentSize.fullHeight}
          className="hidden dark:block object-contain"
          priority
        />
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden p-1 bg-brand-teal/10 dark:bg-brand-teal/20",
          className
        )}
        style={{ width: currentSize.icon + 10, height: currentSize.icon + 10 }}
      >
        <Image
          src="/images/logo-icon.png"
          alt={siteConfig.name}
          width={currentSize.icon}
          height={currentSize.icon}
          className="dark:hidden object-contain"
          priority
        />
        <Image
          src="/images/logo-icon-white.png"
          alt={siteConfig.name}
          width={currentSize.icon}
          height={currentSize.icon}
          className="hidden dark:block object-contain"
          priority
        />
      </div>
    );
  }

  // 'horizontal' variant: Emblem + Typography
  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden p-1 bg-brand-teal/10 dark:bg-brand-teal/20"
        style={{ width: currentSize.icon + 10, height: currentSize.icon + 10 }}
      >
        <Image
          src="/images/logo-icon.png"
          alt={siteConfig.name}
          width={currentSize.icon}
          height={currentSize.icon}
          className="dark:hidden object-contain"
          priority
        />
        <Image
          src="/images/logo-icon-white.png"
          alt={siteConfig.name}
          width={currentSize.icon}
          height={currentSize.icon}
          className="hidden dark:block object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-extrabold text-brand-primary dark:text-foreground tracking-tight",
              currentSize.textTitle
            )}
          >
            {siteConfig.name}
          </span>
          <span
            className={cn(
              "font-sans text-text-muted mt-1 tracking-wider uppercase",
              currentSize.textSub
            )}
          >
            {siteConfig.nameEn}
          </span>
        </div>
      )}
    </div>
  );
}
