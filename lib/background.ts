import type { BackgroundMediaProps } from "@/components/home/background-media";

/**
 * 全局背景配置（首页全屏快照区域）
 *
 * 使用方式:
 * - type: "image" → 将图片放在 public/bg/ 下，src 填 "/bg/your-image.jpg"
 * - type: "video" → 将视频放在 public/bg/ 下，src 填 "/bg/your-video.mp4"，可选 poster
 * - 若不需要背景，将 enabled 设为 false
 */
export const backgroundConfig: {
  enabled: boolean;
  props: BackgroundMediaProps;
} = {
  enabled: true,
  props: {
    type: "image",
    src: "/bg/default.svg",
    overlayColor: "#000",
    overlayOpacity: 0.35,
    position: "fixed",
    objectFit: "cover",
  },
};

/**
 * 逐节背景覆写（可选）
 * 键为 section 索引：0 = ScreenIntro, 1+ = ScreenProject
 * 不在此列表中的 section 使用全局背景
 */
export const sectionBackgrounds: Record<number, BackgroundMediaProps> = {
  // 示例 — 为项目 section 1 设置视频背景：
  1: {
    type: "video",
    src: "https://assets.graphif.dev/videos/launch.webm",
    overlayOpacity: 0.3,
  },
};
