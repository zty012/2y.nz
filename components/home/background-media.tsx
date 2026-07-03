"use client";

import { cn } from "@/lib/cn";
import { useCallback, useEffect, useRef, useState } from "react";

export interface BackgroundMediaProps {
  /** 背景类型：图片或视频 */
  type?: "image" | "video";
  /** 媒体资源 URL（视频时输入视频地址，图片时输入图片地址） */
  src: string;
  /** 视频封面图（仅视频类型生效） */
  poster?: string;
  /** 叠加层颜色 */
  overlayColor?: string;
  /** 叠加层不透明度 (0-1)，默认 0.4 */
  overlayOpacity?: number;
  /** 定位方式：fixed 覆盖整个视口，absolute 跟随父容器 */
  position?: "fixed" | "absolute";
  /** 图片/视频填充方式 */
  objectFit?: "cover" | "contain" | "fill";
  /** 额外类名 */
  className?: string;
}

const FALLBACK_TIMEOUT_MS = 5000;

export function BackgroundMedia({
  type = "image",
  src,
  poster,
  overlayColor = "#000",
  overlayOpacity = 0.4,
  position = "fixed",
  objectFit = "cover",
  className,
}: BackgroundMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const onLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const onError = useCallback(() => {
    setErrored(true);
    setLoaded(true);
  }, []);

  // 超时兜底：5 秒后无论是否加载完成都显示
  useEffect(() => {
    fallbackTimer.current = setTimeout(() => {
      setLoaded(true);
    }, FALLBACK_TIMEOUT_MS);
    return () => clearTimeout(fallbackTimer.current);
  }, [src]);

  // 自动播放
  useEffect(() => {
    if (type !== "video" || !videoRef.current) return;
    videoRef.current.play().catch(() => {
      // 浏览器可能阻止自动播放，静默处理
    });
  }, [type, src]);

  const isFixed = position === "fixed";

  return (
    <div
      className={cn(
        "pointer-events-none overflow-hidden",
        isFixed ? "fixed inset-0 h-dvh w-dvw" : "absolute inset-0",
        "-z-10",
        "transition-opacity duration-1000 ease-in-out",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      aria-hidden
    >
      {type === "video" ? (
        <video
          ref={videoRef}
          className={cn(
            "h-full w-full",
            objectFit === "cover"
              ? "object-cover"
              : objectFit === "contain"
                ? "object-contain"
                : "object-fill",
            errored ? "hidden" : "",
          )}
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={onLoad}
          onLoadedData={onLoad}
          onError={onError}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={cn(
            "h-full w-full",
            objectFit === "cover"
              ? "object-cover"
              : objectFit === "contain"
                ? "object-contain"
                : "object-fill",
            errored ? "hidden" : "",
          )}
          src={src}
          alt=""
          onLoad={onLoad}
          onError={onError}
        />
      )}

      {/* 叠加层 — 保证前景文字可读 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
        }}
      />
    </div>
  );
}
