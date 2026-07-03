"use client";

import {
  BackgroundMedia,
  type BackgroundMediaProps,
} from "@/components/home/background-media";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/projects";
import { ExternalLink } from "lucide-react";
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

export function ScreenProject({
  project,
  index,
  sectionBg,
}: {
  project: Project;
  index: number;
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

  const pageNum = (index + 2).toString().padStart(2, "0");

  return (
    <section
      ref={ref}
      className="snap-screen relative flex flex-col overflow-hidden px-6 sm:px-10 lg:px-16"
    >
      {/* ── 节专用背景（可选，覆盖全局背景） ── */}
      {sectionBg && <BackgroundMedia {...sectionBg} position="absolute" />}

      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          color: "var(--color-accent)",
        }}
      />
      <div className="bg-scanline pointer-events-none absolute inset-0 opacity-30" />
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
      <div
        className={cn(
          "bg-watermark-deco transition-all duration-1000",
          visible ? "opacity-[0.025]" : "opacity-0",
        )}
        style={{
          fontSize: "clamp(8rem, 20vw, 18rem)",
          bottom: "3%",
          right: "4%",
          letterSpacing: "-0.06em",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <div
        className={cn(
          "bg-stamp transition-all delay-500 duration-700",
          visible ? "opacity-100" : "opacity-0",
        )}
        style={{ bottom: "10%", left: "6%" }}
      >
        Project
      </div>

      {/* ── Central loading animation (z-index 低于背景，加载后被背景覆盖) ── */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-20 -translate-x-1/2 -translate-y-1/2">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--color-accent)",
            borderRightColor: "var(--color-accent)",
          }}
        />
      </div>

      {/* Masthead */}
      <div
        className={cn(
          "newspaper-masthead transition-all duration-500",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="newspaper-masthead-title">
          zty012 · project feature
        </span>
        <span className="newspaper-masthead-meta">
          {new Date().toISOString().slice(0, 10)}
        </span>
      </div>

      {/* Single frosted glass card at bottom-left */}
      <div
        className={cn(
          "content-over-glass glass-panel absolute bottom-16 left-16 flex w-full max-w-lg flex-col gap-4 rounded-2xl p-6 sm:p-12",
          "transition-all duration-700",
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        )}
      >
        {/* Tech stack badges */}
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="cursor-default rounded-md border px-2.5 py-1 text-xs font-medium"
              style={{
                borderColor: "var(--color-accent)",
                color: "var(--color-accent)",
                background: "var(--color-accent-glow)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl xl:text-5xl">
          {project.title}
        </h2>

        {/* Description */}
        <p className="text-sm leading-relaxed opacity-60 sm:text-base">
          {project.description}
        </p>

        {/* Links */}
        <div className="flex items-center gap-4 pt-1">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                borderColor: "var(--color-accent)",
                color: "var(--color-accent)",
              }}
            >
              <GitHubIcon className="h-3.5 w-3.5" />
              <span>源码</span>
            </a>
          )}
          <a
            href={project.githubUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-105"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-accent)",
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>在线演示</span>
          </a>
        </div>
      </div>

      {/* Folio */}
      <div
        className={cn(
          "newspaper-folio transition-all delay-700 duration-700",
          visible ? "opacity-30" : "opacity-0",
        )}
      >
        <span>page {pageNum}</span>
        <span className="truncate">{project.title}</span>
      </div>
    </section>
  );
}
