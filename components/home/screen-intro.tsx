"use client";

import {
  BackgroundMedia,
  type BackgroundMediaProps,
} from "@/components/home/background-media";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const latestPosts = [
  { title: "Hello World", href: "/", date: "2026-06-28" },
  { title: "Test Page", href: "/test", date: "2026-06-25" },
];

const tools = ["Arch Linux", "ESP-IDF", "Next.js", "TypeScript"];

export function ScreenIntro({
  sectionBg,
}: {
  sectionBg?: BackgroundMediaProps | null;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback: 如果元素已在视口内，立即显示
    // 这修复了返回导航时 IntersectionObserver 可能不触发的问题
    const checkVisible = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (checkVisible()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="snap-screen relative flex flex-col overflow-hidden px-6 sm:px-10 lg:px-16"
    >
      {/* ── 节专用背景（可选，覆盖全局背景） ── */}
      {sectionBg && <BackgroundMedia {...sectionBg} position="absolute" />}

      {/* ── Background ── */}
      {/* Dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          color: "var(--color-accent)",
        }}
      />
      {/* Scanline texture */}
      <div className="bg-scanline pointer-events-none absolute inset-0 opacity-40" />
      {/* Glow orbs */}
      <div
        className="pointer-events-none absolute -top-48 -right-48 size-125 rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "var(--color-accent-gradient)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-48 size-100 rounded-full opacity-[0.03] blur-3xl"
        style={{ background: "var(--color-accent-gradient)" }}
      />
      {/* Column guide lines - newspaper feel */}
      <div className="bg-column-line bg-column-line-1" />
      <div className="bg-column-line bg-column-line-2" />
      <div className="bg-column-line bg-column-line-3" />
      <div className="bg-column-line bg-column-line-4" />
      <div className="bg-column-line bg-column-line-5" />
      <div className="bg-column-line bg-column-line-6" />
      <div className="bg-column-line bg-column-line-7" />
      <div className="bg-column-line bg-column-line-8" />
      <div className="bg-column-line bg-column-line-9" />
      <div className="bg-column-line bg-column-line-10" />
      <div className="bg-column-line bg-column-line-11" />
      {/* Decorative watermark */}
      <div
        className={cn(
          "bg-watermark-deco transition-all duration-1000",
          visible ? "opacity-[0.01]" : "opacity-0",
        )}
        style={{
          fontSize: "clamp(10rem, 25vw, 22rem)",
          bottom: "3%",
          right: "4%",
          letterSpacing: "-0.06em",
        }}
      >
        2y.nz
      </div>
      {/* Corner ornament */}
      <div
        className={cn(
          "bg-ornament-corner bg-ornament-top-right transition-all duration-700",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          className="absolute top-0 right-0"
        >
          <path
            d="M58 2V58H2"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            opacity="0.3"
          />
          <path
            d="M44 2V44H2"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            opacity="0.15"
          />
        </svg>
      </div>
      {/* Decorative stamp */}
      <div
        className={cn(
          "bg-stamp transition-all delay-500 duration-700",
          visible ? "opacity-100" : "opacity-0",
        )}
        style={{ bottom: "12%", left: "6%" }}
      >
        Portfolio
      </div>

      {/* ── Masthead ── */}
      <div
        className={cn(
          "newspaper-masthead transition-all duration-500",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="newspaper-masthead-meta">2026.07.02</span>
      </div>

      {/* ── Newspaper Body — each card has its own frosted glass ── */}
      <div className="content-over-glass flex min-h-0 flex-1 flex-col gap-3 py-3">
        {/* ════════════════
           ROW 1: HEADLINE + AVATAR (two cards)
           ════════════════ */}
        <div className="flex flex-col gap-3 sm:min-h-0 sm:flex-2 sm:flex-row">
          {/* Headline card */}
          <div
            className={cn(
              "glass-panel flex flex-col justify-center rounded-2xl px-6 sm:flex-2",
              "transition-all duration-700",
              visible
                ? "translate-x-0 opacity-100"
                : "-translate-x-8 opacity-0",
            )}
          >
            <h1 className="text-7xl leading-[0.8] font-semibold sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem]">
              zty012
            </h1>
          </div>
          {/* Avatar card */}
          <div
            className={cn(
              "glass-panel flex flex-col items-center justify-center gap-5 rounded-2xl sm:flex-1",
              "transition-all delay-200 duration-700",
              visible
                ? "translate-x-0 scale-100 opacity-100"
                : "translate-x-8 scale-90 opacity-0",
            )}
          >
            <div className="bg-avatar h-28 w-28 rounded-full sm:h-36 sm:w-36 lg:h-44 lg:w-44 xl:h-42 xl:w-42" />
          </div>
        </div>

        {/* ════════════════
           ROW 2-3: TWO-COLUMN — left (bio + manifesto) + right (Latest)
           ════════════════ */}
        <div className="flex flex-col gap-3 sm:min-h-0 sm:flex-[3.5] sm:flex-row">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-3 sm:flex-2">
            {/* Bio card */}
            <div
              className={cn(
                "glass-panel flex flex-col justify-center gap-2 rounded-2xl px-5 py-4 sm:flex-1",
                "transition-all delay-150 duration-700",
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0",
              )}
            >
              <p className="max-w-prose text-lg leading-relaxed opacity-70 sm:text-xl">
                Protect What You Choose.
              </p>
              <p className="max-w-prose text-sm leading-relaxed opacity-40">
                全栈开发者与嵌入式爱好者。Next.js 构建数字界面，ESP32
                连接物理世界。相信好的工具链能释放创造力，喜欢在 Web
                和底层之间来回穿梭。
              </p>
            </div>

            {/* Manifesto card */}
            <div
              className={cn(
                "glass-panel flex flex-col justify-center gap-3 rounded-2xl px-5 py-4 sm:flex-1",
                "transition-all delay-500 duration-700",
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0",
              )}
            >
              <div>
                <p className="mb-2 text-xs tracking-[0.2em] uppercase opacity-30">
                  信奉
                </p>
                <p className="max-w-prose text-sm leading-relaxed opacity-55">
                  全栈不只是技术栈，是思维跨度。Web
                  和嵌入式并非两个世界——搭好桥梁，代码可以在任何地方运行。
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs tracking-[0.2em] uppercase opacity-30">
                  进行中
                </p>
                <ul className="space-y-1 text-sm leading-relaxed opacity-50">
                  <li className="list-inside list-disc">
                    Project Graph — 无限画布的节点图绘制工具
                  </li>
                  <li className="list-inside list-disc">
                    zz — 基于 ESP32-S3 的手表
                  </li>
                  <li className="list-inside list-disc">
                    zx — 基于 ESP32-S3 的手机
                  </li>
                </ul>
              </div>
              {/* Social */}
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/zty012"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 transition-all duration-300 hover:scale-110"
                  aria-label="GitHub"
                  style={{ color: "var(--color-accent)" }}
                >
                  <GitHubIcon className="h-3.5 w-3.5" />
                </a>
                <a
                  href="mailto:z@2y.nz"
                  className="p-1.5 transition-all duration-300 hover:scale-110"
                  aria-label="Email"
                  style={{ color: "var(--color-accent)" }}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </a>
                <p className="ml-auto text-xs opacity-30">
                  🛠 {tools.slice(0, 5).join(" · ")} ···
                </p>
              </div>
            </div>
          </div>

          {/* ── Right column: Latest card ── */}
          <div
            className={cn(
              "glass-panel flex flex-col rounded-2xl px-5 py-5 sm:flex-1",
              "transition-all delay-[0.65s] duration-700",
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            <p className="mb-5 text-xs tracking-[0.2em] uppercase opacity-30">
              📰 Latest
            </p>
            <div className="flex flex-col gap-5 overflow-y-auto">
              {latestPosts.map((post) => (
                <a
                  key={post.title}
                  href={post.href}
                  className="group flex flex-col gap-2"
                >
                  <span className="text-base font-bold transition-colors sm:text-3xl">
                    {post.title}
                  </span>
                  <span className="text-sm opacity-35">{post.date}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════
           ROW 4: SCROLL HINT (glass card)
           ════════════════ */}
        <div
          className={cn(
            "glass-panel flex items-center rounded-2xl px-5 py-3 sm:min-h-0 sm:flex-[0.4]",
            "transition-all delay-[0.8s] duration-700",
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="relative flex-1">
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-accent) 20%, transparent))",
              }}
            />
            <div
              className="animate-scroll-dot-left absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
          </div>

          <div className="flex flex-col items-center gap-1.5 px-8 sm:px-16">
            <svg
              className="animate-scroll-hint h-5 w-5 sm:h-6 sm:w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-accent)" }}
            >
              <rect x="5" y="2" width="14" height="20" rx="7" />
              <line x1="12" y1="6" x2="12" y2="10" />
            </svg>
            <div className="flex flex-col items-center">
              <svg
                className="animate-scroll-hint -mb-1 h-3 w-3 sm:h-3.5 sm:w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--color-accent)", animationDelay: "0.3s" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <svg
                className="animate-scroll-hint h-3 w-3 sm:h-3.5 sm:w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  color: "var(--color-accent)",
                  animationDelay: "0.15s",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="relative flex-1">
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-accent) 20%, transparent))",
              }}
            />
            <div
              className="animate-scroll-dot-right absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
          </div>
        </div>
      </div>

      {/* ── Folio ── */}
      <div
        className={cn(
          "newspaper-folio transition-all delay-700 duration-700",
          visible ? "opacity-30" : "opacity-0",
        )}
      >
        <span>page 01</span>
        <span>zty012</span>
      </div>
    </section>
  );
}
